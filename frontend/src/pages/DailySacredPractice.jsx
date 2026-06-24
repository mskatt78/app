import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sun, Moon, Sparkles, Heart, Clock, ChevronDown, Loader2, Calendar, Star, Sunrise, Sunset, RefreshCw, Shield, Flame, Wand2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import GuidedAudioButton from "../components/GuidedAudioButton";
import { resolveDurationMinutes } from "../utils/durationUtils";

const api = axios.create({ baseURL: `${process.env.REACT_APP_BACKEND_URL}/api` });

const MOON_ICONS = {
  "New Moon": "🌑",
  "Waxing Crescent": "🌒",
  "First Quarter": "🌓",
  "Waxing Gibbous": "🌔",
  "Full Moon": "🌕",
  "Waning Gibbous": "🌖",
  "Last Quarter": "🌗",
  "Waning Crescent": "🌘",
};

const DAY_COLORS = {
  Monday: { bg: "from-slate-900/50 to-blue-900/30", accent: "text-blue-300", icon: Moon },
  Tuesday: { bg: "from-slate-900/50 to-red-900/30", accent: "text-red-300", icon: Sparkles },
  Wednesday: { bg: "from-slate-900/50 to-emerald-900/30", accent: "text-emerald-300", icon: Star },
  Thursday: { bg: "from-slate-900/50 to-violet-900/30", accent: "text-violet-300", icon: Sparkles },
  Friday: { bg: "from-slate-900/50 to-pink-900/30", accent: "text-pink-300", icon: Heart },
  Saturday: { bg: "from-slate-900/50 to-stone-900/30", accent: "text-stone-300", icon: Star },
  Sunday: { bg: "from-slate-900/50 to-amber-900/30", accent: "text-amber-300", icon: Sun },
};

