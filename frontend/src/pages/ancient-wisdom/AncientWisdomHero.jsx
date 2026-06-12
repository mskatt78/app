import { ArrowLeft, Star } from "lucide-react";
import { motion } from "framer-motion";

export const AncientWisdomHero = ({ navigate }) => {
  return (
    <div className="relative overflow-hidden" data-testid="ancient-wisdom-hero">
      <div className="absolute inset-0">
        <img
          src="https://static.prod-images.emergentagent.com/jobs/0191da63-58fb-4ee1-838d-801a94a094dc/images/a0f2901affbdad2e83355fb4ece3d09eb63f134bedc6247f72a390b68e48fd17.png"
          alt="Ancient Wisdom"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 pt-8 pb-16">
        <button
          data-testid="back-btn"
          onClick={() => navigate("/menu")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Menu</span>
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Star className="w-5 h-5 text-amber-400" />
            <span className="text-xs uppercase tracking-widest text-amber-400/80">Sacred Traditions</span>
            <Star className="w-5 h-5 text-amber-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif mb-4">
            Ancient Wisdom <span className="italic text-primary">Traditions</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
            Journey through the sacred alchemical traditions of our world — Egyptian mysteries, Aboriginal Dreamtime,
            Celtic magic, Peruvian ceremonial wisdom, and the cosmic transmissions of Lemuria, Atlantis, and the Stars.
          </p>
        </motion.div>
      </div>
    </div>
  );
};