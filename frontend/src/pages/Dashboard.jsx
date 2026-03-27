import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Leaf, Eye, Wind, Moon, Sparkles, Heart, Waves, Mountain,
  LogOut, Menu, X, ChevronRight, Sun, User, Star, Clock, Trophy, BookOpen, Settings,
  Brain, Compass, Hash, Shield, BarChart3, Palette, Feather, Zap, Radio, MapPin, CreditCard,
  Flame
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { toast } from "sonner";

// Design system colors
const colors = {
  background: "#FDFBF7",
  surface: "#FFFFFF",
  primary: "#A96F6A",
  primaryHover: "#8A5652",
  secondary: "#E8D8CE",
  accent: "#D4AF37",
  textMain: "#3D2E2B",
  textMuted: "#7A706D",
  border: "#EAE1D9",
  success: "#6B8E73",
};

// ─── Practice Streak Widget ────────────────────────────────────────────────
const StreakWidget = ({ onJournalClick }) => {
  const { streak, milestone, thisWeek, weekDots } = useMemo(() => {
    const raw = localStorage.getItem("shamanic_journal_entries");
    const entries = raw ? JSON.parse(raw) : [];
    if (!entries.length) return { streak: 0, milestone: null, thisWeek: 0, weekDots: Array(7).fill(false) };

    const today = new Date(); today.setHours(0,0,0,0);
    const dayMs = 86400000;

    const datesWithEntry = new Set(
      entries.map(e => { const d = new Date(e.date || e.created_at); d.setHours(0,0,0,0); return d.getTime(); })
    );
    let s = 0;
    let check = new Date(today);
    while (datesWithEntry.has(check.getTime())) { s++; check = new Date(check.getTime() - dayMs); }

    const weekDots = Array(7).fill(false);
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    for (let i = 0; i < 7; i++) { const day = new Date(monday.getTime() + i * dayMs); weekDots[i] = datesWithEntry.has(day.getTime()); }

    const milestones = [
      { days: 40, label: "Sacred 40 ✦", color: colors.accent },
      { days: 21, label: "21-Day Initiation ✦", color: colors.accent },
      { days: 14, label: "Fortnight Keeper ✦", color: colors.primary },
      { days: 7, label: "7-Day Guardian ✦", color: colors.success },
      { days: 3, label: "3-Day Seeker ✦", color: colors.success },
    ];

    return { streak: s, milestone: milestones.find(m => s >= m.days) || null, thisWeek: weekDots.filter(Boolean).length, weekDots };
  }, []);

  const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }} data-testid="streak-widget">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center" style={{ backgroundColor: `${colors.accent}15`, border: `1px solid ${colors.accent}25` }}>
          <Flame className="w-6 h-6" style={{ color: colors.accent }} />
          <span className="text-xl font-bold leading-none" style={{ color: colors.accent, fontFamily: "'Playfair Display', serif" }}>{streak}</span>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em]" style={{ color: colors.textMuted }}>Practice Streak</p>
          <p className="text-xl" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>{streak === 1 ? "1 day" : `${streak} days`}</p>
          {milestone && <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${milestone.color}15`, color: milestone.color }}>{milestone.label}</span>}
          {streak === 0 && <p className="text-xs mt-1" style={{ color: colors.textMuted }}>Begin your practice today</p>}
        </div>
      </div>

      <div className="flex-1 sm:text-center">
        <p className="text-xs uppercase tracking-[0.2em] mb-3" style={{ color: colors.textMuted }}>This Week — {thisWeek}/7</p>
        <div className="flex gap-2">
          {DAYS.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all" style={{ backgroundColor: weekDots[i] ? `${colors.accent}20` : `${colors.secondary}50`, border: `1px solid ${weekDots[i] ? `${colors.accent}50` : colors.border}` }}>
                {weekDots[i] && <Flame className="w-4 h-4" style={{ color: colors.accent }} />}
              </div>
              <span className="text-[9px]" style={{ color: colors.textMuted }}>{day}</span>
            </div>
          ))}
        </div>
      </div>

      <Button size="sm" variant="outline" onClick={onJournalClick} className="rounded-full px-5 flex-shrink-0" style={{ color: colors.primary, borderColor: `${colors.primary}40` }} data-testid="streak-journal-btn">
        <BookOpen className="w-3 h-3 mr-1" /> Journal
      </Button>
    </motion.div>
  );
};

const Dashboard = ({ user, api }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dailyData, setDailyData] = useState(null);
  const [loading, setLoading] = useState(true);

  const ADMIN_EMAILS = ["skywatersacredembodiments@gmail.com", "mskatt78@gmail.com"].map(e => e.toLowerCase());
  const isAdmin = user && ADMIN_EMAILS.includes((user.email || "").toLowerCase());

  const navItems = [
    { icon: Leaf, label: "Yoga", path: "/yoga", color: colors.success },
    { icon: Eye, label: "Oracle", path: "/oracle", color: colors.primary },
    { icon: Wind, label: "Breathwork", path: "/breathwork", color: "#6B9AC4" },
    { icon: Brain, label: "Mindfulness", path: "/mindfulness", color: "#6B9AC4" },
    { icon: Compass, label: "Meditations", path: "/meditations", color: colors.primary },
    { icon: Moon, label: "Astrology", path: "/astrology", color: "#5B8A9A" },
    { icon: Star, label: "Birth Chart", path: "/birth-chart", color: colors.primary },
    { icon: Hash, label: "Numerology", path: "/numerology", color: colors.accent },
    { icon: Sparkles, label: "Crystals", path: "/crystals", color: colors.primary },
    { icon: Heart, label: "Mantras", path: "/mantras", color: colors.accent },
    { icon: Sun, label: "Mudras", path: "/mudras", color: colors.accent },
    { icon: Waves, label: "Somatic", path: "/somatic", color: "#5B8A9A" },
    { icon: Mountain, label: "Grounding", path: "/grounding", color: colors.success },
    { icon: Zap, label: "Elemental", path: "/elemental-practices", color: colors.primary },
    { icon: Mountain, label: "Altars", path: "/earth-altars", color: colors.success },
    { icon: Palette, label: "Creative", path: "/creative-processes", color: colors.primary },
    { icon: Heart, label: "Heart", path: "/heart-practices", color: "#C97B84" },
    { icon: Feather, label: "Shamanic", path: "/shamanic-practices", color: colors.primary },
    { icon: BarChart3, label: "Practice Log", path: "/practice-log", color: colors.accent },
    { icon: Star, label: "Favorites", path: "/favorites", color: colors.accent },
    { icon: Clock, label: "Rituals", path: "/rituals", color: colors.primary },
    { icon: Trophy, label: "Achievements", path: "/achievements", color: colors.accent },
    { icon: BookOpen, label: "Journal", path: "/journal", color: "#5B8A9A" },
    { icon: Radio, label: "Live", path: "/live", color: colors.accent },
    { icon: MapPin, label: "Retreats", path: "/retreats", color: colors.success },
    { icon: BookOpen, label: "Book", path: "/books", color: colors.primary },
    { icon: CreditCard, label: "Membership", path: "/pricing", color: colors.accent },
    ...(isAdmin ? [{ icon: Shield, label: "Admin CMS", path: "/admin", color: colors.primary }] : []),
  ];

  useEffect(() => { fetchDailyData(); }, []);

  const fetchDailyData = async () => {
    try { const response = await api.get("/dashboard/daily"); setDailyData(response.data); } 
    catch (error) { console.error("Failed to fetch daily data:", error); toast.error("Could not load daily guidance"); } 
    finally { setLoading(false); }
  };

  const handleLogout = async () => {
    try { await api.post("/auth/logout"); toast.success("Blessed journey, until we meet again"); navigate("/", { replace: true }); } 
    catch { navigate("/", { replace: true }); }
  };

  const getGreeting = () => { const hour = new Date().getHours(); if (hour < 12) return "Good morning"; if (hour < 17) return "Good afternoon"; return "Good evening"; };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: colors.background, fontFamily: "'Inter', sans-serif" }} data-testid="dashboard">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64" style={{ backgroundColor: colors.surface, borderRight: `1px solid ${colors.border}` }}>
        <div className="p-6" style={{ borderBottom: `1px solid ${colors.border}` }}>
          <h1 className="text-xl italic" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.primary }}>Soul Temple 2.0</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button key={item.path} data-testid={`nav-${item.label.toLowerCase()}`} onClick={() => navigate(item.path)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group" style={{ color: colors.textMuted }}>
              <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" style={{ color: item.color }} strokeWidth={1.5} />
              <span className="text-sm">{item.label}</span>
              <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: colors.textMuted }} />
            </button>
          ))}
        </nav>

        <div className="p-4 space-y-1" style={{ borderTop: `1px solid ${colors.border}` }}>
          <button data-testid="settings-btn" onClick={() => navigate("/settings")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all" style={{ color: colors.textMuted }}><Settings className="w-5 h-5" strokeWidth={1.5} /><span className="text-sm">Settings</span></button>
          <button data-testid="logout-btn" onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-red-50" style={{ color: "#DC2626" }}><LogOut className="w-5 h-5" strokeWidth={1.5} /><span className="text-sm">Logout</span></button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0" style={{ backgroundColor: "rgba(61, 46, 43, 0.5)" }} onClick={() => setSidebarOpen(false)} />
          <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} className="absolute left-0 top-0 bottom-0 w-64" style={{ backgroundColor: colors.surface, borderRight: `1px solid ${colors.border}` }}>
            <div className="p-6 flex items-center justify-between" style={{ borderBottom: `1px solid ${colors.border}` }}>
              <h1 className="text-xl italic" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.primary }}>Soul Temple 2.0</h1>
              <button onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" style={{ color: colors.textMuted }} /></button>
            </div>
            <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-120px)]">
              {navItems.map((item) => (
                <button key={item.path} onClick={() => { navigate(item.path); setSidebarOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all" style={{ color: colors.textMuted }}>
                  <item.icon className="w-5 h-5" style={{ color: item.color }} strokeWidth={1.5} />
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="p-4" style={{ borderTop: `1px solid ${colors.border}` }}>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all" style={{ color: "#DC2626" }}><LogOut className="w-5 h-5" strokeWidth={1.5} /><span className="text-sm">Logout</span></button>
            </div>
          </motion.aside>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 backdrop-blur-xl p-4" style={{ backgroundColor: `${colors.background}90`, borderBottom: `1px solid ${colors.border}` }}>
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
              <button data-testid="mobile-menu-btn" className="lg:hidden" onClick={() => setSidebarOpen(true)}><Menu className="w-6 h-6" style={{ color: colors.textMuted }} /></button>
              <div>
                <p className="text-xs uppercase tracking-[0.2em]" style={{ color: colors.textMuted }}>{dailyData?.current_moon?.name || 'Loading...'}</p>
                <h2 className="text-lg" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>{getGreeting()}, <span className="italic" style={{ color: colors.primary }}>{user?.name?.split(' ')[0]}</span></h2>
              </div>
            </div>
            <Avatar className="w-10 h-10" style={{ border: `2px solid ${colors.primary}30` }}>
              <AvatarImage src={user?.picture} alt={user?.name} />
              <AvatarFallback style={{ backgroundColor: `${colors.primary}10`, color: colors.primary }}>{user?.name?.charAt(0) || <User className="w-4 h-4" />}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 max-w-5xl mx-auto space-y-8">
          {loading ? (
            <div className="flex items-center justify-center h-64"><div className="w-12 h-12 rounded-full border-4 animate-spin" style={{ borderColor: `${colors.primary}30`, borderTopColor: colors.primary }} /></div>
          ) : (
            <>
              {/* Current Moon Card */}
              {dailyData?.current_moon && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 rounded-3xl" style={{ backgroundColor: `${colors.secondary}40`, border: `1px solid ${colors.border}` }}>
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
                      <Moon className="w-10 h-10" style={{ color: colors.primary }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: colors.textMuted }}>Current Lunar Month</p>
                      <h3 className="text-3xl mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>{dailyData.current_moon.name}</h3>
                      <p className="mb-4" style={{ color: colors.textMuted }}>{dailyData.current_moon.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {dailyData.current_moon.themes?.map((theme) => (
                          <span key={theme} className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: colors.surface, color: colors.textMuted }}>{theme}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Practice Streak Widget */}
              <StreakWidget onJournalClick={() => navigate('/journal')} />

              {/* Daily Guidance Grid */}
              <div>
                <h3 className="text-2xl mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>Today's <span className="italic" style={{ color: colors.primary }}>Guidance</span></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {dailyData?.daily_pose && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl cursor-pointer group transition-all duration-500 hover:-translate-y-1" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }} onClick={() => navigate(`/yoga?pose=${dailyData.daily_pose.id}`)}>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${colors.success}15` }}><Leaf className="w-6 h-6" style={{ color: colors.success }} /></div>
                        <div className="flex-1">
                          <p className="text-xs uppercase tracking-[0.2em] mb-1" style={{ color: colors.textMuted }}>Daily Pose</p>
                          <h4 className="text-xl mb-1 group-hover:text-primary transition-colors" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>{dailyData.daily_pose.name}</h4>
                          <p className="text-sm italic" style={{ color: colors.textMuted }}>{dailyData.daily_pose.sanskrit_name}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: colors.textMuted }} />
                      </div>
                    </motion.div>
                  )}

                  {dailyData?.daily_crystal && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-2xl cursor-pointer group transition-all duration-500 hover:-translate-y-1" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }} onClick={() => navigate('/crystals')}>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${colors.primary}15` }}><Sparkles className="w-6 h-6" style={{ color: colors.primary }} /></div>
                        <div className="flex-1">
                          <p className="text-xs uppercase tracking-[0.2em] mb-1" style={{ color: colors.textMuted }}>Daily Crystal</p>
                          <h4 className="text-xl mb-1 group-hover:text-primary transition-colors" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>{dailyData.daily_crystal.name}</h4>
                          <p className="text-sm" style={{ color: colors.textMuted }}>{dailyData.daily_crystal.element} Element</p>
                        </div>
                        <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: colors.textMuted }} />
                      </div>
                    </motion.div>
                  )}

                  {dailyData?.daily_mantra && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-6 rounded-2xl cursor-pointer group transition-all duration-500 hover:-translate-y-1" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }} onClick={() => navigate('/mantras')}>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${colors.accent}15` }}><Heart className="w-6 h-6" style={{ color: colors.accent }} /></div>
                        <div className="flex-1">
                          <p className="text-xs uppercase tracking-[0.2em] mb-1" style={{ color: colors.textMuted }}>Daily Mantra</p>
                          <h4 className="text-xl mb-1 group-hover:text-primary transition-colors" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>{dailyData.daily_mantra.name}</h4>
                          <p className="text-sm italic" style={{ color: colors.textMuted }}>{dailyData.daily_mantra.sanskrit}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: colors.textMuted }} />
                      </div>
                    </motion.div>
                  )}

                  {dailyData?.daily_breathwork && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="p-6 rounded-2xl cursor-pointer group transition-all duration-500 hover:-translate-y-1" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }} onClick={() => navigate('/breathwork')}>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#6B9AC415" }}><Wind className="w-6 h-6" style={{ color: "#6B9AC4" }} /></div>
                        <div className="flex-1">
                          <p className="text-xs uppercase tracking-[0.2em] mb-1" style={{ color: colors.textMuted }}>Daily Breathwork</p>
                          <h4 className="text-xl mb-1 group-hover:text-primary transition-colors" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>{dailyData.daily_breathwork.name}</h4>
                          <p className="text-sm" style={{ color: colors.textMuted }}>{dailyData.daily_breathwork.duration_minutes} minutes</p>
                        </div>
                        <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: colors.textMuted }} />
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-2xl mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>Sacred <span className="italic" style={{ color: colors.primary }}>Practices</span></h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {navItems.slice(0, 8).map((item, index) => (
                    <motion.button key={item.path} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }} onClick={() => navigate(item.path)} className="p-6 rounded-2xl text-center transition-all duration-300 hover:scale-105 hover:-translate-y-1" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
                      <item.icon className="w-8 h-8 mx-auto mb-3" style={{ color: item.color }} strokeWidth={1.5} />
                      <p className="text-sm font-medium" style={{ color: colors.textMain }}>{item.label}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Deeper Journeys */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <h3 className="text-2xl" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>Deeper <span className="italic" style={{ color: colors.primary }}>Journeys</span></h3>
                  <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>New</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {navItems.filter(item => ['/elemental-practices', '/earth-altars', '/creative-processes', '/heart-practices', '/shamanic-practices'].includes(item.path)).map((item, index) => (
                    <motion.button key={item.path} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + index * 0.1 }} onClick={() => navigate(item.path)} className="p-5 rounded-2xl text-center transition-all duration-300 hover:scale-105 relative overflow-hidden" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors.primary }} />
                      <item.icon className="w-7 h-7 mx-auto mb-2" style={{ color: item.color }} strokeWidth={1.5} />
                      <p className="text-sm font-medium" style={{ color: colors.textMain }}>{item.label}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Progress Section */}
              <div>
                <h3 className="text-2xl mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>Your <span className="italic" style={{ color: colors.primary }}>Progress</span></h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} onClick={() => navigate('/practice-log')} className="p-6 rounded-2xl text-left transition-all hover:scale-[1.02]" style={{ background: `linear-gradient(135deg, ${colors.accent}10, ${colors.primary}08)`, border: `1px solid ${colors.accent}25` }}>
                    <BarChart3 className="w-8 h-8 mb-3" style={{ color: colors.accent }} />
                    <h4 className="font-medium mb-1" style={{ color: colors.textMain }}>Practice Log</h4>
                    <p className="text-xs" style={{ color: colors.textMuted }}>Track your sacred journey</p>
                  </motion.button>
                  
                  <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} onClick={() => navigate('/achievements')} className="p-6 rounded-2xl text-left transition-all hover:scale-[1.02]" style={{ background: `linear-gradient(135deg, ${colors.accent}15, ${colors.accent}05)`, border: `1px solid ${colors.accent}25` }}>
                    <Trophy className="w-8 h-8 mb-3" style={{ color: colors.accent }} />
                    <h4 className="font-medium mb-1" style={{ color: colors.textMain }}>Achievements</h4>
                    <p className="text-xs" style={{ color: colors.textMuted }}>Earn badges & unlock content</p>
                  </motion.button>
                  
                  <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }} onClick={() => navigate('/favorites')} className="p-6 rounded-2xl text-left transition-all hover:scale-[1.02]" style={{ background: `linear-gradient(135deg, ${colors.primary}10, #C97B8408)`, border: `1px solid ${colors.primary}20` }}>
                    <Star className="w-8 h-8 mb-3" style={{ color: colors.primary }} />
                    <h4 className="font-medium mb-1" style={{ color: colors.textMain }}>Favorites</h4>
                    <p className="text-xs" style={{ color: colors.textMuted }}>Your saved practices</p>
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
