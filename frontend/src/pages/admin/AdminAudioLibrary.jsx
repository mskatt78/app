import { useEffect, useRef, useState } from "react";
import { CheckCircle, Copy, Image, Loader2, Music, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { appLogger } from "../../utils/logger";
import { formatSize } from "./utils";

export const AdminAudioLibrary = ({ apiBaseUrl }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/admin/audio_files/items`, {
          credentials: "include",
        });
        const data = await response.json();
        setFiles(data.items || []);
      } catch (error) {
        appLogger.error("Admin audio files load failed", error);
        toast.error("Failed to load files");
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, [apiBaseUrl]);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const payload = new FormData();
      payload.append("file", file);
      const response = await fetch(`${apiBaseUrl}/api/admin/upload`, {
        method: "POST",
        credentials: "include",
        body: payload,
      });
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      const data = await response.json();
      setFiles((prev) => [data, ...prev]);
      toast.success(`Uploaded: ${file.name}`);
    } catch (error) {
      appLogger.error("Admin media upload failed", error);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this file?")) return;
    try {
      await fetch(`${apiBaseUrl}/api/admin/audio_files/managed/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setFiles((prev) => prev.filter((file) => file.id !== id));
      toast.success("File removed");
    } catch (error) {
      appLogger.error("Admin media delete failed", error);
      toast.error("Failed to remove");
    }
  };

  const copyUrl = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast.success("URL copied to clipboard");
  };

  return (
    <div className="space-y-4" data-testid="admin-audio-library">
      <div className="flex items-center gap-3">
        <Button onClick={() => fileRef.current?.click()} disabled={uploading} data-testid="upload-file-btn">
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </>
          )}
        </Button>
        <span className="text-xs text-muted-foreground">MP3, WAV, PNG, JPG up to 50MB</span>
        <input ref={fileRef} type="file" accept="audio/*,image/*" className="hidden" onChange={handleUpload} />
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }, (_, idx) => `audio-loading-${idx}`).map((key) => (
            <div key={key} className="h-16 rounded-xl bg-card/50 animate-pulse" />
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <Upload className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No files uploaded yet</p>
          <p className="text-xs mt-1">Upload audio or images to use across your content</p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div key={file.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-white/10" data-testid={`file-item-${file.id}`}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 flex-shrink-0">
                {file.file_type === "audio" ? <Music className="w-4 h-4 text-primary" /> : <Image className="w-4 h-4 text-cyan-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.original_filename}</p>
                <p className="text-xs text-muted-foreground">{formatSize(file.size)} · {new Date(file.created_at).toLocaleDateString()}</p>
              </div>

              {file.file_type === "audio" && file.public_url && (
                <audio controls src={file.public_url} className="h-7 w-32" style={{ filter: "invert(0.7)" }} />
              )}
              {file.file_type === "image" && file.public_url && (
                <img
                  src={file.public_url}
                  alt={file.original_filename}
                  className="h-10 w-10 rounded object-cover"
                  onError={(event) => {
                    event.target.style.display = "none";
                  }}
                />
              )}

              <button
                onClick={() => copyUrl(file.public_url, file.id)}
                className="text-muted-foreground hover:text-primary transition-colors"
                title="Copy URL"
                data-testid={`copy-file-url-${file.id}`}
              >
                {copied === file.id ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={() => handleDelete(file.id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
                data-testid={`delete-file-${file.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};