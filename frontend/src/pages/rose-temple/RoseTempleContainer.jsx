import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, Sparkles, Moon, Star, Eye, Flower2, BookOpen, X, Play, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import GuidedAudioButton from "../../components/GuidedAudioButton";
import AddToJournal from "../../components/AddToJournal";
import axios from "axios";
import { toast } from "sonner";
import { appLogger } from "../../utils/logger";

const apiClient = axios.create({ baseURL: `${process.env.REACT_APP_BACKEND_URL}/api` });

const templeIntro = {
  title: "Your Body is the Rose Temple",
  description: "The Rose Temple is not a place outside of you — it IS you. Your body is the sacred vessel, the living temple where the Divine Feminine dwells. Every curve, every breath, every sensation is holy ground. This is not about becoming worthy — you already ARE the temple. This work is about remembering.",
  principles: [
    { title: "Unconditional Self-Love", text: "Love yourself not because you earned it, but because you exist. Your body does not need to be fixed, improved, or disciplined into worthiness. It needs to be listened to, honored, and loved — exactly as it is, right now." },
    { title: "Pleasure as Prayer", text: "Pleasure is not sinful — it is how the Goddess speaks through the body. When you deny pleasure, you deny the sacred. When you shame your desires, you shame the Divine. Reclaim pleasure as your birthright and your spiritual practice." },
    { title: "Cyclical Wisdom", text: "The feminine does not move in straight lines. She spirals. She ebbs and flows. Honor your cycles — menstrual, lunar, seasonal. Rest is not laziness. Slowness is not failure. Trust your body's rhythms." },
    { title: "The Womb as Creation Center", text: "Whether you have a physical womb or not, the energetic womb space is your portal of creation. From here, all things are birthed — children, art, ideas, healing. Tend this space with reverence." }
  ]
};

const ROSE_FEMININE_IMAGES = [
  "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/3759657/pexels-photo-3759657.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/6015070/pexels-photo-6015070.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/7252509/pexels-photo-7252509.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/6931767/pexels-photo-6931767.jpeg?auto=compress&cs=tinysrgb&w=1200",
];

