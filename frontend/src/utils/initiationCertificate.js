import { toast } from "sonner";

const loadArtwork = () => new Promise((resolve) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => resolve(null);
  img.src = "/images/hero-main.jpg";
});

const drawOrnamentLine = (ctx, centerX, y, width, color) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(centerX - width / 2, y);
  ctx.lineTo(centerX + width / 2, y);
  ctx.stroke();
  ctx.fillStyle = color;
  [-width / 2, width / 2].forEach((dx) => {
    ctx.beginPath();
    ctx.arc(centerX + dx, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
};

export const drawInitiationCertificate = async ({ streamLabel, total, memberName }) => {
  const w = 1080;
  const h = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  const gold = "#e7c368";
  const goldSoft = "rgba(231, 195, 104, 0.55)";

  const art = await loadArtwork();
  ctx.fillStyle = "#0b0910";
  ctx.fillRect(0, 0, w, h);
  if (art) {
    ctx.globalAlpha = 0.22;
    const scale = Math.max(w / art.width, h / art.height);
    ctx.drawImage(art, (w - art.width * scale) / 2, (h - art.height * scale) / 2, art.width * scale, art.height * scale);
    ctx.globalAlpha = 1;
    const shade = ctx.createLinearGradient(0, 0, 0, h);
    shade.addColorStop(0, "rgba(11,9,16,0.55)");
    shade.addColorStop(0.5, "rgba(11,9,16,0.8)");
    shade.addColorStop(1, "rgba(11,9,16,0.92)");
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, w, h);
  }

  ctx.strokeStyle = gold;
  ctx.lineWidth = 3;
  ctx.strokeRect(50, 50, w - 100, h - 100);
  ctx.strokeStyle = goldSoft;
  ctx.lineWidth = 1;
  ctx.strokeRect(66, 66, w - 132, h - 132);

  ctx.textAlign = "center";
  ctx.fillStyle = gold;
  ctx.font = "110px serif";
  ctx.fillText("☾ ✦ ☽", w / 2, 240);

  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.font = "26px sans-serif";
  ctx.fillText("S H A M A N I C   E L E M E N T S   S O U L   T E M P L E", w / 2, 330);

  ctx.fillStyle = gold;
  ctx.font = "italic 74px serif";
  ctx.fillText("Certificate of Initiation", w / 2, 430);

  drawOrnamentLine(ctx, w / 2, 470, 420, goldSoft);

  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = "30px serif";
  ctx.fillText("This scroll bears witness that", w / 2, 550);

  ctx.fillStyle = "#ffffff";
  ctx.font = "italic 60px serif";
  ctx.fillText(memberName || "A Devoted Initiate", w / 2, 640);

  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = "30px serif";
  ctx.fillText(`has walked every step of the initiation path —`, w / 2, 720);
  ctx.fillText(`all ${total} guided journeys of the`, w / 2, 766);

  ctx.fillStyle = gold;
  ctx.font = "italic 54px serif";
  const label = String(streamLabel || "Mystery School");
  ctx.fillText(label, w / 2, 850);

  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "28px serif";
  ctx.fillText("completing this lineage stream in full presence and devotion.", w / 2, 920);

  drawOrnamentLine(ctx, w / 2, 990, 320, goldSoft);

  const date = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = "26px serif";
  ctx.fillText(`Sealed on ${date}`, w / 2, 1050);

  ctx.fillStyle = gold;
  ctx.font = "italic 30px serif";
  ctx.fillText("Begin your own journey — Shamanic Elements Soul Temple", w / 2, 1210);

  return canvas;
};

export const shareInitiationCertificate = async ({ streamLabel, total, memberName }) => {
  const canvas = await drawInitiationCertificate({ streamLabel, total, memberName });
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  const file = new File([blob], "soul-temple-initiation-certificate.png", { type: "image/png" });
  const text = `I completed every initiation of the ${streamLabel} path on Shamanic Elements Soul Temple.`;
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({ files: [file], title: "Certificate of Initiation", text });
    return "shared";
  }
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = file.name;
  link.click();
  URL.revokeObjectURL(link.href);
  toast.success("Certificate saved — share your initiation scroll anywhere");
  return "downloaded";
};
