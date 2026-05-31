import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, Menu, X, ChevronRight, Moon, User, Settings, Shield } from "lucide-react";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { toast } from "sonner";
import { StreakWidget } from "./dashboard/StreakWidget";
import { SacredPracticeWidget } from "./dashboard/SacredPracticeWidget";
import { DailyGuidanceGrid } from "./dashboard/DailyGuidanceGrid";
import { buildDeepJourneyItems, buildQuickItems, DashboardActionPanels } from "./dashboard/DashboardActionPanels";
import { ADMIN_EMAILS, elementBg, elementColors, getNavItems } from "./dashboard/dashboardConfig";
import { appLogger } from "../utils/logger";

const Dashboard = ({ user, api }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAdminUser = user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());
  const [dailyData, setDailyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = user && ADMIN_EMAILS.includes((user.email || "").toLowerCase());
  const navItems = useMemo(() => getNavItems(Boolean(isAdmin)), [isAdmin]);

  const fetchDailyData = useCallback(async () => {
    try {
      const response = await api.get("/dashboard/daily");
      setDailyData(response.data);
    } catch (error) {
      appLogger.error("Failed to fetch daily data:", error);
      toast.error("Could not load daily guidance");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchDailyData();
  }, [fetchDailyData]);

  const quickPracticeItems = useMemo(() => buildQuickItems(navItems, isAdminUser), [isAdminUser, navItems]);
  const deepJourneyItems = useMemo(() => buildDeepJourneyItems(navItems), [navItems]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      toast.success("Blessed journey, until we meet again");
      navigate("/", { replace: true });
    } catch (error) {
      appLogger.error("Logout failed:", error);
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

              <DailyGuidanceGrid dailyData={dailyData} navigate={navigate} />

              <DashboardActionPanels
                quickPracticeItems={quickPracticeItems}
                deepJourneyItems={deepJourneyItems}
                navigate={navigate}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
