import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, BookOpen, Plus, Calendar, Moon, Flame, Heart, 
  Sparkles, Clock, Trash2, Edit3, Filter, TrendingUp, Star,
  ChevronDown, ChevronUp, Search, X, Share2, Users, Award
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

// Moon phase calculation
const getMoonPhase = (date = new Date()) => {
  const knownNewMoon = new Date(2024, 0, 11);
  const daysSince = Math.floor((date - knownNewMoon) / (1000 * 60 * 60 * 24));
  const moonAge = daysSince % 29.5;
  
  if (moonAge < 1.85) return { phase: "New Moon", emoji: "🌑", energy: "Introspective" };
  if (moonAge < 7.38) return { phase: "Waxing Crescent", emoji: "🌒", energy: "Building" };
  if (moonAge < 9.23) return { phase: "First Quarter", emoji: "🌓", energy: "Active" };
  if (moonAge < 14.77) return { phase: "Waxing Gibbous", emoji: "🌔", energy: "Refining" };
  if (moonAge < 16.61) return { phase: "Full Moon", emoji: "🌕", energy: "Peak" };
  if (moonAge < 22.15) return { phase: "Waning Gibbous", emoji: "🌖", energy: "Distributing" };
  if (moonAge < 23.99) return { phase: "Last Quarter", emoji: "🌗", energy: "Releasing" };
  return { phase: "Waning Crescent", emoji: "🌘", energy: "Surrendering" };
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
  "How does your body feel different now?",
  "What surprised you about this practice?",
  "What do you want to remember from this experience?",
  "What intention will you carry forward?",
  "What is your body telling you right now?",
];

