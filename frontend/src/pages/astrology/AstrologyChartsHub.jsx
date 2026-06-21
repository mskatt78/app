import { useState } from "react";
import { motion } from "framer-motion";
import { Compass, Flame, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import BirthChart from "../BirthChart";
import DragonChartPanel from "./DragonChartPanel";

const AstrologyChartsHub = ({ user, api }) => {
  const [tab, setTab] = useState("birth-chart");

  return (
    <div className="min-h-screen bg-background pb-20" data-testid="astrology-charts-hub">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5"
          data-testid="astrology-charts-header"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80 mb-2">Astrology Charts</p>
          <h1 className="text-4xl sm:text-5xl font-serif leading-tight">
            Natal & <span className="text-amber-300 italic">Dragon</span> Intelligence
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-3xl" data-testid="astrology-charts-subtitle">
            Build your full natal map, then open your Dragon axis (Head/Tail karmic vector) and Chinese dragon-year profile.
          </p>
        </motion.div>

        <Tabs value={tab} onValueChange={setTab} className="w-full" data-testid="astrology-charts-tabs">
          <TabsList className="grid grid-cols-2 mb-6 bg-card/60 border border-white/10">
            <TabsTrigger value="birth-chart" className="gap-2" data-testid="astrology-tab-birth-chart">
              <Star className="w-4 h-4" /> Full Birth Chart
            </TabsTrigger>
            <TabsTrigger value="dragon-chart" className="gap-2" data-testid="astrology-tab-dragon-chart">
              <Flame className="w-4 h-4" /> Dragon Chart
            </TabsTrigger>
          </TabsList>

          <TabsContent value="birth-chart" data-testid="astrology-birth-chart-content">
            <BirthChart user={user} api={api} embeddedMode />
          </TabsContent>

          <TabsContent value="dragon-chart" data-testid="astrology-dragon-chart-content">
            <DragonChartPanel user={user} api={api} />
          </TabsContent>
        </Tabs>

        <div className="mt-8 rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-900/20 via-background to-amber-900/20 p-4" data-testid="astrology-charts-footer-note">
          <div className="flex items-start gap-3">
            <Compass className="w-5 h-5 text-cyan-300 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Exact birth time and birthplace are required for precise house and node calculations in both chart systems.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AstrologyChartsHub;
