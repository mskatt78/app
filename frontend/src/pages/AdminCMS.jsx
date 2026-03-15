import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Plus, Pencil, Trash2, Save, X, 
  Sparkles, Wind, Droplets, Flame, Mountain, 
  Calendar, Users, BookOpen, Video
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from "sonner";

const AdminCMS = ({ user, api }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("yoga");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});

  const tabs = [
    { id: "yoga", label: "Yoga Poses", icon: Sparkles },
    { id: "mudras", label: "Mudras", icon: Sparkles },
    { id: "breathwork", label: "Breathwork", icon: Wind },
    { id: "crystals", label: "Crystals", icon: Mountain },
    { id: "mantras", label: "Mantras", icon: Sparkles },
    { id: "workshops", label: "Workshops", icon: Users },
    { id: "events", label: "Events", icon: Calendar },
    { id: "courses", label: "Courses", icon: BookOpen },
  ];

  const elements = ["Earth", "Water", "Fire", "Air", "Spirit"];
  const difficulties = ["Beginner", "Intermediate", "Advanced"];

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const getEndpoint = (tab, isAdmin = false) => {
    const endpoints = {
      yoga: isAdmin ? "/admin/yoga/poses" : "/yoga/poses",
      mudras: isAdmin ? "/admin/mudras" : "/mudras",
      breathwork: isAdmin ? "/admin/breathwork" : "/breathwork/sessions",
      crystals: isAdmin ? "/admin/crystals" : "/crystals",
      mantras: isAdmin ? "/admin/mantras" : "/mantras",
      workshops: isAdmin ? "/admin/workshops" : "/workshops",
      events: isAdmin ? "/admin/events" : "/events",
      courses: isAdmin ? "/admin/courses" : "/courses",
    };
    return endpoints[tab] || "/yoga/poses";
  };

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

  const getDefaultFormData = (tab) => {
    const defaults = {
      yoga: {
        name: "", sanskrit_name: "", element: "Earth", description: "",
        instructions: [], benefits: [], chakras: [], duration_minutes: 3,
        difficulty: "Beginner", contraindications: [], image_url: ""
      },
      mudras: {
        name: "", sanskrit_name: "", element: "Earth", description: "",
        instructions: "", benefits: [], image_url: ""
      },
      breathwork: {
        name: "", element: "Earth", description: "", duration_minutes: 10,
        pattern: { inhale: 4, hold: 4, exhale: 4, hold_empty: 0 },
        benefits: [], frequency: "", best_time: "", instructions: ""
      },
      crystals: {
        name: "", element: "Earth", chakras: [], properties: [],
        description: "", image_url: ""
      },
      mantras: {
        name: "", sanskrit: "", translation: "", element: "Spirit",
        chakra: "", benefits: [], audio_url: "", duration_seconds: 10, repetitions: 108
      },
      workshops: {
        title: "", description: "", instructor: "", date: "",
        duration_minutes: 60, location: "", max_participants: 20,
        price: 0, image_url: "", topics: [], requirements: []
      },
      events: {
        title: "", description: "", date: "", time: "", location: "",
        event_type: "workshop", price: 0, image_url: "", capacity: 50
      },
      courses: {
        title: "", description: "", instructor: "", duration_weeks: 4,
        modules: [], price: 0, image_url: "", level: "Beginner"
      }
    };
    return defaults[tab] || {};
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
    if (!confirm(`Are you sure you want to delete "${item.name || item.title}"?`)) return;
    
    try {
      await api.delete(`${getEndpoint(activeTab, true)}/${item.id}`);
      toast.success("Item deleted successfully");
      fetchItems();
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("Failed to delete item");
    }
  };

  const handleSave = async () => {
    try {
      const endpoint = getEndpoint(activeTab, true);
      
      if (editingItem) {
        await api.put(`${endpoint}/${editingItem.id}`, formData);
        toast.success("Item updated successfully");
      } else {
        await api.post(endpoint, formData);
        toast.success("Item created successfully");
      }
      
      setShowForm(false);
      fetchItems();
    } catch (error) {
      console.error("Failed to save:", error);
      toast.error(error.response?.data?.detail || "Failed to save item");
    }
  };

  const handleArrayInput = (field, value) => {
    const arr = value.split("\n").filter(v => v.trim());
    setFormData(prev => ({ ...prev, [field]: arr }));
  };

  const renderForm = () => {
    switch (activeTab) {
      case "yoga":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Name</label>
                <Input
                  value={formData.name || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Mountain Pose"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Sanskrit Name</label>
                <Input
                  value={formData.sanskrit_name || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, sanskrit_name: e.target.value }))}
                  placeholder="Tadasana"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Element</label>
                <Select value={formData.element} onValueChange={(v) => setFormData(prev => ({ ...prev, element: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {elements.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Difficulty</label>
                <Select value={formData.difficulty} onValueChange={(v) => setFormData(prev => ({ ...prev, difficulty: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {difficulties.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Duration (min)</label>
                <Input
                  type="number"
                  value={formData.duration_minutes || 3}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Description</label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the pose..."
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Image URL</label>
              <Input
                value={formData.image_url || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Instructions (one per line)</label>
              <Textarea
                value={(formData.instructions || []).join("\n")}
                onChange={(e) => handleArrayInput("instructions", e.target.value)}
                placeholder="Step 1...&#10;Step 2..."
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Benefits (one per line)</label>
              <Textarea
                value={(formData.benefits || []).join("\n")}
                onChange={(e) => handleArrayInput("benefits", e.target.value)}
                placeholder="Improves balance...&#10;Strengthens legs..."
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Chakras (one per line)</label>
              <Textarea
                value={(formData.chakras || []).join("\n")}
                onChange={(e) => handleArrayInput("chakras", e.target.value)}
                placeholder="Root&#10;Heart"
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Contraindications (one per line)</label>
              <Textarea
                value={(formData.contraindications || []).join("\n")}
                onChange={(e) => handleArrayInput("contraindications", e.target.value)}
                placeholder="Knee injury&#10;Pregnancy"
                rows={2}
              />
            </div>
          </div>
        );

      case "workshops":
      case "events":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Title</label>
              <Input
                value={formData.title || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Workshop title..."
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Description</label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Date</label>
                <Input
                  type="date"
                  value={formData.date || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              {activeTab === "events" && (
                <div>
                  <label className="text-sm text-muted-foreground">Time</label>
                  <Input
                    type="time"
                    value={formData.time || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              )}
              {activeTab === "workshops" && (
                <div>
                  <label className="text-sm text-muted-foreground">Instructor</label>
                  <Input
                    value={formData.instructor || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Location</label>
                <Input
                  value={formData.location || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Price ($)</label>
                <Input
                  type="number"
                  value={formData.price || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Image URL</label>
              <Input
                value={formData.image_url || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Name</label>
              <Input
                value={formData.name || formData.title || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Element</label>
              <Select value={formData.element || "Earth"} onValueChange={(v) => setFormData(prev => ({ ...prev, element: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {elements.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Description</label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Image URL</label>
              <Input
                value={formData.image_url || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Benefits (one per line)</label>
              <Textarea
                value={(formData.benefits || []).join("\n")}
                onChange={(e) => handleArrayInput("benefits", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="admin-cms">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
              data-testid="back-btn"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Content</p>
              <h1 className="text-xl font-serif">Admin <span className="italic text-primary">CMS</span></h1>
            </div>
          </div>
          
          <Button onClick={handleCreate} className="bg-primary" data-testid="create-btn">
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card/50 border border-white/10 p-1 flex flex-wrap gap-1">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
                data-testid={`tab-${tab.id}`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <p>No {tab.label.toLowerCase()} yet.</p>
                  <Button onClick={handleCreate} variant="outline" className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Create your first
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="p-4 rounded-xl bg-card border border-white/10 flex items-center justify-between group"
                      data-testid={`item-${item.id}`}
                    >
                      <div className="flex items-center gap-4">
                        {item.image_url && (
                          <img 
                            src={item.image_url} 
                            alt={item.name || item.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <h3 className="font-medium">{item.name || item.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {item.element && <span className="text-primary">{item.element}</span>}
                            {item.difficulty && <span className="ml-2">{item.difficulty}</span>}
                            {item.date && <span className="ml-2">{item.date}</span>}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          data-testid={`edit-${item.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item)}
                          className="text-red-400 hover:text-red-300"
                          data-testid={`delete-${item.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-card border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {editingItem ? "Edit" : "Create New"} {tabs.find(t => t.id === activeTab)?.label.slice(0, -1)}
            </DialogTitle>
          </DialogHeader>
          
          {renderForm()}
          
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-primary" data-testid="save-btn">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCMS;
