import { motion } from "framer-motion";
import { Sparkles, Volume2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { GUIDED_NARRATION_MODES } from "../../utils/guidedNarrationSettings";
import { GUIDED_TONING_INTENSITIES } from "../../utils/guidedToningSettings";

const CARD_INITIAL = { opacity: 0, y: 20 };
const CARD_ANIMATE = { opacity: 1, y: 0 };
const CARD_TRANSITION = { delay: 0.12 };

export const SettingsGuidedAudioCard = ({
  guidedNarrationMode,
  guidedToningIntensity,
  updateGuidedNarrationMode,
  updateGuidedToningMode,
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
        Controls the resonance depth under guided voice practices across the app.
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
  </motion.div>
);
