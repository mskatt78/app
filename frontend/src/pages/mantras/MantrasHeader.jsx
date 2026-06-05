import { ArrowLeft, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

export const MantrasHeader = ({ navigate, selectedElement, setSelectedElement, elements }) => {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5" data-testid="mantras-header">
      <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            data-testid="back-btn"
            onClick={() => navigate("/dashboard")}
            className="p-2 rounded-full hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Sacred Sounds</p>
            <h1 className="text-xl font-serif">Mantras <span className="italic text-primary">Library</span></h1>
          </div>
        </div>

        <Select value={selectedElement} onValueChange={setSelectedElement}>
          <SelectTrigger data-testid="element-filter" className="w-40 bg-card border-white/10">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            {elements.map((el) => (
              <SelectItem key={el} value={el}>
                {el === "all" ? "All Elements" : el}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </header>
  );
};
