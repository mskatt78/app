import { motion } from "framer-motion";
import { Sparkles, Volume2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { GUIDED_NARRATION_MODES } from "../../utils/guidedNarrationSettings";
import { GUIDED_TONING_INTENSITIES } from "../../utils/guidedToningSettings";
import { GUIDED_SPEED_OPTIONS, GUIDED_VOICE_PROFILES } from "../../utils/guidedVoiceSettings";

const CARD_INITIAL = { opacity: 0, y: 20 };
const CARD_ANIMATE = { opacity: 1, y: 0 };
const CARD_TRANSITION = { delay: 0.12 };

export const SettingsGuidedAudioCard = ({
  guidedNarrationMode,
  guidedToningIntensity,
  guidedSpeedOption,
  guidedVoiceProfile,
  guidedPracticeOverrideMode,
  updateGuidedNarrationMode,
  updateGuidedToningMode,
  updateGuidedSpeedOption,
  updateGuidedVoiceProfile,
  updateGuidedPracticeOverrideMode,
}) => (
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
