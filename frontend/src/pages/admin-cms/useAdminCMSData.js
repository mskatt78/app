import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { appLogger } from "../../utils/logger";
import {
  ADMIN_TABS,
  CHAKRAS,
  CREATIVE_CATEGORIES,
  DIFFICULTIES,
  ELEMENTAL_CATEGORIES,
  ELEMENTS,
  getDefaultFormData,
  getEndpoint,
  HEART_CATEGORIES,
  SHAMANIC_CATEGORIES,
} from "../../components/admin/adminConfig";
import { EXCLUDED_TABS, TAB_ICONS } from "./constants";

export const useAdminCMSData = (api) => {
  const [activeTab, setActiveTab] = useState("yoga");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const tabs = useMemo(() => {
    return ADMIN_TABS.filter((tab) => !EXCLUDED_TABS.has(tab.id)).map((tab) => ({
      ...tab,
      icon: TAB_ICONS[tab.id] || TAB_ICONS.yoga,
    }));
  }, []);

  const formConstants = useMemo(
    () => ({
      ELEMENTS,
      DIFFICULTIES,
      CHAKRAS,
      HEART_CATEGORIES,
      CREATIVE_CATEGORIES,
      SHAMANIC_CATEGORIES,
      ELEMENTAL_CATEGORIES,
    }),
    []
  );

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(getEndpoint(activeTab));
      setItems(response.data || []);
    } catch (error) {
      appLogger.error("Failed to fetch admin cms items", error);
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
      appLogger.error("Failed to delete admin cms item", error);
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
      appLogger.error("Failed to save admin cms item", error);
      toast.error(error.response?.data?.detail || "Failed to save");
    }
  };

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const updateArrayField = (name, value) => {
    const arr = value
      .split("\n")
      .map((entry) => entry.trim())
      .filter(Boolean);
    setFormData((prev) => ({ ...prev, [name]: arr }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const payload = new FormData();
      payload.append("file", file);
      const response = await api.post("/admin/upload", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateField("image_url", response.data.url);
      toast.success("Image uploaded!");
    } catch (error) {
      appLogger.error("Admin CMS image upload failed", error);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return {
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
  };
};