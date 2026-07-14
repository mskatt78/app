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

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6" data-testid="ancient-wisdom-global-depth-panels">
          <article className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5" data-testid="ancient-wisdom-global-why-this-heals">
            <p className="text-xs uppercase tracking-wider text-emerald-300 mb-2">Why this heals</p>
            <p className="text-sm text-emerald-100/85 leading-relaxed">
              Ancient teachings heal when they are embodied, not only studied — pairing ritual intelligence with real nervous-system regulation.
            </p>
          </article>

          <article className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5" data-testid="ancient-wisdom-global-integration-guide">
            <p className="text-xs uppercase tracking-wider text-violet-300 mb-2">Integration guide</p>
            <p className="text-sm text-violet-100/85 leading-relaxed">
              Open any tradition card to access full embodiment depth: ritual arc, guided phases, master protocol, and practical next-step integration.
            </p>
          </article>
        </section>

        <AncientWisdomGrid entries={filteredEntries} setSelected={setSelected} />
      </main>
      <AncientWisdomDetailModal selected={selected} setSelected={setSelected} api={api} />
    </div>
  );
};

export default AncientWisdom;
