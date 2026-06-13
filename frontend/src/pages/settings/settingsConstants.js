export const daysOfWeek = [
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
  { value: "saturday", label: "Sat" },
  { value: "sunday", label: "Sun" },
];

export const DEFAULT_REMINDER_SETTINGS = {
  enabled: false,
  time: "08:00",
  days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
  ritual_id: null,
  message: "Time for your sacred practice",
};
