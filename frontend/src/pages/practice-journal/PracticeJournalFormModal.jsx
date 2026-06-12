import { AnimatePresence, motion } from "framer-motion";
import { Heart, Moon, Plus, Sparkles, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { MOODS } from "./constants";

const resolveMoodButtonClassName = (isActive) => {
  if (isActive) {
    return "bg-emerald-500/20 scale-110";
  }

  return "bg-white/5 hover:bg-white/10";
};

export const PracticeJournalFormModal = ({
  showForm,
  resetForm,
  editingEntry,
  currentPrompt,
  onGeneratePrompt,
  formData,
  setFormData,
  handleSubmit,
  moonPhase,
}) => (
  <AnimatePresence>
    {showForm && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={resetForm}
        data-testid="practice-journal-form-modal-overlay"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(event) => event.stopPropagation()}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-white/10"
          data-testid="journal-form-modal"
        >
          <div className="sticky top-0 bg-card border-b border-white/10 p-4 flex items-center justify-between">
            <h2 className="text-xl font-serif" data-testid="practice-journal-form-modal-title">
              {editingEntry ? "Edit Journal Entry" : "New Journal Entry"}
            </h2>
            <button onClick={resetForm} className="p-2 hover:bg-white/10 rounded-lg" data-testid="practice-journal-form-modal-close-button">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4" data-testid="practice-journal-form-prompt-card">
              <p className="text-sm text-emerald-300 italic">&quot;{currentPrompt}&quot;</p>
              <button
                onClick={onGeneratePrompt}
                className="text-xs text-emerald-400 mt-2 hover:underline"
                data-testid="practice-journal-form-generate-prompt-button"
              >
                New prompt
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Practice Name *</label>
                <input
                  type="text"
                  value={formData.practice_name}
                  onChange={(event) => setFormData({ ...formData, practice_name: event.target.value })}
                  placeholder="e.g., Heart Chakra Cleansing"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500/50"
                  data-testid="practice-name-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Practice Type</label>
                <select
                  value={formData.practice_type}
                  onChange={(event) => setFormData({ ...formData, practice_type: event.target.value })}
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

            <div>
              <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
              <input
                type="number"
                value={formData.duration_minutes}
                onChange={(event) => setFormData({ ...formData, duration_minutes: parseInt(event.target.value, 10) || 0 })}
                min="1"
                max="180"
                className="w-24 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500/50"
                data-testid="duration-input"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-3">Mood Before</label>
                <div className="flex gap-2">
                  {MOODS.map((mood) => {
                    const isActive = formData.mood_before === mood.value;
                    return (
                      <button
                        key={mood.value}
                        onClick={() => setFormData({ ...formData, mood_before: mood.value })}
                        className={`p-3 rounded-lg text-2xl transition-all ${resolveMoodButtonClassName(isActive)}`}
                        title={mood.label}
                        data-testid={`mood-before-${mood.value}`}
                      >
                        {mood.emoji}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Mood After</label>
                <div className="flex gap-2">
                  {MOODS.map((mood) => {
                    const isActive = formData.mood_after === mood.value;
                    return (
                      <button
                        key={mood.value}
                        onClick={() => setFormData({ ...formData, mood_after: mood.value })}
                        className={`p-3 rounded-lg text-2xl transition-all ${resolveMoodButtonClassName(isActive)}`}
                        title={mood.label}
                        data-testid={`mood-after-${mood.value}`}
                      >
                        {mood.emoji}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Body Sensations</label>
              <textarea
                value={formData.body_sensations}
                onChange={(event) => setFormData({ ...formData, body_sensations: event.target.value })}
                placeholder="What did you feel in your body? Any areas of tension, warmth, tingling, release..."
                rows={2}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500/50 resize-none"
                data-testid="body-sensations-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-violet-400" /> Spiritual Downloads
              </label>
              <textarea
                value={formData.spiritual_downloads}
                onChange={(event) => setFormData({ ...formData, spiritual_downloads: event.target.value })}
                placeholder="Any visions, messages, symbols, or downloads you received..."
                rows={2}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500/50 resize-none"
                data-testid="spiritual-downloads-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Intentions</label>
              <textarea
                value={formData.intentions}
                onChange={(event) => setFormData({ ...formData, intentions: event.target.value })}
                placeholder="What intentions did you set? What are you calling in?"
                rows={2}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500/50 resize-none"
                data-testid="intentions-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Key Insights</label>
              <textarea
                value={formData.key_insights}
                onChange={(event) => setFormData({ ...formData, key_insights: event.target.value })}
                placeholder="What insights or realizations came through?"
                rows={2}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500/50 resize-none"
                data-testid="key-insights-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                <Heart className="w-4 h-4 text-rose-400" /> Reflection
              </label>
              <textarea
                value={formData.reflection}
                onChange={(event) => setFormData({ ...formData, reflection: event.target.value })}
                placeholder="Your overall reflection on this practice..."
                rows={4}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500/50 resize-none"
                data-testid="reflection-input"
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white/5 rounded-lg p-3" data-testid="practice-journal-form-moon-phase-info">
              <Moon className="w-4 h-4" />
              <span>This entry will be tagged with: {moonPhase.emoji} {moonPhase.phase}</span>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={resetForm} data-testid="practice-journal-form-cancel-button">Cancel</Button>
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
);
