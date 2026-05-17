import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Settings, LogOut, ChevronRight, Database, Upload, CalendarDays, Sparkles, BookOpen, Radio } from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { ensureAdminToken, logoutAdminSession } from "../components/admin/adminSession";

const quickActions = [
  {
    id: "courses",
    title: "Courses & Paths",
    description: "Manage your course library, program structure, and long-form learning journeys.",
    icon: BookOpen,
    cta: "Open courses",
  },
  {
    id: "astrology_months",
    title: "13 Moon Paths",
    description: "Edit your 13-month path content and seasonal spiritual rhythms.",
    icon: CalendarDays,
    cta: "Open moon paths",
  },
  {
    id: "live_sessions",
    title: "Live Client Spaces",
    description: "Create live yoga, workshops, Q&A rooms, and embedded client session experiences.",
    icon: Radio,
    cta: "Open live sessions",
  },
  {
    id: "yoga_poses",
    title: "Yoga Library",
    description: "Keep your yoga teachings, postures, and sacred movement descriptions in one place.",
    icon: Sparkles,
    cta: "Open yoga library",
  },
];

export default function AdminDashboard({ api: providedApi }) {
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const api = providedApi?.defaults?.baseURL?.replace(/\/api$/, "") || process.env.REACT_APP_BACKEND_URL;
  const loadingPlaceholders = useMemo(() => Array.from({ length: 9 }, (_, idx) => `placeholder-${idx}`), []);
  const visibleCollections = useMemo(
    () => collections.filter((collectionItem) => collectionItem.id !== "audio_files"),
    [collections],
  );

  useEffect(() => {
    bootstrapAdminAccess();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const bootstrapAdminAccess = async () => {
    setLoading(true);
    try {
      await ensureAdminToken(api);
      await fetchCollections();
    } catch {
      toast.error("Please sign in with your admin account to continue");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchCollections = async () => {
    try {
      const res = await fetch(`${api}/api/admin/collections`, {
        credentials: "include",
      });
      if (res.status === 401) {
        throw new Error("expired-admin-token");
      }
      setCollections(await res.json());
    } catch {
      toast.error("Failed to load collections");
      throw new Error("collections-load-failed");
    }
  };

  const logout = async () => {
    try {
      await logoutAdminSession(api);
    } catch {
      // no-op
    }
    navigate("/dashboard");
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
          <p className="text-muted-foreground" data-testid="admin-dashboard-description">Manage the whole temple from one place — courses, 13 moon paths, yoga, live events, media, and sacred content collections.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mb-8" data-testid="admin-dashboard-quick-actions">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.id}
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/admin/manage/${action.id}`)}
                className="rounded-[1.5rem] border border-white/10 bg-card/70 p-5 text-left hover:border-primary/30 hover:-translate-y-0.5 transition-all"
                data-testid={`admin-quick-action-${action.id}`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
                <h3 className="font-serif text-xl mb-2">{action.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{action.description}</p>
                <span className="text-sm text-primary">{action.cta}</span>
              </motion.button>
            );
          })}
        </div>

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
            {loadingPlaceholders.map((placeholderKey) => (
              <div key={placeholderKey} className="h-28 rounded-2xl bg-card/50 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {visibleCollections.map((coll, i) => (
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
