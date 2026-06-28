import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ClipboardList, Copy, ExternalLink, RotateCcw, Smartphone } from "lucide-react";
import { Checkbox } from "../components/ui/checkbox";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { migrateLocalToSession, removeSessionItem, setSessionItem } from "../utils/clientStorage";
import { toast } from "sonner";
import { appLogger } from "../utils/logger";

const STORAGE_KEY = "appStoreReadinessChecklistV1";

const assetChecklist = [
  {
    id: "icon-1024",
    title: "App icon 1024×1024 final brand-approved",
    hint: "Replace /frontend/public/app-icon-1024.png if final branding changes.",
  },
  {
    id: "iphone-screenshots",
    title: "iPhone screenshots prepared (6.7" + String.fromCharCode(34) + " and 6.5" + String.fromCharCode(34) + ")",
    hint: "Capture core flows: landing, dashboard, guided session, admin/demo proof.",
  },
  {
    id: "iphone-device-capture-plan",
    title: "Real-device iPhone capture plan completed",
    hint: "Use iPhone 15 Pro Max (1290×2796) or equivalent with native status bar visible.",
  },
  {
    id: "ipad-screenshots",
    title: "iPad screenshots prepared",
    hint: "Capture at least 2–4 key views for tablet moderation review.",
  },
  {
    id: "ipad-device-capture-plan",
    title: "Real-device iPad capture plan completed",
    hint: "Use 12.9-inch iPad screenshots and verify no clipped overlays or cut-off text.",
  },
  {
    id: "store-description",
    title: "Store listing copy finalized",
    hint: "Short description, long description, keywords, support contact.",
  },
  {
    id: "package-identifier",
    title: "Package identifier verified",
    hint: "Confirm package name is com.skywater.soultemple in submission forms.",
  },
  {
    id: "policy-links",
    title: "Public legal links verified",
    hint: "Ensure /privacy, /terms, and /support are reachable on production domain.",
  },
  {
    id: "demo-review-mode",
    title: "Demo path verified for reviewer walkthrough",
    hint: "Use /demo for an account-free product tour when helpful.",
  },
];

const qaChecklist = [
  {
    id: "ios-safari-install",
    title: "iOS install tested in Safari",
    hint: "Confirm Add to Home Screen flow works from iPhone/iPad Safari.",
  },
  {
    id: "android-install",
    title: "Android install tested in Chrome",
    hint: "Confirm browser install prompt appears and launches standalone mode.",
  },
  {
    id: "legal-routes-mobile",
    title: "Legal routes verified on mobile",
    hint: "Open /privacy, /terms, and /support on a phone-sized viewport.",
  },
  {
    id: "guided-session-pass",
    title: "Guided session parity smoke test passed",
    hint: "Validate a guided practice starts and timer UI remains stable through playback.",
  },
  {
    id: "offline-fallback",
    title: "Offline fallback tested",
    hint: "Confirm service worker fallback page is reachable when connection drops.",
  },
  {
    id: "screenshot-proof-log",
    title: "Screenshot proof log completed",
    hint: "Mark each required capture route/size complete in SCREENSHOT_SHOTLIST.md.",
  },
  {
    id: "metadata-cross-check",
    title: "Store metadata cross-check complete",
    hint: "App Store + Play Console values match this page and STORE_COPY_PACK.md.",
  },
];

const submissionMetadata = [
  {
    id: "package-name",
    label: "Package name",
    value: "com.skywater.soultemple",
  },
  {
    id: "support-url",
    label: "Support URL",
    value: "/support",
  },
  {
    id: "privacy-url",
    label: "Privacy URL",
    value: "/privacy",
  },
  {
    id: "terms-url",
    label: "Terms URL",
    value: "/terms",
  },
  {
    id: "reviewer-demo-path",
    label: "Reviewer demo path",
    value: "/demo",
  },
  {
    id: "admin-entry",
    label: "Admin entry path",
    value: "/admin",
  },
  {
    id: "ios-shot-dimensions",
    label: "iOS screenshot set",
    value: "6.7\" + 6.5\" portrait (real-device captures)",
  },
  {
    id: "ipad-shot-dimensions",
    label: "iPad screenshot set",
    value: "12.9\" portrait (real-device captures)",
  },
  {
    id: "shotlist-source",
    label: "Screenshot shot list source",
    value: "/submission_kit/SCREENSHOT_SHOTLIST.md",
  },
  {
    id: "review-notes-source",
    label: "Reviewer notes source",
    value: "/submission_kit/LEGAL_LINKS_AND_REVIEWER_NOTES.md",
  },
];

