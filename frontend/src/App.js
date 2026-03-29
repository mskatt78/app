import { useEffect, useState, useRef, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import AppFooter from "./components/AppFooter";
import TopNav from "./components/TopNav";
import InstallPrompt from "./components/InstallPrompt";

// Eager load: landing & main menu (first things user sees)
import LandingPage from "./pages/LandingPage";
import MainMenu from "./pages/MainMenu";

// Lazy load everything else
const Dashboard = lazy(() => import("./pages/Dashboard"));
const YogaLibrary = lazy(() => import("./pages/YogaLibrary"));
const OracleReadings = lazy(() => import("./pages/OracleReadings"));
const Breathwork = lazy(() => import("./pages/Breathwork"));
const AstrologyCalendar = lazy(() => import("./pages/AstrologyCalendar"));
const CrystalGuide = lazy(() => import("./pages/CrystalGuide"));
const MantrasLibrary = lazy(() => import("./pages/MantrasLibrary"));
const MudrasLibrary = lazy(() => import("./pages/MudrasLibrary"));
const SomaticMovement = lazy(() => import("./pages/SomaticMovement"));
const GroundingPractices = lazy(() => import("./pages/GroundingPractices"));
const Favorites = lazy(() => import("./pages/Favorites"));
const RitualBuilder = lazy(() => import("./pages/RitualBuilder"));
const Achievements = lazy(() => import("./pages/Achievements"));
const Journal = lazy(() => import("./pages/Journal"));
const Settings = lazy(() => import("./pages/Settings"));
const Mindfulness = lazy(() => import("./pages/Mindfulness"));
const Meditations = lazy(() => import("./pages/Meditations"));
const Numerology = lazy(() => import("./pages/Numerology"));
const AdminCMS = lazy(() => import("./pages/AdminCMS"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminSection = lazy(() => import("./pages/AdminSection"));
const PracticeLog = lazy(() => import("./pages/PracticeLog"));
const EarthAltars = lazy(() => import("./pages/EarthAltars"));
const CreativeProcesses = lazy(() => import("./pages/CreativeProcesses"));
const HeartPractices = lazy(() => import("./pages/HeartPractices"));
const ShamanicPractices = lazy(() => import("./pages/ShamanicPractices"));
const ElementalPractices = lazy(() => import("./pages/ElementalPractices"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const LiveSessions = lazy(() => import("./pages/LiveSessions"));
const LiveSessionRoom = lazy(() => import("./pages/LiveSessionRoom"));
const DemoExperience = lazy(() => import("./pages/DemoExperience"));
const SupportCenter = lazy(() => import("./pages/SupportCenter"));
const Retreats = lazy(() => import("./pages/Retreats"));
const Courses = lazy(() => import("./pages/Courses"));
const Community = lazy(() => import("./pages/Community"));
const Books = lazy(() => import("./pages/Books"));
const Pricing = lazy(() => import("./pages/Pricing"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentCancel = lazy(() => import("./pages/PaymentCancel"));
const BirthChart = lazy(() => import("./pages/BirthChart"));
const Reviews = lazy(() => import("./pages/Reviews"));
const SacredGuardians = lazy(() => import("./pages/SacredGuardians"));
const AncientWisdom = lazy(() => import("./pages/AncientWisdom"));
const SoundFrequencies = lazy(() => import("./pages/SoundFrequencies"));
const TarotReading = lazy(() => import("./pages/TarotReading"));
const RoseTemple = lazy(() => import("./pages/RoseTemple"));
const ElementalTemples = lazy(() => import("./pages/ElementalTemples"));
const MasculineTemple = lazy(() => import("./pages/MasculineTemple"));
const PartnerYoga = lazy(() => import("./pages/PartnerYoga"));
const SeasonalTemple = lazy(() => import("./pages/SeasonalTemple"));
const SunriseSunsetPractices = lazy(() => import("./pages/SunriseSunsetPractices"));
const RuneReadings = lazy(() => import("./pages/RuneReadings"));
const IChing = lazy(() => import("./pages/IChing"));
const LightCodes = lazy(() => import("./pages/LightCodes"));
const WaterPractices = lazy(() => import("./pages/WaterPractices"));
const GeneKeys = lazy(() => import("./pages/GeneKeys"));
const HumanDesign = lazy(() => import("./pages/HumanDesign"));
const ProgressDashboard = lazy(() => import("./pages/ProgressDashboard"));
const ProfileCalculator = lazy(() => import("./pages/ProfileCalculator"));
const StarLineageQuiz = lazy(() => import("./pages/StarLineageQuiz"));
const LinksPage = lazy(() => import("./pages/LinksPage"));
const EnergyHealing = lazy(() => import("./pages/EnergyHealing"));
const FreeFormMovement = lazy(() => import("./pages/FreeFormMovement"));
const SomaticYoga = lazy(() => import("./pages/SomaticYoga"));
const ChakraCleansing = lazy(() => import("./pages/ChakraCleansing"));
const DailySacredPractice = lazy(() => import("./pages/DailySacredPractice"));
const PracticeJournal = lazy(() => import("./pages/PracticeJournal"));
const VideosLibrary = lazy(() => import("./pages/VideosLibrary"));
const ArchangelOracle = lazy(() => import("./pages/ArchangelOracle"));
// Notifications
import { NotificationProvider, NotificationCenter } from "./components/NotificationSystem";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Create axios instance with credentials
const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

// Auth Callback Component
// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
const AuthCallback = () => {
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      const hash = window.location.hash;
      const sessionIdMatch = hash.match(/session_id=([^&]+)/);
      
      if (sessionIdMatch) {
        const sessionId = sessionIdMatch[1];
        try {
          const response = await api.post("/auth/session", { session_id: sessionId });
          window.history.replaceState(null, "", window.location.pathname);
          navigate("/dashboard", { state: { user: response.data }, replace: true });
        } catch (error) {
          console.error("Auth failed:", error);
          navigate("/", { replace: true });
        }
      } else {
        navigate("/", { replace: true });
      }
    };

    processAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground font-serif italic">Connecting to the spirits...</p>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(location.state?.user ? true : null);
  const [user, setUser] = useState(location.state?.user || null);

  useEffect(() => {
    if (location.state?.user) {
      setUser(location.state.user);
      setIsAuthenticated(true);
      return;
    }

    const checkAuth = async () => {
      try {
        const response = await api.get("/auth/me");
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        navigate("/", { replace: true });
      }
    };

    checkAuth();
  }, [navigate, location.state]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-serif italic">Entering the sacred space...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return children({ user, api });
};

// Admin Route Component - requires admin role
const AdminRoute = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [user, setUser] = useState(location.state?.user || null);

  // Admin emails list - add your admin email(s) here
  const ADMIN_EMAILS = [
    "skywatersacredembodiments@gmail.com",
    "mskatt78@gmail.com",
  ].map(e => e.toLowerCase());

  useEffect(() => {
    const checkAdmin = async () => {
      const storedAdminToken = localStorage.getItem("admin_token");
      if (storedAdminToken) {
        setIsAuthorized(true);
        return;
      }

      try {
        const response = await api.get("/auth/me");
        const userData = response.data;
        setUser(userData);
        
        // Check if user email is in admin list (case-insensitive)
        const userEmail = (userData.email || "").toLowerCase();
        const isAdmin = ADMIN_EMAILS.includes(userEmail) || userData.is_admin === true;
        
        console.log("Admin check:", { userEmail, isAdmin, adminEmails: ADMIN_EMAILS });
        
        if (isAdmin) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          toast.error("Admin access required");
          navigate("/dashboard", { replace: true });
        }
      } catch (error) {
        console.log("Admin auth error:", error);
        setIsAuthorized(false);
        toast.error("Please sign in to access admin");
        navigate("/", { replace: true });
      }
    };

    checkAdmin();
  }, [navigate]);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-serif italic">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return children({ user, api });
};

// Public Route Component - allows viewing without login, but shows user if logged in
const PublicRoute = ({ children }) => {
  const location = useLocation();
  const [user, setUser] = useState(location.state?.user || null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (location.state?.user) {
      setUser(location.state.user);
      setChecked(true);
      return;
    }

    const checkAuth = async () => {
      try {
        const response = await api.get("/auth/me");
        setUser(response.data);
      } catch (error) {
        // Not logged in - that's OK for public routes
        setUser(null);
      }
      setChecked(true);
    };

    checkAuth();
  }, [location.state]);

  if (!checked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-serif italic">Loading...</p>
        </div>
      </div>
    );
  }

  return children({ user, api });
};

// App Router
function AppRouter() {
  const location = useLocation();
  const [user, setUser] = useState(null);

  // Check user auth status for BottomNav
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get("/auth/me");
        setUser(response.data);
      } catch {
        setUser(null);
      }
    };
    checkAuth();
  }, [location.pathname]);

  // Check URL fragment for session_id synchronously
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }

  // Pages that should NOT show top nav
  const noNavPages = ["/", "/dashboard", "/payment/success", "/payment/cancel"];
  const showNav = !noNavPages.includes(location.pathname) && !location.pathname.startsWith("/admin");

  return (
    <>
      {showNav && <TopNav user={user} />}
      {/* Add padding at top for nav bar */}
      {showNav && <div className="h-16" />}
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      }>
      <Routes>
      <Route path="/" element={<LandingPage api={api} />} />
      <Route
        path="/menu"
        element={
          <PublicRoute>
            {({ user, api }) => <MainMenu user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {({ user, api }) => <Dashboard user={user} api={api} />}
          </ProtectedRoute>
        }
      />
      {/* PUBLIC ROUTES - Can view without login */}
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/support" element={<SupportCenter />} />
      <Route
        path="/demo"
        element={
          <PublicRoute>
            {({ user, api }) => <DemoExperience user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route path="/links" element={<LinksPage />} />
      <Route
        path="/yoga"
        element={
          <PublicRoute>
            {({ user, api }) => <YogaLibrary user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/breathwork"
        element={
          <PublicRoute>
            {({ user, api }) => <Breathwork user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/crystals"
        element={
          <PublicRoute>
            {({ user, api }) => <CrystalGuide user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/mantras"
        element={
          <PublicRoute>
            {({ user, api }) => <MantrasLibrary user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/mudras"
        element={
          <PublicRoute>
            {({ user, api }) => <MudrasLibrary user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/grounding"
        element={
          <PublicRoute>
            {({ user, api }) => <GroundingPractices user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/mindfulness"
        element={
          <PublicRoute>
            {({ user, api }) => <Mindfulness user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/meditations"
        element={
          <PublicRoute>
            {({ user, api }) => <Meditations user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/earth-altars"
        element={
          <PublicRoute>
            {({ user, api }) => <EarthAltars user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/creative-processes"
        element={
          <PublicRoute>
            {({ user, api }) => <CreativeProcesses user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/heart-practices"
        element={
          <PublicRoute>
            {({ user, api }) => <HeartPractices user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/shamanic-practices"
        element={
          <PublicRoute>
            {({ user, api }) => <ShamanicPractices user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/shamanic"
        element={
          <PublicRoute>
            {({ user, api }) => <ShamanicPractices user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/elemental-practices"
        element={
          <PublicRoute>
            {({ user, api }) => <ElementalPractices user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/elemental"
        element={
          <PublicRoute>
            {({ user, api }) => <ElementalPractices user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/creative"
        element={
          <PublicRoute>
            {({ user, api }) => <CreativeProcesses user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/live"
        element={
          <PublicRoute>
            {({ user, api }) => <LiveSessions user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/live/:sessionId"
        element={
          <PublicRoute>
            {({ user, api }) => <LiveSessionRoom user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/retreats"
        element={
          <PublicRoute>
            {({ user, api }) => <Retreats user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/courses"
        element={
          <PublicRoute>
            {({ user, api }) => <Courses user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/community"
        element={
          <PublicRoute>
            {({ user, api }) => <Community user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/books"
        element={
          <PublicRoute>
            {({ user, api }) => <Books user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/pricing"
        element={
          <PublicRoute>
            {({ user, api }) => <Pricing user={user} api={api} />}
          </PublicRoute>
        }
      />
      {/* PUBLIC CONTENT ROUTES */}
      <Route
        path="/oracle"
        element={
          <PublicRoute>
            {({ user, api }) => <OracleReadings user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/archangels"
        element={
          <PublicRoute>
            {({ user, api }) => <ArchangelOracle user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/astrology"
        element={
          <PublicRoute>
            {({ user, api }) => <AstrologyCalendar user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/somatic"
        element={
          <PublicRoute>
            {({ user, api }) => <SomaticMovement user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/favorites"
        element={
          <ProtectedRoute>
            {({ user, api }) => <Favorites user={user} api={api} />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/rituals"
        element={
          <ProtectedRoute>
            {({ user, api }) => <RitualBuilder user={user} api={api} />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/achievements"
        element={
          <ProtectedRoute>
            {({ user, api }) => <Achievements user={user} api={api} />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/journal"
        element={
          <ProtectedRoute>
            {({ user, api }) => <Journal user={user} api={api} />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            {({ user, api }) => <Settings user={user} api={api} />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/numerology"
        element={
          <PublicRoute>
            {({ user, api }) => <Numerology user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/birth-chart"
        element={
          <PublicRoute>
            {({ user, api }) => <BirthChart user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/seasonal-temple"
        element={
          <PublicRoute>
            {({ user, api }) => <SeasonalTemple user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/partner-yoga"
        element={
          <PublicRoute>
            {({ user, api }) => <PartnerYoga user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/rose-temple"
        element={
          <PublicRoute>
            {({ user, api }) => <RoseTemple user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/elemental-temples"
        element={
          <PublicRoute>
            {({ user, api }) => <ElementalTemples user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/masculine-temple"
        element={
          <PublicRoute>
            {({ user, api }) => <MasculineTemple user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/sunrise-sunset"
        element={
          <PublicRoute>
            {({ user, api }) => <SunriseSunsetPractices user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/rune-readings"
        element={
          <PublicRoute>
            {({ user, api }) => <RuneReadings user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/i-ching"
        element={
          <PublicRoute>
            {({ user, api }) => <IChing user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/light-codes"
        element={
          <PublicRoute>
            {({ user, api }) => <LightCodes user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/water-practices"
        element={
          <PublicRoute>
            {({ user, api }) => <WaterPractices user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/gene-keys"
        element={
          <PublicRoute>
            {({ user, api }) => <GeneKeys user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/human-design"
        element={
          <PublicRoute>
            {({ user, api }) => <HumanDesign user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/progress"
        element={
          <PublicRoute>
            {({ user, api }) => <ProgressDashboard user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/profile-calculator"
        element={
          <PublicRoute>
            {({ user, api }) => <ProfileCalculator user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/reviews"
        element={
          <PublicRoute>
            {({ user, api }) => <Reviews user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/ancient-wisdom"
        element={
          <PublicRoute>
            {({ user, api }) => <AncientWisdom user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/sound-frequencies"
        element={
          <PublicRoute>
            {({ user, api }) => <SoundFrequencies user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/tarot"
        element={
          <PublicRoute>
            {({ user, api }) => <TarotReading user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/sacred-guardians"
        element={
          <PublicRoute>
            {({ user, api }) => <SacredGuardians user={user} api={api} />}
          </PublicRoute>
        }
      />
      {/* Star Lineage Quiz */}
      <Route
        path="/star-lineage"
        element={
          <PublicRoute>
            {({ user, api }) => <StarLineageQuiz user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/star-lineage/result/:lineageId"
        element={
          <PublicRoute>
            {({ user, api }) => <StarLineageQuiz user={user} api={api} />}
          </PublicRoute>
        }
      />
      {/* Daily Sacred Practice */}
      <Route
        path="/daily-practice"
        element={
          <PublicRoute>
            {({ user, api }) => <DailySacredPractice user={user} api={api} />}
          </PublicRoute>
        }
      />
      {/* Self-Healing Modalities */}
      <Route
        path="/energy-healing"
        element={
          <PublicRoute>
            {({ user, api }) => <EnergyHealing user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/free-form-movement"
        element={
          <PublicRoute>
            {({ user, api }) => <FreeFormMovement user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/somatic-yoga"
        element={
          <PublicRoute>
            {({ user, api }) => <SomaticYoga user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/chakra-cleansing"
        element={
          <PublicRoute>
            {({ user, api }) => <ChakraCleansing user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/practice-journal"
        element={
          <PublicRoute>
            {({ user, api }) => <PracticeJournal user={user} api={api} />}
          </PublicRoute>
        }
      />
      <Route
        path="/videos"
        element={
          <PublicRoute>
            {({ user, api }) => <VideosLibrary user={user} api={api} />}
          </PublicRoute>
        }
      />
      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            {({ user, api }) => <AdminDashboard user={user} api={api} />}
          </AdminRoute>
        }
      />
      <Route
        path="/admin/manage/:collection"
        element={
          <AdminRoute>
            {({ user, api }) => <AdminSection user={user} api={api} />}
          </AdminRoute>
        }
      />
      {/* Legacy Admin CMS */}
      <Route
        path="/admin-legacy"
        element={
          <AdminRoute>
            {({ user, api }) => <AdminCMS user={user} api={api} />}
          </AdminRoute>
        }
      />
      {/* Protected Routes - Require Login */}
      <Route
        path="/practice-log"
        element={
          <ProtectedRoute>
            {({ user, api }) => <PracticeLog user={user} api={api} />}
          </ProtectedRoute>
        }
      />
      {/* Payment Routes */}
      <Route
        path="/payment/success"
        element={
          <ProtectedRoute>
            {({ user, api }) => <PaymentSuccess user={user} api={api} />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment/cancel"
        element={<PaymentCancel />}
      />
    </Routes>
      </Suspense>
    </>
  );
}

function App() {
  // Register service worker for offline support
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration.scope);
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    }
  }, []);

  return (
    <NotificationProvider>
      <div className="App grain-overlay min-h-screen flex flex-col">
        <BrowserRouter>
          <div className="flex-1">
            <AppRouter />
          </div>
          <AppFooter />
        </BrowserRouter>
        <Toaster position="bottom-right" />
        <InstallPrompt />
        <NotificationCenter />
      </div>
    </NotificationProvider>
  );
}

export default App;
