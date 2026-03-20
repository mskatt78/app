import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Sparkles, Wind, Gem, Music2, Hand, Brain, Heart, Flame, TreePine, 
  Palette, Moon, Hash, Star, Mountain, Waves, Eye, Home
} from "lucide-react";

const MainMenu = ({ user }) => {
  const navigate = useNavigate();

  const menuSections = [
    {
      title: "Movement & Body",
      items: [
        { path: "/yoga", icon: Sparkles, label: "Yoga Library", color: "text-emerald-400", desc: "78 sacred poses" },
        { path: "/breathwork", icon: Wind, label: "Breathwork", color: "text-cyan-400", desc: "Pranayama practices" },
        { path: "/somatic", icon: Flame, label: "Somatic Movement", color: "text-red-400", desc: "Tai Chi & Qigong" },
        { path: "/mudras", icon: Hand, label: "Mudras", color: "text-orange-400", desc: "Sacred hand gestures" },
      ]
    },
    {
      title: "Mind & Spirit",
      items: [
        { path: "/meditations", icon: Brain, label: "Guided Meditations", color: "text-purple-400", desc: "With voice guidance" },
        { path: "/mindfulness", icon: Heart, label: "Mindfulness", color: "text-rose-400", desc: "Present moment practices" },
        { path: "/grounding", icon: TreePine, label: "Grounding", color: "text-green-400", desc: "Earth connection" },
        { path: "/mantras", icon: Music2, label: "Mantras", color: "text-amber-400", desc: "Sacred sounds" },
      ]
    },
    {
      title: "Shamanic Wisdom",
      items: [
        { path: "/shamanic", icon: Moon, label: "Shamanic Practices", color: "text-indigo-400", desc: "Journey work" },
        { path: "/elemental", icon: Sparkles, label: "Elemental", color: "text-teal-400", desc: "Five elements" },
        { path: "/heart-practices", icon: Heart, label: "Heart Practices", color: "text-pink-400", desc: "Heart opening" },
        { path: "/creative", icon: Palette, label: "Creative Processes", color: "text-violet-400", desc: "Sacred art" },
      ]
    },
    {
      title: "Divination & Guidance",
      items: [
        { path: "/oracle", icon: Eye, label: "Oracle Readings", color: "text-purple-400", desc: "Spirit guidance" },
        { path: "/numerology", icon: Hash, label: "Numerology", color: "text-amber-400", desc: "Life path numbers" },
        { path: "/birth-chart", icon: Star, label: "Birth Chart", color: "text-yellow-400", desc: "Astrology chart" },
        { path: "/astrology", icon: Moon, label: "Moon Calendar", color: "text-blue-400", desc: "13-Moon system" },
      ]
    },
    {
      title: "Sacred Tools",
      items: [
        { path: "/crystals", icon: Gem, label: "Crystal Guide", color: "text-pink-400", desc: "42 healing stones" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="main-menu">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <Home className="w-5 h-5 text-primary" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Sacred Sanctuary</p>
              <h1 className="text-xl font-serif">Temple <span className="italic text-primary">Menu</span></h1>
            </div>
          </div>
          
          {user ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="text-sm text-primary hover:text-primary/80"
            >
              My Dashboard
            </button>
          ) : (
            <button
              onClick={() => navigate("/")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-serif mb-2">Welcome to the <span className="italic text-primary">Temple</span></h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Explore ancient wisdom practices for mind, body, and spirit.
          </p>
        </motion.div>

        {/* Menu Sections */}
        <div className="space-y-10">
          {menuSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
            >
              <h3 className="text-lg font-serif text-muted-foreground mb-4 pl-2 border-l-2 border-primary/50">
                {section.title}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {section.items.map((item, index) => (
                  <motion.button
                    key={item.path}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(item.path)}
                    className="flex flex-col items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 
                             border border-white/10 hover:border-primary/30 transition-all text-center"
                    data-testid={`menu-${item.path.slice(1)}`}
                  >
                    <item.icon className={`w-8 h-8 mb-2 ${item.color}`} />
                    <span className="font-medium text-sm">{item.label}</span>
                    <span className="text-xs text-muted-foreground mt-1">{item.desc}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Access Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 pt-8 border-t border-white/10 text-center"
        >
          <p className="text-sm text-muted-foreground mb-4">
            {user ? "Access your personal journey" : "Sign in to save your progress"}
          </p>
          <button
            onClick={() => navigate(user ? "/dashboard" : "/")}
            className="px-6 py-2 rounded-full bg-primary/20 hover:bg-primary/30 text-primary 
                     border border-primary/30 transition-all"
          >
            {user ? "Go to Dashboard" : "Sign In"}
          </button>
        </motion.div>
      </main>
    </div>
  );
};

export default MainMenu;
