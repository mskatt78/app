import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, Eye, Gem, Headphones, Moon, Radio, Sparkles, Star, Wind } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { appLogger } from "../utils/logger";

const demoCards = [
  {
    id: "live",
    title: "Live client space",
    description: "Preview how live yoga, workshops, and Q&A rooms feel with RSVP, embedded video, and interaction built in.",
    icon: Radio,
    route: "/live",
    accent: "from-emerald-500/20 to-cyan-500/10",
  },
  {
    id: "courses",
    title: "Sacred courses",
    description: "Show the premium learning path, rituals, and long-form transformational journeys.",
    icon: Star,
    route: "/courses",
    accent: "from-amber-500/20 to-orange-500/10",
  },
  {
    id: "crystals",
    title: "Deep crystal wisdom",
    description: "Open rich healing teachings, ancient traditions, and guided practice experiences.",
    icon: Gem,
    route: "/crystals",
    accent: "from-fuchsia-500/20 to-violet-500/10",
  },
  {
    id: "light-codes",
    title: "Light Codes temple",
    description: "Walk people through DNA Helix, sacred geometry, and symbolic healing with deeper content.",
    icon: Sparkles,
    route: "/light-codes",
    accent: "from-cyan-500/20 to-indigo-500/10",
  },
];

export default function DemoExperience({ api }) {
  const navigate = useNavigate();
  const [coursesCount, setCoursesCount] = useState(0);
  const [liveCount, setLiveCount] = useState(0);
  const [videoCount, setVideoCount] = useState(0);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [coursesResponse, liveResponse, videosResponse] = await Promise.all([
          api.get("/courses"),
          api.get("/live-sessions"),
          api.get("/videos"),
        ]);
        setCoursesCount((coursesResponse.data || []).length);
        setLiveCount((liveResponse.data || []).length);
        setVideoCount((videosResponse.data || []).length);
      } catch (error) {
        appLogger.error("Failed to load demo counts", error);
      }
    };

    loadCounts();
  }, [api]);

  const demoStats = useMemo(() => ([
    { label: "Live rooms", value: liveCount || "∞", icon: Radio },
    { label: "Courses", value: coursesCount || "∞", icon: Star },
    { label: "Video tutorials", value: videoCount || "∞", icon: Headphones },
    { label: "Sacred pathways", value: "27+", icon: Moon },
  ]), [coursesCount, liveCount, videoCount]);

  return (
    <div className="min-h-screen bg-background" data-testid="demo-experience-page">
      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.14),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(34,197,94,0.14),_transparent_35%),linear-gradient(180deg,rgba(5,8,14,0.98),rgba(7,10,16,0.95))]">
        <div className="absolute inset-0 opacity-25 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:42px_42px]" />
        <div className="relative max-w-6xl mx-auto px-6 py-20 sm:py-24">
          <Badge className="mb-6 bg-primary/15 text-primary border border-primary/20" data-testid="demo-experience-badge">Polished demo experience</Badge>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.32em] text-white/40">A guided preview for clients, collaborators, and app reviewers</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif leading-[1.04] max-w-4xl">
                Show the whole temple through a <span className="italic text-primary">beautiful demo journey</span>.
              </h1>
              <p className="text-sm sm:text-base text-white/70 max-w-2xl leading-relaxed" data-testid="demo-experience-description">
                This demo path highlights the strongest parts of the app — sacred courses, deep practices, Light Codes, live client spaces, and mobile-friendly install polish — without asking people to create an account first.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => navigate("/menu")} data-testid="demo-open-temple-btn">
                  Enter full app <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="outline" onClick={() => navigate("/live")} data-testid="demo-open-live-btn">
                  Preview live rooms
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {demoStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5" data-testid={`demo-stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-3xl font-serif mb-1">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        <section className="grid gap-5 md:grid-cols-2" data-testid="demo-feature-grid">
          {demoCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.button
                type="button"
                key={card.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(card.route)}
                className={`group rounded-[2rem] overflow-hidden border border-white/10 bg-gradient-to-br ${card.accent} text-left p-6 hover:-translate-y-1 transition-all duration-300`}
                data-testid={`demo-feature-${card.id}`}
              >
                <div className="w-14 h-14 rounded-2xl bg-black/25 border border-white/10 flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-serif mb-3">{card.title}</h2>
                <p className="text-sm text-white/75 leading-relaxed mb-6">{card.description}</p>
                <div className="inline-flex items-center text-sm text-primary">
                  Explore this part of the demo <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </motion.button>
            );
          })}
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-card/60 p-8" data-testid="demo-reviewer-strip">
          <div className="grid gap-6 lg:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/40 mb-3">Best to show first</p>
              <h3 className="text-2xl font-serif mb-3">A clean path for anyone seeing the app for the first time.</h3>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <Eye className="w-5 h-5 text-primary mb-3" />
              <p className="text-sm text-white/75 leading-relaxed">Open Light Codes or Crystals to show the depth and immersive teaching style immediately.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <CalendarDays className="w-5 h-5 text-primary mb-3" />
              <p className="text-sm text-white/75 leading-relaxed">Open Live Client Spaces to show how the platform supports real client interaction, events, and sacred gatherings.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}