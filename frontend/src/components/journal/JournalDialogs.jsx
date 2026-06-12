import { useMemo } from "react";
import { Calendar, Tag, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";

export const JournalDialogs = ({
  creating,
  setCreating,
  newEntry,
  setNewEntry,
  moonPhases,
  moods,
  journalTypes,
  tagInput,
  setTagInput,
  addTag,
  removeTag,
  createEntry,
  selectedEntry,
  setSelectedEntry,
  deleteEntry,
  formatDate,
  getMoodIcon,
  resetEntry,
}) => {
  const visibleJournalTypes = useMemo(() => journalTypes.filter((type) => type.value !== "all"), [journalTypes]);
  const selectedEntryTags = useMemo(() => selectedEntry?.tags || [], [selectedEntry]);

  return (
    <>
    <Dialog open={creating} onOpenChange={setCreating}>
      <DialogContent className="bg-card border-white/10 max-w-lg max-h-[90vh] overflow-y-auto" data-testid="create-journal-dialog">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">New Journal Entry</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Journal Type</label>
            <div className="flex gap-2">
              {visibleJournalTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = newEntry.journal_type === type.value;
                return (
                  <button
                    key={type.value}
                    onClick={() => setNewEntry((prev) => ({ ...prev, journal_type: type.value }))}
                    className={`flex-1 px-3 py-3 rounded-xl flex flex-col items-center gap-1 transition-all border ${
                      isSelected ? `${type.bg} ${type.color} border-current/30` : "bg-card/50 border-white/10 text-muted-foreground hover:border-white/20"
                    }`}
                    data-testid={`select-journal-type-${type.value}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Title (optional)</label>
            <Input
              value={newEntry.title}
              onChange={(event) => setNewEntry((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Give this entry a title..."
              className="bg-card/50 border-white/10"
              data-testid="journal-title-input"
            />
          </div>

          {newEntry.journal_type === "moon" && (
            <>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Moon Phase</label>
                <Select value={newEntry.moon_phase} onValueChange={(value) => setNewEntry((prev) => ({ ...prev, moon_phase: value }))}>
                  <SelectTrigger className="bg-card/50 border-white/10" data-testid="journal-moon-phase-select">
                    <SelectValue placeholder="Select moon phase..." />
                  </SelectTrigger>
                  <SelectContent>
                    {moonPhases.map((phase) => (
                      <SelectItem key={phase.value} value={phase.value}>
                        <div>
                          <div>{phase.label}</div>
                          <div className="text-xs text-muted-foreground">{phase.energy}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Moon Intention (optional)</label>
                <Input
                  value={newEntry.moon_intention}
                  onChange={(event) => setNewEntry((prev) => ({ ...prev, moon_intention: event.target.value }))}
                  placeholder="What intention are you setting with this moon?"
                  className="bg-card/50 border-white/10"
                  data-testid="journal-moon-intention-input"
                />
              </div>
            </>
          )}

          {newEntry.journal_type === "dream" && (
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Dream Symbols (optional)</label>
              <Input
                value={newEntry.dream_symbols}
                onChange={(event) => setNewEntry((prev) => ({ ...prev, dream_symbols: event.target.value }))}
                placeholder="Key symbols: water, flying, animals..."
                className="bg-card/50 border-white/10"
                data-testid="journal-dream-symbols-input"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-muted-foreground mb-2">How are you feeling?</label>
            <div className="flex flex-wrap gap-2">
              {moods.map((mood) => {
                const Icon = mood.icon;
                const isSelected = newEntry.mood === mood.value;
                return (
                  <button
                    key={mood.value}
                    onClick={() => setNewEntry((prev) => ({ ...prev, mood: isSelected ? "" : mood.value }))}
                    className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${isSelected ? "bg-primary/20 border-primary" : "bg-white/5 border-white/10"} border`}
                    data-testid={`journal-mood-${mood.value}`}
                  >
                    <Icon className={`w-4 h-4 ${mood.color}`} />
                    <span className="text-sm">{mood.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              {newEntry.journal_type === "moon" ? "Moon Reflection" : newEntry.journal_type === "dream" ? "Dream Description" : "Your Reflection"}
            </label>
            <Textarea
              value={newEntry.content}
              onChange={(event) => setNewEntry((prev) => ({ ...prev, content: event.target.value }))}
              placeholder={newEntry.journal_type === "moon" ? "Reflect on the moon's energy and your intentions..." : newEntry.journal_type === "dream" ? "Describe your dream in detail..." : "Write your thoughts, insights, and reflections..."}
              className="bg-card/50 border-white/10 min-h-40"
              data-testid="journal-content-input"
            />
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyPress={(event) => event.key === "Enter" && (event.preventDefault(), addTag())}
                placeholder="Add a tag..."
                className="bg-card/50 border-white/10"
                data-testid="journal-tag-input"
              />
              <Button variant="outline" onClick={addTag} className="border-white/10" data-testid="journal-add-tag-btn">
                <Tag className="w-4 h-4" />
              </Button>
            </div>
            {newEntry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2" data-testid="journal-tags-list">
                {newEntry.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-white/5 text-sm flex items-center gap-1">
                    #{tag}
                    <button onClick={() => removeTag(tag)} className="text-muted-foreground hover:text-destructive ml-1" data-testid={`journal-remove-tag-${tag}`}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button variant="outline" onClick={resetEntry} className="flex-1 border-white/10" data-testid="journal-cancel-create-btn">
              Cancel
            </Button>
            <Button onClick={createEntry} className="flex-1 bg-primary" data-testid="journal-save-entry-btn">
              Save Entry
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
      <DialogContent className="bg-card border-white/10 max-w-lg max-h-[90vh] overflow-y-auto" data-testid="view-journal-dialog">
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
                  data-testid="journal-delete-entry-btn"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              {selectedEntry.title && <DialogTitle className="text-2xl font-serif">{selectedEntry.title}</DialogTitle>}
              {selectedEntry.mood && (
                <div className="flex items-center gap-2">
                  {getMoodIcon(selectedEntry.mood)}
                  <span className="text-sm text-muted-foreground capitalize">{selectedEntry.mood}</span>
                </div>
              )}
            </DialogHeader>

            <div className="mt-4 space-y-4">
              <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">{selectedEntry.content}</p>

              {selectedEntryTags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                  {selectedEntryTags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-white/5 text-sm">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
};
