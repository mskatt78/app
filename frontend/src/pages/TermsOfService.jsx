import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="terms-page">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto p-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-white/5 transition-colors"
            data-testid="terms-back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-serif">Terms of Service</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-8" data-testid="terms-content">
        <p className="text-sm text-muted-foreground">Last updated: March 2026</p>

        <section className="space-y-3">
          <h2 className="text-xl font-serif text-primary">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By using Shamanic Elements Soul Temple 2.0, you agree to these terms. If you do not agree,
            please discontinue use of the app.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif text-primary">2. Wellness and Educational Use</h2>
          <p className="text-muted-foreground leading-relaxed">
            This app provides spiritual and wellness content for educational purposes only. It is not a
            substitute for medical, psychiatric, legal, or financial advice. If you are experiencing a
            health emergency, contact a licensed professional immediately.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif text-primary">3. Account Responsibilities</h2>
          <p className="text-muted-foreground leading-relaxed">
            You are responsible for maintaining the confidentiality of your account credentials and for all
            activity under your account.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif text-primary">4. Payments and Premium Access</h2>
          <p className="text-muted-foreground leading-relaxed">
            Purchases for premium experiences and courses are processed through third-party payment providers.
            Access rules, renewals, and purchase confirmations are shown in-app at checkout.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif text-primary">5. User Content and Conduct</h2>
          <p className="text-muted-foreground leading-relaxed">
            You retain ownership of content you submit (journal entries, comments, and reflections), while
            granting the app a limited license to display and process it to provide the service. Content that
            is abusive, unlawful, or harmful may be removed.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif text-primary">6. Service Availability</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update features, content, and integrations over time. Temporary downtime may occur for
            maintenance, upgrades, or provider outages.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif text-primary">7. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            Questions about these terms can be sent to <span className="text-primary">skywatersacredembodiments@gmail.com</span>.
          </p>
        </section>
      </main>
    </div>
  );
}