import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { LightCodeModal } from "./LightCodeModal";
import { modalTabs } from "./lightCodeConfig";
import { LightCodesCategoryInsights } from "./LightCodesCategoryInsights";
import { LightCodesFilters } from "./LightCodesFilters";
import { LightCodesHeader } from "./LightCodesHeader";
import { LightCodesHero } from "./LightCodesHero";
import { LightCodesLinguisticFoundations } from "./LightCodesLinguisticFoundations";
import { LightCodesSymbolsGrid } from "./LightCodesSymbolsGrid";
import { useLightCodesData } from "./useLightCodesData";

const LightCodesContainer = ({ api }) => {
  const navigate = useNavigate();
  const {
    lightCodes,
    loading,
    activeCategory,
    selectedSymbol,
    modalTab,
    activeCategoryInfo,
    currentSymbols,
    contentRef,
    setSelectedSymbol,
    setModalTab,
    selectCategory,
    openSymbol,
  } = useLightCodesData(api);

  return (
    <div className="min-h-screen bg-background" data-testid="light-codes">
      <LightCodesHeader
        navigate={navigate}
        currentSymbolsCount={currentSymbols.length}
        activeCategoryName={activeCategoryInfo?.name}
      />

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        <LightCodesHero activeCategoryInfo={activeCategoryInfo} />
        <LightCodesFilters activeCategory={activeCategory} selectCategory={selectCategory} />
        <LightCodesCategoryInsights activeCategoryInfo={activeCategoryInfo} contentRef={contentRef} />
        <LightCodesLinguisticFoundations lightCodes={lightCodes} />
        <LightCodesSymbolsGrid
          loading={loading}
          currentSymbols={currentSymbols}
          activeCategoryInfo={activeCategoryInfo}
          openSymbol={openSymbol}
        />

        <div className="p-8 rounded-[2rem] bg-gradient-to-br from-white/5 to-transparent border border-white/10 text-center" data-testid="light-codes-wisdom-quote">
          <Sparkles className="w-10 h-10 mx-auto mb-4 text-primary/50" />
          <blockquote className="text-lg font-serif italic text-foreground/80 max-w-3xl mx-auto leading-relaxed">
            “Sacred symbols are not ornaments for belief. They are instruments for attention — ways the soul remembers pattern, proportion, lineage, and light.”
          </blockquote>
        </div>
      </main>

      <LightCodeModal
        selectedSymbol={selectedSymbol}
        activeCategoryInfo={activeCategoryInfo}
        modalTabs={modalTabs}
        modalTab={modalTab}
        setModalTab={setModalTab}
        onClose={() => setSelectedSymbol(null)}
      />
    </div>
  );
};

export default LightCodesContainer;
