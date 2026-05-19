export const TIMEZONES = [
  { label: "Southern Hemisphere", group: true },
  { label: "🌿 Queensland, AU (AEST UTC+10)", tz: "Australia/Brisbane", hemi: "south" },
  { label: "🌿 Sydney / Melbourne (AEST/AEDT)", tz: "Australia/Sydney", hemi: "south" },
  { label: "🌿 Perth, AU (AWST UTC+8)", tz: "Australia/Perth", hemi: "south" },
  { label: "🌿 Adelaide, AU (ACST/ACDT)", tz: "Australia/Adelaide", hemi: "south" },
  { label: "🌿 Auckland, NZ (NZST/NZDT)", tz: "Pacific/Auckland", hemi: "south" },
  { label: "🌿 Johannesburg, SA (SAST UTC+2)", tz: "Africa/Johannesburg", hemi: "south" },
  { label: "🌿 Buenos Aires, AR (ART UTC-3)", tz: "America/Argentina/Buenos_Aires", hemi: "south" },
  { label: "🌿 São Paulo, BR (BRT UTC-3)", tz: "America/Sao_Paulo", hemi: "south" },
  { label: "🌿 Santiago, CL (CLT UTC-4)", tz: "America/Santiago", hemi: "south" },
  { label: "🌿 Lima, PE (PET UTC-5)", tz: "America/Lima", hemi: "south" },
  { label: "Northern Hemisphere", group: true },
  { label: "☀️ London, UK (GMT/BST)", tz: "Europe/London", hemi: "north" },
  { label: "☀️ Paris / Berlin (CET/CEST UTC+1/+2)", tz: "Europe/Paris", hemi: "north" },
  { label: "☀️ Athens / Kyiv (EET UTC+2/+3)", tz: "Europe/Athens", hemi: "north" },
  { label: "☀️ Moscow, RU (MSK UTC+3)", tz: "Europe/Moscow", hemi: "north" },
  { label: "☀️ Dubai, UAE (GST UTC+4)", tz: "Asia/Dubai", hemi: "north" },
  { label: "☀️ New Delhi, IN (IST UTC+5:30)", tz: "Asia/Kolkata", hemi: "north" },
  { label: "☀️ Bangkok, TH (ICT UTC+7)", tz: "Asia/Bangkok", hemi: "north" },
  { label: "☀️ Singapore / KL (SGT UTC+8)", tz: "Asia/Singapore", hemi: "north" },
  { label: "☀️ Tokyo / Seoul (JST/KST UTC+9)", tz: "Asia/Tokyo", hemi: "north" },
  { label: "☀️ New York, US (EST/EDT UTC-5/-4)", tz: "America/New_York", hemi: "north" },
  { label: "☀️ Chicago, US (CST/CDT UTC-6/-5)", tz: "America/Chicago", hemi: "north" },
  { label: "☀️ Denver, US (MST/MDT UTC-7/-6)", tz: "America/Denver", hemi: "north" },
  { label: "☀️ Los Angeles, US (PST/PDT UTC-8/-7)", tz: "America/Los_Angeles", hemi: "north" },
  { label: "☀️ Anchorage, AK (AKST/AKDT)", tz: "America/Anchorage", hemi: "north" },
  { label: "☀️ Honolulu, HI (HST UTC-10)", tz: "America/Honolulu", hemi: "north" },
  { label: "☀️ Reykjavik (UTC+0)", tz: "Atlantic/Reykjavik", hemi: "north" },
  { label: "☀️ Toronto, CA (EST/EDT)", tz: "America/Toronto", hemi: "north" },
  { label: "☀️ Vancouver, CA (PST/PDT)", tz: "America/Vancouver", hemi: "north" },
  { label: "☀️ Mexico City, MX (CST/CDT)", tz: "America/Mexico_City", hemi: "north" },
  { label: "☀️ Cairo, EG (EET UTC+2)", tz: "Africa/Cairo", hemi: "north" },
  { label: "☀️ Nairobi, KE (EAT UTC+3)", tz: "Africa/Nairobi", hemi: "north" },
];

export const elementColors = {
  Earth: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", gradient: "from-emerald-500/20 to-emerald-900/10" },
  Water: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", gradient: "from-blue-500/20 to-blue-900/10" },
  Fire: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", gradient: "from-orange-500/20 to-orange-900/10" },
  Air: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", gradient: "from-cyan-500/20 to-cyan-900/10" },
  Spirit: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", gradient: "from-purple-500/20 to-purple-900/10" },
};

export const getTimezoneOptionKey = (tz) => {
  if (tz.group) {
    return `tz-group-${String(tz.label).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  }
  return `tz-option-${tz.tz}`;
};

export const getLocalTime = (tz) => {
  try {
    return new Date().toLocaleTimeString("en-US", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZoneName: "short",
    });
  } catch {
    return "";
  }
};

export const getLocalDate = (tz) => {
  try {
    return new Date().toLocaleDateString("en-US", {
      timeZone: tz,
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  } catch {
    return "";
  }
};
