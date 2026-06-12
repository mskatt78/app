import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AdminCMSTabBar } from "../../components/admin/AdminCMSTabBar";
import { AdminCMSFormDialog } from "./AdminCMSFormDialog";
import { AdminCMSGridSection } from "./AdminCMSGridSection";
import { AdminCMSHeader } from "./AdminCMSHeader";
import { useAdminCMSData } from "./useAdminCMSData";

export default function AdminCMSContainer({ api }) {
  const navigate = useNavigate();
  const {
    activeTab,
    setActiveTab,
    items,
    loading,
    editingItem,
    showForm,
    setShowForm,
    formData,
    uploading,
    fileInputRef,
    tabs,
    formConstants,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSave,
    updateField,
    updateArrayField,
    handleImageUpload,
  } = useAdminCMSData(api);

  return (
    <div className="min-h-screen bg-background" data-testid="admin-cms-page">
      <AdminCMSHeader navigate={navigate} onCreate={handleCreate} />

      <div className="max-w-6xl mx-auto p-4">
        <AdminCMSTabBar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          data-testid="admin-cms-content"
        >
          <AdminCMSGridSection loading={loading} items={items} onEdit={handleEdit} onDelete={handleDelete} />
        </motion.div>
      </div>

      <AdminCMSFormDialog
        showForm={showForm}
        setShowForm={setShowForm}
        editingItem={editingItem}
        activeTab={activeTab}
        formData={formData}
        updateField={updateField}
        updateArrayField={updateArrayField}
        uploading={uploading}
        fileInputRef={fileInputRef}
        handleImageUpload={handleImageUpload}
        formConstants={formConstants}
        handleSave={handleSave}
      />
    </div>
  );
}