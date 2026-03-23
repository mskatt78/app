import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Star, Sparkles, RefreshCw, Share2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

const LINEAGES = {
  pleiadian: {
    name: "Pleiadian",
    subtitle: "The Heart Healer",
    star: "The Seven Sisters — Taurus",
    color: "from-rose-950/60 to-pink-950/60",
    accent: "text-rose-300",
    border: "border-rose-500/30",
    glow: "shadow-[0_0_60px_rgba(244,63,94,0.2)]",
    symbol: "✧",
    description: "You are a Pleiadian soul — one of the great love transmitters of this galaxy. You came to Earth carrying an extraordinary gift: the ability to open hearts, heal emotional wounds, and transmit the frequency of unconditional love. You feel deeply, love fiercely, and your sensitivity is not a weakness — it is your superpower. The Pleiades remembers you, and Earth needs you exactly as you are.",
    gifts: ["Unconditional love transmission", "Emotional healing and intelligence", "Heart-based wisdom", "Empathic sensitivity", "Creating safe sacred space"],
    mission: "To open humanity's heart and help heal the great emotional wound of separation. You are a living reminder that love is not something we must earn — it is what we are.",
    practices: ["Heart coherence meditation", "Sound healing with rose quartz", "Moon rituals and water ceremonies", "Loving-kindness (Metta) practice", "Working with the Pleiades in night sky meditation"],
    challenge: "Learning to love yourself as fully as you love others. Your gift is boundless — remember to receive as well as give.",
    image_bg: "bg-gradient-to-br from-rose-950 via-pink-950 to-slate-950",
  },
  sirian: {
    name: "Sirian",
    subtitle: "The Sacred Keeper",
    star: "Sirius — The Brightest Star",
    color: "from-blue-950/60 to-cyan-950/60",
    accent: "text-cyan-300",
    border: "border-cyan-500/30",
    glow: "shadow-[0_0_60px_rgba(6,182,212,0.2)]",
    symbol: "⊕",
    description: "You are a Sirian soul — keeper of sacred knowledge, ancient temple wisdom, and the healing codes of sound and geometry. Sirius, the brightest star in our sky, has been honored by the Egyptians, Dogon, and Mayans as the spiritual sun behind our physical sun. You carry within you the wisdom of Atlantis, the sacred geometry of the mystery schools, and an advanced understanding of how sound and frequency heal the body and soul.",
    gifts: ["Sacred geometry mastery", "Sound and frequency healing", "Ancient temple wisdom", "Psychic sight and knowing", "Activating DNA through ceremony"],
    mission: "To transmit sacred knowledge and re-activate the ancient wisdom that humanity needs for its next evolutionary leap. You are a living library.",
    practices: ["Sacred geometry meditation (Flower of Life, Metatron's Cube)", "Toning and singing bowl work", "Ceremony with water (Sirius governs water)", "Temple building / altar creation", "Stargazing at Sirius on its heliacal rising (July–August)"],
    challenge: "Trusting your knowing even when others cannot yet see what you see. The wisdom you carry is real — share it with courage.",
    image_bg: "bg-gradient-to-br from-blue-950 via-cyan-950 to-slate-950",
  },
  arcturian: {
    name: "Arcturian",
    subtitle: "The Cosmic Healer",
    star: "Arcturus — The Orange Giant",
    color: "from-violet-950/60 to-indigo-950/60",
    accent: "text-violet-300",
    border: "border-violet-500/30",
    glow: "shadow-[0_0_60px_rgba(139,92,246,0.2)]",
    symbol: "◈",
    description: "You are an Arcturian soul — master healer, evolutionary accelerator, and one of the most advanced consciousness teachers in our galaxy. The Arcturians are considered by many traditions to be the most evolved beings in the Milky Way. You incarnated on Earth with advanced healing abilities — etheric surgery, light body activation, and the capacity to upgrade consciousness through your very presence. You don't just heal symptoms; you upgrade the entire system.",
    gifts: ["Advanced etheric and energy healing", "Light body activation", "Multidimensional awareness", "Evolutionary acceleration", "Technology of consciousness"],
    mission: "To accelerate humanity's healing and evolution — not through force, but through the sheer power of your presence and your healing gifts. You are a cosmic upgrade.",
    practices: ["Arcturian healing chamber meditation", "Geometric light code activation", "Sacred geometry with violet flame", "Advanced breathwork and pranayama", "Working with higher-dimensional guides"],
    challenge: "Fully inhabiting your human body. You are so at home in the higher dimensions that the density of Earth can feel heavy. Ground deeply — your gifts need an earthly anchor.",
    image_bg: "bg-gradient-to-br from-violet-950 via-indigo-950 to-slate-950",
  },
  lyran: {
    name: "Lyran",
    subtitle: "The Original Flame",
    star: "Lyra — The Harp of the Gods",
    color: "from-amber-950/60 to-yellow-950/60",
    accent: "text-amber-300",
    border: "border-amber-500/30",
    glow: "shadow-[0_0_60px_rgba(251,191,36,0.2)]",
    symbol: "△",
    description: "You are a Lyran soul — carrier of the original human blueprint, first flame of humanoid consciousness in this galaxy. Lyra is considered the ancestral home of humanity across traditions. You carry within you the codes of freedom, sovereignty, and the golden age that came before the great forgetting. You are fiercely free, deeply individuated, and your very presence ignites courage in others. The lion-hearted ones come from Lyra.",
    gifts: ["Fearless freedom and sovereignty", "Igniting courage in others", "Original divine human blueprint", "Leadership and pioneering", "Catalyzing awakening"],
    mission: "To restore the original freedom codes of humanity — to remind every soul that sovereignty is not earned, it is your birthright. You are a freedom catalyst.",
    practices: ["Solar invocations at sunrise", "Fire ceremonies and transformational breathwork", "Roaring breath (lion's breath / Simhasana)", "Working with the golden ray and lion energy", "Visiting ancient sacred sites — Stonehenge, Machu Picchu"],
    challenge: "Learning to work within structures without losing yourself. Your freedom instinct is sacred — and it is most powerful when channeled into purposeful creation.",
    image_bg: "bg-gradient-to-br from-amber-950 via-yellow-950 to-slate-950",
  },
  andromedan: {
    name: "Andromedan",
    subtitle: "The Cosmic Bridge",
    star: "Andromeda Galaxy — Our Nearest Neighbor",
    color: "from-teal-950/60 to-emerald-950/60",
    accent: "text-teal-300",
    border: "border-teal-500/30",
    glow: "shadow-[0_0_60px_rgba(20,184,166,0.2)]",
    symbol: "∞",
    description: "You are an Andromedan soul — the great integrator, cosmic bridge, and master of multidimensional consciousness. Andromedans carry a unique gift: the ability to hold many truths at once without collapsing into any single one. You live with radical freedom — not the freedom of escape, but the freedom of complete integration. You are here to bridge the galactic and the earthly, the human and the divine, the seen and unseen worlds.",
    gifts: ["Multidimensional integration", "Radical freedom and non-attachment", "Holding multiple perspectives simultaneously", "Shadow and light integration", "Bridging worlds and dimensions"],
    mission: "To be the living bridge between cosmic and earthly consciousness — showing humanity that true freedom comes not from escaping Earth, but from being fully, completely, cosmically here.",
    practices: ["Open awareness meditation (no object, no technique)", "Holotropic breathwork", "Integration journaling after peak experiences", "Walking meditation in nature", "Working with the Infinity symbol (lemniscate)"],
    challenge: "Fully committing to Earth and a body. Your freedom-loving nature can resist rootedness. The paradox: you are most free when you are most grounded.",
    image_bg: "bg-gradient-to-br from-teal-950 via-emerald-950 to-slate-950",
  },
  venusian: {
    name: "Venusian",
    subtitle: "The Sacred Beloved",
    star: "Venus — The Evening Star",
    color: "from-pink-950/60 to-rose-950/60",
    accent: "text-pink-300",
    border: "border-pink-500/30",
    glow: "shadow-[0_0_60px_rgba(236,72,153,0.2)]",
    symbol: "✿",
    description: "You are a Venusian soul — embodiment of sacred love, divine feminine beauty, and the highest frequency of the heart. Venus, our sister planet, carries the codes of the sacred rose, the divine marriage, and love as a cosmic creative force. You did not come to Earth to find love — you came as love itself, in form. Your beauty, your grace, and your magnetic presence activate the heart codes in everyone around you. You are a living transmission of the sacred feminine.",
    gifts: ["Love as a healing transmission", "Sacred beauty as spiritual practice", "Divine feminine embodiment", "Sacred relationship and union", "Activating the heart in others"],
    mission: "To restore the understanding of love as the highest spiritual path — not romantic love only, but cosmic love as the very substance of creation. You are sacred love made visible.",
    practices: ["Rose petal ceremonies and offerings", "Sacred dance and sensual movement as prayer", "Venus evening star gazing and invocations", "Working with rose quartz and rhodonite", "Creating beauty as an act of devotion"],
    challenge: "Honoring your own worthiness. The Venusian gift is giving love freely — the practice is learning to receive it equally, starting from within.",
    image_bg: "bg-gradient-to-br from-pink-950 via-rose-950 to-slate-950",
  },
  cassiopeian: {
    name: "Cassiopeian",
    subtitle: "The Crystal Oracle",
    star: "Cassiopeia — The Queen's Throne",
    color: "from-sky-950/60 to-slate-950/60",
    accent: "text-sky-300",
    border: "border-sky-500/30",
    glow: "shadow-[0_0_60px_rgba(56,189,248,0.2)]",
    symbol: "◇",
    description: "You are a Cassiopeian soul — the diamond-minded oracle, crystalline truth-keeper, and cosmic precision master. Where others see fog, you see crystal clarity. Your mind operates with a precision and clarity that can cut through the densest illusion to find the pure truth beneath. You carry the crystalline matrix codes — the ability to transmit perfect clarity through your presence, your words, and your field.",
    gifts: ["Diamond-clarity perception", "Cutting through illusion to pure truth", "Crystalline light code transmission", "Precision and cosmic intelligence", "Crystal consciousness activation"],
    mission: "To bring crystalline clarity to a world lost in confusion — to be the clear mirror in which others can finally see themselves truly. You are a truth-teller by nature and by cosmic design.",
    practices: ["Crystal gazing and scrying", "Sacred geometry with clear quartz", "Cassiopeia constellation meditation on clear nights", "Truth-speaking practices and authentic communication", "Working with diamond light in meditation"],
    challenge: "Compassion alongside clarity. Your precision can sometimes feel sharp to those who are still in illusion. Lead with the heart as well as the mind.",
    image_bg: "bg-gradient-to-br from-sky-950 via-slate-950 to-slate-950",
  },
  hydian: {
    name: "Hydian",
    subtitle: "The Dolphin Dreamer",
    star: "Hydra — The Water Serpent",
    color: "from-cyan-950/60 to-blue-950/60",
    accent: "text-cyan-400",
    border: "border-cyan-500/30",
    glow: "shadow-[0_0_60px_rgba(34,211,238,0.2)]",
    symbol: "〜",
    description: "You are a Hydian soul — carrier of the dolphin and cetacean consciousness codes, ancient sound healer, and one of the most joyful beings to incarnate on Earth. Hydian consciousness communicates through complex harmonic frequencies and teaches the profound intelligence of the body, the wisdom in play, and the healing power of joy. You heal not only through advanced sound and sonar frequencies but through the medicine of genuine, embodied delight.",
    gifts: ["Sound healing and sonar frequency work", "Cetacean consciousness connection", "Joy and play as healing modalities", "Body intelligence and somatic wisdom", "Harmonic frequency transmission"],
    mission: "To bring the medicine of joy, the healing of sound, and the wisdom of cetacean consciousness to a world that has forgotten how to play. Laughter is your light code.",
    practices: ["Swimming, especially in natural water", "Toning, humming, and dolphin sound meditations", "Water ceremonies and moon water rituals", "Free movement and ecstatic dance", "Working with aquamarine, larimar, and blue topaz"],
    challenge: "Taking your mission seriously enough without losing your lightness. Your joy is real medicine — don't minimize it just because it doesn't look serious.",
    image_bg: "bg-gradient-to-br from-cyan-950 via-blue-950 to-slate-950",
  },
};

