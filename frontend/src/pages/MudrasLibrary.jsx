import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Hand, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";

const MudrasLibrary = ({ user, api }) => {
  const navigate = useNavigate();
  const [mudras, setMudras] = useState([]);
  const [filteredMudras, setFilteredMudras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElement, setSelectedElement] = useState("all");
  const [selectedMudra, setSelectedMudra] = useState(null);

  const elements = ["all", "Earth", "Water", "Fire", "Air", "Spirit"];

  const elementColors = {
    Earth: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    Water: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    Fire: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    Air: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    Spirit: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  };

  useEffect(() => {
    fetchMudras();
  }, []);

  useEffect(() => {
    if (selectedElement === "all") {
      setFilteredMudras(mudras);
    } else {
      setFilteredMudras(mudras.filter(m => m.element === selectedElement));
    }
  }, [selectedElement, mudras]);

  const fetchMudras = async () => {
    try {
      const response = await api.get("/mudras");
      setMudras(response.data);
      setFilteredMudras(response.data);
    } catch (error) {
      console.error("Failed to fetch mudras:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="mudras-library">
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
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Sacred Gestures</p>
              <h1 className="text-xl font-serif">Mudras <span className="italic text-primary">Library</span></h1>
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

      <main className="max-w-6xl mx-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMudras.map((mudra, index) => {
              const colors = elementColors[mudra.element] || elementColors.Spirit;
              return (
                <motion.div
                  key={mudra.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-6 rounded-2xl border backdrop-blur-xl cursor-pointer
                             ${colors.bg} ${colors.border} hover:scale-[1.02] transition-all duration-300`}
                  onClick={() => setSelectedMudra(mudra)}
                  data-testid={`mudra-card-${mudra.id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${colors.bg}`}>
                      <Hand className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs ${colors.bg} ${colors.text}`}>
                      {mudra.element}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-serif mb-1">{mudra.name}</h3>
                  {mudra.sanskrit_name && (
                    <p className="text-sm text-muted-foreground italic mb-4">{mudra.sanskrit_name}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-1">
                    {mudra.benefits?.slice(0, 2).map((benefit) => (
                      <span key={benefit} className="px-2 py-1 rounded-full bg-white/5 text-xs text-muted-foreground">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Mudra Detail Dialog */}
      <Dialog open={!!selectedMudra} onOpenChange={() => setSelectedMudra(null)}>
        <DialogContent className="bg-card border-white/10 max-w-lg">
          {selectedMudra && (
            <>
              <DialogHeader>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-2 w-fit
                               ${elementColors[selectedMudra.element]?.bg} ${elementColors[selectedMudra.element]?.text}`}>
                  {selectedMudra.element} Element
                </div>
                <DialogTitle className="text-2xl font-serif">{selectedMudra.name}</DialogTitle>
                {selectedMudra.sanskrit_name && (
                  <p className="text-muted-foreground italic">{selectedMudra.sanskrit_name}</p>
                )}
              </DialogHeader>

              <div className="space-y-6 mt-4">
                <div>
                  <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-2">How to Form</h4>
                  <p className="text-muted-foreground leading-relaxed">{selectedMudra.description}</p>
                </div>

                <div>
                  <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Benefits</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMudra.benefits?.map((benefit) => (
                      <span key={benefit} className="px-3 py-1 rounded-full bg-white/5 text-sm">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-primary">Practice:</strong> Hold this mudra during meditation 
                    for 5-15 minutes, or while doing breathwork to enhance its effects.
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MudrasLibrary;