const realDeviceShotList = [
  {
    id: "shot-home",
    title: "Hero / Home",
    route: "/",
    requirement: "Primary CTA + sacred visual identity clearly visible",
  },
  {
    id: "shot-guided",
    title: "Guided Session In Progress",
    route: "/somatic (open guided overlay)",
    requirement: "Timer + active narration controls visible",
  },
  {
    id: "shot-breathwork",
    title: "Breathwork + Soundscape",
    route: "/breathwork",
    requirement: "Ambient sound selector visible",
  },
  {
    id: "shot-mantra",
    title: "Mantra deep modal",
    route: "/mantras",
    requirement: "Ritual/Ceremony/Guided sections visible",
  },
  {
    id: "shot-mudra",
    title: "Mudra deep modal",
    route: "/mudras",
    requirement: "Embodiment depth and guided CTA visible",
  },
  {
    id: "shot-admin",
    title: "Admin command center",
    route: "/admin",
    requirement: "Unified admin controls visible",
  },
  {
    id: "shot-legal",
    title: "Legal/Support proof",
    route: "/privacy or /terms or /support",
    requirement: "Public legal/support route clearly visible",
  },
  {
    id: "shot-install",
    title: "Install-ready proof",
    route: "landing or top nav",
    requirement: "Install CTA visible",
  },
];

