import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Sparkles, Star, LogIn, Mail, Lock, User, Eye, EyeOff, ArrowRight, Heart, Leaf, Moon, Feather
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { toast } from "sonner";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Design system colors
const colors = {
  background: "#FDFBF7",
  surface: "#FFFFFF",
  primary: "#A96F6A",
  primaryHover: "#8A5652",
  secondary: "#E8D8CE",
  accent: "#D4AF37",
  textMain: "#3D2E2B",
  textMuted: "#7A706D",
  border: "#EAE1D9",
  success: "#6B8E73",
};

const HERO_IMAGE = "https://images.unsplash.com/photo-1545389336-cf090694435e?w=1600&q=80";

const FEATURES = [
  { icon: Leaf, title: "Yoga & Somatic Healing", desc: "Ancient movement practices for body wisdom" },
  { icon: Moon, title: "Sacred Rites & Initiations", desc: "Lineage transmissions for transformation" },
  { icon: Sparkles, title: "Sound & Crystal Healing", desc: "Vibrational medicine for the soul" },
  { icon: Heart, title: "Feminine Embodiment", desc: "Dance, breathwork, and womb healing" },
];

const LandingPage = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", name: "" });

  const handleGoogleLogin = () => {
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password, name: formData.name };

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

  return (
    <div className="min-h-screen overflow-hidden" style={{ backgroundColor: colors.background, fontFamily: "'Inter', sans-serif" }} data-testid="landing-page">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img src={HERO_IMAGE} alt="" className="w-full h-full object-cover" style={{ filter: "brightness(0.9)" }} />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${colors.background}90 0%, ${colors.background}70 50%, transparent 100%)` }} />
        </div>

        {/* Content */}
        <div className="relative w-full max-w-7xl mx-auto px-6 md:px-12 py-20">
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <p className="text-xs uppercase tracking-[0.4em] mb-6" style={{ color: colors.primary, fontWeight: 600 }}>
                Sacred Feminine Wellness
              </p>
              <h1 className="text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.1] mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, color: colors.textMain }}>
                Shamanic Elements<br />
                <span className="italic" style={{ color: colors.primary }}>Soul Temple</span>
              </h1>
              <p className="text-lg md:text-xl leading-relaxed mb-10" style={{ color: colors.textMuted, maxWidth: "480px" }}>
                A sacred sanctuary for yoga, embodiment, shamanic practices, and deep feminine healing. Transform your body, heart, and spirit.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => setShowAuthModal(true)}
                  className="px-8 py-6 rounded-full text-base font-medium transition-all duration-300 hover:scale-105 shadow-lg"
                  style={{ backgroundColor: colors.primary, color: "white" }}
                  data-testid="begin-journey-btn"
                >
                  Begin Your Journey <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  onClick={() => navigate("/menu")}
                  variant="outline"
                  className="px-8 py-6 rounded-full text-base font-medium transition-all duration-300 hover:scale-105"
                  style={{ borderColor: colors.primary, color: colors.primary, backgroundColor: `${colors.surface}90`, backdropFilter: "blur(8px)" }}
                  data-testid="explore-btn"
                >
                  Explore Practices
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full flex justify-center pt-2" style={{ border: `2px solid ${colors.primary}40` }}>
            <div className="w-1.5 h-3 rounded-full" style={{ backgroundColor: colors.primary }} />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32" style={{ backgroundColor: colors.surface }}>
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] mb-4" style={{ color: colors.primary, fontWeight: 600 }}>Sacred Offerings</p>
            <h2 className="text-4xl md:text-5xl mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>
              What Awaits <span className="italic" style={{ color: colors.primary }}>Within</span>
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: colors.textMuted }}>
              A holistic sanctuary of practices to nurture body, mind, and spirit on your journey home to yourself.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-8 rounded-3xl transition-all duration-500 hover:-translate-y-2"
                style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }}
              >
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${colors.primary}10` }}>
                  <feature.icon className="w-8 h-8" style={{ color: colors.primary }} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>{feature.title}</h3>
                <p className="text-sm" style={{ color: colors.textMuted }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sacred Rites CTA */}
      <section className="py-24 md:py-32 relative overflow-hidden" style={{ backgroundColor: colors.background }}>
        <div className="absolute inset-0 opacity-30">
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=60" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${colors.background} 40%, ${colors.background}90)` }} />
        
        <div className="relative max-w-6xl mx-auto px-6 md:px-12">
          <div className="max-w-xl">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="inline-block px-4 py-1.5 rounded-full text-xs uppercase tracking-[0.2em] font-semibold mb-6" style={{ backgroundColor: `${colors.accent}20`, color: colors.accent }}>
                Premium Initiations
              </span>
              <h2 className="text-4xl md:text-5xl mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>
                Sacred Rites &<br /><span className="italic" style={{ color: colors.primary }}>Lineage Transmissions</span>
              </h2>
              <p className="text-base leading-relaxed mb-8" style={{ color: colors.textMuted }}>
                Receive ancient initiations passed down through generations. Munay Ki, Nusta Karpay, and the 13th Rite of the Womb await those called to deep transformation.
              </p>
              <Button
                onClick={() => navigate("/courses")}
                className="px-8 py-5 rounded-full text-base font-medium transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: colors.accent, color: "white" }}
                data-testid="view-courses-btn"
              >
                <Star className="w-4 h-4 mr-2" /> View Sacred Courses
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 md:py-32" style={{ backgroundColor: colors.surface }}>
        <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Feather className="w-12 h-12 mx-auto mb-6" style={{ color: colors.primary }} strokeWidth={1} />
            <h2 className="text-4xl md:text-5xl mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>
              Your <span className="italic" style={{ color: colors.primary }}>Journey</span> Begins Here
            </h2>
            <p className="text-base leading-relaxed mb-10 max-w-lg mx-auto" style={{ color: colors.textMuted }}>
              Join thousands of women who have transformed their lives through sacred practice. Your body, your temple — your healing awaits.
            </p>
            <Button
              onClick={() => setShowAuthModal(true)}
              className="px-10 py-6 rounded-full text-base font-medium transition-all duration-300 hover:scale-105 shadow-lg"
              style={{ backgroundColor: colors.primary, color: "white" }}
            >
              Start Your Free Practice <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12" style={{ backgroundColor: colors.background, borderTop: `1px solid ${colors.border}` }}>
        <div className="max-w-6xl mx-auto px-6 md:px-12 text-center">
          <p className="text-xl italic mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.primary }}>Soul Temple 2.0</p>
          <p className="text-xs" style={{ color: colors.textMuted }}>© {new Date().getFullYear()} Shamanic Elements. Sacred practices for the modern woman.</p>
        </div>
      </footer>

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

            {/* Google Login */}
            <Button
              type="button"
              variant="outline"
              className="w-full py-5 rounded-full mb-6 transition-all duration-300 hover:scale-[1.02]"
              style={{ borderColor: colors.border, color: colors.textMain, backgroundColor: colors.surface }}
              onClick={handleGoogleLogin}
              data-testid="google-login-btn"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-3" />
              Continue with Google
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full" style={{ borderTop: `1px solid ${colors.border}` }} /></div>
              <div className="relative flex justify-center"><span className="px-4 text-xs" style={{ backgroundColor: colors.background, color: colors.textMuted }}>or</span></div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.textMuted }} />
                  <Input
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-11 py-5 rounded-full"
                    style={{ backgroundColor: colors.surface, borderColor: colors.border, color: colors.textMain }}
                    required={!isLogin}
                    data-testid="name-input"
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.textMuted }} />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-11 py-5 rounded-full"
                  style={{ backgroundColor: colors.surface, borderColor: colors.border, color: colors.textMain }}
                  required
                  data-testid="email-input"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.textMuted }} />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-11 pr-11 py-5 rounded-full"
                  style={{ backgroundColor: colors.surface, borderColor: colors.border, color: colors.textMain }}
                  required
                  data-testid="password-input"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: colors.textMuted }}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button
                type="submit"
                className="w-full py-5 rounded-full font-medium transition-all duration-300 hover:scale-[1.02]"
                style={{ backgroundColor: colors.primary, color: "white" }}
                disabled={loading}
                data-testid="auth-submit-btn"
              >
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

export default LandingPage;
