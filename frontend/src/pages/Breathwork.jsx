import { useNavigate } from "react-router-dom";
import { ArrowLeft, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useBreathworkEngine } from "../components/breathwork/useBreathworkEngine";
import { BreathworkActiveSessionView } from "../components/breathwork/BreathworkActiveSessionView";
import { BreathworkSessionGrid } from "../components/breathwork/BreathworkSessionGrid";
import { BREATHWORK_ELEMENTS, ELEMENT_COLORS, PHASE_LABELS } from "../components/breathwork/breathworkConfig";

const Breathwork = ({ api }) => {
  const navigate = useNavigate();
  const engine = useBreathworkEngine({ api });

  return (
    <div className="min-h-screen bg-background" data-testid="breathwork">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              data-testid="back-btn"
              onClick={() => (engine.activeSession ? engine.closeSession() : navigate("/dashboard"))}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Practice</p>
              <h1 className="text-xl font-serif">Breathwork <span className="italic text-primary">Sessions</span></h1>
            </div>
          </div>

          {!engine.activeSession && (
            <Select value={engine.selectedElement} onValueChange={engine.setSelectedElement}>
              <SelectTrigger data-testid="element-filter" className="w-40 bg-card border-white/10">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                {BREATHWORK_ELEMENTS.map((element) => (
                  <SelectItem key={element} value={element}>
                    {element === "all" ? "All Elements" : element}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {engine.activeSession ? (
          <BreathworkActiveSessionView
            activeSession={engine.activeSession}
            isPlaying={engine.isPlaying}
            breathPhase={engine.breathPhase}
            phaseProgress={engine.phaseProgress}
            cycleCount={engine.cycleCount}
            soundEnabled={engine.soundEnabled}
            selectedSound={engine.selectedSound}
            setSelectedSound={engine.setSelectedSound}
            togglePlay={engine.togglePlay}
            resetSession={engine.resetSession}
            toggleSound={engine.toggleSound}
            getBreathCircleSize={engine.getBreathCircleSize}
            phaseLabels={PHASE_LABELS}
            elementColors={ELEMENT_COLORS}
            availableSoundOptions={engine.availableSoundOptions}
          />
        ) : engine.loading ? (
          <div className="flex items-center justify-center h-64" data-testid="breathwork-loading-state">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <BreathworkSessionGrid
            filteredSessions={engine.filteredSessions}
            elementColors={ELEMENT_COLORS}
            startSession={engine.startSession}
          />
        )}
      </main>
    </div>
  );
};

export default Breathwork;
