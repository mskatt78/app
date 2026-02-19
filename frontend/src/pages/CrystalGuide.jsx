import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Filter, Heart } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";

const CrystalGuide = ({ user, api }) => {
  const navigate = useNavigate();
  const [crystals, setCrystals] = useState([]);
  const [filteredCrystals, setFilteredCrystals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElement, setSelectedElement] = useState("all");
  const [selectedCrystal, setSelectedCrystal] = useState(null);

  const elements = ["all", "Earth", "Water", "Fire", "Air", "Spirit"];

  const elementColors = {
    Earth: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    Water: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    Fire: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    Air: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    Spirit: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  };

  useEffect(() => {
    fetchCrystals();
  }, []);

  useEffect(() => {
    if (selectedElement === "all") {
      setFilteredCrystals(crystals);
    } else {
      setFilteredCrystals(crystals.filter(c => c.element === selectedElement));
    }
  }, [selectedElement, crystals]);

  const fetchCrystals = async () => {
    try {
      const response = await api.get("/crystals");
      setCrystals(response.data);
      setFilteredCrystals(response.data);
    } catch (error) {
      console.error("Failed to fetch crystals:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="crystal-guide">
      {/* Background */}
      <div 
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1763021225760-1f9101fd3b38?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzV8MHwxfHNlYXJjaHwyfHxjcnlzdGFscyUyMGFtZXRoeXN0JTIwcXVhcnR6JTIwZGFyayUyMG15c3RpY2FsJTIwYmFja2dyb3VuZHxlbnwwfHx8fDE3NzE1MDQxNzd8MA&ixlib=rb-4.1.0&q=85')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              data-testid="back-btn"
              onClick={() => navigate("/dashboard")}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Earth's Treasures</p>
              <h1 className="text-xl font-serif">Crystal <span className="italic text-primary">Guide</span></h1>
            </div>
          </div>

          <Select value={selectedElement} onValueChange={setSelectedElement}>
            <SelectTrigger data-testid="element-filter" className="w-40 bg-card border-white/10">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              {elements.map((el) => (
                <SelectItem key={el} value={el}>
                  {el === "all" ? "All Elements" : el}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCrystals.map((crystal, index) => {
              const colors = elementColors[crystal.element] || elementColors.Spirit;
              return (
                <motion.div
                  key={crystal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-6 rounded-2xl border backdrop-blur-xl cursor-pointer
                             ${colors.bg} ${colors.border} hover:scale-[1.02] transition-all duration-300`}
                  onClick={() => setSelectedCrystal(crystal)}
                  data-testid={`crystal-card-${crystal.id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${colors.bg}`}>
                      <Sparkles className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs ${colors.bg} ${colors.text}`}>
                      {crystal.element}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-serif mb-3">{crystal.name}</h3>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {crystal.chakras?.map((chakra) => (
                      <span key={chakra} className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
                        {chakra}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {crystal.properties?.slice(0, 3).map((prop) => (
                      <span key={prop} className="px-2 py-1 rounded-full bg-white/5 text-xs text-muted-foreground">
                        {prop}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Crystal Detail Dialog */}
      <Dialog open={!!selectedCrystal} onOpenChange={() => setSelectedCrystal(null)}>
        <DialogContent className="bg-card border-white/10 max-w-lg">
          {selectedCrystal && (
            <>
              <DialogHeader>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-2 w-fit
                               ${elementColors[selectedCrystal.element]?.bg} ${elementColors[selectedCrystal.element]?.text}`}>
                  {selectedCrystal.element} Element
                </div>
                <DialogTitle className="text-3xl font-serif">{selectedCrystal.name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                <p className="text-muted-foreground leading-relaxed">{selectedCrystal.description}</p>

                <div>
                  <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <Heart className="w-4 h-4" /> Chakras
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCrystal.chakras?.map((chakra) => (
                      <span key={chakra} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                        {chakra}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Properties</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCrystal.properties?.map((prop) => (
                      <span key={prop} className="px-3 py-1 rounded-full bg-white/5 text-sm">
                        {prop}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CrystalGuide;
