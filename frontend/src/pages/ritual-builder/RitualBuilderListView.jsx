import { motion } from "framer-motion";
import { Check, Clock, Play, Share2, Sparkles, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";

const CARD_INITIAL = { opacity: 0, y: 20 };
const CARD_ANIMATE = { opacity: 1, y: 0 };

export const RitualBuilderListView = ({
  rituals,
  sharingRitualId,
  onCreate,
  onStart,
  onShare,
  onDelete,
}) => {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6" data-testid="ritual-builder-list-view">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif mb-2">Ritual Builder</h1>
          <p className="text-muted-foreground">Create your custom sacred practice sequences</p>
        </div>
        <Button onClick={onCreate} className="bg-primary" data-testid="create-ritual-btn">
          Create New Ritual
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="rituals-grid">
        {rituals.map((ritual, index) => (
          <motion.div
            key={ritual.ritual_id}
            initial={CARD_INITIAL}
            animate={CARD_ANIMATE}
            transition={{ delay: index * 0.05 }}
            className="p-6 rounded-2xl bg-card/50 border border-white/10 hover:border-primary/30 transition-all"
            data-testid={`ritual-card-${ritual.ritual_id}`}
          >
            <h3 className="text-xl font-serif mb-2">{ritual.name}</h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{ritual.description || "No description"}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{ritual.total_duration} minutes</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4" />
                <span>{ritual.practices?.length || 0} practices</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={() => onStart(ritual)} className="flex-1" data-testid={`start-ritual-${ritual.ritual_id}`}>
                <Play className="w-3 h-3 mr-1" /> Start
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onShare(ritual.ritual_id)}
                disabled={sharingRitualId === ritual.ritual_id}
                data-testid={`share-ritual-${ritual.ritual_id}`}
              >
                <Share2 className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => onDelete(ritual.ritual_id)} data-testid={`delete-ritual-${ritual.ritual_id}`}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {rituals.length === 0 && (
        <div className="text-center py-12" data-testid="empty-rituals">
          <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No rituals created yet. Start building your sacred sequence.</p>
        </div>
      )}
    </div>
  );
};
