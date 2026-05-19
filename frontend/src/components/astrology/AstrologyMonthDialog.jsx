import { Leaf, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

export const AstrologyMonthDialog = ({
  selectedMonth,
  onClose,
  elementColors,
  hemisphere,
  setHemisphere,
  getDescription,
}) => (
  <Dialog open={!!selectedMonth} onOpenChange={onClose}>
    <DialogContent className="bg-card border-white/10 max-w-lg max-h-[80vh] overflow-y-auto" data-testid="astrology-month-dialog">
      {selectedMonth && (
        <>
          <DialogHeader>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-2 w-fit ${elementColors[selectedMonth.element]?.bg} ${elementColors[selectedMonth.element]?.text}`}>
              {selectedMonth.element} • {selectedMonth.symbol}
            </div>
            <DialogTitle className="text-3xl font-serif">{selectedMonth.month_number}. {selectedMonth.name}</DialogTitle>
            <p className="text-muted-foreground">{selectedMonth.dates}</p>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-sm text-muted-foreground">Your Hemisphere</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHemisphere("north")}
                  className={hemisphere === "north" ? "bg-primary/20 text-primary" : "text-muted-foreground"}
                  data-testid="dialog-hemi-north"
                >
                  Northern
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHemisphere("south")}
                  className={hemisphere === "south" ? "bg-primary/20 text-primary" : "text-muted-foreground"}
                  data-testid="dialog-hemi-south"
                >
                  Southern
                </Button>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">{getDescription(selectedMonth)}</p>

            <div>
              <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Themes</h4>
              <div className="flex flex-wrap gap-2">
                {selectedMonth.themes?.map((theme) => (
                  <span key={theme} className="px-3 py-1 rounded-full bg-white/5 text-sm" data-testid={`dialog-theme-${theme.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
                    {theme}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Crystals
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedMonth.crystals?.map((crystal) => (
                  <span key={crystal} className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-sm" data-testid={`dialog-crystal-${crystal.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
                    {crystal}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <Leaf className="w-4 h-4" /> Practices
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedMonth.practices?.map((practice) => (
                  <span key={practice} className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm" data-testid={`dialog-practice-${practice.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
                    {practice}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </DialogContent>
  </Dialog>
);
