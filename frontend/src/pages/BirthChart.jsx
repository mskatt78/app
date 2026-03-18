import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Sun, Moon, Star, Sparkles, Calendar, Clock, MapPin,
  ChevronRight, Loader2, Save, User
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";

const BirthChart = ({ user, api }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [chart, setChart] = useState(null);
  const [zodiacSigns, setZodiacSigns] = useState({});
  const [formData, setFormData] = useState({
    birth_date: "",
    birth_time: "12:00",
    birth_city: "",
    birth_country: ""
  });

  useEffect(() => {
    fetchZodiacSigns();
    if (user) {
      fetchSavedChart();
    }
  }, [user]);

  const fetchZodiacSigns = async () => {
    try {
      const response = await api.get("/birth-chart/zodiac-signs");
      setZodiacSigns(response.data);
    } catch (error) {
      console.error("Failed to fetch zodiac signs:", error);
    }
  };

  const fetchSavedChart = async () => {
    try {
      setLoading(true);
      const response = await api.get("/birth-chart/my-chart");
      setChart(response.data);
    } catch (error) {
      // No saved chart - that's OK
    } finally {
      setLoading(false);
    }
  };

  const calculateChart = async () => {
    if (!formData.birth_date || !formData.birth_city || !formData.birth_country) {
      toast.error("Please fill in all required fields");
      return;
    }

    setCalculating(true);
    try {
      const endpoint = user ? "/birth-chart/save" : "/birth-chart/calculate";
      const response = await api.post(endpoint, formData);
      setChart(response.data);
      toast.success("Birth chart calculated!");
    } catch (error) {
      console.error("Chart calculation error:", error);
      toast.error(error.response?.data?.detail || "Failed to calculate chart");
    } finally {
      setCalculating(false);
    }
  };

  const getElementColor = (element) => {
    switch (element) {
      case "Fire": return "text-orange-400 bg-orange-500/20";
      case "Earth": return "text-emerald-400 bg-emerald-500/20";
      case "Air": return "text-cyan-400 bg-cyan-500/20";
      case "Water": return "text-blue-400 bg-blue-500/20";
      default: return "text-purple-400 bg-purple-500/20";
    }
  };

  const getPlanetIcon = (planet) => {
    switch (planet) {
      case "Sun": return <Sun className="w-5 h-5 text-yellow-400" />;
      case "Moon": return <Moon className="w-5 h-5 text-slate-300" />;
      default: return <Star className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
              className="shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-serif">Birth Chart</h1>
              <p className="text-xs text-muted-foreground">Your Cosmic Blueprint</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Input Form */}
        {!chart && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Calculate Your Birth Chart
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enter your birth details to discover your Sun sign, Moon sign, planetary placements, and house positions.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4" /> Birth Date *
                    </label>
                    <Input
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                      data-testid="birth-date-input"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4" /> Birth Time
                    </label>
                    <Input
                      type="time"
                      value={formData.birth_time}
                      onChange={(e) => setFormData({ ...formData, birth_time: e.target.value })}
                      data-testid="birth-time-input"
                    />
                    <p className="text-xs text-muted-foreground mt-1">For accurate Moon & Rising signs</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4" /> Birth City *
                    </label>
                    <Input
                      placeholder="e.g., New York"
                      value={formData.birth_city}
                      onChange={(e) => setFormData({ ...formData, birth_city: e.target.value })}
                      data-testid="birth-city-input"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4" /> Birth Country *
                    </label>
                    <Input
                      placeholder="e.g., USA"
                      value={formData.birth_country}
                      onChange={(e) => setFormData({ ...formData, birth_country: e.target.value })}
                      data-testid="birth-country-input"
                    />
                  </div>
                </div>

                <Button
                  onClick={calculateChart}
                  disabled={calculating}
                  className="w-full"
                  data-testid="calculate-chart-btn"
                >
                  {calculating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Calculate My Birth Chart
                    </>
                  )}
                </Button>

                {!user && (
                  <p className="text-xs text-center text-muted-foreground">
                    <User className="w-3 h-3 inline mr-1" />
                    Sign in to save your chart
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Chart Display */}
        {chart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Sun Sign Hero */}
            <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border-yellow-500/30 overflow-hidden">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-6xl mb-2">{chart.sun_sign_info?.symbol || "☀️"}</div>
                  <h2 className="text-3xl font-serif text-yellow-400">{chart.sun_sign}</h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    {chart.sun_sign_info?.element} Sign • {chart.sun_sign_info?.quality}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ruled by {chart.sun_sign_info?.ruler}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Planetary Positions */}
            <Card className="bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-purple-400" />
                  Planetary Positions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {chart.planets?.map((planet, index) => (
                    <motion.div
                      key={planet.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {getPlanetIcon(planet.name)}
                        <div>
                          <p className="font-medium">{planet.name}</p>
                          <p className="text-xs text-muted-foreground">{planet.meaning}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium flex items-center gap-1">
                          <span>{planet.sign_symbol}</span>
                          <span>{planet.sign}</span>
                          {planet.retrograde && <span className="text-xs text-red-400">℞</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {planet.degree}° • House {planet.house}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Element & Quality Balance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Elements */}
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
                </CardContent>
              </Card>

              {/* Qualities */}
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
                </CardContent>
              </Card>
            </div>

            {/* Houses */}
            <Card className="bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  The 12 Houses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {chart.houses?.map((house, index) => (
                    <motion.div
                      key={house.number}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-lg font-serif text-primary">{house.number}</span>
                        <span className="text-lg">{house.sign_symbol}</span>
                      </div>
                      <p className="text-xs font-medium">{house.theme}</p>
                      <p className="text-xs text-muted-foreground">{house.sign}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Calculate New Chart Button */}
            <Button
              variant="outline"
              onClick={() => setChart(null)}
              className="w-full"
            >
              Calculate New Chart
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BirthChart;
