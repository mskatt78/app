import { motion } from "framer-motion";
import { Sparkles, Shield, BarChart3, Trophy, Star } from "lucide-react";
import { elementBg, elementColors } from "./dashboardConfig";

export const DashboardActionPanels = ({ quickPracticeItems, deepJourneyItems, navigate }) => (
  <>
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
            className={`p-6 rounded-2xl border backdrop-blur-xl text-center hover:scale-105 transition-all duration-300 ${elementBg[item.element]}`}
            data-testid={`dashboard-practice-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <item.icon className={`w-8 h-8 mx-auto mb-3 ${elementColors[item.element]}`} strokeWidth={1.5} />
            <p className="text-sm font-medium">{item.label}</p>
          </motion.button>
        ))}
      </div>
    </div>

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
            className={`p-5 rounded-2xl border backdrop-blur-xl text-center hover:scale-105 transition-all duration-300 relative overflow-hidden ${elementBg[item.element]}`}
            data-testid={`dashboard-journey-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />
            <item.icon className={`w-7 h-7 mx-auto mb-2 ${elementColors[item.element]}`} strokeWidth={1.5} />
            <p className="text-sm font-medium">{item.label}</p>
          </motion.button>
        ))}
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-serif mb-6">Your <span className="italic text-primary">Progress</span></h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          onClick={() => navigate("/practice-log")}
          className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 hover:border-orange-500/40 transition-all text-left"
          data-testid="dashboard-progress-practice-log"
        >
          <BarChart3 className="w-8 h-8 text-orange-400 mb-3" />
          <h4 className="font-medium mb-1">Practice Log</h4>
          <p className="text-xs text-muted-foreground">Track your sacred journey</p>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          onClick={() => navigate("/achievements")}
          className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-all text-left"
          data-testid="dashboard-progress-achievements"
        >
          <Trophy className="w-8 h-8 text-amber-400 mb-3" />
          <h4 className="font-medium mb-1">Achievements</h4>
          <p className="text-xs text-muted-foreground">Earn badges & unlock content</p>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          onClick={() => navigate("/favorites")}
          className="p-6 rounded-2xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/20 hover:border-pink-500/40 transition-all text-left"
          data-testid="dashboard-progress-favorites"
        >
          <Star className="w-8 h-8 text-pink-400 mb-3" />
          <h4 className="font-medium mb-1">Favorites</h4>
          <p className="text-xs text-muted-foreground">Your saved practices</p>
        </motion.button>
      </div>
    </div>
  </>
);

export const buildQuickItems = (navItems, isAdminUser) => ([
  ...navItems.slice(0, 7),
  { path: "/demo", label: "Demo", icon: Sparkles, element: "spirit" },
  ...(isAdminUser ? [{ path: "/admin", label: "Admin", icon: Shield, element: "spirit" }] : []),
]);

export const buildDeepJourneyItems = (navItems) =>
  navItems.filter((item) => ["/elemental-practices", "/earth-altars", "/creative-processes", "/heart-practices", "/shamanic-practices"].includes(item.path));
