import { toast } from "sonner";

export const JOURNEY_MILESTONES = [
  { days: 7, title: "7-Day Guardian", accent: "#34d399", glowRgb: "52, 211, 153", blessing: "Seven days of returning to yourself. One full cycle of the week held in presence. The flame you tend is growing steady — keep walking gently." },
  { days: 21, title: "21-Day Initiation", accent: "#fbbf24", glowRgb: "251, 191, 36", blessing: "Twenty-one days — a full initiation cycle. What began as discipline has become rhythm. Your nervous system now knows the way home. Honor how far you have travelled." },
  { days: 40, title: "Sacred 40", accent: "#facc15", glowRgb: "250, 204, 21", blessing: "Forty days of devotion. In every tradition this is the threshold of transformation — the practice now lives in your bones. You are no longer doing the work; the work is doing you." },
];

const INVITE_LINE = "Begin your own journey — Shamanic Elements Soul Temple";

const loadArtwork = () => new Promise((resolve) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => resolve(null);
  img.src = "/images/hero-main.jpg";
});

export const drawJourneyPostcard = async (milestone, streak) => {
  const size = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const { accent, glowRgb } = milestone;

  const art = await loadArtwork();
  if (art) {
    const scale = Math.max(size / art.width, size / art.height);
    const w = art.width * scale;
    const h = art.height * scale;
    ctx.drawImage(art, (size - w) / 2, (size - h) / 2, w, h);
    const shade = ctx.createLinearGradient(0, 0, 0, size);
    shade.addColorStop(0, "rgba(7,6,9,0.55)");
    shade.addColorStop(0.45, "rgba(7,6,9,0.72)");
    shade.addColorStop(1, "rgba(7,6,9,0.94)");
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, size, size);
  } else {
    const bg = ctx.createLinearGradient(0, 0, 0, size);
    bg.addColorStop(0, "#12101c");
    bg.addColorStop(1, "#070609");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);
  }

  const glow = ctx.createRadialGradient(size / 2, 340, 40, size / 2, 340, 420);
  glow.addColorStop(0, `rgba(${glowRgb}, 0.30)`);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = `rgba(${glowRgb}, 0.55)`;
  [120, 158, 196].forEach((radius, i) => {
    ctx.beginPath();
    ctx.globalAlpha = 0.6 - i * 0.18;
    ctx.arc(size / 2, 320, radius, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.stroke();
  });
  ctx.globalAlpha = 1;

  ctx.fillStyle = accent;
  ctx.font = "150px serif";
  ctx.textAlign = "center";
  ctx.fillText("☽", size / 2, 375);

  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = "27px sans-serif";
  ctx.fillText("S A C R E D   M I L E S T O N E", size / 2, 528);

  ctx.fillStyle = accent;
  ctx.font = "italic 84px serif";
  ctx.fillText(milestone.title, size / 2, 626);

  ctx.fillStyle = "#ffffff";
  ctx.font = "italic 42px serif";
  ctx.fillText(`${streak} days of unbroken practice`, size / 2, 696);

  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.font = "30px serif";
  const words = milestone.blessing.split(" ");
  let line = "";
  let y = 776;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > 840) {
      ctx.fillText(line, size / 2, y);
      line = word;
      y += 44;
      if (y > 920) break;
    } else {
      line = test;
    }
  }
  if (line && y <= 920) ctx.fillText(line, size / 2, y);

  ctx.strokeStyle = `rgba(${glowRgb}, 0.4)`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(size / 2 - 180, 958);
  ctx.lineTo(size / 2 + 180, 958);
  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.font = "italic 33px serif";
  ctx.fillText(INVITE_LINE, size / 2, 1010);

  return canvas;
};

export const shareJourneyPostcard = async (milestone, streak) => {
  const canvas = await drawJourneyPostcard(milestone, streak);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  const file = new File([blob], `soul-temple-${milestone.days}-day-postcard.png`, { type: "image/png" });
  const shareText = `${milestone.title} — ${streak} days of unbroken sacred practice. ${INVITE_LINE}.`;

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({ files: [file], title: milestone.title, text: shareText });
    return "shared";
  }
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = file.name;
  link.click();
  URL.revokeObjectURL(link.href);
  toast.success("Postcard saved — share it anywhere you like");
  return "downloaded";
};
