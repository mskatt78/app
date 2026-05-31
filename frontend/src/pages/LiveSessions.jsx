import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, Radio, Sparkles, Users, Video } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { appLogger } from "../utils/logger";

const filters = ["all", "live", "scheduled", "completed"];

const formatSchedule = (scheduledAt) => {
  if (!scheduledAt) return "Scheduling soon";
  const date = new Date(scheduledAt);
  if (Number.isNaN(date.getTime())) return scheduledAt;
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const statusStyles = {
  live: "bg-red-500 text-white",
  scheduled: "bg-emerald-500/20 text-emerald-200 border border-emerald-400/20",
  completed: "bg-white/10 text-white/70 border border-white/10",
};

export default function LiveSessions({ api }) {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await api.get("/live-sessions");
        setSessions(response.data || []);
      } catch (error) {
        appLogger.error("Failed to fetch live sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [api]);

  const filteredSessions = useMemo(() => {
    if (filter === "all") return sessions;
    return sessions.filter((session) => session.status === filter);
  }, [filter, sessions]);

  const liveCount = sessions.filter((session) => session.status === "live").length;

  return (
    <div className="min-h-screen bg-background" data-testid="live-sessions-page">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
              data-testid="live-sessions-back-btn"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Full client interaction</p>
              <h1 className="text-xl font-serif" data-testid="live-sessions-heading">Live <span className="italic text-primary">Yoga • Workshops • Q&A</span></h1>
            </div>
          </div>

          {liveCount > 0 && (
            <Badge className="bg-red-500 text-white animate-pulse" data-testid="live-sessions-live-badge">
              <Radio className="w-3 h-3 mr-1" /> {liveCount} live now
            </Badge>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <section className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.16),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.14),_transparent_30%),linear-gradient(135deg,rgba(10,14,22,0.94),rgba(4,7,12,0.92))] p-8" data-testid="live-sessions-hero">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Teach, hold space, and meet clients live</p>
              <h2 className="text-4xl sm:text-5xl font-serif leading-[1.05] max-w-3xl">Run live yoga, workshops, Q&A circles, and sacred client rooms <span className="italic text-primary">inside the temple</span>.</h2>
              <p className="text-sm sm:text-base text-white/70 max-w-2xl leading-relaxed" data-testid="live-sessions-hero-description">
                Each session can include an embedded livestream, RSVP list, what-to-bring notes, and a shared interaction space for client chat and questions.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4" data-testid="live-sessions-stat-total">
                <p className="text-xs uppercase tracking-[0.22em] text-white/40 mb-2">Spaces</p>
                <p className="text-2xl font-serif">{sessions.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4" data-testid="live-sessions-stat-live">
                <p className="text-xs uppercase tracking-[0.22em] text-white/40 mb-2">Live now</p>
                <p className="text-2xl font-serif">{liveCount}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4" data-testid="live-sessions-stat-client-tools">
                <p className="text-xs uppercase tracking-[0.22em] text-white/40 mb-2">Interaction</p>
                <p className="text-sm text-white/75">Embedded video, RSVP, chat, and Q&A</p>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap gap-2" data-testid="live-sessions-filters">
          {filters.map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              onClick={() => setFilter(status)}
              className="capitalize"
              data-testid={`live-sessions-filter-${status}`}
            >
              {status === "all" ? "All rooms" : status}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, idx) => `live-session-loading-${idx}`).map((placeholderKey) => (
              <div key={placeholderKey} className="h-80 rounded-[1.75rem] bg-card/40 animate-pulse" />
            ))}
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-white/10 bg-card/40 p-12 text-center" data-testid="live-sessions-empty">
            <Video className="w-14 h-14 mx-auto mb-4 text-white/25" />
            <h3 className="text-2xl font-serif mb-2">No live spaces here yet</h3>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">Once you add live yoga, workshops, or Q&A rooms from your admin dashboard, they’ll appear here for clients to join.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" data-testid="live-sessions-grid">
            {filteredSessions.map((session, index) => (
              <motion.article
                key={session.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="rounded-[1.75rem] overflow-hidden border border-white/10 bg-card/70 flex flex-col"
                data-testid={`live-session-card-${session.id}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-white/5">
                  {session.image_url ? (
                    <img src={session.image_url} alt={session.title} className="w-full h-full object-cover" data-testid={`live-session-image-${session.id}`} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[radial-gradient(circle_at_center,_rgba(34,197,94,0.18),_transparent_42%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_34%),rgba(255,255,255,0.03)]">
                      <Sparkles className="w-12 h-12 text-primary/60" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <Badge className={statusStyles[session.status] || statusStyles.completed} data-testid={`live-session-status-${session.id}`}>
                      {session.status}
                    </Badge>
                    <Badge variant="secondary" className="capitalize border border-white/10 bg-black/40 text-white/75" data-testid={`live-session-type-${session.id}`}>
                      {String(session.session_type || "session").replaceAll("_", " ")}
                    </Badge>
                  </div>
                </div>

                <div className="p-5 flex flex-col gap-4 flex-1">
                  <div>
                    <h3 className="text-2xl font-serif mb-2" data-testid={`live-session-title-${session.id}`}>{session.title}</h3>
                    <p className="text-sm text-white/70 leading-relaxed line-clamp-3" data-testid={`live-session-description-${session.id}`}>{session.description}</p>
                  </div>

                  <div className="grid gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatSchedule(session.scheduled_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{session.duration_minutes || 60} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{session.attendee_count || 0} RSVPs • {session.question_count || 0} questions</span>
                    </div>
                  </div>

                  <Button onClick={() => navigate(`/live/${session.id}`)} className="mt-auto" data-testid={`live-session-open-${session.id}`}>
                    Open client space
                  </Button>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}