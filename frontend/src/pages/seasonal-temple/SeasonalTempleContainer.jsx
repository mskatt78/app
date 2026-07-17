import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Flame, Snowflake, Sun, Moon, Star, X, ChevronRight, Gem, Wind, Mountain, TreePine, Globe } from "lucide-react";

import { EARTH_CRAFTING, SABBATS, WHEEL_VISUAL_EXAMPLES, getCurrentSabbat } from "./seasonalTempleData";
import { SeasonalTempleHeader } from "./SeasonalTempleHeader";
import { SeasonalTempleWheelSection } from "./SeasonalTempleWheelSection";
import { SeasonalTempleCardsSection } from "./SeasonalTempleCardsSection";
import { SABBAT_TABS, getSabbatTabLabel } from "./seasonalTempleConstants";
import { usePremiumAccess } from "../../hooks/usePremiumAccess";

const SeasonalTemple = ({ api, user }) => {
  const navigate = useNavigate();
  const premium = usePremiumAccess({ api, user });
  const seasonalTempleUnlocked = true;
  const seasonalTempleLocked = false;
  const [hemisphere, setHemisphere] = useState(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone.toLowerCase();
      const south = ["australia","auckland","wellington","argentina","sao_paulo","santiago","lima","johannesburg","new_zealand"];
      return south.some(s => tz.includes(s)) ? "south" : "north";
    } catch { return "north"; }
  });
  const [selectedSabbat, setSelectedSabbat] = useState(null);

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCraft, setSelectedCraft] = useState(null);

  const currentSabbat = useMemo(() => getCurrentSabbat(hemisphere), [hemisphere]);

  const onSelectSabbat = (sabbat) => {
    setSelectedSabbat(sabbat);
    setActiveTab("overview");
  };

  const promptSeasonalUpgrade = () => {
    navigate("/pricing");
  };

  return (
    <div className="min-h-screen bg-background" data-testid="seasonal-temple">
      <SeasonalTempleHeader
        hemisphere={hemisphere}
        onBack={() => navigate(-1)}
        onHemisphereChange={setHemisphere}
        locked={seasonalTempleLocked}
        onUnlock={promptSeasonalUpgrade}
      />

      <main className="max-w-5xl mx-auto p-6">
        <SeasonalTempleWheelSection
          hemisphere={hemisphere}
          currentSabbat={currentSabbat}
          sabbats={SABBATS}
          onSelectSabbat={(sabbat) => (seasonalTempleLocked ? promptSeasonalUpgrade() : onSelectSabbat(sabbat))}
          isLocked={seasonalTempleLocked}
        />

        <SeasonalTempleCardsSection
          sabbats={SABBATS}
          currentSabbat={currentSabbat}
          hemisphere={hemisphere}
          onSelectSabbat={onSelectSabbat}
          isLocked={seasonalTempleLocked}
          onUnlock={promptSeasonalUpgrade}
        />

        <section className="mb-12" data-testid="wheel-visual-examples-section">
          <div className="flex items-center gap-3 mb-4">
            <Gem className="w-5 h-5 text-fuchsia-300" />
            <div>
              <h2 className="text-xl font-serif">Wheel of Year Visual Examples</h2>
              <p className="text-xs text-muted-foreground">Mandala, crystal grid, and stone-circle inspiration for your own practice</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {WHEEL_VISUAL_EXAMPLES.map((example) => (
              <article key={example.id} className="rounded-xl overflow-hidden border border-white/10 bg-card/60" data-testid={`wheel-visual-example-${example.id}`}>
                <div className="aspect-[3/2] bg-black/40">
                  <img
                    src={example.image}
                    alt={example.title}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                    data-testid={`wheel-visual-example-image-${example.id}`}
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-serif text-foreground">{example.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{example.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {!seasonalTempleUnlocked && (
          <div className="mb-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10" data-testid="seasonal-temple-lock-banner">
            <p className="text-sm text-amber-100/90">Seasonal Temple is premium. Unlock to access full sabbat rituals, embodiment teachings, and earth crafting guidance.</p>
          </div>
        )}

        {/* ── Earth Crafting ─────────────────────────────────────────────────────── */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <Mountain className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-2xl font-serif">Earth <span className="italic text-emerald-300">Crafting</span></h2>
              <p className="text-sm text-muted-foreground">Sacred practices for working with the living land 🙏</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {EARTH_CRAFTING.map((craft, i) => {
              const Icon = craft.icon;
              return (
                <motion.div
                  key={craft.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => (seasonalTempleLocked ? promptSeasonalUpgrade() : setSelectedCraft(craft))}
                  data-testid={`craft-${craft.id}`}
                  className={`cursor-pointer p-5 rounded-xl border transition-all hover:scale-[1.02]
                             ${craft.color.bg} ${craft.color.border} group`}
                >
                  <Icon className={`w-6 h-6 ${craft.color.text} mb-3`} />
                  <h3 className="font-serif text-base mb-2">{craft.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-3">{craft.description}</p>
                  <div className={`mt-3 flex items-center gap-1 text-xs ${craft.color.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                    <ChevronRight className="w-3 h-3" /> View Practice
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>

      {/* ── Sabbat Detail Modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedSabbat && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedSabbat(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-card rounded-2xl max-w-3xl w-full my-8"
              data-testid="sabbat-modal">
              {/* Modal header */}
              <div className={`p-6 rounded-t-2xl ${selectedSabbat.color.bg} border-b ${selectedSabbat.color.border}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-serif">{selectedSabbat.name}</h2>
                    <p className={`text-sm ${selectedSabbat.color.text}`}>{selectedSabbat.subtitle}</p>
                    <p className="text-xs text-muted-foreground mt-1">{selectedSabbat.dates[hemisphere]} · {selectedSabbat.season[hemisphere]}</p>
                  </div>
                  <button onClick={() => setSelectedSabbat(null)} className="p-2 rounded-full hover:bg-white/10 transition-colors" data-testid="close-sabbat">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{selectedSabbat.description}</p>
              </div>
              {/* Tabs */}
              <div className={`flex border-b ${selectedSabbat.color.border}`}>
                {SABBAT_TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => {
                      if (seasonalTempleLocked && tab !== "overview") {
                        promptSeasonalUpgrade();
                        return;
                      }
                      setActiveTab(tab);
                    }}
                data-testid={`seasonal-tab-${tab}`}
                    className={`flex-1 py-3 text-xs font-medium transition-all capitalize ${
                      activeTab === tab ? `${selectedSabbat.color.text} border-b-2 ${selectedSabbat.color.border}` : "text-muted-foreground hover:text-foreground"
                    }`}>
                    {getSabbatTabLabel(tab)}
                  </button>
                ))}
              </div>
              <div className="p-6">
                <div className="grid sm:grid-cols-2 gap-3 mb-4" data-testid="seasonal-sabbat-depth-grid">
                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3" data-testid="seasonal-sabbat-why-heals-panel">
                    <p className="text-[11px] uppercase tracking-wider text-cyan-200 mb-1">Why This Heals</p>
                    <p className="text-xs text-muted-foreground">Seasonal rites heal by synchronizing body rhythms with cyclical time, reducing fragmentation and restoring orientation.</p>
                  </div>
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3" data-testid="seasonal-sabbat-safety-notes-panel">
                    <p className="text-[11px] uppercase tracking-wider text-amber-200 mb-1">Safety Notes</p>
                    <p className="text-xs text-muted-foreground">Adapt intensity to your capacity, especially during grief/release rituals. Ground physically after deep emotional work.</p>
                  </div>
                </div>
                {activeTab === "overview" && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Themes</p>
                      <p className={`text-sm ${selectedSabbat.color.text} font-medium`}>{selectedSabbat.theme}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Traditions from Around the World</p>
                      <ul className="space-y-2">
                        {selectedSabbat.traditions.map((t, i) => (
                          <li key={`${selectedSabbat.id}-tradition-${String(t).slice(0, 30)}-${i}`} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Star className={`w-3 h-3 ${selectedSabbat.color.text} flex-shrink-0 mt-1`} />
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {selectedSabbat.colors.map((c, i) => (
                        <span key={`${selectedSabbat.id}-color-${String(c).toLowerCase()}-${i}`} className={`px-2 py-1 rounded-full text-xs ${selectedSabbat.color.bg} ${selectedSabbat.color.text} border ${selectedSabbat.color.border}`}>{c}</span>
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === "ritual" && seasonalTempleLocked && (
                  <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-5" data-testid="seasonal-tab-locked-ritual">
                    <p className="text-sm text-amber-100/90">Unlock Seasonal Temple to access full ritual transmission.</p>
                  </div>
                )}
                {activeTab === "ritual" && !seasonalTempleLocked && (
                  <div className="space-y-4">
                    <h3 className="font-serif text-lg">{selectedSabbat.ritual.name}</h3>
                    <ol className="space-y-3">
                      {selectedSabbat.ritual.steps.map((step, i) => (
                        <li key={`${selectedSabbat.id}-ritual-step-${String(step).slice(0, 24)}-${i}`} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <span className={`w-6 h-6 rounded-full ${selectedSabbat.color.bg} border ${selectedSabbat.color.border} flex items-center justify-center text-xs ${selectedSabbat.color.text} flex-shrink-0`}>{i + 1}</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                {activeTab === "embodiment" && seasonalTempleLocked && (
                  <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-5" data-testid="seasonal-tab-locked-embodiment">
                    <p className="text-sm text-amber-100/90">Unlock Seasonal Temple to access embodiment and integration pathways.</p>
                  </div>
                )}
                {activeTab === "embodiment" && !seasonalTempleLocked && (
                  <div className={`p-5 rounded-xl ${selectedSabbat.color.bg} border ${selectedSabbat.color.border}`}>
                    <p className="text-sm text-muted-foreground leading-relaxed">{selectedSabbat.embodiment}</p>
                    <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3" data-testid="seasonal-sabbat-integration-actions-panel">
                      <p className="text-[11px] uppercase tracking-wider text-emerald-200 mb-2">Integration Actions</p>
                      <ul className="space-y-1.5">
                        <li className="text-xs text-muted-foreground">• Journal one seasonal lesson and one practical action for this week.</li>
                        <li className="text-xs text-muted-foreground">• Complete one land-honoring act (offering, cleanup, planting, or gratitude ritual).</li>
                        <li className="text-xs text-muted-foreground">• Share one embodied insight with a trusted person or community circle.</li>
                      </ul>
                    </div>
                  </div>
                )}
                {activeTab === "nature" && seasonalTempleLocked && (
                  <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-5" data-testid="seasonal-tab-locked-nature">
                    <p className="text-sm text-amber-100/90">Unlock Seasonal Temple to access full nature correspondences and plant teachings.</p>
                  </div>
                )}
                {activeTab === "nature" && !seasonalTempleLocked && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Crystals</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedSabbat.crystals.map((c, i) => (
                          <span key={`${selectedSabbat.id}-crystal-${String(c).toLowerCase()}-${i}`} className={`px-3 py-1 rounded-full text-xs border ${selectedSabbat.color.bg} ${selectedSabbat.color.text} ${selectedSabbat.color.border}`}>{c}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Sacred Plants & Herbs</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedSabbat.herbs.map((h, i) => (
                          <span key={`${selectedSabbat.id}-herb-${String(h).toLowerCase()}-${i}`} className="px-3 py-1 rounded-full text-xs border bg-green-500/10 text-green-300 border-green-500/25">{h}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Earth Crafting Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedCraft && !seasonalTempleLocked && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedCraft(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-card rounded-2xl max-w-2xl w-full my-8"
              data-testid="craft-modal">
              <div className={`p-6 rounded-t-2xl ${selectedCraft.color.bg} border-b ${selectedCraft.color.border}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <selectedCraft.icon className={`w-8 h-8 ${selectedCraft.color.text}`} />
                    <h2 className="text-xl font-serif">{selectedCraft.name}</h2>
                  </div>
                  <button onClick={() => setSelectedCraft(null)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{selectedCraft.description}</p>
              </div>
              <div className="p-6 space-y-4">
                {(selectedCraft.id === "medicine-wheel" || selectedCraft.id === "crystal-grid") && (
                  <div className="space-y-3" data-testid="seasonal-craft-visual-examples-panel">
                    <p className="text-[11px] uppercase tracking-wider text-fuchsia-200">Visual Examples</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {WHEEL_VISUAL_EXAMPLES
                        .filter((example) => {
                          if (selectedCraft.id === "medicine-wheel") {
                            return ["wheel-mandala-overhead", "wheel-four-directions", "stone-circle-altar"].includes(example.id);
                          }
                          return ["crystal-grid-forest", "crystal-mandala-topdown", "river-stone-pattern"].includes(example.id);
                        })
                        .map((example) => (
                          <article key={`${selectedCraft.id}-${example.id}`} className="rounded-xl overflow-hidden border border-white/10 bg-black/20" data-testid={`seasonal-craft-example-${example.id}`}>
                            <div className="aspect-[3/2] bg-black/40">
                              <img
                                src={example.image}
                                alt={example.title}
                                className="w-full h-full object-cover object-center"
                                loading="lazy"
                                data-testid={`seasonal-craft-example-image-${example.id}`}
                              />
                            </div>
                            <div className="p-2.5">
                              <h4 className="text-xs font-medium text-foreground">{example.title}</h4>
                              <p className="text-[11px] text-muted-foreground mt-1">{example.description}</p>
                            </div>
                          </article>
                        ))}
                    </div>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-3" data-testid="seasonal-craft-depth-grid">
                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3" data-testid="seasonal-craft-why-heals-panel">
                    <p className="text-[11px] uppercase tracking-wider text-cyan-200 mb-1">Why This Heals</p>
                    <p className="text-xs text-muted-foreground">Earth crafting integrates attention through hands, breath, and symbol, restoring regulation through tangible ritual action.</p>
                  </div>
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3" data-testid="seasonal-craft-safety-notes-panel">
                    <p className="text-[11px] uppercase tracking-wider text-amber-200 mb-1">Safety Notes</p>
                    <p className="text-xs text-muted-foreground">Move slowly with tools/fire and adapt actions to your physical capacity. Close by grounding and hydration.</p>
                  </div>
                </div>
                <ol className="space-y-3">
                  {selectedCraft.steps.map((step, i) => (
                    <li key={`${selectedCraft.id}-step-${String(step).slice(0, 24)}-${i}`} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <span className={`w-7 h-7 rounded-full ${selectedCraft.color.bg} border ${selectedCraft.color.border} flex items-center justify-center text-xs ${selectedCraft.color.text} flex-shrink-0`}>{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
                <div className={`p-4 rounded-xl ${selectedCraft.color.bg} border ${selectedCraft.color.border}`}>
                  <p className="text-xs text-muted-foreground/80 italic">🙏 {selectedCraft.note}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SeasonalTemple;
