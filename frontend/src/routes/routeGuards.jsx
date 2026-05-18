import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
      } catch (error) {
        console.error("Auth callback processing failed:", error);
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
  const [hasAuthError, setHasAuthError] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    if (location.state?.user) {
      setUser(location.state.user);
      setIsAuthenticated(true);
    }

    const checkAuth = async () => {
      try {
        const response = await api.get("/auth/me");
        if (!isMountedRef.current) return;
        setUser(response.data);
        setHasAuthError(false);
        setIsAuthenticated(true);
      } catch (error) {
        if (!isMountedRef.current) return;
        console.error("Protected route auth check failed:", error);
        setHasAuthError(true);
        setIsAuthenticated(false);
        navigate("/", { replace: true });
      }
    };

    checkAuth();

    return () => {
      isMountedRef.current = false;
    };
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6" data-testid="protected-route-redirect-screen">
        <div className="text-center max-w-sm space-y-3">
          <p className="text-lg font-serif">Session expired</p>
          <p className="text-sm text-muted-foreground">
            {hasAuthError ? "Please reopen the app from the latest link and sign in again." : "Redirecting to sign in..."}
          </p>
        </div>
      </div>
    );
  }
  return children({ user, api });
};

export const AdminRoute = ({ children, api, adminEmails }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [user, setUser] = useState(location.state?.user || null);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await api.get("/auth/me");
        const userData = response.data;
        setUser(userData);

        const userEmail = (userData.email || "").toLowerCase();
        const isAdmin = adminEmails.includes(userEmail) || userData.is_admin === true;

        if (isAdmin) {
          setIsAuthorized(true);
          return;
        }
      } catch (error) {
        console.error("Admin route /auth/me check failed, trying cookie fallback:", error);
      }

      try {
        const response = await fetch(`${backendUrl}/api/admin/collections`, { credentials: "include" });
        if (response.ok) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          toast.error("Admin access required");
          navigate("/dashboard", { replace: true });
        }
      } catch (error) {
        console.error("Admin route cookie validation failed:", error);
        setIsAuthorized(false);
        toast.error("Please sign in to access admin");
        navigate("/", { replace: true });
      }
    };

    checkAdmin();
  }, [adminEmails, api, backendUrl, navigate]);

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
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    if (location.state?.user) {
      setUser(location.state.user);
    }

    const checkAuth = async () => {
      try {
        const response = await api.get("/auth/me");
        if (!isMountedRef.current) return;
        setUser(response.data);
      } catch (error) {
        if (!isMountedRef.current) return;
        console.error("Public route auth check failed:", error);
        setUser(null);
      }
      if (!isMountedRef.current) return;
      setChecked(true);
    };

    checkAuth();

    return () => {
      isMountedRef.current = false;
    };
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
