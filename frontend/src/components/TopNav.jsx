import { useNavigate, useLocation } from "react-router-dom";
import { 
  Sparkles, 
  Wind, 
  Gem, 
  Music2, 
  Hand, 
  Brain, 
  Heart,
  Flame,
  TreePine,
  Palette,
  Moon,
  Hash,
  Star,
  Menu,
  X,
  Home,
  User,
  ChevronDown,
  Flower2,
  Shield,
  Globe,
  Users,
  Leaf
  ,Download
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationBell } from "./NotificationSystem";

const TopNav = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const adminEmails = new Set(["mskatt78@gmail.com", "skywatersacredembodiments@gmail.com"]);
  const isAdminUser = user?.email && adminEmails.has(user.email.toLowerCase());

  const menuItems = [
    { path: "/yoga", icon: Sparkles, label: "Yoga Library", color: "text-emerald-400" },
    { path: "/partner-yoga", icon: Users, label: "Partner Yoga", color: "text-teal-400" },
    { path: "/breathwork", icon: Wind, label: "Breathwork", color: "text-cyan-400" },
    { path: "/meditations", icon: Brain, label: "Meditations", color: "text-purple-400" },
    { path: "/crystals", icon: Gem, label: "Crystals", color: "text-pink-400" },
    { path: "/mantras", icon: Music2, label: "Mantras", color: "text-amber-400" },
    { path: "/mudras", icon: Hand, label: "Mudras", color: "text-orange-400" },
    { path: "/mindfulness", icon: Heart, label: "Mindfulness", color: "text-rose-400" },
    { path: "/grounding", icon: TreePine, label: "Grounding", color: "text-green-400" },
    { path: "/somatic", icon: Flame, label: "Somatic", color: "text-red-400" },
    { path: "/shamanic", icon: Moon, label: "Shamanic", color: "text-indigo-400" },
    { path: "/elemental", icon: Sparkles, label: "Elemental", color: "text-teal-400" },
    { path: "/heart-practices", icon: Heart, label: "Heart Practices", color: "text-pink-400" },
    { path: "/sacred-ally-alchemy", icon: Sparkles, label: "Sacred Ally Alchemy", color: "text-fuchsia-300" },
    { path: "/creative", icon: Palette, label: "Creative", color: "text-violet-400" },
    { path: "/numerology", icon: Hash, label: "Numerology", color: "text-amber-400" },
    { path: "/birth-chart", icon: Star, label: "Birth Chart", color: "text-yellow-400" },
    { path: "/oracle", icon: Moon, label: "Oracle", color: "text-purple-400" },
    { path: "/astrology", icon: Moon, label: "Moon Calendar", color: "text-blue-400" },
    // Sacred Temples
    { path: "/rose-temple", icon: Flower2, label: "Rose Temple", color: "text-rose-400" },
    { path: "/elemental-temples", icon: Globe, label: "Elemental Temples", color: "text-teal-400" },
    { path: "/masculine-temple", icon: Shield, label: "Masculine Temple", color: "text-amber-400" },
    { path: "/seasonal-temple", icon: Leaf, label: "Wheel of the Year", color: "text-orange-400" },
  ];

  const isActive = (path) => location.pathname === path;

  // Get current page name
  const currentPage = menuItems.find(item => item.path === location.pathname);

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-background/95 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between py-3 px-4 max-w-6xl mx-auto">
          {/* Home Button */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            data-testid="topnav-home-btn"
          >
            <Home className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Home</span>
          </button>

          {/* Current Page / Menu Toggle */}
          <button
            onClick={() => setShowMenu(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            data-testid="topnav-open-menu-btn"
          >
            {currentPage ? (
              <>
                <currentPage.icon className={`w-4 h-4 ${currentPage.color}`} />
                <span className="text-sm font-medium">{currentPage.label}</span>
              </>
            ) : (
              <>
                <Menu className="w-4 h-4" />
                <span className="text-sm font-medium">Explore</span>
              </>
            )}
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* User/Sign In */}
          <div className="flex items-center gap-2">
            {user && <NotificationBell />}
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent("pwa-install-open", { detail: { source: "topnav", immediate: true } }));
              }}
              className="hidden sm:flex items-center gap-2 text-primary/80 hover:text-primary transition-colors"
              data-testid="topnav-install-btn"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Install</span>
            </button>
            <button
              onClick={() => navigate("/demo")}
              className="hidden sm:flex items-center gap-2 text-primary/80 hover:text-primary transition-colors"
              data-testid="topnav-demo-btn"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">Demo</span>
            </button>
            {user ? (
              <div className="flex items-center gap-2">
                {isAdminUser && (
                  <button
                    onClick={() => navigate("/admin")}
                    className="hidden sm:flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                    data-testid="topnav-admin-btn"
                  >
                    <Shield className="w-4 h-4" />
                    <span className="text-sm">Admin</span>
                  </button>
                )}
                <button
                  onClick={() => navigate("/dashboard")}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="topnav-dashboard-btn"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm hidden sm:inline">Dashboard</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                data-testid="topnav-signin-btn"
              >
                <User className="w-5 h-5" />
                <span className="text-sm hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Full Menu Overlay */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-background/98 backdrop-blur-lg"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-xl font-serif">Explore Practices</h2>
                <button 
                  onClick={() => setShowMenu(false)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  data-testid="topnav-close-menu-btn"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Menu Grid */}
              <div className="flex-1 overflow-y-auto p-4">
                {/* Sacred Temples Section */}
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3 px-1">Sacred Temples</p>
                <div className="grid grid-cols-4 gap-3 max-w-4xl mx-auto">
                    {[
                      { path: "/rose-temple", icon: Flower2, label: "Rose Temple", color: "text-rose-400" },
                      { path: "/elemental-temples", icon: Globe, label: "Elemental Temples", color: "text-teal-400" },
                      { path: "/masculine-temple", icon: Shield, label: "Masculine Temple", color: "text-amber-400" },
                      { path: "/seasonal-temple", icon: Leaf, label: "Wheel of the Year", color: "text-orange-400" },
                    ].map((item) => (
                      <motion.button
                        key={item.path}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { navigate(item.path); setShowMenu(false); }}
                        data-testid={`topnav-sacred-temple-item-${item.path.replace(/\//g, "-").replace(/^-+/, "")}`}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${
                          isActive(item.path)
                            ? "bg-primary/20 border-2 border-primary/50"
                            : "bg-white/5 hover:bg-white/10 border border-white/10"
                        }`}
                      >
                        <item.icon className={`w-7 h-7 mb-2 ${item.color}`} />
                        <span className="text-sm text-center font-medium">{item.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/10 mb-4 pt-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3 px-1">All Practices</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
                  {menuItems.map((item) => (
                    <motion.button
                      key={item.path}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        navigate(item.path);
                        setShowMenu(false);
                      }}
                      data-testid={`topnav-practice-item-${item.path.replace(/\//g, "-").replace(/^-+/, "")}`}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${
                        isActive(item.path) 
                          ? "bg-primary/20 border-2 border-primary/50" 
                          : "bg-white/5 hover:bg-white/10 border border-white/10"
                      }`}
                    >
                      <item.icon className={`w-7 h-7 mb-2 ${item.color}`} />
                      <span className="text-sm text-center font-medium">{item.label}</span>
                    </motion.button>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="mt-8 pt-6 border-t border-white/10 max-w-4xl mx-auto">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => {
                        navigate("/");
                        setShowMenu(false);
                      }}
                      className="flex items-center justify-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                      data-testid="topnav-overlay-home-btn"
                    >
                      <Home className="w-5 h-5 text-primary" />
                      <span className="font-medium">Home</span>
                    </button>
                    {user ? (
                      <button
                        onClick={() => {
                          navigate("/dashboard");
                          setShowMenu(false);
                        }}
                        className="flex items-center justify-center gap-3 p-4 rounded-xl bg-primary/20 border border-primary/30 transition-all"
                        data-testid="topnav-overlay-dashboard-btn"
                      >
                        <User className="w-5 h-5 text-primary" />
                        <span className="font-medium">My Dashboard</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          navigate("/");
                          setShowMenu(false);
                        }}
                        className="flex items-center justify-center gap-3 p-4 rounded-xl bg-primary/20 border border-primary/30 transition-all"
                        data-testid="topnav-overlay-signin-btn"
                      >
                        <User className="w-5 h-5 text-primary" />
                        <span className="font-medium">Sign In</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        navigate("/demo");
                        setShowMenu(false);
                      }}
                      className="flex items-center justify-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                      data-testid="topnav-demo-menu-btn"
                    >
                      <Sparkles className="w-5 h-5 text-primary" />
                      <span className="font-medium">Demo</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TopNav;
