import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getStoredAdminToken } from "../components/admin/adminSession";

export const AuthCallback = ({ api }) => {
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      const hash = window.location.hash;
      const sessionIdMatch = hash.match(/session_id=([^&]+)/);

      if (!sessionIdMatch) {
        navigate("/", { replace: true });
        return;
      }

      const sessionId = sessionIdMatch[1];
      try {
        const response = await api.post("/auth/session", { session_id: sessionId });
        window.history.replaceState(null, "", window.location.pathname);
        navigate("/dashboard", { state: { user: response.data }, replace: true });
      } catch {
        navigate("/", { replace: true });
      }
    };

    processAuth();
  }, [api, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground font-serif italic">Connecting to the spirits...</p>
      </div>
    </div>
  );
};

export const ProtectedRoute = ({ children, api }) => {
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
      } catch {
        setIsAuthenticated(false);
        navigate("/", { replace: true });
      }
    };

    checkAuth();
  }, [api, location.state, navigate]);

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

export const AdminRoute = ({ children, api, adminEmails }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [user, setUser] = useState(location.state?.user || null);

  useEffect(() => {
    const checkAdmin = async () => {
      const storedAdminToken = getStoredAdminToken();
      if (storedAdminToken) {
        setIsAuthorized(true);
        return;
      }

      try {
        const response = await api.get("/auth/me");
        const userData = response.data;
        setUser(userData);

        const userEmail = (userData.email || "").toLowerCase();
        const isAdmin = adminEmails.includes(userEmail) || userData.is_admin === true;

        if (isAdmin) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          toast.error("Admin access required");
          navigate("/dashboard", { replace: true });
        }
      } catch {
        setIsAuthorized(false);
        toast.error("Please sign in to access admin");
        navigate("/", { replace: true });
      }
    };

    checkAdmin();
  }, [adminEmails, api, navigate]);

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

export const PublicRoute = ({ children, api }) => {
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
      } catch {
        setUser(null);
      }
      setChecked(true);
    };

    checkAuth();
  }, [api, location.state]);

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
