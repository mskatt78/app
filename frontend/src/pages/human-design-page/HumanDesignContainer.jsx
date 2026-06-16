import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Hexagon } from "lucide-react";
import { toast } from "sonner";
import { HumanDesignModals } from "../../components/human-design/HumanDesignModals";
import { humanDesignTypes } from "../../components/human-design/humanDesignData";
import { HumanDesignTabContent } from "./HumanDesignTabContent";
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

        <HumanDesignTabContent
          activeTab={activeTab}
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
          setSelectedType={setSelectedType}
          setSelectedCenter={setSelectedCenter}
        />
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
