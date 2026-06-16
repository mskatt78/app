import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Target } from "lucide-react";
import { HumanDesignChartTab } from "../../components/human-design/HumanDesignChartTab";
import { centers, getTypeColor, humanDesignTypes, keyGates, stableHumanDesignKey } from "../../components/human-design/humanDesignData";

export const HumanDesignTabContent = ({
  activeTab,
  phase,
  hdProfile,
  chosenType,
  calculatingChart,
  birthYear,
  birthMonth,
  birthDay,
  birthTime,
  birthCity,
  birthCountry,
  years,
  months,
  days,
  setBirthYear,
  setBirthMonth,
  setBirthDay,
  setBirthTime,
  setBirthCity,
  setBirthCountry,
  handleCalcProfile,
  resetChart,
  calculatedAuthority,
  definedCenterCount,
  navigate,
  setSelectedType,
  setSelectedCenter,
}) => {
  return (
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
        </motion.div>
      )}
    </AnimatePresence>
  );
};
