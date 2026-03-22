import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Sparkles, Star, Sun, Moon, Heart, Dna, 
  ChevronRight, X, Zap, Eye, Gift, Cloud, Crown
} from "lucide-react";
import { Button } from "../components/ui/button";

// 64 Gene Keys Data - Comprehensive library
const geneKeysData = [
  { key: 1, shadow: "Entropy", gift: "Freshness", siddhi: "Beauty", theme: "From Entropy to Syntropy", codon: "AAA", amino: "Lys" },
  { key: 2, shadow: "Dislocation", gift: "Orientation", siddhi: "Unity", theme: "Returning to the One", codon: "AAC", amino: "Asn" },
  { key: 3, shadow: "Chaos", gift: "Innovation", siddhi: "Innocence", theme: "Through the Eyes of a Child", codon: "AAG", amino: "Lys" },
  { key: 4, shadow: "Intolerance", gift: "Understanding", siddhi: "Forgiveness", theme: "A Universal Panacea", codon: "AAU", amino: "Asn" },
  { key: 5, shadow: "Impatience", gift: "Patience", siddhi: "Timelessness", theme: "The Ending of Time", codon: "ACA", amino: "Thr" },
  { key: 6, shadow: "Conflict", gift: "Diplomacy", siddhi: "Peace", theme: "The Path to Peace", codon: "ACC", amino: "Thr" },
  { key: 7, shadow: "Division", gift: "Guidance", siddhi: "Virtue", theme: "Virtue is its Own Reward", codon: "ACG", amino: "Thr" },
  { key: 8, shadow: "Mediocrity", gift: "Style", siddhi: "Exquisiteness", theme: "Diamond of the Self", codon: "ACU", amino: "Thr" },
  { key: 9, shadow: "Inertia", gift: "Determination", siddhi: "Invincibility", theme: "The Power of the Infinitesimal", codon: "AGA", amino: "Arg" },
  { key: 10, shadow: "Self-Obsession", gift: "Naturalness", siddhi: "Being", theme: "Being at Ease", codon: "AGC", amino: "Ser" },
  { key: 11, shadow: "Obscurity", gift: "Idealism", siddhi: "Light", theme: "The Light of Eden", codon: "AGG", amino: "Arg" },
  { key: 12, shadow: "Vanity", gift: "Discrimination", siddhi: "Purity", theme: "A Pure Heart", codon: "AGU", amino: "Ser" },
  { key: 13, shadow: "Discord", gift: "Discernment", siddhi: "Empathy", theme: "Listening Through Love", codon: "AUA", amino: "Ile" },
  { key: 14, shadow: "Compromise", gift: "Competence", siddhi: "Bounteousness", theme: "Radiating Prosperity", codon: "AUC", amino: "Ile" },
  { key: 15, shadow: "Dullness", gift: "Magnetism", siddhi: "Florescence", theme: "An Eternally Flowering Spring", codon: "AUG", amino: "Met" },
  { key: 16, shadow: "Indifference", gift: "Versatility", siddhi: "Mastery", theme: "Magical Genius", codon: "AUU", amino: "Ile" },
  { key: 17, shadow: "Opinion", gift: "Far-Sightedness", siddhi: "Omniscience", theme: "The Eye", codon: "CAA", amino: "Gln" },
  { key: 18, shadow: "Judgement", gift: "Integrity", siddhi: "Perfection", theme: "The Healing Power of Mind", codon: "CAC", amino: "His" },
  { key: 19, shadow: "Co-Dependence", gift: "Sensitivity", siddhi: "Sacrifice", theme: "The Future Human Being", codon: "CAG", amino: "Gln" },
  { key: 20, shadow: "Superficiality", gift: "Self-Assurance", siddhi: "Presence", theme: "The Sacred Om", codon: "CAU", amino: "His" },
  { key: 21, shadow: "Control", gift: "Authority", siddhi: "Valour", theme: "A Noble Life", codon: "CCA", amino: "Pro" },
  { key: 22, shadow: "Dishonour", gift: "Graciousness", siddhi: "Grace", theme: "Grace Under Pressure", codon: "CCC", amino: "Pro" },
  { key: 23, shadow: "Complexity", gift: "Simplicity", siddhi: "Quintessence", theme: "The Alchemy of Simplicity", codon: "CCG", amino: "Pro" },
  { key: 24, shadow: "Addiction", gift: "Invention", siddhi: "Silence", theme: "The Ultimate Addiction", codon: "CCU", amino: "Pro" },
  { key: 25, shadow: "Constriction", gift: "Acceptance", siddhi: "Universal Love", theme: "The Myth of the Sacred Wound", codon: "CGA", amino: "Arg" },
  { key: 26, shadow: "Pride", gift: "Artfulness", siddhi: "Invisibility", theme: "Sacred Tricksters", codon: "CGC", amino: "Arg" },
  { key: 27, shadow: "Selfishness", gift: "Altruism", siddhi: "Selflessness", theme: "Food of the Gods", codon: "CGG", amino: "Arg" },
  { key: 28, shadow: "Purposelessness", gift: "Totality", siddhi: "Immortality", theme: "Embracing the Dark Side", codon: "CGU", amino: "Arg" },
  { key: 29, shadow: "Half-Heartedness", gift: "Commitment", siddhi: "Devotion", theme: "Leaping into the Void", codon: "CUA", amino: "Leu" },
  { key: 30, shadow: "Desire", gift: "Lightness", siddhi: "Rapture", theme: "Celestial Fire", codon: "CUC", amino: "Leu" },
  { key: 31, shadow: "Arrogance", gift: "Leadership", siddhi: "Humility", theme: "Sounding Your Truth", codon: "CUG", amino: "Leu" },
  { key: 32, shadow: "Failure", gift: "Preservation", siddhi: "Veneration", theme: "Ancestral Reverence", codon: "CUU", amino: "Leu" },
  { key: 33, shadow: "Forgetting", gift: "Mindfulness", siddhi: "Revelation", theme: "The Final Revelation", codon: "GAA", amino: "Glu" },
  { key: 34, shadow: "Force", gift: "Strength", siddhi: "Majesty", theme: "The Beauty of the Beast", codon: "GAC", amino: "Asp" },
  { key: 35, shadow: "Hunger", gift: "Adventure", siddhi: "Boundlessness", theme: "Wormholes and Miracles", codon: "GAG", amino: "Glu" },
  { key: 36, shadow: "Turbulence", gift: "Humanity", siddhi: "Compassion", theme: "Becoming Human", codon: "GAU", amino: "Asp" },
  { key: 37, shadow: "Weakness", gift: "Equality", siddhi: "Tenderness", theme: "Family Alchemy", codon: "GCA", amino: "Ala" },
  { key: 38, shadow: "Struggle", gift: "Perseverance", siddhi: "Honour", theme: "The Warrior of Light", codon: "GCC", amino: "Ala" },
  { key: 39, shadow: "Provocation", gift: "Dynamism", siddhi: "Liberation", theme: "The Tension of Transcendence", codon: "GCG", amino: "Ala" },
  { key: 40, shadow: "Exhaustion", gift: "Resolve", siddhi: "Divine Will", theme: "The Will to Surrender", codon: "GCU", amino: "Ala" },
  { key: 41, shadow: "Fantasy", gift: "Anticipation", siddhi: "Emanation", theme: "The Prime Emanation", codon: "GGA", amino: "Gly" },
  { key: 42, shadow: "Expectation", gift: "Detachment", siddhi: "Celebration", theme: "Letting Go of Living and Dying", codon: "GGC", amino: "Gly" },
  { key: 43, shadow: "Deafness", gift: "Insight", siddhi: "Epiphany", theme: "Opening the Mind", codon: "GGG", amino: "Gly" },
  { key: 44, shadow: "Interference", gift: "Teamwork", siddhi: "Synarchy", theme: "Karmic Relationships", codon: "GGU", amino: "Gly" },
  { key: 45, shadow: "Dominance", gift: "Synergy", siddhi: "Communion", theme: "Cosmic Communion", codon: "GUA", amino: "Val" },
  { key: 46, shadow: "Seriousness", gift: "Delight", siddhi: "Ecstasy", theme: "A Science of Luck", codon: "GUC", amino: "Val" },
  { key: 47, shadow: "Oppression", gift: "Transmutation", siddhi: "Transfiguration", theme: "Transmuting the Past", codon: "GUG", amino: "Val" },
  { key: 48, shadow: "Inadequacy", gift: "Resourcefulness", siddhi: "Wisdom", theme: "The Wonder of Uncertainty", codon: "GUU", amino: "Val" },
  { key: 49, shadow: "Reaction", gift: "Revolution", siddhi: "Rebirth", theme: "Changing the World from the Inside", codon: "UAA", amino: "Stop" },
  { key: 50, shadow: "Corruption", gift: "Equilibrium", siddhi: "Harmony", theme: "Cosmic Order", codon: "UAC", amino: "Tyr" },
  { key: 51, shadow: "Agitation", gift: "Initiative", siddhi: "Awakening", theme: "Initiative to Awakening", codon: "UAG", amino: "Stop" },
  { key: 52, shadow: "Stress", gift: "Restraint", siddhi: "Stillness", theme: "The Stillpoint", codon: "UAU", amino: "Tyr" },
  { key: 53, shadow: "Immaturity", gift: "Expansion", siddhi: "Superabundance", theme: "Evolving Beyond Greed", codon: "UCA", amino: "Ser" },
  { key: 54, shadow: "Greed", gift: "Aspiration", siddhi: "Ascension", theme: "The Serpent's Path", codon: "UCC", amino: "Ser" },
  { key: 55, shadow: "Victimisation", gift: "Freedom", siddhi: "Freedom", theme: "The Dragonfly's Dream", codon: "UCG", amino: "Ser" },
  { key: 56, shadow: "Distraction", gift: "Enrichment", siddhi: "Intoxication", theme: "Divine Intoxication", codon: "UCU", amino: "Ser" },
  { key: 57, shadow: "Unease", gift: "Intuition", siddhi: "Clarity", theme: "A Gentle Wind", codon: "UGA", amino: "Stop" },
  { key: 58, shadow: "Dissatisfaction", gift: "Vitality", siddhi: "Bliss", theme: "From Stress to Bliss", codon: "UGC", amino: "Cys" },
  { key: 59, shadow: "Dishonesty", gift: "Intimacy", siddhi: "Transparency", theme: "The Dragon in Your Genome", codon: "UGG", amino: "Trp" },
  { key: 60, shadow: "Limitation", gift: "Realism", siddhi: "Justice", theme: "The Cracking of the Vessel", codon: "UGU", amino: "Cys" },
  { key: 61, shadow: "Psychosis", gift: "Inspiration", siddhi: "Sanctity", theme: "The Holy of Holies", codon: "UUA", amino: "Leu" },
  { key: 62, shadow: "Intellect", gift: "Precision", siddhi: "Impeccability", theme: "The Language of Light", codon: "UUC", amino: "Phe" },
  { key: 63, shadow: "Doubt", gift: "Inquiry", siddhi: "Truth", theme: "Reaching the Source", codon: "UUG", amino: "Leu" },
  { key: 64, shadow: "Confusion", gift: "Imagination", siddhi: "Illumination", theme: "The Aurora", codon: "UUU", amino: "Phe" }
];

