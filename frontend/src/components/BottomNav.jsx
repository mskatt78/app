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
  Users,
  Menu,
  X,
  Home,
  User
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    "/community", "/courses", "/retreats", "/pricing", "/reviews", "/archangels", "/earth-altars",
    "/kundalini-consciousness", "/kundulini-consciousness", "/kundalini",
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

const BottomNav = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  const mainNavItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/yoga", icon: Sparkles, label: "Yoga" },
    { path: "/breathwork", icon: Wind, label: "Breathwork" },
    { path: "/meditations", icon: Brain, label: "Meditations" },
  ];

  const menuItems = [
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
    { path: resolvePath("/chair-yoga", "/somatic-yoga"), icon: Sparkles, label: "Chair Yoga", color: "text-lime-300" },
    { path: resolvePath("/fascia-stretching", "/somatic"), icon: Wind, label: "Fascia Stretching", color: "text-cyan-300" },
    { path: resolvePath("/sound-frequencies"), icon: Music2, label: "Sound Healing", color: "text-cyan-300" },
    { path: resolvePath("/shamanic", "/shamanic-practices"), icon: Moon, label: "Shamanic", color: "text-indigo-400" },
    { path: resolvePath("/elemental", "/elemental-practices"), icon: Sparkles, label: "Elemental", color: "text-teal-400" },
    { path: resolvePath("/elemental-temples"), icon: Sparkles, label: "All Temples", color: "text-teal-300" },
    { path: resolvePath("/heart-practices"), icon: Heart, label: "Heart Practices", color: "text-pink-400" },
    { path: resolvePath("/sacred-guardians"), icon: Star, label: "Sacred Guardians", color: "text-amber-300" },
    { path: resolvePath("/sacred-ally-alchemy"), icon: Sparkles, label: "Sacred Allies", color: "text-fuchsia-300" },
    { path: resolvePath("/creative", "/creative-processes"), icon: Palette, label: "Creative Expression", color: "text-violet-400" },
    { path: resolvePath("/free-form-movement"), icon: Flame, label: "Ecstatic Dance", color: "text-fuchsia-400" },
    { path: resolvePath("/kundalini-consciousness", "/sacred-ally-alchemy"), icon: Wind, label: "Kundalini Consciousness", color: "text-orange-300" },
    { path: resolvePath("/numerology"), icon: Hash, label: "Numerology", color: "text-amber-400" },
    { path: resolvePath("/birth-chart"), icon: Star, label: "Birth Chart", color: "text-yellow-400" },
    { path: resolvePath("/oracle"), icon: Moon, label: "Oracle", color: "text-purple-400" },
    { path: resolvePath("/tarot"), icon: Moon, label: "Tarot", color: "text-indigo-300" },
    { path: resolvePath("/i-ching"), icon: Sparkles, label: "I Ching", color: "text-red-300" },
    { path: resolvePath("/gene-keys"), icon: Star, label: "Gene Keys", color: "text-violet-300" },
    { path: resolvePath("/human-design"), icon: Sparkles, label: "Human Design", color: "text-indigo-300" },
    { path: resolvePath("/archangels"), icon: Star, label: "Archangels", color: "text-amber-300" },
    { path: resolvePath("/angelic-alchemy"), icon: Sparkles, label: "Angelic Alchemy", color: "text-cyan-300" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Full Menu Overlay */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-lg"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-xl font-serif">Explore</h2>
                <button 
                  onClick={() => setShowMenu(false)}
                  className="p-2 rounded-full hover:bg-white/10"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Menu Grid */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-3 gap-3">
                  {menuItems.map((item) => (
                    <motion.button
                      key={`${item.path}-${item.label}`}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        navigate(item.path);
                        setShowMenu(false);
                      }}
                      data-testid={`bottomnav-menu-item-${item.path.replace(/\//g, "-").replace(/^-+/, "")}-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${
                        isActive(item.path) 
                          ? "bg-primary/20 border border-primary/30" 
                          : "bg-white/5 hover:bg-white/10 border border-white/5"
                      }`}
                    >
                      <item.icon className={`w-6 h-6 mb-2 ${item.color}`} />
                      <span className="text-xs text-center">{item.label}</span>
                    </motion.button>
                  ))}
                </div>

                {/* Sign In / Dashboard */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  {user ? (
                    <button
                      onClick={() => {
                        navigate("/dashboard");
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-primary/20 border border-primary/30"
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
                      className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-primary/20 border border-primary/30"
                    >
                      <User className="w-5 h-5 text-primary" />
                      <span className="font-medium">Sign In</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-background/95 backdrop-blur-xl border-t border-white/10 pb-safe">
        <div className="flex items-center justify-around py-3 px-4 max-w-lg mx-auto">
          {mainNavItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                isActive(item.path) 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] mt-1">{item.label}</span>
            </button>
          ))}
          
          {/* Menu Button */}
          <button
            data-testid="more-menu-btn"
            onClick={() => setShowMenu(true)}
            className="flex flex-col items-center p-3 rounded-lg text-muted-foreground hover:text-foreground transition-all"
          >
            <Menu className="w-6 h-6" />
            <span className="text-[10px] mt-1">More</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
