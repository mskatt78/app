import { Check, ChevronDown, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { formatRitualTime, getStepContainerClass } from "./ritualBuilderConstants";

export const RitualBuilderActiveView = ({
  activeRitual,
  currentStep,
  stepProgress,
  elapsedTime,
  isPlaying,
  practiceIcons,
  setIsPlaying,
  startRitual,
  setActiveRitual,
}) => {
  const currentPractice = activeRitual?.practices?.[currentStep];
  const progressPercent = activeRitual?.practices?.length
    ? ((currentStep + stepProgress / 100) / activeRitual.practices.length) * 100
    : 0;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6" data-testid="active-ritual-view">
      <div className="text-center">
        <h1 className="text-3xl font-serif mb-2">{activeRitual?.name}</h1>
        <p className="text-muted-foreground">Step {currentStep + 1} of {activeRitual?.practices?.length}</p>
      </div>

      <div className="p-6 rounded-2xl bg-card/50 border border-white/10 space-y-4">
        <Progress value={progressPercent} className="h-2" data-testid="active-ritual-overall-progress" />
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Current Practice</p>
          <h2 className="text-2xl font-serif">{currentPractice?.name}</h2>
          <p className="text-sm text-muted-foreground capitalize">{currentPractice?.type} • {currentPractice?.duration} minutes</p>
        </div>

        <Progress value={stepProgress} className="h-1" data-testid="active-ritual-step-progress" />

        <div className="text-center text-sm text-muted-foreground" data-testid="active-ritual-elapsed-time">
          Elapsed: {formatRitualTime(elapsedTime)}
        </div>

        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => setIsPlaying(!isPlaying)} data-testid="toggle-ritual-playback-btn">
            {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isPlaying ? "Pause" : "Play"}
          </Button>
          <Button variant="outline" onClick={() => startRitual(activeRitual)} data-testid="reset-ritual-btn">
            <RotateCcw className="w-4 h-4 mr-2" /> Reset
          </Button>
          <Button variant="ghost" onClick={() => setActiveRitual(null)} data-testid="exit-ritual-btn">Exit</Button>
        </div>
      </div>

      <div className="space-y-2" data-testid="active-ritual-steps-list">
        {activeRitual?.practices?.map((practice, index) => {
          const isActive = index === currentStep;
          const isComplete = index < currentStep;
          const Icon = practiceIcons[practice.type];

          return (
            <div key={`${practice.id}-${index}`} className={`p-3 rounded-lg ${getStepContainerClass(isActive, isComplete)}`} data-testid={`ritual-step-${index}`}>
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span className="flex-1 text-sm">{practice.name}</span>
                {isComplete && <Check className="w-4 h-4 text-emerald-400" />}
                {isActive && <ChevronDown className="w-4 h-4 text-primary" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
