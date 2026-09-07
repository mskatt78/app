import { Download, CheckCircle2, Loader2 } from "lucide-react";

export const OfflineDownloadButton = ({ offlineId, downloadedIds, downloadingId, downloadProgress, onClick, dataTestId, className = "" }) => {
  const isDownloaded = downloadedIds.has(offlineId);
  const isDownloading = downloadingId === offlineId;

  return (
    <button
      onClick={onClick}
      disabled={Boolean(downloadingId) && !isDownloading}
      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs backdrop-blur-sm border transition-colors ${
        isDownloaded
          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-200"
          : "bg-black/50 border-white/20 text-white hover:bg-black/70"
      } ${className}`}
      title={isDownloaded ? "Available offline" : "Download for offline"}
      data-testid={dataTestId}
    >
      {isDownloading ? (
        <>
          <Loader2 className="w-3 h-3 animate-spin" /> {downloadProgress}%
        </>
      ) : isDownloaded ? (
        <>
          <CheckCircle2 className="w-3 h-3" /> Offline
        </>
      ) : (
        <>
          <Download className="w-3 h-3" /> Save
        </>
      )}
    </button>
  );
};
