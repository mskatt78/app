const extractNumericParts = (value) => {
  const matches = String(value ?? "").match(/\d+(?:\.\d+)?/g);
  return matches ? matches.map((part) => Number(part)).filter((num) => Number.isFinite(num) && num > 0) : [];
};

export const resolveDurationMinutes = (value, fallbackMinutes = 20) => {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return fallbackMinutes;

    const numericParts = extractNumericParts(trimmed);
    if (numericParts.length === 0) return fallbackMinutes;

    const hasRangeSyntax = /-|–|to|until|through/i.test(trimmed) && numericParts.length >= 2;
    if (hasRangeSyntax) {
      return Math.max(...numericParts);
    }

    return numericParts[0];
  }

  return fallbackMinutes;
};

export const resolveDurationSeconds = (value, fallbackMinutes = 20) => {
  const minutes = resolveDurationMinutes(value, fallbackMinutes);
  return Math.max(60, Math.round(minutes * 60));
};
