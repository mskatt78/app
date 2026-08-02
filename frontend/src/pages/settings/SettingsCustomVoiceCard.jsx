import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Mic, Play, Radio, Square, Trash2, UploadCloud, UserRound } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";

const RECORDING_MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mpeg",
  "audio/mp3",
  "audio/ogg;codecs=opus",
  "audio/ogg",
  "audio/wav",
  "audio/mp4",
];

const extensionFromMime = (mime) => {
  const normalized = String(mime || "").toLowerCase();
  if (normalized.includes("mpeg") || normalized.includes("mp3")) return "mp3";
  if (normalized.includes("ogg")) return "ogg";
  if (normalized.includes("wav")) return "wav";
  if (normalized.includes("mp4") || normalized.includes("m4a")) return "m4a";
  return "webm";
};

const CARD_INITIAL = { opacity: 0, y: 20 };
const CARD_ANIMATE = { opacity: 1, y: 0 };
const CARD_TRANSITION = { delay: 0.16 };

export const SettingsCustomVoiceCard = ({
  creatingVoiceProfile,
  deletingVoiceProfileId,
  voiceProfileName,
  setVoiceProfileName,
  voiceSampleFile,
  setVoiceSampleFile,
  voiceProfiles,
  guidedCustomVoiceEnabled,
  guidedCustomVoiceProfileId,
  updateGuidedCustomVoiceEnabled,
  updateGuidedCustomVoiceProfileId,
  createVoiceProfile,
  removeVoiceProfile,
}) => {
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const [recording, setRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState("");
  const [recordingError, setRecordingError] = useState("");

  const selectedProfile = useMemo(
    () => voiceProfiles.find((profile) => profile.profile_id === guidedCustomVoiceProfileId) || null,
    [guidedCustomVoiceProfileId, voiceProfiles],
  );

  useEffect(() => {
    return () => {
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [recordedAudioUrl]);

  const handleStartRecording = async () => {
    if (recording) return;
    if (!navigator?.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setRecordingError("Voice recording is not supported in this browser.");
      return;
    }

    setRecordingError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const selectedMime = RECORDING_MIME_CANDIDATES.find((mime) => {
        try {
          return window.MediaRecorder.isTypeSupported(mime);
        } catch {
          return false;
        }
      }) || "audio/webm";

      const recorder = new window.MediaRecorder(stream, { mimeType: selectedMime });
      chunksRef.current = [];
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data?.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || selectedMime;
        const blob = new Blob(chunksRef.current, { type: mimeType });
        if (blob.size === 0) {
          setRecordingError("Recording was empty. Please try again.");
          setRecording(false);
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
          }
          return;
        }
        const extension = extensionFromMime(mimeType);
        const file = new File([blob], `custom-voice-${Date.now()}.${extension}`, { type: mimeType });
        setVoiceSampleFile(file);

        if (recordedAudioUrl) {
          URL.revokeObjectURL(recordedAudioUrl);
        }
        setRecordedAudioUrl(URL.createObjectURL(blob));
        setRecording(false);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      recorder.start();
      setRecording(true);
    } catch {
      setRecordingError("Microphone access was blocked. Please allow mic access and try again.");
      setRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
  };

  return (
    <motion.div
      initial={CARD_INITIAL}
      animate={CARD_ANIMATE}
      transition={CARD_TRANSITION}
      className="p-6 rounded-2xl bg-card/50 border border-white/5 space-y-5"
      data-testid="settings-custom-voice-card"
    >
      <div>
        <h2 className="text-xl font-serif mb-2 flex items-center gap-2">
          <Mic className="w-5 h-5 text-primary" /> Optional Custom Voice
        </h2>
        <p className="text-sm text-muted-foreground" data-testid="settings-custom-voice-description">
          Record or upload `.webm` / `.mp3` voice samples, save profiles, and optionally use them app-wide.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3" data-testid="settings-custom-voice-form-grid">
        <Input
          value={voiceProfileName}
          onChange={(event) => setVoiceProfileName(event.target.value)}
          placeholder="Profile name"
          data-testid="settings-custom-voice-name-input"
        />
        <Input
          type="file"
          accept="audio/webm,audio/mpeg,audio/mp3,.webm,.mp3"
          onChange={(event) => {
            setRecordingError("");
            setVoiceSampleFile(event.target.files?.[0] || null);
          }}
          data-testid="settings-custom-voice-file-input"
        />
        <Button
          onClick={createVoiceProfile}
          disabled={creatingVoiceProfile}
          className="bg-primary"
          data-testid="settings-custom-voice-create-button"
        >
          <UploadCloud className="w-4 h-4 mr-2" />
          {creatingVoiceProfile ? "Saving..." : "Save Profile"}
        </Button>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4" data-testid="settings-custom-voice-recorder-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium flex items-center gap-2" data-testid="settings-custom-voice-recorder-title">
              <Radio className="w-4 h-4 text-primary" /> Record Sample
            </p>
            <p className="text-xs text-muted-foreground mt-1" data-testid="settings-custom-voice-recorder-note">
              Record directly in-app, then save it as your profile sample.
            </p>
          </div>
          {!recording ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleStartRecording}
              data-testid="settings-custom-voice-start-recording-button"
            >
              <Play className="w-4 h-4 mr-2" /> Start Recording
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={handleStopRecording}
              data-testid="settings-custom-voice-stop-recording-button"
            >
              <Square className="w-4 h-4 mr-2" /> Stop Recording
            </Button>
          )}
        </div>

        {recording && (
          <p className="text-xs text-rose-200 mt-2" data-testid="settings-custom-voice-recording-live-status">
            Recording in progress...
          </p>
        )}
        {recordingError && (
          <p className="text-xs text-rose-300 mt-2" data-testid="settings-custom-voice-recording-error">
            {recordingError}
          </p>
        )}
      </div>

      {voiceSampleFile && (
        <p className="text-xs text-muted-foreground" data-testid="settings-custom-voice-selected-file">
          Selected sample: {voiceSampleFile.name}
        </p>
      )}

      {recordedAudioUrl && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3" data-testid="settings-custom-voice-recording-preview-card">
          <p className="text-xs uppercase tracking-wider text-emerald-200 mb-2">Recorded Preview</p>
          <audio controls src={recordedAudioUrl} className="w-full" data-testid="settings-custom-voice-recording-preview-audio" />
        </div>
      )}

      <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4 space-y-3" data-testid="settings-custom-voice-activation-panel">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-cyan-100" data-testid="settings-custom-voice-toggle-label">Use custom voice for guided playback</p>
            <p className="text-xs text-cyan-50/80" data-testid="settings-custom-voice-toggle-description">
              When enabled, guided flows use your selected custom sample instead of AI voice.
            </p>
          </div>
          <Switch
            checked={guidedCustomVoiceEnabled}
            onCheckedChange={updateGuidedCustomVoiceEnabled}
            disabled={!guidedCustomVoiceProfileId}
            data-testid="settings-custom-voice-enabled-switch"
          />
        </div>

        <div>
          <p className="text-xs text-cyan-100 mb-2" data-testid="settings-custom-voice-active-profile-label">Active Custom Voice Profile</p>
          <Select value={guidedCustomVoiceProfileId || "none"} onValueChange={(value) => updateGuidedCustomVoiceProfileId(value === "none" ? "" : value)}>
            <SelectTrigger className="bg-card/60 border-cyan-400/20" data-testid="settings-custom-voice-active-profile-select">
              <SelectValue placeholder="Choose profile" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" data-testid="settings-custom-voice-active-profile-option-none">None</SelectItem>
              {voiceProfiles.map((profile) => (
                <SelectItem
                  key={profile.profile_id}
                  value={profile.profile_id}
                  data-testid={`settings-custom-voice-active-profile-option-${profile.profile_id}`}
                >
                  {profile.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedProfile && (
            <p className="text-xs text-cyan-50/85 mt-2" data-testid="settings-custom-voice-active-profile-summary">
              Active profile: {selectedProfile.name} ({selectedProfile.status})
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2" data-testid="settings-custom-voice-list">
        {voiceProfiles.length === 0 ? (
          <p className="text-sm text-muted-foreground" data-testid="settings-custom-voice-empty-state">
            No custom voice profiles yet.
          </p>
        ) : (
          voiceProfiles.map((profile) => {
            const isActive = profile.profile_id === guidedCustomVoiceProfileId;
            return (
              <div
                key={profile.profile_id}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 p-3"
                data-testid={`settings-custom-voice-profile-${profile.profile_id}`}
              >
                <div>
                  <p className="text-sm font-medium flex items-center gap-1">
                    <UserRound className="w-3.5 h-3.5 text-primary" /> {profile.name}
                  </p>
                  <p className="text-xs text-muted-foreground" data-testid={`settings-custom-voice-profile-status-${profile.profile_id}`}>
                    Status: {profile.status}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    onClick={() => updateGuidedCustomVoiceProfileId(profile.profile_id)}
                    data-testid={`settings-custom-voice-use-${profile.profile_id}`}
                    className={isActive ? "text-emerald-200" : "text-cyan-100"}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    {isActive ? "Active" : "Use"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => removeVoiceProfile(profile.profile_id)}
                    disabled={deletingVoiceProfileId === profile.profile_id}
                    data-testid={`settings-custom-voice-delete-${profile.profile_id}`}
                  >
                    <Trash2 className="w-4 h-4 text-red-300" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};
