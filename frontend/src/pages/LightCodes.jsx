import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Sparkles, Star, Eye, Triangle, Circle, 
  Hexagon, Square, X, Volume2
} from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

const LightCodes = ({ user, api }) => {
  const navigate = useNavigate();
  const [lightCodes, setLightCodes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("sacred_geometry");
  const [selectedSymbol, setSelectedSymbol] = useState(null);

  const categories = [
    { 
      id: "sacred_geometry", 
      name: "Sacred Geometry", 
      icon: Hexagon,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
      description: "The mathematical patterns underlying all creation"
    },
    { 
      id: "ancient_alphabets", 
      name: "Ancient Alphabets", 
      icon: Square,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      description: "Sacred symbols from ancient wisdom traditions"
    },
    { 
      id: "light_language_symbols", 
      name: "Light Language", 
      icon: Star,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
      description: "Activational codes for spiritual awakening"
    }
  ];

  useEffect(() => {
    fetchLightCodes();
  }, []);

  const fetchLightCodes = async () => {
    try {
      const response = await api.get("/light-codes");
      setLightCodes(response.data);
    } catch (error) {
      console.error("Failed to fetch light codes:", error);
      toast.error("Could not load light codes");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentSymbols = () => {
    if (!lightCodes) return [];
    return lightCodes[activeCategory] || [];
  };

  const getActiveCategoryInfo = () => {
    return categories.find(c => c.id === activeCategory);
  };

  return (
    <div className="min-h-screen bg-background" data-testid="light-codes">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/menu")} className="p-2 rounded-full hover:bg-white/5 transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Sacred Symbols</p>
              <h1 className="text-xl font-serif">Light Codes & <span className="italic text-primary">Light Linguistics</span></h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 rounded-2xl bg-gradient-to-br from-violet-500/10 via-cyan-500/5 to-amber-500/10 border border-white/10"
        >
          <div className="flex justify-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-violet-500/20 flex items-center justify-center">
              <Hexagon className="w-7 h-7 text-violet-400" />
            </div>
            <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center">
              <span className="text-2xl">ॐ</span>
            </div>
            <div className="w-14 h-14 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-3xl font-serif mb-4">
            Light Codes & <span className="italic text-primary">Ancient Symbols</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto px-6 text-lg">
            Sacred geometry, ancient alphabets, and light language symbols carry vibrational codes 
            that can activate dormant aspects of consciousness and facilitate healing.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-4 justify-center">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-4 rounded-2xl flex items-center gap-3 transition-all ${
                  isActive 
                    ? `${category.bg} ${category.color} border ${category.border}` 
                    : "bg-card/50 text-muted-foreground border border-white/5 hover:border-white/10"
                }`}
                data-testid={`category-${category.id}`}
              >
                <Icon className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">{category.name}</p>
                  <p className="text-xs opacity-70 hidden sm:block">{category.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 animate-pulse flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary animate-spin" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getCurrentSymbols().map((symbol, index) => {
              const categoryInfo = getActiveCategoryInfo();
              return (
                <motion.div
                  key={symbol.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedSymbol(symbol)}
                  className={`group cursor-pointer rounded-2xl overflow-hidden border ${categoryInfo.border} ${categoryInfo.bg}
                             hover:scale-[1.02] transition-all duration-300`}
                >
                  {/* Image or Symbol Display */}
                  {symbol.image_url ? (
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={symbol.image_url} 
                        alt={symbol.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                    </div>
                  ) : (
                    <div className={`h-48 flex items-center justify-center ${categoryInfo.bg}`}>
                      <span className="text-6xl">{symbol.symbol || "✨"}</span>
                    </div>
                  )}
                  
                  <div className="p-5">
                    <h3 className="text-xl font-serif mb-2 group-hover:text-primary transition-colors">
                      {symbol.name}
                    </h3>
                    <p className="text-base text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                      {symbol.description || symbol.meaning}
                    </p>
                    
                    {symbol.purpose && (
                      <p className={`text-sm ${categoryInfo.color}`}>
                        {symbol.purpose}
                      </p>
                    )}
                    
                    <div className={`mt-4 flex items-center gap-1 text-sm ${categoryInfo.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                      <Eye className="w-4 h-4" />
                      <span>Explore</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Wisdom Section */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 text-center">
          <Sparkles className="w-10 h-10 mx-auto mb-4 text-primary/50" />
          <blockquote className="text-lg font-serif italic text-foreground/80 max-w-2xl mx-auto">
            "Sacred geometry is the fingerprint of creation, 
            revealing the hidden architecture of the universe 
            in every flower, galaxy, and strand of DNA."
          </blockquote>
        </div>
      </main>

      {/* Symbol Detail Modal */}
      <AnimatePresence>
        {selectedSymbol && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedSymbol(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedSymbol(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {selectedSymbol.image_url ? (
                <div className="h-56 overflow-hidden rounded-t-2xl">
                  <img 
                    src={selectedSymbol.image_url} 
                    alt={selectedSymbol.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className={`h-56 flex items-center justify-center ${getActiveCategoryInfo()?.bg}`}>
                  <span className="text-8xl">{selectedSymbol.symbol || "✨"}</span>
                </div>
              )}

              <div className="p-6 space-y-4">
                <div>
                  <h2 className="text-2xl font-serif mb-2">{selectedSymbol.name}</h2>
                  <p className="text-muted-foreground">{selectedSymbol.description}</p>
                </div>

                {selectedSymbol.meaning && (
                  <div className={`p-4 rounded-xl ${getActiveCategoryInfo()?.bg} border ${getActiveCategoryInfo()?.border}`}>
                    <h3 className="font-medium mb-2">Meaning</h3>
                    <p className="text-muted-foreground">{selectedSymbol.meaning}</p>
                  </div>
                )}

                {selectedSymbol.meditation && (
                  <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                    <h3 className="font-medium mb-2 text-violet-300">Meditation Practice</h3>
                    <p className="text-muted-foreground">{selectedSymbol.meditation}</p>
                  </div>
                )}

                {selectedSymbol.activation && (
                  <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <h3 className="font-medium mb-2 text-cyan-300">Activation</h3>
                    <p className="text-muted-foreground">{selectedSymbol.activation}</p>
                  </div>
                )}

                {selectedSymbol.purpose && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <h3 className="font-medium mb-2 text-amber-300">Purpose</h3>
                    <p className="text-muted-foreground">{selectedSymbol.purpose}</p>
                  </div>
                )}

                {selectedSymbol.practice && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <h3 className="font-medium mb-2 text-emerald-300">Practice</h3>
                    <p className="text-muted-foreground">{selectedSymbol.practice}</p>
                  </div>
                )}

                {selectedSymbol.pronunciation && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
                    <Volume2 className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Pronunciation</p>
                      <p className="font-medium">{selectedSymbol.pronunciation}</p>
                    </div>
                  </div>
                )}

                <Button onClick={() => setSelectedSymbol(null)} className="w-full" variant="outline">
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LightCodes;
