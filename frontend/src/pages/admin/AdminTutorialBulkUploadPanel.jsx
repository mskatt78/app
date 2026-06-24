import React, { useRef, useState } from "react";
import axios from "axios";
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle } from "lucide-react";

const API = process.env.REACT_APP_BACKEND_URL;

export const AdminTutorialBulkUploadPanel = () => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Please choose a CSV file first.");
      return;
    }

    setUploading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post(`${API}/api/admin/tutorial-overrides/bulk-upload`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(response.data);
    } catch (err) {
      const detail = err.response?.data?.detail || err.message || "Upload failed";
      setError(detail);
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5" data-testid="admin-tutorial-bulk-upload-panel">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
          <FileSpreadsheet className="h-5 w-5 text-cyan-300" />
        </div>
        <div>
          <h3 className="text-sm uppercase tracking-wider text-cyan-300">Tutorial Overrides CSV Upload</h3>
          <p className="text-xs text-muted-foreground">Bulk update tutorial URLs, best-for tags, and safety notes.</p>
        </div>
      </div>

      <div className="space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border file:border-white/20 file:bg-white/5 file:px-3 file:py-1.5 file:text-xs"
          data-testid="admin-bulk-upload-file-input"
        />

        <button
          onClick={handleUpload}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-100 hover:bg-cyan-500/20 disabled:opacity-50"
          data-testid="admin-bulk-upload-submit-button"
        >
          <UploadCloud className="h-4 w-4" />
          {uploading ? "Uploading…" : "Upload CSV"}
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-muted-foreground" data-testid="admin-bulk-upload-csv-format-note">
        <p className="mb-2 text-cyan-200">CSV columns:</p>
        <p>collection,item_id,item_name,youtube_tutorial_override_urls,best_for_tags,safety_notes</p>
        <p className="mt-1">Use comma or | separators for multi-value fields.</p>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200 flex items-start gap-2" data-testid="admin-bulk-upload-error">
          <AlertTriangle className="h-4 w-4 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200" data-testid="admin-bulk-upload-result">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Bulk upload completed</span>
          </div>
          <p>Processed: {result.processed} | Updated: {result.updated} | Skipped: {result.skipped}</p>
          {result.error_count > 0 && <p className="mt-1 text-amber-200">Errors: {result.error_count} (first 50 returned by API)</p>}
        </div>
      )}
    </section>
  );
};
