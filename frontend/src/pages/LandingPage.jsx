import { motion } from "framer-motion";
import { 
  Sun, Moon, Wind, Flame, Leaf, Sparkles, Star, 
  Compass, Heart, Eye, Waves, Mountain
} from "lucide-react";
import { Button } from "../components/ui/button";

const LandingPage = () => {
  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  const handleLogin = () => {
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const features = [
    { icon: Leaf, title: "Yoga Practices", description: "Elemental poses connecting body and spirit", element: "earth" },
    { icon: Eye, title: "Oracle Readings", description: "AI-powered shamanic card readings", element: "spirit" },
    { icon: Wind, title: "Breathwork", description: "Ancient breathing techniques", element: "air" },
    { icon: Moon, title: "13-Moon Calendar", description: "Lunar astrology wisdom", element: "water" },
    { icon: Sparkles, title: "Crystal Guide", description: "Healing stones and their magic", element: "spirit" },
    { icon: Heart, title: "Mantras & Mudras", description: "Sacred sounds and gestures", element: "fire" },
    { icon: Waves, title: "Somatic Movement", description: "Body-based healing practices", element: "water" },
    { icon: Mountain, title: "Grounding", description: "Earth connection exercises", element: "earth" },
  ];

  const elementColors = {
    earth: "from-emerald-500/20 to-emerald-900/20 border-emerald-500/30",
    water: "from-blue-500/20 to-blue-900/20 border-blue-500/30",
    fire: "from-orange-500/20 to-orange-900/20 border-orange-500/30",
    air: "from-cyan-500/20 to-cyan-900/20 border-cyan-500/30",
    spirit: "from-purple-500/20 to-purple-900/20 border-purple-500/30",
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1738084843875-48f8118c87af?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2ODl8MHwxfHNlYXJjaHwyfHxteXN0aWNhbCUyMHlvZ2ElMjB3b21hbiUyMG5hdHVyZSUyMHN1bnNldCUyMHNpbGhvdWV0dGV8ZW58MHx8fHwxNzcxNTA0MTc1fDA&ixlib=rb-4.1.0&q=85')` 
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-20 text-primary/30"
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sun size={60} strokeWidth={1} />
        </motion.div>
        <motion.div
          className="absolute top-40 right-32 text-accent/30"
          animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Moon size={48} strokeWidth={1} />
        </motion.div>
        <motion.div
          className="absolute bottom-40 left-32 text-secondary/30"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Star size={36} strokeWidth={1} />
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <p className="text-xs tracking-[0.3em] uppercase text-primary mb-6 font-medium">
              Ancient Wisdom for Modern Seekers
            </p>
            
            <h1 className="text-6xl md:text-8xl font-serif font-light tracking-tight mb-6 leading-none">
              <span className="italic text-foreground">Shamanic</span>
              <br />
              <span className="text-primary">Elemental</span>
              <br />
              <span className="text-foreground/80">Yoga</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground font-light max-w-2xl mx-auto mb-12 leading-relaxed">
              Journey through the sacred elements. Connect with ancient wisdom.
              Transform your practice with shamanic traditions.
            </p>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                data-testid="enter-temple-btn"
                onClick={handleLogin}
                className="bg-primary text-primary-foreground rounded-full px-12 py-6 text-lg font-serif italic
                           shadow-[0_0_40px_rgba(212,175,55,0.4)] hover:shadow-[0_0_60px_rgba(212,175,55,0.6)]
                           transition-all duration-500"
              >
                Enter the Temple
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Compass className="text-primary/50" size={24} />
        </motion.div>
      </section>

      {/* Elements Section */}
      <section className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="text-xs tracking-[0.3em] uppercase text-accent mb-4 font-medium">
              The Five Elements
            </p>
            <h2 className="text-4xl md:text-5xl font-serif font-light tracking-tight">
              Walk the <span className="italic text-primary">Sacred Path</span>
            </h2>
          </motion.div>

          {/* Features Grid - Bento Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                className={`
                  relative p-8 rounded-2xl border backdrop-blur-xl
                  bg-gradient-to-br ${elementColors[feature.element]}
                  hover:border-primary/30 transition-all duration-500
                  ${index === 0 || index === 7 ? 'lg:col-span-2' : ''}
                `}
              >
                <feature.icon 
                  className={`w-10 h-10 mb-4 ${
                    feature.element === 'earth' ? 'text-emerald-400' :
                    feature.element === 'water' ? 'text-blue-400' :
                    feature.element === 'fire' ? 'text-orange-400' :
                    feature.element === 'air' ? 'text-cyan-400' :
                    'text-purple-400'
                  }`}
                  strokeWidth={1.5}
                />
                <h3 className="text-xl font-serif mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Oracle Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1706560324313-8401f367163a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHx0YXJvdCUyMGNhcmRzJTIwc3ByZWFkJTIwbXlzdGljYWwlMjB0YWJsZSUyMGNhbmRsZXxlbnwwfHx8fDE3NzE1MDQxNzh8MA&ixlib=rb-4.1.0&q=85')` 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background" />
        
        <div className="relative max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 text-left"
          >
            <p className="text-xs tracking-[0.3em] uppercase text-accent mb-4 font-medium">
              Divine Guidance
            </p>
            <h2 className="text-4xl md:text-5xl font-serif font-light tracking-tight mb-6">
              Receive <span className="italic text-primary">Oracle</span> Wisdom
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Our AI-powered shamanic oracle draws from ancient wisdom traditions. 
              Each reading is a sacred conversation with the spirits, offering guidance 
              tailored to your unique journey.
            </p>
            <div className="flex flex-wrap gap-4">
              {['Medicine Wheel', 'Animal Spirits', 'Elemental Cards'].map((item) => (
                <span 
                  key={item}
                  className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-muted-foreground"
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex-1 flex justify-center"
          >
            <div className="relative">
              <div className="w-80 h-[450px] rounded-2xl bg-gradient-to-br from-card to-card/50 
                            border border-white/10 p-8 flex flex-col items-center justify-center
                            shadow-[0_0_60px_rgba(212,175,55,0.2)]">
                <Eye className="w-16 h-16 text-primary mb-6" strokeWidth={1} />
                <p className="font-serif text-2xl italic text-center mb-2">The Oracle Awaits</p>
                <p className="text-muted-foreground text-sm text-center">
                  What wisdom do you seek?
                </p>
              </div>
              {/* Decorative cards behind */}
              <div className="absolute -left-4 -top-4 w-80 h-[450px] rounded-2xl border border-white/5 
                            bg-card/30 -z-10 rotate-3" />
              <div className="absolute -right-4 -bottom-4 w-80 h-[450px] rounded-2xl border border-white/5 
                            bg-card/30 -z-10 -rotate-3" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Crystals Section */}
      <section className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs tracking-[0.3em] uppercase text-accent mb-4 font-medium">
              Earth's Treasures
            </p>
            <h2 className="text-4xl md:text-5xl font-serif font-light tracking-tight">
              <span className="italic text-primary">Crystal</span> Healing
            </h2>
          </motion.div>

          <div className="relative h-[400px] flex items-center justify-center">
            <motion.img
              src="https://images.unsplash.com/photo-1763021225760-1f9101fd3b38?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzV8MHwxfHNlYXJjaHwyfHxjcnlzdGFscyUyMGFtZXRoeXN0JTIwcXVhcnR6JTIwZGFyayUyMG15c3RpY2FsJTIwYmFja2dyb3VuZHxlbnwwfHx8fDE3NzE1MDQxNzd8MA&ixlib=rb-4.1.0&q=85"
              alt="Crystals"
              className="w-full h-full object-cover rounded-3xl"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent rounded-3xl" />
            <div className="absolute bottom-8 left-8 right-8">
              <p className="text-2xl font-serif italic text-foreground mb-2">
                Discover the healing power of crystals
              </p>
              <p className="text-muted-foreground">
                Amethyst, Clear Quartz, Rose Quartz, and more sacred stones
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Flame className="w-12 h-12 text-primary mx-auto mb-8" strokeWidth={1} />
            <h2 className="text-4xl md:text-6xl font-serif font-light tracking-tight mb-6">
              Begin Your <span className="italic text-primary">Journey</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              The ancestors are calling. The elements await. 
              Step into your power and walk the sacred path.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                data-testid="begin-journey-btn"
                onClick={handleLogin}
                className="bg-primary text-primary-foreground rounded-full px-12 py-6 text-lg font-serif italic
                           shadow-[0_0_40px_rgba(212,175,55,0.4)] hover:shadow-[0_0_60px_rgba(212,175,55,0.6)]
                           transition-all duration-500"
              >
                Start Your Practice
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-muted-foreground font-serif italic">
            Shamanic Elemental Yoga
          </p>
          <div className="flex items-center gap-8 text-xs text-muted-foreground tracking-wide uppercase">
            <span>Earth</span>
            <span className="text-primary">•</span>
            <span>Water</span>
            <span className="text-primary">•</span>
            <span>Fire</span>
            <span className="text-primary">•</span>
            <span>Air</span>
            <span className="text-primary">•</span>
            <span>Spirit</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