// Practice type colors
const PRACTICE_COLORS = {
  chakra: { bg: "bg-violet-500/20", text: "text-violet-400", border: "border-violet-500/30" },
  feminine: { bg: "bg-rose-500/20", text: "text-rose-400", border: "border-rose-500/30" },
  masculine: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30" },
  energy: { bg: "bg-cyan-500/20", text: "text-cyan-400", border: "border-cyan-500/30" },
  somatic: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" },
  movement: { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30" },
  default: { bg: "bg-white/10", text: "text-white", border: "border-white/20" },
};

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

export default function PracticeJournal({ user, api }) {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedEntry, setExpandedEntry] = useState(null);
  const [currentPrompt, setCurrentPrompt] = useState(PROMPTS[0]);
  const [sharingId, setSharingId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    practice_name: "",
    practice_type: "chakra",
    mood_before: 3,
    mood_after: 4,
    duration_minutes: 15,
    body_sensations: "",
    spiritual_downloads: "",
    intentions: "",
    key_insights: "",
    reflection: "",
  });

  useEffect(() => {
    setEntries(getEntries());
    // Rotate prompts
    setCurrentPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  }, []);

  // Calculate streak
  const calculateStreak = () => {
    if (entries.length === 0) return 0;
    
    const sortedDates = [...new Set(entries.map(e => 
      new Date(e.created_at).toDateString()
    ))].sort((a, b) => new Date(b) - new Date(a));
    
    let streak = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);
    
    for (const dateStr of sortedDates) {
      const entryDate = new Date(dateStr);
      entryDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((checkDate - entryDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        streak++;
        checkDate = entryDate;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const handleSubmit = () => {
    if (!formData.practice_name.trim()) {
      toast.error("Please enter a practice name");
      return;
    }

    const moon = getMoonPhase();
    const entry = {
      id: editingEntry?.id || `journal_${Date.now()}`,
      ...formData,
      moon_phase: moon.phase,
      moon_emoji: moon.emoji,
      created_at: editingEntry?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let newEntries;
    if (editingEntry) {
      newEntries = entries.map(e => e.id === editingEntry.id ? entry : e);
      toast.success("Journal entry updated");
    } else {
      newEntries = [entry, ...entries];
      toast.success("Journal entry saved");
    }

    setEntries(newEntries);
    saveEntries(newEntries);
    resetForm();
  };

  const handleDelete = (id) => {
    const newEntries = entries.filter(e => e.id !== id);
    setEntries(newEntries);
    saveEntries(newEntries);
    toast.success("Entry deleted");
  };

  const resetForm = () => {
    setFormData({
      practice_name: "",
      practice_type: "chakra",
      mood_before: 3,
      mood_after: 4,
      duration_minutes: 15,
      body_sensations: "",
      spiritual_downloads: "",
      intentions: "",
      key_insights: "",
      reflection: "",
    });
    setShowForm(false);
    setEditingEntry(null);
    setCurrentPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  };

  const startEdit = (entry) => {
    setFormData({
      practice_name: entry.practice_name,
      practice_type: entry.practice_type,
      mood_before: entry.mood_before,
      mood_after: entry.mood_after,
      duration_minutes: entry.duration_minutes,
      body_sensations: entry.body_sensations || "",
      spiritual_downloads: entry.spiritual_downloads || "",
      intentions: entry.intentions || "",
      key_insights: entry.key_insights || "",
      reflection: entry.reflection || "",
    });
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleShareToCommunity = async (entry) => {
    if (!api) { toast.error("Please log in to share to the community"); return; }
    if (!entry.reflection && !entry.spiritual_downloads && !entry.key_insights) {
      toast.error("Add a reflection first before sharing to community");
      return;
    }
    setSharingId(entry.id);
    try {
      const content = [
        entry.reflection && `**Reflection:** ${entry.reflection}`,
        entry.spiritual_downloads && `**Spiritual Downloads:** ${entry.spiritual_downloads}`,
        entry.key_insights && `**Key Insights:** ${entry.key_insights}`,
      ].filter(Boolean).join("\n\n");

      await api.post("/community/posts", {
        title: `${entry.practice_name} — Journey Reflection`,
        content,
        author: user?.name || user?.email || "Sacred Traveller",
        type: "reflection",
        practice_type: entry.practice_type,
        moon_phase: entry.moon_phase,
        mood: MOODS.find(m => m.value === entry.mood_after)?.label || "",
      });
      toast.success("Reflection shared to Sacred Circle!", {
        action: { label: "View Community", onClick: () => navigate("/community") }
      });
    } catch (err) {
      console.error("Share failed:", err);
      toast.error("Could not share to community");
    } finally {
      setSharingId(null);
    }
  };

  const getStreakMilestone = (streak) => {
    if (streak >= 40) return { label: "Sacred 40", color: "text-yellow-400", icon: "✦" };
    if (streak >= 21) return { label: "21-Day Initiation", color: "text-amber-400", icon: "✦" };
    if (streak >= 14) return { label: "Fortnight Keeper", color: "text-orange-400", icon: "✦" };
    if (streak >= 7) return { label: "7-Day Guardian", color: "text-emerald-400", icon: "✦" };
    if (streak >= 3) return { label: "3-Day Seeker", color: "text-teal-400", icon: "✦" };
    return null;
  };

  // Filter entries
  const filteredEntries = entries.filter(entry => {
    const matchesType = filterType === "all" || entry.practice_type === filterType;
    const matchesSearch = !searchTerm || 
      entry.practice_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.reflection?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const streak = calculateStreak();
  const milestone = getStreakMilestone(streak);
  const totalEntries = entries.length;
  const thisWeek = entries.filter(e => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(e.created_at) > weekAgo;
  }).length;

  const getColors = (type) => PRACTICE_COLORS[type] || PRACTICE_COLORS.default;

  return (
    <div className="min-h-screen bg-background" data-testid="practice-journal-page">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-emerald-950/30 to-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/menu")} className="mb-4 text-muted-foreground" data-testid="back-btn">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Menu
          </Button>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                <BookOpen className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-serif">Practice Journal</h1>
                <p className="text-muted-foreground mt-1">Track your sacred journey</p>
              </div>
            </div>
            
            <Button 
              onClick={() => setShowForm(true)} 
              className="bg-emerald-600 hover:bg-emerald-700"
              data-testid="new-entry-btn"
            >
              <Plus className="w-4 h-4 mr-2" /> New Entry
            </Button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <Flame className="w-4 h-4" />
                <span className="text-sm">Streak</span>
              </div>
              <p className="text-2xl font-bold">{streak} {streak === 1 ? 'day' : 'days'}</p>
              {milestone && (
                <p className={`text-xs mt-1 ${milestone.color} font-medium`}>{milestone.icon} {milestone.label}</p>
              )}
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-violet-400 mb-1">
                <Star className="w-4 h-4" />
                <span className="text-sm">Total</span>
              </div>
              <p className="text-2xl font-bold">{totalEntries}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">This Week</span>
              </div>
              <p className="text-2xl font-bold">{thisWeek}</p>
            </div>
          </div>

          {/* Current Moon Phase */}
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Moon className="w-4 h-4" />
            <span>Current Moon: {getMoonPhase().emoji} {getMoonPhase().phase} - {getMoonPhase().energy} energy</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-emerald-500/50"
              data-testid="search-input"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {["all", "chakra", "feminine", "masculine", "energy", "somatic", "movement"].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-2 rounded-lg text-sm capitalize transition-all ${
                  filterType === type 
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" 
                    : "bg-white/5 text-muted-foreground hover:bg-white/10"
                }`}
                data-testid={`filter-${type}`}
              >
                {type === "all" ? "All" : type}
              </button>
            ))}
          </div>
        </div>

        {/* Entries List */}
        {filteredEntries.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h2 className="text-2xl font-serif mb-2">
              {entries.length === 0 ? "Begin Your Journal" : "No Matching Entries"}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              {entries.length === 0 
                ? "Record your experiences after each practice to track your spiritual growth and insights."
                : "Try adjusting your filters or search term."}
            </p>
            {entries.length === 0 && (
              <Button onClick={() => setShowForm(true)} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" /> Create First Entry
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry, index) => {
              const colors = getColors(entry.practice_type);
              const isExpanded = expandedEntry === entry.id;
              
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`rounded-xl border ${colors.border} bg-white/[0.02] overflow-hidden`}
                  data-testid={`journal-entry-${entry.id}`}
                >
                  {/* Entry Header */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${colors.bg} ${colors.text}`}>
                            {entry.practice_type}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(entry.created_at).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {entry.moon_emoji} {entry.moon_phase}
                          </span>
                          {entry.duration_minutes && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {entry.duration_minutes} min
                            </span>
                          )}
                        </div>
                        <h3 className="font-serif text-lg">{entry.practice_name}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span>Mood: {MOODS.find(m => m.value === entry.mood_before)?.emoji} → {MOODS.find(m => m.value === entry.mood_after)?.emoji}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); startEdit(entry); }}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          data-testid={`edit-${entry.id}`}
                        >
                          <Edit3 className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                          data-testid={`delete-${entry.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/10"
                      >
                        <div className="p-4 space-y-4">
                          {entry.reflection && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                                <Heart className="w-3 h-3" /> Reflection
                              </h4>
                              <p className="text-sm whitespace-pre-line">{entry.reflection}</p>
                            </div>
                          )}
                          
                          {entry.body_sensations && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">Body Sensations</h4>
                              <p className="text-sm whitespace-pre-line">{entry.body_sensations}</p>
                            </div>
                          )}
                          
                          {entry.spiritual_downloads && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Spiritual Downloads
                              </h4>
                              <p className="text-sm whitespace-pre-line">{entry.spiritual_downloads}</p>
                            </div>
                          )}
                          
                          {entry.intentions && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">Intentions</h4>
                              <p className="text-sm whitespace-pre-line">{entry.intentions}</p>
                            </div>
                          )}
                          
                          {entry.key_insights && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">Key Insights</h4>
                              <p className="text-sm whitespace-pre-line">{entry.key_insights}</p>
                            </div>
                          )}

                          {/* Share to Community */}
                          <div className="pt-2 border-t border-white/10">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                              onClick={(e) => { e.stopPropagation(); handleShareToCommunity(entry); }}
                              disabled={sharingId === entry.id}
                              data-testid={`share-entry-${entry.id}`}
                            >
                              {sharingId === entry.id ? (
                                <span className="animate-pulse">Sharing...</span>
                              ) : (
                                <>
                                  <Users className="w-3 h-3 mr-1" />
                                  Share to Sacred Circle
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Entry Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => resetForm()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-white/10"
              data-testid="journal-form-modal"
            >
              <div className="sticky top-0 bg-card border-b border-white/10 p-4 flex items-center justify-between">
                <h2 className="text-xl font-serif">
                  {editingEntry ? "Edit Journal Entry" : "New Journal Entry"}
                </h2>
                <button onClick={resetForm} className="p-2 hover:bg-white/10 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Prompt */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                  <p className="text-sm text-emerald-300 italic">"{currentPrompt}"</p>
                  <button 
                    onClick={() => setCurrentPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)])}
                    className="text-xs text-emerald-400 mt-2 hover:underline"
                  >
                    New prompt
                  </button>
                </div>

                {/* Practice Name & Type */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Practice Name *</label>
                    <input
                      type="text"
                      value={formData.practice_name}
                      onChange={(e) => setFormData({...formData, practice_name: e.target.value})}
                      placeholder="e.g., Heart Chakra Cleansing"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500/50"
                      data-testid="practice-name-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Practice Type</label>
                    <select
                      value={formData.practice_type}
                      onChange={(e) => setFormData({...formData, practice_type: e.target.value})}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500/50"
                      data-testid="practice-type-select"
                    >
                      <option value="chakra">Chakra</option>
                      <option value="feminine">Feminine Embodiment</option>
                      <option value="masculine">Masculine Embodiment</option>
                      <option value="energy">Energy Healing</option>
                      <option value="somatic">Somatic Yoga</option>
                      <option value="movement">Free Form Movement</option>
                    </select>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({...formData, duration_minutes: parseInt(e.target.value) || 0})}
                    min="1"
                    max="180"
                    className="w-24 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500/50"
                    data-testid="duration-input"
                  />
                </div>

                {/* Mood Before/After */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-3">Mood Before</label>
                    <div className="flex gap-2">
                      {MOODS.map((mood) => (
                        <button
                          key={mood.value}
                          onClick={() => setFormData({...formData, mood_before: mood.value})}
                          className={`p-3 rounded-lg text-2xl transition-all ${
                            formData.mood_before === mood.value 
                              ? "bg-emerald-500/20 scale-110" 
                              : "bg-white/5 hover:bg-white/10"
                          }`}
                          title={mood.label}
                          data-testid={`mood-before-${mood.value}`}
                        >
                          {mood.emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-3">Mood After</label>
                    <div className="flex gap-2">
                      {MOODS.map((mood) => (
                        <button
                          key={mood.value}
                          onClick={() => setFormData({...formData, mood_after: mood.value})}
                          className={`p-3 rounded-lg text-2xl transition-all ${
                            formData.mood_after === mood.value 
                              ? "bg-emerald-500/20 scale-110" 
                              : "bg-white/5 hover:bg-white/10"
                          }`}
                          title={mood.label}
                          data-testid={`mood-after-${mood.value}`}
                        >
                          {mood.emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Body Sensations */}
                <div>
                  <label className="block text-sm font-medium mb-2">Body Sensations</label>
                  <textarea
                    value={formData.body_sensations}
                    onChange={(e) => setFormData({...formData, body_sensations: e.target.value})}
                    placeholder="What did you feel in your body? Any areas of tension, warmth, tingling, release..."
                    rows={2}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500/50 resize-none"
                    data-testid="body-sensations-input"
                  />
                </div>

                {/* Spiritual Downloads */}
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-violet-400" /> Spiritual Downloads
                  </label>
                  <textarea
                    value={formData.spiritual_downloads}
                    onChange={(e) => setFormData({...formData, spiritual_downloads: e.target.value})}
                    placeholder="Any visions, messages, symbols, or downloads you received..."
                    rows={2}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500/50 resize-none"
                    data-testid="spiritual-downloads-input"
                  />
                </div>

                {/* Intentions */}
                <div>
                  <label className="block text-sm font-medium mb-2">Intentions</label>
                  <textarea
                    value={formData.intentions}
                    onChange={(e) => setFormData({...formData, intentions: e.target.value})}
                    placeholder="What intentions did you set? What are you calling in?"
                    rows={2}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500/50 resize-none"
                    data-testid="intentions-input"
                  />
                </div>

                {/* Key Insights */}
                <div>
                  <label className="block text-sm font-medium mb-2">Key Insights</label>
                  <textarea
                    value={formData.key_insights}
                    onChange={(e) => setFormData({...formData, key_insights: e.target.value})}
                    placeholder="What insights or realizations came through?"
                    rows={2}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500/50 resize-none"
                    data-testid="key-insights-input"
                  />
                </div>

                {/* Main Reflection */}
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                    <Heart className="w-4 h-4 text-rose-400" /> Reflection
                  </label>
                  <textarea
                    value={formData.reflection}
                    onChange={(e) => setFormData({...formData, reflection: e.target.value})}
                    placeholder="Your overall reflection on this practice..."
                    rows={4}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500/50 resize-none"
                    data-testid="reflection-input"
                  />
                </div>

                {/* Moon Phase Info */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white/5 rounded-lg p-3">
                  <Moon className="w-4 h-4" />
                  <span>This entry will be tagged with: {getMoonPhase().emoji} {getMoonPhase().phase}</span>
                </div>

                {/* Submit */}
                <div className="flex gap-3 justify-end">
                  <Button variant="ghost" onClick={resetForm}>Cancel</Button>
                  <Button 
                    onClick={handleSubmit}
                    className="bg-emerald-600 hover:bg-emerald-700"
                    data-testid="save-entry-btn"
                  >
                    {editingEntry ? "Update Entry" : "Save Entry"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
