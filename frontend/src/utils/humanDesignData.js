export const GATE_SEQUENCE = [
  41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
  27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
  31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
  28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60,
];

export const HD_GATE_START_DEGREES = 302;
export const GATE_SPAN = 360 / 64;
export const LINE_SPAN = GATE_SPAN / 6;

export const HD_CHANNELS = [
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

export const CENTER_COLOR_MAP = {
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

export const CENTER_DISPLAY_NAMES = {
  Head: "Head",
  Ajna: "Ajna",
  Throat: "Throat",
  G: "G Center",
  Heart: "Heart/Ego",
  SolarPlexus: "Solar Plexus",
  Sacral: "Sacral",
  Spleen: "Spleen",
  Root: "Root",
};

export const PLANET_ORDER = [
  "Sun",
  "Earth",
  "Moon",
  "North Node",
  "South Node",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
];

export const PROFILE_NAME_MAP = {
  "1/3": "Investigator / Martyr",
  "1/4": "Investigator / Opportunist",
  "2/4": "Hermit / Opportunist",
  "2/5": "Hermit / Heretic",
  "3/5": "Martyr / Heretic",
  "3/6": "Martyr / Role Model",
  "4/1": "Opportunist / Investigator",
  "4/6": "Opportunist / Role Model",
  "5/1": "Heretic / Investigator",
  "5/2": "Heretic / Hermit",
  "6/2": "Role Model / Hermit",
  "6/3": "Role Model / Martyr",
};

export const CROSS_NAME_MAP = {
  "41-31-19-33": "Right Angle Cross of Planning",
  "41-31-13-7": "Right Angle Cross of The Unexpected",
  "44-24-33-19": "Left Angle Cross of The Alpha",
  "55-59-37-40": "Right Angle Cross of The Sleeping Phoenix",
};

export const DIGESTION_BY_COLOR = {
  1: "Consecutive",
  2: "Alternating",
  3: "Open Taste",
  4: "Closed Taste",
  5: "High Sound",
  6: "Low Sound",
};

export const COGNITION_BY_COLOR = {
  1: "Smell",
  2: "Taste",
  3: "Outer Vision",
  4: "Inner Vision",
  5: "Feeling",
  6: "Touch",
};

export const ENVIRONMENT_BY_COLOR = {
  1: "Caves",
  2: "Markets",
  3: "Kitchens",
  4: "Mountains",
  5: "Valleys",
  6: "Shores",
};

export const PERSPECTIVE_BY_COLOR = {
  1: "Survival",
  2: "Possibility",
  3: "Power",
  4: "Need",
  5: "Probability",
  6: "Personal",
};

export const MOTIVATION_BY_COLOR = {
  1: "Fear",
  2: "Hope",
  3: "Desire",
  4: "Need",
  5: "Guilt",
  6: "Innocence",
};
