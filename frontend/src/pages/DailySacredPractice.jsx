import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sun, Moon, Sparkles, Heart, Clock, ChevronDown, ChevronUp, Loader2, Calendar, Star, Sunrise, Sunset, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import GuidedAudioButton from "../components/GuidedAudioButton";

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

export default function DailySacredPractice({ user, api: userApi }) {
  const navigate = useNavigate();
  const [dailyData, setDailyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedPractice, setExpandedPractice] = useState(null);
  const [focusArea, setFocusArea] = useState("");

  useEffect(() => { fetchDailyPractice(); }, []);

  const fetchDailyPractice = async (focus = null) => {
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
  };

  const handleFocusSearch = (e) => {
    e.preventDefault();
    if (focusArea.trim()) {
      fetchDailyPractice(focusArea.trim());
    }
  };

  const dayConfig = dailyData ? DAY_COLORS[dailyData.day_of_week] || DAY_COLORS.Sunday : DAY_COLORS.Sunday;
  const DayIcon = dayConfig.icon;

  const PracticeCard = ({ practice, time, icon: Icon, label }) => {
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
              <img src={practice.image_url} alt={practice.name} className="w-20 h-20 rounded-xl object-cover" />
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
                {/* Deeper Teaching */}
                {practice.deeper_teaching && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-violet-400" /> Deeper Teaching
                    </h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{practice.deeper_teaching}</p>
                  </div>
                )}
                
                {/* Practice Guide */}
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

                {/* Shadow Work */}
                {(practice.shadow_work || practice.shadow_integration) && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Moon className="w-4 h-4 text-indigo-400" /> Shadow Work
                    </h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{practice.shadow_work || practice.shadow_integration}</p>
                  </div>
                )}

                {/* Benefits */}
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

                {/* Audio */}
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
              <h1 className="text-3xl sm:text-4xl font-serif">Daily Sacred Practice</h1>
              <p className="text-muted-foreground mt-1">Your personalized spiritual guidance for today</p>
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
            <form onSubmit={handleFocusSearch} className="flex gap-2">
              <input
                type="text"
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                placeholder="Focus area (e.g., heart, grounding, grief, sensuality...)"
                className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
              <Button type="submit" variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-1" /> Refresh
              </Button>
            </form>

            {/* Morning Practice */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sunrise className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-serif">Morning Practice</h2>
              </div>
              <PracticeCard 
                practice={dailyData.morning_practice} 
                time="morning" 
                icon={Sunrise}
                label="Morning Awakening"
              />
            </div>

            {/* Evening Practice */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sunset className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-serif">Evening Practice</h2>
              </div>
              <PracticeCard 
                practice={dailyData.evening_practice} 
                time="evening" 
                icon={Sunset}
                label="Evening Integration"
              />
            </div>

            {/* Reflection Prompts */}
            {dailyData.reflection_prompts && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
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
