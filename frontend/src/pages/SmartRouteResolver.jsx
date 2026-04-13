import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const resolveLegacyPath = (rawPathname) => {
  const cleaned = (rawPathname || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  if (
    cleaned.includes("dailypractice") ||
    cleaned.includes("todaysguidance") ||
    cleaned.includes("dailysacredpractice")
  ) {
    return "/daily-practice";
  }

  if (cleaned.includes("humandesigncalculator") || cleaned.includes("hdcalculator")) {
    return "/profile-calculator";
  }

  return "/menu";
};

export default function SmartRouteResolver() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const target = resolveLegacyPath(location.pathname);
    navigate(target, { replace: true });
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6" data-testid="smart-route-resolver">
      <p className="text-sm text-muted-foreground">Taking you to the right page…</p>
    </div>
  );
}