const stableDailyKey = (prefix, value) => {
  const slug = String(value || "item")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${prefix}-${slug || "item"}`;
};

const buildPracticeDeepContainer = (practice) => {
  if (!practice) return [];

  const guide = String(
    practice.extended_practice
    || practice.somatic_practice
    || practice.practice_guide
    || practice.cleansing_guide
    || practice.self_healing_guide
    || practice.description
    || ""
  ).trim();

  return [
    {
      phase_id: "prepare",
      title: "Preparation & Intention",
      duration: "5-8 min",
      steps: [
        `Name your intention for ${practice.name} in one sentence.`,
        "Orient to breath and body safety before beginning deeper work.",
        "Set one measurable healing outcome for today's session.",
      ],
    },
    {
      phase_id: "activate",
      title: "Activation & Ritual Depth",
      duration: `${Math.max(8, resolveDurationMinutes(practice.duration_minutes, 12))} min`,
      steps: [
        guide || `Practice ${practice.name} with slow precision and breath-led pacing.`,
        "Pause every 2-3 minutes to feel where resistance or softening appears in your body.",
        "Adjust intensity to stay in compassionate regulation while maintaining focus.",
      ],
    },
    {
      phase_id: "integrate",
      title: "Integration & Real-Life Transfer",
      duration: "10-15 min",
      steps: [
        "Write one insight, one boundary, and one courageous action from this practice.",
        "Hydrate, ground, and complete one embodied action before the day ends.",
        "Revisit this same protocol for 7 days to stabilize transformation.",
      ],
    },
  ];
};

export default function DailySacredPractice({ user, api: userApi }) {
  const navigate = useNavigate();
  const [dailyData, setDailyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedPractice, setExpandedPractice] = useState(null);
  const [focusArea, setFocusArea] = useState("");

  const fetchDailyPractice = useCallback(async (focus = null) => {
    setLoading(true);
    try {
      const params = focus ? { focus } : {};
      const { data } = await api.get("/daily-practice", { params });
      setDailyData(data);
    } catch (err) {
      toast.error("Failed to load daily practice");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDailyPractice();
  }, [fetchDailyPractice]);

  const handleFocusSearch = (e) => {
    e.preventDefault();
    fetchDailyPractice(focusArea.trim() || null);
  };

  const dayConfig = dailyData ? DAY_COLORS[dailyData.day_of_week] || DAY_COLORS.Sunday : DAY_COLORS.Sunday;
  const DayIcon = dayConfig.icon;

  const renderPracticeCard = ({ practice, time, icon: Icon, label }) => {
    if (!practice) return null;
    const isExpanded = expandedPractice === `${time}-${practice.id}`;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden"
      >
        <div
          className="p-5 cursor-pointer hover:bg-white/5 transition-colors"
          onClick={() => setExpandedPractice(isExpanded ? null : `${time}-${practice.id}`)}
        >
          <div className="flex items-start gap-4">
            {practice.image_url ? (
              <img
                src={practice.image_url}
                alt={practice.name}
                className="w-20 h-20 rounded-xl object-contain bg-black/25"
                data-testid={`daily-practice-image-${time}`}
              />
            ) : (
              <div className={`w-20 h-20 rounded-xl ${time === 'morning' ? 'bg-amber-500/20' : 'bg-indigo-500/20'} flex items-center justify-center`}>
                <Icon className={`w-8 h-8 ${time === 'morning' ? 'text-amber-400' : 'text-indigo-400'}`} />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${time === 'morning' ? 'text-amber-400' : 'text-indigo-400'}`} />
                <span className={`text-xs uppercase tracking-wider ${time === 'morning' ? 'text-amber-400' : 'text-indigo-400'}`}>{label}</span>
              </div>
              <h3 className="font-serif text-lg mb-1">{practice.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{practice.description}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                {practice.duration_minutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />{practice.duration_minutes} min
                  </span>
                )}
                <span className="capitalize">{practice.practice_type?.replace(/_/g, ' ')}</span>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-white/10 overflow-hidden"
            >
              <div className="p-5 space-y-4">
                {practice.deeper_teaching && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-violet-400" /> Deeper Teaching
                    </h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{practice.deeper_teaching}</p>
                  </div>
                )}

                {(practice.practice_guide || practice.cleansing_guide || practice.self_healing_guide || practice.extended_practice || practice.somatic_practice) && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-400" /> Practice Guide
                    </h4>
                    <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed bg-white/5 rounded-xl p-4 max-h-80 overflow-y-auto">
                      {practice.extended_practice || practice.somatic_practice || practice.practice_guide || practice.cleansing_guide || practice.self_healing_guide}
                    </div>
                  </div>
                )}

                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 space-y-3" data-testid={`daily-practice-master-container-${time}`}>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-300" /> Transformational Ritual Container
                  </h4>
                  {buildPracticeDeepContainer(practice).map((phase) => (
                    <div key={phase.phase_id} className="rounded-lg border border-white/10 bg-black/20 p-3" data-testid={`daily-practice-master-phase-${time}-${phase.phase_id}`}>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <p className="text-xs text-amber-100">{phase.title}</p>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200">{phase.duration}</span>
                      </div>
                      <ul className="space-y-1.5">
                        {phase.steps.map((step, idx) => (
                          <li key={`${phase.phase_id}-${idx}`} className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="text-amber-300">✦</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {(practice.shadow_work || practice.shadow_integration) && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Moon className="w-4 h-4 text-indigo-400" /> Shadow Work
                    </h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{practice.shadow_work || practice.shadow_integration}</p>
                  </div>
                )}

                {practice.benefits && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Benefits</h4>
                    <div className="flex flex-wrap gap-2">
                      {(typeof practice.benefits === 'string' ? practice.benefits.split(',') : practice.benefits).map((benefit) => (
                        <span key={stableDailyKey(`daily-benefit-${practice.id}`, typeof benefit === 'string' ? benefit.trim() : benefit)} className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-300 text-xs">{typeof benefit === 'string' ? benefit.trim() : benefit}</span>
                      ))}
                    </div>
                  </div>
                )}

                <GuidedAudioButton
                  api={userApi}
                  script={`${practice.name}. ${practice.description}. ${practice.practice_guide || practice.cleansing_guide || practice.self_healing_guide || ''}`}
                  label="Listen to Guided Practice"
                  className="w-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const renderUnifiedFlow = () => {
    const flow = dailyData?.unified_daily_flow;
    if (!flow) {
      return null;
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-950/20 via-violet-950/20 to-slate-950/20 p-6 space-y-5"
        data-testid="daily-unified-ceremonial-flow"
      >
        <div>
          <h2 className="text-xl font-serif flex items-center gap-2" data-testid="daily-unified-title">
            <Wand2 className="w-5 h-5 text-fuchsia-300" />
            {flow.title}
          </h2>
          <p className="text-sm text-muted-foreground mt-2 italic" data-testid="daily-unified-opening-invocation">
            {flow.opening_invocation}
          </p>
        </div>

        <div className="space-y-3" data-testid="daily-unified-steps-list">
          {(flow.ceremony_steps || []).map((step) => (
            <div
              key={stableDailyKey("daily-unified-step", step.step_id || step.title)}
              className="rounded-xl border border-white/10 bg-black/20 p-4"
              data-testid={`daily-unified-step-${step.step_id || "step"}`}
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <h3 className="text-sm font-medium text-violet-100">{step.title}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-violet-500/20 text-violet-200" data-testid={`daily-unified-step-duration-${step.step_id || "step"}`}>
                  {step.duration_minutes} min
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`daily-unified-step-instruction-${step.step_id || "step"}`}>
                {step.instruction}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 px-0 text-xs text-violet-300 hover:text-violet-200"
                onClick={() => navigate(step.anchor_route || "/menu")}
                data-testid={`daily-unified-step-open-${step.step_id || "step"}`}
              >
                Open {step.anchor_name || "practice"}
              </Button>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4" data-testid="daily-dragon-integration-panel">
            <h3 className="text-sm font-medium text-amber-300 mb-1">Dragon Integration</h3>
            <p className="text-sm text-muted-foreground">{flow.dragon_integration}</p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4" data-testid="daily-closing-benediction-panel">
            <h3 className="text-sm font-medium text-emerald-300 mb-1">Closing Benediction</h3>
            <p className="text-sm text-muted-foreground">{flow.closing_benediction}</p>
          </div>
        </div>

        <p className="text-sm italic text-violet-100/90" data-testid="daily-unified-journal-prompt">
          Journal Prompt: {flow.journal_prompt}
        </p>
      </motion.div>
    );
  };

  const renderAllyAngelPanels = () => (
    <div className="grid md:grid-cols-2 gap-4" data-testid="daily-ally-angel-grid">
      {dailyData?.daily_ally ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/10 p-5"
          data-testid="daily-ally-panel"
        >
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-fuchsia-300" />
            <h3 className="font-serif text-lg" data-testid="daily-ally-name">{dailyData.daily_ally.name}</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-2" data-testid="daily-ally-description">{dailyData.daily_ally.description}</p>
          <p className="text-xs text-fuchsia-200/80 italic" data-testid="daily-ally-ritual-preview">{firstLine(dailyData.daily_ally.rituals)}</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 px-0 text-fuchsia-300 hover:text-fuchsia-200"
            onClick={() => navigate("/sacred-ally-alchemy")}
            data-testid="daily-ally-open-button"
          >
            Open Sacred Ally Alchemy
          </Button>
        </motion.div>
      ) : (
        <div className="rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/10 p-5" data-testid="daily-ally-fallback-panel">
          <h3 className="font-serif text-lg">Sacred Ally Transmission</h3>
          <p className="text-sm text-muted-foreground">Ally guidance is attuning for today. Return with a fresh refresh.</p>
        </div>
      )}

      {dailyData?.daily_angel ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-5"
          data-testid="daily-angel-panel"
        >
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-sky-300" />
            <h3 className="font-serif text-lg" data-testid="daily-angel-name">{dailyData.daily_angel.name}</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-2" data-testid="daily-angel-description">{dailyData.daily_angel.description}</p>
          <p className="text-xs text-sky-200/80 italic" data-testid="daily-angel-ritual-preview">{firstLine(dailyData.daily_angel.practical_rituals)}</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 px-0 text-sky-300 hover:text-sky-200"
            onClick={() => navigate("/sacred-ally-alchemy")}
            data-testid="daily-angel-open-button"
          >
            Open Angelic Alchemy
          </Button>
        </motion.div>
      ) : (
        <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-5" data-testid="daily-angel-fallback-panel">
          <h3 className="font-serif text-lg">Angelic Alchemy Seal</h3>
          <p className="text-sm text-muted-foreground">Angelic seal guidance is attuning for today. Return with a fresh refresh.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background" data-testid="daily-practice-page">
      {/* Header */}
      <header className={`relative overflow-hidden border-b border-white/10 bg-gradient-to-b ${dayConfig.bg} to-background`}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/menu")} className="mb-4 text-muted-foreground" data-testid="back-btn">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Menu
          </Button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${dayConfig.bg}`}>
              <DayIcon className={`w-10 h-10 ${dayConfig.accent}`} />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif" data-testid="daily-practice-title">Daily Sacred Practice</h1>
              <p className="text-muted-foreground mt-1" data-testid="daily-practice-subtitle">Your personalized spiritual guidance for today</p>
              {dailyData?.ceremonial_affirmation && (
                <p className="text-sm italic text-violet-200/90 mt-2" data-testid="daily-ceremonial-affirmation">
                  “{dailyData.ceremonial_affirmation}”
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
          </div>
        ) : dailyData ? (
          <div className="space-y-8">
            {/* Cosmic Context */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
              data-testid="daily-cosmic-context-card"
            >
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className={`w-5 h-5 ${dayConfig.accent}`} />
                  <span className="font-serif text-lg">{dailyData.day_of_week}</span>
                  <span className="text-sm text-muted-foreground">• Ruled by {dailyData.day_ruler}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{MOON_ICONS[dailyData.moon_phase] || "🌙"}</span>
                  <span className="font-serif">{dailyData.moon_phase}</span>
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <h3 className="text-sm font-medium text-amber-300 mb-1">Day Theme</h3>
                  <p className="text-sm text-muted-foreground">{dailyData.day_theme}</p>
                </div>
                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <h3 className="text-sm font-medium text-indigo-300 mb-1">Moon Theme</h3>
                  <p className="text-sm text-muted-foreground">{dailyData.moon_theme}</p>
                </div>
              </div>
              
              <p className="text-muted-foreground italic leading-relaxed">{dailyData.guidance}</p>
            </motion.div>

            {/* Focus Area Search */}
            <form onSubmit={handleFocusSearch} className="flex gap-2" data-testid="daily-focus-form">
              <input
                type="text"
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                placeholder="Focus area (e.g., heart, grounding, grief, sensuality...)"
                className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                data-testid="daily-focus-input"
              />
              <Button type="submit" variant="outline" size="sm" data-testid="daily-focus-refresh-button">
                <RefreshCw className="w-4 h-4 mr-1" /> Refresh
              </Button>
            </form>

            {renderUnifiedFlow()}

            {!dailyData?.unified_daily_flow && renderAllyAngelPanels()}

            {dailyData.dragon_astrology_reflection && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-6"
                data-testid="daily-dragon-astrology-reflection"
              >
                <h2 className="text-lg font-serif flex items-center gap-2 mb-2" data-testid="daily-dragon-reflection-title">
                  <Star className="w-5 h-5 text-amber-300" />
                  {dailyData.dragon_astrology_reflection.title}
                </h2>
                <p className="text-sm text-muted-foreground mb-2" data-testid="daily-dragon-reflection-summary">{dailyData.dragon_astrology_reflection.summary}</p>
                <p className="text-sm italic text-amber-100/80" data-testid="daily-dragon-reflection-zodiac-focus">{dailyData.dragon_astrology_reflection.zodiac_focus}</p>
                <p className="text-xs text-muted-foreground mt-2" data-testid="daily-dragon-reflection-prompt">{dailyData.dragon_astrology_reflection.integration_prompt}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 px-0 text-amber-300 hover:text-amber-200"
                  onClick={() => navigate("/astrology/charts")}
                  data-testid="daily-dragon-open-charts-button"
                >
                  Open Astrology Charts
                </Button>
              </motion.div>
            )}

            {/* Morning Practice */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sunrise className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-serif">Morning Practice</h2>
              </div>
              {renderPracticeCard({
                practice: dailyData.morning_practice,
                time: "morning",
                icon: Sunrise,
                label: "Morning Awakening",
              })}
            </div>

            {/* Evening Practice */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sunset className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-serif">Evening Practice</h2>
              </div>
              {renderPracticeCard({
                practice: dailyData.evening_practice,
                time: "evening",
                icon: Sunset,
                label: "Evening Integration",
              })}
            </div>

            {/* Reflection Prompts */}
            {dailyData.reflection_prompts && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
                data-testid="daily-reflection-prompts-card"
              >
                <h2 className="text-lg font-serif mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                  Reflection Prompts
                </h2>
                <ul className="space-y-3">
                  {dailyData.reflection_prompts.map((prompt) => (
                    <li key={stableDailyKey("daily-reflection", prompt)} className="flex gap-3 text-muted-foreground">
                      <span className="text-violet-400">•</span>
                      <span className="italic">{prompt}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {dailyData.daily_journal_prompts?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-6"
                data-testid="daily-journal-prompts-card"
              >
                <h2 className="text-lg font-serif mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-300" />
                  Ceremonial Journal Prompts
                </h2>
                <ul className="space-y-3">
                  {dailyData.daily_journal_prompts.map((prompt) => (
                    <li key={stableDailyKey("daily-journal", prompt)} className="flex gap-3 text-muted-foreground">
                      <span className="text-violet-300">✦</span>
                      <span className="italic">{prompt}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <Moon className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h2 className="text-2xl font-serif mb-2">Unable to Load Daily Practice</h2>
            <p className="text-muted-foreground">Please try refreshing the page.</p>
          </div>
        )}
      </main>
    </div>
  );
}

const firstLine = (value) => {
  if (Array.isArray(value)) {
    const found = value.find((item) => String(item || "").trim());
    return found ? String(found) : "Ritual guidance available in this transmission.";
  }
  const text = String(value || "").trim();
  return text || "Ritual guidance available in this transmission.";
};
