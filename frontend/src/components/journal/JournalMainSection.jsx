import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ChevronRight,
  Plus,
} from "lucide-react";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { JOURNAL_PROMPTS } from "./journalConfig";

export const JournalMainSection = ({
  navigate,
  filterMood,
  setFilterMood,
  moods,
  activeJournalType,
  setActiveJournalType,
  journalTypes,
  setCreating,
  loading,
  entries,
  formatDate,
  getMoodIcon,
  setSelectedEntry,
  creating,
}) => (
  <>
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
            <SelectTrigger className="w-36 bg-card border-white/10" data-testid="journal-filter-mood-select">
              <SelectValue placeholder="Filter mood" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Moods</SelectItem>
              {moods.map((mood) => (
                <SelectItem key={mood.value} value={mood.value}>{mood.label}</SelectItem>
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
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2" data-testid="journal-type-tabs">
        {journalTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.value}
              onClick={() => setActiveJournalType(type.value)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${
                activeJournalType === type.value
                  ? `${type.bg} ${type.color} border border-current/30`
                  : "bg-card/50 text-muted-foreground hover:bg-card border border-white/5"
              }`}
              data-testid={`journal-type-${type.value}`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{type.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64" data-testid="journal-loading-state">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : entries.length === 0 && !creating ? (
        <div className="text-center py-16" data-testid="journal-empty-state">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-serif mb-2">Begin Your Journal</h2>
          <p className="text-muted-foreground mb-6">
            Record your spiritual journey, reflections, and insights
          </p>
          <Button onClick={() => setCreating(true)} className="bg-primary" data-testid="write-first-entry-btn">
            <Plus className="w-4 h-4 mr-2" />
            Write First Entry
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4" data-testid="journal-entries-list">
            <AnimatePresence>
              {entries.map((entry, index) => (
                <motion.div
                  key={entry.entry_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.03 }}
                  className="p-6 rounded-2xl bg-card/50 border border-white/5 cursor-pointer hover:border-primary/20 transition-all group"
                  onClick={() => setSelectedEntry(entry)}
                  data-testid={`journal-entry-card-${entry.entry_id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(entry.created_at)}</span>
                      {entry.journal_type && entry.journal_type !== "personal" && (
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          entry.journal_type === "moon" ? "bg-purple-500/20 text-purple-400" :
                          entry.journal_type === "dream" ? "bg-blue-500/20 text-blue-400" :
                          "bg-amber-500/20 text-amber-400"
                        }`}>
                          {entry.journal_type === "moon" ? "🌙 Moon" : entry.journal_type === "dream" ? "☁️ Dream" : "📝 Personal"}
                        </span>
                      )}
                    </div>
                    {entry.mood && getMoodIcon(entry.mood)}
                  </div>

                  {entry.title && (
                    <h3 className="text-xl font-serif mb-2 group-hover:text-primary transition-colors">{entry.title}</h3>
                  )}

                  {entry.journal_type === "moon" && entry.moon_phase && (
                    <div className="mb-2 text-sm text-purple-400">{entry.moon_phase}</div>
                  )}

                  {entry.journal_type === "dream" && entry.dream_symbols && (
                    <div className="mb-2 text-sm text-blue-400 italic">Symbols: {entry.dream_symbols}</div>
                  )}

                  <p className="text-muted-foreground line-clamp-3 mb-4">{entry.content}</p>

                  {entry.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {entry.tags.map((tag) => (
                        <span key={`${entry.entry_id}-${tag}`} className="px-2 py-1 rounded-full bg-white/5 text-xs">#{tag}</span>
                      ))}
                    </div>
                  )}

                  <ChevronRight className="w-5 h-5 text-muted-foreground absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="space-y-6" data-testid="journal-sidebar">
            <div className="p-6 rounded-2xl bg-card/50 border border-white/5">
              <h3 className="text-lg font-serif mb-4">Journal Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Entries</span>
                  <span className="text-primary font-medium" data-testid="journal-total-entries-count">{entries.length}</span>
                </div>
                {moods.map((mood) => {
                  const count = entries.filter((entry) => entry.mood === mood.value).length;
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

            <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20">
              <h3 className="text-lg font-serif mb-4 text-primary">Reflection Prompts</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {JOURNAL_PROMPTS.map((prompt) => (
                  <li key={prompt}>• {prompt}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </main>
  </>
);
