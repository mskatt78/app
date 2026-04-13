const GATE_SEQUENCE = [
  41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
  27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
  31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
  28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60,
];

const HD_GATE_START_DEGREES = 302;
const GATE_SPAN = 360 / 64;
const LINE_SPAN = GATE_SPAN / 6;

const HD_CHANNELS = [
  [64, 47, "Head", "Ajna"],
  [61, 24, "Head", "Ajna"],
  [63, 4, "Head", "Ajna"],
  [17, 62, "Ajna", "Throat"],
  [43, 23, "Ajna", "Throat"],
  [11, 56, "Ajna", "Throat"],
  [16, 48, "Throat", "Spleen"],
  [20, 57, "Throat", "Spleen"],
  [20, 34, "Throat", "Sacral"],
  [20, 10, "Throat", "G"],
  [31, 7, "Throat", "G"],
  [8, 1, "Throat", "G"],
  [33, 13, "Throat", "G"],
  [45, 21, "Throat", "Heart"],
  [12, 22, "Throat", "SolarPlexus"],
  [35, 36, "Throat", "SolarPlexus"],
  [25, 51, "G", "Heart"],
  [57, 10, "Spleen", "G"],
  [5, 15, "Sacral", "G"],
  [14, 2, "Sacral", "G"],
  [29, 46, "Sacral", "G"],
  [34, 10, "Sacral", "G"],
  [44, 26, "Spleen", "Heart"],
  [27, 50, "Sacral", "Spleen"],
  [28, 38, "Spleen", "Root"],
  [18, 58, "Spleen", "Root"],
  [32, 54, "Spleen", "Root"],
  [59, 6, "Sacral", "SolarPlexus"],
  [37, 40, "SolarPlexus", "Heart"],
  [39, 55, "SolarPlexus", "Root"],
  [41, 30, "SolarPlexus", "Root"],
  [53, 42, "Root", "Sacral"],
  [60, 3, "Root", "Sacral"],
  [52, 9, "Root", "Sacral"],
  [19, 49, "Root", "SolarPlexus"],
];

const MOTOR_CENTERS = new Set(["Sacral", "Heart", "SolarPlexus", "Root"]);

const getPlanetLongitude = (chart, planetName) => {
  const match = chart?.planets?.find((planet) => planet.name === planetName);
  return typeof match?.longitude === "number" ? match.longitude : null;
};

const subtract88Days = (dateStr, timeStr) => {
  const seed = new Date(`${dateStr}T${timeStr}:00`);
  seed.setDate(seed.getDate() - 88);
  const yyyy = seed.getFullYear();
  const mm = String(seed.getMonth() + 1).padStart(2, "0");
  const dd = String(seed.getDate()).padStart(2, "0");
  const hh = String(seed.getHours()).padStart(2, "0");
  const mi = String(seed.getMinutes()).padStart(2, "0");
  return {
    date: `${yyyy}-${mm}-${dd}`,
    time: `${hh}:${mi}`,
  };
};

const longitudeToGateLine = (longitude) => {
  const normalized = (longitude - HD_GATE_START_DEGREES + 360) % 360;
  const gateIndex = Math.floor(normalized / GATE_SPAN) % 64;
  const withinGate = normalized % GATE_SPAN;
  const line = Math.min(6, Math.max(1, Math.floor(withinGate / LINE_SPAN) + 1));
  return {
    gate: GATE_SEQUENCE[gateIndex],
    line,
    gateIndex,
  };
};

const earthFromSun = (sunLongitude) => longitudeToGateLine((sunLongitude + 180) % 360);

const buildGateActivations = (chart, side) => {
  const planetNames = [
    "Sun",
    "Moon",
    "Mercury",
    "Venus",
    "Mars",
    "Jupiter",
    "Saturn",
    "Uranus",
    "Neptune",
    "Pluto",
    "North Node",
    "South Node",
  ];

  const activations = [];
  for (const name of planetNames) {
    const longitude = getPlanetLongitude(chart, name);
    if (typeof longitude !== "number") continue;
    const gateLine = longitudeToGateLine(longitude);
    activations.push({
      side,
      planet: name,
      longitude,
      gate: gateLine.gate,
      line: gateLine.line,
    });
  }

  const sunLongitude = getPlanetLongitude(chart, "Sun");
  if (typeof sunLongitude === "number") {
    const earth = earthFromSun(sunLongitude);
    activations.push({
      side,
      planet: "Earth",
      longitude: (sunLongitude + 180) % 360,
      gate: earth.gate,
      line: earth.line,
    });
  }

  return activations;
};

