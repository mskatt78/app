import { GripVertical, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";

export const RitualBuilderCreateView = ({
  newRitual,
  totalDuration,
  addingPractice,
  selectedType,
  selectedPractice,
  practiceDuration,
  practices,
  practiceIcons,
  setCreating,
  setNewRitual,
  setAddingPractice,
  setSelectedType,
  setSelectedPractice,
  setPracticeDuration,
  addPracticeToRitual,
  removePractice,
  saveRitual,
}) => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6" data-testid="ritual-builder-creating-view">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif">Create New Ritual</h1>
        <Button variant="ghost" onClick={() => setCreating(false)} data-testid="cancel-create-ritual-btn">
          Cancel
        </Button>
      </div>

      <div className="p-6 rounded-2xl bg-card/50 border border-white/10 space-y-4">
        <Input
          placeholder="Ritual name"
          value={newRitual.name}
          onChange={(event) => setNewRitual((prev) => ({ ...prev, name: event.target.value }))}
          data-testid="ritual-name-input"
        />
        <Textarea
          placeholder="Describe your ritual intention..."
          value={newRitual.description}
          onChange={(event) => setNewRitual((prev) => ({ ...prev, description: event.target.value }))}
          rows={3}
          data-testid="ritual-description-input"
        />

        <div className="p-4 rounded-xl bg-background/50 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Practices ({newRitual.practices.length})</h3>
            <Button size="sm" variant="outline" onClick={() => setAddingPractice(!addingPractice)} data-testid="add-practice-toggle">
              <Plus className="w-3 h-3 mr-1" /> Add Practice
            </Button>
          </div>

          {addingPractice && (
            <div className="space-y-3 p-3 rounded-lg bg-card border border-white/10 mb-3" data-testid="ritual-add-practice-panel">
              <div className="grid grid-cols-3 gap-2">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger data-testid="practice-type-select"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yoga">Yoga</SelectItem>
                    <SelectItem value="breathwork">Breathwork</SelectItem>
                    <SelectItem value="mantra">Mantra</SelectItem>
                    <SelectItem value="mudra">Mudra</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedPractice || ""} onValueChange={setSelectedPractice}>
                  <SelectTrigger data-testid="practice-select"><SelectValue placeholder="Select practice" /></SelectTrigger>
                  <SelectContent>
                    {practices[selectedType].map((practice) => (
                      <SelectItem key={practice.id} value={practice.id}>{practice.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  min="1"
                  max="120"
                  value={practiceDuration}
                  onChange={(event) => setPracticeDuration(parseInt(event.target.value, 10) || 5)}
                  placeholder="Minutes"
                  data-testid="practice-duration-input"
                />
              </div>
              <Button size="sm" onClick={addPracticeToRitual} data-testid="confirm-add-practice">Add</Button>
            </div>
          )}

          <div className="space-y-2" data-testid="ritual-practice-list">
            {newRitual.practices.map((practice, index) => {
              const Icon = practiceIcons[practice.type];
              return (
                <div key={`${practice.id}-${index}`} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-white/10">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <Icon className="w-4 h-4 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{practice.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{practice.type} • {practice.duration} min</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => removePractice(index)} data-testid={`remove-practice-${index}`}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Duration</span>
            <span className="font-medium">{totalDuration} minutes</span>
          </div>
        </div>

        <Button onClick={saveRitual} className="w-full bg-primary" data-testid="save-ritual-btn">
          <Save className="w-4 h-4 mr-2" /> Save Ritual
        </Button>
      </div>
    </div>
  );
};