function readSavedChecklist() {
  try {
    const raw = migrateLocalToSession(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

export default function AppStoreReadiness() {
  const navigate = useNavigate();
  const [checks, setChecks] = useState(() => readSavedChecklist());

  const completed = useMemo(
    () => assetChecklist.filter((item) => checks[item.id]).length,
    [checks],
  );
  const qaCompleted = useMemo(
    () => qaChecklist.filter((item) => checks[item.id]).length,
    [checks],
  );
  const percent = Math.round((completed / assetChecklist.length) * 100);
  const qaPercent = Math.round((qaCompleted / qaChecklist.length) * 100);
  const totalComplete = completed + qaCompleted;
  const totalChecks = assetChecklist.length + qaChecklist.length;
  const totalPercent = Math.round((totalComplete / totalChecks) * 100);

  const updateCheck = (id, value) => {
    setChecks((prev) => {
      const next = { ...prev, [id]: Boolean(value) };
      setSessionItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const resetChecklist = () => {
    removeSessionItem(STORAGE_KEY);
    setChecks({});
  };

  const copyMetadataValue = async (label, value) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch (error) {
      appLogger.error("Clipboard copy failed", error);
      toast.error("Could not copy value");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="app-readiness-page">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto p-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-white/5 transition-colors"
            data-testid="app-readiness-back-btn"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Final launch operations</p>
            <h1 className="text-xl font-serif">App Store <span className="italic text-primary">Readiness</span></h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(250,204,21,0.2),_transparent_40%),linear-gradient(135deg,rgba(8,10,14,0.96),rgba(6,8,12,0.92))] p-8" data-testid="app-readiness-hero">
          <p className="text-xs uppercase tracking-[0.28em] text-white/45 mb-3">Submission command center</p>
          <h2 className="text-4xl sm:text-5xl font-serif leading-[1.05] max-w-3xl">Track every final item before App Store and Play review.</h2>
          <p className="text-sm sm:text-base text-white/75 mt-5 max-w-2xl leading-relaxed">
            Technical readiness is complete. Use this checklist to confirm your final assets and listing materials are fully packaged before submission.
          </p>
        </section>

        <section className="rounded-[1.75rem] border border-white/10 bg-card/70 p-6" data-testid="app-readiness-progress-card">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-serif">Submission asset checklist</h3>
            </div>
            <span className="text-sm text-muted-foreground" data-testid="app-readiness-progress-text">
              {completed}/{assetChecklist.length} complete ({percent}%)
            </span>
          </div>
          <Progress value={percent} className="h-2.5" data-testid="app-readiness-progress-bar" />

          <div className="mt-6 space-y-4">
            {assetChecklist.map((item) => (
              <label
                key={item.id}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-4"
                data-testid={`app-readiness-item-${item.id}`}
              >
                <Checkbox
                  checked={Boolean(checks[item.id])}
                  onCheckedChange={(value) => updateCheck(item.id, value)}
                  data-testid={`app-readiness-checkbox-${item.id}`}
                />
                <div className="flex-1">
                  <p className="text-sm sm:text-base font-medium text-foreground">{item.title}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{item.hint}</p>
                </div>
                {checks[item.id] ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1" /> : null}
              </label>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <Button
              variant="outline"
              onClick={resetChecklist}
              className="border-white/15"
              data-testid="app-readiness-reset-btn"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset checklist
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/support")}
              className="border-white/15"
              data-testid="app-readiness-open-support-btn"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open support center
            </Button>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-white/10 bg-card/70 p-6" data-testid="app-readiness-qa-card">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-serif">Release QA checklist</h3>
            </div>
            <span className="text-sm text-muted-foreground" data-testid="app-readiness-qa-progress-text">
              {qaCompleted}/{qaChecklist.length} complete ({qaPercent}%)
            </span>
          </div>
          <Progress value={qaPercent} className="h-2.5" data-testid="app-readiness-qa-progress-bar" />

          <div className="mt-6 space-y-4">
            {qaChecklist.map((item) => (
              <label
                key={item.id}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-4"
                data-testid={`app-readiness-qa-item-${item.id}`}
              >
                <Checkbox
                  checked={Boolean(checks[item.id])}
                  onCheckedChange={(value) => updateCheck(item.id, value)}
                  data-testid={`app-readiness-qa-checkbox-${item.id}`}
                />
                <div className="flex-1">
                  <p className="text-sm sm:text-base font-medium text-foreground">{item.title}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{item.hint}</p>
                </div>
                {checks[item.id] ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1" /> : null}
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-white/10 bg-card/70 p-6" data-testid="app-readiness-metadata-card">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-serif">Submission metadata pack</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-5" data-testid="app-readiness-metadata-note">
            Keep these values consistent in App Store Connect and Google Play Console forms.
          </p>

          <div className="grid gap-3 md:grid-cols-2" data-testid="app-readiness-metadata-grid">
            {submissionMetadata.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-white/10 bg-black/20 p-4"
                data-testid={`app-readiness-metadata-${item.id}`}
              >
                <p className="text-xs uppercase tracking-wider text-white/55 mb-2">{item.label}</p>
                <div className="flex items-center justify-between gap-3">
                  <code className="text-sm text-foreground break-all" data-testid={`app-readiness-metadata-value-${item.id}`}>
                    {item.value}
                  </code>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-white/15"
                    onClick={() => copyMetadataValue(item.label, item.value)}
                    data-testid={`app-readiness-copy-${item.id}`}
                  >
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-white/10 bg-card/70 p-6" data-testid="app-readiness-real-device-shotlist-card">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-serif">Real-device screenshot shot list</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-5" data-testid="app-readiness-real-device-shotlist-note">
            Per your workflow preference, capture these manually on physical devices, then mark completion in the submission docs.
          </p>

          <div className="space-y-3" data-testid="app-readiness-real-device-shotlist-grid">
            {realDeviceShotList.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-white/10 bg-black/20 p-4"
                data-testid={`app-readiness-real-device-shot-${item.id}`}
              >
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="text-xs text-white/70 mt-1">Route: <code>{item.route}</code></p>
                <p className="text-xs text-muted-foreground mt-1">Requirement: {item.requirement}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          className="rounded-[1.5rem] border border-primary/30 bg-primary/10 p-5 flex flex-wrap items-center justify-between gap-4"
          data-testid="app-readiness-launch-status"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary/80">Launch status</p>
            <h3 className="text-xl font-serif mt-1">Submission Confidence: {totalPercent}%</h3>
            <p className="text-sm text-muted-foreground mt-1">{totalComplete}/{totalChecks} readiness checks completed.</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/support")} data-testid="app-readiness-launch-support-btn">
            <ExternalLink className="w-4 h-4 mr-2" />
            Review support checklist
          </Button>
        </section>

        <section className="grid gap-5 md:grid-cols-3" data-testid="app-readiness-links-grid">
          <article className="rounded-[1.5rem] border border-white/10 bg-card/60 p-5">
            <Smartphone className="w-5 h-5 text-primary mb-3" />
            <h4 className="font-serif text-lg mb-2">Demo for reviewers</h4>
            <p className="text-sm text-muted-foreground mb-4">Showcase the app without requiring login friction.</p>
            <Button variant="outline" onClick={() => navigate("/demo")} data-testid="app-readiness-open-demo-btn">Open demo</Button>
          </article>

          <article className="rounded-[1.5rem] border border-white/10 bg-card/60 p-5">
            <CheckCircle2 className="w-5 h-5 text-primary mb-3" />
            <h4 className="font-serif text-lg mb-2">Privacy policy</h4>
            <p className="text-sm text-muted-foreground mb-4">Required link for App Store and Play Console metadata.</p>
            <Button variant="outline" onClick={() => navigate("/privacy")} data-testid="app-readiness-open-privacy-btn">Open privacy</Button>
          </article>

          <article className="rounded-[1.5rem] border border-white/10 bg-card/60 p-5">
            <CheckCircle2 className="w-5 h-5 text-primary mb-3" />
            <h4 className="font-serif text-lg mb-2">Terms of service</h4>
            <p className="text-sm text-muted-foreground mb-4">Legal scope and user agreement reference for store review.</p>
            <Button variant="outline" onClick={() => navigate("/terms")} data-testid="app-readiness-open-terms-btn">Open terms</Button>
          </article>
        </section>
      </main>
    </div>
  );
}