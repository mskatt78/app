import { motion } from "framer-motion";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { getPreviewFields } from "./utils";

export const AdminItemsList = ({
  loading,
  items,
  isYogaCollection,
  deleting,
  onEdit,
  onDelete,
  onAddFirst,
}) => {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }, (_, idx) => `items-loading-${idx}`).map((placeholderKey) => (
          <div key={placeholderKey} className="h-16 rounded-xl bg-card/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        <p>No entries found</p>
        <Button className="mt-4" onClick={onAddFirst} data-testid="admin-add-first-entry-btn">
          Add First Entry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2" data-testid="admin-items-list">
      {items.map((item) => {
        const { primary, secondary } = getPreviewFields(item);
        return (
          <motion.div
            key={item.id}
            layout
            className="flex items-center gap-4 p-4 rounded-xl bg-card border border-white/10 hover:border-white/20 transition-colors group"
            data-testid={`item-row-${item.id}`}
          >
            {item.image_url && (
              <img
                src={item.image_url}
                alt={primary}
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                onError={(event) => {
                  event.target.style.display = "none";
                }}
              />
            )}

            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{primary}</p>
              {secondary && <p className="text-xs text-muted-foreground">{secondary}</p>}
              {isYogaCollection && item.image_source && (
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] border ${
                      item.image_source === "wikimedia_commons_verified"
                        ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-200"
                        : "bg-amber-500/15 border-amber-400/40 text-amber-200"
                    }`}
                    data-testid={`admin-yoga-source-status-${item.id}`}
                  >
                    {item.image_source === "wikimedia_commons_verified"
                      ? "Verified Source"
                      : "Pending Source Review"}
                  </span>
                  {item.image_validation?.priority && (
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] border bg-cyan-500/10 border-cyan-400/30 text-cyan-200"
                      data-testid={`admin-yoga-priority-${item.id}`}
                    >
                      Priority: {item.image_validation.priority}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(item)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                data-testid={`edit-btn-${item.id}`}
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(item.id)}
                disabled={deleting === item.id}
                className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                data-testid={`delete-btn-${item.id}`}
              >
                {deleting === item.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};