import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export const BreathworkSoundSelector = ({ selectedSound, setSelectedSound, options, soundEnabled }) => {
  return (
    <div className="w-full max-w-sm rounded-xl border border-white/10 bg-white/5 p-3" data-testid="breathwork-sound-selector">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">Soundscape</span>
        <span className="text-xs text-primary">{options.find((option) => option.id === selectedSound)?.label || "Silence"}</span>
      </div>
      <Select value={selectedSound} onValueChange={setSelectedSound}>
        <SelectTrigger className="bg-card/50 border-white/10" data-testid="breathwork-sound-select">
          <SelectValue placeholder="Select sound" />
        </SelectTrigger>
        <SelectContent className="max-h-56 overflow-y-auto">
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id} data-testid={`breathwork-sound-option-${option.id}`}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground mt-2">
        {soundEnabled ? "Sound enabled" : "Sound muted"} • choose a distinct ambience for your breath cycle.
      </p>
    </div>
  );
};
