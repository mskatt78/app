import { useNavigate } from "react-router-dom";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "../../components/ui/button";
import { LightCodeModal } from "./LightCodeModal";
import { modalTabs } from "./lightCodeConfig";
import { LightCodesCategoryInsights } from "./LightCodesCategoryInsights";
import { LightCodesFilters } from "./LightCodesFilters";
import { LightCodesHeader } from "./LightCodesHeader";
import { LightCodesHero } from "./LightCodesHero";
import { LightCodesLinguisticFoundations } from "./LightCodesLinguisticFoundations";
import { LightCodesSymbolRitualSection } from "./LightCodesSymbolRitualSection";
import { LightCodesSymbolsGrid } from "./LightCodesSymbolsGrid";
import { useLightCodesData } from "./useLightCodesData";

const LightCodesContainer = ({ user, api }) => {
  const navigate = useNavigate();
  const {
    lightCodes,
    loading,
    activeCategory,
    selectedSymbol,
    selectedLockedSymbol,
    modalTab,
    activeCategoryInfo,
    currentSymbols,
    lightCodesUnlocked,
    premium,
    contentRef,
    setSelectedSymbol,
    setSelectedLockedSymbol,
    setModalTab,
    selectCategory,
    openSymbol,
  } = useLightCodesData(api, user);

  const fullAppProduct = premium.findProduct("full_app_unlock");

  const handleUnlockFullApp = async () => {
    await premium.startPurchase({ productId: "full_app_unlock", returnPath: "/light-codes" });
  };

  return (
    <div className="min-h-screen bg-background" data-testid="light-codes">
      <LightCodesHeader
        navigate={navigate}
        currentSymbolsCount={currentSymbols.length}
        activeCategoryName={activeCategoryInfo?.name}
      />

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {!lightCodesUnlocked && (
          <section className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4" data-testid="light-codes-premium-banner">
            <div className="flex items-center gap-2 text-amber-100">
              <Lock className="w-4 h-4" />
              <p className="text-xs uppercase tracking-wider">Light Codes Tiering Active</p>
            </div>
            <p className="text-sm text-white/75 mt-1" data-testid="light-codes-premium-banner-text">
              Each Light Code stream holds 4 free + 10 premium symbolic practices, including the Encoded Frequency collection. Unlock premium symbols through Sacred Access membership.
            </p>
            {activeCategory === "sacred_geometry" && (
              <p className="text-xs text-emerald-100/90 mt-2" data-testid="light-codes-geometry-accuracy-note">
                Sacred Geometry mode is active: Platonic solids and core forms now prioritize geometry-accurate visual structures.
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => navigate("/pricing")} data-testid="light-codes-premium-banner-pricing-button">Sacred Access</Button>
            </div>
          </section>
        )}

        <LightCodesHero activeCategoryInfo={activeCategoryInfo} />
        <LightCodesFilters activeCategory={activeCategory} selectCategory={selectCategory} />
        <LightCodesCategoryInsights activeCategoryInfo={activeCategoryInfo} contentRef={contentRef} />
        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-black/20 p-6" data-testid="light-codes-depth-framework">
          <p className="text-xs uppercase tracking-[0.24em] text-white/45 mb-3">Temple depth framework</p>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4" data-testid="light-codes-depth-framework-symbol">
              <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/80 mb-2">1 · Symbolic intelligence</p>
              <p className="text-sm text-white/75 leading-relaxed">Interpret each form as living grammar: pattern, polarity, proportion, and archetypal function.</p>
            </div>
            <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-4" data-testid="light-codes-depth-framework-ritual">
              <p className="text-[11px] uppercase tracking-[0.18em] text-violet-100/80 mb-2">2 · Ritual embodiment</p>
              <p className="text-sm text-white/75 leading-relaxed">Use ceremonial pacing, breath rhythm, and somatic tracking so activation remains safe and coherent.</p>
            </div>
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4" data-testid="light-codes-depth-framework-integration">
              <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-100/80 mb-2">3 · Integration action</p>
              <p className="text-sm text-white/75 leading-relaxed">Close every symbolic practice with one practical integration action in relationship, work, creativity, or daily life.</p>
            </div>
          </div>
        </section>
        <LightCodesSymbolRitualSection currentSymbols={currentSymbols} activeCategoryInfo={activeCategoryInfo} openSymbol={openSymbol} />
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

      {selectedLockedSymbol && !lightCodesUnlocked && (
        <div className="fixed inset-0 z-[220] bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center" data-testid="light-codes-premium-lock-modal">
          <div className="w-full max-w-lg rounded-2xl border border-fuchsia-500/30 bg-[#130f1f] p-6">
            <div className="flex items-center gap-2 text-fuchsia-200 mb-2"><Lock className="w-4 h-4" /><p className="text-xs uppercase tracking-wider">Premium Light Code</p></div>
            <h3 className="text-2xl font-serif mb-2" data-testid="light-codes-premium-lock-title">{selectedLockedSymbol.name}</h3>
            <p className="text-sm text-muted-foreground mb-4" data-testid="light-codes-premium-lock-description">This symbolic practice is premium. Continue with Sacred Access membership.</p>
            <div className="grid sm:grid-cols-2 gap-2">
              <Button variant="outline" className="border-cyan-400/40 text-cyan-100 sm:col-span-2" onClick={() => navigate("/pricing")} data-testid="light-codes-premium-lock-subscription-button">Sacred Access</Button>
            </div>
            <Button variant="ghost" className="w-full mt-3" onClick={() => setSelectedLockedSymbol(null)} data-testid="light-codes-premium-lock-close-button">Close</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LightCodesContainer;
