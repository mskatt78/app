import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { appLogger } from "../utils/logger";

export const AuthCallback = ({ api }) => {
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  const processAuth = useCallback(async () => {
    const hash = window.location.hash;
    const sessionIdMatch = hash.match(/session_id=([^&]+)/);

    if (!sessionIdMatch) {
      navigate("/", { replace: true });
      return;
    }

    const sessionId = sessionIdMatch[1];
    try {
      const { data } = await api.post("/auth/session", { session_id: sessionId });
      window.history.replaceState(null, "", window.location.pathname);
      navigate("/dashboard", { state: { user: data }, replace: true });
    } catch (error) {
      appLogger.error("Auth callback processing failed", error);
      navigate("/", { replace: true });
    }
  }, [api, navigate, locationStateUser]);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;
    queueMicrotask(() => processAuth());
  }, [processAuth]);

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
  const locationStateUser = location.state?.user || null;
  const [isAuthenticated, setIsAuthenticated] = useState(locationStateUser ? true : null);
  const [user, setUser] = useState(locationStateUser);
  const [hasAuthError, setHasAuthError] = useState(false);
  const isMountedRef = useRef(true);
  const lastKnownAuthRef = useRef(Boolean(locationStateUser));

  const checkAuth = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      if (!isMountedRef.current) return;
      setUser(data);
      setHasAuthError(false);
      lastKnownAuthRef.current = true;
      setIsAuthenticated(true);
    } catch (error) {
      if (!isMountedRef.current) return;
      appLogger.warn("Protected route auth check failed", error);
      const status = error?.response?.status;
      const sessionRejected = status === 401 || status === 403;
      setHasAuthError(true);

      // Only a confirmed authentication rejection should send someone back to sign-in.
      // Mobile/TWA network hand-offs and brief backend outages must not masquerade as logout.
      if (sessionRejected) {
        setIsAuthenticated(false);
        navigate("/", { replace: true });
        return;
      }

      if (locationStateUser || lastKnownAuthRef.current) {
        setIsAuthenticated(true);
        return;
      }

      // Keep the protected shell in a recoverable state rather than bouncing to login.
      setIsAuthenticated(null);
    }
  }, [api, navigate, locationStateUser]);

  useEffect(() => {
    isMountedRef.current = true;

    queueMicrotask(() => {
      if (locationStateUser) {
        setUser(locationStateUser);
        setIsAuthenticated(true);
      }

      checkAuth();
    });

    return () => {
      isMountedRef.current = false;
    };
  }, [checkAuth, locationStateUser]);

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
  const locationStateUser = location.state?.user || null;
  const [user, setUser] = useState(locationStateUser);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const checkAdmin = useCallback(async () => {
    const lockedAdminEmails = [
      "mskatt78@gmail.com",
      "skywatersacredembodiments@gmail.com",
    ];
    try {
      const { data: userData } = await api.get("/auth/me");
      setUser(userData);

      const userEmail = (userData.email || "").toLowerCase();
      const effectiveAdminEmails = Array.from(new Set([...(adminEmails || []), ...lockedAdminEmails]));
      const isAdmin = effectiveAdminEmails.includes(userEmail);

      if (isAdmin) {
        setIsAuthorized(true);
        return;
      }
    } catch (error) {
      appLogger.warn("Admin route /auth/me check failed, trying cookie fallback", error);
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
      appLogger.error("Admin route cookie validation failed", error);
      setIsAuthorized(false);
      toast.error("Please sign in to access admin");
      navigate("/", { replace: true });
    }
  }, [adminEmails, api, backendUrl, navigate]);

  useEffect(() => {
    queueMicrotask(() => {
      if (locationStateUser) {
        setUser(locationStateUser);
      }
      checkAdmin();
    });
  }, [checkAdmin, locationStateUser]);

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
  const locationStateUser = location.state?.user || null;
  const [user, setUser] = useState(locationStateUser);
  const [checked, setChecked] = useState(Boolean(locationStateUser));
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    queueMicrotask(() => {
      if (!isMountedRef.current) return;
      setUser(locationStateUser || null);
      setChecked(true);
    });

    return () => {
      isMountedRef.current = false;
    };
  }, [locationStateUser]);

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
