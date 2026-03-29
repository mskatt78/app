import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Sparkles, Filter, Heart, Volume2, Music, Quote,
  Droplets, Moon, Star, Zap, BookOpen, Clock, AlertTriangle,
  ChevronDown, ChevronUp, Gem, Layers, Sun, Globe, Play
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import HealthDisclaimer from "../components/HealthDisclaimer";
import GuidedPracticeOverlay from "../components/GuidedPracticeOverlay";

const elementColors = {
  Earth: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "shadow-emerald-500/20" },
  Water: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", glow: "shadow-blue-500/20" },
  Fire: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", glow: "shadow-orange-500/20" },
  Air: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", glow: "shadow-cyan-500/20" },
  Spirit: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", glow: "shadow-purple-500/20" },
};

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

const CrystalGuide = ({ user, api }) => {
  const navigate = useNavigate();
  const [crystals, setCrystals] = useState([]);
  const [filteredCrystals, setFilteredCrystals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElement, setSelectedElement] = useState("all");
  const [selectedCrystal, setSelectedCrystal] = useState(null);
  const [guidedPractice, setGuidedPractice] = useState(null);

  const elements = ["all", "Earth", "Water", "Fire", "Air", "Spirit"];

  useEffect(() => { fetchCrystals(); }, []);

  useEffect(() => {
    if (selectedElement === "all") setFilteredCrystals(crystals);
    else setFilteredCrystals(crystals.filter(c => c.element === selectedElement));
  }, [selectedElement, crystals]);

  const fetchCrystals = async () => {
    try {
      const response = await api.get("/crystals/deep");
      setCrystals(response.data);
      setFilteredCrystals(response.data);
    } catch (error) {
      console.error("Failed to fetch crystals:", error);
    } finally {
      setLoading(false);
    }
  };

  const buildCrystalPractice = (crystal) => {
    const steps = [];

    // Use practice_guide if available, otherwise build from meditation_guidance
    if (crystal.practice_guide) {
      // Split practice guide into paragraphs
      const paras = crystal.practice_guide.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 30);
      if (paras.length >= 2) {
        steps.push(...paras);
      } else {
        steps.push(crystal.practice_guide);
      }
    } else if (crystal.meditation_guidance?.steps) {
      steps.push(...crystal.meditation_guidance.steps);
    }

    if (steps.length === 0) {
      steps.push(
        `Find a comfortable position. Hold your ${crystal.name} in both hands or place it on the relevant chakra.`,
        `Take seven slow, deep breaths. With each inhale, visualize the crystal's light filling your body.`,
        `Stay present with the stone for the remainder of the practice, allowing its frequency to work gently.`,
        `To close, thank the crystal for its service. Ground yourself with three deep breaths.`
      );
    }

    return {
      name: `${crystal.name} Crystal Practice`,
      duration_minutes: crystal.meditation_guidance?.duration_minutes || 15,
      element: crystal.element,
      id: crystal.id,
      steps,
    };
  };

  const handleStartPractice = (crystal) => {
    const practice = buildCrystalPractice(crystal);
    setSelectedCrystal(null); // close dialog
    setGuidedPractice(practice);
  };

  const handleExitPractice = () => setGuidedPractice(null);

  return (
    <div className="min-h-screen bg-background" data-testid="crystal-guide">
      {/* Guided Practice Overlay */}
      <AnimatePresence>
        {guidedPractice && (
          <GuidedPracticeOverlay
            practice={guidedPractice}
            stepsOverride={guidedPractice.steps}
            onExit={handleExitPractice}
          />
        )}
      </AnimatePresence>

      {/* Background */}
      <div
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=1200')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button data-testid="back-btn" onClick={() => navigate("/dashboard")}
              className="p-2 rounded-full hover:bg-white/5 transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Earth's Treasures</p>
              <h1 className="text-xl font-serif">Crystal <span className="italic text-primary">Wisdom</span></h1>
            </div>
          </div>
          <Select value={selectedElement} onValueChange={setSelectedElement}>
            <SelectTrigger data-testid="element-filter" className="w-40 bg-card border-white/10">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              {elements.map(el => (
                <SelectItem key={el} value={el}>{el === "all" ? "All Elements" : el}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
              <Gem className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-serif mb-2">Sacred <span className="italic text-primary">Crystal Library</span></h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {filteredCrystals.length === crystals.length
                  ? `${crystals.length} crystals, each carrying deep wisdom, healing properties, and guided practices for transformation.`
                  : `Showing ${filteredCrystals.length} ${selectedElement} crystals.`}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCrystals.map((crystal, index) => {
                const colors = elementColors[crystal.element] || elementColors.Spirit;
                return (
                  <motion.div
                    key={crystal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className={`rounded-2xl border backdrop-blur-xl cursor-pointer overflow-hidden
                               ${colors.bg} ${colors.border} hover:scale-[1.02] transition-all duration-300 hover:shadow-lg ${colors.glow}`}
                    onClick={() => setSelectedCrystal(crystal)}
                    data-testid={`crystal-card-${crystal.id}`}
                  >
                    {crystal.image_url && (
                      <div className="relative h-36 overflow-hidden">
                        <img src={crystal.image_url} alt={crystal.name} className="w-full h-full object-cover" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <span className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs ${colors.bg} ${colors.text} backdrop-blur-sm`}>
                          {crystal.element}
                        </span>
                      </div>
                    )}
                    <div className="p-5">
                      {!crystal.image_url && (
                        <div className="flex items-start justify-between mb-3">
                          <div className={`p-2 rounded-xl ${colors.bg}`}>
                            <Sparkles className={`w-5 h-5 ${colors.text}`} />
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${colors.bg} ${colors.text}`}>{crystal.element}</span>
                        </div>
                      )}
                      <p className={`text-xs ${colors.text} mb-1`}>{crystal.title}</p>
                      <h3 className="text-lg font-serif mb-2">{crystal.name}</h3>
                      {/* Chakra tags */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {(crystal.chakra ? [crystal.chakra] : []).slice(0, 2).map(c => (
                          <span key={c} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{c}</span>
                        ))}
                      </div>
                      {/* Quick properties */}
                      <div className="flex flex-wrap gap-1">
                        {(crystal.healing_properties?.spiritual || []).slice(0, 2).map(p => (
                          <span key={p} className="px-2 py-0.5 rounded-full bg-white/5 text-xs text-muted-foreground line-clamp-1">
                            {p.length > 40 ? p.slice(0, 40) + "…" : p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* Crystal Detail Dialog */}
      <Dialog open={!!selectedCrystal} onOpenChange={() => setSelectedCrystal(null)}>
        <DialogContent className="bg-card border-white/10 max-w-2xl max-h-[92vh] overflow-y-auto">
          {selectedCrystal && (() => {
            const colors = elementColors[selectedCrystal.element] || elementColors.Spirit;
            return (
              <>
                <DialogHeader>
                  {selectedCrystal.image_url && (
                    <div className="relative h-48 rounded-xl overflow-hidden mb-3 -mx-2">
                      <img src={selectedCrystal.image_url} alt={selectedCrystal.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
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
                  {/* Affirmation */}
                  {selectedCrystal.affirmation && (
                    <div className={`${colors.bg} border ${colors.border} rounded-xl p-4 text-center`}>
                      <Quote className={`w-4 h-4 ${colors.text} mx-auto mb-2`} />
                      <p className="text-base italic">"{selectedCrystal.affirmation}"</p>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed">{selectedCrystal.description}</p>

                  {/* Stone Vitals */}
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

                  {/* Frequency */}
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

                  {/* Why This Heals — Deep Teaching */}
                  {selectedCrystal.why_this_heals && (
                    <Section title="Why This Crystal Heals" icon={BookOpen} defaultOpen>
                      {selectedCrystal.why_this_heals.split(/\n\n+/).map((para, i) => (
                        <p key={i} className="text-sm text-muted-foreground leading-relaxed">{para.trim()}</p>
                      ))}
                    </Section>
                  )}

                  {/* Healing Properties */}
                  {selectedCrystal.healing_properties && (
                    <Section title="Healing Properties" icon={Heart}>
                      {selectedCrystal.healing_properties.physical?.length > 0 && (
                        <div>
                          <p className="text-xs text-orange-400 uppercase tracking-wider mb-2">Physical</p>
                          <ul className="space-y-1">
                            {selectedCrystal.healing_properties.physical.map((p, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex gap-2">
                                <span className="text-primary mt-1 shrink-0">·</span>{p}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedCrystal.healing_properties.emotional?.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-pink-400 uppercase tracking-wider mb-2">Emotional</p>
                          <ul className="space-y-1">
                            {selectedCrystal.healing_properties.emotional.map((p, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex gap-2">
                                <span className="text-primary mt-1 shrink-0">·</span>{p}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedCrystal.healing_properties.spiritual?.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-purple-400 uppercase tracking-wider mb-2">Spiritual</p>
                          <ul className="space-y-1">
                            {selectedCrystal.healing_properties.spiritual.map((p, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex gap-2">
                                <span className="text-primary mt-1 shrink-0">·</span>{p}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </Section>
                  )}

                  {/* Extended Teachings */}
                  {selectedCrystal.extended_teachings && (
                    <Section title="Historical & Ancient Wisdom" icon={Star}>
                      {selectedCrystal.extended_teachings.split(/\n\n+/).map((para, i) => (
                        <p key={i} className="text-sm text-muted-foreground leading-relaxed">{para.trim()}</p>
                      ))}
                    </Section>
                  )}

                  {/* Chakra Work */}
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

                  {/* Cleansing Methods */}
                  {selectedCrystal.cleansing_methods?.length > 0 && (
                    <Section title="How to Cleanse & Charge" icon={Droplets}>
                      <div className="space-y-3">
                        {selectedCrystal.cleansing_methods.map((method, i) => (
                          <div key={i} className="flex gap-3 p-3 bg-white/5 rounded-lg">
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

                  {/* Rituals */}
                  {selectedCrystal.rituals?.length > 0 && (
                    <Section title="Sacred Rituals" icon={Sparkles}>
                      <div className="space-y-4">
                        {selectedCrystal.rituals.map((ritual, i) => (
                          <div key={i} className="p-3 bg-white/5 rounded-lg">
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
                                {ritual.steps.map((step, j) => (
                                  <li key={j} className="text-xs text-muted-foreground flex gap-2">
                                    <span className={`${colors.text} shrink-0`}>{j + 1}.</span>{step}
                                  </li>
                                ))}
                              </ol>
                            )}
                          </div>
                        ))}
                      </div>
                    </Section>
                  )}

                  {/* Crystal Combinations */}
                  {selectedCrystal.combinations?.length > 0 && (
                    <Section title="Powerful Combinations" icon={Layers}>
                      <div className="space-y-2">
                        {selectedCrystal.combinations.map((combo, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
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

                  {/* Zodiac */}
                  {selectedCrystal.zodiac?.length > 0 && (
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                        <Star className="w-3 h-3" /> Zodiac Signs
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCrystal.zodiac.map(z => (
                          <span key={z} className={`px-3 py-1 rounded-full text-xs ${colors.bg} ${colors.text}`}>{z}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Origin */}
                  {selectedCrystal.origin?.length > 0 && (
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                        <Globe className="w-3 h-3" /> Origins
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCrystal.origin.map(o => (
                          <span key={o} className="px-3 py-1 rounded-full bg-white/5 text-xs text-muted-foreground">{o}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Warnings */}
                  {selectedCrystal.warnings?.length > 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                      <h4 className="text-sm uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Important Notes
                      </h4>
                      <ul className="space-y-1">
                        {selectedCrystal.warnings.map((w, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex gap-2">
                            <span className="text-amber-400 shrink-0">·</span>{w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Practice Guide */}
                  {selectedCrystal.practice_guide && (
                    <Section title="Guided Practice Instructions" icon={BookOpen}>
                      {selectedCrystal.practice_guide.split(/\n\n+/).map((para, i) => (
                        <p key={i} className="text-sm text-muted-foreground leading-relaxed">{para.trim()}</p>
                      ))}
                    </Section>
                  )}

                  {/* Meditation Guidance */}
                  {selectedCrystal.meditation_guidance && (
                    <Section title="Meditation Guidance" icon={Moon}>
                      {selectedCrystal.meditation_guidance.technique && (
                        <p className={`text-sm font-medium ${colors.text} mb-3`}>
                          {selectedCrystal.meditation_guidance.technique}
                        </p>
                      )}
                      {selectedCrystal.meditation_guidance.preparation && (
                        <p className="text-xs text-muted-foreground mb-3 italic">
                          {selectedCrystal.meditation_guidance.preparation}
                        </p>
                      )}
                      {selectedCrystal.meditation_guidance.steps?.length > 0 && (
                        <ol className="space-y-2">
                          {selectedCrystal.meditation_guidance.steps.map((step, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex gap-3">
                              <span className={`${colors.text} shrink-0 font-medium`}>{i + 1}.</span>
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

                  {/* Begin Practice Button */}
                  <Button
                    onClick={() => handleStartPractice(selectedCrystal)}
                    className="w-full"
                    size="lg"
                    data-testid="begin-crystal-practice-btn"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Begin Guided Crystal Practice
                  </Button>

                  <HealthDisclaimer type="crystal" />
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CrystalGuide;
