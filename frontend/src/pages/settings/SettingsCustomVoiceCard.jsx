import { motion } from "framer-motion";
import { Mic, Trash2, UploadCloud, UserRound } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

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
  createVoiceProfile,
  removeVoiceProfile,
}) => (
  <motion.div
    initial={CARD_INITIAL}
    animate={CARD_ANIMATE}
    transition={CARD_TRANSITION}
    className="p-6 rounded-2xl bg-card/50 border border-white/5"
    data-testid="settings-custom-voice-card"
  >
    <h2 className="text-xl font-serif mb-2 flex items-center gap-2">
      <Mic className="w-5 h-5 text-primary" /> Optional Custom Voice
    </h2>
    <p className="text-sm text-muted-foreground mb-4" data-testid="settings-custom-voice-description">
      Upload a short voice sample and create a personal voice profile for future guided-session enhancements.
    </p>

    <div className="grid sm:grid-cols-3 gap-3" data-testid="settings-custom-voice-form-grid">
      <Input
        value={voiceProfileName}
        onChange={(event) => setVoiceProfileName(event.target.value)}
        placeholder="Profile name"
        data-testid="settings-custom-voice-name-input"
      />
      <Input
        type="file"
        accept="audio/*"
        onChange={(event) => setVoiceSampleFile(event.target.files?.[0] || null)}
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

    {voiceSampleFile && (
      <p className="text-xs text-muted-foreground mt-2" data-testid="settings-custom-voice-selected-file">
        Selected sample: {voiceSampleFile.name}
      </p>
    )}

    <div className="mt-5 space-y-2" data-testid="settings-custom-voice-list">
      {voiceProfiles.length === 0 ? (
        <p className="text-sm text-muted-foreground" data-testid="settings-custom-voice-empty-state">
          No custom voice profiles yet.
        </p>
      ) : (
        voiceProfiles.map((profile) => (
          <div
            key={profile.profile_id}
            className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3"
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
            <Button
              variant="ghost"
              onClick={() => removeVoiceProfile(profile.profile_id)}
              disabled={deletingVoiceProfileId === profile.profile_id}
              data-testid={`settings-custom-voice-delete-${profile.profile_id}`}
            >
              <Trash2 className="w-4 h-4 text-red-300" />
            </Button>
          </div>
        ))
      )}
    </div>
  </motion.div>
);