// Three Sequences
const sequences = [
  {
    id: "activation",
    name: "Activation Sequence",
    subtitle: "Discovering Your Genius",
    icon: Zap,
    color: "amber",
    description: "The Activation Sequence reveals your four Prime Gifts and the pathway to your genius. It shows you how your higher purpose wants to emerge through your natural gifts.",
    spheres: [
      { name: "Life's Work", desc: "Your vocation and external purpose", position: "Top" },
      { name: "Evolution", desc: "The challenge that accelerates your growth", position: "Right" },
      { name: "Radiance", desc: "Your health and physical vitality", position: "Bottom" },
      { name: "Purpose", desc: "Your core wound and deepest gift", position: "Left" }
    ],
    contemplation: "To activate your genius, contemplate each sphere in sequence. Begin with Life's Work - what gifts want to express through your vocation? Move to Evolution - what challenges keep returning? Radiance shows how your body reflects your inner state. Purpose reveals the wound that, when embraced, becomes your greatest gift."
  },
  {
    id: "venus",
    name: "Venus Sequence",
    subtitle: "Opening Your Heart",
    icon: Heart,
    color: "rose",
    description: "The Venus Sequence unlocks the pathway of relationships and emotional intelligence. It reveals how your heart opens through connection with others.",
    spheres: [
      { name: "Attraction", desc: "What draws people to you", position: "Top" },
      { name: "IQ (Emotional)", desc: "Your emotional intelligence", position: "Right" },
      { name: "SQ (Spiritual)", desc: "Your spiritual intelligence", position: "Bottom" },
      { name: "Core", desc: "Your deepest vulnerability", position: "Center" },
      { name: "Purpose (Venus)", desc: "Your heart's true calling", position: "Left" }
    ],
    contemplation: "The Venus Sequence is about softening. Begin by contemplating what you're attracted to and what attracts others to you. Move into your emotional patterns, then your spiritual nature. At the Core, you'll find your greatest vulnerability - the place where love can finally enter."
  },
  {
    id: "pearl",
    name: "Pearl Sequence",
    subtitle: "Attaining Prosperity",
    icon: Crown,
    color: "violet",
    description: "The Pearl Sequence reveals your pathway to prosperity through service. It shows how your gifts can flourish in the world and create abundance.",
    spheres: [
      { name: "Vocation", desc: "Your unique contribution", position: "Top" },
      { name: "Culture", desc: "The communities you serve", position: "Right" },
      { name: "Brand", desc: "Your unique essence", position: "Bottom" },
      { name: "Pearl", desc: "Your ultimate gift to the world", position: "Center" }
    ],
    contemplation: "The Pearl forms when irritation (the shadow) is transformed through acceptance. Your Pearl is your ultimate contribution - the gift that forms through a lifetime of embracing your shadows. Contemplate: What is the unique pearl only you can offer the world?"
  }
];

