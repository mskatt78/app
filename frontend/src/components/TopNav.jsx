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
  ,Download, Orbit
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationBell } from "./NotificationSystem";

const routeExists = (path) => {
  const normalized = String(path || "").split("?")[0].split("#")[0].replace(/\/$/, "") || "/";
  const knownRoutes = new Set([
    "/", "/menu", "/dashboard", "/yoga", "/partner-yoga", "/breathwork", "/meditations", "/crystals",
    "/mantras", "/mudras", "/mindfulness", "/grounding", "/somatic", "/shamanic", "/elemental",
    "/elemental-practices", "/heart-practices", "/sacred-ally-alchemy", "/angelic-alchemy", "/healing-portals",
    "/creative", "/creative-processes", "/numerology", "/birth-chart", "/oracle", "/astrology",
    "/rose-temple", "/elemental-temples", "/masculine-temple", "/seasonal-temple", "/sunrise-sunset",
    "/water-practices", "/tarot", "/rune-readings", "/i-ching", "/gene-keys", "/human-design",
    "/sacred-guardians", "/ancient-wisdom", "/sound-frequencies", "/free-form-movement", "/somatic-yoga", "/chair-yoga", "/fascia-stretching",
    "/chakra-cleansing", "/energy-healing", "/daily-practice", "/practice-journal", "/profile-calculator",
    "/alchemy-hub", "/all-alchemy", "/mystery-school-teachings",
    "/kundalini-consciousness", "/kundulini-consciousness", "/kundalini",
    "/community", "/courses", "/retreats", "/pricing", "/reviews", "/archangels", "/earth-altars",
  ]);
  return knownRoutes.has(normalized);
};

const resolvePath = (primary, ...fallbacks) => {
  const candidates = [primary, ...fallbacks].filter(Boolean);
  for (const candidate of candidates) {
    if (routeExists(candidate)) return candidate;
  }
  return primary;
};

const isRouteMatch = (pathname, candidatePath) => {
  const normalize = (value) => {
    const v = String(value || "").split("?")[0].split("#")[0].replace(/\/+$/, "");
    return v || "/";
  };
  const current = normalize(pathname);
  const candidate = normalize(candidatePath);
  if (current === candidate) return true;
  return candidate !== "/" && current.startsWith(`${candidate}/`);
};

const findBestCurrentPage = (pathname, items) => {
  const matches = items.filter((item) => isRouteMatch(pathname, item.path));
  if (!matches.length) return null;
  return matches.sort((a, b) => String(b.path || "").length - String(a.path || "").length)[0];
};

const dedupeNavItems = (items = []) => {
  const seenLabel = new Set();
  const seenPath = new Set();
  return items.filter((item) => {
    const labelKey = String(item?.label || "").trim().toLowerCase();
    const pathKey = String(item?.path || "").trim().toLowerCase();
    if (!labelKey || !pathKey) return false;
    if (seenLabel.has(labelKey) || seenPath.has(pathKey)) return false;
    seenLabel.add(labelKey);
    seenPath.add(pathKey);
    return true;
  });
};

