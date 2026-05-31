import { motion, AnimatePresence } from "framer-motion";
import { Star, Leaf, Droplets, Zap, Eye, Globe, Heart, Moon, Sun, Music } from "lucide-react";

export const ElementalTempleDetailView = ({
  activeTemple,
  sections,
  activeSection,
  setActiveSection,
  stableElementKey,
}) => (
  <motion.div
    key={activeTemple.id}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="max-w-4xl mx-auto"
  >
    <div className={`p-8 rounded-2xl ${activeTemple.color.bg} border ${activeTemple.color.border} mb-8 text-center`}>
      <activeTemple.icon className={`w-16 h-16 mx-auto mb-4 ${activeTemple.color.text}`} />
      <h2 className="text-3xl font-serif mb-2">{activeTemple.name}</h2>
      <p className={`text-lg italic ${activeTemple.color.text} mb-4`}>{activeTemple.tagline}</p>
      <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">{activeTemple.description}</p>
    </div>

    <div className="flex flex-wrap gap-2 mb-8 justify-center">
      {sections.map((sec) => (
        <button
          key={sec.id}
          onClick={() => setActiveSection(sec.id)}
          data-testid={`section-${sec.id}`}
          className={`px-4 py-2 rounded-full text-sm transition-all ${
            activeSection === sec.id
              ? `${activeTemple.color.bg} ${activeTemple.color.text} border ${activeTemple.color.border}`
              : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-white/10"
          }`}
        >
          {sec.label}
        </button>
      ))}
    </div>

    <AnimatePresence mode="wait">
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
      >
        {activeSection === "why_it_heals" && (
          <div className="space-y-4">
            <div className={`p-6 rounded-2xl ${activeTemple.color.bg} border ${activeTemple.color.border}`}>
              <h3 className="text-xl font-serif mb-4 flex items-center gap-2">
                <Zap className={`w-5 h-5 ${activeTemple.color.text}`} />
                Why {activeTemple.element} Heals
              </h3>
              {(activeTemple.why_it_heals || "").split(/\n\n+/).map((para) => (
                <p key={stableElementKey(`why-heals-${activeTemple.id}`, para)} className="text-muted-foreground leading-relaxed mb-3 last:mb-0">{para.trim()}</p>
              ))}
            </div>
          </div>
        )}

        {activeSection === "ancient_traditions" && (
          <div className="space-y-4">
            <div className={`p-6 rounded-2xl ${activeTemple.color.bg} border ${activeTemple.color.border}`}>
              <h3 className="text-xl font-serif mb-4 flex items-center gap-2">
                <Globe className={`w-5 h-5 ${activeTemple.color.text}`} />
                {activeTemple.element} Across Ancient Traditions
              </h3>
              {(activeTemple.ancient_traditions || "").split(/\n\n+/).map((para) => (
                <p key={stableElementKey(`ancient-${activeTemple.id}`, para)} className="text-muted-foreground leading-relaxed mb-3 last:mb-0">{para.trim()}</p>
              ))}
            </div>
          </div>
        )}

        {activeSection === "embodiment" && (
          <div className={`p-6 rounded-2xl ${activeTemple.color.bg} border ${activeTemple.color.border}`}>
            <h3 className="text-xl font-serif mb-4 flex items-center gap-2">
              <Star className={`w-5 h-5 ${activeTemple.color.text}`} />
              Embodying {activeTemple.element}
            </h3>
            <p className="text-muted-foreground leading-relaxed">{activeTemple.embodiment}</p>
          </div>
        )}

        {activeSection === "inner" && (
          <div className="space-y-4">
            <div className={`p-6 rounded-2xl ${activeTemple.color.bg} border ${activeTemple.color.border}`}>
              <h3 className="text-xl font-serif mb-3">{activeTemple.element} Within You</h3>
              <p className="text-muted-foreground leading-relaxed">{activeTemple.inner}</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-lg font-serif mb-3">The Wisdom of {activeTemple.element}</h3>
              <p className="text-muted-foreground leading-relaxed italic">{activeTemple.wisdom}</p>
            </div>
          </div>
        )}

        {activeSection === "outer" && (
          <div className="space-y-4">
            <div className={`p-6 rounded-2xl ${activeTemple.color.bg} border ${activeTemple.color.border}`}>
              <h3 className="text-xl font-serif mb-3">{activeTemple.element} in the World</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">{activeTemple.outer}</p>
              <h4 className="font-medium mb-3">Nature Connection Practices</h4>
              <ul className="space-y-3">
                {activeTemple.nature_connection.map((practice, i) => (
                  <li key={stableElementKey(`nature-practice-${activeTemple.id}`, practice)} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className={`w-6 h-6 rounded-full ${activeTemple.color.bg} border ${activeTemple.color.border} flex items-center justify-center text-xs ${activeTemple.color.text} flex-shrink-0 mt-0.5`}>
                      {i + 1}
                    </span>
                    {practice}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeSection === "practices" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTemple.practices.map((practice, i) => (
              <motion.div
                key={stableElementKey(`practice-card-${activeTemple.id}`, `${practice.name}-${practice.type}`)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-5 rounded-xl border ${activeTemple.color.bg} ${activeTemple.color.border}`}
                data-testid={`practice-card-${stableElementKey(activeTemple.id, practice.name)}`}
              >
                <span className={`text-xs ${activeTemple.color.text} uppercase tracking-wider`}>{practice.type}</span>
                <h4 className="font-serif text-base mt-1 mb-2">{practice.name}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{practice.desc}</p>
              </motion.div>
            ))}
          </div>
        )}

        {activeSection === "rituals" && (
          <div className="space-y-6">
            <p className="text-muted-foreground text-sm">Sacred ceremonies for embodying the {activeTemple.element} element in your life. 🙏</p>
            {(activeTemple.rituals || []).map((ritual, i) => (
              <motion.div
                key={stableElementKey(`ritual-${activeTemple.id}`, ritual.name)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl border overflow-hidden ${activeTemple.color.border}`}
                data-testid={`ritual-${stableElementKey(activeTemple.id, ritual.name)}`}
              >
                <div className={`p-5 ${activeTemple.color.bg}`}>
                  <h3 className="text-lg font-serif mb-1">{ritual.name}</h3>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Star className={`w-3 h-3 ${activeTemple.color.text}`} />{ritual.timing}</span>
                    <span>{ritual.duration}</span>
                  </div>
                </div>
                <div className="p-5 bg-white/3 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">You Will Need</p>
                    <div className="flex flex-wrap gap-2">
                      {ritual.what_you_need.map((item) => (
                        <span key={stableElementKey(`ritual-need-${ritual.name}`, item)} className={`px-2.5 py-1 rounded-full text-xs border ${activeTemple.color.bg} ${activeTemple.color.text} ${activeTemple.color.border}`}>{item}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">The Practice</p>
                    <ol className="space-y-3">
                      {ritual.steps.map((step, j) => (
                        <li key={stableElementKey(`ritual-step-${ritual.name}`, step)} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <span className={`w-6 h-6 rounded-full ${activeTemple.color.bg} border ${activeTemple.color.border} flex items-center justify-center text-xs ${activeTemple.color.text} flex-shrink-0`}>{j + 1}</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className={`p-3 rounded-xl ${activeTemple.color.bg} border ${activeTemple.color.border}`}>
                    <p className="text-xs text-muted-foreground/80 italic">{ritual.closing}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeSection === "ceremonies" && (
          <div className="space-y-6">
            <p className="text-muted-foreground text-sm">Group and communal ceremonies for honoring the {activeTemple.element} element together. 🙏</p>
            {(activeTemple.ceremonies || []).map((ceremony, i) => (
              <motion.div
                key={stableElementKey(`ceremony-${activeTemple.id}`, ceremony.name)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl border overflow-hidden ${activeTemple.color.border}`}
                data-testid={`ceremony-${stableElementKey(activeTemple.id, ceremony.name)}`}
              >
                <div className={`p-5 ${activeTemple.color.bg}`}>
                  <h3 className="text-lg font-serif mb-1">{ceremony.name}</h3>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Moon className={`w-3 h-3 ${activeTemple.color.text}`} />{ceremony.timing}</span>
                    <span>{ceremony.duration}</span>
                  </div>
                </div>
                <div className="p-5 bg-white/3 space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{ceremony.description}</p>
                  {ceremony.what_you_need && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">You Will Need</p>
                      <div className="flex flex-wrap gap-2">
                        {ceremony.what_you_need.map((item) => (
                          <span key={stableElementKey(`ceremony-need-${ceremony.name}`, item)} className={`px-2.5 py-1 rounded-full text-xs border ${activeTemple.color.bg} ${activeTemple.color.text} ${activeTemple.color.border}`}>{item}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {ceremony.flow && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Ceremony Flow</p>
                      <ol className="space-y-3">
                        {ceremony.flow.map((step, j) => (
                          <li key={stableElementKey(`ceremony-step-${ceremony.name}`, step)} className="flex items-start gap-3 text-sm text-muted-foreground">
                            <span className={`w-6 h-6 rounded-full ${activeTemple.color.bg} border ${activeTemple.color.border} flex items-center justify-center text-xs ${activeTemple.color.text} flex-shrink-0`}>{j + 1}</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                  {ceremony.closing_prayer && (
                    <div className={`p-4 rounded-xl ${activeTemple.color.bg} border ${activeTemple.color.border}`}>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Closing Prayer</p>
                      <p className={`text-sm italic ${activeTemple.color.text} leading-relaxed`}>{ceremony.closing_prayer}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeSection === "blessings" && (
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">Sacred blessings, prayers, and invocations for the {activeTemple.element} element. Speak them aloud, slowly, with full presence. 🙏</p>
            {(activeTemple.blessings || []).map((blessing, i) => (
              <motion.div
                key={stableElementKey(`blessing-${activeTemple.id}`, blessing.name)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`rounded-2xl border p-5 ${activeTemple.color.bg} ${activeTemple.color.border}`}
                data-testid={`blessing-${stableElementKey(activeTemple.id, blessing.name)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-serif text-base">{blessing.name}</h4>
                  <Heart className={`w-4 h-4 ${activeTemple.color.text} flex-shrink-0 mt-0.5`} />
                </div>
                <p className={`text-xs ${activeTemple.color.text} mb-3 italic`}>{blessing.when}</p>
                <p className="text-sm text-muted-foreground leading-relaxed italic border-l-2 pl-4" style={{ borderColor: `var(--${activeTemple.color.accent}, currentColor)` }}>
                  "{blessing.text}"
                </p>
              </motion.div>
            ))}
          </div>
        )}

        {activeSection === "affirmations" && (
          <div className={`p-8 rounded-2xl ${activeTemple.color.bg} border ${activeTemple.color.border} text-center`}>
            <h3 className="text-xl font-serif mb-6">{activeTemple.element} Affirmations</h3>
            <div className="space-y-4">
              {activeTemple.affirmations.map((aff, i) => (
                <motion.p
                  key={stableElementKey(`affirmation-${activeTemple.id}`, aff)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`text-lg font-serif italic ${activeTemple.color.text} leading-relaxed`}
                >
                  "{aff}"
                </motion.p>
              ))}
            </div>
            <p className="mt-8 text-xs text-muted-foreground uppercase tracking-widest">
              Speak these aloud with your hand on your heart
            </p>
          </div>
        )}

        {activeSection === "safety_precautions" && (
          <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-red-400 text-xl">⚠</span>
              <h3 className="text-xl font-serif text-red-300">Safety Precautions for {activeTemple.element} Work</h3>
            </div>
            {activeTemple.safety_precautions ? (
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {activeTemple.safety_precautions}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Always approach elemental work with care and reverence. Ground yourself before and after practice, stay hydrated, and be gentle with what arises.
              </p>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  </motion.div>
);