const QUESTIONS = [
  {
    id: 1,
    text: "When you gaze at the night sky, what do you feel most strongly?",
    answers: [
      { text: "Deep, aching homesickness — as if the stars are calling you back", lineages: ["pleiadian", "lyran"] },
      { text: "Electric recognition — one specific star feels unmistakably like home", lineages: ["sirian"] },
      { text: "Profound curiosity about advanced civilizations and cosmic technology", lineages: ["arcturian"] },
      { text: "Wild, untamed freedom — you belong to no single place", lineages: ["lyran", "andromedan"] },
      { text: "Pure love and beauty flowing through the darkness", lineages: ["venusian", "pleiadian"] },
      { text: "Crystalline mathematical perfection — the geometry of it all", lineages: ["cassiopeian"] },
    ],
  },
  {
    id: 2,
    text: "What is your greatest natural gift to the world?",
    answers: [
      { text: "Healing hearts and transmitting unconditional love", lineages: ["pleiadian"] },
      { text: "Deep knowing — psychic sight and sacred wisdom", lineages: ["sirian"] },
      { text: "Advanced healing that transforms people at the cellular level", lineages: ["arcturian"] },
      { text: "Igniting freedom and authentic courage in others", lineages: ["lyran"] },
      { text: "Creating beauty that opens hearts everywhere you go", lineages: ["venusian"] },
      { text: "Diamond clarity — seeing truth where others see only fog", lineages: ["cassiopeian"] },
      { text: "Spreading infectious joy and the medicine of play", lineages: ["hydian"] },
      { text: "Holding many truths at once and bridging worlds", lineages: ["andromedan"] },
    ],
  },
  {
    id: 3,
    text: "Which ancient or sacred place resonates most deeply with your soul?",
    answers: [
      { text: "Lemuria — the golden paradise before the great forgetting", lineages: ["pleiadian", "sirian"] },
      { text: "Ancient Egypt — the temples of Sirius and sacred geometry", lineages: ["sirian"] },
      { text: "The healing chambers of Arcturus — crystalline and advanced", lineages: ["arcturian"] },
      { text: "A mythic golden age — free, vital, and lion-hearted", lineages: ["lyran"] },
      { text: "The rose gardens of Venus — eternal beauty and sacred love", lineages: ["venusian"] },
      { text: "A deep crystalline palace of pure, diamond truth", lineages: ["cassiopeian"] },
      { text: "The deep ocean — swimming with dolphins and ancient whales", lineages: ["hydian"] },
      { text: "A place beyond all places — the space between worlds", lineages: ["andromedan"] },
    ],
  },
  {
    id: 4,
    text: "In meditation, ceremony, or vivid dreams, what most frequently appears?",
    answers: [
      { text: "Soft pink-golden light, roses, and beings of pure love", lineages: ["pleiadian", "venusian"] },
      { text: "Sacred geometric patterns and electric blue-white light", lineages: ["sirian", "cassiopeian"] },
      { text: "Advanced healing chambers filled with geometric light technology", lineages: ["arcturian"] },
      { text: "Golden lion beings, vast open plains, ancient fires", lineages: ["lyran"] },
      { text: "Dolphins, whales, deep blue water, and singing sound waves", lineages: ["hydian"] },
      { text: "Stars, galaxies, and a sense of infinite, ecstatic freedom", lineages: ["andromedan", "lyran"] },
    ],
  },
  {
    id: 5,
    text: "People who know you well would say you are...",
    answers: [
      { text: "Extraordinarily loving — you hold space unlike anyone else", lineages: ["pleiadian"] },
      { text: "An old soul with wisdom far beyond your years", lineages: ["sirian", "arcturian"] },
      { text: "Fiercely independent — wild and gloriously free", lineages: ["lyran"] },
      { text: "Magnetically beautiful — there's a grace about you", lineages: ["venusian"] },
      { text: "Crystal clear — you always cut straight to the truth", lineages: ["cassiopeian"] },
      { text: "Delightfully playful — your laugh is genuine medicine", lineages: ["hydian"] },
      { text: "Profoundly peaceful — just being near you calms the soul", lineages: ["andromedan"] },
    ],
  },
  {
    id: 6,
    text: "Which healing modality calls most deeply to your soul?",
    answers: [
      { text: "Sound healing — singing bowls, tuning forks, toning", lineages: ["sirian", "hydian"] },
      { text: "Etheric energy healing — light body and auric field work", lineages: ["arcturian", "pleiadian"] },
      { text: "Somatic breathwork and body-based emotional release", lineages: ["pleiadian", "andromedan"] },
      { text: "Sacred ceremony, fire ritual, and earth-based practice", lineages: ["lyran", "sirian"] },
      { text: "Water ceremonies, moon rituals, and rose offerings", lineages: ["hydian", "venusian"] },
      { text: "Crystal healing and sacred geometry activation", lineages: ["cassiopeian", "sirian"] },
      { text: "Love transmission and heart-field coherence healing", lineages: ["pleiadian", "venusian"] },
    ],
  },
  {
    id: 7,
    text: "What does your soul most deeply long for in this lifetime?",
    answers: [
      { text: "To love and be loved completely, exactly as I am", lineages: ["pleiadian"] },
      { text: "To return to my star home — I ache for it", lineages: ["lyran", "sirian"] },
      { text: "To bring the healing gifts my soul carries to full expression", lineages: ["arcturian"] },
      { text: "To live in perfect, total, sovereign freedom", lineages: ["lyran"] },
      { text: "Sacred union — the divine marriage of soul and matter", lineages: ["venusian"] },
      { text: "To swim in the vast ocean of consciousness and joy", lineages: ["hydian", "andromedan"] },
      { text: "Diamond clarity — to know the truth of all things", lineages: ["cassiopeian"] },
      { text: "To be the bridge this planet so desperately needs", lineages: ["andromedan", "sirian"] },
    ],
  },
  {
    id: 8,
    text: "Which color palette feels most like 'home' to your soul?",
    answers: [
      { text: "Soft rose, warm gold, and tender pink", lineages: ["pleiadian", "venusian"] },
      { text: "Electric cobalt blue, white-gold, and starlight", lineages: ["sirian", "arcturian"] },
      { text: "Deep violet, indigo, and star-white", lineages: ["arcturian"] },
      { text: "Rich amber, warm copper, and golden lion-brown", lineages: ["lyran"] },
      { text: "Aquamarine, seafoam, and luminous dolphin-grey", lineages: ["hydian"] },
      { text: "Pure crystal white, ice blue, and diamond clarity", lineages: ["cassiopeian"] },
      { text: "Iridescent rainbow — you shift with the light", lineages: ["andromedan"] },
    ],
  },
  {
    id: 9,
    text: "How would you describe your soul's mission on Earth?",
    answers: [
      { text: "To open the heart of humanity and heal emotional pain", lineages: ["pleiadian"] },
      { text: "To transmit sacred knowledge and activate ancient wisdom", lineages: ["sirian"] },
      { text: "To accelerate evolution with advanced healing abilities", lineages: ["arcturian"] },
      { text: "To restore freedom and the original sovereign human blueprint", lineages: ["lyran"] },
      { text: "To embody sacred love and beauty as a beacon", lineages: ["venusian"] },
      { text: "To bring crystalline clarity to a world lost in confusion", lineages: ["cassiopeian"] },
      { text: "To bring the medicine of joy, play, and cetacean wisdom", lineages: ["hydian"] },
      { text: "To integrate all dimensions and be the cosmic bridge", lineages: ["andromedan"] },
    ],
  },
  {
    id: 10,
    text: "What is your relationship with water?",
    answers: [
      { text: "Water heals me — I feel most alive near the ocean or a river", lineages: ["hydian", "sirian"] },
      { text: "I am emotionally deep — like the ocean itself", lineages: ["pleiadian"] },
      { text: "I'm drawn to sacred wells and ancient water sites", lineages: ["sirian"] },
      { text: "Water is a mirror — I see myself clearly in still water", lineages: ["venusian", "cassiopeian"] },
      { text: "I love water but my true home is more like open sky", lineages: ["lyran", "andromedan"] },
      { text: "I feel the living consciousness and intelligence within water", lineages: ["andromedan", "hydian"] },
    ],
  },
  {
    id: 11,
    text: "As a child, how did you experience yourself?",
    answers: [
      { text: "Exquisitely sensitive — I felt everything, everyone's emotions", lineages: ["pleiadian"] },
      { text: "I always knew things I shouldn't be able to know", lineages: ["sirian"] },
      { text: "Fiercely independent and resistant to being controlled", lineages: ["lyran"] },
      { text: "Unusually compassionate — I ached for everyone's pain", lineages: ["venusian", "pleiadian"] },
      { text: "Always laughing, playing, and bringing lightness everywhere", lineages: ["hydian"] },
      { text: "Fascinated by healing, science, and how everything works", lineages: ["arcturian"] },
      { text: "I felt I had an important mission — though I couldn't name it", lineages: ["andromedan", "cassiopeian"] },
    ],
  },
  {
    id: 12,
    text: "In your deepest knowing — which star or system calls you home?",
    answers: [
      { text: "The Pleiades — the seven sisters", lineages: ["pleiadian"] },
      { text: "Sirius — the brightest star in the sky", lineages: ["sirian"] },
      { text: "Arcturus — the orange giant, the cosmic healer", lineages: ["arcturian"] },
      { text: "Lyra / Vega — the original human home", lineages: ["lyran"] },
      { text: "The Andromeda Galaxy — vast, free, multidimensional", lineages: ["andromedan"] },
      { text: "Venus — the evening star of love", lineages: ["venusian"] },
      { text: "Cassiopeia — the crystalline queen", lineages: ["cassiopeian"] },
      { text: "The ocean stars — Hydra and the cetacean systems", lineages: ["hydian"] },
    ],
  },
];

