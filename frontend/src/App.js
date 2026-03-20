import { useEffect, useState, useRef } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import AppFooter from "./components/AppFooter";
import TopNav from "./components/TopNav";
import InstallPrompt from "./components/InstallPrompt";

// Pages
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import YogaLibrary from "./pages/YogaLibrary";
import OracleReadings from "./pages/OracleReadings";
import Breathwork from "./pages/Breathwork";
import AstrologyCalendar from "./pages/AstrologyCalendar";
import CrystalGuide from "./pages/CrystalGuide";
import MantrasLibrary from "./pages/MantrasLibrary";
import MudrasLibrary from "./pages/MudrasLibrary";
import SomaticMovement from "./pages/SomaticMovement";
import GroundingPractices from "./pages/GroundingPractices";
import Favorites from "./pages/Favorites";
import RitualBuilder from "./pages/RitualBuilder";
import Achievements from "./pages/Achievements";
import Journal from "./pages/Journal";
import Settings from "./pages/Settings";
import Mindfulness from "./pages/Mindfulness";
import Meditations from "./pages/Meditations";
import Numerology from "./pages/Numerology";
import AdminCMS from "./pages/AdminCMS";
// New Shamanic Pages
import PracticeLog from "./pages/PracticeLog";
import EarthAltars from "./pages/EarthAltars";
import CreativeProcesses from "./pages/CreativeProcesses";
import HeartPractices from "./pages/HeartPractices";
import ShamanicPractices from "./pages/ShamanicPractices";
import ElementalPractices from "./pages/ElementalPractices";
import MainMenu from "./pages/MainMenu";
// New Content Pages
import LiveSessions from "./pages/LiveSessions";
import Retreats from "./pages/Retreats";
import Books from "./pages/Books";
// Payment Pages
import Pricing from "./pages/Pricing";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
// Birth Chart
import BirthChart from "./pages/BirthChart";

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
  const noNavPages = ["/", "/dashboard", "/admin", "/payment/success", "/payment/cancel"];
  const showNav = !noNavPages.includes(location.pathname);

  return (
    <>
      {showNav && <TopNav user={user} />}
      {/* Add padding at top for nav bar */}
      {showNav && <div className="h-16" />}
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
        path="/retreats"
        element={
          <PublicRoute>
            {({ user, api }) => <Retreats user={user} api={api} />}
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
        path="/admin"
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
    </>
  );
}

function App() {
  return (
    <div className="App grain-overlay min-h-screen flex flex-col">
      <BrowserRouter>
        <div className="flex-1">
          <AppRouter />
        </div>
        <AppFooter />
      </BrowserRouter>
      <Toaster position="bottom-right" />
      <InstallPrompt />
    </div>
  );
}

export default App;
