import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto p-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/5">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-serif">Privacy Policy</h1>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto p-6 prose prose-invert">
        <p className="text-muted-foreground">Last updated: March 2026</p>
        
        <h2 className="text-xl font-serif text-primary mt-8">Introduction</h2>
        <p>
          Shamanic Elements Soul Temple 2.0 ("we", "our", or "us") respects your privacy 
          and is committed to protecting your personal data. This privacy policy explains how 
          we collect, use, and safeguard your information when you use our mobile application.
        </p>
        
        <h2 className="text-xl font-serif text-primary mt-8">Information We Collect</h2>
        <p>We may collect the following types of information:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Account Information:</strong> When you create an account, we collect your name, email address, and password.</li>
          <li><strong>Usage Data:</strong> We may collect information about how you use the app, including features accessed and time spent.</li>
          <li><strong>Birth Chart Data:</strong> If you use the birth chart feature, we collect birth date, time, and location to generate your chart.</li>
          <li><strong>Device Information:</strong> We may collect device type, operating system, and app version for troubleshooting purposes.</li>
        </ul>
        
        <h2 className="text-xl font-serif text-primary mt-8">How We Use Your Information</h2>
        <p>We use your information to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Provide and maintain our services</li>
          <li>Personalize your experience</li>
          <li>Generate your astrological birth chart and numerology readings</li>
          <li>Save your practice progress and favorites</li>
          <li>Send important updates about the app (with your consent)</li>
          <li>Improve our services</li>
        </ul>
        
        <h2 className="text-xl font-serif text-primary mt-8">Data Storage and Security</h2>
        <p>
          Your data is stored securely using industry-standard encryption. We use secure 
          servers and implement appropriate technical measures to protect your personal information 
          against unauthorized access, alteration, or destruction.
        </p>
        
        <h2 className="text-xl font-serif text-primary mt-8">Third-Party Services</h2>
        <p>Our app may use the following third-party services:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Google Authentication:</strong> For optional sign-in via Google account</li>
          <li><strong>AI Services:</strong> For generating oracle readings and guided meditation audio</li>
        </ul>
        <p>These services have their own privacy policies governing the use of your information.</p>
        
        <h2 className="text-xl font-serif text-primary mt-8">Your Rights</h2>
        <p>You have the right to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Access your personal data</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Withdraw consent at any time</li>
          <li>Export your data</li>
        </ul>
        
        <h2 className="text-xl font-serif text-primary mt-8">Children's Privacy</h2>
        <p>
          Our app is not intended for children under 13 years of age. We do not knowingly 
          collect personal information from children under 13.
        </p>
        
        <h2 className="text-xl font-serif text-primary mt-8">Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. We will notify you of any 
          changes by posting the new policy on this page and updating the "Last updated" date.
        </p>
        
        <h2 className="text-xl font-serif text-primary mt-8">Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at:
        </p>
        <p className="text-primary">skywatersacredembodiments@gmail.com</p>
        
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-muted-foreground">
          <p>Shamanic Elements Soul Temple 2.0</p>
          <p>© 2026 All Rights Reserved</p>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
