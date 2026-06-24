import { Activity, CalendarDays, Footprints, TimerReset } from "lucide-react";

const normalizeElement = (value) => String(value || "Spirit").trim();

const buildThreeStep = (practiceName, element) => [
  `Somatic Grounding (3-5 min): root both feet, soften jaw/shoulders, and track where ${practiceName} is felt in your ${element.toLowerCase()} body awareness.`,
  "Breath + Movement (5-8 min): inhale 4, exhale 6 with gentle sway/spinal wave; pause every 90 seconds to regulate before continuing.",
  "Action Anchor (2 min): speak one clear commitment aloud and complete one visible embodied action today (boundary, conversation, or task).",
];

const buildSevenDay = (practiceName) => [
  `Day 1-2: practice ${practiceName} with body tracking and journaling (what changed physically and emotionally).`,
  "Day 3-4: repeat with stronger embodiment—voice, posture, and breath congruence in one real-life interaction.",
  "Day 5-6: apply insights to one difficult situation using regulated breath + truthful action.",
  "Day 7: integration review—document one behavior shift, one relationship shift, and next weekly commitment.",
];

export const EmbodimentProtocolPanel = ({
  practiceName,
  element,
  testIdPrefix = "embodiment",
}) => {
  const safePractice = String(practiceName || "this practice").trim();
  const safeElement = normalizeElement(element);

  const threeStep = buildThreeStep(safePractice, safeElement);
  const sevenDay = buildSevenDay(safePractice);

  return (
    <section
      className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 space-y-4"
      data-testid={`${testIdPrefix}-panel`}
    >
      <h3 className="text-sm font-medium flex items-center gap-2">
        <Activity className="w-4 h-4 text-amber-300" />
        Embodiment Protocol (Practice + Integration)
      </h3>

      <div className="grid md:grid-cols-2 gap-3" data-testid={`${testIdPrefix}-options-grid`}>
        <div className="rounded-lg border border-white/10 bg-black/20 p-3" data-testid={`${testIdPrefix}-three-step`}>
          <p className="text-xs text-amber-200 flex items-center gap-1 mb-2">
            <Footprints className="w-3.5 h-3.5" />
            3-Step Embodiment Option
          </p>
          <ul className="space-y-1.5">
            {threeStep.map((step, index) => (
              <li key={`${testIdPrefix}-3-${index}`} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-amber-300">✦</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-white/10 bg-black/20 p-3" data-testid={`${testIdPrefix}-seven-day`}>
          <p className="text-xs text-amber-200 flex items-center gap-1 mb-2">
            <CalendarDays className="w-3.5 h-3.5" />
            7-Day Embodiment Option
          </p>
          <ul className="space-y-1.5">
            {sevenDay.map((step, index) => (
              <li key={`${testIdPrefix}-7-${index}`} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-amber-300">✦</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground flex items-center gap-1" data-testid={`${testIdPrefix}-integration-note`}>
        <TimerReset className="w-3.5 h-3.5 text-amber-300" />
        Tip: choose either the quick 3-step path or the full 7-day path each time you complete this practice.
      </p>
    </section>
  );
};
