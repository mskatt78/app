import { useNavigate } from "react-router-dom";
import { TRADITIONS } from "./constants";
import { AncientWisdomDetailModal } from "./AncientWisdomDetailModal";
import { AncientWisdomFilters } from "./AncientWisdomFilters";
import { AncientWisdomGrid } from "./AncientWisdomGrid";
import { AncientWisdomHero } from "./AncientWisdomHero";
import { useAncientWisdomData } from "./useAncientWisdomData";

const AncientWisdom = ({ user, api }) => {
  const navigate = useNavigate();
  const { loading, activeTab, setActiveTab, selected, setSelected, filteredEntries } = useAncientWisdomData(api);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="ancient-wisdom-page">
      <AncientWisdomHero navigate={navigate} />

      <main className="max-w-6xl mx-auto px-6 pb-20 -mt-6">
        <AncientWisdomFilters traditions={TRADITIONS} activeTab={activeTab} setActiveTab={setActiveTab} />
        <AncientWisdomGrid entries={filteredEntries} setSelected={setSelected} />
      </main>
      <AncientWisdomDetailModal selected={selected} setSelected={setSelected} api={api} />
    </div>
  );
};

export default AncientWisdom;