const buildCenterGraph = (definedChannels) => {
  const graph = new Map();
  for (const [, , centerA, centerB] of definedChannels) {
    if (!graph.has(centerA)) graph.set(centerA, new Set());
    if (!graph.has(centerB)) graph.set(centerB, new Set());
    graph.get(centerA).add(centerB);
    graph.get(centerB).add(centerA);
  }
  return graph;
};

const isMotorConnectedToThroat = (definedChannels) => {
  const graph = buildCenterGraph(definedChannels);
  if (!graph.has("Throat")) return false;

  const queue = ["Throat"];
  const seen = new Set(queue);

  while (queue.length) {
    const center = queue.shift();
    if (MOTOR_CENTERS.has(center)) return true;
    const neighbors = graph.get(center) || new Set();
    for (const neighbor of neighbors) {
      if (!seen.has(neighbor)) {
        seen.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return false;
};

const determineType = (definedCenters, definedChannels) => {
  if (!definedCenters.size) return "reflector";

  const hasSacral = definedCenters.has("Sacral");
  const hasThroat = definedCenters.has("Throat");
  const hasMotorToThroat = hasThroat && isMotorConnectedToThroat(definedChannels);

  if (hasSacral) {
    return hasMotorToThroat ? "manifesting-generator" : "generator";
  }

  return hasMotorToThroat ? "manifestor" : "projector";
};

const determineAuthority = (typeKey, definedCenters) => {
  if (typeKey === "reflector") return "Lunar";
  if (definedCenters.has("SolarPlexus")) return "Emotional";
  if (definedCenters.has("Sacral")) return "Sacral";
  if (definedCenters.has("Spleen")) return "Splenic";
  if (definedCenters.has("Heart") && definedCenters.has("Throat")) return "Ego Manifested";
  if (definedCenters.has("Heart")) return "Ego Projected";
  if (definedCenters.has("G") && definedCenters.has("Throat")) return "Self-Projected";
  return "Mental / Environmental";
};

export const calculateHumanDesignChart = async (api, birthData) => {
  const payload = {
    birth_date: birthData.birth_date,
    birth_time: birthData.birth_time,
    birth_city: birthData.birth_city,
    birth_country: birthData.birth_country,
  };

  const { data: personalityChart } = await api.post("/birth-chart/calculate", payload);
  const designBirth = subtract88Days(birthData.birth_date, birthData.birth_time);
  const { data: designChart } = await api.post("/birth-chart/calculate", {
    ...payload,
    birth_date: designBirth.date,
    birth_time: designBirth.time,
  });

  const personalityActivations = buildGateActivations(personalityChart, "personality");
  const designActivations = buildGateActivations(designChart, "design");
  const allActivations = [...personalityActivations, ...designActivations];
  const activeGates = new Set(allActivations.map((item) => item.gate));

  const definedChannels = HD_CHANNELS.filter(([gateA, gateB]) => activeGates.has(gateA) && activeGates.has(gateB));
  const definedCenters = new Set();
  for (const [, , centerA, centerB] of definedChannels) {
    definedCenters.add(centerA);
    definedCenters.add(centerB);
  }

  const personalitySunLongitude = getPlanetLongitude(personalityChart, "Sun") || 0;
  const designSunLongitude = getPlanetLongitude(designChart, "Sun") || 0;
  const personalitySun = longitudeToGateLine(personalitySunLongitude);
  const designSun = longitudeToGateLine(designSunLongitude);
  const profile = `${personalitySun.line}/${designSun.line}`;

  const typeKey = determineType(definedCenters, definedChannels);
  const authority = determineAuthority(typeKey, definedCenters);

  return {
    profile,
    typeKey,
    authority,
    personalitySun,
    designSun,
    definedCenters: [...definedCenters],
    definedChannels: definedChannels.map(([a, b]) => `${a}-${b}`),
    activeGateCount: activeGates.size,
    designBirth,
  };
};
