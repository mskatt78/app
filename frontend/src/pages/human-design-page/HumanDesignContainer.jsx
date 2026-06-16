import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronRight, Hexagon, Star, Target } from "lucide-react";
import { toast } from "sonner";
import { HumanDesignChartTab } from "../../components/human-design/HumanDesignChartTab";
import { HumanDesignModals } from "../../components/human-design/HumanDesignModals";
import {
  centers,
  getTypeColor,
  humanDesignTypes,
  keyGates,
  stableHumanDesignKey,
} from "../../components/human-design/humanDesignData";
import { calculateHumanDesignChart } from "../../utils/humanDesignCalculator";

const tabs = [
  { id: "chart", label: "My Chart" },
  { id: "types", label: "5 Energy Types" },
  { id: "centers", label: "9 Centers" },
  { id: "gates", label: "64 Gates" },
  { id: "experiment", label: "Your Experiment" },
];

const HumanDesign = ({ api }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("chart");
  const [selectedType, setSelectedType] = useState(null);
  const [selectedCenter, setSelectedCenter] = useState(null);

  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthTime, setBirthTime] = useState("12:00");
  const [birthCity, setBirthCity] = useState("");
  const [birthCountry, setBirthCountry] = useState("");
  const [hdProfile, setHdProfile] = useState(null);
  const [chosenType, setChosenType] = useState(null);
  const [calculatedAuthority, setCalculatedAuthority] = useState("");
  const [definedCenterCount, setDefinedCenterCount] = useState(0);
  const [calculatingChart, setCalculatingChart] = useState(false);
  const [phase, setPhase] = useState(1);

  const currentYear = new Date().getFullYear();
  const years = useMemo(() => Array.from({ length: currentYear - 1899 }, (_, index) => currentYear - index), [currentYear]);
  const months = useMemo(() => [
    { value: "01", label: "January" }, { value: "02", label: "February" }, { value: "03", label: "March" },
    { value: "04", label: "April" }, { value: "05", label: "May" }, { value: "06", label: "June" },
    { value: "07", label: "July" }, { value: "08", label: "August" }, { value: "09", label: "September" },
    { value: "10", label: "October" }, { value: "11", label: "November" }, { value: "12", label: "December" },
  ], []);
  const days = useMemo(() => Array.from({ length: 31 }, (_, index) => String(index + 1).padStart(2, "0")), []);

  const handleCalcProfile = async () => {
    if (!birthYear || !birthMonth || !birthDay || !birthTime || !birthCity || !birthCountry) {
      toast.error("Please provide date, exact birth time, city, and country.");
      return;
    }

    setCalculatingChart(true);
    try {
      const birthDate = `${birthYear}-${birthMonth}-${birthDay}`;
      const result = await calculateHumanDesignChart(api, {
        birth_date: birthDate,
        birth_time: birthTime,
        birth_city: birthCity,
        birth_country: birthCountry,
      });

      setHdProfile({
        profile: result.profile,
        sunLine: result.personalitySun.line,
        dLine: result.designSun.line,
        sunGate: result.personalitySun.gate,
        dGate: result.designSun.gate,
      });
      setChosenType(humanDesignTypes.find((type) => type.id === result.typeKey) || null);
      setCalculatedAuthority(result.authority);
      setDefinedCenterCount(result.definedCenters.length);
      setPhase(3);
      toast.success("Human Design chart calculated from birth data.");
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Could not calculate chart from birth data.");
    } finally {
      setCalculatingChart(false);
    }
  };

  const resetChart = () => {
    setPhase(1);
    setHdProfile(null);
    setChosenType(null);
    setBirthYear("");
    setBirthMonth("");
    setBirthDay("");
    setBirthTime("12:00");
    setBirthCity("");
    setBirthCountry("");
    setCalculatedAuthority("");
    setDefinedCenterCount(0);
  };

  return (
    <div className="min-h-screen bg-background" data-testid="human-design">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/menu")} className="p-2 rounded-full hover:bg-white/5 transition-colors" data-testid="human-design-back-btn">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Wisdom System</p>
              <h1 className="text-xl font-serif">Human <span className="italic text-primary">Design</span></h1>
            </div>
          </div>
          <Hexagon className="w-6 h-6 text-primary/50" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-blue-500/10 border border-indigo-500/20"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <Hexagon className="w-10 h-10 text-indigo-400" />
          </div>
          <h2 className="text-3xl font-serif mb-4">Human <span className="italic text-primary">Design</span></h2>
          <p className="text-muted-foreground max-w-2xl mx-auto px-6 text-lg">
            A synthesis of ancient wisdom and modern science — combining the I Ching, Kabbalah,
            astrology, the chakra system, and quantum physics into a unique blueprint for living authentically.
          </p>
        </motion.div>

        <div className="flex flex-wrap gap-2 justify-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-full text-sm transition-all ${
                activeTab === tab.id
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-white/10"
              }`}
              data-testid={`tab-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "chart" && (
            <HumanDesignChartTab
              phase={phase}
              hdProfile={hdProfile}
              chosenType={chosenType}
              calculatingChart={calculatingChart}
              birthYear={birthYear}
              birthMonth={birthMonth}
              birthDay={birthDay}
              birthTime={birthTime}
              birthCity={birthCity}
              birthCountry={birthCountry}
              years={years}
              months={months}
              days={days}
              setBirthYear={setBirthYear}
              setBirthMonth={setBirthMonth}
              setBirthDay={setBirthDay}
              setBirthTime={setBirthTime}
              setBirthCity={setBirthCity}
              setBirthCountry={setBirthCountry}
              handleCalcProfile={handleCalcProfile}
              resetChart={resetChart}
              calculatedAuthority={calculatedAuthority}
              definedCenterCount={definedCenterCount}
              navigate={navigate}
            />
          )}

          {activeTab === "types" && (
            <motion.div key="types" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <p className="text-center text-muted-foreground max-w-2xl mx-auto">
                There are five energy types in Human Design, each with a unique aura, strategy,
                and way of interacting with the world. Understanding your type is the foundation
                of living your design.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {humanDesignTypes.map((type, index) => {
                  const Icon = type.icon;
                  const colorClasses = getTypeColor(type.color);
                  return (
                    <motion.div
                      key={type.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setSelectedType(type)}
                      className={`cursor-pointer p-6 rounded-2xl bg-gradient-to-br ${colorClasses.split(" ").slice(0, 2).join(" ")} border ${colorClasses.split(" ")[2]} hover:scale-[1.02] transition-all`}
                      data-testid={`type-${type.id}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <Icon className={`w-10 h-10 ${colorClasses.split(" ")[3]}`} />
                        <span className="text-xs text-muted-foreground">{type.population}</span>
                      </div>
                      <h3 className="font-serif text-xl mb-1">{type.name}</h3>
                      <p className={`text-sm ${colorClasses.split(" ")[3]} mb-2`}>Strategy: {type.strategy}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{type.description}</p>
                      <div className="mt-4 flex items-center gap-1 text-sm opacity-70">
                        <ChevronRight className="w-4 h-4" />
                        <span>Learn More</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === "centers" && (
            <motion.div key="centers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <p className="text-center text-muted-foreground max-w-2xl mx-auto">
                The nine centers in your BodyGraph represent different aspects of your being.
                Centers can be defined (colored, consistent energy) or undefined (white, amplifying others&apos; energy).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {centers.map((center, index) => (
                  <motion.div
                    key={center.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedCenter(center)}
                    className="cursor-pointer p-5 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-all"
                    data-testid={`center-${center.name.toLowerCase().replace(" ", "-")}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-8 h-8 rounded-full bg-${center.color}-500/30 border border-${center.color}-500/50`} />
                      <h4 className="font-serif text-lg">{center.name}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{center.theme}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "gates" && (
            <motion.div key="gates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                <h3 className="font-serif text-xl mb-3">The 64 Gates</h3>
                <p className="text-muted-foreground">
                  Based on the 64 hexagrams of the I Ching, the gates represent specific energies
                  and themes in your design. When two gates connect across centers, they form a channel.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {keyGates.map((gate, index) => (
                  <motion.div
                    key={gate.number}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                    data-testid={`gate-${gate.number}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-sm font-mono text-indigo-300">
                        {gate.number}
                      </span>
                      <span className="font-medium">{gate.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{gate.theme}</p>
                    <p className="text-xs text-indigo-400 mt-1">{gate.center} Center</p>
                  </motion.div>
                ))}
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Showing key gates. Your complete chart reveals which of the 64 gates are activated in your design.
              </p>
            </motion.div>
          )}

          {activeTab === "experiment" && (
            <motion.div key="experiment" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 max-w-3xl mx-auto">
              <div className="p-8 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                <Target className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                <h3 className="text-2xl font-serif mb-4">Your Human Design Experiment</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Human Design is not a belief system. It&apos;s an experiment. You&apos;re invited to test it
                  in your own life and see if it works for you. The only way to know is to try.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-serif text-lg">How to Begin Your Experiment</h4>
                <ol className="space-y-4">
                  {[
                    "Get your free chart from a Human Design site using your birth date, time, and location.",
                    "Learn your Type and Strategy. This is the foundation of your experiment.",
                    "Observe your not-self theme (frustration, bitterness, anger, disappointment). Notice when it arises.",
                    "Practice your Strategy for at least 3 months before expecting major shifts.",
                    "Learn your Authority - this is how you make correct decisions for yourself.",
                    "Don't try to change everything at once. Small experiments lead to big realizations.",
                    "Be patient. Deconditioning takes approximately 7 years - the time for all cells to regenerate.",
                  ].map((step, index) => (
                    <li key={stableHumanDesignKey("experiment-step", step)} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs text-indigo-300 flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <h4 className="font-medium mb-3">The Ra Uru Hu Quote</h4>
                <p className="text-lg font-serif italic text-foreground/80">
                  &ldquo;Love yourself. You are a unique being. There is no one like you.
                  You are here to live out your own life, not anyone else&apos;s.&rdquo;
                </p>
                <p className="text-sm text-muted-foreground mt-2">— Ra Uru Hu, founder of Human Design</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                  <h5 className="font-medium mb-2">Strategy & Authority</h5>
                  <p className="text-sm text-muted-foreground">
                    Your Strategy tells you how to navigate life correctly. Your Authority tells you
                    how to make decisions. Together, they are your roadmap to living authentically.
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                  <h5 className="font-medium mb-2">The Not-Self</h5>
                  <p className="text-sm text-muted-foreground">
                    The not-self is who you become when you&apos;re not living your design. Recognizing
                    your not-self theme is the first step toward returning to your authentic self.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <HumanDesignModals
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedCenter={selectedCenter}
        setSelectedCenter={setSelectedCenter}
      />
    </div>
  );
};

export default HumanDesign;
