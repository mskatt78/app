import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MapPin, Calendar, Users, DollarSign,
  Check, ExternalLink, Star, Droplets, Flame, Wind, Leaf, Sparkles, X
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { appLogger } from "../../utils/logger";

const HEALING_MODALITIES = [
  {
    id: "elemental",
    title: "Elemental Healing",
    subtitle: "Working through the 5 Elements",
    icon: Leaf,
    color: "from-emerald-500/20 to-teal-500/20",
    accent: "text-emerald-300",
    border: "border-emerald-500/30",
    description: "Deep transformational work through Earth, Water, Fire, Air & Spirit. Each element carries its own medicine — grounding, flowing, transforming, releasing, and transcending.",
    practices: [
      "Earth — Grounding ceremonies & ancestral healing",
      "Water — Emotional release & womb cleansing rituals",
      "Fire — Shadow work & transformational breathwork",
      "Air — Sound healing & voice activation",
      "Spirit — Integration & light body activation"
    ]
  },
  {
    id: "womb",
    title: "Womb Healing",
    subtitle: "Sacred Feminine Restoration",
    icon: Droplets,
    color: "from-rose-500/20 to-pink-500/20",
    accent: "text-rose-300",
    border: "border-rose-500/30",
    description: "The womb is the seat of creation, intuition, and feminine power. This deep healing work addresses ancestral womb trauma and sacred feminine restoration.",
    practices: [
      "Womb clearing & ancestral lineage healing",
      "Sacred menstrual cycle reconnection",
      "Yoni steaming ceremonies",
      "Womb massage & somatic release",
      "Divine feminine embodiment practices"
    ]
  },
];

const RetreatsContainer = ({ api }) => {
  const navigate = useNavigate();
  const [retreats, setRetreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRetreat, setSelectedRetreat] = useState(null);
  const [activeModality, setActiveModality] = useState(null);

  useEffect(() => {
    const fetchRetreats = async () => {
      try {
        const response = await api.get("/retreats");
        setRetreats(response.data || []);
      } catch (error) {
        appLogger.error("Failed to fetch retreats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRetreats();
  }, [api]);

  const getStatusStyle = (status) => {
    const styles = {
      upcoming: "bg-sky-500/15 text-sky-300 border-sky-500/30",
      open: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      full: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      completed: "bg-white/5 text-muted-foreground border-white/10",
      permanent: "bg-violet-500/15 text-violet-300 border-violet-500/30",
    };
    return styles[status] || styles.upcoming;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "TBA";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  };

  const sortedRetreats = useMemo(
    () => [...retreats].sort((a, b) => new Date(a.start_date || 0) - new Date(b.start_date || 0)),
    [retreats],
  );

  return (
    <div className="min-h-screen bg-background" data-testid="retreats-page">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/menu")} data-testid="back-btn">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-serif">Retreats & <span className="italic text-primary">Immersions</span></h1>
            <p className="text-sm text-muted-foreground">Join transformational healing journeys</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        <section data-testid="retreat-modalities-grid">
          <h2 className="text-xl font-serif mb-4">Healing Modalities</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {HEALING_MODALITIES.map((modality) => {
              const Icon = modality.icon;
              return (
                <button
                  key={modality.id}
                  onClick={() => setActiveModality(modality)}
                  className={`p-5 rounded-2xl text-left border ${modality.border} bg-gradient-to-br ${modality.color}`}
                  data-testid={`retreat-modality-${modality.id}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-5 h-5 ${modality.accent}`} />
                    <h3 className="font-serif text-lg">{modality.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{modality.subtitle}</p>
                  <p className="text-sm text-muted-foreground line-clamp-3">{modality.description}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section data-testid="retreats-list-section">
          <h2 className="text-xl font-serif mb-4">Upcoming Retreats</h2>
          {loading ? (
            <div className="flex justify-center py-10" data-testid="retreats-loading-state">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : sortedRetreats.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground" data-testid="retreats-empty-state">
              No retreats listed yet. Add your own retreats from admin.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5" data-testid="retreats-grid">
              {sortedRetreats.map((retreat) => (
                <motion.button
                  key={retreat.retreat_id || retreat.id}
                  whileHover={{ y: -2 }}
                  onClick={() => setSelectedRetreat(retreat)}
                  className="text-left p-5 rounded-2xl bg-card/60 border border-white/10"
                  data-testid={`retreat-card-${retreat.retreat_id || retreat.id}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-serif text-xl">{retreat.title || retreat.name}</h3>
                    <Badge className={`${getStatusStyle(retreat.status)} border`}>{retreat.status || "upcoming"}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{retreat.description}</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(retreat.start_date)}</p>
                    <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {retreat.location || "Location TBA"}</p>
                    <p className="flex items-center gap-1"><Users className="w-3 h-3" /> {retreat.capacity || "Limited"} spots</p>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </section>
      </main>

      <AnimatePresence>
        {selectedRetreat && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center" data-testid="retreat-details-modal">
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="w-full max-w-2xl rounded-2xl bg-card border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-serif">{selectedRetreat.title || selectedRetreat.name}</h3>
                <button onClick={() => setSelectedRetreat(null)} data-testid="retreat-modal-close-btn"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{selectedRetreat.description}</p>
              <div className="grid grid-cols-2 gap-3 text-sm mb-5">
                <div className="p-3 rounded-lg bg-background/60 border border-white/10"><Calendar className="w-4 h-4 mb-1" /> {formatDate(selectedRetreat.start_date)}</div>
                <div className="p-3 rounded-lg bg-background/60 border border-white/10"><MapPin className="w-4 h-4 mb-1" /> {selectedRetreat.location || "Location TBA"}</div>
                <div className="p-3 rounded-lg bg-background/60 border border-white/10"><Users className="w-4 h-4 mb-1" /> {selectedRetreat.capacity || "Limited"} spots</div>
                <div className="p-3 rounded-lg bg-background/60 border border-white/10"><DollarSign className="w-4 h-4 mb-1" /> {selectedRetreat.price ? `$${selectedRetreat.price}` : "Contact for pricing"}</div>
              </div>
              {selectedRetreat.booking_url && (
                <a href={selectedRetreat.booking_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground" data-testid="retreat-booking-link">
                  Book Now <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeModality && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center" data-testid="retreat-modality-modal">
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="w-full max-w-2xl rounded-2xl bg-card border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-serif">{activeModality.title}</h3>
                <button onClick={() => setActiveModality(null)} data-testid="retreat-modality-close-btn"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{activeModality.description}</p>
              <ul className="space-y-2 text-sm">
                {activeModality.practices.map((practice) => (
                  <li key={practice} className="flex gap-2"><Check className="w-4 h-4 text-primary mt-0.5" /><span>{practice}</span></li>
                ))}
              </ul>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RetreatsContainer;
