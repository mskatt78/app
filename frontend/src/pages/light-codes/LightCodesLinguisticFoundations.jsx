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

      <div className="rounded-3xl border border-fuchsia-500/20 bg-fuchsia-500/10 p-6" data-testid="light-codes-embodiment-principles">
        <p className="text-xs uppercase tracking-[0.28em] text-fuchsia-100/60 mb-3">Embodiment & articulation principles</p>
        <ul className="space-y-2">
          <li className="text-sm text-white/80 flex gap-2" data-testid="light-codes-embodiment-principle-1"><span className="text-fuchsia-200">•</span><span>Never force activation — paced breath and consent are part of the method.</span></li>
          <li className="text-sm text-white/80 flex gap-2" data-testid="light-codes-embodiment-principle-2"><span className="text-fuchsia-200">•</span><span>Name body data before mystical meaning: sensation first, interpretation second.</span></li>
          <li className="text-sm text-white/80 flex gap-2" data-testid="light-codes-embodiment-principle-3"><span className="text-fuchsia-200">•</span><span>Pair every symbol session with nervous-system grounding and one practical action.</span></li>
          <li className="text-sm text-white/80 flex gap-2" data-testid="light-codes-embodiment-principle-4"><span className="text-fuchsia-200">•</span><span>Let ritual become relational: translate inner shifts into clear speech, repair, or boundary action.</span></li>
        </ul>
      </div>
    </div>
  );
};
