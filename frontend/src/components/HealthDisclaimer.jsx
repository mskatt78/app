import { AlertTriangle, Heart, Shield } from "lucide-react";

const HealthDisclaimer = ({ type = "general" }) => {
  const disclaimers = {
    general: {
      title: "Health & Safety Notice",
      content: "This app is for educational and spiritual wellness purposes only. It is not intended to diagnose, treat, cure, or prevent any disease. Always consult with a qualified healthcare provider before beginning any new wellness practice, especially if you have existing health conditions, are pregnant, or are taking medications."
    },
    yoga: {
      title: "Yoga Safety",
      content: "Listen to your body and never force any position. Stop immediately if you experience pain, dizziness, or discomfort. Pregnant individuals and those with injuries or health conditions should consult a healthcare provider before practicing. Always practice on a non-slip surface and ensure adequate space."
    },
    breathwork: {
      title: "Breathwork Caution",
      content: "Some breathwork techniques can cause lightheadedness, tingling, or emotional release. Do not practice while driving or operating machinery. Those with respiratory conditions, cardiovascular issues, or who are pregnant should consult a healthcare provider first. Stop if you feel uncomfortable."
    },
    shamanic: {
      title: "Shamanic Practice Notice",
      content: "Shamanic practices are spiritual in nature and may bring up intense emotions or experiences. These practices are not substitutes for professional mental health care. If you are experiencing mental health challenges, please seek support from a qualified professional."
    },
    crystal: {
      title: "Crystal Healing Disclaimer",
      content: "Crystal healing is a complementary practice and should not replace medical treatment. The frequencies and properties described are based on traditional beliefs and have not been scientifically proven. Always seek professional medical advice for health concerns."
    }
  };

  const { title, content } = disclaimers[type] || disclaimers.general;

  return (
    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 my-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-amber-400 text-sm mb-1">{title}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">{content}</p>
        </div>
      </div>
    </div>
  );
};

const FullDisclaimer = () => (
  <div className="bg-card/50 border border-white/5 rounded-2xl p-6 space-y-4">
    <div className="flex items-center gap-3 mb-4">
      <Shield className="w-6 h-6 text-primary" />
      <h3 className="font-serif text-lg">Terms & Health Disclaimer</h3>
    </div>
    
    <div className="space-y-4 text-sm text-muted-foreground">
      <div>
        <h4 className="font-medium text-foreground mb-2">Medical Disclaimer</h4>
        <p>The content provided in this application is for informational and educational purposes only and is not intended as medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.</p>
      </div>
      
      <div>
        <h4 className="font-medium text-foreground mb-2">Assumption of Risk</h4>
        <p>By using this application, you acknowledge that physical activities such as yoga, breathwork, and movement practices carry inherent risks. You assume full responsibility for any risks, injuries, or damages that may occur as a result of your participation in any activities suggested by this app.</p>
      </div>
      
      <div>
        <h4 className="font-medium text-foreground mb-2">Not Professional Advice</h4>
        <p>The spiritual, shamanic, and wellness content in this app reflects various traditional practices and beliefs. This content is not intended to replace professional psychological, psychiatric, or medical care. If you are experiencing mental health issues, please consult a licensed professional.</p>
      </div>
      
      <div>
        <h4 className="font-medium text-foreground mb-2">Crystal & Energy Healing</h4>
        <p>Crystal healing, energy work, and vibrational therapies are complementary practices based on traditional and metaphysical beliefs. These have not been scientifically proven and should not be used as a substitute for professional medical treatment.</p>
      </div>
      
      <div>
        <h4 className="font-medium text-foreground mb-2">User Responsibility</h4>
        <p>You are solely responsible for your own health and safety while using this application. If you are pregnant, nursing, have a medical condition, or are taking medications, consult your healthcare provider before engaging in any practices offered in this app.</p>
      </div>
      
      <div className="pt-4 border-t border-white/5 text-xs">
        <p>© {new Date().getFullYear()} Shamanic Elements - Temple Of The Soul. All rights reserved.</p>
        <p className="mt-1">By using this app, you agree to these terms and acknowledge that you have read and understood this disclaimer.</p>
      </div>
    </div>
  </div>
);

export { HealthDisclaimer, FullDisclaimer };
export default HealthDisclaimer;
