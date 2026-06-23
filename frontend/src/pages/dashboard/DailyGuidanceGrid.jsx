import { motion } from "framer-motion";
import { Leaf, Sparkles, Heart, Wind, ChevronRight, Play, Sun, Shield, Flame, Star } from "lucide-react";

export const DailyGuidanceGrid = ({ dailyData, navigate }) => (
  <div>
    <h3 className="text-2xl font-serif mb-6">Today&apos;s <span className="italic text-primary">Guidance</span></h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {dailyData?.daily_pose && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-card/50 border border-white/5 hover:border-emerald-500/20 transition-all duration-500 cursor-pointer group"
          onClick={() => navigate(`/yoga?pose=${dailyData.daily_pose.id}`)}
          data-testid="daily-pose-card"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Daily Pose</p>
              <h4 className="text-xl font-serif mb-1 group-hover:text-primary transition-colors">{dailyData.daily_pose.name}</h4>
              <p className="text-sm text-muted-foreground italic">{dailyData.daily_pose.sanskrit_name}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </motion.div>
      )}

      {dailyData?.daily_crystal && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-card/50 border border-white/5 hover:border-purple-500/20 transition-all duration-500 cursor-pointer group"
          onClick={() => navigate("/crystals")}
          data-testid="daily-crystal-card"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Daily Crystal</p>
              <h4 className="text-xl font-serif mb-1 group-hover:text-primary transition-colors">{dailyData.daily_crystal.name}</h4>
              <p className="text-sm text-muted-foreground">{dailyData.daily_crystal.element} Element</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </motion.div>
      )}

      {dailyData?.daily_mantra && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl bg-card/50 border border-white/5 hover:border-orange-500/20 transition-all duration-500 cursor-pointer group"
          onClick={() => navigate("/mantras")}
          data-testid="daily-mantra-card"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-orange-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Daily Mantra</p>
              <h4 className="text-xl font-serif mb-1 group-hover:text-primary transition-colors">{dailyData.daily_mantra.name}</h4>
              <p className="text-sm text-muted-foreground italic">{dailyData.daily_mantra.sanskrit}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </motion.div>
      )}

      {dailyData?.daily_breathwork && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl bg-card/50 border border-white/5 hover:border-cyan-500/20 transition-all duration-500 cursor-pointer group"
          onClick={() => navigate("/breathwork")}
          data-testid="daily-breathwork-card"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
              <Wind className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Daily Breathwork</p>
              <h4 className="text-xl font-serif mb-1 group-hover:text-primary transition-colors">{dailyData.daily_breathwork.name}</h4>
              <p className="text-sm text-muted-foreground">{dailyData.daily_breathwork.duration_minutes} minutes</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </motion.div>
      )}

      {dailyData?.yoga_sequence_of_day && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="p-6 rounded-2xl bg-card/50 border border-white/5 hover:border-emerald-400/30 transition-all duration-500 cursor-pointer group"
          onClick={() => navigate("/yoga")}
          data-testid="daily-yoga-sequence-card"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Play className="w-6 h-6 text-emerald-300" />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Yoga Sequence of the Day</p>
              <h4 className="text-xl font-serif mb-1 group-hover:text-primary transition-colors">{dailyData.yoga_sequence_of_day.name}</h4>
              <p className="text-sm text-muted-foreground">{dailyData.yoga_sequence_of_day.duration_minutes} minutes</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </motion.div>
      )}

      {dailyData?.sunrise_sunset_guidance && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl bg-card/50 border border-white/5 hover:border-amber-400/30 transition-all duration-500 cursor-pointer group"
          onClick={() => navigate("/sunrise-sunset-practices")}
          data-testid="daily-sunrise-sunset-card"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Sun className="w-6 h-6 text-amber-300" />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Sunrise / Sunset Guidance</p>
              <h4 className="text-xl font-serif mb-1 group-hover:text-primary transition-colors">Circadian Ritual Pair</h4>
              <p className="text-sm text-muted-foreground">Morning activation + evening release</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </motion.div>
      )}

      {dailyData?.daily_ally && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="p-6 rounded-2xl bg-card/50 border border-white/5 hover:border-fuchsia-400/30 transition-all duration-500 cursor-pointer group"
          onClick={() => navigate("/sacred-ally-alchemy")}
          data-testid="daily-ally-card"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 flex items-center justify-center">
              <Flame className="w-6 h-6 text-fuchsia-300" />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Sacred Ally Transmission</p>
              <h4 className="text-xl font-serif mb-1 group-hover:text-primary transition-colors">{dailyData.daily_ally.name}</h4>
              <p className="text-sm text-muted-foreground">{dailyData.daily_ally.element || "Spirit"} element guidance</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </motion.div>
      )}

      {dailyData?.daily_angel && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 rounded-2xl bg-card/50 border border-white/5 hover:border-sky-400/30 transition-all duration-500 cursor-pointer group"
          onClick={() => navigate("/sacred-ally-alchemy")}
          data-testid="daily-angel-card"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-sky-300" />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Angelic Alchemy Seal</p>
              <h4 className="text-xl font-serif mb-1 group-hover:text-primary transition-colors">{dailyData.daily_angel.name}</h4>
              <p className="text-sm text-muted-foreground">{dailyData.daily_angel.sacred_geometry || "Sacred geometry"}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </motion.div>
      )}

      {dailyData?.dragon_astrology_reflection && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="p-6 rounded-2xl bg-card/50 border border-white/5 hover:border-amber-300/30 transition-all duration-500 cursor-pointer group md:col-span-2"
          onClick={() => navigate("/astrology/charts")}
          data-testid="daily-dragon-reflection-card"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Star className="w-6 h-6 text-amber-300" />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Dragon & Astrology Reflection</p>
              <h4 className="text-xl font-serif mb-1 group-hover:text-primary transition-colors">{dailyData.dragon_astrology_reflection.title}</h4>
              <p className="text-sm text-muted-foreground">{dailyData.dragon_astrology_reflection.summary}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </motion.div>
      )}
    </div>
  </div>
);
