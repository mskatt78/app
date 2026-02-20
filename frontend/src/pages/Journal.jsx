import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, BookOpen, Plus, Trash2, Calendar, Tag, 
  Smile, Zap, Heart, Brain, Mountain, ChevronRight
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";

const Journal = ({ user, api }) => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [filterMood, setFilterMood] = useState("all");

  const [newEntry, setNewEntry] = useState({
    title: "",
    content: "",
    mood: "",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");

  const moods = [
    { value: "peaceful", label: "Peaceful", icon: Smile, color: "text-blue-400" },
    { value: "energized", label: "Energized", icon: Zap, color: "text-orange-400" },
    { value: "grateful", label: "Grateful", icon: Heart, color: "text-pink-400" },
    { value: "reflective", label: "Reflective", icon: Brain, color: "text-purple-400" },
    { value: "challenged", label: "Challenged", icon: Mountain, color: "text-emerald-400" },
  ];

  useEffect(() => {
    fetchEntries();
  }, [filterMood]);

  const fetchEntries = async () => {
    try {
      const params = filterMood !== "all" ? `?mood=${filterMood}` : "";
      const response = await api.get(`/journal${params}`);
      setEntries(response.data);
    } catch (error) {
      console.error("Failed to fetch entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const createEntry = async () => {
    if (!newEntry.content.trim()) {
      toast.error("Please write something in your journal");
      return;
    }

    try {
      const response = await api.post("/journal", {
        ...newEntry,
        tags: newEntry.tags.length > 0 ? newEntry.tags : null,
        mood: newEntry.mood || null,
      });
      
      setEntries(prev => [response.data, ...prev]);
      setNewEntry({ title: "", content: "", mood: "", tags: [] });
      setCreating(false);
      toast.success("Journal entry saved");
    } catch (error) {
      console.error("Failed to create entry:", error);
      toast.error("Could not save entry");
    }
  };

  const deleteEntry = async (entryId) => {
    try {
      await api.delete(`/journal/${entryId}`);
      setEntries(prev => prev.filter(e => e.entry_id !== entryId));
      setSelectedEntry(null);
      toast.success("Entry deleted");
    } catch (error) {
      console.error("Failed to delete entry:", error);
      toast.error("Could not delete entry");
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !newEntry.tags.includes(tagInput.trim())) {
      setNewEntry(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput("");
    }
  };

  const removeTag = (tag) => {
    setNewEntry(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const getMoodIcon = (mood) => {
    const moodData = moods.find(m => m.value === mood);
    if (!moodData) return null;
    const Icon = moodData.icon;
    return <Icon className={`w-4 h-4 ${moodData.color}`} />;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background" data-testid="journal-page">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              data-testid="back-btn"
              onClick={() => navigate("/dashboard")}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Reflections</p>
              <h1 className="text-xl font-serif">Sacred <span className="italic text-primary">Journal</span></h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Select value={filterMood} onValueChange={setFilterMood}>
              <SelectTrigger className="w-36 bg-card border-white/10">
                <SelectValue placeholder="Filter mood" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Moods</SelectItem>
                {moods.map((mood) => (
                  <SelectItem key={mood.value} value={mood.value}>
                    {mood.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              onClick={() => setCreating(true)}
              className="bg-primary text-primary-foreground"
              data-testid="new-entry-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Entry
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 && !creating ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-serif mb-2">Begin Your Journal</h2>
            <p className="text-muted-foreground mb-6">
              Record your spiritual journey, reflections, and insights
            </p>
            <Button onClick={() => setCreating(true)} className="bg-primary">
              <Plus className="w-4 h-4 mr-2" />
              Write First Entry
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Entries List */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {entries.map((entry, index) => (
                  <motion.div
                    key={entry.entry_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.03 }}
                    className="p-6 rounded-2xl bg-card/50 border border-white/5 cursor-pointer
                              hover:border-primary/20 transition-all group"
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(entry.created_at)}</span>
                      </div>
                      {entry.mood && getMoodIcon(entry.mood)}
                    </div>
                    
                    {entry.title && (
                      <h3 className="text-xl font-serif mb-2 group-hover:text-primary transition-colors">
                        {entry.title}
                      </h3>
                    )}
                    
                    <p className="text-muted-foreground line-clamp-3 mb-4">
                      {entry.content}
                    </p>
                    
                    {entry.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {entry.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 rounded-full bg-white/5 text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <ChevronRight className="w-5 h-5 text-muted-foreground absolute right-4 top-1/2 -translate-y-1/2
                                            opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats */}
              <div className="p-6 rounded-2xl bg-card/50 border border-white/5">
                <h3 className="text-lg font-serif mb-4">Journal Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Entries</span>
                    <span className="text-primary font-medium">{entries.length}</span>
                  </div>
                  {moods.map((mood) => {
                    const count = entries.filter(e => e.mood === mood.value).length;
                    if (count === 0) return null;
                    return (
                      <div key={mood.value} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getMoodIcon(mood.value)}
                          <span className="text-muted-foreground text-sm">{mood.label}</span>
                        </div>
                        <span className="text-sm">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Prompts */}
              <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20">
                <h3 className="text-lg font-serif mb-4 text-primary">Reflection Prompts</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li>• What am I grateful for today?</li>
                  <li>• How did my practice make me feel?</li>
                  <li>• What insights arose during meditation?</li>
                  <li>• What element resonates with me now?</li>
                  <li>• What do I need to release?</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Create Entry Dialog */}
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="bg-card border-white/10 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">New Journal Entry</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Title (optional)</label>
              <Input
                value={newEntry.title}
                onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Give this entry a title..."
                className="bg-card/50 border-white/10"
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">How are you feeling?</label>
              <div className="flex flex-wrap gap-2">
                {moods.map((mood) => {
                  const Icon = mood.icon;
                  const isSelected = newEntry.mood === mood.value;
                  return (
                    <button
                      key={mood.value}
                      onClick={() => setNewEntry(prev => ({ 
                        ...prev, 
                        mood: isSelected ? "" : mood.value 
                      }))}
                      className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all
                                 ${isSelected ? 'bg-primary/20 border-primary' : 'bg-white/5 border-white/10'}
                                 border`}
                    >
                      <Icon className={`w-4 h-4 ${mood.color}`} />
                      <span className="text-sm">{mood.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Your Reflection</label>
              <Textarea
                value={newEntry.content}
                onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your thoughts, insights, and reflections..."
                className="bg-card/50 border-white/10 min-h-40"
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">Tags</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Add a tag..."
                  className="bg-card/50 border-white/10"
                />
                <Button variant="outline" onClick={addTag} className="border-white/10">
                  <Tag className="w-4 h-4" />
                </Button>
              </div>
              {newEntry.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newEntry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-white/5 text-sm flex items-center gap-1"
                    >
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-muted-foreground hover:text-destructive ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setCreating(false);
                  setNewEntry({ title: "", content: "", mood: "", tags: [] });
                }}
                className="flex-1 border-white/10"
              >
                Cancel
              </Button>
              <Button onClick={createEntry} className="flex-1 bg-primary">
                Save Entry
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Entry Dialog */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="bg-card border-white/10 max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedEntry && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(selectedEntry.created_at)}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteEntry(selectedEntry.entry_id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                {selectedEntry.title && (
                  <DialogTitle className="text-2xl font-serif">{selectedEntry.title}</DialogTitle>
                )}
                {selectedEntry.mood && (
                  <div className="flex items-center gap-2">
                    {getMoodIcon(selectedEntry.mood)}
                    <span className="text-sm text-muted-foreground capitalize">{selectedEntry.mood}</span>
                  </div>
                )}
              </DialogHeader>

              <div className="mt-4 space-y-4">
                <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {selectedEntry.content}
                </p>

                {selectedEntry.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                    {selectedEntry.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-white/5 text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Journal;
