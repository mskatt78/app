// Admin item card for displaying content in the CMS
import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

const AdminItemCard = ({ item, onEdit, onDelete, type }) => {
  const title = item.name || item.title;
  const subtitle = item.sanskrit_name || item.subtitle || item.category || item.element;
  const image = item.image_url || item.cover_image;
  const description = item.description;
  
  // Get element color
  const getElementColor = (element) => {
    const colors = {
      Earth: "bg-emerald-500/20 text-emerald-400",
      Water: "bg-blue-500/20 text-blue-400",
      Fire: "bg-orange-500/20 text-orange-400",
      Air: "bg-cyan-500/20 text-cyan-400",
      Spirit: "bg-purple-500/20 text-purple-400",
    };
    return colors[element] || "bg-white/10 text-white";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/50 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors"
    >
      {/* Image */}
      {image && (
        <div className="h-32 w-full overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-medium text-sm line-clamp-1">{title}</h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground italic">{subtitle}</p>
            )}
          </div>
          {item.element && (
            <Badge className={`${getElementColor(item.element)} shrink-0`}>
              {item.element}
            </Badge>
          )}
        </div>
        
        {description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {description}
          </p>
        )}
        
        {/* Meta info */}
        <div className="flex flex-wrap gap-1 mb-3">
          {item.difficulty && (
            <Badge variant="outline" className="text-xs">
              {item.difficulty}
            </Badge>
          )}
          {item.duration_minutes && (
            <Badge variant="outline" className="text-xs">
              {item.duration_minutes} min
            </Badge>
          )}
          {item.price !== undefined && item.price > 0 && (
            <Badge variant="outline" className="text-xs">
              ${item.price}
            </Badge>
          )}
          {item.category && (
            <Badge variant="outline" className="text-xs capitalize">
              {item.category.replace(/_/g, " ")}
            </Badge>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(item)}
            className="flex-1"
            data-testid={`edit-${item.id}`}
          >
            <Pencil className="w-3 h-3 mr-1" /> Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(item)}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            data-testid={`delete-${item.id}`}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminItemCard;
