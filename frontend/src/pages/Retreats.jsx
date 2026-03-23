import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MapPin, Calendar, Users, DollarSign,
  Check, ExternalLink, Star, Droplets, Flame, Wind, Leaf, Sparkles, X
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

const HEALING_MODALITIES = [
  {
    id: "elemental",
    title: "Elemental Healing",
    subtitle: "Working through the 5 Elements",
    icon: Leaf,
    color: "from-emerald-500/20 to-teal-500/20",
    accent: "text-emerald-300",
    border: "border-emerald-500/30",
    description: "Deep transformational work through Earth, Water, Fire, Air & Spirit. Each element carries its own medicine — grounding, flowing, transforming, releasing, and transcending. Through ceremony, breathwork, and somatic practice, we journey through each element to reclaim lost parts of ourselves.",
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
    description: "The womb is the seat of creation, intuition, and feminine power. This deep healing work addresses ancestral womb trauma, menstrual cycle wisdom, sacred sexuality, and the restoration of the divine feminine template. Through ceremony, yoni steaming, womb massage, and energetic clearing, we return the womb to its original sacred state.",
    practices: [
      "Womb clearing & ancestral lineage healing",
      "Sacred menstrual cycle reconnection",
      "Yoni steaming ceremonies",
      "Womb massage & somatic release",
      "Divine feminine embodiment practices"
    ]
  },
];

