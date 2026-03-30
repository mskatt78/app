import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, FileText, HeartHandshake, Mail, ShieldCheck, Smartphone, Trash2 } from "lucide-react";
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
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">Use your browser’s “Add to Home Screen” or install prompt to save the temple like an app. On iPhone, tap Share → Add to Home Screen.</p>
            <Button variant="outline" onClick={() => navigate("/demo")} data-testid="support-center-demo-btn">Open the polished demo</Button>
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