import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, BookOpen, Plus, Calendar, Moon, Flame, Heart, 
  Sparkles, Clock, Trash2, Edit3, TrendingUp, Star,
  ChevronDown, ChevronUp, Search, X, Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

// Design system colors
const colors = {
  background: "#FDFBF7",
  surface: "#FFFFFF",
  primary: "#A96F6A",
  primaryHover: "#8A5652",
  secondary: "#E8D8CE",
  accent: "#D4AF37",
  textMain: "#3D2E2B",
  textMuted: "#7A706D",
  border: "#EAE1D9",
  success: "#6B8E73",
};

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

const MOODS = [
  { emoji: "😔", label: "Heavy", value: 1 },
  { emoji: "😐", label: "Neutral", value: 2 },
  { emoji: "🙂", label: "Calm", value: 3 },
  { emoji: "😊", label: "Peaceful", value: 4 },
  { emoji: "✨", label: "Radiant", value: 5 },
];

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

const PRACTICE_COLORS = {
  chakra: { bg: `${colors.primary}15`, text: colors.primary, border: `${colors.primary}30` },
  feminine: { bg: "#F9E4E4", text: "#C97B84", border: "#C97B8430" },
  masculine: { bg: `${colors.accent}15`, text: colors.accent, border: `${colors.accent}30` },
  energy: { bg: "#E8F4F0", text: colors.success, border: `${colors.success}30` },
  somatic: { bg: "#E8F0F4", text: "#5B8A9A", border: "#5B8A9A30" },
  movement: { bg: "#FFF4E8", text: "#C4956A", border: "#C4956A30" },
  default: { bg: colors.secondary, text: colors.textMain, border: colors.border },
};

