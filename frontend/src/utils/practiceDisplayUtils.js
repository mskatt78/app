const normalize = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export const formatPracticeName = (name = "", movementTrack = "") => {
  const safeName = String(name || "").trim();
  if (!safeName) return safeName;

  const lowerName = safeName.toLowerCase();
  if (!lowerName.includes("·")) return safeName;

  const parts = safeName
    .split("·")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length < 2) return safeName;

  const normalizedTrack = normalize(movementTrack);
  const suffix = parts[parts.length - 1];
  const normalizedSuffix = normalize(suffix);

  if (normalizedTrack && normalizedSuffix && normalizedTrack === normalizedSuffix) {
    return parts.slice(0, -1).join(" · ").trim();
  }

  return safeName;
};
