import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Mic, Moon, Pause, Play, Square, Sparkles, Trash2, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { appLogger } from "../../utils/logger";
import { MOODS } from "./constants";

const resolveMoodButtonClassName = (isActive) => {
  if (isActive) {
    return "bg-emerald-500/20 scale-110";
  }

  return "bg-white/5 hover:bg-white/10";
};

const formatVoiceDuration = (seconds) => {
  const total = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(total / 60);
  const remainder = Math.floor(total % 60);
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
};

const resolveSupportedMimeType = () => {
  if (typeof window === "undefined" || typeof window.MediaRecorder === "undefined") {
    return "";
  }

  const candidates = [
    "audio/webm;codecs=opus",
    "audio/mp4",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/ogg",
  ];

  return candidates.find((type) => window.MediaRecorder.isTypeSupported(type)) || "";
};

const fileReaderToDataUrl = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : "");
  reader.onerror = reject;
  reader.readAsDataURL(blob);
});

const VoiceNoteRecorder = ({ formData, setFormData, api, user }) => {
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const recordingStartedAtRef = useRef(0);
  const tickRef = useRef(null);
  const audioPreviewRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(() => Number(formData.voice_note_duration_seconds || 0));
  const [recordingError, setRecordingError] = useState("");

  useEffect(() => {
    setElapsedSeconds(Number(formData.voice_note_duration_seconds || 0));
  }, [formData.voice_note_duration_seconds]);

  const clearTick = useCallback(() => {
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const stopStreamTracks = useCallback(() => {
    streamRef.current?.getTracks?.().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    clearTick();
    setIsRecording(false);
  }, [clearTick]);

  useEffect(() => () => {
    clearTick();
    try {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    } catch (error) {
      appLogger.warn("Voice recorder cleanup stop failed", error);
    }
    stopStreamTracks();
  }, [clearTick, stopStreamTracks]);

  const clearVoiceNote = useCallback(() => {
    if (formData.voice_note_data_url?.startsWith?.("blob:")) {
      try {
        URL.revokeObjectURL(formData.voice_note_data_url);
      } catch (error) {
        appLogger.warn("Voice note blob URL cleanup warning", error);
      }
    }

    if (api && user?.user_id && formData.voice_note_file_id) {
      api.delete(`/voice-files/${formData.voice_note_file_id}`).catch((error) => {
        appLogger.warn("Voice note delete warning", error);
      });
    }

    setFormData((current) => ({
      ...current,
      voice_note_file_id: "",
      voice_note_data_url: "",
      voice_note_url: "",
      voice_note_duration_seconds: 0,
      voice_note_mime_type: "",
    }));
    setElapsedSeconds(0);
  }, [api, formData.voice_note_file_id, setFormData, user?.user_id]);

  const startRecording = useCallback(async () => {
    setRecordingError("");
    if (!navigator?.mediaDevices?.getUserMedia) {
      setRecordingError("Voice recording is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = resolveSupportedMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      streamRef.current = stream;
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recordingStartedAtRef.current = Date.now();
      setElapsedSeconds(0);
      setIsRecording(true);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        clearTick();
        stopStreamTracks();
        setIsRecording(false);

        const blob = new Blob(chunksRef.current, { type: mimeType || recorder.mimeType || "audio/webm" });
        chunksRef.current = [];
        if (blob.size === 0) {
          setRecordingError("No audio captured. Please try recording again.");
          return;
        }

        const duration = Math.max(1, Math.round((Date.now() - recordingStartedAtRef.current) / 1000));
        try {
          if (api && user?.user_id) {
            if (formData.voice_note_file_id) {
              await api.delete(`/voice-files/${formData.voice_note_file_id}`).catch((error) => {
                appLogger.warn("Previous voice note cleanup warning", error);
              });
            }

            const uploadFormData = new FormData();
            const extension = (blob.type || "audio/webm").includes("mp4") ? "m4a" : "webm";
            uploadFormData.append("file", blob, `voice-note-${Date.now()}.${extension}`);
            uploadFormData.append("duration_seconds", String(duration));
            uploadFormData.append("category", "journal_voice_note");

            const uploadResponse = await api.post("/voice-files", uploadFormData, {
              headers: { "Content-Type": "multipart/form-data" },
            });

            const uploaded = uploadResponse?.data;
            if (!uploaded?.file_id) {
              setRecordingError("Voice note upload failed. Please try again.");
              return;
            }

            const blobUrl = URL.createObjectURL(blob);
            setFormData((current) => ({
              ...current,
              voice_note_file_id: uploaded.file_id,
              voice_note_data_url: blobUrl,
              voice_note_url: uploaded.download_url || "",
              voice_note_duration_seconds: Number(uploaded.duration_seconds || duration),
              voice_note_mime_type: uploaded.content_type || blob.type || mimeType || "audio/webm",
            }));
            setElapsedSeconds(Number(uploaded.duration_seconds || duration));
            return;
          }

          const dataUrl = await fileReaderToDataUrl(blob);
          if (!dataUrl) {
            setRecordingError("Voice note could not be saved. Please try again.");
            return;
          }

          setFormData((current) => ({
            ...current,
            voice_note_file_id: "",
            voice_note_data_url: dataUrl,
            voice_note_url: "",
            voice_note_duration_seconds: duration,
            voice_note_mime_type: blob.type || mimeType || "audio/webm",
          }));
          setElapsedSeconds(duration);
        } catch (error) {
          appLogger.error("Voice note encoding failed", error);
          setRecordingError("Voice note could not be saved. Please try again.");
        }
      };

      recorder.onerror = () => {
        clearTick();
        stopStreamTracks();
        setIsRecording(false);
        setRecordingError("Microphone error. Please allow permission and try again.");
      };

      recorder.start();
      tickRef.current = window.setInterval(() => {
        setElapsedSeconds(Math.max(0, Math.round((Date.now() - recordingStartedAtRef.current) / 1000)));
      }, 200);
    } catch (error) {
      appLogger.warn("Voice recorder start failed", error);
      setRecordingError("Microphone permission is required to record voice notes.");
      stopStreamTracks();
      clearTick();
      setIsRecording(false);
    }
  }, [api, clearTick, formData.voice_note_file_id, setFormData, stopStreamTracks, user?.user_id]);

  const hasVoiceNote = useMemo(
    () => Boolean(formData.voice_note_data_url || formData.voice_note_url),
    [formData.voice_note_data_url, formData.voice_note_url]
  );

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4" data-testid="practice-journal-voice-note-card">
      <div className="flex items-center justify-between gap-3 mb-3">
        <label className="text-sm font-medium flex items-center gap-2" data-testid="practice-journal-voice-note-label">
          <Mic className="w-4 h-4 text-emerald-300" /> Voice Note
        </label>
        <span className="text-xs text-muted-foreground" data-testid="practice-journal-voice-note-duration">
          {formatVoiceDuration(isRecording ? elapsedSeconds : (formData.voice_note_duration_seconds || 0))}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {!isRecording ? (
          <Button
            type="button"
            variant="outline"
            onClick={startRecording}
            className="border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/10"
            data-testid="practice-journal-voice-record-button"
          >
            <Play className="w-3.5 h-3.5 mr-1" /> Record
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={stopRecording}
            className="border-red-500/40 text-red-200 hover:bg-red-500/10"
            data-testid="practice-journal-voice-stop-button"
          >
            <Square className="w-3.5 h-3.5 mr-1" /> Stop
          </Button>
        )}

        {hasVoiceNote && (
          <Button
            type="button"
            variant="ghost"
            onClick={clearVoiceNote}
            className="text-red-300 hover:text-red-200 hover:bg-red-500/10"
            data-testid="practice-journal-voice-delete-button"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
          </Button>
        )}

        {isRecording && (
          <span className="text-xs text-emerald-300 flex items-center gap-1" data-testid="practice-journal-voice-recording-status">
            <Pause className="w-3 h-3" /> Recording live…
          </span>
        )}
      </div>

      {recordingError && (
        <p className="text-xs text-red-300 mt-2" data-testid="practice-journal-voice-error">
          {recordingError}
        </p>
      )}

      {hasVoiceNote && (
        <div className="mt-3" data-testid="practice-journal-voice-preview-wrap">
          <audio
            ref={audioPreviewRef}
            controls
            src={formData.voice_note_data_url || formData.voice_note_url}
            className="w-full"
            data-testid="practice-journal-voice-preview-player"
          />
        </div>
      )}
    </div>
  );
};

export const PracticeJournalFormModal = ({
  showForm,
  resetForm,
  editingEntry,
  currentPrompt,
  onGeneratePrompt,
  formData,
  setFormData,
  handleSubmit,
  moonPhase,
  api,
  user,
}) => (
  <AnimatePresence>
    {showForm && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={resetForm}
        data-testid="practice-journal-form-modal-overlay"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(event) => event.stopPropagation()}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-white/10"
          data-testid="journal-form-modal"
        >
          <div className="sticky top-0 bg-card border-b border-white/10 p-4 flex items-center justify-between">
            <h2 className="text-xl font-serif" data-testid="practice-journal-form-modal-title">
              {editingEntry ? "Edit Journal Entry" : "New Journal Entry"}
            </h2>
            <button onClick={resetForm} className="p-2 hover:bg-white/10 rounded-lg" data-testid="practice-journal-form-modal-close-button">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4" data-testid="practice-journal-form-prompt-card">
              <p className="text-sm text-emerald-300 italic">&quot;{currentPrompt}&quot;</p>
              <button
                onClick={onGeneratePrompt}
                className="text-xs text-emerald-400 mt-2 hover:underline"
                data-testid="practice-journal-form-generate-prompt-button"
              >
                New prompt
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Practice Name *</label>
                <input
                  type="text"
                  value={formData.practice_name}
                  onChange={(event) => setFormData({ ...formData, practice_name: event.target.value })}
                  placeholder="e.g., Heart Chakra Cleansing"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500/50"
                  data-testid="practice-name-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Practice Type</label>
                <select
                  value={formData.practice_type}
                  onChange={(event) => setFormData({ ...formData, practice_type: event.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500/50"
                  data-testid="practice-type-select"
                >
                  <option value="chakra">Chakra</option>
                  <option value="feminine">Feminine Embodiment</option>
                  <option value="masculine">Masculine Embodiment</option>
                  <option value="energy">Energy Healing</option>
                  <option value="somatic">Somatic Yoga</option>
                  <option value="movement">Free Form Movement</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
              <input
                type="number"
                value={formData.duration_minutes}
                onChange={(event) => setFormData({ ...formData, duration_minutes: parseInt(event.target.value, 10) || 0 })}
                min="1"
                max="180"
                className="w-24 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500/50"
                data-testid="duration-input"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-3">Mood Before</label>
                <div className="flex gap-2">
                  {MOODS.map((mood) => {
                    const isActive = formData.mood_before === mood.value;
                    return (
                      <button
                        key={mood.value}
                        onClick={() => setFormData({ ...formData, mood_before: mood.value })}
                        className={`p-3 rounded-lg text-2xl transition-all ${resolveMoodButtonClassName(isActive)}`}
                        title={mood.label}
                        data-testid={`mood-before-${mood.value}`}
                      >
                        {mood.emoji}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Mood After</label>
                <div className="flex gap-2">
                  {MOODS.map((mood) => {
                    const isActive = formData.mood_after === mood.value;
                    return (
                      <button
                        key={mood.value}
                        onClick={() => setFormData({ ...formData, mood_after: mood.value })}
                        className={`p-3 rounded-lg text-2xl transition-all ${resolveMoodButtonClassName(isActive)}`}
                        title={mood.label}
                        data-testid={`mood-after-${mood.value}`}
                      >
                        {mood.emoji}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Body Sensations</label>
              <textarea
                value={formData.body_sensations}
                onChange={(event) => setFormData({ ...formData, body_sensations: event.target.value })}
                placeholder="What did you feel in your body? Any areas of tension, warmth, tingling, release..."
                rows={2}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500/50 resize-none"
                data-testid="body-sensations-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-violet-400" /> Spiritual Downloads
              </label>
              <textarea
                value={formData.spiritual_downloads}
                onChange={(event) => setFormData({ ...formData, spiritual_downloads: event.target.value })}
                placeholder="Any visions, messages, symbols, or downloads you received..."
                rows={2}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500/50 resize-none"
                data-testid="spiritual-downloads-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Intentions</label>
              <textarea
                value={formData.intentions}
                onChange={(event) => setFormData({ ...formData, intentions: event.target.value })}
                placeholder="What intentions did you set? What are you calling in?"
                rows={2}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500/50 resize-none"
                data-testid="intentions-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Key Insights</label>
              <textarea
                value={formData.key_insights}
                onChange={(event) => setFormData({ ...formData, key_insights: event.target.value })}
                placeholder="What insights or realizations came through?"
                rows={2}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500/50 resize-none"
                data-testid="key-insights-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                <Heart className="w-4 h-4 text-rose-400" /> Reflection
              </label>
              <textarea
                value={formData.reflection}
                onChange={(event) => setFormData({ ...formData, reflection: event.target.value })}
                placeholder="Your overall reflection on this practice..."
                rows={4}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500/50 resize-none"
                data-testid="reflection-input"
              />
            </div>

            <VoiceNoteRecorder formData={formData} setFormData={setFormData} api={api} user={user} />

            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white/5 rounded-lg p-3" data-testid="practice-journal-form-moon-phase-info">
              <Moon className="w-4 h-4" />
              <span>This entry will be tagged with: {moonPhase.emoji} {moonPhase.phase}</span>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={resetForm} data-testid="practice-journal-form-cancel-button">Cancel</Button>
              <Button
                onClick={handleSubmit}
                className="bg-emerald-600 hover:bg-emerald-700"
                data-testid="save-entry-btn"
              >
                {editingEntry ? "Update Entry" : "Save Entry"}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
