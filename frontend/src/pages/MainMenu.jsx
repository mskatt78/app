import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Sparkles, Wind, Gem, Music2, Hand, Brain, Heart, Flame, TreePine, 
  Palette, Moon, Hash, Star, Mountain, Waves, Eye, Home, LogIn, Mail, Lock, User,
  Flower2, Shield, Globe, Users, Leaf, Sunrise, Hexagon, BookOpen, Coins, Droplets, Dna,
  BarChart3, Calculator, MessageCircle, Feather, Volume2, NotebookPen
} from "lucide-react";import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import axios from "axios";
import DailyPracticeWidget from "../components/DailyPracticeWidget";

const API_URL = process.env.REACT_APP_BACKEND_URL || "";

const MainMenu = ({ user }) => {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google`;
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
      const payload = isLogin 
        ? { email, password }
        : { email, password, name };
      
      const response = await axios.post(`${API_URL}${endpoint}`, payload, {
        withCredentials: true
      });

      if (response.data.user) {
        toast.success(isLogin ? "Welcome back!" : "Account created!");
        setShowAuthModal(false);
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 100);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Authentication failed");
    } finally {
      setLoading(false);
    }
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
        { path: "/elemental-temples", icon: Sparkles, label: "Five Elements Temple", color: "text-teal-400", desc: "Earth · Water · Fire · Air · Spirit" },
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
        { path: "/archangels", icon: Feather, label: "Archangel Oracle", color: "text-amber-400", desc: "Divine angelic guidance" },
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
        { path: "/courses", icon: BookOpen, label: "Courses", color: "text-violet-400", desc: "Live & recorded teachings" },
        { path: "/community", icon: Users, label: "Sacred Circle", color: "text-rose-400", desc: "Shared wisdom & journeys" },
        { path: "/retreats", icon: Globe, label: "Retreats", color: "text-emerald-400", desc: "Sacred gatherings" },
        { path: "/reviews", icon: MessageCircle, label: "Testimonials", color: "text-amber-400", desc: "Community voices" },
        { path: "/progress", icon: BarChart3, label: "My Progress", color: "text-cyan-400", desc: "Track your growth" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="main-menu">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <Home className="w-5 h-5 text-primary" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Sacred Sanctuary</p>
              <h1 className="text-xl font-serif">Temple <span className="italic text-primary">Menu</span></h1>
            </div>
          </div>
          
          {user ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="text-sm text-primary hover:text-primary/80"
            >
              My Dashboard
            </button>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-serif mb-2">Welcome to the <span className="italic text-primary">Temple</span></h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Explore ancient wisdom practices for mind, body, and spirit.
          </p>
        </motion.div>

        {/* Daily Practice Widget */}
        <DailyPracticeWidget hemisphere="south" />

        {/* Menu Sections */}
        <div className="space-y-10">
          {menuSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
            >
              <h3 className="text-lg font-serif text-muted-foreground mb-4 pl-2 border-l-2 border-primary/50">
                {section.title}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {section.items.map((item, index) => (
                  <motion.button
                    key={item.path}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(item.path)}
                    className="flex flex-col items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 
                             border border-white/10 hover:border-primary/30 transition-all text-center"
                    data-testid={`menu-${item.path.slice(1)}`}
                  >
                    <item.icon className={`w-8 h-8 mb-2 ${item.color}`} />
                    <span className="font-medium text-sm">{item.label}</span>
                    <span className="text-xs text-muted-foreground mt-1">{item.desc}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Access Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 pt-8 border-t border-white/10 text-center"
        >
          <p className="text-sm text-muted-foreground mb-4">
            {user ? "Access your personal journey" : "Sign in to save your progress"}
          </p>
          <button
            onClick={() => user ? navigate("/dashboard") : setShowAuthModal(true)}
            className="px-6 py-2 rounded-full bg-primary/20 hover:bg-primary/30 text-primary 
                     border border-primary/30 transition-all"
          >
            {user ? "Go to Dashboard" : "Sign In"}
          </button>
        </motion.div>
      </main>

      {/* Auth Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="bg-card border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif text-center">
              {isLogin ? "Welcome Back" : "Begin Your Journey"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {/* Google Login */}
            <Button
              variant="outline"
              className="w-full border-white/20 hover:bg-white/5"
              onClick={handleGoogleLogin}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      name="name"
                      placeholder="Your name"
                      className="pl-10 bg-white/5 border-white/10"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10 bg-white/5 border-white/10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 bg-white/5 border-white/10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={loading}
              >
                <LogIn className="w-5 h-5 mr-2" />
                {loading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              {isLogin ? "New to Soul Temple 2.0?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline"
              >
                {isLogin ? "Create an account" : "Sign in"}
              </button>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MainMenu;
