import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Sun, Moon, Sparkles, Star, LogIn, Mail, Lock, User, Eye, EyeOff, ArrowRight, Download
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { toast } from "sonner";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const LandingPage = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: ""
  });

  // Google OAuth login
  const handleGoogleLogin = () => {
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  // Email/Password login
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password, name: formData.name };

      const response = await axios.post(`${API_URL}${endpoint}`, payload, {
        withCredentials: true
      });

      if (response.data.user) {
        toast.success(isLogin ? "Welcome back!" : "Account created successfully!");
        
        // Close modal and navigate
        setShowAuthModal(false);
        
        // Small delay to ensure cookie is set, then redirect
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 100);
      }
      
    } catch (error) {
      const message = error.response?.data?.detail || "Authentication failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section - Centered with Big Button */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url('https://static.prod-images.emergentagent.com/jobs/30743729-c71b-4ef6-9e6e-aecb9cd4b3a8/images/662567cd330fc281bb3d5078d4cf60eb9a2fff9d8ffc9f441d949f94145901ba.png')` 
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/50 to-background" />
        </div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-10 md:left-20 text-primary/30"
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sun size={50} strokeWidth={1} />
        </motion.div>
        <motion.div
          className="absolute top-32 right-10 md:right-32 text-accent/30"
          animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Moon size={40} strokeWidth={1} />
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <p className="text-xs tracking-[0.3em] uppercase text-primary mb-4 font-medium">
              Ancient Wisdom for Modern Seekers
            </p>
            
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-serif font-light tracking-tight mb-4 leading-none">
              <span className="italic text-foreground">Shamanic</span>
              <br />
              <span className="text-primary">Elements</span>
              <br />
              <span className="text-foreground/80 text-3xl sm:text-4xl md:text-5xl">Soul Temple <span className="text-primary/70 text-2xl">2.0</span></span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground font-light max-w-xl mx-auto mb-8 leading-relaxed">
              Journey through the sacred elements. Transform your practice with shamanic traditions.
            </p>

            {/* BIG ENTER BUTTON - Goes to main menu */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="mb-6"
            >
              <Button
                data-testid="enter-temple-btn"
                onClick={() => navigate('/menu')}
                className="bg-primary text-primary-foreground rounded-full px-16 py-8 text-xl md:text-2xl font-serif italic
                           shadow-[0_0_60px_rgba(212,175,55,0.5)] hover:shadow-[0_0_80px_rgba(212,175,55,0.7)]
                           transition-all duration-500 animate-pulse hover:animate-none"
              >
                <Sparkles className="w-6 h-6 mr-3" />
                Enter the Temple
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
            </motion.div>

            <p className="text-sm text-muted-foreground/70 mb-4">
              Explore freely • No account needed
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/support')}
                className="text-white/70 hover:text-primary"
                data-testid="landing-support-btn"
              >
                Support & install info
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("pwa-install-open", { detail: { source: "landing", immediate: true } }));
                }}
                className="text-white/70 hover:text-primary"
                data-testid="landing-install-btn"
              >
                <Download className="w-4 h-4 mr-2" />
                Install App
              </Button>
            </div>
            
            {/* Sign In link for returning users */}
            <Button
              variant="ghost"
              onClick={() => setShowAuthModal(true)}
              className="text-primary/70 hover:text-primary"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign in to save your progress
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Auth Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="bg-card border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif text-center">
              {isLogin ? "Welcome Back" : "Begin Your Journey"}
            </DialogTitle>
            <DialogDescription className="sr-only" data-testid="landing-auth-modal-description">
              Sign in with Google or email to save your progress, rituals, and guided journey history.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Google Login Button */}
            <Button
              data-testid="google-login-btn"
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full py-6 text-lg border-white/20 hover:bg-white/5"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    data-testid="auth-name-input"
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10 py-6 bg-white/5 border-white/10"
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  data-testid="auth-email-input"
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 py-6 bg-white/5 border-white/10"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  data-testid="auth-password-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10 py-6 bg-white/5 border-white/10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <Button
                data-testid="auth-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-primary text-lg"
              >
                {loading ? (
                  "Please wait..."
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    {isLogin ? "Sign In" : "Create Account"}
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              {isLogin ? "New to Soul Temple 2.0?" : "Already have an account?"}{" "}
              <button
                data-testid="auth-toggle-mode-btn"
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

export default LandingPage;