export default function StarLineageQuiz() {
  const navigate = useNavigate();
  const [step, setStep] = useState("intro"); // intro | quiz | result
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState(null);

  const progress = ((currentQ) / QUESTIONS.length) * 100;

  const handleAnswer = (answerIndex) => {
    setSelected(answerIndex);
    setTimeout(() => {
      const newAnswers = { ...answers, [QUESTIONS[currentQ].id]: answerIndex };
      setAnswers(newAnswers);
      setSelected(null);
      if (currentQ < QUESTIONS.length - 1) {
        setCurrentQ(q => q + 1);
      } else {
        calculateResult(newAnswers);
      }
    }, 400);
  };

  const calculateResult = (finalAnswers) => {
    const scores = {};
    for (const [qId, aIdx] of Object.entries(finalAnswers)) {
      const question = QUESTIONS.find(q => q.id === parseInt(qId));
      if (!question) continue;
      const answer = question.answers[aIdx];
      if (!answer) continue;
      for (const lineage of answer.lineages) {
        scores[lineage] = (scores[lineage] || 0) + 1;
      }
    }
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    setResult({
      primary: sorted[0]?.[0] || "pleiadian",
      secondary: sorted[1]?.[0],
      scores,
    });
    setStep("result");
  };

  const reset = () => {
    setStep("intro");
    setCurrentQ(0);
    setAnswers({});
    setResult(null);
    setSelected(null);
  };

  const question = QUESTIONS[currentQ];
  const primaryLineage = result ? LINEAGES[result.primary] : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 border-b border-white/10 bg-background/80 backdrop-blur-xl px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-serif text-lg leading-none">Star Lineage Discovery</h1>
          <p className="text-xs text-muted-foreground">Which star system does your soul originate from?</p>
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* INTRO */}
        {step === "intro" && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="max-w-2xl mx-auto px-6 py-16 text-center">
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 flex items-center justify-center">
                <Star className="w-12 h-12 text-violet-400" />
              </div>
              <h2 className="text-4xl font-serif mb-4">Discover Your<br />Star Lineage</h2>
              <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
                Many souls feel a deep connection to the stars — a knowing that their consciousness originates
                beyond Earth. This 12-question journey will reveal which star system most resonates with your soul's essence.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
              {["Pleiadian", "Sirian", "Arcturian", "Lyran", "Andromedan", "Venusian", "Cassiopeian", "Hydian"].map(l => (
                <div key={l} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-muted-foreground text-center">{l}</div>
              ))}
            </div>
            <Button size="lg" onClick={() => setStep("quiz")} className="px-10 py-4 rounded-full text-base" data-testid="start-quiz-btn">
              Begin Your Discovery <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <p className="text-xs text-muted-foreground mt-4">12 questions · 5 minutes</p>
          </motion.div>
        )}

        {/* QUIZ */}
        {step === "quiz" && (
          <motion.div key={`q-${currentQ}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl mx-auto px-6 py-10">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Question {currentQ + 1} of {QUESTIONS.length}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                  animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
              </div>
            </div>

            {/* Question */}
            <h2 className="text-2xl font-serif mb-8 leading-snug">{question.text}</h2>

            {/* Answers */}
            <div className="space-y-3">
              {question.answers.map((answer, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => handleAnswer(i)}
                  data-testid={`answer-${i}`}
                  className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 ${
                    selected === i
                      ? "bg-primary/20 border-primary text-foreground"
                      : "bg-card border-white/10 hover:border-primary/40 hover:bg-white/5 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="text-sm leading-relaxed">{answer.text}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* RESULT */}
        {step === "result" && primaryLineage && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="max-w-3xl mx-auto px-6 py-10">

            {/* Hero */}
            <div className={`rounded-3xl p-8 mb-8 text-center ${primaryLineage.image_bg} border ${primaryLineage.border} ${primaryLineage.glow}`}>
              <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", duration: 0.8 }}>
                <div className="text-6xl mb-4">{primaryLineage.symbol}</div>
                <p className={`text-sm uppercase tracking-widest mb-2 ${primaryLineage.accent}`}>{primaryLineage.starSystem}</p>
                <h2 className="text-5xl font-serif mb-2">{primaryLineage.name}</h2>
                <p className={`text-xl ${primaryLineage.accent}`}>{primaryLineage.subtitle}</p>
              </motion.div>
            </div>

            {/* Description */}
            <div className={`rounded-2xl p-6 mb-6 bg-card border ${primaryLineage.border}`}>
              <p className="text-muted-foreground leading-relaxed text-base">{primaryLineage.description}</p>
            </div>

            {/* Gifts & Mission */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className={`rounded-2xl p-5 border ${primaryLineage.border} bg-card`}>
                <h3 className={`font-serif text-lg mb-3 ${primaryLineage.accent}`}>Your Star Gifts</h3>
                <ul className="space-y-2">
                  {primaryLineage.gifts.map((g, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Sparkles className={`w-3 h-3 mt-0.5 flex-shrink-0 ${primaryLineage.accent}`} />
                      {g}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`rounded-2xl p-5 border ${primaryLineage.border} bg-card`}>
                <h3 className={`font-serif text-lg mb-3 ${primaryLineage.accent}`}>Recommended Practices</h3>
                <ul className="space-y-2">
                  {primaryLineage.practices.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Star className={`w-3 h-3 mt-0.5 flex-shrink-0 ${primaryLineage.accent}`} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Mission */}
            <div className={`rounded-2xl p-5 mb-6 border ${primaryLineage.border} bg-card`}>
              <h3 className={`font-serif text-lg mb-2 ${primaryLineage.accent}`}>Your Mission</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{primaryLineage.mission}</p>
            </div>

            {/* Challenge */}
            <div className="rounded-2xl p-5 mb-8 border border-white/10 bg-white/3">
              <h3 className="font-serif text-lg mb-2 text-muted-foreground">Sacred Challenge</h3>
              <p className="text-muted-foreground text-sm leading-relaxed italic">"{primaryLineage.challenge}"</p>
            </div>

            {/* Secondary Lineage */}
            {result.secondary && LINEAGES[result.secondary] && (
              <div className={`rounded-2xl p-5 mb-8 border ${LINEAGES[result.secondary].border} bg-card`}>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Secondary Lineage Influence</p>
                <h4 className={`font-serif text-lg ${LINEAGES[result.secondary].accent}`}>
                  {LINEAGES[result.secondary].name} — {LINEAGES[result.secondary].subtitle}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">{LINEAGES[result.secondary].starSystem}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={reset} variant="outline" className="flex-1" data-testid="retake-quiz-btn">
                <RefreshCw className="w-4 h-4 mr-2" /> Retake Quiz
              </Button>
              <Button onClick={() => navigate("/ancient-wisdom")} className="flex-1">
                Explore Ancient Wisdom <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
