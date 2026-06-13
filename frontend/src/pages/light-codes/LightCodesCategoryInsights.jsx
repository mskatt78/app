export const LightCodesCategoryInsights = ({ activeCategoryInfo, contentRef }) => (
  <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr_1fr]" ref={contentRef}>
    <div className={`rounded-3xl border ${activeCategoryInfo?.border} ${activeCategoryInfo?.bg} p-6`} data-testid="light-codes-category-philosophy">
      <p className="text-xs uppercase tracking-[0.28em] text-white/40 mb-3">Category philosophy</p>
      <h3 className="text-2xl font-serif mb-3">{activeCategoryInfo?.name}</h3>
      <p className="text-sm text-white/75 leading-relaxed">{activeCategoryInfo?.philosophy}</p>
    </div>

    <div className="rounded-3xl border border-white/10 bg-white/5 p-6" data-testid="light-codes-category-lineage">
      <p className="text-xs uppercase tracking-[0.28em] text-white/40 mb-3">Ancient lineage</p>
      <p className="text-sm text-white/75 leading-relaxed">{activeCategoryInfo?.lineage}</p>
    </div>

    <div className="rounded-3xl border border-white/10 bg-white/5 p-6" data-testid="light-codes-category-integration">
      <p className="text-xs uppercase tracking-[0.28em] text-white/40 mb-3">Integration note</p>
      <p className="text-sm text-white/75 leading-relaxed">{activeCategoryInfo?.integration}</p>
    </div>
  </div>
);
