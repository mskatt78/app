import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Sparkles, Moon, Waves, Flame, TreeDeciduous, Heart, Star, Music,
  BookOpen, Compass, Eye, Sun, Mountain, Gem, Feather, Calculator,
  Users, MapPin, Film, ArrowRight
} from "lucide-react";

const LINK_SECTIONS = [
  {
    title: "Discover Your Path",
    links: [
      { name: "Star Lineage Quiz", desc: "Which star system is your soul from?", path: "/star-lineage", icon: Star, accent: "from-violet-500/20 to-indigo-500/20 border-violet-500/30" },
      { name: "Birth Chart", desc: "Your astrological blueprint", path: "/birth-chart", icon: Sun, accent: "from-amber-500/20 to-yellow-500/20 border-amber-500/30" },
      { name: "Numerology", desc: "Your life path number", path: "/numerology", icon: Calculator, accent: "from-sky-500/20 to-cyan-500/20 border-sky-500/30" },
      { name: "Gene Keys", desc: "Unlock your genetic genius", path: "/gene-keys", icon: Sparkles, accent: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30" },
      { name: "Human Design", desc: "Your energetic blueprint", path: "/human-design", icon: Compass, accent: "from-rose-500/20 to-pink-500/20 border-rose-500/30" },
    ]
  },
  {
    title: "Divination & Guidance",
    links: [
      { name: "Oracle Readings", desc: "Receive cosmic guidance", path: "/oracle", icon: Eye, accent: "from-purple-500/20 to-violet-500/20 border-purple-500/30" },
      { name: "Tarot Reading", desc: "22 Major Arcana with AI images", path: "/tarot", icon: Moon, accent: "from-indigo-500/20 to-blue-500/20 border-indigo-500/30" },
      { name: "Rune Readings", desc: "Elder Futhark wisdom", path: "/rune-readings", icon: Feather, accent: "from-amber-500/20 to-orange-500/20 border-amber-500/30" },
      { name: "I Ching", desc: "64 hexagrams of change", path: "/i-ching", icon: BookOpen, accent: "from-teal-500/20 to-emerald-500/20 border-teal-500/30" },
      { name: "Light Codes", desc: "Sacred geometry & galactic activations", path: "/light-codes", icon: Sparkles, accent: "from-cyan-500/20 to-sky-500/20 border-cyan-500/30" },
    ]
  },
  {
    title: "Movement & Healing",
    links: [
      { name: "Somatic Movement", desc: "Elemental body healing", path: "/somatic", icon: Waves, accent: "from-blue-500/20 to-cyan-500/20 border-blue-500/30" },
      { name: "Yoga Library", desc: "78 poses by element", path: "/yoga", icon: TreeDeciduous, accent: "from-emerald-500/20 to-green-500/20 border-emerald-500/30" },
      { name: "Breathwork", desc: "Guided breathing sessions", path: "/breathwork", icon: Flame, accent: "from-orange-500/20 to-red-500/20 border-orange-500/30" },
      { name: "Meditations", desc: "Guided meditations with audio", path: "/meditations", icon: Moon, accent: "from-violet-500/20 to-purple-500/20 border-violet-500/30" },
      { name: "Shamanic Practices", desc: "21 sacred practices", path: "/shamanic", icon: Feather, accent: "from-amber-500/20 to-yellow-500/20 border-amber-500/30" },
    ]
  },
  {
    title: "Sacred Spaces",
    links: [
      { name: "Elemental Temples", desc: "Earth, Water, Fire, Air, Spirit", path: "/elemental-temples", icon: Mountain, accent: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30" },
      { name: "Rose Temple", desc: "Sacred feminine practice", path: "/rose-temple", icon: Heart, accent: "from-rose-500/20 to-pink-500/20 border-rose-500/30" },
      { name: "Water Practices", desc: "Ceremonies & rituals", path: "/water-practices", icon: Waves, accent: "from-blue-500/20 to-indigo-500/20 border-blue-500/30" },
      { name: "Sound Frequencies", desc: "Healing tones & vibrations", path: "/sound-frequencies", icon: Music, accent: "from-cyan-500/20 to-sky-500/20 border-cyan-500/30" },
      { name: "Crystal Guide", desc: "Healing crystals & properties", path: "/crystals", icon: Gem, accent: "from-violet-500/20 to-pink-500/20 border-violet-500/30" },
    ]
  },
  {
    title: "Sacred Journeys",
    links: [
      { name: "Retreats & Healing Work", desc: "Elemental & womb healing retreats", path: "/retreats", icon: MapPin, accent: "from-rose-500/20 to-amber-500/20 border-rose-500/30" },
      { name: "Ancient Wisdom", desc: "108 teachings from sacred traditions", path: "/ancient-wisdom", icon: BookOpen, accent: "from-amber-500/20 to-yellow-500/20 border-amber-500/30" },
      { name: "Sacred Allies", desc: "Spirit guides, totems & guardians", path: "/sacred-ally-alchemy", icon: Users, accent: "from-teal-500/20 to-emerald-500/20 border-teal-500/30" },
    ]
  },
];

export default function LinksPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background" data-testid="links-page">
      {/* Header */}
      <div className="text-center pt-12 pb-8 px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-primary/20 to-violet-500/20 border border-primary/30 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif mb-2">Shamanic Elements</h1>
          <p className="text-lg font-serif italic text-primary/80">Soul Temple 2.0</p>
          <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">
            Sacred yoga, breathwork, oracle readings, shamanic practices,
            elemental healing & ancient wisdom for your spiritual journey.
          </p>
        </motion.div>
      </div>

      {/* Links */}
      <div className="max-w-xl mx-auto px-6 pb-16 space-y-8">
        {LINK_SECTIONS.map((section, si) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.08 }}
          >
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3 pl-1">{section.title}</h2>
            <div className="space-y-2">
              {section.links.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  data-testid={`link-${link.path.replace(/\//g, "-").slice(1)}`}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${link.accent} border backdrop-blur-sm text-left transition-all hover:scale-[1.01] active:scale-[0.99]`}
                >
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <link.icon className="w-5 h-5 text-foreground/80" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{link.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{link.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </button>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Footer */}
        <div className="text-center pt-6 border-t border-white/10">
          <p className="text-xs text-muted-foreground">
            Shamanic Elements Soul Temple 2.0
          </p>
        </div>
      </div>
    </div>
  );
}