const TopNav = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const ADMIN_EMAILS = new Set(["mskatt78@gmail.com", "skywatersacredembodiments@gmail.com"]);
  const isAdminUser = user?.email && ADMIN_EMAILS.has(user.email.toLowerCase());

  const menuItems = dedupeNavItems([
    { path: resolvePath("/yoga"), icon: Sparkles, label: "Yoga Library", color: "text-emerald-400" },
    { path: resolvePath("/partner-yoga"), icon: Users, label: "Partner Yoga", color: "text-teal-400" },
    { path: resolvePath("/breathwork"), icon: Wind, label: "Breathwork", color: "text-cyan-400" },
    { path: resolvePath("/meditations"), icon: Brain, label: "Meditations", color: "text-purple-400" },
    { path: resolvePath("/crystals"), icon: Gem, label: "Crystals", color: "text-pink-400" },
    { path: resolvePath("/mantras"), icon: Music2, label: "Mantras", color: "text-amber-400" },
    { path: resolvePath("/mudras"), icon: Hand, label: "Mudras", color: "text-orange-400" },
    { path: resolvePath("/mindfulness"), icon: Heart, label: "Mindfulness", color: "text-rose-400" },
    { path: resolvePath("/grounding"), icon: TreePine, label: "Grounding", color: "text-green-400" },
    { path: resolvePath("/somatic"), icon: Flame, label: "Somatic Movement", color: "text-red-400" },
    { path: resolvePath("/somatic-yoga"), icon: Leaf, label: "Somatic Yoga", color: "text-emerald-300" },
    { path: resolvePath("/chair-yoga"), icon: Users, label: "Chair Yoga", color: "text-lime-300" },
    { path: resolvePath("/fascia-stretching", "/somatic"), icon: Wind, label: "Fascia Stretching", color: "text-cyan-300" },
    { path: resolvePath("/shamanic", "/shamanic-practices"), icon: Moon, label: "Shamanic", color: "text-indigo-400" },
    { path: resolvePath("/elemental", "/elemental-practices"), icon: Sparkles, label: "Elemental", color: "text-teal-400" },
    { path: resolvePath("/heart-practices"), icon: Heart, label: "Heart Practices", color: "text-pink-400" },
    { path: resolvePath("/sacred-ally-alchemy"), icon: Sparkles, label: "Sacred Allies", color: "text-fuchsia-300" },
    { path: resolvePath("/sacred-ally-alchemy", "/sacred-guardians"), icon: Globe, label: "Power & Spirit Animals", color: "text-emerald-300" },
    { path: resolvePath("/alchemy-hub", "/all-alchemy"), icon: Sparkles, label: "All Alchemy Hub", color: "text-fuchsia-200" },
    { path: resolvePath("/mystery-school-teachings"), icon: Star, label: "Mystery School", color: "text-amber-200" },
    { path: resolvePath("/angelic-alchemy"), icon: Shield, label: "Angelic Alchemy", color: "text-cyan-300" },
    { path: resolvePath("/healing-portals"), icon: Orbit, label: "Healing Portals", color: "text-amber-300" },
    { path: resolvePath("/creative", "/creative-processes"), icon: Palette, label: "Creative Expression", color: "text-violet-400" },
    { path: resolvePath("/free-form-movement"), icon: Sparkles, label: "Ecstatic Dance", color: "text-fuchsia-400" },
    { path: resolvePath("/kundalini-consciousness", "/sacred-ally-alchemy"), icon: Wind, label: "Kundalini Consciousness", color: "text-orange-300" },
    { path: resolvePath("/sound-frequencies"), icon: Music2, label: "Voice Activation", color: "text-cyan-300" },
    { path: resolvePath("/numerology"), icon: Hash, label: "Numerology", color: "text-amber-400" },
    { path: resolvePath("/birth-chart"), icon: Star, label: "Birth Chart", color: "text-yellow-400" },
    { path: resolvePath("/oracle"), icon: Moon, label: "Oracle", color: "text-purple-400" },
    { path: resolvePath("/tarot"), icon: Star, label: "Tarot", color: "text-indigo-300" },
    { path: resolvePath("/i-ching"), icon: Globe, label: "I Ching", color: "text-red-300" },
    { path: resolvePath("/rune-readings"), icon: Star, label: "Runes", color: "text-amber-300" },
    { path: resolvePath("/gene-keys"), icon: Orbit, label: "Gene Keys", color: "text-violet-300" },
    { path: resolvePath("/human-design"), icon: Globe, label: "Human Design", color: "text-indigo-300" },
    { path: resolvePath("/archangels"), icon: Shield, label: "Archangels", color: "text-amber-300" },
    { path: resolvePath("/astrology"), icon: Moon, label: "Sun & Moon", color: "text-blue-400" },
    { path: resolvePath("/sound-frequencies"), icon: Music2, label: "Sound Healing", color: "text-cyan-400" },
    { path: resolvePath("/earth-altars", "/creative"), icon: TreePine, label: "Earth Medicines", color: "text-emerald-300" },
    { path: resolvePath("/alchemy-hub", "/all-alchemy", "/angelic-alchemy"), icon: Sparkles, label: "Alchemy", color: "text-violet-300" },
    { path: resolvePath("/rose-temple"), icon: Flower2, label: "Rose Temple", color: "text-rose-400" },
    { path: resolvePath("/elemental-temples"), icon: Globe, label: "Elemental Temples", color: "text-teal-400" },
    { path: resolvePath("/masculine-temple"), icon: Shield, label: "Masculine Temple", color: "text-amber-400" },
    { path: resolvePath("/seasonal-temple"), icon: Leaf, label: "Wheel of the Year", color: "text-orange-400" },
  ]);

  const isActive = (path) => isRouteMatch(location.pathname, path);

  // Get current page name
  const currentPage = findBestCurrentPage(location.pathname, menuItems);

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-background/95 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between py-3 px-4 max-w-6xl mx-auto">
          {/* Home Button */}
          <button
            onClick={() => navigate(user ? "/dashboard" : "/")}
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
                      key={`${item.path}-${item.label}`}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        navigate(item.path);
                        setShowMenu(false);
                      }}
                      data-testid={`topnav-practice-item-${item.path.replace(/\//g, "-").replace(/^-+/, "")}-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
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
                        navigate(user ? "/dashboard" : "/");
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
