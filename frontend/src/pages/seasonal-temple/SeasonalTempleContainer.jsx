import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Leaf, Flame, Snowflake, Sun, Moon, Star, X, ChevronRight, Gem, Wind, Mountain, TreePine, Globe } from "lucide-react";

import { EARTH_CRAFTING, SABBATS, getCurrentSabbat } from "./seasonalTempleData";

const SeasonalTemple = ({ user }) => {
  const navigate = useNavigate();
  const [hemisphere, setHemisphere] = useState(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone.toLowerCase();
      const south = ["australia","auckland","wellington","argentina","sao_paulo","santiago","lima","johannesburg","new_zealand"];
      return south.some(s => tz.includes(s)) ? "south" : "north";
    } catch { return "north"; }
  });
  const [selectedSabbat, setSelectedSabbat] = useState(null);

  const getSabbatTabLabel = (tab) => {
    if (tab === "overview") return "Traditions";
    if (tab === "ritual") return "Ritual 🙏";
    if (tab === "embodiment") return "Embodiment";
    return "Crystals & Herbs";
  };
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCraft, setSelectedCraft] = useState(null);

  const currentSabbat = useMemo(() => getCurrentSabbat(hemisphere), [hemisphere]);

  const sabbatTabs = ["overview", "ritual", "embodiment", "nature"];

  return (
    <div className="min-h-screen bg-background" data-testid="seasonal-temple">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button data-testid="back-btn" onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/5 transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Sacred Seasons</p>
              <h1 className="text-xl font-serif">Wheel of the <span className="italic text-amber-300">Year</span></h1>
            </div>
          </div>
          {/* Hemisphere Toggle */}
          <div className="flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/10">
            <button onClick={() => setHemisphere("south")} data-testid="hemi-south"
              className={`px-3 py-1 rounded-full text-xs transition-all ${hemisphere === "south" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              🌿 South
            </button>
            <button onClick={() => setHemisphere("north")} data-testid="hemi-north"
              className={`px-3 py-1 rounded-full text-xs transition-all ${hemisphere === "north" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              ☀️ North
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        {/* ── Wheel of the Year visual ─────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-10 pt-4">
          <h2 className="text-3xl font-serif mb-2">The Eight <span className="italic text-amber-300">Sacred Gates</span></h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            The Wheel turns through 8 stations — 4 solar (solstices & equinoxes) and 4 fire festivals. Each gate is a doorway into a different quality of being.
            {" "}<span className={`text-xs px-2 py-0.5 rounded-full ${hemisphere === "south" ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10"}`}>
              {hemisphere === "south" ? "🌿 Southern Hemisphere dates" : "☀️ Northern Hemisphere dates"}
            </span>
          </p>

          {/* Wheel graphic */}
          <div className="relative w-72 h-72 mx-auto my-10">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
            <div className="absolute inset-4 rounded-full border border-white/5" />
            {/* Centre */}
            <div className="absolute inset-[44%] rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Star className="w-3 h-3 text-primary" />
            </div>
            {/* Sabbat nodes */}
            {SABBATS.map((s) => {
              const angleRad = ((s.angle - 90) * Math.PI) / 180;
              const radius = 108;
              const x = 144 + radius * Math.cos(angleRad);
              const y = 144 + radius * Math.sin(angleRad);
              const isCurrent = s.id === currentSabbat;
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => { setSelectedSabbat(s); setActiveTab("overview"); }}
                  data-testid={`wheel-${s.id}`}
                  style={{ left: x - 20, top: y - 20 }}
                  className={`absolute w-10 h-10 rounded-full border flex items-center justify-center
                             transition-all hover:scale-110
                             ${s.color.bg} ${s.color.border}
                             ${isCurrent ? "ring-2 ring-primary ring-offset-1 ring-offset-background scale-110" : ""}`}
                  title={`${s.name} — ${s.dates[hemisphere]}`}
                >
                  <Icon className={`w-4 h-4 ${s.color.text}`} />
                </button>
              );
            })}
            {/* Spokes */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 288 288">
              {SABBATS.map((s) => {
                const angleRad = ((s.angle - 90) * Math.PI) / 180;
                return (
                  <line key={s.id}
                    x1="144" y1="144"
                    x2={144 + 100 * Math.cos(angleRad)}
                    y2={144 + 100 * Math.sin(angleRad)}
                    stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                );
              })}
            </svg>
          </div>

          <p className="text-xs text-muted-foreground">
            <span className="text-primary">●</span> Currently nearest: <span className="font-medium">{SABBATS.find(s => s.id === currentSabbat)?.name}</span>
            {" "}· Click any gate to enter
          </p>
        </motion.div>

        {/* ── Sabbat Cards Grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {SABBATS.map((s, i) => {
            const Icon = s.icon;
            const isCurrent = s.id === currentSabbat;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => { setSelectedSabbat(s); setActiveTab("overview"); }}
                data-testid={`sabbat-card-${s.id}`}
                className={`cursor-pointer rounded-xl border transition-all hover:scale-[1.02] overflow-hidden
                           ${s.color.bg} ${s.color.border}
                           ${isCurrent ? "ring-1 ring-primary" : ""}`}
              >
                {s.image && (
                  <div className="relative h-28 overflow-hidden">
                    <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/30 to-transparent" />
                    {isCurrent && <span className="absolute top-2 right-2 text-xs text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">Now</span>}
                  </div>
                )}
                <div className="p-4">
                <div className={`flex items-center justify-between mb-3 ${s.image ? 'hidden' : ''}`}>
                  <Icon className={`w-6 h-6 ${s.color.text}`} />
                  {isCurrent && !s.image && <span className="text-xs text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">Now</span>}
                </div>
                <h3 className="font-serif text-base mb-0.5">{s.name}</h3>
                <p className={`text-xs ${s.color.text} mb-2`}>{s.dates[hemisphere]}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{s.theme}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

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
                  onClick={() => setSelectedCraft(craft)}
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
                {sabbatTabs.map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 text-xs font-medium transition-all capitalize ${
                      activeTab === tab ? `${selectedSabbat.color.text} border-b-2 ${selectedSabbat.color.border}` : "text-muted-foreground hover:text-foreground"
                    }`}>
                    {getSabbatTabLabel(tab)}
                  </button>
                ))}
              </div>
              <div className="p-6">
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
                {activeTab === "ritual" && (
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
                {activeTab === "embodiment" && (
                  <div className={`p-5 rounded-xl ${selectedSabbat.color.bg} border ${selectedSabbat.color.border}`}>
                    <p className="text-sm text-muted-foreground leading-relaxed">{selectedSabbat.embodiment}</p>
                  </div>
                )}
                {activeTab === "nature" && (
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
        {selectedCraft && (
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