const teachings = [
  {
    id: "rose-lineage",
    title: "The Rose Lineage",
    subtitle: "Ancient Feminine Wisdom",
    icon: Flower2,
    image: "https://images.pexels.com/photos/827106/pexels-photo-827106.jpeg?auto=compress&cs=tinysrgb&w=800",
    color: { text: "text-rose-300", bg: "bg-rose-500/10", border: "border-rose-500/20", glow: "shadow-rose-500/20" },
    description: "The Rose Lineage carries the unbroken thread of feminine wisdom through time — from Isis of ancient Egypt, the High Priestesses of Avalon, Mary Magdalene and the Essene communities, to the Cathars, the troubadours, and beyond.",
    content: [
      {
        heading: "Origins of the Rose",
        body: "The rose has been sacred to the Goddess for over 5,000 years. In ancient Sumer she belonged to Inanna. In Egypt, the red rose was Isis's flower — Her tears as she searched for Osiris. In Rome, roses adorned Aphrodite's temples. The five-petaled rose mirrors the pentagram — the sacred geometry of Venus as she traces her path through the sky over eight years."
      },
      {
        heading: "Mary Magdalene & the Bridal Chamber",
        body: "The Gnostic Gospels reveal Mary Magdalene as the Apostle to the Apostles — the beloved who understood Christ's teachings most fully. The 'Bridal Chamber' was not a physical union but a sacred alchemical marriage of the inner masculine and feminine — the hieros gamos. She carried the Rose teachings to the south of France, where they lived on in the troubadour traditions and later, the Cathars."
      },
      {
        heading: "Sophia & Divine Feminine Wisdom",
        body: "Sophia is the Greek word for Wisdom — the divine feminine face of the sacred. In Gnostic cosmology she is the soul of the world, the breath of creation. Her tears became matter, her longing became love, her wisdom became the path back to source. To embody Sophia is to be love itself — not love as emotion, but love as the organizing principle of all existence."
      },
      {
        heading: "The Priestess Path",
        body: "For thousands of years, women trained in the temple arts — healing, prophecy, sacred dance, dream interpretation, herb lore, and the mysteries of birth, death, and rebirth. The Priestess was not separate from life — she was life itself made conscious. She stood at the threshold between worlds and tended the sacred flame so that all of humanity could find its way home."
      }
    ]
  },
  {
    id: "rose-meditations",
    title: "Rose Meditations",
    subtitle: "Heart Opening Practices",
    icon: Heart,
    image: "https://images.pexels.com/photos/6931767/pexels-photo-6931767.jpeg?auto=compress&cs=tinysrgb&w=800",
    color: { text: "text-pink-300", bg: "bg-pink-500/10", border: "border-pink-500/20", glow: "shadow-pink-500/20" },
    description: "These meditations work with the rose as a living portal to the heart. Each petal is a layer of the self — each fragrance a memory of home.",
    content: [
      {
        heading: "The Unfolding Rose",
        body: "Sit comfortably and close your eyes. Bring your awareness to the center of your chest — your heart space. Visualize a rosebud there, deep crimson or soft pink, depending on what calls you. With each inhale, see the bud beginning to open. With each exhale, feel the petals softening and releasing. Allow the rose to unfold in its own time. You cannot force a rose to bloom. When it is ready, breathe in its fragrance and let it fill every cell of your body. This is your true nature — soft, radiant, and whole."
      },
      {
        heading: "Meeting Your Inner Magdalene",
        body: "In your mind's eye, walk to the edge of a sea at golden hour. The water is calm and the sky holds the last colors of sunset. A woman walks toward you — robed, luminous, carrying a small alabaster jar. She is your Inner Magdalene. She knows every shadow you carry, every wound that shaped you, every gift that is waiting to be born. Sit with her. Ask her what she sees in you. Listen without judgment. Let her anoint you with the sacred oil she carries. You are already anointed. You have always been enough."
      },
      {
        heading: "The Rose Chamber",
        body: "Imagine descending a spiral staircase of living rose canes, blooming as you walk. At the bottom is a circular chamber, its walls woven entirely from roses of every color. In the center burns a soft flame — the eternal feminine fire. Sit beside it. This is the place within you that was never wounded, never diminished, never lost. This is your original wholeness. Stay here as long as you need. Return here whenever the world feels too harsh."
      }
    ]
  }
];

