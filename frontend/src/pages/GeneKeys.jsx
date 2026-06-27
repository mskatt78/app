import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Cloud, Crown, Dna, Eye, Gift, Moon, Sparkles, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { GeneKeysModals } from "../components/gene-keys/GeneKeysModals";
import { GeneKeysProfileTab } from "../components/gene-keys/GeneKeysProfileTab";
import { calculateHumanDesignChart } from "../utils/humanDesignCalculator";
import {
  geneKeysData,
  sequenceColors,
  sequences,
  stableGeneKey,
} from "../components/gene-keys/geneKeysData";

const tabs = [
  { id: "profile", label: "My Profile" },
  { id: "overview", label: "Overview" },
  { id: "keys", label: "64 Gene Keys" },
  { id: "sequences", label: "Golden Path" },
  { id: "contemplation", label: "Contemplation" },
];

const GeneKeys = ({ api }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedKey, setSelectedKey] = useState(null);
  const [selectedSequence, setSelectedSequence] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthTime, setBirthTime] = useState("12:00");
  const [birthCity, setBirthCity] = useState("");
  const [birthCountry, setBirthCountry] = useState("");
  const [calculating, setCalculating] = useState(false);
  const [profile, setProfile] = useState(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1899 }, (_, index) => currentYear - index);
  const months = [
    { value: "01", label: "January" }, { value: "02", label: "February" },
    { value: "03", label: "March" }, { value: "04", label: "April" },
    { value: "05", label: "May" }, { value: "06", label: "June" },
    { value: "07", label: "July" }, { value: "08", label: "August" },
    { value: "09", label: "September" }, { value: "10", label: "October" },
    { value: "11", label: "November" }, { value: "12", label: "December" },
  ];
  const days = Array.from({ length: 31 }, (_, index) => String(index + 1).padStart(2, "0"));

  const handleCalculate = async () => {
    if (!birthYear || !birthMonth || !birthDay || !birthTime || !birthCity || !birthCountry) {
      toast.error("Please provide date, exact time, city, and country for precision Gene Keys.");
      return;
    }

    setCalculating(true);
    try {
      const dateStr = `${birthYear}-${birthMonth}-${birthDay}`;
      const strictChart = await calculateHumanDesignChart(api, {
        birth_date: dateStr,
        birth_time: birthTime,
        birth_city: birthCity,
        birth_country: birthCountry,
      });
      setProfile(strictChart.geneKeysProfile || null);
      toast.success("Gene Keys profile calculated from strict birth precision.");
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Could not calculate Gene Keys profile.");
    } finally {
      setCalculating(false);
    }
  };

  const filteredKeys = useMemo(() => geneKeysData.filter((entry) => (
    entry.shadow.toLowerCase().includes(searchTerm.toLowerCase())
      || entry.gift.toLowerCase().includes(searchTerm.toLowerCase())
      || entry.siddhi.toLowerCase().includes(searchTerm.toLowerCase())
      || entry.theme.toLowerCase().includes(searchTerm.toLowerCase())
      || entry.key.toString().includes(searchTerm)
  )), [searchTerm]);

  return (
    <div className="min-h-screen bg-background" data-testid="gene-keys">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/menu")} className="p-2 rounded-full hover:bg-white/5 transition-colors" data-testid="gene-keys-back-btn">
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

        <div className="flex flex-wrap gap-2 justify-center">
          {tabs.map((tab) => (
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

        <AnimatePresence mode="wait">
          {activeTab === "profile" && (
            <GeneKeysProfileTab
              profile={profile}
              setProfile={setProfile}
              birthYear={birthYear}
              birthMonth={birthMonth}
              birthDay={birthDay}
              birthTime={birthTime}
              birthCity={birthCity}
              birthCountry={birthCountry}
              setBirthYear={setBirthYear}
              setBirthMonth={setBirthMonth}
              setBirthDay={setBirthDay}
              setBirthTime={setBirthTime}
              setBirthCity={setBirthCity}
              setBirthCountry={setBirthCountry}
              years={years}
              months={months}
              days={days}
              calculating={calculating}
              handleCalculate={handleCalculate}
              navigate={navigate}
              setSelectedKey={setSelectedKey}
            />
          )}

          {activeTab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
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

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                <p className="text-lg font-serif italic text-foreground/80 max-w-2xl mx-auto">
                  &ldquo;The Gene Keys are a transmission. They work on you whether you understand them or not.
                  All you have to do is contemplate them with an open heart.&rdquo;
                </p>
                <p className="text-sm text-muted-foreground mt-3">— Richard Rudd, creator of the Gene Keys</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: "Contemplation, Not Study",
                    body: "The Gene Keys are not meant to be intellectually analyzed. They are designed to be contemplated - absorbed slowly over time, allowing their wisdom to integrate into your being.",
                  },
                  {
                    title: "The Golden Path",
                    body: "Three sequences - Activation, Venus, and Pearl - form a pathway of self-discovery from your genius, through your heart, to your prosperity and service.",
                  },
                  {
                    title: "64 Universal Archetypes",
                    body: "Based on the 64 hexagrams of the I Ching and the 64 codons of DNA, these archetypes are universal patterns found in all spiritual traditions.",
                  },
                  {
                    title: "Your Hologenetic Profile",
                    body: "Your birth data creates a unique profile showing which Gene Keys are active in your design. These are your personal doorways to awakening.",
                  },
                ].map((card) => (
                  <div key={card.title} className="p-5 rounded-xl bg-white/5 border border-white/10">
                    <h4 className="font-medium mb-2">{card.title}</h4>
                    <p className="text-sm text-muted-foreground">{card.body}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "keys" && (
            <motion.div key="keys" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="relative max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="Search by shadow, gift, siddhi, or number..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full px-4 py-3 pl-10 rounded-xl bg-white/5 border border-white/10 focus:border-violet-500/50 focus:outline-none"
                  data-testid="gene-keys-search-input"
                />
                <Eye className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                {filteredKeys.map((entry) => (
                  <motion.button
                    key={entry.key}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedKey(entry)}
                    className="p-3 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20 hover:border-violet-500/40 transition-all text-center"
                    data-testid={`key-${entry.key}`}
                  >
                    <span className="text-lg font-serif text-violet-300">{entry.key}</span>
                    <p className="text-xs text-muted-foreground truncate mt-1">{entry.gift}</p>
                  </motion.button>
                ))}
              </div>

              {filteredKeys.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No Gene Keys match your search.</p>
              )}
            </motion.div>
          )}

          {activeTab === "sequences" && (
            <motion.div key="sequences" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <p className="text-center text-muted-foreground max-w-2xl mx-auto">
                The Golden Path is your personal journey through three interconnected sequences,
                each unlocking a different dimension of your higher purpose.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {sequences.map((sequence, index) => {
                  const Icon = sequence.icon;
                  const colorClasses = sequenceColors[sequence.color];
                  return (
                    <motion.div
                      key={sequence.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setSelectedSequence(sequence)}
                      className={`cursor-pointer p-6 rounded-2xl bg-gradient-to-br ${colorClasses.split(" ").slice(0, 2).join(" ")} border ${colorClasses.split(" ")[2]} hover:scale-[1.02] transition-all`}
                      data-testid={`sequence-${sequence.id}`}
                    >
                      <Icon className={`w-10 h-10 mb-4 ${colorClasses.split(" ")[3]}`} />
                      <h3 className="font-serif text-xl mb-1">{sequence.name}</h3>
                      <p className={`text-sm ${colorClasses.split(" ")[3]} mb-3 italic`}>{sequence.subtitle}</p>
                      <p className="text-sm text-muted-foreground line-clamp-3">{sequence.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === "contemplation" && (
            <motion.div key="contemplation" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 max-w-3xl mx-auto">
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
                    "Trust the process. The Gene Key is working on you even when you don't feel it.",
                  ].map((step, index) => (
                    <li key={stableGeneKey("contemplation-step", step)} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-xs text-violet-300 flex-shrink-0">
                        {index + 1}
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
                  data-testid="gene-keys-random-key-btn"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Draw Today&apos;s Gene Key
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <GeneKeysModals
        selectedKey={selectedKey}
        setSelectedKey={setSelectedKey}
        selectedSequence={selectedSequence}
        setSelectedSequence={setSelectedSequence}
      />
    </div>
  );
};

export default GeneKeys;
