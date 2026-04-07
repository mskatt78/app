import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Plus, Pencil, Trash2, Save, X, Loader2,
  Sparkles, Wind, Droplets, Flame, Mountain, 
  Calendar, Users, BookOpen, Video, Heart, Feather, Zap, Palette,
  Upload, MapPin, Radio, CreditCard, Gift
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";

// Import admin config
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

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await api.get(getEndpoint(activeTab));
      setItems(response.data || []);
    } catch (error) {
      console.error("Failed to fetch items:", error);
      toast.error("Failed to load items");
    } finally {
      setLoading(false);
    }
  };

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

  // Reusable form field components
  const TextField = ({ name, label, placeholder, required }) => (
    <div className="space-y-1">
      <label className="text-sm text-muted-foreground">{label} {required && <span className="text-red-400">*</span>}</label>
      <Input
        value={formData[name] || ""}
        onChange={(e) => updateField(name, e.target.value)}
        placeholder={placeholder || label}
      />
    </div>
  );

  const TextareaField = ({ name, label, rows = 3 }) => (
    <div className="space-y-1">
      <label className="text-sm text-muted-foreground">{label}</label>
      <Textarea
        value={formData[name] || ""}
        onChange={(e) => updateField(name, e.target.value)}
        rows={rows}
      />
    </div>
  );

  const NumberField = ({ name, label, min, max }) => (
    <div className="space-y-1">
      <label className="text-sm text-muted-foreground">{label}</label>
      <Input
        type="number"
        min={min}
        max={max}
        value={formData[name] || 0}
        onChange={(e) => updateField(name, parseFloat(e.target.value) || 0)}
      />
    </div>
  );

  const SelectField = ({ name, label, options }) => (
    <div className="space-y-1">
      <label className="text-sm text-muted-foreground">{label}</label>
      <Select value={formData[name] || ""} onValueChange={(v) => updateField(name, v)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );

  const ArrayField = ({ name, label, placeholder }) => (
    <div className="space-y-1">
      <label className="text-sm text-muted-foreground">{label} (one per line)</label>
      <Textarea
        value={(formData[name] || []).join("\n")}
        onChange={(e) => updateArrayField(name, e.target.value)}
        placeholder={placeholder}
        rows={3}
      />
    </div>
  );

  const ImageField = () => (
    <div className="space-y-2">
      <label className="text-sm text-muted-foreground">Image</label>
      <div className="flex gap-2">
        <Input
          value={formData.image_url || ""}
          onChange={(e) => updateField("image_url", e.target.value)}
          placeholder="Image URL"
          className="flex-1"
        />
        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
        <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        </Button>
      </div>
      {formData.image_url && (
        <img src={formData.image_url} alt="Preview" className="w-24 h-24 object-cover rounded-lg" />
      )}
    </div>
  );

  const ChakraField = () => (
    <div className="space-y-2">
      <label className="text-sm text-muted-foreground">Chakras</label>
      <div className="flex flex-wrap gap-2">
        {CHAKRAS.map(chakra => (
          <button
            key={chakra}
            type="button"
            onClick={() => {
              const current = formData.chakras || [];
              const updated = current.includes(chakra) 
                ? current.filter(c => c !== chakra) 
                : [...current, chakra];
              updateField("chakras", updated);
            }}
            className={`px-3 py-1 rounded-full text-xs transition-colors ${
              (formData.chakras || []).includes(chakra)
                ? "bg-primary text-primary-foreground"
                : "bg-white/5 hover:bg-white/10"
            }`}
          >
            {chakra}
          </button>
        ))}
      </div>
    </div>
  );

  // Dynamic form renderer based on active tab
  const renderForm = () => {
    const commonFields = (
      <>
        <TextField name="name" label="Name" required />
        <TextareaField name="description" label="Description" />
        <SelectField name="element" label="Element" options={ELEMENTS} />
        <ImageField />
      </>
    );

    switch (activeTab) {
      case "yoga":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <TextField name="name" label="Pose Name" required />
              <TextField name="sanskrit_name" label="Sanskrit Name" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <SelectField name="element" label="Element" options={ELEMENTS} />
              <SelectField name="difficulty" label="Difficulty" options={DIFFICULTIES} />
              <NumberField name="duration_minutes" label="Duration (min)" />
            </div>
            <TextareaField name="description" label="Description" />
            <ImageField />
            <ArrayField name="instructions" label="Instructions" />
            <ArrayField name="benefits" label="Benefits" />
            <ChakraField />
          </div>
        );

      case "crystals":
        return (
          <div className="space-y-4">
            <TextField name="name" label="Crystal Name" required />
            <SelectField name="element" label="Element" options={ELEMENTS} />
            <TextareaField name="description" label="Description" />
            <ArrayField name="properties" label="Properties" />
            <ChakraField />
            <ImageField />
          </div>
        );

      case "retreats":
        return (
          <div className="space-y-4">
            <TextField name="name" label="Retreat Name" required />
            <TextareaField name="description" label="Description" />
            <div className="grid grid-cols-2 gap-4">
              <TextField name="location" label="Location" />
              <NumberField name="price" label="Price ($)" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Start Date</label>
                <Input type="date" value={formData.start_date || ""} onChange={(e) => updateField("start_date", e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">End Date</label>
                <Input type="date" value={formData.end_date || ""} onChange={(e) => updateField("end_date", e.target.value)} />
              </div>
            </div>
            <NumberField name="capacity" label="Capacity" />
            <ArrayField name="features" label="Features" />
            <ArrayField name="includes" label="What's Included" />
            <ImageField />
          </div>
        );

      case "books":
        return (
          <div className="space-y-4">
            <TextField name="title" label="Book Title" required />
            <TextField name="author" label="Author" />
            <TextareaField name="description" label="Description" />
            <div className="grid grid-cols-2 gap-4">
              <NumberField name="price" label="Price ($)" />
              <TextField name="purchase_url" label="Purchase URL" />
            </div>
            <ImageField />
          </div>
        );

      case "custom-oracle-cards":
        return (
          <div className="space-y-4">
            <TextField name="name" label="Card Name" required />
            <SelectField name="element" label="Element" options={ELEMENTS} />
            <TextareaField name="meaning" label="Upright Meaning" />
            <TextareaField name="reversed_meaning" label="Reversed Meaning" />
            <ArrayField name="keywords" label="Keywords" />
            <ImageField />
          </div>
        );

      case "live-sessions":
        return (
          <div className="space-y-4">
            <TextField name="title" label="Session Title" required />
            <TextareaField name="description" label="Description" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Date & Time</label>
                <Input type="datetime-local" value={formData.scheduled_at || ""} onChange={(e) => updateField("scheduled_at", e.target.value)} />
              </div>
              <NumberField name="duration_minutes" label="Duration (min)" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <SelectField name="platform" label="Platform" options={["zoom", "youtube", "other"]} />
              <TextField name="join_url" label="Join URL" />
            </div>
            <NumberField name="price" label="Price ($)" />
          </div>
        );

      case "heart-practices":
        return (
          <div className="space-y-4">
            <TextField name="name" label="Practice Name" required />
            <SelectField name="category" label="Category" options={HEART_CATEGORIES} />
            <TextareaField name="description" label="Description" />
            <TextField name="tradition" label="Tradition" />
            <NumberField name="duration_minutes" label="Duration (min)" />
            <ArrayField name="benefits" label="Benefits" />
            <ArrayField name="steps" label="Steps" />
            <TextField name="affirmation" label="Affirmation" />
            <ImageField />
          </div>
        );

      case "shamanic-practices":
        return (
          <div className="space-y-4">
            <TextField name="name" label="Practice Name" required />
            <SelectField name="category" label="Category" options={SHAMANIC_CATEGORIES} />
            <TextareaField name="description" label="Description" />
            <TextField name="tradition" label="Tradition" />
            <NumberField name="duration_minutes" label="Duration (min)" />
            <TextareaField name="preparation" label="Preparation" />
            <ArrayField name="journey_steps" label="Journey Steps" />
            <TextareaField name="safety_notes" label="Safety Notes" />
            <ImageField />
          </div>
        );

      case "elemental-practices":
        return (
          <div className="space-y-4">
            <TextField name="name" label="Practice Name" required />
            <div className="grid grid-cols-2 gap-4">
              <SelectField name="element" label="Element" options={ELEMENTS} />
              <SelectField name="category" label="Category" options={ELEMENTAL_CATEGORIES} />
            </div>
            <TextareaField name="description" label="Description" />
            <div className="grid grid-cols-2 gap-4">
              <SelectField name="difficulty" label="Difficulty" options={DIFFICULTIES} />
              <NumberField name="duration_minutes" label="Duration (min)" />
            </div>
            <ArrayField name="benefits" label="Benefits" />
            <ArrayField name="instructions" label="Instructions" />
            <ImageField />
          </div>
        );

      case "creative-processes":
        return (
          <div className="space-y-4">
            <TextField name="name" label="Process Name" required />
            <SelectField name="category" label="Category" options={CREATIVE_CATEGORIES} />
            <TextareaField name="description" label="Description" />
            <TextField name="tradition" label="Tradition" />
            <NumberField name="duration_minutes" label="Duration (min)" />
            <ArrayField name="materials" label="Materials Needed" />
            <ArrayField name="process_steps" label="Process Steps" />
            <TextField name="spiritual_purpose" label="Spiritual Purpose" />
            <ImageField />
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            {commonFields}
            <ArrayField name="benefits" label="Benefits" />
          </div>
        );
    }
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
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/5 hover:bg-white/10"
                }`}
                data-testid={`tab-${tab.id}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

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
                    {item.difficulty && <Badge variant="outline" className="text-xs">{item.difficulty}</Badge>}
                    {item.duration_minutes && <Badge variant="outline" className="text-xs">{item.duration_minutes} min</Badge>}
                    {item.price > 0 && <Badge variant="outline" className="text-xs">${item.price}</Badge>}
                    {item.category && <Badge variant="outline" className="text-xs capitalize">{item.category.replace(/_/g, " ")}</Badge>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(item)} className="flex-1" data-testid={`edit-${item.id}`}>
                      <Pencil className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(item)} className="text-red-400 hover:bg-red-500/10" data-testid={`delete-${item.id}`}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </motion.div>
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
            {renderForm()}
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
