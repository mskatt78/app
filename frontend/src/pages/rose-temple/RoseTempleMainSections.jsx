import { motion } from "framer-motion";
import { Loader2, Play } from "lucide-react";
import { ROSE_FEMININE_IMAGES, teachings, templeIntro, sisterCircleTexture } from "./roseTempleConstants";
import { getRoseTempleImage } from "../../utils/shamanicImageTheme";

const TEACHING_HOVER = { y: -2 };

export const RoseTempleMainSections = ({
  locked,
  loadingPractices,
  embodimentPractices,
  sacredRites,
  onSelectTeaching,
  onSelectPractice,
  onSelectRite,
  onStartGuidedTeaching,
  onStartGuidedPractice,
  onStartGuidedRite,
}) => {
  const isPremiumByIndex = (index) => index >= 4;

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-8" data-testid="rose-temple-main">
      {locked && (
        <div className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 p-4" data-testid="rose-temple-locked-note">
          <p className="text-sm text-fuchsia-100">Preview mode active. Continue with subscription or full app access for advanced Rose Temple layers.</p>
        </div>
      )}
      <section className="relative overflow-hidden rounded-3xl border border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-background p-8" data-testid="rose-temple-hero">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-4xl sm:text-5xl font-serif mb-4 leading-tight">{templeIntro.title}</h2>
            <p className="text-muted-foreground leading-relaxed">{templeIntro.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {ROSE_FEMININE_IMAGES.slice(0, 4).map((imageUrl, index) => (
              <img
                key={imageUrl}
                src={getRoseTempleImage({ id: `rose-hero-${index}` })}
                alt={`Rose temple ${index + 1}`}
                className="rounded-2xl h-36 w-full object-cover border border-rose-500/20"
                data-testid={`rose-temple-hero-image-${index}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section data-testid="rose-temple-principles-grid">
        <h3 className="text-2xl font-serif mb-4">Core Principles</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {templeIntro.principles.map((principle) => (
            <div key={principle.title} className="rounded-2xl border border-rose-500/20 bg-card/50 p-5">
              <h4 className="font-serif text-lg mb-2 text-rose-300">{principle.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{principle.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section data-testid="rose-temple-teachings-grid">
        <h3 className="text-2xl font-serif mb-4">Temple Teachings</h3>
        <div className="grid md:grid-cols-2 gap-5">
          {teachings.map((teaching, index) => {
            const Icon = teaching.icon;
            return (
              <motion.button
                key={teaching.id}
                type="button"
                whileHover={TEACHING_HOVER}
                onClick={() => onSelectTeaching(teaching)}
                className="text-left rounded-2xl border border-white/10 bg-card/60 overflow-hidden"
                data-testid={`rose-teaching-${teaching.id}`}
              >
                {teaching.image && <img src={getRoseTempleImage(teaching, index + 2)} alt={teaching.title} className="w-full h-40 object-cover" data-testid={`rose-teaching-image-${teaching.id}`} />}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5 text-rose-300" />
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{teaching.subtitle}</p>
                  </div>
                  <h4 className="font-serif text-xl mb-2">{teaching.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-3">{teaching.description}</p>
                  {locked && isPremiumByIndex(index) && (
                    <p className="mt-2 text-[11px] text-fuchsia-200/90" data-testid={`rose-teaching-lock-${teaching.id}`}>Premium</p>
                  )}
                  {!locked && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onStartGuidedTeaching?.(teaching);
                      }}
                      className="mt-3 w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs bg-rose-500/10 border border-rose-500/20 text-rose-200 hover:bg-rose-500/15"
                      data-testid={`rose-teaching-start-guided-${teaching.id}`}
                    >
                      <Play className="w-3.5 h-3.5" />
                      Start Guided Practice
                    </button>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      <section data-testid="rose-temple-embodiment-grid">
        <h3 className="text-2xl font-serif mb-4">Embodiment Practices</h3>
        {loadingPractices ? (
          <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-rose-300" /></div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {embodimentPractices.map((practice, index) => (
              <button
                key={practice.id}
                onClick={() => onSelectPractice(practice)}
                className="p-4 rounded-xl border border-white/10 bg-card/50 text-left hover:border-rose-500/30 transition-colors"
                data-testid={`rose-practice-${practice.id}`}
              >
                <h4 className="font-serif text-lg mb-1">{practice.name}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">{practice.description}</p>
                {locked && (practice?.is_premium || isPremiumByIndex(index)) && (
                  <p className="mt-2 text-[11px] text-fuchsia-200/90" data-testid={`rose-practice-lock-${practice.id}`}>Premium</p>
                )}
                {!locked && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                      event.stopPropagation();
                      onStartGuidedPractice?.(practice);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        event.stopPropagation();
                        onStartGuidedPractice?.(practice);
                      }
                    }}
                    className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-rose-500/10 border border-rose-500/20 text-rose-200"
                    data-testid={`rose-practice-start-guided-${practice.id}`}
                  >
                    <Play className="w-3.5 h-3.5" />
                    Start Guided
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </section>

      <section data-testid="rose-temple-rites-grid">
        <h3 className="text-2xl font-serif mb-4">Sacred Rites</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {sacredRites.map((rite, index) => (
            <button
              key={rite.id}
              onClick={() => onSelectRite(rite)}
              className="p-4 rounded-xl border border-white/10 bg-card/50 text-left hover:border-rose-500/30 transition-colors"
              data-testid={`rose-rite-${rite.id}`}
            >
              <h4 className="font-serif text-lg mb-1">{rite.title || rite.name}</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">{rite.description}</p>
              {locked && (rite?.is_premium || isPremiumByIndex(index)) && (
                <p className="mt-2 text-[11px] text-fuchsia-200/90" data-testid={`rose-rite-lock-${rite.id}`}>Premium</p>
              )}
              {!locked && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(event) => {
                    event.stopPropagation();
                    onStartGuidedRite?.(rite);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      event.stopPropagation();
                      onStartGuidedRite?.(rite);
                    }
                  }}
                  className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-rose-500/10 border border-rose-500/20 text-rose-200"
                  data-testid={`rose-rite-start-guided-${rite.id}`}
                >
                  <Play className="w-3.5 h-3.5" />
                  Start Guided
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-background to-fuchsia-500/10 p-6" data-testid="rose-temple-sister-circle-texture">
        <h3 className="text-2xl font-serif mb-2">{sisterCircleTexture.title}</h3>
        <p className="text-sm text-muted-foreground mb-5">{sisterCircleTexture.intro}</p>
        <div className="grid md:grid-cols-2 gap-4">
          {sisterCircleTexture.pillars.map((pillar) => (
            <div key={pillar.id} className="rounded-2xl border border-white/10 bg-card/50 p-4" data-testid={`sister-circle-pillar-${pillar.id}`}>
              <h4 className="font-serif text-lg mb-2 text-rose-200">{pillar.title}</h4>
              <ul className="space-y-1.5">
                {pillar.points.map((point, index) => (
                  <li key={`${pillar.id}-${index}`} className="text-xs text-muted-foreground">• {point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};
