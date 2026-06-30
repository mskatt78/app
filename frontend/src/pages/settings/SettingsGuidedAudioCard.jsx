import { motion } from "framer-motion";
import { Sparkles, Volume2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import {
  GUIDED_NARRATION_MODALITY_CONFIG,
  GUIDED_NARRATION_MODES,
  getGuidedNarrationDurationPresetOptions,
} from "../../utils/guidedNarrationSettings";
import { GUIDED_TONING_INTENSITIES } from "../../utils/guidedToningSettings";
import { GUIDED_SPEED_OPTIONS, GUIDED_VOICE_PROFILES } from "../../utils/guidedVoiceSettings";
import axios from "axios";
import { useState } from "react";

const API = process.env.REACT_APP_BACKEND_URL;

const playGuidedPreview = async ({ voiceId, speedValue, sampleText, setLoadingKey, loadingKey }) => {
  const key = `${voiceId}-${speedValue}`;
  if (loadingKey === key) return;
  setLoadingKey(key);
  try {
    const { data } = await axios.post(`${API}/api/tts/generate-base64`, {
      text: sampleText,
      voice: voiceId,
      speed: speedValue,
    });
    const audio = new Audio(`data:audio/mp3;base64,${data.audio_base64}`);
    await audio.play();
  } catch (error) {
    // silent fail to avoid noisy UX in settings panel
  } finally {
    setLoadingKey("");
  }
};

const CARD_INITIAL = { opacity: 0, y: 20 };
const CARD_ANIMATE = { opacity: 1, y: 0 };
const CARD_TRANSITION = { delay: 0.12 };

export const SettingsGuidedAudioCard = ({
  guidedNarrationMode,
  guidedNarrationDurationByModality,
  guidedToningIntensity,
  guidedSpeedOption,
  guidedVoiceProfile,
  guidedPracticeOverrideMode,
  updateGuidedNarrationMode,
  updateGuidedNarrationDurationForModality,
  updateGuidedToningMode,
  updateGuidedSpeedOption,
  updateGuidedVoiceProfile,
  updateGuidedPracticeOverrideMode,
}) => {
  const [previewLoadingKey, setPreviewLoadingKey] = useState("");
  const durationOptions = getGuidedNarrationDurationPresetOptions();
  const modalityOptions = Object.values(GUIDED_NARRATION_MODALITY_CONFIG);

  return (
  <motion.div
    initial={CARD_INITIAL}
    animate={CARD_ANIMATE}
    transition={CARD_TRANSITION}
    className="p-6 rounded-2xl bg-card/50 border border-white/5"
    data-testid="settings-guided-narration-card"
  >
    <h2 className="text-xl font-serif mb-3 flex items-center gap-2">
      <Sparkles className="w-5 h-5 text-primary" />
      Guided Narration Style
    </h2>
    <p className="text-sm text-muted-foreground mb-4" data-testid="settings-guided-narration-description">
      Controls anti-repetition intensity across all guided meditations app-wide. Without manual selection, category defaults apply (Sunrise/Sunset = Balanced, Deep Healing = Strict).
    </p>

    <Select value={guidedNarrationMode} onValueChange={updateGuidedNarrationMode}>
      <SelectTrigger className="bg-card/50 border-white/10" data-testid="settings-guided-narration-select">
        <SelectValue placeholder="Select narration mode" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={GUIDED_NARRATION_MODES.strict.id} data-testid="settings-guided-mode-strict">
          {GUIDED_NARRATION_MODES.strict.label}
        </SelectItem>
        <SelectItem value={GUIDED_NARRATION_MODES.balanced.id} data-testid="settings-guided-mode-balanced">
          {GUIDED_NARRATION_MODES.balanced.label}
        </SelectItem>
      </SelectContent>
    </Select>

    <p className="text-xs text-muted-foreground mt-3" data-testid="settings-guided-narration-active-note">
      {GUIDED_NARRATION_MODES[guidedNarrationMode]?.description}
    </p>

    <div className="mt-6 pt-5 border-t border-white/10" data-testid="settings-guided-duration-profiles-card">
      <h3 className="text-base font-medium mb-2 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        Narration Length Profiles (7–20 min)
      </h3>
      <p className="text-sm text-muted-foreground mb-3" data-testid="settings-guided-duration-profiles-description">
        Set a narration target per guided modality. These profiles shape long-form script expansion while timers keep card/session timing.
      </p>
      <div className="space-y-3" data-testid="settings-guided-duration-profiles-grid">
        {modalityOptions.map((modality) => (
          <div key={modality.id} className="grid grid-cols-1 sm:grid-cols-[1fr_170px] gap-2 items-center">
            <div>
              <p className="text-sm text-foreground" data-testid={`settings-guided-duration-modality-label-${modality.id}`}>{modality.label}</p>
              <p className="text-xs text-muted-foreground" data-testid={`settings-guided-duration-modality-description-${modality.id}`}>{modality.description}</p>
            </div>
            <Select
              value={String(guidedNarrationDurationByModality?.[modality.id] ?? 15)}
              onValueChange={(value) => updateGuidedNarrationDurationForModality(modality.id, Number(value))}
            >
              <SelectTrigger className="bg-card/50 border-white/10" data-testid={`settings-guided-duration-select-${modality.id}`}>
                <SelectValue placeholder="Select minutes" />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map((option) => (
                  <SelectItem
                    key={`${modality.id}-${option.value}`}
                    value={option.value}
                    data-testid={`settings-guided-duration-option-${modality.id}-${option.value}`}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>

    <div className="mt-6 pt-5 border-t border-white/10" data-testid="settings-guided-toning-card">
      <h3 className="text-base font-medium mb-2 flex items-center gap-2">
        <Volume2 className="w-4 h-4 text-primary" />
        Guided Toning Intensity
      </h3>
      <p className="text-sm text-muted-foreground mb-3" data-testid="settings-guided-toning-description">
        Controls the resonance depth under guided voice practices across the app. Choose Subtle or Off for a calmer, sweeter voice feel.
      </p>

      <Select value={guidedToningIntensity} onValueChange={updateGuidedToningMode}>
        <SelectTrigger className="bg-card/50 border-white/10" data-testid="settings-guided-toning-select">
          <SelectValue placeholder="Select toning intensity" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(GUIDED_TONING_INTENSITIES).map((option) => (
            <SelectItem key={option.id} value={option.id} data-testid={`settings-guided-toning-option-${option.id}`}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <p className="text-xs text-muted-foreground mt-3" data-testid="settings-guided-toning-active-note">
        {GUIDED_TONING_INTENSITIES[guidedToningIntensity]?.description}
      </p>
    </div>

    <div className="mt-6 pt-5 border-t border-white/10" data-testid="settings-guided-speed-card">
      <h3 className="text-base font-medium mb-2 flex items-center gap-2">
        <Volume2 className="w-4 h-4 text-primary" />
        Guided Voice Speed
      </h3>
      <p className="text-sm text-muted-foreground mb-3" data-testid="settings-guided-speed-description">
        Choose how fast guided narration speaks across the app.
      </p>
      <Select value={guidedSpeedOption} onValueChange={updateGuidedSpeedOption}>
        <SelectTrigger className="bg-card/50 border-white/10" data-testid="settings-guided-speed-select">
          <SelectValue placeholder="Select speed" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(GUIDED_SPEED_OPTIONS).map((option) => (
            <SelectItem key={option.id} value={option.id} data-testid={`settings-guided-speed-option-${option.id}`}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground mt-3" data-testid="settings-guided-speed-active-note">
        {GUIDED_SPEED_OPTIONS[guidedSpeedOption]?.description}
      </p>

      <div className="mt-3 flex flex-wrap gap-2" data-testid="settings-guided-speed-preview-buttons">
        {Object.values(GUIDED_SPEED_OPTIONS).map((option) => (
          <button
            key={`guided-speed-preview-${option.id}`}
            type="button"
            className="text-[11px] px-2 py-1 rounded border border-white/20 bg-white/5 hover:bg-white/10"
            onClick={() => playGuidedPreview({
              voiceId: GUIDED_VOICE_PROFILES[guidedVoiceProfile].voice,
              speedValue: option.speed,
              sampleText: `This is a ${option.label.toLowerCase()} speed preview for your guided practice.`,
              setLoadingKey: setPreviewLoadingKey,
              loadingKey: previewLoadingKey,
            })}
            data-testid={`settings-guided-speed-preview-${option.id}`}
          >
            {previewLoadingKey === `${GUIDED_VOICE_PROFILES[guidedVoiceProfile].voice}-${option.speed}` ? "Loading..." : `Preview ${option.label}`}
          </button>
        ))}
      </div>
    </div>

    <div className="mt-6 pt-5 border-t border-white/10" data-testid="settings-guided-voice-profile-card">
      <h3 className="text-base font-medium mb-2 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        Guided Voice Type
      </h3>
      <p className="text-sm text-muted-foreground mb-3" data-testid="settings-guided-voice-profile-description">
        Choose feminine, masculine, or balanced guided voice style.
      </p>
      <Select value={guidedVoiceProfile} onValueChange={updateGuidedVoiceProfile}>
        <SelectTrigger className="bg-card/50 border-white/10" data-testid="settings-guided-voice-profile-select">
          <SelectValue placeholder="Select voice type" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(GUIDED_VOICE_PROFILES).map((option) => (
            <SelectItem key={option.id} value={option.id} data-testid={`settings-guided-voice-profile-option-${option.id}`}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground mt-3" data-testid="settings-guided-voice-profile-active-note">
        {GUIDED_VOICE_PROFILES[guidedVoiceProfile]?.description}
      </p>

      <div className="mt-3 flex flex-wrap gap-2" data-testid="settings-guided-voice-preview-buttons">
        {Object.values(GUIDED_VOICE_PROFILES).map((profile) => (
          <button
            key={`guided-voice-preview-${profile.id}`}
            type="button"
            className="text-[11px] px-2 py-1 rounded border border-white/20 bg-white/5 hover:bg-white/10"
            onClick={() => playGuidedPreview({
              voiceId: profile.voice,
              speedValue: GUIDED_SPEED_OPTIONS[guidedSpeedOption].speed,
              sampleText: `This is the ${profile.label.toLowerCase()} guided voice preview.`,
              setLoadingKey: setPreviewLoadingKey,
              loadingKey: previewLoadingKey,
            })}
            data-testid={`settings-guided-voice-preview-${profile.id}`}
          >
            {previewLoadingKey === `${profile.voice}-${GUIDED_SPEED_OPTIONS[guidedSpeedOption].speed}` ? "Loading..." : `Preview ${profile.label}`}
          </button>
        ))}
      </div>
    </div>

    <div className="mt-6 pt-5 border-t border-white/10" data-testid="settings-guided-practice-override-mode-card">
      <h3 className="text-base font-medium mb-2 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        Per-Practice Override Mode
      </h3>
      <p className="text-sm text-muted-foreground mb-3" data-testid="settings-guided-practice-override-mode-description">
        Controls whether voice/speed overrides set inside guided overlays apply just this session or are remembered per practice.
      </p>
      <Select value={guidedPracticeOverrideMode} onValueChange={updateGuidedPracticeOverrideMode}>
        <SelectTrigger className="bg-card/50 border-white/10" data-testid="settings-guided-practice-override-mode-select">
          <SelectValue placeholder="Select override mode" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="session" data-testid="settings-guided-practice-override-mode-session">Session only</SelectItem>
          <SelectItem value="remember" data-testid="settings-guided-practice-override-mode-remember">Remember per practice</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground mt-3" data-testid="settings-guided-practice-override-mode-active-note">
        {guidedPracticeOverrideMode === "remember" ? "New per-practice choices are saved for future sessions." : "New per-practice choices reset when session ends."}
      </p>
    </div>
  </motion.div>
);
};
