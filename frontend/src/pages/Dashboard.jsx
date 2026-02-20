import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Leaf, Eye, Wind, Moon, Sparkles, Heart, Waves, Mountain,
  LogOut, Menu, X, ChevronRight, Sun, User, Star, Clock, Trophy, BookOpen, Settings,
  Brain, Compass, Hash
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { toast } from "sonner";

const Dashboard = ({ user, api }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dailyData, setDailyData] = useState(null);
  const [loading, setLoading] = useState(true);

  const navItems = [
    { icon: Leaf, label: "Yoga", path: "/yoga", element: "earth" },
    { icon: Eye, label: "Oracle", path: "/oracle", element: "spirit" },
    { icon: Wind, label: "Breathwork", path: "/breathwork", element: "air" },
    { icon: Brain, label: "Mindfulness", path: "/mindfulness", element: "air" },
    { icon: Compass, label: "Meditations", path: "/meditations", element: "spirit" },
    { icon: Moon, label: "Astrology", path: "/astrology", element: "water" },
    { icon: Hash, label: "Numerology", path: "/numerology", element: "fire" },
    { icon: Sparkles, label: "Crystals", path: "/crystals", element: "spirit" },
    { icon: Heart, label: "Mantras", path: "/mantras", element: "fire" },
    { icon: Sun, label: "Mudras", path: "/mudras", element: "fire" },
    { icon: Waves, label: "Somatic", path: "/somatic", element: "water" },
    { icon: Mountain, label: "Grounding", path: "/grounding", element: "earth" },
    { icon: Star, label: "Favorites", path: "/favorites", element: "fire" },
    { icon: Clock, label: "Rituals", path: "/rituals", element: "spirit" },
    { icon: Trophy, label: "Achievements", path: "/achievements", element: "fire" },
    { icon: BookOpen, label: "Journal", path: "/journal", element: "water" },
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

  useEffect(() => {
    fetchDailyData();
  }, []);

  const fetchDailyData = async () => {
    try {
      const response = await api.get("/dashboard/daily");
      setDailyData(response.data);
    } catch (error) {
      console.error("Failed to fetch daily data:", error);
      toast.error("Could not load daily guidance");
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-xl font-serif italic text-primary">Shamanic Yoga</h1>
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
              <h1 className="text-xl font-serif italic text-primary">Shamanic Yoga</h1>
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
                      onClick={() => navigate('/yoga')}
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
                  {navItems.slice(0, 8).map((item, index) => (
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
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
