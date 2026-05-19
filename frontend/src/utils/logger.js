const isDev = process.env.NODE_ENV !== "production";

const emit = (level, message, ...meta) => {
  if (level === "debug" && !isDev) return;

  const payload = [`[SoulTemple] ${message}`, ...meta];
  switch (level) {
    case "warn":
      console.warn(...payload);
      break;
    case "error":
      console.error(...payload);
      break;
    case "info":
      if (isDev) console.info(...payload);
      break;
    default:
      if (isDev) console.log(...payload);
      break;
  }
};

export const appLogger = {
  debug: (message, ...meta) => emit("debug", message, ...meta),
  info: (message, ...meta) => emit("info", message, ...meta),
  warn: (message, ...meta) => emit("warn", message, ...meta),
  error: (message, ...meta) => emit("error", message, ...meta),
};
