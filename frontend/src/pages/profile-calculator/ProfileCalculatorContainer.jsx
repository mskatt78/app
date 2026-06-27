import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Dna, Hexagon, Calendar, Clock, MapPin, 
  Sparkles, Star, Sun, Moon, ChevronRight, Download, Share2
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { ShareButton } from "../../components/ShareModal";
import { toast } from "sonner";
import { calculateHumanDesignChart } from "../../utils/humanDesignCalculator";
import { appLogger } from "../../utils/logger";

import {
  GENE_KEYS_DATA,
  HUMAN_DESIGN_TYPES,
  PROFILE_LINE_NAMES,
} from "./profileCalculatorData";

const ProfileCalculator = ({ user, api }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("genekeys");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [geneKeysProfile, setGeneKeysProfile] = useState(null);
  const [humanDesignProfile, setHumanDesignProfile] = useState(null);
  const [calculating, setCalculating] = useState(false);

  const calculateProfile = async () => {
    if (!birthDate || !birthTime || !birthPlace) {
      toast.error("Please enter birth date, exact birth time, and birth place (City, Country)");
      return;
    }

    const [birthCity, ...countryParts] = birthPlace.split(",").map((part) => part.trim()).filter(Boolean);
    const birthCountry = countryParts.join(", ");
    if (!birthCity || !birthCountry) {
      toast.error("Use Birth Place format: City, Country");
      return;
    }

    setCalculating(true);

    try {
      const strictChart = await calculateHumanDesignChart(api, {
        birth_date: birthDate,
        birth_time: birthTime,
        birth_city: birthCity,
        birth_country: birthCountry,
      });

      setGeneKeysProfile(strictChart.geneKeysProfile || null);

      const typeKeyMap = {
        "manifesting-generator": "manifestingGenerator",
        manifestor: "manifestor",
        generator: "generator",
        projector: "projector",
        reflector: "reflector",
      };

      const normalizedTypeKey = typeKeyMap[strictChart.typeKey] || "projector";
      const [consciousLine, unconsciousLine] = strictChart.profile.split("/").map((part) => Number(part));

      const hdProfile = {
        type: HUMAN_DESIGN_TYPES[normalizedTypeKey],
        typeKey: normalizedTypeKey,
        authority: strictChart.authority,
        incarnationCross: strictChart.incarnationCross,
        variables: strictChart.variables,
        audit: strictChart.audit,
        profile: {
          conscious: consciousLine,
          unconscious: unconsciousLine,
          name: strictChart.profile,
          fullName: `${PROFILE_LINE_NAMES[consciousLine]}/${PROFILE_LINE_NAMES[unconsciousLine]}`,
        },
        birthData: { date: birthDate, time: birthTime, place: birthPlace }
      };
      setHumanDesignProfile(hdProfile);

      toast.success("Profile calculated from exact birth data.");
    } catch (error) {
      appLogger.error("Profile calculation failed:", error);
      toast.error(error?.response?.data?.detail || "Could not calculate profile from birth data.");
    } finally {
      setCalculating(false);
    }
  };

  const tabs = [
    { id: "genekeys", label: "Gene Keys Profile", icon: Dna },
    { id: "humandesign", label: "Human Design", icon: Hexagon }
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="profile-calculator">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center gap-4">
          <button onClick={() => navigate("/menu")} className="p-2 rounded-full hover:bg-white/5">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Discover Your</p>
            <h1 className="text-xl font-serif">Profile <span className="italic text-primary">Calculator</span></h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8 rounded-2xl bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-indigo-500/10 border border-violet-500/20"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-500/20 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-violet-400" />
          </div>
          <h2 className="text-2xl font-serif mb-2">Discover Your Unique Blueprint</h2>
          <p className="text-muted-foreground max-w-lg mx-auto px-4">
            Enter your birth details to calculate your personal Gene Keys Activation Sequence 
            and Human Design type.
          </p>
        </motion.div>

        {/* Birth Data Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4"
        >
          <h3 className="font-serif text-lg">Birth Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                <Calendar className="w-4 h-4 inline mr-1" />
                Birth Date *
              </label>
              <Input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="bg-white/5 border-white/10"
                required
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                <Clock className="w-4 h-4 inline mr-1" />
                Birth Time *
              </label>
              <Input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="bg-white/5 border-white/10"
                placeholder="HH:MM"
                data-testid="profile-birth-time"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                <MapPin className="w-4 h-4 inline mr-1" />
                Birth Place *
              </label>
              <Input
                type="text"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                className="bg-white/5 border-white/10"
                placeholder="City, Country"
                data-testid="profile-birth-place"
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Strict mode: date, exact birth time, and place are required for calculation-based Human Design outputs.
          </p>

          <Button 
            onClick={calculateProfile}
            disabled={calculating || !birthDate || !birthTime || !birthPlace}
            className="w-full bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30"
          >
            {calculating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Calculating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Calculate My Profile
              </>
            )}
          </Button>
        </motion.div>

        {/* Results */}
        {(geneKeysProfile || humanDesignProfile) && (
          <>
            {/* Tabs */}
            <div className="flex gap-2 justify-center">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-5 py-2 rounded-full text-sm flex items-center gap-2 transition-all ${
                      activeTab === tab.id
                        ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                        : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "genekeys" && geneKeysProfile && (
                <motion.div
                  key="genekeys"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-serif">Your Activation Sequence</h3>
                    <ShareButton 
                      title="My Gene Keys Profile"
                      description={`Life's Work: Gene Key ${geneKeysProfile.lifesWork.gate} - ${GENE_KEYS_DATA[geneKeysProfile.lifesWork.gate]?.gift}`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(geneKeysProfile).map(([key, sphere], index) => {
                      if (!sphere?.gate) return null;
                      const geneKey = GENE_KEYS_DATA[sphere.gate];
                      const colors = {
                        lifesWork: "from-amber-500/10 to-orange-500/5 border-amber-500/20",
                        evolution: "from-emerald-500/10 to-green-500/5 border-emerald-500/20",
                        radiance: "from-rose-500/10 to-pink-500/5 border-rose-500/20",
                        purpose: "from-violet-500/10 to-purple-500/5 border-violet-500/20"
                      };
                      
                      return (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-5 rounded-2xl bg-gradient-to-br ${colors[key]} border`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider">{sphere.sphere}</p>
                              <p className="text-sm text-muted-foreground/70">{sphere.planet}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-serif">{sphere.gate}.{sphere.line}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mt-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-red-400">Shadow:</span>
                              <span>{geneKey?.shadow}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-amber-400">Gift:</span>
                              <span>{geneKey?.gift}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-violet-400">Siddhi:</span>
                              <span>{geneKey?.siddhi}</span>
                            </div>
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-3 italic">{sphere.description}</p>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                    <p className="text-sm text-muted-foreground">
                      This is your Activation Sequence - the foundation of your Golden Path. 
                      Contemplate each Gene Key to unlock your genius.
                    </p>
                    <Button 
                      variant="link" 
                      onClick={() => navigate("/gene-keys")}
                      className="mt-2"
                    >
                      Explore All 64 Gene Keys <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {activeTab === "humandesign" && humanDesignProfile && (
                <motion.div
                  key="humandesign"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-serif">Your Human Design</h3>
                    <ShareButton 
                      title="My Human Design Type"
                      description={`I'm a ${humanDesignProfile.type.name}! Strategy: ${humanDesignProfile.type.strategy}`}
                    />
                  </div>

                  {/* Type Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-violet-500/10 border border-indigo-500/20 text-center"
                  >
                    <Hexagon className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                    <h2 className="text-3xl font-serif mb-2">{humanDesignProfile.type.name}</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">{humanDesignProfile.type.description}</p>
                  </motion.div>

                  {/* Key Information */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
                      <p className="text-xs text-green-400 uppercase tracking-wider mb-1">Strategy</p>
                      <p className="font-medium text-sm">{humanDesignProfile.type.strategy}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                      <p className="text-xs text-amber-400 uppercase tracking-wider mb-1">Signature</p>
                      <p className="font-medium text-sm">{humanDesignProfile.type.signature}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                      <p className="text-xs text-red-400 uppercase tracking-wider mb-1">Not-Self</p>
                      <p className="font-medium text-sm">{humanDesignProfile.type.notSelf}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 text-center">
                      <p className="text-xs text-violet-400 uppercase tracking-wider mb-1">Profile</p>
                      <p className="font-medium text-sm">{humanDesignProfile.profile.fullName}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-center">
                      <p className="text-xs text-sky-400 uppercase tracking-wider mb-1">Authority</p>
                      <p className="font-medium text-sm">{humanDesignProfile.authority}</p>
                    </div>
                  </div>

                  {/* Profile Lines */}
                  <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                    <h4 className="font-medium mb-3">Your Profile: {humanDesignProfile.profile.name}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-white/5">
                        <p className="text-xs text-muted-foreground">Conscious (Personality)</p>
                        <p className="text-lg font-serif">Line {humanDesignProfile.profile.conscious}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5">
                        <p className="text-xs text-muted-foreground">Unconscious (Design)</p>
                        <p className="text-lg font-serif">Line {humanDesignProfile.profile.unconscious}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <p className="text-sm text-muted-foreground">
                      <strong>Calculation mode:</strong> This result is generated from your entered birth date, exact time, and place (not intuitive type selection).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20" data-testid="profile-hd-accuracy-panel">
                    <p className="text-xs uppercase tracking-wider text-violet-300 mb-2">Precision Details</p>
                    <p className="text-sm mb-1" data-testid="profile-hd-incarnation-cross"><strong>Incarnation Cross:</strong> {humanDesignProfile.incarnationCross?.name || "—"}</p>
                    <p className="text-sm text-muted-foreground" data-testid="profile-hd-variables">
                      Digestion: {humanDesignProfile.variables?.digestion || "—"} · Environment: {humanDesignProfile.variables?.environment || "—"} · Perspective: {humanDesignProfile.variables?.perspective || "—"} · Motivation: {humanDesignProfile.variables?.motivation || "—"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2" data-testid="profile-hd-audit-timezone">
                      Timezone used: {humanDesignProfile.audit?.timezone_name || "—"}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                    <Button 
                      variant="link" 
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        navigate("/human-design", {
                          state: {
                            fromProfileCalculator: true,
                          },
                        });
                      }}
                      className="mt-2"
                      data-testid="profile-to-human-design-link-btn"
                    >
                      Learn More About Human Design <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </main>
    </div>
  );
};

export default ProfileCalculator;
