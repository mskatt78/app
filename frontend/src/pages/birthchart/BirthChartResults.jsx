import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Star,
  ChevronDown,
  Hexagon,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { BigThreeCard } from "../../components/birthchart/BigThreeCard";
import {
  formatDegree,
  getAspectColor,
  getElementBgColor,
  getElementColor,
  getPlanetIcon,
} from "./birthChartUtils";

export const BirthChartResults = ({
  chart,
  zodiacSigns,
  showAspects,
  setShowAspects,
  showHouses,
  setShowHouses,
  onNewChart,
}) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
    <BigThreeCard chart={chart} />

    <Card className="bg-card/50 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-purple-400" />
          Planetary Positions
        </CardTitle>
        <CardDescription>All planets calculated with Swiss Ephemeris precision</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {chart.planets?.map((planet, index) => {
            const signInfo = zodiacSigns[planet.sign] || {};
            return (
              <motion.div
                key={planet.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-3 rounded-xl ${getElementBgColor(signInfo.element)} border border-white/5 hover:border-white/10 transition-colors`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getPlanetIcon(planet.name)}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{planet.name}</p>
                        {planet.retrograde && (
                          <Badge variant="destructive" className="text-xs px-1 py-0">
                            ℞ Rx
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{planet.meaning}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-lg">{planet.sign_symbol}</span>
                      <span className="font-medium">{planet.sign}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDegree(planet.degree, planet.minute)} • House {planet.house}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="bg-gradient-to-br from-violet-500/20 to-purple-500/10 border-violet-500/30">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-3xl mb-2">{chart.ascendant?.sign_symbol}</div>
            <h3 className="text-sm text-muted-foreground uppercase tracking-wide">Ascendant (Rising)</h3>
            <p className="text-xl font-serif text-primary">{chart.ascendant?.sign}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDegree(chart.ascendant?.degree, chart.ascendant?.minute)}
            </p>
            <p className="text-xs text-muted-foreground mt-2 italic">{chart.ascendant?.meaning}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-amber-500/30">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-3xl mb-2">{chart.midheaven?.sign_symbol}</div>
            <h3 className="text-sm text-muted-foreground uppercase tracking-wide">Midheaven (MC)</h3>
            <p className="text-xl font-serif text-amber-400">{chart.midheaven?.sign}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDegree(chart.midheaven?.degree, chart.midheaven?.minute)}
            </p>
            <p className="text-xs text-muted-foreground mt-2 italic">{chart.midheaven?.meaning}</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <Card className="bg-card/50 border-white/10">
      <CardHeader className="cursor-pointer" onClick={() => setShowAspects(!showAspects)}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Planetary Aspects ({chart.aspects?.length || 0})
          </CardTitle>
          <ChevronDown className={`w-5 h-5 transition-transform ${showAspects ? "rotate-180" : ""}`} />
        </div>
        <CardDescription>Geometric relationships between planets</CardDescription>
      </CardHeader>
      <AnimatePresence>
        {showAspects && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {chart.aspects?.map((aspect, index) => (
                  <div
                    key={`${aspect.planet1}-${aspect.aspect}-${aspect.planet2}-${index}`}
                    className={`p-3 rounded-lg ${getAspectColor(aspect.aspect)} flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{aspect.planet1}</span>
                      <span className="text-lg">{aspect.symbol}</span>
                      <span className="font-medium">{aspect.planet2}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{aspect.aspect}</p>
                      <p className="text-xs text-muted-foreground">
                        Orb: {aspect.orb}° {aspect.applying ? "(applying)" : "(separating)"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="bg-card/50 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Element Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(chart.elements?.percentages || {}).map(([element, percent]) => (
              <div key={element}>
                <div className="flex justify-between text-xs mb-1">
                  <span className={getElementColor(element).split(" ")[0]}>{element}</span>
                  <span>{percent}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full ${getElementColor(element).split(" ")[1]}`}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-center mt-3 text-muted-foreground">
            Dominant: <span className="text-primary">{chart.elements?.dominant}</span>
          </p>
          {chart.elements?.interpretation && (
            <p className="text-xs text-muted-foreground mt-2 italic">{chart.elements.interpretation}</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Quality Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(chart.qualities?.percentages || {}).map(([quality, percent]) => (
              <div key={quality}>
                <div className="flex justify-between text-xs mb-1">
                  <span>{quality}</span>
                  <span>{percent}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-primary/50"
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-center mt-3 text-muted-foreground">
            Dominant: <span className="text-primary">{chart.qualities?.dominant}</span>
          </p>
          {chart.qualities?.interpretation && (
            <p className="text-xs text-muted-foreground mt-2 italic">{chart.qualities.interpretation}</p>
          )}
        </CardContent>
      </Card>
    </div>

    <Card className="bg-card/50 border-white/10">
      <CardHeader className="cursor-pointer" onClick={() => setShowHouses(!showHouses)}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Hexagon className="w-5 h-5 text-primary" />
            The 12 Houses
          </CardTitle>
          <ChevronDown className={`w-5 h-5 transition-transform ${showHouses ? "rotate-180" : ""}`} />
        </div>
      </CardHeader>
      <AnimatePresence>
        {showHouses && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.values(chart.houses || {}).map((house, index) => {
                  const signInfo = zodiacSigns[house.sign] || {};
                  return (
                    <motion.div
                      key={house.number}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className={`p-3 rounded-xl ${getElementBgColor(signInfo.element)} border border-white/5`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-lg font-serif text-primary">{house.number}</span>
                        <span className="text-lg">{house.sign_symbol}</span>
                      </div>
                      <p className="text-xs font-medium">{house.theme}</p>
                      <p className="text-xs text-muted-foreground">{house.sign}</p>
                      <p className="text-xs text-muted-foreground/60">{formatDegree(house.degree, house.minute)}</p>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>

    <Card className="bg-card/30 border-white/5">
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="w-4 h-4" />
          <span>
            Calculated using {chart.calculation_method} • Precision: {chart.precision} •
            Julian Day: {chart.birth_data?.julian_day}
          </span>
        </div>
      </CardContent>
    </Card>

    <Button variant="outline" onClick={onNewChart} className="w-full" data-testid="new-chart-btn">
      Calculate New Chart
    </Button>
  </motion.div>
);