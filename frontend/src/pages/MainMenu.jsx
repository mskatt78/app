import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Sparkles, Wind, Gem, Music2, Hand, Brain, Heart, Flame, TreePine, 
  Palette, Moon, Hash, Star, Mountain, Waves, Eye, Home, LogIn, Mail, Lock, User,
  Flower2, Shield, Globe, Users, Leaf, Sunrise, Hexagon, BookOpen, Coins, Droplets, Dna,
  BarChart3, Calculator, MessageCircle, Feather, Volume2, NotebookPen, ChevronRight, ArrowRight, Play
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL || "";

// Design system colors
const colors = {
  background: "#FDFBF7",
  surface: "#FFFFFF",
  primary: "#A96F6A",
  secondary: "#E8D8CE",
  accent: "#D4AF37",
  textMain: "#3D2E2B",
  textMuted: "#7A706D",
  border: "#EAE1D9",
  success: "#6B8E73",
};

// Icon color mapping
const iconColors = {
  emerald: colors.success,
  cyan: "#5B8A9A",
  orange: "#C4956A",
  red: "#C97070",
  teal: "#5A9A8A",
  purple: "#9A7AAF",
  rose: "#C97B84",
  green: colors.success,
  amber: colors.accent,
  pink: "#C97B84",
  indigo: "#7B68A6",
  blue: "#6B9AC4",
  yellow: colors.accent,
  violet: colors.primary,
  fuchsia: "#9A6AA0",
};

