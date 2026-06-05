import { Music, PenLine } from "lucide-react";

export const MantrasTabs = ({ activeTab, setActiveTab, userMantrasCount }) => {
  return (
    <div className="flex gap-4 mb-6" data-testid="mantras-tabs">
      <button
        onClick={() => setActiveTab("library")}
        className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-all ${
          activeTab === "library"
            ? "bg-primary/20 text-primary border border-primary/30"
            : "bg-card/50 text-muted-foreground border border-white/5 hover:border-white/10"
        }`}
        data-testid="tab-library"
      >
        <Music className="w-4 h-4" />
        Sacred Library
      </button>
      <button
        onClick={() => setActiveTab("custom")}
        className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-all ${
          activeTab === "custom"
            ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
            : "bg-card/50 text-muted-foreground border border-white/5 hover:border-white/10"
        }`}
        data-testid="tab-custom"
      >
        <PenLine className="w-4 h-4" />
        My Mantras
        {userMantrasCount > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-xs">
            {userMantrasCount}
          </span>
        )}
      </button>
    </div>
  );
};