const GeneKeys = ({ user, api }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedKey, setSelectedKey] = useState(null);
  const [selectedSequence, setSelectedSequence] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredKeys = geneKeysData.filter(k => 
    k.shadow.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.gift.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.siddhi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.theme.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.key.toString().includes(searchTerm)
  );

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "keys", label: "64 Gene Keys" },
    { id: "sequences", label: "Golden Path" },
    { id: "contemplation", label: "Contemplation" }
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="gene-keys">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/menu")} className="p-2 rounded-full hover:bg-white/5 transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Wisdom System</p>
              <h1 className="text-xl font-serif">Gene <span className="italic text-primary">Keys</span></h1>
            </div>
          </div>
          <Dna className="w-6 h-6 text-primary/50" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 rounded-2xl bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-indigo-500/10 border border-violet-500/20"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-violet-500/20 flex items-center justify-center">
            <Dna className="w-10 h-10 text-violet-400" />
          </div>
          <h2 className="text-3xl font-serif mb-4">The <span className="italic text-primary">Gene Keys</span></h2>
          <p className="text-muted-foreground max-w-2xl mx-auto px-6 text-lg">
            A profound system of 64 archetypal keys that unlock the higher purpose encoded in your DNA.
            Transform shadows into gifts, and gifts into the highest states of consciousness.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 justify-center">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-full text-sm transition-all ${
                activeTab === tab.id
                  ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-white/10"
              }`}
              data-testid={`tab-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Three Frequencies */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20">
                  <Cloud className="w-8 h-8 text-red-400 mb-3" />
                  <h3 className="font-serif text-lg mb-2 text-red-300">Shadow</h3>
                  <p className="text-sm text-muted-foreground">
                    The low-frequency expression of each Gene Key. Shadows are not enemies - they are 
                    doorways. By embracing your shadows with awareness, you begin the alchemical process 
                    of transformation.
                  </p>
                </div>
                <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <Gift className="w-8 h-8 text-amber-400 mb-3" />
                  <h3 className="font-serif text-lg mb-2 text-amber-300">Gift</h3>
                  <p className="text-sm text-muted-foreground">
                    The transformed frequency. When shadow is met with acceptance rather than resistance, 
                    it naturally transmutes into its Gift. Gifts are your natural genius waiting to emerge.
                  </p>
                </div>
                <div className="p-6 rounded-2xl bg-violet-500/10 border border-violet-500/20">
                  <Star className="w-8 h-8 text-violet-400 mb-3" />
                  <h3 className="font-serif text-lg mb-2 text-violet-300">Siddhi</h3>
                  <p className="text-sm text-muted-foreground">
                    The highest frequency - a state of divine consciousness. Siddhis are not achieved; 
                    they descend as grace when the Gift has been fully embodied and the heart is open.
                  </p>
                </div>
              </div>

              {/* Richard Rudd Quote */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                <p className="text-lg font-serif italic text-foreground/80 max-w-2xl mx-auto">
                  "The Gene Keys are a transmission. They work on you whether you understand them or not. 
                  All you have to do is contemplate them with an open heart."
                </p>
                <p className="text-sm text-muted-foreground mt-3">— Richard Rudd, creator of the Gene Keys</p>
              </div>

              {/* Core Principles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="font-medium mb-2">Contemplation, Not Study</h4>
                  <p className="text-sm text-muted-foreground">
                    The Gene Keys are not meant to be intellectually analyzed. They are designed to be 
                    contemplated - absorbed slowly over time, allowing their wisdom to integrate into your being.
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="font-medium mb-2">The Golden Path</h4>
                  <p className="text-sm text-muted-foreground">
                    Three sequences - Activation, Venus, and Pearl - form a pathway of self-discovery 
                    from your genius, through your heart, to your prosperity and service.
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="font-medium mb-2">64 Universal Archetypes</h4>
                  <p className="text-sm text-muted-foreground">
                    Based on the 64 hexagrams of the I Ching and the 64 codons of DNA, these archetypes 
                    are universal patterns found in all spiritual traditions.
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="font-medium mb-2">Your Hologenetic Profile</h4>
                  <p className="text-sm text-muted-foreground">
                    Your birth data creates a unique profile showing which Gene Keys are active in your 
                    design. These are your personal doorways to awakening.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "keys" && (
            <motion.div
              key="keys"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Search */}
              <div className="relative max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="Search by shadow, gift, siddhi, or number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 rounded-xl bg-white/5 border border-white/10 focus:border-violet-500/50 focus:outline-none"
                />
                <Eye className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>

              {/* Keys Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                {filteredKeys.map(key => (
                  <motion.button
                    key={key.key}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedKey(key)}
                    className="p-3 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20 
                             hover:border-violet-500/40 transition-all text-center"
                    data-testid={`key-${key.key}`}
                  >
                    <span className="text-lg font-serif text-violet-300">{key.key}</span>
                    <p className="text-xs text-muted-foreground truncate mt-1">{key.gift}</p>
                  </motion.button>
                ))}
              </div>

              {filteredKeys.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No Gene Keys match your search.</p>
              )}
            </motion.div>
          )}

          {activeTab === "sequences" && (
            <motion.div
              key="sequences"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <p className="text-center text-muted-foreground max-w-2xl mx-auto">
                The Golden Path is your personal journey through three interconnected sequences, 
                each unlocking a different dimension of your higher purpose.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {sequences.map((seq, index) => {
                  const Icon = seq.icon;
                  const colors = {
                    amber: "from-amber-500/10 to-orange-500/5 border-amber-500/20 text-amber-300",
                    rose: "from-rose-500/10 to-pink-500/5 border-rose-500/20 text-rose-300",
                    violet: "from-violet-500/10 to-purple-500/5 border-violet-500/20 text-violet-300"
                  };
                  return (
                    <motion.div
                      key={seq.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setSelectedSequence(seq)}
                      className={`cursor-pointer p-6 rounded-2xl bg-gradient-to-br ${colors[seq.color].split(' ').slice(0, 2).join(' ')} 
                                border ${colors[seq.color].split(' ')[2]} hover:scale-[1.02] transition-all`}
                      data-testid={`sequence-${seq.id}`}
                    >
                      <Icon className={`w-10 h-10 mb-4 ${colors[seq.color].split(' ')[3]}`} />
                      <h3 className="font-serif text-xl mb-1">{seq.name}</h3>
                      <p className={`text-sm ${colors[seq.color].split(' ')[3]} mb-3 italic`}>{seq.subtitle}</p>
                      <p className="text-sm text-muted-foreground line-clamp-3">{seq.description}</p>
                      <div className="mt-4 flex items-center gap-1 text-sm opacity-70">
                        <ChevronRight className="w-4 h-4" />
                        <span>Explore Sequence</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === "contemplation" && (
            <motion.div
              key="contemplation"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6 max-w-3xl mx-auto"
            >
              <div className="p-8 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-center">
                <Moon className="w-12 h-12 text-violet-400 mx-auto mb-4" />
                <h3 className="text-2xl font-serif mb-4">The Art of Contemplation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Contemplation is not thinking. It is allowing a concept to rest in your awareness 
                  without trying to understand it. Let the Gene Key sit in your heart, return to it 
                  throughout your day, and watch how it begins to reveal itself through your life.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-serif text-lg">How to Contemplate a Gene Key</h4>
                <ol className="space-y-4">
                  {[
                    "Choose one Gene Key to work with. Perhaps one from your profile, or one that calls to you.",
                    "Read the Shadow, Gift, and Siddhi. Notice which word creates a reaction in you.",
                    "Sit quietly with the theme. Don't analyze - just let it rest in your awareness.",
                    "Throughout your day, notice when this theme appears in your life, relationships, and reactions.",
                    "Journal your observations. What is the Gene Key showing you about yourself?",
                    "Return to it daily for at least a week. Let the contemplation deepen naturally.",
                    "Trust the process. The Gene Key is working on you even when you don't feel it."
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-xs text-violet-300 flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <h4 className="font-medium mb-3">Daily Contemplation Practice</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Each morning, draw a random Gene Key number (1-64) and make it your contemplation for the day.
                  Notice how this energy shows up in your experiences.
                </p>
                <Button 
                  onClick={() => {
                    const randomKey = geneKeysData[Math.floor(Math.random() * 64)];
                    setSelectedKey(randomKey);
                  }}
                  className="w-full bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Draw Today's Gene Key
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Gene Key Detail Modal */}
      <AnimatePresence>
        {selectedKey && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedKey(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                      <span className="text-2xl font-serif text-violet-300">{selectedKey.key}</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-serif">Gene Key {selectedKey.key}</h2>
                      <p className="text-sm text-muted-foreground italic">{selectedKey.theme}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedKey(null)} className="p-2 rounded-full hover:bg-white/10">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Three Frequencies */}
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Cloud className="w-4 h-4 text-red-400" />
                      <span className="text-xs text-red-300 uppercase tracking-wider">Shadow</span>
                    </div>
                    <p className="text-lg font-serif">{selectedKey.shadow}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Gift className="w-4 h-4 text-amber-400" />
                      <span className="text-xs text-amber-300 uppercase tracking-wider">Gift</span>
                    </div>
                    <p className="text-lg font-serif">{selectedKey.gift}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="w-4 h-4 text-violet-400" />
                      <span className="text-xs text-violet-300 uppercase tracking-wider">Siddhi</span>
                    </div>
                    <p className="text-lg font-serif">{selectedKey.siddhi}</p>
                  </div>
                </div>

                {/* Codon Info */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">DNA Codon</p>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-lg text-primary">{selectedKey.codon}</span>
                    <span className="text-muted-foreground">Amino Acid: {selectedKey.amino}</span>
                  </div>
                </div>

                {/* Contemplation Prompt */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20">
                  <h4 className="font-medium mb-2 text-violet-300">Contemplation</h4>
                  <p className="text-sm text-muted-foreground italic">
                    "How does the shadow of {selectedKey.shadow} show up in my life? 
                    What would it look like to transform this into the gift of {selectedKey.gift}?"
                  </p>
                </div>

                <Button onClick={() => setSelectedKey(null)} className="w-full" variant="outline">
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sequence Detail Modal */}
      <AnimatePresence>
        {selectedSequence && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedSequence(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-serif">{selectedSequence.name}</h2>
                    <p className="text-sm text-muted-foreground italic">{selectedSequence.subtitle}</p>
                  </div>
                  <button onClick={() => setSelectedSequence(null)} className="p-2 rounded-full hover:bg-white/10">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-muted-foreground">{selectedSequence.description}</p>

                <div>
                  <h4 className="font-medium mb-3">The Spheres</h4>
                  <div className="space-y-2">
                    {selectedSequence.spheres.map((sphere, i) => (
                      <div key={i} className="p-3 rounded-lg bg-white/5">
                        <p className="font-medium">{sphere.name}</p>
                        <p className="text-sm text-muted-foreground">{sphere.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                  <h4 className="font-medium mb-2 text-violet-300">Contemplation Guide</h4>
                  <p className="text-sm text-muted-foreground">{selectedSequence.contemplation}</p>
                </div>

                <Button onClick={() => setSelectedSequence(null)} className="w-full" variant="outline">
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GeneKeys;