const MainMenu = ({ user }) => {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const name = formData.get('name');
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin ? { email, password } : { email, password, name };
      const response = await axios.post(`${API_URL}${endpoint}`, payload, { withCredentials: true });
      if (response.data.user) {
        toast.success(isLogin ? "Welcome back, sacred soul!" : "Welcome to your journey!");
        setShowAuthModal(false);
        setTimeout(() => { window.location.href = "/dashboard"; }, 100);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const getColor = (colorClass) => {
    const colorName = colorClass.replace("text-", "").replace("-400", "");
    return iconColors[colorName] || colors.primary;
  };

  const menuSections = [
    {
      title: "Daily Practice",
      items: [
        { path: "/daily-practice", icon: Sunrise, label: "Today's Guidance", color: "text-violet-400", desc: "Moon phase & daily wisdom" },
        { path: "/practice-journal", icon: NotebookPen, label: "Practice Journal", color: "text-emerald-400", desc: "Track your sacred journey" },
      ]
    },
    {
      title: "Movement & Body",
      items: [
        { path: "/yoga", icon: Sparkles, label: "Yoga Library", color: "text-emerald-400", desc: "78 sacred poses" },
        { path: "/breathwork", icon: Wind, label: "Breathwork", color: "text-cyan-400", desc: "Pranayama practices" },
        { path: "/mudras", icon: Hand, label: "Mudras", color: "text-orange-400", desc: "Sacred hand gestures" },
        { path: "/somatic", icon: Flame, label: "Somatic Movement", color: "text-red-400", desc: "Tai Chi & Qigong" },
        { path: "/partner-yoga", icon: Users, label: "Partner Yoga", color: "text-teal-400", desc: "Sacred connection for two" },
      ]
    },
    {
      title: "Mind & Spirit",
      items: [
        { path: "/meditations", icon: Brain, label: "Guided Meditations", color: "text-purple-400", desc: "Voice-guided journeys" },
        { path: "/mindfulness", icon: Heart, label: "Mindfulness", color: "text-rose-400", desc: "Present moment awareness" },
        { path: "/grounding", icon: TreePine, label: "Grounding", color: "text-green-400", desc: "Earth connection" },
        { path: "/mantras", icon: Music2, label: "Mantras", color: "text-amber-400", desc: "Sacred sound healing" },
      ]
    },
    {
      title: "Sacred Temples",
      items: [
        { path: "/rose-temple", icon: Flower2, label: "Rose Temple", color: "text-rose-400", desc: "Divine feminine embodiment" },
        { path: "/masculine-temple", icon: Shield, label: "Masculine Temple", color: "text-amber-400", desc: "Sacred masculine wisdom" },
        { path: "/elemental-temples", icon: Globe, label: "Elemental Temples", color: "text-teal-400", desc: "Earth · Water · Fire · Air · Spirit" },
        { path: "/seasonal-temple", icon: Leaf, label: "Wheel of the Year", color: "text-orange-400", desc: "8 Sabbats · Earth cycles" },
        { path: "/sunrise-sunset", icon: Sunrise, label: "Sunrise & Sunset", color: "text-yellow-400", desc: "Sacred daily transitions" },
        { path: "/water-practices", icon: Droplets, label: "Water Practices", color: "text-blue-400", desc: "Blessing & cleansing rituals" },
      ]
    },
    {
      title: "Shamanic Wisdom",
      items: [
        { path: "/shamanic", icon: Moon, label: "Shamanic Practices", color: "text-indigo-400", desc: "Journey & soul retrieval" },
        { path: "/heart-practices", icon: Heart, label: "Heart Practices", color: "text-pink-400", desc: "Heart opening ceremonies" },
        { path: "/sacred-guardians", icon: Feather, label: "Sacred Guardians", color: "text-amber-400", desc: "Animals, dragons & angels" },
        { path: "/elemental", icon: Sparkles, label: "Five Elements", color: "text-teal-400", desc: "Elemental wisdom" },
        { path: "/ancient-wisdom", icon: Globe, label: "Ancient Traditions", color: "text-yellow-400", desc: "Egyptian, Celtic & Avalon" },
        { path: "/sound-frequencies", icon: Volume2, label: "Sound Healing", color: "text-cyan-400", desc: "Frequencies & vibration" },
        { path: "/creative", icon: Palette, label: "Sacred Art", color: "text-violet-400", desc: "Creative expression" },
      ]
    },
    {
      title: "Divination & Guidance",
      items: [
        { path: "/tarot", icon: Star, label: "Tarot Reading", color: "text-indigo-400", desc: "Major Arcana wisdom" },
        { path: "/oracle", icon: Eye, label: "Oracle Cards", color: "text-purple-400", desc: "Spirit guidance" },
        { path: "/rune-readings", icon: Star, label: "Rune Readings", color: "text-amber-400", desc: "Elder Futhark wisdom" },
        { path: "/i-ching", icon: Coins, label: "I Ching", color: "text-red-400", desc: "Book of Changes" },
        { path: "/numerology", icon: Hash, label: "Numerology", color: "text-amber-400", desc: "Life path numbers" },
        { path: "/astrology", icon: Moon, label: "Moon Calendar", color: "text-blue-400", desc: "Lunar cycles & phases" },
        { path: "/gene-keys", icon: Dna, label: "Gene Keys", color: "text-violet-400", desc: "Shadow to Siddhi" },
        { path: "/human-design", icon: Hexagon, label: "Human Design", color: "text-indigo-400", desc: "Your energetic blueprint" },
        { path: "/profile-calculator", icon: Calculator, label: "Profile Calculator", color: "text-pink-400", desc: "Discover your type" },
      ]
    },
    {
      title: "Sacred Tools",
      items: [
        { path: "/crystals", icon: Gem, label: "Crystal Guide", color: "text-pink-400", desc: "42 healing stones" },
        { path: "/light-codes", icon: Hexagon, label: "Light Codes", color: "text-violet-400", desc: "Sacred geometry" },
      ]
    },
    {
      title: "Self-Healing & Energy Work",
      items: [
        { path: "/chakra-cleansing", icon: Hexagon, label: "Chakra Cleansing", color: "text-violet-400", desc: "All 13 energy centers" },
        { path: "/energy-healing", icon: Sparkles, label: "Energy Healing", color: "text-amber-400", desc: "Reiki, Sekhem & Dreamtime" },
        { path: "/somatic-yoga", icon: Leaf, label: "Somatic Yoga", color: "text-emerald-400", desc: "Trauma release & healing" },
        { path: "/free-form-movement", icon: Wind, label: "Free Form Movement", color: "text-fuchsia-400", desc: "Ecstatic dance & liberation" },
      ]
    },
    {
      title: "Community & Learning",
      items: [
        { path: "/courses", icon: BookOpen, label: "Sacred Courses", color: "text-violet-400", desc: "Live & recorded teachings", highlight: true },
        { path: "/videos", icon: Play, label: "Video Library", color: "text-rose-400", desc: "31 curated tutorials", highlight: true },
        { path: "/community", icon: Users, label: "Sacred Circle", color: "text-rose-400", desc: "Shared wisdom & journeys" },
        { path: "/retreats", icon: Globe, label: "Retreats", color: "text-emerald-400", desc: "Sacred gatherings" },
        { path: "/reviews", icon: MessageCircle, label: "Testimonials", color: "text-amber-400", desc: "Community voices" },
        { path: "/progress", icon: BarChart3, label: "My Progress", color: "text-cyan-400", desc: "Track your growth" },
      ]
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background, fontFamily: "'Inter', sans-serif" }} data-testid="main-menu">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl" style={{ backgroundColor: `${colors.background}90`, borderBottom: `1px solid ${colors.border}` }}>
        <div className="max-w-5xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="p-2 rounded-full transition-all hover:scale-105" style={{ backgroundColor: `${colors.secondary}50` }} data-testid="home-btn">
              <Home className="w-5 h-5" style={{ color: colors.primary }} />
            </button>
            <div>
              <p className="text-xs uppercase tracking-[0.2em]" style={{ color: colors.textMuted }}>Explore</p>
              <h1 className="text-xl" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>Sacred <span className="italic" style={{ color: colors.primary }}>Practices</span></h1>
            </div>
          </div>
          {user ? (
            <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:scale-105" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
              <span className="text-sm" style={{ color: colors.textMain }}>{user.name?.split(' ')[0] || 'Dashboard'}</span>
              <ChevronRight className="w-4 h-4" style={{ color: colors.textMuted }} />
            </button>
          ) : (
            <Button onClick={() => setShowAuthModal(true)} size="sm" className="rounded-full px-5" style={{ backgroundColor: colors.primary, color: "white" }} data-testid="sign-in-btn">
              <LogIn className="w-4 h-4 mr-2" /> Sign In
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Featured: Sacred Courses */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 p-6 rounded-3xl cursor-pointer group transition-all duration-300 hover:scale-[1.01]"
          style={{ background: `linear-gradient(135deg, ${colors.primary}15, ${colors.accent}10)`, border: `1px solid ${colors.primary}20` }}
          onClick={() => navigate("/courses")}
          data-testid="featured-courses"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${colors.primary}20` }}>
                <BookOpen className="w-7 h-7" style={{ color: colors.primary }} />
              </div>
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ backgroundColor: `${colors.accent}20`, color: colors.accent }}>New</span>
                <h3 className="text-lg" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>Sacred Rites & Initiations</h3>
                <p className="text-sm" style={{ color: colors.textMuted }}>Munay Ki · Nusta Karpay · 13th Womb Rite</p>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" style={{ color: colors.primary }} />
          </div>
        </motion.div>

        {/* Menu Sections */}
        <div className="space-y-10">
          {menuSections.map((section, sectionIndex) => (
            <motion.section
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.05 }}
            >
              <h2 className="text-xs uppercase tracking-[0.25em] mb-4 px-1" style={{ color: colors.textMuted, fontWeight: 600 }}>{section.title}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {section.items.map((item, itemIndex) => {
                  const itemColor = getColor(item.color);
                  return (
                    <motion.button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className="p-4 rounded-2xl text-left transition-all duration-300 hover:-translate-y-1 group relative"
                      style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
                      whileHover={{ scale: 1.02 }}
                      data-testid={`menu-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {item.highlight && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: colors.accent }} />
                      )}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110" style={{ backgroundColor: `${itemColor}15` }}>
                        <item.icon className="w-5 h-5" style={{ color: itemColor }} strokeWidth={1.5} />
                      </div>
                      <h3 className="text-sm font-medium mb-0.5 group-hover:text-primary transition-colors" style={{ color: colors.textMain }}>{item.label}</h3>
                      <p className="text-xs line-clamp-1" style={{ color: colors.textMuted }}>{item.desc}</p>
                    </motion.button>
                  );
                })}
              </div>
            </motion.section>
          ))}
        </div>

        {/* Footer CTA */}
        {!user && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center"
          >
            <p className="text-sm mb-4" style={{ color: colors.textMuted }}>Sign in to track your progress and unlock personalized guidance</p>
            <Button onClick={() => setShowAuthModal(true)} className="rounded-full px-8 py-5" style={{ backgroundColor: colors.primary, color: "white" }}>
              Begin Your Journey <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}
      </main>

      {/* Auth Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden" style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }}>
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-center">
                <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: colors.primary, fontWeight: 600 }}>Welcome</p>
                <h3 className="text-2xl" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>
                  {isLogin ? "Welcome Back" : "Begin Your Journey"}
                </h3>
              </DialogTitle>
            </DialogHeader>

            <Button type="button" variant="outline" className="w-full py-5 rounded-full mb-6 transition-all duration-300 hover:scale-[1.02]" style={{ borderColor: colors.border, color: colors.textMain, backgroundColor: colors.surface }} onClick={handleGoogleLogin} data-testid="google-login-btn">
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-3" />
              Continue with Google
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full" style={{ borderTop: `1px solid ${colors.border}` }} /></div>
              <div className="relative flex justify-center"><span className="px-4 text-xs" style={{ backgroundColor: colors.background, color: colors.textMuted }}>or</span></div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.textMuted }} />
                  <Input name="name" type="text" placeholder="Your name" className="pl-11 py-5 rounded-full" style={{ backgroundColor: colors.surface, borderColor: colors.border, color: colors.textMain }} required={!isLogin} />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.textMuted }} />
                <Input name="email" type="email" placeholder="Email address" className="pl-11 py-5 rounded-full" style={{ backgroundColor: colors.surface, borderColor: colors.border, color: colors.textMain }} required />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.textMuted }} />
                <Input name="password" type="password" placeholder="Password" className="pl-11 py-5 rounded-full" style={{ backgroundColor: colors.surface, borderColor: colors.border, color: colors.textMain }} required />
              </div>
              <Button type="submit" className="w-full py-5 rounded-full font-medium transition-all duration-300 hover:scale-[1.02]" style={{ backgroundColor: colors.primary, color: "white" }} disabled={loading}>
                {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <p className="text-center mt-6 text-sm" style={{ color: colors.textMuted }}>
              {isLogin ? "New to Soul Temple? " : "Already have an account? "}
              <button onClick={() => setIsLogin(!isLogin)} className="font-medium transition-colors" style={{ color: colors.primary }}>
                {isLogin ? "Create account" : "Sign in"}
              </button>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MainMenu;
