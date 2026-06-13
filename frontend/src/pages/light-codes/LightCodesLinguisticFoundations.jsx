export const LightCodesLinguisticFoundations = ({ lightCodes }) => {
  if (!lightCodes?.linguistic_foundations?.length) {
    return null;
  }

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-2" data-testid="light-codes-linguistic-foundations">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <p className="text-xs uppercase tracking-[0.28em] text-white/40 mb-3">Linguistic foundations</p>
        <div className="space-y-3">
          {lightCodes.linguistic_foundations.map((item) => (
            <div key={item.id} className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm font-medium text-foreground mb-1">{item.title}</p>
              <p className="text-xs text-white/70 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6" data-testid="light-codes-lineage-notes">
        <p className="text-xs uppercase tracking-[0.28em] text-white/40 mb-3">Symbol lineage notes</p>
        <ul className="space-y-2">
          {(lightCodes.symbol_lineage_notes || []).map((note) => (
            <li key={note} className="text-sm text-white/75 flex gap-2">
              <span className="text-primary">•</span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
