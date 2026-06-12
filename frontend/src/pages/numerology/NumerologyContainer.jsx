import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { appLogger } from "../../utils/logger";
import { NumerologyHeader } from "./NumerologyHeader";
import { NumerologyHistoryView } from "./NumerologyHistoryView";
import { NumerologyInputView } from "./NumerologyInputView";
import { NumerologyLifePathDialog } from "./NumerologyLifePathDialog";
import { NumerologyReadingResults } from "./NumerologyReadingResults";
import { NUMEROLOGY_DAYS, NUMEROLOGY_MONTHS, getNumerologyYears } from "./numerologyConfig";

const Numerology = ({ user, api }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [fullName, setFullName] = useState("");
  const [reading, setReading] = useState(null);
  const [lifePaths, setLifePaths] = useState({});
  const [pastReadings, setPastReadings] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedLifePath, setSelectedLifePath] = useState(null);

  const years = useMemo(() => getNumerologyYears(), []);
  const birthDate = useMemo(() => {
    if (!birthYear || !birthMonth || !birthDay) {
      return "";
    }

    return `${birthYear}-${birthMonth}-${birthDay}`;
  }, [birthYear, birthMonth, birthDay]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const lifePathsRes = await api.get("/numerology/life-paths");
        setLifePaths(lifePathsRes.data);
      } catch (error) {
        appLogger.error("Failed to fetch numerology life paths", error);
      }

      try {
        const historyRes = await api.get("/numerology/readings");
        setPastReadings(historyRes.data);
      } catch (error) {
        const statusCode = error?.response?.status;
        if (statusCode === 401) {
          setPastReadings([]);
          return;
        }

        appLogger.error("Failed to fetch numerology reading history", error);
      }
    };

    fetchData();
  }, [api]);

  const calculateReading = async () => {
    if (!birthDate) {
      toast.error("Please enter your birth date");
      return;
    }

    setLoading(true);
    try {
      // Always use /calculate - it's public and returns the same data
      const response = await api.post("/numerology/calculate", {
        birth_date: birthDate,
        full_name: fullName || null,
      });
      setReading(response.data);
      toast.success("Your numerology reading is ready!");
    } catch (error) {
      appLogger.error("Failed to calculate numerology reading", error);
      toast.error("Could not calculate reading. Check your birth date format.");
    } finally {
      setLoading(false);
    }
  };

  const resetReading = () => {
    setReading(null);
    setBirthYear("");
    setBirthMonth("");
    setBirthDay("");
    setFullName("");
    setShowHistory(false);
  };

  const renderMainContent = () => {
    if (reading) {
      return <NumerologyReadingResults reading={reading} resetReading={resetReading} />;
    }

    if (showHistory) {
      return <NumerologyHistoryView pastReadings={pastReadings} setReading={setReading} />;
    }

    return (
      <NumerologyInputView
        years={years}
        months={NUMEROLOGY_MONTHS}
        days={NUMEROLOGY_DAYS}
        birthYear={birthYear}
        setBirthYear={setBirthYear}
        birthMonth={birthMonth}
        setBirthMonth={setBirthMonth}
        birthDay={birthDay}
        setBirthDay={setBirthDay}
        fullName={fullName}
        setFullName={setFullName}
        loading={loading}
        calculateReading={calculateReading}
        birthDate={birthDate}
        lifePaths={lifePaths}
        setSelectedLifePath={setSelectedLifePath}
      />
    );
  };

  return (
    <div className="min-h-screen bg-background" data-testid="numerology-page">
      <NumerologyHeader
        reading={reading}
        resetReading={resetReading}
        navigate={navigate}
        showHistory={showHistory}
        setShowHistory={setShowHistory}
      />

      <main className="max-w-4xl mx-auto p-6">
        {renderMainContent()}
      </main>

      <NumerologyLifePathDialog selectedLifePath={selectedLifePath} setSelectedLifePath={setSelectedLifePath} />
    </div>
  );
};

export default Numerology;
