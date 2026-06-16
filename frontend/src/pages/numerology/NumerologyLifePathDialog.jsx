import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { getNumerologyElementColors } from "./numerologyConfig";

export const NumerologyLifePathDialog = ({ selectedLifePath, setSelectedLifePath }) => {
  const selectedPathColors = getNumerologyElementColors(selectedLifePath?.element);

  return (
    <Dialog open={!!selectedLifePath} onOpenChange={() => setSelectedLifePath(null)}>
      <DialogContent className="bg-card border-white/10 max-w-lg" data-testid="numerology-life-path-dialog">
        {selectedLifePath && (
          <>
            <DialogHeader>
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-2 w-fit ${selectedPathColors.bg} ${selectedPathColors.text}`}
                data-testid="numerology-life-path-dialog-badge"
              >
                Life Path {selectedLifePath.number}
              </div>
              <DialogTitle className="text-2xl font-serif" data-testid="numerology-life-path-dialog-title">{selectedLifePath.name}</DialogTitle>
              <DialogDescription className="sr-only" data-testid="numerology-life-path-dialog-description">
                Detailed life path numerology traits, crystal association, element, and mantra guidance.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <p className="text-muted-foreground leading-relaxed">{selectedLifePath.description}</p>

              <div className="flex flex-wrap gap-2" data-testid="numerology-life-path-dialog-traits">
                {selectedLifePath.traits?.map((trait) => (
                  <span key={trait} className="px-3 py-1 rounded-full bg-white/5 text-sm">{trait}</span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white/5">
                <div>
                  <p className="text-xs text-muted-foreground">Crystal</p>
                  <p className="font-medium">{selectedLifePath.crystal}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Element</p>
                  <p className="font-medium">{selectedLifePath.element}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-sm italic text-muted-foreground">&quot;{selectedLifePath.mantra}&quot;</p>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
