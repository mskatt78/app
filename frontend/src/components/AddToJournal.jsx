import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, X, Moon, Heart, Sparkles, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

// Moon phase calculation
const getMoonPhase = (date = new Date()) => {
  const knownNewMoon = new Date(2024, 0, 11);
  const daysSince = Math.floor((date - knownNewMoon) / (1000 * 60 * 60 * 24));
  const moonAge = daysSince % 29.5;
  
  if (moonAge < 1.85) return { phase: "New Moon", emoji: "🌑" };
  if (moonAge < 7.38) return { phase: "Waxing Crescent", emoji: "🌒" };
  if (moonAge < 9.23) return { phase: "First Quarter", emoji: "🌓" };
  if (moonAge < 14.77) return { phase: "Waxing Gibbous", emoji: "🌔" };
  if (moonAge < 16.61) return { phase: "Full Moon", emoji: "🌕" };
  if (moonAge < 22.15) return { phase: "Waning Gibbous", emoji: "🌖" };
  if (moonAge < 23.99) return { phase: "Last Quarter", emoji: "🌗" };
  return { phase: "Waning Crescent", emoji: "🌘" };
};

// Mood options
const MOODS = [
  { emoji: "😔", label: "Heavy", value: 1 },
  { emoji: "😐", label: "Neutral", value: 2 },
  { emoji: "🙂", label: "Calm", value: 3 },
  { emoji: "😊", label: "Peaceful", value: 4 },
  { emoji: "✨", label: "Radiant", value: 5 },
];

// Reflection prompts
const PROMPTS = [
  "What sensations arose in your body during this practice?",
  "What emotions moved through you?",
  "Did any insights or messages come to you?",
  "What are you ready to release?",
  "What are you calling in?",
];

// Local storage helpers
const STORAGE_KEY = "shamanic_journal_entries";

const getEntries = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveEntries = (entries) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

/**
 * AddToJournal - A button + modal component to add journal entries after practices
 * 
 * @param {string} practiceName - Name of the practice (e.g., "Heart Chakra Cleansing")
 * @param {string} practiceType - Type: "chakra", "feminine", "masculine", "energy", "somatic", "movement"
 * @param {number} duration - Duration in minutes (optional)
 * @param {string} buttonVariant - Button style: "default", "ghost", "outline"
 * @param {string} buttonSize - Button size: "sm", "default", "lg"
 */
export default function AddToJournal({ 
  practiceName = "", 
  practiceType = "chakra",
  duration = 15,
  buttonVariant = "ghost",
  buttonSize = "sm"
}) {
  const [showModal, setShowModal] = useState(false);
  const [currentPrompt] = useState(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  
  const [formData, setFormData] = useState({
    mood_before: 3,
    mood_after: 4,
    duration_minutes: duration,
    body_sensations: "",
    spiritual_downloads: "",
    intentions: "",
    key_insights: "",
    reflection: "",
  });

  const handleSubmit = () => {
    const moon = getMoonPhase();
    const entries = getEntries();
    
    const entry = {
      id: `journal_${Date.now()}`,
      practice_name: practiceName,
      practice_type: practiceType,
      ...formData,
      moon_phase: moon.phase,
      moon_emoji: moon.emoji,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    saveEntries([entry, ...entries]);
    toast.success("Journal entry saved!", {
      description: "View your entries in the Practice Journal"
    });
    setShowModal(false);
    
    // Reset form
    setFormData({
      mood_before: 3,
      mood_after: 4,
      duration_minutes: duration,
      body_sensations: "",
      spiritual_downloads: "",
      intentions: "",
      key_insights: "",
      reflection: "",
    });
  };

  return (
    <>
      <Button
        variant={buttonVariant}
        size={buttonSize}
        onClick={() => setShowModal(true)}
        className="gap-2"
        data-testid="add-to-journal-btn"
      >
        <BookOpen className="w-4 h-4" />
        <span className="hidden sm:inline">Journal This</span>
        <span className="sm:hidden">Journal</span>
      </Button>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-card border border-white/10"
              data-testid="quick-journal-modal"
            >
              <div className="sticky top-0 bg-card border-b border-white/10 p-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-serif">Journal Entry</h2>
                  <p className="text-sm text-muted-foreground">{practiceName}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* Prompt */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-sm text-emerald-300 italic">
                  "{currentPrompt}"
                </div>

                {/* Duration */}
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({...formData, duration_minutes: parseInt(e.target.value) || 0})}
                    min="1"
                    max="180"
                    className="w-20 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                  <span className="text-sm text-muted-foreground">minutes</span>
                </div>

                {/* Mood Before/After */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-2 text-muted-foreground">Mood Before</label>
                    <div className="flex gap-1">
                      {MOODS.map((mood) => (
                        <button
                          key={mood.value}
                          onClick={() => setFormData({...formData, mood_before: mood.value})}
                          className={`p-2 rounded-lg text-lg transition-all ${
                            formData.mood_before === mood.value 
                              ? "bg-emerald-500/20 scale-110" 
                              : "bg-white/5 hover:bg-white/10"
                          }`}
                          title={mood.label}
                        >
                          {mood.emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-2 text-muted-foreground">Mood After</label>
                    <div className="flex gap-1">
                      {MOODS.map((mood) => (
                        <button
                          key={mood.value}
                          onClick={() => setFormData({...formData, mood_after: mood.value})}
                          className={`p-2 rounded-lg text-lg transition-all ${
                            formData.mood_after === mood.value 
                              ? "bg-emerald-500/20 scale-110" 
                              : "bg-white/5 hover:bg-white/10"
                          }`}
                          title={mood.label}
                        >
                          {mood.emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Body Sensations */}
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Body Sensations</label>
                  <textarea
                    value={formData.body_sensations}
                    onChange={(e) => setFormData({...formData, body_sensations: e.target.value})}
                    placeholder="Tension, warmth, tingling, release..."
                    rows={2}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-emerald-500/50 resize-none"
                  />
                </div>

                {/* Spiritual Downloads */}
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-muted-foreground flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-violet-400" /> Spiritual Downloads
                  </label>
                  <textarea
                    value={formData.spiritual_downloads}
                    onChange={(e) => setFormData({...formData, spiritual_downloads: e.target.value})}
                    placeholder="Visions, messages, symbols..."
                    rows={2}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-emerald-500/50 resize-none"
                  />
                </div>

                {/* Key Insights */}
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Key Insights</label>
                  <textarea
                    value={formData.key_insights}
                    onChange={(e) => setFormData({...formData, key_insights: e.target.value})}
                    placeholder="What realizations came through?"
                    rows={2}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-emerald-500/50 resize-none"
                  />
                </div>

                {/* Main Reflection */}
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-muted-foreground flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-400" /> Reflection
                  </label>
                  <textarea
                    value={formData.reflection}
                    onChange={(e) => setFormData({...formData, reflection: e.target.value})}
                    placeholder="Your overall experience..."
                    rows={3}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-emerald-500/50 resize-none"
                  />
                </div>

                {/* Moon Phase */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Moon className="w-3 h-3" />
                  <span>Tagged: {getMoonPhase().emoji} {getMoonPhase().phase}</span>
                </div>

                {/* Submit */}
                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button 
                    onClick={handleSubmit}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    data-testid="save-quick-journal-btn"
                  >
                    Save Entry
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
