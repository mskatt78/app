import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Save, X } from "lucide-react";
import { AdminCMSFormRenderer } from "../../components/admin/AdminCMSFormRenderer";

export const AdminCMSFormDialog = ({
  showForm,
  setShowForm,
  editingItem,
  activeTab,
  formData,
  updateField,
  updateArrayField,
  uploading,
  fileInputRef,
  handleImageUpload,
  formConstants,
  handleSave,
}) => {
  return (
    <Dialog open={showForm} onOpenChange={setShowForm}>
      <DialogContent className="bg-card border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="admin-cms-form-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{editingItem ? "Edit" : "Create"} {activeTab.replace(/-/g, " ")}</span>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
          <DialogDescription className="sr-only" data-testid="admin-cms-form-dialog-description">
            Fill content fields and save changes for the selected admin collection entry.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <AdminCMSFormRenderer
            activeTab={activeTab}
            formData={formData}
            updateField={updateField}
            updateArrayField={updateArrayField}
            uploading={uploading}
            fileInputRef={fileInputRef}
            handleImageUpload={handleImageUpload}
            constants={formConstants}
          />

          <div className="flex gap-2 pt-4 border-t border-white/10">
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1" data-testid="save-item-button">
              <Save className="w-4 h-4 mr-2" /> Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};