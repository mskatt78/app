import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit3,
  Heart,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { getMoodByValue, getPracticeColors } from "./constants";

export const PracticeJournalEntriesList = ({
  filteredEntries,
  expandedEntry,
  setExpandedEntry,
  startEdit,
  handleDelete,
  handleShareToCommunity,
  sharingId,
}) => (
  <div className="space-y-4" data-testid="practice-journal-entries-list">
    {filteredEntries.map((entry, index) => {
      const colors = getPracticeColors(entry.practice_type);
      const isExpanded = expandedEntry === entry.id;
      const moodBeforeEmoji = getMoodByValue(entry.mood_before)?.emoji || "";
      const moodAfterEmoji = getMoodByValue(entry.mood_after)?.emoji || "";

      return (
        <motion.div
          key={entry.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={`rounded-xl border ${colors.border} bg-white/[0.02] overflow-hidden`}
          data-testid={`journal-entry-${entry.id}`}
        >
          <div
            className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
            data-testid={`practice-journal-entry-toggle-${entry.id}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${colors.bg} ${colors.text}`} data-testid={`practice-journal-entry-type-${entry.id}`}>
                    {entry.practice_type}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1" data-testid={`practice-journal-entry-date-${entry.id}`}>
                    <Calendar className="w-3 h-3" />
                    {new Date(entry.created_at).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-muted-foreground" data-testid={`practice-journal-entry-moon-${entry.id}`}>
                    {entry.moon_emoji} {entry.moon_phase}
                  </span>
                  {entry.duration_minutes && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1" data-testid={`practice-journal-entry-duration-${entry.id}`}>
                      <Clock className="w-3 h-3" />
                      {entry.duration_minutes} min
                    </span>
                  )}
                </div>

                <h3 className="font-serif text-lg" data-testid={`practice-journal-entry-title-${entry.id}`}>{entry.practice_name}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm" data-testid={`practice-journal-entry-mood-transition-${entry.id}`}>
                  <span>Mood: {moodBeforeEmoji} → {moodAfterEmoji}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    startEdit(entry);
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  data-testid={`edit-${entry.id}`}
                >
                  <Edit3 className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDelete(entry.id);
                  }}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                  data-testid={`delete-${entry.id}`}
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-white/10"
                data-testid={`practice-journal-entry-expanded-panel-${entry.id}`}
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

                  {(entry.voice_note_data_url || entry.voice_note_url) && (
                    <div data-testid={`practice-journal-entry-voice-note-${entry.id}`}>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Voice Note</h4>
                      <audio
                        controls
                        src={entry.voice_note_data_url || entry.voice_note_url}
                        className="w-full"
                        data-testid={`practice-journal-entry-voice-player-${entry.id}`}
                      />
                      {Number(entry.voice_note_duration_seconds || 0) > 0 && (
                        <p className="text-xs text-muted-foreground mt-1" data-testid={`practice-journal-entry-voice-duration-${entry.id}`}>
                          Duration: {Math.floor(Number(entry.voice_note_duration_seconds) / 60)}:{String(Math.floor(Number(entry.voice_note_duration_seconds) % 60)).padStart(2, "0")}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="pt-2 border-t border-white/10">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleShareToCommunity(entry);
                      }}
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
);
