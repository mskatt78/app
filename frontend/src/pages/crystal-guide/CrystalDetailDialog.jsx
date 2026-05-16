import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Clock,
  Droplets,
  Gem,
  Globe,
  Heart,
  Layers,
  Moon,
  Music,
  Play,
  Quote,
  Sparkles,
  Star,
  Volume2,
  Zap,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import HealthDisclaimer from "../../components/HealthDisclaimer";

function Section({ title, icon: Icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-white/5 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
      >
        <span className="text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4" />}
          {title}
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const stableCrystalKey = (prefix, value) => {
  const slug = String(value || "item")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
  return `${prefix}-${slug || "item"}`;
};

export const CrystalDetailDialog = ({
  selectedCrystal,
  onClose,
  onStartPractice,
  getImageConfig,
  handleImageError,
  elementColors,
}) => {
  if (!selectedCrystal) return null;

  const colors = elementColors[selectedCrystal.element] || elementColors.Spirit;
  const selectedImageConfig = getImageConfig(selectedCrystal);

  return (
    <Dialog open={!!selectedCrystal} onOpenChange={onClose}>
      <DialogContent className="bg-card border-white/10 max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogDescription className="sr-only" data-testid="crystal-dialog-description">
            Detailed crystal profile with healing properties, practices, and spiritual correspondences.
          </DialogDescription>
          {selectedImageConfig.src && (
            <div className="relative h-48 rounded-xl overflow-hidden mb-3 -mx-2">
              <img
                src={selectedImageConfig.src}
                alt={selectedCrystal.name}
                className="w-full h-full object-cover"
                onError={() => handleImageError(selectedCrystal.id, selectedImageConfig.sourceType)}
                data-testid="crystal-dialog-image"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          )}
          {!selectedImageConfig.src && (
            <div
              className="h-40 rounded-xl mb-3 -mx-2 border border-white/10 bg-gradient-to-br from-white/5 to-primary/10 flex items-center justify-center"
              data-testid="crystal-dialog-image-fallback"
            >
              <div className="text-center">
                <Gem className={`w-8 h-8 ${colors.text} mx-auto mb-2`} />
                <p className="text-xs text-muted-foreground">Crystal visual loading unavailable</p>
              </div>
            </div>
          )}
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-2 w-fit ${colors.bg} ${colors.text}`}>
            {selectedCrystal.element} Element
          </div>
          <DialogTitle className="text-3xl font-serif">{selectedCrystal.name}</DialogTitle>
          {selectedCrystal.title && (
            <p className={`text-sm ${colors.text} italic`}>{selectedCrystal.title}</p>
          )}
          {selectedCrystal.pronunciation && (
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <Volume2 className="w-4 h-4" />
              <span className="italic">/{selectedCrystal.pronunciation}/</span>
            </p>
          )}
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {selectedCrystal.affirmation && (
            <div className={`${colors.bg} border ${colors.border} rounded-xl p-4 text-center`}>
              <Quote className={`w-4 h-4 ${colors.text} mx-auto mb-2`} />
              <p className="text-base italic">"{selectedCrystal.affirmation}"</p>
            </div>
          )}

          <p className="text-muted-foreground leading-relaxed">{selectedCrystal.description}</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {selectedCrystal.chakra && (
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Heart className="w-3 h-3" /> Chakra</p>
                <p className="text-sm font-medium">{selectedCrystal.chakra}</p>
              </div>
            )}
            {selectedCrystal.planet && (
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Star className="w-3 h-3" /> Planet</p>
                <p className="text-sm font-medium">{selectedCrystal.planet}</p>
              </div>
            )}
            {selectedCrystal.vibration_number && (
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Zap className="w-3 h-3" /> Vibration</p>
                <p className="text-sm font-medium">#{selectedCrystal.vibration_number}</p>
              </div>
            )}
            {selectedCrystal.hardness && (
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Layers className="w-3 h-3" /> Hardness</p>
                <p className="text-sm font-medium">{selectedCrystal.hardness} Mohs</p>
              </div>
            )}
            {selectedCrystal.color && (
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Color</p>
                <p className="text-sm font-medium">{selectedCrystal.color}</p>
              </div>
            )}
            {selectedCrystal.rarity && (
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Globe className="w-3 h-3" /> Rarity</p>
                <p className="text-sm font-medium">{selectedCrystal.rarity}</p>
              </div>
            )}
          </div>

          {selectedCrystal.frequency_hz && (
            <div className={`${colors.bg} border ${colors.border} rounded-xl p-4`}>
              <h4 className={`text-sm uppercase tracking-wider ${colors.text} mb-3 flex items-center gap-2`}>
                <Music className="w-4 h-4" /> Vibrational Frequency
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">Frequency</span>
                  <p className="text-2xl font-light text-primary">{selectedCrystal.frequency_hz} Hz</p>
                </div>
                {selectedCrystal.vibrational_note && (
                  <div>
                    <span className="text-muted-foreground text-xs">Musical Note</span>
                    <p className="text-2xl font-light">{selectedCrystal.vibrational_note}</p>
                  </div>
                )}
              </div>
              {selectedCrystal.music_recommendation && (
                <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-white/5">
                  <span className={colors.text}>Music: </span>{selectedCrystal.music_recommendation}
                </p>
              )}
            </div>
          )}

          {selectedCrystal.why_this_heals && (
            <Section title="Why This Crystal Heals" icon={BookOpen} defaultOpen>
              {selectedCrystal.why_this_heals.split(/\n\n+/).map((para) => (
                <p key={stableCrystalKey(`why-heals-${selectedCrystal.id}`, para)} className="text-sm text-muted-foreground leading-relaxed">{para.trim()}</p>
              ))}
            </Section>
          )}

          {selectedCrystal.healing_properties && (
            <Section title="Healing Properties" icon={Heart}>
              {selectedCrystal.healing_properties.physical?.length > 0 && (
                <div>
                  <p className="text-xs text-orange-400 uppercase tracking-wider mb-2">Physical</p>
                  <ul className="space-y-1">
                    {selectedCrystal.healing_properties.physical.map((property) => (
                      <li key={stableCrystalKey(`physical-${selectedCrystal.id}`, property)} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-primary mt-1 shrink-0">·</span>{property}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedCrystal.healing_properties.emotional?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-pink-400 uppercase tracking-wider mb-2">Emotional</p>
                  <ul className="space-y-1">
                    {selectedCrystal.healing_properties.emotional.map((property) => (
                      <li key={stableCrystalKey(`emotional-${selectedCrystal.id}`, property)} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-primary mt-1 shrink-0">·</span>{property}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedCrystal.healing_properties.spiritual?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-purple-400 uppercase tracking-wider mb-2">Spiritual</p>
                  <ul className="space-y-1">
                    {selectedCrystal.healing_properties.spiritual.map((property) => (
                      <li key={stableCrystalKey(`spiritual-${selectedCrystal.id}`, property)} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-primary mt-1 shrink-0">·</span>{property}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Section>
          )}

          {selectedCrystal.extended_teachings && (
            <Section title="Historical & Ancient Wisdom" icon={Star}>
              {selectedCrystal.extended_teachings.split(/\n\n+/).map((para) => (
                <p key={stableCrystalKey(`extended-${selectedCrystal.id}`, para)} className="text-sm text-muted-foreground leading-relaxed">{para.trim()}</p>
              ))}
            </Section>
          )}

          {selectedCrystal.chakra_work && (
            <Section title="Chakra Work" icon={Zap}>
              <div className="space-y-2 text-sm text-muted-foreground">
                {selectedCrystal.chakra_work.primary && (
                  <p><span className="text-primary">Primary Chakra: </span>{selectedCrystal.chakra_work.primary}</p>
                )}
                {selectedCrystal.chakra_work.placement && (
                  <p><span className="text-primary">Placement: </span>{selectedCrystal.chakra_work.placement}</p>
                )}
                {selectedCrystal.chakra_work.technique && (
                  <p className="leading-relaxed">{selectedCrystal.chakra_work.technique}</p>
                )}
              </div>
            </Section>
          )}

          {selectedCrystal.cleansing_methods?.length > 0 && (
            <Section title="How to Cleanse & Charge" icon={Droplets}>
              <div className="space-y-3">
                {selectedCrystal.cleansing_methods.map((method) => (
                  <div key={stableCrystalKey(`cleanse-${selectedCrystal.id}`, `${method.method}-${method.duration || ""}`)} className="flex gap-3 p-3 bg-white/5 rounded-lg">
                    <div className={`p-2 rounded-lg ${colors.bg} shrink-0`}>
                      <Moon className={`w-4 h-4 ${colors.text}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{method.method}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{method.description}</p>
                      {method.duration && (
                        <p className="text-xs text-primary mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />{method.duration}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {selectedCrystal.rituals?.length > 0 && (
            <Section title="Sacred Rituals" icon={Sparkles}>
              <div className="space-y-4">
                {selectedCrystal.rituals.map((ritual) => (
                  <div key={stableCrystalKey(`ritual-${selectedCrystal.id}`, `${ritual.name}-${ritual.timing || ""}`)} className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-medium">{ritual.name}</p>
                      {ritual.timing && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} shrink-0`}>
                          {ritual.timing}
                        </span>
                      )}
                    </div>
                    {ritual.purpose && <p className="text-xs text-muted-foreground mb-2">{ritual.purpose}</p>}
                    {ritual.steps?.length > 0 && (
                      <ol className="space-y-1">
                        {ritual.steps.map((step, stepIndex) => (
                          <li key={stableCrystalKey(`ritual-step-${selectedCrystal.id}-${ritual.name}`, step)} className="text-xs text-muted-foreground flex gap-2">
                            <span className={`${colors.text} shrink-0`}>{stepIndex + 1}.</span>{step}
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {selectedCrystal.combinations?.length > 0 && (
            <Section title="Powerful Combinations" icon={Layers}>
              <div className="space-y-2">
                {selectedCrystal.combinations.map((combo) => (
                  <div key={stableCrystalKey(`combo-${selectedCrystal.id}`, `${combo.crystal}-${combo.purpose || ""}`)} className="flex items-start gap-2 text-sm">
                    <span className={`${colors.text} mt-1 shrink-0`}>+</span>
                    <div>
                      <span className="font-medium">{combo.crystal}</span>
                      {combo.purpose && <span className="text-muted-foreground"> — {combo.purpose}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {selectedCrystal.zodiac?.length > 0 && (
            <div>
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                <Star className="w-3 h-3" /> Zodiac Signs
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedCrystal.zodiac.map((z) => (
                  <span key={z} className={`px-3 py-1 rounded-full text-xs ${colors.bg} ${colors.text}`}>{z}</span>
                ))}
              </div>
            </div>
          )}

          {selectedCrystal.origin?.length > 0 && (
            <div>
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                <Globe className="w-3 h-3" /> Origins
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedCrystal.origin.map((o) => (
                  <span key={o} className="px-3 py-1 rounded-full bg-white/5 text-xs text-muted-foreground">{o}</span>
                ))}
              </div>
            </div>
          )}

          {selectedCrystal.warnings?.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
              <h4 className="text-sm uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Important Notes
              </h4>
              <ul className="space-y-1">
                {selectedCrystal.warnings.map((warning) => (
                  <li key={stableCrystalKey(`warning-${selectedCrystal.id}`, warning)} className="text-xs text-muted-foreground flex gap-2">
                    <span className="text-amber-400 shrink-0">·</span>{warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {selectedCrystal.practice_guide && (
            <Section title="Guided Practice Instructions" icon={BookOpen}>
              {selectedCrystal.practice_guide.split(/\n\n+/).map((para) => (
                <p key={stableCrystalKey(`practice-guide-${selectedCrystal.id}`, para)} className="text-sm text-muted-foreground leading-relaxed">{para.trim()}</p>
              ))}
            </Section>
          )}

          {selectedCrystal.meditation_guidance && (
            <Section title="Meditation Guidance" icon={Moon}>
              {selectedCrystal.meditation_guidance.technique && (
                <p className={`text-sm font-medium ${colors.text} mb-3`}>{selectedCrystal.meditation_guidance.technique}</p>
              )}
              {selectedCrystal.meditation_guidance.preparation && (
                <p className="text-xs text-muted-foreground mb-3 italic">{selectedCrystal.meditation_guidance.preparation}</p>
              )}
              {selectedCrystal.meditation_guidance.steps?.length > 0 && (
                <ol className="space-y-2">
                  {selectedCrystal.meditation_guidance.steps.map((step, stepIndex) => (
                    <li key={stableCrystalKey(`meditation-step-${selectedCrystal.id}`, step)} className="text-sm text-muted-foreground flex gap-3">
                      <span className={`${colors.text} shrink-0 font-medium`}>{stepIndex + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              )}
              {selectedCrystal.meditation_guidance.affirmation && (
                <div className="mt-3 p-3 bg-white/5 rounded-lg text-center">
                  <p className="text-sm italic">"{selectedCrystal.meditation_guidance.affirmation}"</p>
                </div>
              )}
              {selectedCrystal.meditation_guidance.duration_minutes && (
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {selectedCrystal.meditation_guidance.duration_minutes} minute practice
                </div>
              )}
            </Section>
          )}

          <Button
            onClick={() => onStartPractice(selectedCrystal)}
            className="w-full"
            size="lg"
            data-testid="begin-crystal-practice-btn"
          >
            <Play className="w-4 h-4 mr-2" />
            Begin Guided Crystal Practice
          </Button>

          <HealthDisclaimer type="crystal" />
        </div>
      </DialogContent>
    </Dialog>
  );
};