const Retreats = ({ user, api }) => {
  const navigate = useNavigate();
  const [retreats, setRetreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRetreat, setSelectedRetreat] = useState(null);
  const [activeModality, setActiveModality] = useState(null);

  useEffect(() => {
    fetchRetreats();
  }, []);

  const fetchRetreats = async () => {
    try {
      const response = await api.get("/retreats");
      setRetreats(response.data || []);
    } catch (error) {
      console.error("Failed to fetch retreats:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const parseHighlights = (highlights) => {
    if (Array.isArray(highlights)) return highlights;
    if (typeof highlights === "string") return highlights.split("\n").filter(Boolean);
    return [];
  };

  return (
    <div className="min-h-screen bg-background" data-testid="retreats-page">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-white/5 transition-colors"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Sacred Journeys</p>
            <h1 className="text-xl font-serif">Retreats & Healing Work</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-16">

        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-4xl sm:text-5xl font-serif mb-4 leading-tight">
              Immersive Healing<br />
              <span className="italic text-primary/80">Experiences</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed text-base sm:text-lg max-w-xl mx-auto">
              Journey deep into sacred ceremony, elemental healing, and womb work
              in transformative retreat spaces held with love and intention.
            </p>
          </motion.div>
        </section>

        {/* Healing Modalities Section */}
        <section>
          <div className="text-center mb-8">
            <h3 className="text-2xl font-serif mb-2">Healing Modalities</h3>
            <p className="text-sm text-muted-foreground">The medicine offered through our retreat work</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {HEALING_MODALITIES.map((mod, idx) => (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setActiveModality(activeModality === mod.id ? null : mod.id)}
                className={`rounded-2xl border ${mod.border} bg-gradient-to-br ${mod.color} p-6 cursor-pointer transition-all hover:scale-[1.01]`}
                data-testid={`modality-${mod.id}`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${mod.accent}`}>
                    <mod.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-lg font-serif ${mod.accent}`}>{mod.title}</h4>
                    <p className="text-xs text-muted-foreground">{mod.subtitle}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{mod.description}</p>
                <AnimatePresence>
                  {activeModality === mod.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 border-t border-white/10 space-y-2">
                        {mod.practices.map((p, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Sparkles className={`w-3 h-3 mt-1 flex-shrink-0 ${mod.accent}`} />
                            <span>{p}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Retreats List */}
        <section>
          <div className="text-center mb-8">
            <h3 className="text-2xl font-serif mb-2">Upcoming Retreats</h3>
            <p className="text-sm text-muted-foreground">Sacred spaces for deep healing and transformation</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : retreats.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 rounded-2xl border border-white/10 bg-card/30"
            >
              <MapPin className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground font-serif text-lg">New retreats coming soon</p>
              <p className="text-sm text-muted-foreground/60 mt-2 max-w-md mx-auto">
                Sacred retreat experiences are being prepared. Check back soon or add retreats through the Admin CMS.
              </p>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {retreats.map((retreat, index) => (
                <motion.div
                  key={retreat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedRetreat(retreat)}
                  className="group cursor-pointer rounded-2xl overflow-hidden border border-white/10 hover:border-primary/30 bg-card/50 transition-all"
                  data-testid={`retreat-card-${retreat.id}`}
                >
                  {retreat.image_url && (
                    <div className="aspect-[16/9] relative overflow-hidden">
                      <img
                        src={retreat.image_url}
                        alt={retreat.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4">
                        <Badge className={getStatusStyle(retreat.status)}>
                          {retreat.status === "open" ? "Open for Registration" : retreat.status || "Upcoming"}
                        </Badge>
                      </div>
                    </div>
                  )}
                  <div className="p-5 space-y-3">
                    <h4 className="text-lg font-serif group-hover:text-primary transition-colors">
                      {retreat.title}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{retreat.description}</p>
                    <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground pt-2">
                      {retreat.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-primary/70" />
                          {retreat.location}
                        </div>
                      )}
                      {retreat.duration_days && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-primary/70" />
                          {retreat.duration_days} days
                        </div>
                      )}
                      {retreat.max_participants && (
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-primary/70" />
                          Max {retreat.max_participants}
                        </div>
                      )}
                      {retreat.price && (
                        <div className="flex items-center gap-1.5 font-medium text-primary/80">
                          <DollarSign className="w-3.5 h-3.5" />
                          {retreat.price}
                        </div>
                      )}
                    </div>
                    {(retreat.start_date || retreat.end_date) && (
                      <p className="text-xs text-muted-foreground/60 pt-1">
                        {formatDate(retreat.start_date)} {retreat.end_date ? `— ${formatDate(retreat.end_date)}` : ""}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Retreat Detail Modal */}
      <AnimatePresence>
        {selectedRetreat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedRetreat(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              data-testid="retreat-detail-modal"
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-white/10 bg-card">
                <div className="flex items-center gap-3">
                  <Badge className={getStatusStyle(selectedRetreat.status)}>
                    {selectedRetreat.status || "Upcoming"}
                  </Badge>
                  <h3 className="font-serif text-lg">{selectedRetreat.title}</h3>
                </div>
                <button onClick={() => setSelectedRetreat(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {selectedRetreat.image_url && (
                  <img
                    src={selectedRetreat.image_url}
                    alt={selectedRetreat.title}
                    className="w-full aspect-video object-cover rounded-xl"
                  />
                )}

                <p className="text-muted-foreground leading-relaxed">{selectedRetreat.description}</p>

                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {selectedRetreat.location && (
                    <div className="p-3 rounded-xl bg-white/5 text-center">
                      <MapPin className="w-4 h-4 mx-auto mb-1.5 text-primary" />
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm font-medium">{selectedRetreat.location}</p>
                    </div>
                  )}
                  {selectedRetreat.duration_days && (
                    <div className="p-3 rounded-xl bg-white/5 text-center">
                      <Calendar className="w-4 h-4 mx-auto mb-1.5 text-primary" />
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="text-sm font-medium">{selectedRetreat.duration_days} days</p>
                    </div>
                  )}
                  {selectedRetreat.max_participants && (
                    <div className="p-3 rounded-xl bg-white/5 text-center">
                      <Users className="w-4 h-4 mx-auto mb-1.5 text-primary" />
                      <p className="text-xs text-muted-foreground">Group Size</p>
                      <p className="text-sm font-medium">Max {selectedRetreat.max_participants}</p>
                    </div>
                  )}
                  {selectedRetreat.price && (
                    <div className="p-3 rounded-xl bg-white/5 text-center">
                      <DollarSign className="w-4 h-4 mx-auto mb-1.5 text-primary" />
                      <p className="text-xs text-muted-foreground">Investment</p>
                      <p className="text-sm font-medium">${selectedRetreat.price}</p>
                    </div>
                  )}
                </div>

                {(selectedRetreat.start_date || selectedRetreat.end_date) && (
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Dates:</strong> {formatDate(selectedRetreat.start_date)} {selectedRetreat.end_date ? `— ${formatDate(selectedRetreat.end_date)}` : ""}
                  </p>
                )}

                {selectedRetreat.facilitator && (
                  <p className="text-sm">
                    <strong>Led by:</strong> {selectedRetreat.facilitator}
                  </p>
                )}

                {/* Highlights */}
                {selectedRetreat.highlights && parseHighlights(selectedRetreat.highlights).length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-primary" /> Highlights
                    </h4>
                    <ul className="space-y-2">
                      {parseHighlights(selectedRetreat.highlights).map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Includes */}
                {selectedRetreat.includes && parseHighlights(selectedRetreat.includes).length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">What's Included</h4>
                    <ul className="grid grid-cols-2 gap-2">
                      {parseHighlights(selectedRetreat.includes).map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Healing Modalities */}
                {selectedRetreat.healing_modalities && (
                  <div>
                    <h4 className="font-medium mb-2">Healing Modalities</h4>
                    <p className="text-sm text-muted-foreground">{selectedRetreat.healing_modalities}</p>
                  </div>
                )}

                {selectedRetreat.accommodation && (
                  <div>
                    <h4 className="font-medium mb-2">Accommodation</h4>
                    <p className="text-sm text-muted-foreground">{selectedRetreat.accommodation}</p>
                  </div>
                )}

                {selectedRetreat.deposit && (
                  <p className="text-sm text-muted-foreground">
                    <strong>Deposit to reserve:</strong> ${selectedRetreat.deposit}
                  </p>
                )}

                {selectedRetreat.registration_link && selectedRetreat.status !== "completed" && selectedRetreat.status !== "full" && (
                  <Button
                    className="w-full"
                    onClick={() => window.open(selectedRetreat.registration_link, "_blank")}
                    data-testid="register-btn"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Register Now
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Retreats;
