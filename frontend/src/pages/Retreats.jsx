import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, MapPin, Calendar, Users, DollarSign, 
  Check, ExternalLink, Star
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";

const Retreats = ({ user, api }) => {
  const navigate = useNavigate();
  const [retreats, setRetreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRetreat, setSelectedRetreat] = useState(null);
  const [filter, setFilter] = useState("all");

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

  const getStatusBadge = (status) => {
    const styles = {
      upcoming: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      open: "bg-green-500/20 text-green-400 border-green-500/30",
      full: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      completed: "bg-muted text-muted-foreground border-muted"
    };
    return styles[status] || styles.upcoming;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      year: "numeric"
    });
  };

  const filteredRetreats = retreats.filter(r => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  return (
    <div className="min-h-screen bg-background" data-testid="retreats-page">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
              data-testid="back-btn"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Sacred Journeys</p>
              <h1 className="text-xl font-serif">Retreats & <span className="italic text-primary">Experiences</span></h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Intro */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <p className="text-muted-foreground">
            Immerse yourself in transformative retreat experiences. Journey deep into shamanic practices 
            in sacred spaces with like-minded seekers.
          </p>
        </div>

        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["all", "open", "upcoming", "full"].map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              onClick={() => setFilter(status)}
              className="capitalize whitespace-nowrap"
              data-testid={`filter-${status}`}
            >
              {status === "all" ? "All Retreats" : status}
            </Button>
          ))}
        </div>

        {/* Retreats Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filteredRetreats.length === 0 ? (
          <div className="text-center py-16">
            <MapPin className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No retreats available at this time</p>
            <p className="text-sm text-muted-foreground/70 mt-2">
              New retreat experiences coming soon!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredRetreats.map((retreat, index) => (
              <motion.div
                key={retreat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="bg-card/50 border-white/10 hover:border-primary/30 transition-all cursor-pointer overflow-hidden"
                  onClick={() => setSelectedRetreat(retreat)}
                  data-testid={`retreat-${retreat.id}`}
                >
                  {retreat.image_url && (
                    <div className="aspect-[16/9] relative overflow-hidden">
                      <img 
                        src={retreat.image_url} 
                        alt={retreat.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <Badge className={getStatusBadge(retreat.status)}>
                          {retreat.status === "open" ? "Open for Registration" : retreat.status}
                        </Badge>
                      </div>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl font-serif">{retreat.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {retreat.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4 text-primary" />
                        {retreat.location}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4 text-primary" />
                        {retreat.duration_days} days
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4 text-primary" />
                        Max {retreat.max_participants}
                      </div>
                      <div className="flex items-center gap-2 font-medium text-primary">
                        <DollarSign className="w-4 h-4" />
                        ${retreat.price}
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {formatDate(retreat.start_date)} - {formatDate(retreat.end_date)}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Retreat Detail Modal */}
      <Dialog open={!!selectedRetreat} onOpenChange={() => setSelectedRetreat(null)}>
        <DialogContent className="bg-card border-white/10 max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedRetreat && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className={getStatusBadge(selectedRetreat.status)} variant="outline">
                      {selectedRetreat.status}
                    </Badge>
                    <DialogTitle className="text-2xl font-serif mt-2">
                      {selectedRetreat.title}
                    </DialogTitle>
                  </div>
                </div>
              </DialogHeader>

              {selectedRetreat.image_url && (
                <img 
                  src={selectedRetreat.image_url} 
                  alt={selectedRetreat.title}
                  className="w-full aspect-video object-cover rounded-lg"
                />
              )}

              <div className="space-y-6">
                <p className="text-muted-foreground">{selectedRetreat.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-white/5 text-center">
                    <MapPin className="w-5 h-5 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{selectedRetreat.location}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 text-center">
                    <Calendar className="w-5 h-5 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{selectedRetreat.duration_days} days</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 text-center">
                    <Users className="w-5 h-5 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">Group Size</p>
                    <p className="font-medium">Max {selectedRetreat.max_participants}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 text-center">
                    <DollarSign className="w-5 h-5 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">Investment</p>
                    <p className="font-medium">${selectedRetreat.price}</p>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Dates:</strong> {formatDate(selectedRetreat.start_date)} - {formatDate(selectedRetreat.end_date)}
                </div>

                {selectedRetreat.facilitator && (
                  <div className="text-sm">
                    <strong>Led by:</strong> {selectedRetreat.facilitator}
                  </div>
                )}

                {selectedRetreat.highlights?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-primary" /> Highlights
                    </h4>
                    <ul className="space-y-2">
                      {selectedRetreat.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedRetreat.includes?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">What's Included</h4>
                    <ul className="grid grid-cols-2 gap-2">
                      {selectedRetreat.includes.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedRetreat.accommodation && (
                  <div>
                    <h4 className="font-medium mb-2">Accommodation</h4>
                    <p className="text-sm text-muted-foreground">{selectedRetreat.accommodation}</p>
                  </div>
                )}

                {selectedRetreat.deposit > 0 && (
                  <p className="text-sm text-muted-foreground">
                    <strong>Deposit to reserve:</strong> ${selectedRetreat.deposit}
                  </p>
                )}

                {selectedRetreat.registration_link && selectedRetreat.status !== "completed" && selectedRetreat.status !== "full" && (
                  <Button 
                    className="w-full bg-primary"
                    onClick={() => window.open(selectedRetreat.registration_link, "_blank")}
                    data-testid="register-btn"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Register Now
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Retreats;