const RoseTempleContainer = ({ user, api }) => {
  const navigate = useNavigate();
  const [selectedTeaching, setSelectedTeaching] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [embodimentPractices, setEmbodimentPractices] = useState([]);
  const [loadingPractices, setLoadingPractices] = useState(true);
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [showIntro, setShowIntro] = useState(true);
  const [sacredRites, setSacredRites] = useState([]);
  const [selectedRite, setSelectedRite] = useState(null);

  useEffect(() => {
    const fetchPractices = async () => {
      try {
        const { data } = await apiClient.get("/feminine-embodiment");
        setEmbodimentPractices(data);
      } catch (error) {
        appLogger.error("Failed loading feminine embodiment practices:", error);
      } finally {
        setLoadingPractices(false);
      }
    };

    const fetchSacredRites = async () => {
      try {
        const { data } = await apiClient.get("/sacred-rites");
        setSacredRites(data);
      } catch (error) {
        appLogger.error("Failed loading sacred rites:", error);
      }
    };

    fetchPractices();
    fetchSacredRites();
  }, []);

  return (
    <div className="min-h-screen bg-background" data-testid="rose-temple">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-rose-500/10">
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
              <h1 className="text-2xl font-serif">Rose Temple</h1>
              <p className="text-sm text-rose-300/80">The Sacred Body Temple</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20">
            <Heart className="w-4 h-4 text-rose-300" />
            <span className="text-xs text-rose-300">Divine Feminine Wisdom</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        <section className="relative overflow-hidden rounded-3xl border border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-background p-8" data-testid="rose-temple-hero">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-4xl sm:text-5xl font-serif mb-4 leading-tight">{templeIntro.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{templeIntro.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {ROSE_FEMININE_IMAGES.slice(0, 4).map((imageUrl, index) => (
                <img key={imageUrl} src={imageUrl} alt={`Rose temple ${index + 1}`} className="rounded-2xl h-36 w-full object-cover border border-rose-500/20" />
              ))}
            </div>
          </div>
        </section>

        <section data-testid="rose-temple-principles-grid">
          <h3 className="text-2xl font-serif mb-4">Core Principles</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {templeIntro.principles.map((principle) => (
              <div key={principle.title} className="rounded-2xl border border-rose-500/20 bg-card/50 p-5">
                <h4 className="font-serif text-lg mb-2 text-rose-300">{principle.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{principle.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section data-testid="rose-temple-teachings-grid">
          <h3 className="text-2xl font-serif mb-4">Temple Teachings</h3>
          <div className="grid md:grid-cols-2 gap-5">
            {teachings.map((teaching) => {
              const Icon = teaching.icon;
              return (
                <motion.button
                  key={teaching.id}
                  type="button"
                  whileHover={{ y: -2 }}
                  onClick={() => setSelectedTeaching(teaching)}
                  className="text-left rounded-2xl border border-white/10 bg-card/60 overflow-hidden"
                  data-testid={`rose-teaching-${teaching.id}`}
                >
                  {teaching.image && <img src={teaching.image} alt={teaching.title} className="w-full h-40 object-cover" />}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-5 h-5 text-rose-300" />
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">{teaching.subtitle}</p>
                    </div>
                    <h4 className="font-serif text-xl mb-2">{teaching.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-3">{teaching.description}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

        <section data-testid="rose-temple-embodiment-grid">
          <h3 className="text-2xl font-serif mb-4">Embodiment Practices</h3>
          {loadingPractices ? (
            <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-rose-300" /></div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {embodimentPractices.map((practice) => (
                <button
                  key={practice.id}
                  onClick={() => setSelectedPractice(practice)}
                  className="p-4 rounded-xl border border-white/10 bg-card/50 text-left hover:border-rose-500/30 transition-colors"
                  data-testid={`rose-practice-${practice.id}`}
                >
                  <h4 className="font-serif text-lg mb-1">{practice.name}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">{practice.description}</p>
                </button>
              ))}
            </div>
          )}
        </section>

        <section data-testid="rose-temple-rites-grid">
          <h3 className="text-2xl font-serif mb-4">Sacred Rites</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {sacredRites.map((rite) => (
              <button
                key={rite.id}
                onClick={() => setSelectedRite(rite)}
                className="p-4 rounded-xl border border-white/10 bg-card/50 text-left hover:border-rose-500/30 transition-colors"
                data-testid={`rose-rite-${rite.id}`}
              >
                <h4 className="font-serif text-lg mb-1">{rite.title || rite.name}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">{rite.description}</p>
              </button>
            ))}
          </div>
        </section>
      </main>

      <AnimatePresence>
        {selectedTeaching && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center" data-testid="rose-teaching-modal">
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-white/10 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-serif">{selectedTeaching.title}</h3>
                  <p className="text-sm text-muted-foreground">{selectedTeaching.subtitle}</p>
                </div>
                <button onClick={() => setSelectedTeaching(null)} data-testid="rose-teaching-modal-close"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                {selectedTeaching.content?.map((item) => (
                  <div key={item.heading} className="rounded-xl border border-white/10 p-4 bg-background/50">
                    <h4 className="font-serif text-lg mb-2">{item.heading}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPractice && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center" data-testid="rose-practice-modal">
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="w-full max-w-2xl rounded-2xl bg-card border border-white/10 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-serif">{selectedPractice.name}</h3>
                <button onClick={() => setSelectedPractice(null)} data-testid="rose-practice-modal-close"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{selectedPractice.description}</p>
              <GuidedAudioButton text={selectedPractice.description || selectedPractice.content || "Rose Temple embodiment practice"} label={`Play ${selectedPractice.name} narration`} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedRite && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center" data-testid="rose-rite-modal">
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="w-full max-w-2xl rounded-2xl bg-card border border-white/10 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-serif">{selectedRite.title || selectedRite.name}</h3>
                <button onClick={() => setSelectedRite(null)} data-testid="rose-rite-modal-close"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{selectedRite.description}</p>
              <AddToJournal practiceType="rose_temple_rite" practiceName={selectedRite.title || selectedRite.name} defaultReflection={selectedRite.description || ""} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoseTempleContainer;
