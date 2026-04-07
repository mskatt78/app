import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="privacy-policy-page">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto p-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-white/5 transition-colors"
            data-testid="privacy-policy-back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-serif">Privacy Policy</h1>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto p-6 space-y-8" data-testid="privacy-policy-content">
        <p className="text-sm text-muted-foreground" data-testid="privacy-policy-updated">Last updated: March 2026</p>
        
        <section className="space-y-3" data-testid="privacy-policy-introduction">
          <h2 className="text-xl font-serif text-primary">Introduction</h2>
          <p className="text-muted-foreground leading-relaxed">
            Shamanic Elements Soul Temple 2.0 ("we", "our", or "us") respects your privacy
            and is committed to protecting your personal data. This policy explains how we
            collect, use, and safeguard information when you use the app.
          </p>
        </section>
        
        <section className="space-y-3" data-testid="privacy-policy-collected-data">
          <h2 className="text-xl font-serif text-primary">Information We Collect</h2>
          <p className="text-muted-foreground">We may collect the following types of information:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
            <li><strong className="text-foreground">Account Information:</strong> Name, email address, and authentication details.</li>
            <li><strong className="text-foreground">Usage Data:</strong> Features used, app interaction patterns, and session activity.</li>
            <li><strong className="text-foreground">Birth Chart Data:</strong> Birth date, time, and location for chart generation.</li>
            <li><strong className="text-foreground">Device Information:</strong> Device type, OS, and app version for reliability and support.</li>
          </ul>
        </section>
        
        <section className="space-y-3" data-testid="privacy-policy-usage">
          <h2 className="text-xl font-serif text-primary">How We Use Your Information</h2>
          <p className="text-muted-foreground">We use your information to:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
            <li>Provide and maintain temple features and guided practices</li>
            <li>Personalize your experience and saved progress</li>
            <li>Generate birth chart and numerology outputs</li>
            <li>Support account, billing, and premium access operations</li>
            <li>Improve reliability, quality, and app safety</li>
          </ul>
        </section>
        
        <section className="space-y-3" data-testid="privacy-policy-storage-security">
          <h2 className="text-xl font-serif text-primary">Data Storage and Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            Data is stored on secure infrastructure with technical controls designed to prevent
            unauthorized access, alteration, or misuse.
          </p>
        </section>
        
        <section className="space-y-3" data-testid="privacy-policy-third-party">
          <h2 className="text-xl font-serif text-primary">Third-Party Services</h2>
          <p className="text-muted-foreground">The app may use third-party services including:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
            <li><strong className="text-foreground">Google Authentication:</strong> Optional sign-in support.</li>
            <li><strong className="text-foreground">Payment Providers:</strong> Premium purchases and subscriptions.</li>
            <li><strong className="text-foreground">AI Services:</strong> Guided narration and spiritual content generation.</li>
          </ul>
        </section>
        
        <section className="space-y-3" data-testid="privacy-policy-rights">
          <h2 className="text-xl font-serif text-primary">Your Rights</h2>
          <p className="text-muted-foreground">You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Withdraw consent where applicable</li>
            <li>Export your data</li>
          </ul>
          <p className="text-sm text-muted-foreground" data-testid="privacy-policy-account-actions-note">
            Signed-in users can request data export and deletion from <span className="text-foreground">Settings</span>.
          </p>
        </section>
        
        <section className="space-y-3" data-testid="privacy-policy-children">
          <h2 className="text-xl font-serif text-primary">Children's Privacy</h2>
          <p className="text-muted-foreground leading-relaxed">
            This app is not intended for children under 13 years of age. We do not knowingly
            collect personal information from children under 13.
          </p>
        </section>
        
        <section className="space-y-3" data-testid="privacy-policy-updates">
          <h2 className="text-xl font-serif text-primary">Changes to This Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update this policy over time. Updates will be published on this page with the
            latest revision date.
          </p>
        </section>
        
        <section className="space-y-3" data-testid="privacy-policy-contact">
          <h2 className="text-xl font-serif text-primary">Contact Us</h2>
          <p className="text-muted-foreground">If you have questions about this policy, contact us at:</p>
          <p className="text-primary" data-testid="privacy-policy-contact-email">skywatersacredembodiments@gmail.com</p>
        </section>
        
        <div className="mt-8 pt-8 border-t border-white/10 text-center text-muted-foreground" data-testid="privacy-policy-footer">
          <p>Shamanic Elements Soul Temple 2.0</p>
          <p>© 2026 All Rights Reserved</p>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
