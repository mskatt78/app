import { Loader2 } from "lucide-react";
import { AdminCMSItemCard } from "../../components/admin/AdminCMSItemCard";
import { getElementColor } from "./constants";

export const AdminCMSGridSection = ({ loading, items, onEdit, onDelete }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12" data-testid="admin-cms-loading-state">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground" data-testid="admin-cms-empty-state">
        <p>No items yet. Click "Add New" to create one.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="admin-cms-items-grid">
      {items.map((item) => (
        <AdminCMSItemCard
          key={item.id}
          item={item}
          getElementColor={getElementColor}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item)}
        />
      ))}
    </div>
  );
};