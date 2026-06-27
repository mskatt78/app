const CENTER_COLORS = {
  Head: "#f0c040",
  Ajna: "#74c08a",
  Throat: "#8B6A4A",
  G: "#f0c040",
  Heart: "#cc4444",
  SolarPlexus: "#e07030",
  Sacral: "#cc4444",
  Spleen: "#8B6A4A",
  Root: "#8B6A4A",
};

const UNDEFINED_COLOR = "transparent";
const DEFINED_STROKE = "#ffffff55";

export const BodyGraph = ({ definedCenters = [], definedChannels = [] }) => {
  const normalizedCenters = (definedCenters || []).map((center) => (typeof center === "string" ? center : center?.key));
  const definedSet = new Set(normalizedCenters.filter(Boolean));
  const channelSet = new Set((definedChannels || []).map((channel) => String(channel?.key || "")));

  const def = (name) => definedSet.has(name);
  const fill = (name) => (def(name) ? CENTER_COLORS[name] : UNDEFINED_COLOR);
  const stroke = (name) => (def(name) ? DEFINED_STROKE : "#ffffff33");

  const channels = [
    { key: "64-47", points: [[100, 30], [100, 46]] },
    { key: "61-24", points: [[100, 66], [100, 86]] },
    { key: "63-4", points: [[100, 116], [100, 136]] },
    { key: "17-62", points: [[116, 100], [132, 114]] },
    { key: "43-23", points: [[128, 144], [134, 130]] },
    { key: "11-56", points: [[100, 172], [100, 188]] },
    { key: "20-57", points: [[74, 156], [60, 162]] },
    { key: "34-20", points: [[100, 214], [100, 264]] },
    { key: "45-21", points: [[128, 200], [142, 200]] },
    { key: "32-54", points: [[52, 170], [80, 268]] },
    { key: "57-10", points: [[60, 156], [72, 200]] },
    { key: "37-40", points: [[150, 214], [122, 270]] },
  ];

  const isChannelDefined = (key) => channelSet.has(key) || channelSet.has(key.split("-").reverse().join("-"));

  return (
    <svg viewBox="0 0 200 310" className="w-full max-w-[220px] mx-auto drop-shadow-lg" data-testid="human-design-bodygraph">
      {channels.map((channel) => {
        const [[x1, y1], [x2, y2]] = channel.points;
        const definedChannel = isChannelDefined(channel.key);
        return (
          <line
            key={`channel-${channel.key}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={definedChannel ? "#f5d37a" : "#ffffff18"}
            strokeWidth={definedChannel ? "5" : "4"}
          />
        );
      })}

      <polygon points="100,0 120,16 100,32 80,16" fill={fill("Head")} stroke={stroke("Head")} strokeWidth="1.5" />
      <polygon points="80,46 120,46 100,68" fill={fill("Ajna")} stroke={stroke("Ajna")} strokeWidth="1.5" />
      <rect x="76" y="86" width="48" height="28" rx="3" fill={fill("Throat")} stroke={stroke("Throat")} strokeWidth="1.5" />
      <polygon points="100,134 126,156 100,178 74,156" fill={fill("G")} stroke={stroke("G")} strokeWidth="1.5" />
      <rect x="130" y="113" width="28" height="26" rx="3" fill={fill("Heart")} stroke={stroke("Heart")} strokeWidth="1.5" />
      <polygon points="140,188 164,188 152,214" fill={fill("SolarPlexus")} stroke={stroke("SolarPlexus")} strokeWidth="1.5" />
      <rect x="72" y="188" width="56" height="28" rx="3" fill={fill("Sacral")} stroke={stroke("Sacral")} strokeWidth="1.5" />
      <polygon points="36,148 60,148 48,172" fill={fill("Spleen")} stroke={stroke("Spleen")} strokeWidth="1.5" />
      <rect x="76" y="264" width="48" height="26" rx="3" fill={fill("Root")} stroke={stroke("Root")} strokeWidth="1.5" />

      {[
        { label: "HEAD", x: 100, y: 17 },
        { label: "AJNA", x: 100, y: 59 },
        { label: "THROAT", x: 100, y: 103 },
        { label: "G", x: 100, y: 157 },
        { label: "HEART", x: 144, y: 128 },
        { label: "SP", x: 152, y: 203 },
        { label: "SACRAL", x: 100, y: 205 },
        { label: "SPLN", x: 48, y: 162 },
        { label: "ROOT", x: 100, y: 280 },
      ].map(({ label, x, y }) => (
        <text
          key={label}
          x={x}
          y={y}
          textAnchor="middle"
          fontSize="5.5"
          fill="rgba(255,255,255,0.7)"
          fontFamily="serif"
          fontWeight="600"
        >
          {label}
        </text>
      ))}
    </svg>
  );
};
