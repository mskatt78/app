import { motion } from "framer-motion";
import { Hash } from "lucide-react";
import { Button } from "../../components/ui/button";

export const NumerologyHistoryView = ({ pastReadings, setReading }) => {
  if (!pastReadings.length) {
    return (
      <div className="space-y-4" data-testid="numerology-history-view">
        <h2 className="text-2xl font-serif mb-6">Your <span className="italic text-primary">Past Readings</span></h2>
        <div className="text-center py-12" data-testid="numerology-history-empty-state">
          <Hash className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No readings yet. Calculate your first one!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="numerology-history-view">
      <h2 className="text-2xl font-serif mb-6">Your <span className="italic text-primary">Past Readings</span></h2>
      {pastReadings.map((readingRecord, index) => (
        <motion.div
          key={readingRecord.reading_id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="p-6 rounded-2xl bg-card/50 border border-white/5"
          data-testid={`numerology-history-item-${readingRecord.reading_id}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-2xl font-serif text-primary">{readingRecord.reading?.life_path?.number}</span>
              </div>
              <div>
                <h3 className="text-lg font-serif">{readingRecord.reading?.life_path?.name}</h3>
                <p className="text-sm text-muted-foreground">{new Date(readingRecord.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReading(readingRecord.reading)}
              data-testid={`numerology-history-view-button-${readingRecord.reading_id}`}
            >
              View
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
