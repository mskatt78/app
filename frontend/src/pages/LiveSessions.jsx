import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Radio, Calendar, Clock, Users, ExternalLink, 
  Play, Video, MessageCircle, Sparkles
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

const LiveSessions = ({ user, api }) => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await api.get("/live-sessions");
      setSessions(response.data || []);
    } catch (error) {
      console.error("Failed to fetch live sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "live": return "bg-red-500 animate-pulse";
      case "scheduled": return "bg-primary";
      case "completed": return "bg-muted-foreground";
      case "cancelled": return "bg-destructive/50";
      default: return "bg-muted";
    }
  };

  const getSessionIcon = (type) => {
    switch (type) {
      case "youtube_live": return Video;
      case "zoom": return Users;
      case "group_meditation": return Sparkles;
      case "q_and_a": return MessageCircle;
      default: return Radio;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { 
      weekday: "long", 
      month: "long", 
      day: "numeric",
      year: "numeric"
    });
  };

  const filteredSessions = sessions.filter(session => {
    if (filter === "all") return true;
    return session.status === filter;
  });

  const liveSessions = sessions.filter(s => s.status === "live");
  const upcomingSessions = sessions.filter(s => s.status === "scheduled");

  return (
    <div className="min-h-screen bg-background" data-testid="live-sessions-page">
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
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Connect</p>
              <h1 className="text-xl font-serif">Live <span className="italic text-primary">Sessions</span></h1>
            </div>
          </div>
          
          {liveSessions.length > 0 && (
            <Badge className="bg-red-500 text-white animate-pulse">
              <Radio className="w-3 h-3 mr-1" /> LIVE NOW
            </Badge>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Live Now Section */}
        {liveSessions.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-serif flex items-center gap-2">
              <Radio className="w-6 h-6 text-red-500 animate-pulse" />
              Happening Now
            </h2>
            <div className="grid gap-4">
              {liveSessions.map((session) => {
                const SessionIcon = getSessionIcon(session.session_type);
                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative"
                  >
                    <Card className="bg-gradient-to-r from-red-500/20 to-primary/20 border-red-500/30 overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse" />
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <SessionIcon className="w-5 h-5 text-red-400" />
                              <Badge variant="secondary" className="capitalize">
                                {session.session_type?.replace("_", " ")}
                              </Badge>
                            </div>
                            <h3 className="text-2xl font-serif">{session.title}</h3>
                            <p className="text-muted-foreground">{session.description}</p>
                          </div>
                          {session.stream_url && (
                            <Button
                              onClick={() => window.open(session.stream_url, "_blank")}
                              className="bg-red-500 hover:bg-red-600"
                              data-testid="join-live-btn"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Join Live
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["all", "scheduled", "completed"].map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              onClick={() => setFilter(status)}
              className="capitalize whitespace-nowrap"
              data-testid={`filter-${status}`}
            >
              {status === "all" ? "All Sessions" : status}
            </Button>
          ))}
        </div>

        {/* Sessions Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-16">
            <Radio className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No sessions found</p>
            <p className="text-sm text-muted-foreground/70 mt-2">
              Check back soon for upcoming live events!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.map((session, index) => {
              const SessionIcon = getSessionIcon(session.session_type);
              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-card/50 border-white/10 hover:border-primary/30 transition-all h-full flex flex-col">
                    {session.image_url && (
                      <div className="aspect-video relative overflow-hidden rounded-t-lg">
                        <img 
                          src={session.image_url} 
                          alt={session.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className={`${getStatusColor(session.status)} text-white`}>
                            {session.status === "live" && <Radio className="w-3 h-3 mr-1" />}
                            {session.status}
                          </Badge>
                        </div>
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <SessionIcon className="w-4 h-4" />
                        <span className="capitalize">{session.session_type?.replace("_", " ")}</span>
                      </div>
                      <CardTitle className="text-lg font-serif">{session.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {session.description}
                      </p>
                      
                      <div className="mt-auto space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {formatDate(session.scheduled_date)}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {session.scheduled_time} • {session.duration_minutes} min
                        </div>
                        {session.price > 0 && (
                          <div className="text-primary font-medium">
                            ${session.price}
                          </div>
                        )}
                      </div>

                      {session.stream_url && session.status !== "completed" && (
                        <Button
                          variant="outline"
                          className="w-full mt-4"
                          onClick={() => window.open(session.stream_url, "_blank")}
                          data-testid={`join-${session.id}`}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          {session.status === "live" ? "Join Now" : "Get Link"}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Upcoming Sessions Summary */}
        {upcomingSessions.length > 0 && filter === "all" && (
          <section className="mt-12 p-6 rounded-2xl bg-card/30 border border-white/10">
            <h3 className="text-lg font-serif mb-4">
              <Calendar className="w-5 h-5 inline mr-2 text-primary" />
              {upcomingSessions.length} Upcoming {upcomingSessions.length === 1 ? "Session" : "Sessions"}
            </h3>
            <div className="space-y-3">
              {upcomingSessions.slice(0, 3).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div>
                    <p className="font-medium">{session.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(session.scheduled_date)} at {session.scheduled_time}
                    </p>
                  </div>
                  <Badge variant="secondary">{session.session_type?.replace("_", " ")}</Badge>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default LiveSessions;
