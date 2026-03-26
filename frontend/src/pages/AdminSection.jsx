import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Plus, Pencil, Trash2, Search, X, Save, Upload,
  Loader2, Music, Image, Link, Copy, CheckCircle
} from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

const AUDIO_COLLECTION = "audio_files";

const FIELD_CONFIG = {
  courses: ["title", "category", "level", "description", "instructor", "duration", "lessons", "format", "price", "status", "highlights", "image_url", "video_url", "registration_link"],
  community_posts: ["author_name", "title", "type", "content", "element", "tags", "status", "image_url"],
  sacred_geometry: ["name", "element", "description", "symbolism", "how_to_draw", "image_url"],
  oracle_cards: ["name", "element", "meaning", "reversed_meaning", "image_url", "keywords"],
  tarot_cards: ["name", "arcana", "number", "upright_meaning", "reversed_meaning", "description", "image_url"],
  ancient_wisdom: ["name", "tradition", "type", "description", "teaching", "practice", "image_url"],
  somatic_practices: ["name", "type", "element", "description", "benefits", "duration", "instructions", "image_url"],
  sound_frequencies: ["name", "frequency", "element", "category", "ambient_type", "description", "benefits", "practice", "audio_url", "image_url"],
  crystals: ["name", "color", "element", "chakra", "description", "properties", "uses", "image_url"],
  mantras: ["name", "tradition", "text", "meaning", "pronunciation", "benefits", "practice"],
  meditations: ["name", "type", "element", "duration_minutes", "description", "visualization", "instructions", "image_url"],
  mudras: ["name", "type", "description", "benefits", "instructions", "image_url"],
  runes: ["name", "symbol", "phonetic", "meaning", "description", "reversed_meaning", "image_url"],
  sacred_guardians: ["name", "type", "element", "description", "gifts", "invocation", "image_url"],
  retreats: ["title", "status", "description", "location", "start_date", "end_date", "duration_days", "max_participants", "price", "deposit", "facilitator", "highlights", "includes", "accommodation", "healing_modalities", "registration_link", "image_url"],
  videos: ["title", "category", "description", "video_url", "thumbnail_url", "duration", "practice_type"],
  breathwork_sessions: ["name", "element", "description", "duration_minutes", "frequency", "benefits", "instructions", "image_url"],
  shamanic_practices: ["name", "category", "element", "description", "duration_minutes", "benefits", "journey_steps", "image_url"],
  mindfulness_practices: ["name", "category", "element", "description", "duration_minutes", "benefits", "instructions", "image_url"],
  grounding_exercises: ["name", "element", "description", "duration_minutes", "benefits", "instructions", "background_audio", "image_url"],
  heart_practices: ["name", "category", "element", "description", "duration_minutes", "benefits", "steps", "affirmations", "image_url"],
  creative_processes: ["name", "element", "description", "duration_minutes", "benefits", "materials", "instructions", "image_url"],
  elemental_practices: ["name", "element", "description", "duration_minutes", "benefits", "instructions", "image_url"],
  yoga_poses: ["name", "sanskrit_name", "element", "category", "description", "benefits", "instructions", "image_url"],
};

const TEXTAREA_FIELDS = new Set([
  "description", "meaning", "reversed_meaning", "teaching", "practice", "instructions",
  "benefits", "uses", "text", "invocation", "gifts", "upright_meaning",
  "highlights", "includes", "accommodation", "healing_modalities",
  "content", "visualization", "journey_steps", "steps", "affirmations",
  "materials", "how_to_draw", "symbolism", "lessons"
]);

const IMAGE_FIELDS = new Set(["image_url", "thumbnail_url"]);
const AUDIO_FIELDS = new Set(["audio_url"]);
const VIDEO_FIELDS = new Set(["video_url"]);

function FieldInput({ field, value, onChange, onUpload, uploadLoading }) {
  const isTextarea = TEXTAREA_FIELDS.has(field);
  const isImage = IMAGE_FIELDS.has(field);
  const isAudio = AUDIO_FIELDS.has(field);
  const isVideo = VIDEO_FIELDS.has(field);
  const fileRef = useRef();

  if (isVideo) {
    return (
      <div className="space-y-2">
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="YouTube/Vimeo URL or direct video URL"
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50"
        />
        <p className="text-xs text-muted-foreground">Paste a YouTube, Vimeo, or direct .mp4 video link</p>
      </div>
    );
  }

  if (isImage || isAudio) {
    const accept = isImage ? "image/*" : "audio/mp3,audio/mpeg,audio/*";
    const icon = isImage ? <Image className="w-4 h-4" /> : <Music className="w-4 h-4" />;
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={isImage ? "https://... or upload below" : "https://... or upload below"}
            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploadLoading}
            className="px-3 py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs flex items-center gap-1 hover:bg-primary/20 transition-colors"
          >
            {uploadLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
            Upload
          </button>
          <input ref={fileRef} type="file" accept={accept} className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0], field)} />
        </div>
        {isImage && value && (
          <img src={value} alt="preview" className="h-24 w-auto rounded-lg object-cover border border-white/10" onError={(e) => e.target.style.display = "none"} />
        )}
        {isAudio && value && (
          <audio controls src={value} className="w-full h-8" style={{ filter: "invert(0.8)" }} />
        )}
      </div>
    );
  }

  if (isTextarea) {
    return (
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50 resize-none"
      />
    );
  }

  return (
    <input
      type="text"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50"
    />
  );
}

