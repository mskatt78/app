import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { appLogger } from "../../utils/logger";
import { FIELD_CONFIG } from "./constants";
import { AdminFieldInput } from "./AdminFieldInput";

export const AdminItemModal = ({ collection, item, onClose, onSave, apiBaseUrl }) => {
  const fields = useMemo(() => {
    return (
      FIELD_CONFIG[collection] ||
      Object.keys(item || {}).filter(
        (key) => !["id", "_id", "created_at", "updated_at"].includes(key)
      )
    );
  }, [collection, item]);

  const [formData, setFormData] = useState(() => {
    const base = {};
    fields.forEach((field) => {
      base[field] = item?.[field] || "";
    });
    if (item?.id) {
      base.id = item.id;
    }
    return base;
  });
  const [saving, setSaving] = useState(false);
  const [uploadLoading, setUploadLoading] = useState({});

  const handleUpload = async (file, field) => {
    setUploadLoading((prev) => ({ ...prev, [field]: true }));
    try {
      const formDataPayload = new FormData();
      formDataPayload.append("file", file);
      const response = await fetch(`${apiBaseUrl}/api/admin/upload`, {
        method: "POST",
        credentials: "include",
        body: formDataPayload,
      });
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      const data = await response.json();
      setFormData((prev) => ({ ...prev, [field]: data.public_url }));
      toast.success("File uploaded successfully");
    } catch (error) {
      appLogger.error("Admin item upload failed", error);
      toast.error("Upload failed");
    } finally {
      setUploadLoading((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-white/10 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
        data-testid="item-modal"
      >
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-white/10 bg-card z-10">
          <h3 className="font-serif text-lg">{item ? "Edit Entry" : "New Entry"}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground" data-testid="admin-item-modal-close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {fields.map((field) => (
            <div key={field}>
              <label className="block text-xs text-muted-foreground mb-1 capitalize">{field.replace(/_/g, " ")}</label>
              <AdminFieldInput
                field={field}
                value={formData[field]}
                onChange={(value) => setFormData((prev) => ({ ...prev, [field]: value }))}
                onUpload={handleUpload}
                uploadLoading={uploadLoading[field]}
              />
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 p-4 border-t border-white/10 bg-card flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1" data-testid="admin-item-modal-cancel">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1" data-testid="save-item-btn">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};