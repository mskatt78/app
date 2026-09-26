import { useLocation } from "react-router-dom";
import { versioned } from "../lib/assetVersion";

const ROUTE_BACKGROUNDS = [
  { test: /^\/masculine-temple/, image: versioned("/images/masculine-temple-bg.jpg"), position: "center 35%" },
  { test: /^\/(astrology|birth-chart|numerology|sunrise-sunset|i-ching|rune-readings|oracle|archangel|human-design|light-codes|mystery)/, image: versioned("/images/bg-cosmic.jpg"), position: "center top" },
  { test: /^\/(breathwork|meditations|water|sound|frequencies|sleep|dream)/, image: versioned("/images/bg-water.jpg"), position: "center 40%" },
];

const DEFAULT_BACKGROUND = { image: versioned("/images/hero-main.jpg"), position: "center 22%" };

export const TempleAmbientBackground = () => {
  const { pathname } = useLocation();
  const bg = ROUTE_BACKGROUNDS.find((b) => b.test.test(pathname)) || DEFAULT_BACKGROUND;
  return (
    <div
      aria-hidden="true"
      className="temple-ambient-bg"
      data-testid="temple-ambient-bg"
      style={{ backgroundImage: `url('${bg.image}')`, backgroundPosition: bg.position }}
    />
  );
};
