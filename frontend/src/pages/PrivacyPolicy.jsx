import { useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const publicPolicyUrl = "https://temple-soul-dev.emergent.host/privacy-policy.html";

  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="privacy-policy-page">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto p-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/5 transition-colors" data-testid="privacy-policy-back-btn" aria-label="Go back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-serif">Privacy Policy</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-8" data-testid="privacy-policy-content">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground" data-testid="privacy-policy-updated">Effective date: 1 September 2026 · Last updated: 1 September 2026</p>
          <a href={publicPolicyUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
            Open public web version <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-serif text-primary">About this policy</h2>
          <p className="text-muted-foreground leading-relaxed">SkyWater Sacred Embodiments operates Shamanic Elements Soul Temple, also referred to as Shamanic Elements Soul Temple 2.0. App package: <span className="text-foreground">host.emergent.embodiment_journey.twa</span>. This policy explains what information may be collected when you use the App, why it may be collected, how it may be used or shared, how it is protected, and the choices available to you.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif text-primary">Information we may collect</h2>
          <p className="text-muted-foreground leading-relaxed">Depending on how you use the App and which features you choose, information may include your name and email address; account or login information; information you voluntarily provide through support enquiries, forms, reflections, feedback, courses, event registrations, subscriptions or purchases; and limited technical or usage information such as device type, operating system, app/browser version, IP address, interactions, diagnostics, performance, errors and crash information.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif text-primary">How we may use information</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
            <li>Provide and operate the App and its content, courses, practices, events and features.</li>
            <li>Create or manage accounts where applicable.</li>
            <li>Process requests, registrations, subscriptions or purchases.</li>
            <li>Respond to enquiries and provide support or service communications.</li>
            <li>Maintain security, stability and performance, troubleshoot issues and improve user experience.</li>
            <li>Meet legal, accounting, regulatory or security obligations and protect users and our rights.</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">We do not sell or rent your personal information.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif text-primary">Payments</h2>
          <p className="text-muted-foreground leading-relaxed">If paid services, subscriptions, products, events or other purchases are offered through the App, payment information may be processed by Google Play or another authorised payment provider. We do not directly receive or store complete credit or debit card details.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif text-primary">Sharing and service providers</h2>
          <p className="text-muted-foreground leading-relaxed">Limited information may be handled by trusted providers that support app or website hosting, cloud storage, authentication, analytics or performance monitoring, error and crash reporting, email and customer support, payment processing, technical maintenance and security. Information may also be disclosed when required by law or reasonably necessary to protect rights, property, safety, users or the public.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif text-primary">Third-party services and links</h2>
          <p className="text-muted-foreground leading-relaxed">The App may link to third-party websites, platforms, videos, payment services or social media. When you leave the App or use an independent third-party service, that provider's own terms and privacy policy apply.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif text-primary">Data retention and security</h2>
          <p className="text-muted-foreground leading-relaxed">Personal information is retained only for as long as reasonably necessary to provide requested services, maintain accounts where applicable, respond to support requests, complete transactions, keep required records, meet legal or security obligations, resolve disputes and enforce agreements. Reasonable administrative, technical and organisational safeguards are used, although no internet transmission or electronic storage system can be guaranteed absolutely secure.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif text-primary">International data processing</h2>
          <p className="text-muted-foreground leading-relaxed">Some service providers may process or store information outside Australia. Where applicable, reasonable steps are taken to have information handled consistently with this policy and relevant legal requirements.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif text-primary">Your choices and rights</h2>
          <p className="text-muted-foreground leading-relaxed">Depending on applicable law, you may request access to personal information, correction of inaccurate information, deletion of information you provided, withdrawal of consent where applicable, or make a privacy enquiry or complaint. Some information may need to be retained where required by law, for security or legitimate record-keeping.</p>
          <p className="text-sm text-muted-foreground">For privacy or data-deletion requests, contact <a className="text-primary hover:underline" href="mailto:mskatt78@gmail.com">mskatt78@gmail.com</a> or <a className="text-primary hover:underline" href="mailto:skywatersacredembodiments@gmail.com">skywatersacredembodiments@gmail.com</a>.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif text-primary">Children's privacy</h2>
          <p className="text-muted-foreground leading-relaxed">The App is intended for adults aged 18 years and over. We do not knowingly collect personal information from anyone under 18. If you believe a person under 18 has provided personal information through the App, please contact us so it can be reviewed and, where appropriate, deleted.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif text-primary">Health and wellbeing information</h2>
          <p className="text-muted-foreground leading-relaxed">The App may contain spiritual, educational, mindfulness, movement, breathwork, embodiment or general wellbeing content. It does not provide medical diagnosis or emergency assistance and is not a substitute for qualified medical, psychological, legal or other professional advice. Please avoid submitting sensitive health or personal information unless it is necessary for a feature you knowingly choose to use.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif text-primary">Changes to this policy</h2>
          <p className="text-muted-foreground leading-relaxed">This policy may be updated to reflect changes to the App, practices, service providers or legal obligations. Updates will be posted at the same publicly accessible location and the last-updated date will be revised.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif text-primary">Contact us</h2>
          <p className="text-muted-foreground leading-relaxed">SkyWater Sacred Embodiments · Australia</p>
          <p><a className="text-primary hover:underline" href="mailto:mskatt78@gmail.com">mskatt78@gmail.com</a> · <a className="text-primary hover:underline" href="mailto:skywatersacredembodiments@gmail.com">skywatersacredembodiments@gmail.com</a></p>
        </section>

        <div className="mt-8 pt-8 border-t border-white/10 text-center text-muted-foreground">
          <p>Shamanic Elements Soul Temple 2.0</p>
          <p>© 2026 SkyWater Sacred Embodiments</p>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
