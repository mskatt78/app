import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Settings, LogOut, Plus, Search, ChevronRight, Database, Upload } from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const api = process.env.REACT_APP_BACKEND_URL;

  const token = localStorage.getItem("admin_token");

  useEffect(() => {
    if (!token) { navigate("/admin/login"); return; }
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const res = await fetch(`${api}/api/admin/collections`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { localStorage.removeItem("admin_token"); navigate("/admin/login"); return; }
      setCollections(await res.json());
    } catch {
      toast.error("Failed to load collections");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin/login");
    toast.success("Logged out");
  };

  return (
    <div className="min-h-screen bg-background" data-testid="admin-dashboard">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between bg-card/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Settings className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="font-serif text-lg leading-none">Admin CMS</h1>
            <p className="text-xs text-muted-foreground">Shamanic Elements Soul Temple 2.0</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-muted-foreground">
            View Site
          </Button>
          <Button variant="ghost" size="sm" onClick={logout} className="text-destructive">
            <LogOut className="w-4 h-4 mr-1" /> Logout
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-serif mb-2">Content Manager</h2>
          <p className="text-muted-foreground">Manage all content across the platform — add, edit, and upload media.</p>
        </div>

        {/* Quick Upload Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-5 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Upload Audio & Images</h3>
              <p className="text-sm text-muted-foreground">Upload MP3 guided meditations, activations, or custom images to use across your content.</p>
            </div>
          </div>
          <Button onClick={() => navigate("/admin/manage/audio_files")} data-testid="upload-audio-btn">
            Open Media Library
          </Button>
        </motion.div>

        {/* Collections Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array(9).fill(0).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-card/50 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {collections.filter(c => c.id !== "audio_files").map((coll, i) => (
              <motion.button
                key={coll.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/admin/manage/${coll.id}`)}
                data-testid={`collection-card-${coll.id}`}
                className="p-5 rounded-2xl bg-card border border-white/10 hover:border-primary/40 hover:bg-card/80 text-left transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{coll.icon}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-medium text-sm mb-1">{coll.name}</h3>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Database className="w-3 h-3" />
                  <span className="text-xs">{coll.count} entries</span>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
