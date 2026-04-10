import { useEffect, useState } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import axios from "axios";
import { Toaster } from "./components/ui/sonner";
import AppFooter from "./components/AppFooter";
import TopNav from "./components/TopNav";
import InstallPrompt from "./components/InstallPrompt";
import { NotificationProvider, NotificationCenter } from "./components/NotificationSystem";
import { AppRoutes } from "./routes/AppRoutes";
import { AdminRoute, AuthCallback, ProtectedRoute, PublicRoute } from "./routes/routeGuards";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ADMIN_EMAILS = [
  "skywatersacredembodiments@gmail.com",
  "mskatt78@gmail.com",
].map((email) => email.toLowerCase());

const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

function AppRouter() {
  const location = useLocation();
  const [user, setUser] = useState(null);

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

  if (location.hash?.includes("session_id=")) {
    return <AuthCallback api={api} />;
  }

  const noNavPages = ["/", "/dashboard", "/payment/success", "/payment/cancel"];
  const showNav = !noNavPages.includes(location.pathname) && !location.pathname.startsWith("/admin");

  return (
    <>
      {showNav && <TopNav user={user} />}
      {showNav && <div className="h-16" />}

      <AppRoutes
        api={api}
        PublicRoute={PublicRoute}
        ProtectedRoute={ProtectedRoute}
        AdminRoute={AdminRoute}
        adminEmails={ADMIN_EMAILS}
      />
    </>
  );
}

function RouteScrollManager() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <NotificationProvider>
      <div className="App grain-overlay min-h-screen flex flex-col">
        <BrowserRouter>
          <RouteScrollManager />
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