const STORAGE_KEY = "shamanic_journal_entries";
const getEntries = () => { try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : []; } catch { return []; } };
const saveEntries = (entries) => localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));

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

  const [formData, setFormData] = useState({
    practice_name: "", practice_type: "chakra", mood_before: 3, mood_after: 4,
    duration_minutes: 15, body_sensations: "", spiritual_downloads: "",
    intentions: "", key_insights: "", reflection: "",
  });

  useEffect(() => { setEntries(getEntries()); setCurrentPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]); }, []);

  const calculateStreak = () => {
    if (!entries.length) return 0;
    const sortedDates = [...new Set(entries.map(e => new Date(e.created_at).toDateString()))].sort((a, b) => new Date(b) - new Date(a));
    let streak = 0, checkDate = new Date(); checkDate.setHours(0, 0, 0, 0);
    for (const dateStr of sortedDates) {
      const entryDate = new Date(dateStr); entryDate.setHours(0, 0, 0, 0);
      if (Math.floor((checkDate - entryDate) / 86400000) <= 1) { streak++; checkDate = entryDate; } else break;
    }
    return streak;
  };

  const handleSubmit = () => {
    if (!formData.practice_name.trim()) { toast.error("Please enter a practice name"); return; }
    const moon = getMoonPhase();
    const entry = { id: editingEntry?.id || `journal_${Date.now()}`, ...formData, moon_phase: moon.phase, moon_emoji: moon.emoji, created_at: editingEntry?.created_at || new Date().toISOString(), updated_at: new Date().toISOString() };
    const newEntries = editingEntry ? entries.map(e => e.id === editingEntry.id ? entry : e) : [entry, ...entries];
    setEntries(newEntries); saveEntries(newEntries); resetForm();
    toast.success(editingEntry ? "Entry updated" : "Entry saved");
  };

  const handleDelete = (id) => { const newEntries = entries.filter(e => e.id !== id); setEntries(newEntries); saveEntries(newEntries); toast.success("Entry deleted"); };
  const resetForm = () => { setFormData({ practice_name: "", practice_type: "chakra", mood_before: 3, mood_after: 4, duration_minutes: 15, body_sensations: "", spiritual_downloads: "", intentions: "", key_insights: "", reflection: "" }); setShowForm(false); setEditingEntry(null); setCurrentPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]); };
  const startEdit = (entry) => { setFormData({ practice_name: entry.practice_name, practice_type: entry.practice_type, mood_before: entry.mood_before, mood_after: entry.mood_after, duration_minutes: entry.duration_minutes, body_sensations: entry.body_sensations || "", spiritual_downloads: entry.spiritual_downloads || "", intentions: entry.intentions || "", key_insights: entry.key_insights || "", reflection: entry.reflection || "" }); setEditingEntry(entry); setShowForm(true); };

  const handleShareToCommunity = async (entry) => {
    if (!api) { toast.error("Please log in to share"); return; }
    if (!entry.reflection && !entry.spiritual_downloads && !entry.key_insights) { toast.error("Add a reflection first"); return; }
    setSharingId(entry.id);
    try {
      const content = [entry.reflection && `**Reflection:** ${entry.reflection}`, entry.spiritual_downloads && `**Spiritual Downloads:** ${entry.spiritual_downloads}`, entry.key_insights && `**Key Insights:** ${entry.key_insights}`].filter(Boolean).join("\n\n");
      await api.post("/community/posts", { title: `${entry.practice_name} — Journey Reflection`, content, author: user?.name || user?.email || "Sacred Traveller", type: "reflection", practice_type: entry.practice_type, moon_phase: entry.moon_phase, mood: MOODS.find(m => m.value === entry.mood_after)?.label || "" });
      toast.success("Shared to Sacred Circle!", { action: { label: "View", onClick: () => navigate("/community") } });
    } catch { toast.error("Could not share"); } finally { setSharingId(null); }
  };

  const getStreakMilestone = (streak) => {
    if (streak >= 40) return { label: "Sacred 40", color: colors.accent };
    if (streak >= 21) return { label: "21-Day Initiation", color: colors.accent };
    if (streak >= 14) return { label: "Fortnight Keeper", color: colors.primary };
    if (streak >= 7) return { label: "7-Day Guardian", color: colors.success };
    if (streak >= 3) return { label: "3-Day Seeker", color: colors.success };
    return null;
  };

  const filteredEntries = entries.filter(entry => {
    const matchesType = filterType === "all" || entry.practice_type === filterType;
    const matchesSearch = !searchTerm || entry.practice_name.toLowerCase().includes(searchTerm.toLowerCase()) || entry.reflection?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const streak = calculateStreak();
  const milestone = getStreakMilestone(streak);
  const totalEntries = entries.length;
  const thisWeek = entries.filter(e => { const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7); return new Date(e.created_at) > weekAgo; }).length;
  const getColors = (type) => PRACTICE_COLORS[type] || PRACTICE_COLORS.default;

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background, fontFamily: "'Inter', sans-serif" }} data-testid="practice-journal-page">
      {/* Hero Header */}
      <header className="relative overflow-hidden" style={{ background: `linear-gradient(180deg, ${colors.secondary}60 0%, ${colors.background} 100%)` }}>
        <div className="max-w-5xl mx-auto px-6 md:px-12 py-8 md:py-12">
          <button onClick={() => navigate("/menu")} className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full transition-all duration-300 hover:scale-105" style={{ color: colors.textMuted, backgroundColor: `${colors.surface}90`, backdropFilter: "blur(8px)" }} data-testid="back-btn">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] mb-3" style={{ color: colors.primary, fontWeight: 600 }}>Sacred Reflections</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl tracking-tight leading-tight mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, color: colors.textMain }}>
                Practice Journal
              </h1>
              <p className="text-base md:text-lg leading-relaxed max-w-lg" style={{ color: colors.textMuted }}>
                Track your sacred journey. Honour each practice with reflection and intention.
              </p>
            </div>
            
            <Button onClick={() => setShowForm(true)} className="px-6 py-3 rounded-full font-medium shadow-sm transition-all duration-300 hover:scale-105" style={{ backgroundColor: colors.primary, color: "white" }} data-testid="new-entry-btn">
              <Plus className="w-4 h-4 mr-2" /> New Entry
            </Button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="p-5 rounded-2xl" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4" style={{ color: colors.accent }} />
                <span className="text-xs uppercase tracking-wider" style={{ color: colors.textMuted }}>Streak</span>
              </div>
              <p className="text-3xl font-medium" style={{ fontFamily: "'Playfair Display', serif", color: colors.textMain }}>{streak}</p>
              {milestone && <p className="text-xs mt-1 font-medium" style={{ color: milestone.color }}>{milestone.label}</p>}
            </div>
            <div className="p-5 rounded-2xl" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4" style={{ color: colors.primary }} />
                <span className="text-xs uppercase tracking-wider" style={{ color: colors.textMuted }}>Total</span>
              </div>
              <p className="text-3xl font-medium" style={{ fontFamily: "'Playfair Display', serif", color: colors.textMain }}>{totalEntries}</p>
            </div>
            <div className="p-5 rounded-2xl" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4" style={{ color: colors.success }} />
                <span className="text-xs uppercase tracking-wider" style={{ color: colors.textMuted }}>This Week</span>
              </div>
              <p className="text-3xl font-medium" style={{ fontFamily: "'Playfair Display', serif", color: colors.textMain }}>{thisWeek}</p>
            </div>
          </div>

          {/* Moon Phase */}
          <div className="mt-6 flex items-center gap-2 text-sm" style={{ color: colors.textMuted }}>
            <Moon className="w-4 h-4" style={{ color: colors.primary }} />
            <span>Current Moon: {getMoonPhase().emoji} {getMoonPhase().phase} — {getMoonPhase().energy} energy</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 md:px-12 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.textMuted }} />
            <input type="text" placeholder="Search entries..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-full text-sm focus:outline-none transition-all" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, color: colors.textMain }} data-testid="search-input" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "chakra", "feminine", "masculine", "energy", "somatic", "movement"].map(type => (
              <button key={type} onClick={() => setFilterType(type)} className="px-4 py-2 rounded-full text-sm capitalize transition-all duration-300" style={{ backgroundColor: filterType === type ? `${colors.primary}15` : colors.surface, color: filterType === type ? colors.primary : colors.textMuted, border: `1px solid ${filterType === type ? colors.primary : colors.border}` }} data-testid={`filter-${type}`}>
                {type === "all" ? "All" : type}
              </button>
            ))}
          </div>
        </div>

        {/* Entries List */}
        {filteredEntries.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: `${colors.textMuted}30` }} />
            <h2 className="text-2xl mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>{entries.length === 0 ? "Begin Your Journal" : "No Matching Entries"}</h2>
            <p className="max-w-md mx-auto mb-6" style={{ color: colors.textMuted }}>{entries.length === 0 ? "Record your experiences after each practice to track your spiritual growth." : "Try adjusting your filters."}</p>
            {entries.length === 0 && <Button onClick={() => setShowForm(true)} className="px-6 py-3 rounded-full" style={{ backgroundColor: colors.primary, color: "white" }}><Plus className="w-4 h-4 mr-2" /> Create First Entry</Button>}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry, index) => {
              const entryColors = getColors(entry.practice_type);
              const isExpanded = expandedEntry === entry.id;
              return (
                <motion.div key={entry.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }} className="rounded-2xl overflow-hidden" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }} data-testid={`journal-entry-${entry.id}`}>
                  <div className="p-5 cursor-pointer transition-colors" style={{ backgroundColor: isExpanded ? `${colors.secondary}30` : "transparent" }} onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: entryColors.bg, color: entryColors.text }}>{entry.practice_type}</span>
                          <span className="text-xs flex items-center gap-1" style={{ color: colors.textMuted }}><Calendar className="w-3 h-3" /> {new Date(entry.created_at).toLocaleDateString()}</span>
                          <span className="text-xs" style={{ color: colors.textMuted }}>{entry.moon_emoji} {entry.moon_phase}</span>
                          {entry.duration_minutes && <span className="text-xs flex items-center gap-1" style={{ color: colors.textMuted }}><Clock className="w-3 h-3" /> {entry.duration_minutes} min</span>}
                        </div>
                        <h3 className="text-lg" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>{entry.practice_name}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm" style={{ color: colors.textMuted }}>
                          <span>Mood: {MOODS.find(m => m.value === entry.mood_before)?.emoji} → {MOODS.find(m => m.value === entry.mood_after)?.emoji}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); startEdit(entry); }} className="p-2 rounded-lg transition-colors" style={{ color: colors.textMuted }} data-testid={`edit-${entry.id}`}><Edit3 className="w-4 h-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }} className="p-2 rounded-lg transition-colors hover:bg-red-50" style={{ color: "#DC2626" }} data-testid={`delete-${entry.id}`}><Trash2 className="w-4 h-4" /></button>
                        {isExpanded ? <ChevronUp className="w-5 h-5" style={{ color: colors.textMuted }} /> : <ChevronDown className="w-5 h-5" style={{ color: colors.textMuted }} />}
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden" style={{ borderTop: `1px solid ${colors.border}` }}>
                        <div className="p-5 space-y-4">
                          {entry.reflection && <div><h4 className="text-xs uppercase tracking-wider mb-2 flex items-center gap-1" style={{ color: colors.primary, fontWeight: 600 }}><Heart className="w-3 h-3" /> Reflection</h4><p className="text-sm whitespace-pre-line" style={{ color: colors.textMuted }}>{entry.reflection}</p></div>}
                          {entry.body_sensations && <div><h4 className="text-xs uppercase tracking-wider mb-2" style={{ color: colors.primary, fontWeight: 600 }}>Body Sensations</h4><p className="text-sm whitespace-pre-line" style={{ color: colors.textMuted }}>{entry.body_sensations}</p></div>}
                          {entry.spiritual_downloads && <div><h4 className="text-xs uppercase tracking-wider mb-2 flex items-center gap-1" style={{ color: colors.accent, fontWeight: 600 }}><Sparkles className="w-3 h-3" /> Spiritual Downloads</h4><p className="text-sm whitespace-pre-line" style={{ color: colors.textMuted }}>{entry.spiritual_downloads}</p></div>}
                          {entry.intentions && <div><h4 className="text-xs uppercase tracking-wider mb-2" style={{ color: colors.primary, fontWeight: 600 }}>Intentions</h4><p className="text-sm whitespace-pre-line" style={{ color: colors.textMuted }}>{entry.intentions}</p></div>}
                          {entry.key_insights && <div><h4 className="text-xs uppercase tracking-wider mb-2" style={{ color: colors.primary, fontWeight: 600 }}>Key Insights</h4><p className="text-sm whitespace-pre-line" style={{ color: colors.textMuted }}>{entry.key_insights}</p></div>}
                          <div className="pt-3" style={{ borderTop: `1px solid ${colors.border}` }}>
                            <Button size="sm" variant="outline" className="rounded-full" style={{ color: colors.primary, borderColor: `${colors.primary}40` }} onClick={(e) => { e.stopPropagation(); handleShareToCommunity(entry); }} disabled={sharingId === entry.id} data-testid={`share-entry-${entry.id}`}>
                              {sharingId === entry.id ? <span className="animate-pulse">Sharing...</span> : <><Users className="w-3 h-3 mr-1" /> Share to Sacred Circle</>}
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ backgroundColor: "rgba(61, 46, 43, 0.5)", backdropFilter: "blur(4px)" }} onClick={() => resetForm()}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl my-8" style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }} data-testid="journal-form-modal">
              <div className="sticky top-0 p-6 flex items-center justify-between" style={{ backgroundColor: colors.background, borderBottom: `1px solid ${colors.border}` }}>
                <h2 className="text-xl" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>{editingEntry ? "Edit Entry" : "New Journal Entry"}</h2>
                <button onClick={resetForm} className="p-2 rounded-full transition-colors" style={{ color: colors.textMuted }}><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 space-y-6" style={{ backgroundColor: colors.surface }}>
                {/* Prompt */}
                <div className="p-4 rounded-2xl" style={{ backgroundColor: `${colors.primary}08`, border: `1px solid ${colors.primary}20` }}>
                  <p className="text-sm italic" style={{ color: colors.primary }}>"{currentPrompt}"</p>
                  <button onClick={() => setCurrentPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)])} className="text-xs mt-2 underline" style={{ color: colors.primary }}>New prompt</button>
                </div>

                {/* Practice Name & Type */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textMain }}>Practice Name *</label>
                    <input type="text" value={formData.practice_name} onChange={(e) => setFormData({...formData, practice_name: e.target.value})} placeholder="e.g., Heart Chakra Cleansing" className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all" style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}`, color: colors.textMain }} data-testid="practice-name-input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textMain }}>Practice Type</label>
                    <select value={formData.practice_type} onChange={(e) => setFormData({...formData, practice_type: e.target.value})} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}`, color: colors.textMain }} data-testid="practice-type-select">
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
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textMain }}>Duration (minutes)</label>
                  <input type="number" value={formData.duration_minutes} onChange={(e) => setFormData({...formData, duration_minutes: parseInt(e.target.value) || 0})} min="1" max="180" className="w-24 px-4 py-3 rounded-xl text-sm focus:outline-none" style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}`, color: colors.textMain }} data-testid="duration-input" />
                </div>

                {/* Mood Before/After */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: colors.textMain }}>Mood Before</label>
                    <div className="flex gap-2">
                      {MOODS.map((mood) => (
                        <button key={mood.value} onClick={() => setFormData({...formData, mood_before: mood.value})} className="p-3 rounded-xl text-2xl transition-all" style={{ backgroundColor: formData.mood_before === mood.value ? `${colors.primary}20` : colors.background, border: `1px solid ${formData.mood_before === mood.value ? colors.primary : colors.border}`, transform: formData.mood_before === mood.value ? "scale(1.1)" : "scale(1)" }} title={mood.label} data-testid={`mood-before-${mood.value}`}>{mood.emoji}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: colors.textMain }}>Mood After</label>
                    <div className="flex gap-2">
                      {MOODS.map((mood) => (
                        <button key={mood.value} onClick={() => setFormData({...formData, mood_after: mood.value})} className="p-3 rounded-xl text-2xl transition-all" style={{ backgroundColor: formData.mood_after === mood.value ? `${colors.primary}20` : colors.background, border: `1px solid ${formData.mood_after === mood.value ? colors.primary : colors.border}`, transform: formData.mood_after === mood.value ? "scale(1.1)" : "scale(1)" }} title={mood.label} data-testid={`mood-after-${mood.value}`}>{mood.emoji}</button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Text areas */}
                <div><label className="block text-sm font-medium mb-2" style={{ color: colors.textMain }}>Body Sensations</label><textarea value={formData.body_sensations} onChange={(e) => setFormData({...formData, body_sensations: e.target.value})} placeholder="What did you feel in your body?" rows={2} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none resize-none" style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}`, color: colors.textMain }} data-testid="body-sensations-input" /></div>
                <div><label className="block text-sm font-medium mb-2 flex items-center gap-1" style={{ color: colors.textMain }}><Sparkles className="w-4 h-4" style={{ color: colors.accent }} /> Spiritual Downloads</label><textarea value={formData.spiritual_downloads} onChange={(e) => setFormData({...formData, spiritual_downloads: e.target.value})} placeholder="Any visions, messages, or downloads?" rows={2} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none resize-none" style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}`, color: colors.textMain }} data-testid="spiritual-downloads-input" /></div>
                <div><label className="block text-sm font-medium mb-2" style={{ color: colors.textMain }}>Intentions</label><textarea value={formData.intentions} onChange={(e) => setFormData({...formData, intentions: e.target.value})} placeholder="What intentions did you set?" rows={2} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none resize-none" style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}`, color: colors.textMain }} data-testid="intentions-input" /></div>
                <div><label className="block text-sm font-medium mb-2" style={{ color: colors.textMain }}>Key Insights</label><textarea value={formData.key_insights} onChange={(e) => setFormData({...formData, key_insights: e.target.value})} placeholder="What insights came through?" rows={2} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none resize-none" style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}`, color: colors.textMain }} data-testid="key-insights-input" /></div>
                <div><label className="block text-sm font-medium mb-2 flex items-center gap-1" style={{ color: colors.textMain }}><Heart className="w-4 h-4" style={{ color: colors.primary }} /> Reflection</label><textarea value={formData.reflection} onChange={(e) => setFormData({...formData, reflection: e.target.value})} placeholder="Your overall reflection..." rows={4} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none resize-none" style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}`, color: colors.textMain }} data-testid="reflection-input" /></div>

                {/* Moon Phase */}
                <div className="flex items-center gap-2 text-sm p-4 rounded-xl" style={{ backgroundColor: `${colors.secondary}30`, color: colors.textMuted }}>
                  <Moon className="w-4 h-4" style={{ color: colors.primary }} />
                  <span>This entry will be tagged with: {getMoonPhase().emoji} {getMoonPhase().phase}</span>
                </div>

                {/* Submit */}
                <div className="flex gap-3 justify-end">
                  <Button variant="ghost" onClick={resetForm} className="rounded-full px-6" style={{ color: colors.textMuted }}>Cancel</Button>
                  <Button onClick={handleSubmit} className="rounded-full px-8" style={{ backgroundColor: colors.primary, color: "white" }} data-testid="save-entry-btn">{editingEntry ? "Update Entry" : "Save Entry"}</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
