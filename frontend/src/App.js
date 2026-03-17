import { useEffect, useState, useRef } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Toaster } from "./components/ui/sonner";
import AppFooter from "./components/AppFooter";

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
// New Content Pages
import LiveSessions from "./pages/LiveSessions";
import Retreats from "./pages/Retreats";
import Books from "./pages/Books";

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

// App Router
function AppRouter() {
  const location = useLocation();

  // Check URL fragment for session_id synchronously
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage api={api} />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {({ user, api }) => <Dashboard user={user} api={api} />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/yoga"
        element={
          <ProtectedRoute>
            {({ user, api }) => <YogaLibrary user={user} api={api} />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/oracle"
        element={
          <ProtectedRoute>
            {({ user, api }) => <OracleReadings user={user} api={api} />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/breathwork"
        element={
          <ProtectedRoute>
            {({ user, api }) => <Breathwork user={user} api={api} />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/astrology"
        element={
          <ProtectedRoute>
            {({ user, api }) => <AstrologyCalendar user={user} api={api} />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/crystals"
        element={
          <ProtectedRoute>
            {({ user, api }) => <CrystalGuide user={user} api={api} />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/mantras"
        element={
          <ProtectedRoute>
            {({ user, api }) => <MantrasLibrary user={user} api={api} />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/mudras"
        element={
          <ProtectedRoute>
            {({ user, api }) => <MudrasLibrary user={user} api={api} />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/somatic"
        element={
          <ProtectedRoute>
            {({ user, api }) => <SomaticMovement user={user} api={api} />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/grounding"
        element={
          <ProtectedRoute>
            {({ user, api }) => <GroundingPractices user={user} api={api} />}
          </ProtectedRoute>
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
        path="/mindfulness"
        element={
          <ProtectedRoute>
            {({ user, api }) => <Mindfulness user={user} api={api} />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/meditations"
        element={
          <ProtectedRoute>
            {({ user, api }) => <Meditations user={user} api={api} />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/numerology"
        element={
          <ProtectedRoute>
            {({ user, api }) => <Numerology user={user} api={api} />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            {({ user, api }) => <AdminCMS user={user} api={api} />}
          </ProtectedRoute>
        }
      />
      {/* New Shamanic Routes */}
      <Route
        path="/practice-log"
        element={
          <ProtectedRoute>
            {({ user, api }) => <PracticeLog user={user} api={api} />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/earth-altars"
        element={
          <ProtectedRoute>
            {({ user, api }) => <EarthAltars user={user} api={api} />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/creative-processes"
        element={
          <ProtectedRoute>
            {({ user, api }) => <CreativeProcesses user={user} api={api} />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/heart-practices"
        element={
          <ProtectedRoute>
            {({ user, api }) => <HeartPractices user={user} api={api} />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/shamanic-practices"
        element={
          <ProtectedRoute>
            {({ user, api }) => <ShamanicPractices user={user} api={api} />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/elemental-practices"
        element={
          <ProtectedRoute>
            {({ user, api }) => <ElementalPractices user={user} api={api} />}
          </ProtectedRoute>
        }
      />
      {/* New Content Routes */}
      <Route
        path="/live"
        element={
          <ProtectedRoute>
            {({ user, api }) => <LiveSessions user={user} api={api} />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/retreats"
        element={
          <ProtectedRoute>
            {({ user, api }) => <Retreats user={user} api={api} />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/books"
        element={
          <ProtectedRoute>
            {({ user, api }) => <Books user={user} api={api} />}
          </ProtectedRoute>
        }
      />
    </Routes>
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
    </div>
  );
}

export default App;
