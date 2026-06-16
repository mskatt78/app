import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { ROSE_FEMININE_IMAGES, teachings, templeIntro } from "./roseTempleConstants";

const TEACHING_HOVER = { y: -2 };

export const RoseTempleMainSections = ({
  loadingPractices,
  embodimentPractices,
  sacredRites,
  onSelectTeaching,
  onSelectPractice,
  onSelectRite,
}) => {
  return (
    <main className="max-w-6xl mx-auto p-6 space-y-8" data-testid="rose-temple-main">
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
                src={imageUrl}
                alt={`Rose temple ${index + 1}`}
                className="rounded-2xl h-36 w-full object-cover border border-rose-500/20"
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
          {teachings.map((teaching) => {
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
                {teaching.image && <img src={teaching.image} alt={teaching.title} className="w-full h-40 object-cover" />}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5 text-rose-300" />
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{teaching.subtitle}</p>
                  </div>
                  <h4 className="font-serif text-xl mb-2">{teaching.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-3">{teaching.description}</p>
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
            {embodimentPractices.map((practice) => (
              <button
                key={practice.id}
                onClick={() => onSelectPractice(practice)}
                className="p-4 rounded-xl border border-white/10 bg-card/50 text-left hover:border-rose-500/30 transition-colors"
                data-testid={`rose-practice-${practice.id}`}
              >
                <h4 className="font-serif text-lg mb-1">{practice.name}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">{practice.description}</p>
              </button>
            ))}
          </div>
        )}
      </section>

      <section data-testid="rose-temple-rites-grid">
        <h3 className="text-2xl font-serif mb-4">Sacred Rites</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {sacredRites.map((rite) => (
            <button
              key={rite.id}
              onClick={() => onSelectRite(rite)}
              className="p-4 rounded-xl border border-white/10 bg-card/50 text-left hover:border-rose-500/30 transition-colors"
              data-testid={`rose-rite-${rite.id}`}
            >
              <h4 className="font-serif text-lg mb-1">{rite.title || rite.name}</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">{rite.description}</p>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
};
