import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Edit, Trash2 } from "lucide-react";

export const AdminCMSItemCard = ({ item, getElementColor, onEdit, onDelete }) => {
  return (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/50 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors"
    >
      {(item.image_url || item.cover_image) && (
        <div className="h-32 overflow-hidden">
          <img src={item.image_url || item.cover_image} alt={item.name || item.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-medium text-sm line-clamp-1">{item.name || item.title}</h3>
            {item.sanskrit_name && <p className="text-xs text-muted-foreground italic">{item.sanskrit_name}</p>}
          </div>
          {item.element && <Badge className={getElementColor(item.element)}>{item.element}</Badge>}
        </div>
        {item.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{item.description}</p>}
        <div className="flex flex-wrap gap-1 mb-3">
          {item.category && <Badge variant="outline" className="text-[10px]">{item.category}</Badge>}
          {item.duration_minutes && <Badge variant="outline" className="text-[10px]">{item.duration_minutes} min</Badge>}
          {item.level && <Badge variant="outline" className="text-[10px]">{item.level}</Badge>}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={onEdit} data-testid={`edit-${item.id}`}>
            <Edit className="w-3 h-3 mr-1" /> Edit
          </Button>
          <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" onClick={onDelete} data-testid={`delete-${item.id}`}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