function ItemModal({ collection, item, onClose, onSave, api, token }) {
  const fields = FIELD_CONFIG[collection] || Object.keys(item || {}).filter(k => k !== "id" && k !== "_id" && k !== "created_at" && k !== "updated_at");
  const [formData, setFormData] = useState(() => {
    const base = {};
    fields.forEach(f => { base[f] = item?.[f] || ""; });
    if (item?.id) base.id = item.id;
    return base;
  });
  const [saving, setSaving] = useState(false);
  const [uploadLoading, setUploadLoading] = useState({});

  const handleUpload = async (file, field) => {
    setUploadLoading(p => ({ ...p, [field]: true }));
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${api}/api/admin/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setFormData(p => ({ ...p, [field]: data.public_url }));
      toast.success("File uploaded successfully");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploadLoading(p => ({ ...p, [field]: false }));
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
        onClick={e => e.stopPropagation()}
        data-testid="item-modal"
      >
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-white/10 bg-card z-10">
          <h3 className="font-serif text-lg">{item ? "Edit Entry" : "New Entry"}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-4">
          {fields.map(field => (
            <div key={field}>
              <label className="block text-xs text-muted-foreground mb-1 capitalize">{field.replace(/_/g, " ")}</label>
              <FieldInput
                field={field}
                value={formData[field]}
                onChange={val => setFormData(p => ({ ...p, [field]: val }))}
                onUpload={handleUpload}
                uploadLoading={uploadLoading[field]}
              />
            </div>
          ))}
        </div>
        <div className="sticky bottom-0 p-4 border-t border-white/10 bg-card flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1" data-testid="save-item-btn">
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save</>}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function AudioLibrary({ api, token }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(null);
  const fileRef = useRef();

  useEffect(() => { fetchFiles(); }, []);

  const fetchFiles = async () => {
    try {
      const res = await fetch(`${api}/api/admin/audio_files/items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFiles(data.items || []);
    } catch { toast.error("Failed to load files"); }
    finally { setLoading(false); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${api}/api/admin/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setFiles(p => [data, ...p]);
      toast.success(`Uploaded: ${file.name}`);
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); e.target.value = ""; }
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this file?")) return;
    try {
      await fetch(`${api}/api/admin/audio_files/items/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles(p => p.filter(f => f.id !== id));
      toast.success("File removed");
    } catch { toast.error("Failed to remove"); }
  };

  const copyUrl = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast.success("URL copied to clipboard");
  };

  const formatSize = (bytes) => {
    if (!bytes) return "—";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button onClick={() => fileRef.current?.click()} disabled={uploading} data-testid="upload-file-btn">
          {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading...</> : <><Upload className="w-4 h-4 mr-2" />Upload File</>}
        </Button>
        <span className="text-xs text-muted-foreground">MP3, WAV, PNG, JPG up to 50MB</span>
        <input ref={fileRef} type="file" accept="audio/*,image/*" className="hidden" onChange={handleUpload} />
      </div>
      {loading ? (
        <div className="space-y-2">{Array(4).fill(0).map((_, i) => <div key={i} className="h-16 rounded-xl bg-card/50 animate-pulse" />)}</div>
      ) : files.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <Upload className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No files uploaded yet</p>
          <p className="text-xs mt-1">Upload audio or images to use across your content</p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map(f => (
            <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-white/10" data-testid={`file-item-${f.id}`}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 flex-shrink-0">
                {f.file_type === "audio" ? <Music className="w-4 h-4 text-primary" /> : <Image className="w-4 h-4 text-cyan-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{f.original_filename}</p>
                <p className="text-xs text-muted-foreground">{formatSize(f.size)} · {new Date(f.created_at).toLocaleDateString()}</p>
              </div>
              {f.file_type === "audio" && f.public_url && (
                <audio controls src={f.public_url} className="h-7 w-32" style={{ filter: "invert(0.7)" }} />
              )}
              {f.file_type === "image" && f.public_url && (
                <img src={f.public_url} alt={f.original_filename} className="h-10 w-10 rounded object-cover" onError={e => e.target.style.display = "none"} />
              )}
              <button onClick={() => copyUrl(f.public_url, f.id)} className="text-muted-foreground hover:text-primary transition-colors" title="Copy URL">
                {copied === f.id ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button onClick={() => handleDelete(f.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminSection() {
  const { collection } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalItem, setModalItem] = useState(undefined); // undefined=closed, null=new, obj=edit
  const [deleting, setDeleting] = useState(null);

  const api = process.env.REACT_APP_BACKEND_URL;
  const token = localStorage.getItem("admin_token");
  const isAudio = collection === AUDIO_COLLECTION;
  const meta = {
    oracle_cards: { name: "Oracle Cards", icon: "🔮" },
    tarot_cards: { name: "Tarot Cards", icon: "🃏" },
    ancient_wisdom: { name: "Ancient Wisdom", icon: "📿" },
    somatic_practices: { name: "Somatic Practices", icon: "🧘" },
    sound_frequencies: { name: "Sound Frequencies", icon: "🎵" },
    crystals: { name: "Crystals", icon: "💎" },
    mantras: { name: "Mantras", icon: "🕉️" },
    meditations: { name: "Meditations", icon: "🌙" },
    mudras: { name: "Mudras", icon: "🤲" },
    runes: { name: "Runes", icon: "ᚱ" },
    sacred_guardians: { name: "Sacred Guardians", icon: "🦁" },
    retreats: { name: "Retreats", icon: "🏔️" },
    videos: { name: "Practice Videos", icon: "🎬" },
    audio_files: { name: "Audio & Media Library", icon: "🎧" },
  }[collection] || { name: collection, icon: "📁" };

  useEffect(() => {
    if (!token) { navigate("/admin/login"); return; }
    if (!isAudio) fetchItems();
  }, [collection, page, search]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 30, ...(search ? { search } : {}) });
      const res = await fetch(`${api}/api/admin/${collection}/items?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { localStorage.removeItem("admin_token"); navigate("/admin/login"); return; }
      const data = await res.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch { toast.error("Failed to load items"); }
    finally { setLoading(false); }
  };

  const handleSave = async (formData) => {
    const isNew = !formData.id || formData.id === undefined;
    try {
      const url = isNew
        ? `${api}/api/admin/${collection}/items`
        : `${api}/api/admin/${collection}/items/${formData.id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Save failed");
      const saved = await res.json();
      if (isNew) {
        setItems(p => [saved, ...p]);
        setTotal(t => t + 1);
      } else {
        setItems(p => p.map(i => i.id === saved.id ? saved : i));
      }
      toast.success(isNew ? "Entry created" : "Entry updated");
    } catch { toast.error("Failed to save"); throw new Error("Save failed"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this entry? This cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`${api}/api/admin/${collection}/items/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setItems(p => p.filter(i => i.id !== id));
      setTotal(t => t - 1);
      toast.success("Entry deleted");
    } catch { toast.error("Failed to delete"); }
    finally { setDeleting(null); }
  };

  const getPreviewFields = (item) => {
    const keys = ["name", "title", "original_filename"];
    const primary = keys.find(k => item[k]) || Object.keys(item).find(k => k !== "id" && k !== "_id" && typeof item[k] === "string");
    const secondary = ["element", "type", "tradition", "frequency", "arcana"].find(k => item[k]);
    return { primary: item[primary] || "—", secondary: item[secondary] };
  };

  return (
    <div className="min-h-screen bg-background" data-testid="admin-section">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center gap-4 bg-card/50 backdrop-blur-xl sticky top-0 z-10">
        <button onClick={() => navigate("/admin")} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-xl">{meta.icon}</span>
        <div>
          <h1 className="font-serif text-lg leading-none">{meta.name}</h1>
          {!isAudio && <p className="text-xs text-muted-foreground">{total} entries</p>}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {isAudio ? (
          <AudioLibrary api={api} token={token} />
        ) : (
          <>
            {/* Toolbar */}
            <div className="flex items-center gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder={`Search ${meta.name}...`}
                  data-testid="search-input"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-card border border-white/10 text-sm focus:outline-none focus:border-primary/50"
                />
              </div>
              <Button onClick={() => setModalItem(null)} data-testid="add-item-btn">
                <Plus className="w-4 h-4 mr-1" /> Add New
              </Button>
            </div>

            {/* Items List */}
            {loading ? (
              <div className="space-y-2">{Array(8).fill(0).map((_, i) => <div key={i} className="h-16 rounded-xl bg-card/50 animate-pulse" />)}</div>
            ) : items.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                <p>No entries found</p>
                <Button className="mt-4" onClick={() => setModalItem(null)}>Add First Entry</Button>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map(item => {
                  const { primary, secondary } = getPreviewFields(item);
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      className="flex items-center gap-4 p-4 rounded-xl bg-card border border-white/10 hover:border-white/20 transition-colors group"
                      data-testid={`item-row-${item.id}`}
                    >
                      {item.image_url && (
                        <img src={item.image_url} alt={primary} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" onError={e => e.target.style.display = "none"} />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{primary}</p>
                        {secondary && <p className="text-xs text-muted-foreground">{secondary}</p>}
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setModalItem(item)} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors" data-testid={`edit-btn-${item.id}`}>
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deleting === item.id}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          data-testid={`delete-btn-${item.id}`}
                        >
                          {deleting === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {total > 30 && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <span className="text-sm text-muted-foreground">Page {page} of {Math.ceil(total / 30)}</span>
                <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 30)} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {modalItem !== undefined && (
          <ItemModal
            collection={collection}
            item={modalItem}
            onClose={() => setModalItem(undefined)}
            onSave={handleSave}
            api={api}
            token={token}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
