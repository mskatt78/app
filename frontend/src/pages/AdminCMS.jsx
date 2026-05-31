import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Plus, Save, Loader2,
  Sparkles, Wind, Droplets, Flame, Mountain, 
  Calendar, Users, BookOpen, Video, Heart, Feather, Zap, Palette,
  MapPin, Radio, CreditCard
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { toast } from "sonner";
import { AdminCMSTabBar } from "../components/admin/AdminCMSTabBar";
import { AdminCMSItemCard } from "../components/admin/AdminCMSItemCard";
import { AdminCMSFormRenderer } from "../components/admin/AdminCMSFormRenderer";

// Import admin config
import { appLogger } from "../utils/logger";
import {
  ADMIN_TABS,
  ELEMENTS, DIFFICULTIES, CHAKRAS,
  HEART_CATEGORIES, CREATIVE_CATEGORIES, SHAMANIC_CATEGORIES, ELEMENTAL_CATEGORIES,
  getEndpoint, getDefaultFormData
} from "../components/admin/adminConfig";

const AdminCMS = ({ user, api }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("yoga");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const tabIcons = {
    yoga: Sparkles,
    mudras: Sparkles,
    breathwork: Wind,
    crystals: Mountain,
    mantras: Sparkles,
    "earth-altars": Mountain,
    "elemental-practices": Zap,
    "heart-practices": Heart,
    "creative-processes": Palette,
    "shamanic-practices": Feather,
    retreats: MapPin,
    books: BookOpen,
    "custom-oracle-cards": CreditCard,
    "live-sessions": Radio,
    "preset-rituals": Sparkles,
  };

  const tabs = ADMIN_TABS
    .filter((tab) => tab.id !== "workshops" && tab.id !== "events" && tab.id !== "courses")
    .map((tab) => ({ ...tab, icon: tabIcons[tab.id] || Sparkles }));

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(getEndpoint(activeTab));
      setItems(response.data || []);
    } catch (error) {
      appLogger.error("Failed to fetch items:", error);
      toast.error("Failed to load items");
    } finally {
      setLoading(false);
    }
  }, [activeTab, api]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleCreate = () => {
    setEditingItem(null);
    setFormData(getDefaultFormData(activeTab));
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setShowForm(true);
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.name || item.title}"?`)) return;
    try {
      await api.delete(`${getEndpoint(activeTab, true)}/${item.id}`);
      toast.success("Deleted successfully");
      fetchItems();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleSave = async () => {
    try {
      const endpoint = getEndpoint(activeTab, true);
      if (editingItem) {
        await api.put(`${endpoint}/${editingItem.id}`, formData);
        toast.success("Updated successfully");
      } else {
        await api.post(endpoint, formData);
        toast.success("Created successfully");
      }
      setShowForm(false);
      fetchItems();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to save");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }
    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      const response = await api.post('/admin/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateField("image_url", response.data.url);
      toast.success("Image uploaded!");
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const updateField = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const updateArrayField = (name, value) => {
    const arr = value.split("\n").filter(v => v.trim());
    setFormData(prev => ({ ...prev, [name]: arr }));
  };

  // Get element badge color
  const getElementColor = (element) => ({
    Earth: "bg-emerald-500/20 text-emerald-400",
    Water: "bg-blue-500/20 text-blue-400",
    Fire: "bg-orange-500/20 text-orange-400",
    Air: "bg-cyan-500/20 text-cyan-400",
    Spirit: "bg-purple-500/20 text-purple-400",
  }[element] || "bg-white/10");

  const formConstants = {
    ELEMENTS,
    DIFFICULTIES,
    CHAKRAS,
    HEART_CATEGORIES,
    CREATIVE_CATEGORIES,
    SHAMANIC_CATEGORIES,
    ELEMENTAL_CATEGORIES,
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-serif">Admin CMS</h1>
            </div>
            <Button onClick={handleCreate} data-testid="create-new-btn">
              <Plus className="w-4 h-4 mr-2" /> Add New
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <AdminCMSTabBar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Items Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No items yet. Click "Add New" to create one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(item => (
              <AdminCMSItemCard
                key={item.id}
                item={item}
                getElementColor={getElementColor}
                onEdit={() => handleEdit(item)}
                onDelete={() => handleDelete(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit" : "Create"} {tabs.find(t => t.id === activeTab)?.label}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
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
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave} data-testid="save-btn">
              <Save className="w-4 h-4 mr-2" /> Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCMS;
