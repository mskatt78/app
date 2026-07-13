import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, ExternalLink, FileCheck2, FileText, HeartHandshake, Mail, ShieldCheck, Smartphone, Trash2, TriangleAlert } from "lucide-react";
import { Button } from "../components/ui/button";

export default function SupportCenter() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background" data-testid="support-center-page">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto p-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/5 transition-colors" data-testid="support-center-back-btn">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Support, legal, and account access</p>
            <h1 className="text-xl font-serif">Support <span className="italic text-primary">Center</span></h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.16),_transparent_35%),linear-gradient(135deg,rgba(8,10,14,0.96),rgba(6,8,12,0.92))] p-8" data-testid="support-center-hero">
          <p className="text-xs uppercase tracking-[0.28em] text-white/40 mb-3">App-store-ready essentials</p>
          <h2 className="text-4xl sm:text-5xl font-serif leading-[1.05] max-w-3xl">Everything needed for support, privacy, installation, and account help in one place.</h2>
          <p className="text-sm sm:text-base text-white/70 mt-5 max-w-2xl leading-relaxed">This page gives users a clear path for support questions, privacy information, install guidance, and account management actions like data export and deletion requests.</p>
        </section>

        <div className="grid gap-5 md:grid-cols-2">
          <section className="rounded-[1.75rem] border border-white/10 bg-card/60 p-6" data-testid="support-center-contact-card">
            <Mail className="w-6 h-6 text-primary mb-4" />
            <h3 className="text-2xl font-serif mb-3">Contact & support</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">For account help, wellness questions, content issues, or client support, contact the temple team directly.</p>
            <a href="mailto:skywatersacredembodiments@gmail.com" className="text-primary hover:underline" data-testid="support-center-email-link">skywatersacredembodiments@gmail.com</a>
          </section>

          <section className="rounded-[1.75rem] border border-white/10 bg-card/60 p-6" data-testid="support-center-install-card">
            <Smartphone className="w-6 h-6 text-primary mb-4" />
            <h3 className="text-2xl font-serif mb-3">Install the app</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">Use your browser’s install flow to save the temple like an app. For Apple users, installation must be completed from Safari.</p>
            <div className="rounded-xl border border-white/10 bg-black/25 p-4 mb-4" data-testid="support-center-ios-install-steps">
              <p className="text-xs uppercase tracking-wider text-primary mb-2">iPhone / iPad install steps</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Open this app in <span className="text-foreground">Safari</span>.</li>
                <li>Tap the <span className="text-foreground">Share</span> icon.</li>
                <li>Select <span className="text-foreground">Add to Home Screen</span>.</li>
                <li>Tap <span className="text-foreground">Add</span>.</li>
              </ol>
            </div>
            <Button variant="outline" onClick={() => navigate("/demo")} data-testid="support-center-demo-btn">Open the polished demo</Button>
            <Button
              className="ml-3"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("pwa-install-open", { detail: { source: "support", immediate: true } }));
              }}
              data-testid="support-center-install-now-btn"
            >
              Install Now
            </Button>
          </section>

          <section className="rounded-[1.75rem] border border-white/10 bg-card/60 p-6" data-testid="support-center-android-install-card">
            <Smartphone className="w-6 h-6 text-primary mb-4" />
            <h3 className="text-2xl font-serif mb-3">Android install steps</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">For Android users, use Chrome’s install prompt or browser menu to add the app to home screen.</p>
            <div className="rounded-xl border border-white/10 bg-black/25 p-4 mb-4" data-testid="support-center-android-install-steps">
              <p className="text-xs uppercase tracking-wider text-primary mb-2">Android quick install</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Open this app in <span className="text-foreground">Chrome</span>.</li>
                <li>Tap browser menu (<span className="text-foreground">⋮</span>).</li>
                <li>Select <span className="text-foreground">Install app</span> or <span className="text-foreground">Add to Home screen</span>.</li>
                <li>Confirm installation.</li>
              </ol>
            </div>
            <Button variant="outline" onClick={() => navigate("/app-readiness")} data-testid="support-center-android-readiness-btn">Open release checklist</Button>
          </section>

          <section className="rounded-[1.75rem] border border-amber-400/20 bg-amber-500/5 p-6 md:col-span-2" data-testid="support-center-install-troubleshoot-card">
            <TriangleAlert className="w-6 h-6 text-amber-300 mb-4" />
            <h3 className="text-2xl font-serif mb-3">Install troubleshooting (if icon won’t add)</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground leading-relaxed" data-testid="support-center-install-troubleshoot-steps">
              <li>Open the shared link in your default browser — avoid Instagram/Facebook/Messenger in-app browsers.</li>
              <li>iPhone/iPad: use Safari only, then Share → Add to Home Screen.</li>
              <li>Android: use Chrome, then menu (⋮) → Install app / Add to Home screen.</li>
              <li>If install still fails, reopen the app from this Support Center and retry from your default browser install flow.</li>
            </ol>
            <div className="flex flex-wrap gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => window.location.href = window.location.origin}
                data-testid="support-center-open-home-btn"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Re-open app home
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = window.location.origin + "/support"}
                data-testid="support-center-refresh-support-btn"
              >
                <Download className="w-4 h-4 mr-2" />
                Reload install guide
              </Button>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-white/10 bg-card/60 p-6" data-testid="support-center-readiness-card">
            <FileCheck2 className="w-6 h-6 text-primary mb-4" />
            <h3 className="text-2xl font-serif mb-3">App readiness checklist</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">Track final submission assets and listing prep with a dedicated launch checklist.</p>
            <Button variant="outline" onClick={() => navigate("/app-readiness")} data-testid="support-center-readiness-btn">Open readiness center</Button>
          </section>

          <section className="rounded-[1.75rem] border border-white/10 bg-card/60 p-6" data-testid="support-center-privacy-card">
            <ShieldCheck className="w-6 h-6 text-primary mb-4" />
            <h3 className="text-2xl font-serif mb-3">Privacy & policy</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">Read how your data is handled, stored, and protected inside the temple experience.</p>
            <Button variant="outline" onClick={() => navigate("/privacy")} data-testid="support-center-privacy-btn">Open privacy policy</Button>
          </section>

          <section className="rounded-[1.75rem] border border-white/10 bg-card/60 p-6" data-testid="support-center-terms-card">
            <FileText className="w-6 h-6 text-primary mb-4" />
            <h3 className="text-2xl font-serif mb-3">Terms of service</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">Review usage terms, wellness scope, and account responsibilities for app-store compliance.</p>
            <Button variant="outline" onClick={() => navigate("/terms")} data-testid="support-center-terms-btn">Open terms</Button>
          </section>

          <section className="rounded-[1.75rem] border border-white/10 bg-card/60 p-6 md:col-span-2" data-testid="support-center-account-card">
            <HeartHandshake className="w-6 h-6 text-primary mb-4" />
            <h3 className="text-2xl font-serif mb-3">Account actions</h3>
            <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <li className="flex gap-3"><Download className="w-4 h-4 mt-0.5 text-primary" /> Signed-in users can export their account data from Settings.</li>
              <li className="flex gap-3"><Trash2 className="w-4 h-4 mt-0.5 text-primary" /> Signed-in users can request account deletion from Settings.</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}