import { BookOpen, Plus } from "lucide-react";
import { Button } from "../../components/ui/button";

export const PracticeJournalEmptyState = ({ entriesCount, setShowForm }) => {
  const title = entriesCount === 0 ? "Begin Your Journal" : "No Matching Entries";
  const description = entriesCount === 0
    ? "Record your experiences after each practice to track your spiritual growth and insights."
    : "Try adjusting your filters or search term.";

  return (
    <div className="text-center py-16" data-testid="practice-journal-empty-state">
      <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
      <h2 className="text-2xl font-serif mb-2" data-testid="practice-journal-empty-title">{title}</h2>
      <p className="text-muted-foreground max-w-md mx-auto mb-6" data-testid="practice-journal-empty-description">{description}</p>
      {entriesCount === 0 && (
        <Button
          onClick={() => setShowForm(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
          data-testid="practice-journal-create-first-entry-button"
        >
          <Plus className="w-4 h-4 mr-2" /> Create First Entry
        </Button>
      )}
    </div>
  );
};
