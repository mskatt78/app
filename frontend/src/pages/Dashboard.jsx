import { useCallback, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Leaf, Eye, Wind, Moon, Sparkles, Heart, Waves, Mountain,
  LogOut, Menu, X, ChevronRight, Sun, User, Star, Clock, Trophy, BookOpen, Settings,
  Brain, Compass, Hash, Shield, BarChart3, Palette, Feather, Zap, Radio, MapPin, CreditCard,
  Flame, Award, Play, ExternalLink
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { toast } from "sonner";

// ─── Practice Streak Widget ────────────────────────────────────────────────
const StreakWidget = ({ onJournalClick }) => {
  const { streak, milestone, thisWeek, weekDots } = useMemo(() => {
    const raw = localStorage.getItem("practiceJournalEntries");
    const entries = raw ? JSON.parse(raw) : [];
    if (!entries.length) return { streak: 0, milestone: null, thisWeek: 0, weekDots: Array(7).fill(false) };

    const today = new Date(); today.setHours(0,0,0,0);
    const dayMs = 86400000;

    // Calculate streak
    const datesWithEntry = new Set(
      entries.map(e => { const d = new Date(e.date || e.created_at); d.setHours(0,0,0,0); return d.getTime(); })
    );
    let streak = 0;
    let check = new Date(today);
    while (datesWithEntry.has(check.getTime())) {
      streak++;
      check = new Date(check.getTime() - dayMs);
    }

    // This week dots (Mon-Sun)
    const weekDots = Array(7).fill(false);
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday.getTime() + i * dayMs);
      weekDots[i] = datesWithEntry.has(day.getTime());
    }

    const thisWeek = weekDots.filter(Boolean).length;

    const milestones = [
      { days: 40, label: "Sacred 40 ✦", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
      { days: 21, label: "21-Day Initiation ✦", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" },
      { days: 14, label: "Fortnight Keeper ✦", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" },
      { days: 7, label: "7-Day Guardian ✦", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
      { days: 3, label: "3-Day Seeker ✦", color: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/30" },
    ];
    const milestone = milestones.find(m => streak >= m.days) || null;

    return { streak, milestone, thisWeek, weekDots };
  }, []);

  const DAYS = [
    { id: "mon", label: "M", offset: 0 },
    { id: "tue", label: "T", offset: 1 },
    { id: "wed", label: "W", offset: 2 },
    { id: "thu", label: "T", offset: 3 },
    { id: "fri", label: "F", offset: 4 },
    { id: "sat", label: "S", offset: 5 },
    { id: "sun", label: "S", offset: 6 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
      data-testid="streak-widget"
    >
      {/* Flame + count */}
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center">
          <Flame className="w-6 h-6 text-amber-400" />
          <span className="text-lg font-bold text-amber-300 leading-none">{streak}</span>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Practice Streak</p>
          <p className="font-serif text-xl">{streak === 1 ? "1 day" : `${streak} days`}</p>
          {milestone && (
            <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${milestone.bg} ${milestone.color}`}>
              {milestone.label}
            </span>
          )}
          {streak === 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">Begin your practice today</p>
          )}
        </div>
      </div>

      {/* Week dots */}
      <div className="flex-1 sm:text-center">
        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">This Week — {thisWeek}/7</p>
        <div className="flex gap-2">
          {DAYS.map((day) => (
            <div key={day.id} className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full border transition-all ${weekDots[day.offset] ? "bg-amber-500/30 border-amber-500/60" : "bg-white/5 border-white/10"}`}>
                {weekDots[day.offset] && <Flame className="w-full h-full p-1.5 text-amber-400" />}
              </div>
              <span className="text-[9px] text-muted-foreground">{day.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Journal CTA */}
      <Button size="sm" variant="outline" onClick={onJournalClick} className="text-amber-400 border-amber-500/30 hover:bg-amber-500/10 flex-shrink-0" data-testid="streak-journal-btn">
        <BookOpen className="w-3 h-3 mr-1" /> Journal
      </Button>
    </motion.div>
  );
};

// ─── Video of the Day Widget ────────────────────────────────────────────────
const VideoOfDayWidget = ({ api, onViewAll }) => {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchVideoOfDay = useCallback(async () => {
    try {
      const response = await api.get("/videos");
      const videos = response.data || [];
      if (videos.length > 0) {
        // Get a "daily" video based on day of year
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        const videoIndex = dayOfYear % videos.length;
        setVideo(videos[videoIndex]);
      }
    } catch (error) {
      console.error("Failed to fetch video of the day:", error);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchVideoOfDay();
  }, [fetchVideoOfDay]);

  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : null;
  };

  const getThumbnail = (url) => {
    const videoId = getYouTubeId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  };

  const categoryColors = {
    angel_guidance: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
    colour_therapy: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
    aromatherapy: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
    art_therapy: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20" },
    feminine: { bg: "bg-pink-500/10", text: "text-pink-400", border: "border-pink-500/20" },
    chakra: { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/20" },
    kundalini: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
    drumming: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
    meditation: { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20" },
    default: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" }
  };

  const getCategoryStyle = (category) => categoryColors[category] || categoryColors.default;

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-card/50 border border-white/10 animate-pulse"
      >
        <div className="h-40 bg-white/5 rounded-xl mb-4" />
        <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
        <div className="h-3 bg-white/5 rounded w-1/2" />
      </motion.div>
    );
  }

  if (!video) return null;

  const thumbnail = getThumbnail(video.video_url);
  const catStyle = getCategoryStyle(video.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl overflow-hidden ${catStyle.bg} border ${catStyle.border} transition-all duration-500 hover:scale-[1.01]`}
      data-testid="video-of-day"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden group cursor-pointer"
           onClick={() => window.open(video.video_url, '_blank')}>
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-white/5 flex items-center justify-center">
            <Play className={`w-12 h-12 ${catStyle.text}`} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm bg-white/20">
            <Play className="w-7 h-7 ml-1 text-white" fill="white" />
          </div>
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${catStyle.bg} ${catStyle.text}`}>
            {video.category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>

        {/* Duration */}
        {video.duration && (
          <div className="absolute bottom-3 right-3">
            <span className="px-2 py-1 rounded-full text-xs backdrop-blur-sm flex items-center gap-1 bg-black/60 text-white">
              <Clock className="w-3 h-3" /> {video.duration}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Video of the Day</p>
            <h4 className="text-lg font-serif mb-2 line-clamp-2">{video.title}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          <a
            href={video.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 text-sm font-medium ${catStyle.text} hover:underline`}
          >
            <Play className="w-4 h-4" /> Watch Now
          </a>
          <Button variant="ghost" size="sm" onClick={onViewAll} className="text-muted-foreground hover:text-primary">
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const adminEmails = new Set(["mskatt78@gmail.com", "skywatersacredembodiments@gmail.com"]);

// ─── Today's Sacred Practice Widget ────────────────────────────────────────
const SacredPracticeWidget = ({ api, navigate }) => {
  const [practice, setPractice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/daily-practice")
      .then(r => setPractice(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [api]);

  if (loading) return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
      className="rounded-2xl border border-white/10 bg-card/50 p-5 animate-pulse">
      <div className="h-4 bg-white/5 rounded w-1/3 mb-3" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-24 bg-white/5 rounded-xl" />
        <div className="h-24 bg-white/5 rounded-xl" />
      </div>
    </motion.div>
  );
  if (!practice) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
      className="rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl p-5"
      data-testid="sacred-practice-widget"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Today's Sacred Practice</p>
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-indigo-300">{practice.moon_phase}</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-sm text-muted-foreground">{practice.day_theme}</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {practice.morning_practice && (
          <div
            onClick={() => navigate("/chakra-cleansing")}
            className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 cursor-pointer hover:bg-amber-500/10 transition-all group"
            data-testid="morning-practice-card"
          >
            <p className="text-[10px] text-amber-400 uppercase tracking-wider mb-1">Morning</p>
            <p className="text-sm font-medium text-amber-100 group-hover:text-amber-200 transition-colors leading-tight">{practice.morning_practice.name}</p>
            {practice.morning_practice.duration_minutes && (
              <p className="text-[10px] text-muted-foreground mt-1">{practice.morning_practice.duration_minutes} min</p>
            )}
          </div>
        )}
        {practice.evening_practice && (
          <div
            onClick={() => navigate("/yoga")}
            className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 cursor-pointer hover:bg-indigo-500/10 transition-all group"
            data-testid="evening-practice-card"
          >
            <p className="text-[10px] text-indigo-400 uppercase tracking-wider mb-1">Evening</p>
            <p className="text-sm font-medium text-indigo-100 group-hover:text-indigo-200 transition-colors leading-tight">{practice.evening_practice.name}</p>
            {practice.evening_practice.duration_minutes && (
              <p className="text-[10px] text-muted-foreground mt-1">{practice.evening_practice.duration_minutes} min</p>
            )}
          </div>
        )}
      </div>
      {practice.guidance && (
        <p className="text-xs text-muted-foreground/70 italic mt-3 leading-relaxed line-clamp-2">{practice.guidance}</p>
      )}
    </motion.div>
  );
};

const Dashboard = ({ user, api }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAdminUser = user?.email && adminEmails.has(user.email.toLowerCase());
  const [dailyData, setDailyData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Admin emails for showing admin link
  const ADMIN_EMAILS = [
    "skywatersacredembodiments@gmail.com",
    "mskatt78@gmail.com",
  ].map(e => e.toLowerCase());
  
  const isAdmin = user && ADMIN_EMAILS.includes((user.email || "").toLowerCase());

  const navItems = [
    { icon: Leaf, label: "Yoga", path: "/yoga", element: "earth" },
    { icon: Eye, label: "Oracle", path: "/oracle", element: "spirit" },
    { icon: Wind, label: "Breathwork", path: "/breathwork", element: "air" },
    { icon: Brain, label: "Mindfulness", path: "/mindfulness", element: "air" },
    { icon: Compass, label: "Meditations", path: "/meditations", element: "spirit" },
    { icon: Moon, label: "Astrology", path: "/astrology", element: "water" },
    { icon: Star, label: "Birth Chart", path: "/birth-chart", element: "spirit" },
    { icon: Hash, label: "Numerology", path: "/numerology", element: "fire" },
    { icon: Sparkles, label: "Crystals", path: "/crystals", element: "spirit" },
    { icon: Heart, label: "Mantras", path: "/mantras", element: "fire" },
    { icon: Sun, label: "Mudras", path: "/mudras", element: "fire" },
    { icon: Waves, label: "Somatic", path: "/somatic", element: "water" },
    { icon: Mountain, label: "Grounding", path: "/grounding", element: "earth" },
    // New Shamanic Sections
    { icon: Zap, label: "Elemental", path: "/elemental-practices", element: "spirit" },
    { icon: Mountain, label: "Altars", path: "/earth-altars", element: "earth" },
    { icon: Palette, label: "Creative", path: "/creative-processes", element: "spirit" },
    { icon: Heart, label: "Heart", path: "/heart-practices", element: "water" },
    { icon: Feather, label: "Shamanic", path: "/shamanic-practices", element: "spirit" },
    // User Features
    { icon: BarChart3, label: "Practice Log", path: "/practice-log", element: "fire" },
    { icon: Star, label: "Favorites", path: "/favorites", element: "fire" },
    { icon: Clock, label: "Rituals", path: "/rituals", element: "spirit" },
    { icon: Trophy, label: "Achievements", path: "/achievements", element: "fire" },
    { icon: BookOpen, label: "Journal", path: "/journal", element: "water" },
    // New Content
    { icon: Radio, label: "Live", path: "/live", element: "fire" },
    { icon: MapPin, label: "Retreats", path: "/retreats", element: "earth" },
    { icon: BookOpen, label: "Book", path: "/books", element: "spirit" },
    // Account
    { icon: CreditCard, label: "Membership", path: "/pricing", element: "fire" },
    // Admin - only visible to admin users
    ...(isAdmin ? [{ icon: Shield, label: "Admin CMS", path: "/admin", element: "spirit" }] : []),
  ];

  const elementColors = {
    earth: "text-emerald-400",
    water: "text-blue-400",
    fire: "text-orange-400",
    air: "text-cyan-400",
    spirit: "text-purple-400",
  };

  const elementBg = {
    earth: "bg-emerald-500/10 border-emerald-500/20",
    water: "bg-blue-500/10 border-blue-500/20",
    fire: "bg-orange-500/10 border-orange-500/20",
    air: "bg-cyan-500/10 border-cyan-500/20",
    spirit: "bg-purple-500/10 border-purple-500/20",
  };

  const fetchDailyData = useCallback(async () => {
    try {
      const response = await api.get("/dashboard/daily");
      setDailyData(response.data);
    } catch (error) {
      console.error("Failed to fetch daily data:", error);
      toast.error("Could not load daily guidance");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchDailyData();
  }, [fetchDailyData]);

  const quickPracticeItems = useMemo(() => ([
    ...navItems.slice(0, 7),
    { path: '/demo', label: 'Demo', icon: Sparkles, element: 'spirit' },
    ...(isAdminUser ? [{ path: '/admin', label: 'Admin', icon: Shield, element: 'spirit' }] : []),
  ]), [isAdminUser, navItems]);

  const deepJourneyItems = useMemo(
    () => navItems.filter((item) => ['/elemental-practices', '/earth-altars', '/creative-processes', '/heart-practices', '/shamanic-practices'].includes(item.path)),
    [navItems],
  );

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      toast.success("Blessed journey, until we meet again");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/", { replace: true });
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-background flex" data-testid="dashboard">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/5 bg-card/30 backdrop-blur-xl">
        <div className="p-6 border-b border-white/5">
          <h1 className="text-xl font-serif italic text-primary">Soul Temple 2.0</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              data-testid={`nav-${item.label.toLowerCase()}`}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl 
                         text-muted-foreground hover:text-foreground
                         hover:bg-white/5 transition-all duration-300 group`}
            >
              <item.icon className={`w-5 h-5 ${elementColors[item.element]} 
                                    group-hover:scale-110 transition-transform`} strokeWidth={1.5} />
              <span className="text-sm">{item.label}</span>
              <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 
                                      transition-opacity" />
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          {isAdminUser && (
            <button
              data-testid="dashboard-admin-btn"
              onClick={() => navigate("/admin")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-primary hover:bg-primary/10 transition-all duration-300"
            >
              <Shield className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-sm">Temple Admin</span>
            </button>
          )}
          <button
            data-testid="settings-btn"
            onClick={() => navigate("/settings")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl 
                      text-muted-foreground hover:text-foreground
                      hover:bg-white/5 transition-all duration-300"
          >
            <Settings className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-sm">Settings</span>
          </button>
          <button
            data-testid="logout-btn"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl 
                      text-muted-foreground hover:text-destructive
                      hover:bg-destructive/10 transition-all duration-300"
          >
            <LogOut className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 lg:hidden"
        >
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r border-white/5"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h1 className="text-xl font-serif italic text-primary">Soul Temple 2.0</h1>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl 
                             text-muted-foreground hover:text-foreground
                             hover:bg-white/5 transition-all duration-300`}
                >
                  <item.icon className={`w-5 h-5 ${elementColors[item.element]}`} strokeWidth={1.5} />
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="p-4 border-t border-white/5">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl 
                          text-muted-foreground hover:text-destructive transition-all"
              >
                <LogOut className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </motion.aside>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 p-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
              <button
                data-testid="mobile-menu-btn"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-6 h-6 text-muted-foreground" />
              </button>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {dailyData?.current_moon?.name || 'Loading...'}
                </p>
                <h2 className="text-lg font-serif">
                  {getGreeting()}, <span className="text-primary italic">{user?.name?.split(' ')[0]}</span>
                </h2>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {isAdminUser && (
                <Button variant="outline" onClick={() => navigate('/admin')} className="hidden sm:flex" data-testid="dashboard-header-admin-btn">
                  <Shield className="w-4 h-4 mr-2" /> Admin
                </Button>
              )}
              <Avatar className="w-10 h-10 border-2 border-primary/20">
                <AvatarImage src={user?.picture} alt={user?.name} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.name?.charAt(0) || <User className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 max-w-6xl mx-auto space-y-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Current Moon Card */}
              {dailyData?.current_moon && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-8 rounded-2xl border backdrop-blur-xl ${elementBg[dailyData.current_moon.element.toLowerCase()]}`}
                >
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-shrink-0">
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center 
                                      ${elementBg[dailyData.current_moon.element.toLowerCase()]}`}>
                        <Moon className={`w-10 h-10 ${elementColors[dailyData.current_moon.element.toLowerCase()]}`} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                        Current Lunar Month
                      </p>
                      <h3 className="text-3xl font-serif mb-2">{dailyData.current_moon.name}</h3>
                      <p className="text-muted-foreground mb-4">{dailyData.current_moon.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {dailyData.current_moon.themes?.map((theme) => (
                          <span key={theme} className="px-3 py-1 rounded-full bg-white/5 text-xs text-muted-foreground">
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Practice Streak Widget */}
              <StreakWidget onJournalClick={() => navigate('/journal')} />

              {/* Today's Sacred Practice Widget */}
              <SacredPracticeWidget api={api} navigate={navigate} />

              {/* Daily Guidance Grid */}
              <div>
                <h3 className="text-2xl font-serif mb-6">Today's <span className="italic text-primary">Guidance</span></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Daily Pose */}
                  {dailyData?.daily_pose && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="p-6 rounded-2xl bg-card/50 border border-white/5 hover:border-emerald-500/20 
                                transition-all duration-500 cursor-pointer group"
                      onClick={() => navigate(`/yoga?pose=${dailyData.daily_pose.id}`)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                          <Leaf className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Daily Pose</p>
                          <h4 className="text-xl font-serif mb-1 group-hover:text-primary transition-colors">
                            {dailyData.daily_pose.name}
                          </h4>
                          <p className="text-sm text-muted-foreground italic">{dailyData.daily_pose.sanskrit_name}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </motion.div>
                  )}

                  {/* Daily Crystal */}
                  {dailyData?.daily_crystal && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="p-6 rounded-2xl bg-card/50 border border-white/5 hover:border-purple-500/20 
                                transition-all duration-500 cursor-pointer group"
                      onClick={() => navigate('/crystals')}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Daily Crystal</p>
                          <h4 className="text-xl font-serif mb-1 group-hover:text-primary transition-colors">
                            {dailyData.daily_crystal.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">{dailyData.daily_crystal.element} Element</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </motion.div>
                  )}

                  {/* Daily Mantra */}
                  {dailyData?.daily_mantra && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="p-6 rounded-2xl bg-card/50 border border-white/5 hover:border-orange-500/20 
                                transition-all duration-500 cursor-pointer group"
                      onClick={() => navigate('/mantras')}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                          <Heart className="w-6 h-6 text-orange-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Daily Mantra</p>
                          <h4 className="text-xl font-serif mb-1 group-hover:text-primary transition-colors">
                            {dailyData.daily_mantra.name}
                          </h4>
                          <p className="text-sm text-muted-foreground italic">{dailyData.daily_mantra.sanskrit}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </motion.div>
                  )}

                  {/* Daily Breathwork */}
                  {dailyData?.daily_breathwork && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="p-6 rounded-2xl bg-card/50 border border-white/5 hover:border-cyan-500/20 
                                transition-all duration-500 cursor-pointer group"
                      onClick={() => navigate('/breathwork')}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                          <Wind className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Daily Breathwork</p>
                          <h4 className="text-xl font-serif mb-1 group-hover:text-primary transition-colors">
                            {dailyData.daily_breathwork.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">{dailyData.daily_breathwork.duration_minutes} minutes</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-2xl font-serif mb-6">Sacred <span className="italic text-primary">Practices</span></h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {quickPracticeItems.map((item, index) => (
                    <motion.button
                      key={item.path}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => navigate(item.path)}
                      className={`p-6 rounded-2xl border backdrop-blur-xl text-center
                                 hover:scale-105 transition-all duration-300
                                 ${elementBg[item.element]}`}
                    >
                      <item.icon className={`w-8 h-8 mx-auto mb-3 ${elementColors[item.element]}`} strokeWidth={1.5} />
                      <p className="text-sm font-medium">{item.label}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* New Shamanic Sections */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <h3 className="text-2xl font-serif">Deeper <span className="italic text-primary">Journeys</span></h3>
                  <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">New</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {deepJourneyItems.map((item, index) => (
                    <motion.button
                      key={item.path}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      onClick={() => navigate(item.path)}
                      className={`p-5 rounded-2xl border backdrop-blur-xl text-center
                                 hover:scale-105 transition-all duration-300 relative overflow-hidden
                                 ${elementBg[item.element]}`}
                    >
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <item.icon className={`w-7 h-7 mx-auto mb-2 ${elementColors[item.element]}`} strokeWidth={1.5} />
                      <p className="text-sm font-medium">{item.label}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Progress Section */}
              <div>
                <h3 className="text-2xl font-serif mb-6">Your <span className="italic text-primary">Progress</span></h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    onClick={() => navigate('/practice-log')}
                    className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 hover:border-orange-500/40 transition-all text-left"
                  >
                    <BarChart3 className="w-8 h-8 text-orange-400 mb-3" />
                    <h4 className="font-medium mb-1">Practice Log</h4>
                    <p className="text-xs text-muted-foreground">Track your sacred journey</p>
                  </motion.button>
                  
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    onClick={() => navigate('/achievements')}
                    className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-all text-left"
                  >
                    <Trophy className="w-8 h-8 text-amber-400 mb-3" />
                    <h4 className="font-medium mb-1">Achievements</h4>
                    <p className="text-xs text-muted-foreground">Earn badges & unlock content</p>
                  </motion.button>
                  
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    onClick={() => navigate('/favorites')}
                    className="p-6 rounded-2xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/20 hover:border-pink-500/40 transition-all text-left"
                  >
                    <Star className="w-8 h-8 text-pink-400 mb-3" />
                    <h4 className="font-medium mb-1">Favorites</h4>
                    <p className="text-xs text-muted-foreground">Your saved practices</p>
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
