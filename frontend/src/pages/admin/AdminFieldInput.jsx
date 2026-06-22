import { useRef } from "react";
import { Image, Loader2, Music, Upload } from "lucide-react";
import { AUDIO_FIELDS, IMAGE_FIELDS, LIST_TEXTAREA_FIELDS, TEXTAREA_FIELDS, VIDEO_FIELDS } from "./constants";

export const AdminFieldInput = ({ field, value, onChange, onUpload, uploadLoading }) => {
  const isTextarea = TEXTAREA_FIELDS.has(field);
  const isImage = IMAGE_FIELDS.has(field);
  const isAudio = AUDIO_FIELDS.has(field);
  const isVideo = VIDEO_FIELDS.has(field);
  const fileRef = useRef();

  if (isVideo) {
    return (
      <div className="space-y-2">
        <input
          type="text"
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder="YouTube/Vimeo URL or direct video URL"
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50"
        />
        <p className="text-xs text-muted-foreground">Paste a YouTube, Vimeo, or direct .mp4 video link</p>
      </div>
    );
  }

  if (isImage || isAudio) {
    const accept = isImage ? "image/*" : "audio/mp3,audio/mpeg,audio/*";
    const FieldIcon = isImage ? Image : Music;

    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={value || ""}
            onChange={(event) => onChange(event.target.value)}
            placeholder="https://... or upload below"
            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploadLoading}
            className="px-3 py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs flex items-center gap-1 hover:bg-primary/20 transition-colors"
            data-testid={`admin-upload-${field}`}
          >
            {uploadLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
            Upload
          </button>
          <input
            ref={fileRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(event) => {
              if (event.target.files?.[0]) {
                onUpload(event.target.files[0], field);
              }
            }}
          />
        </div>
        {isImage && value && (
          <img
            src={value}
            alt="preview"
            className="h-24 w-auto rounded-lg object-cover border border-white/10"
            onError={(event) => {
              event.target.style.display = "none";
            }}
          />
        )}
        {isAudio && value && (
          <div className="flex items-center gap-2">
            <FieldIcon className="w-4 h-4 text-primary" />
            <audio controls src={value} className="w-full h-8" style={{ filter: "invert(0.8)" }} />
          </div>
        )}
      </div>
    );
  }

  if (isTextarea) {
    const normalizeTextareaValue = () => {
      if (!LIST_TEXTAREA_FIELDS.has(field)) {
        return value || "";
      }

      if (Array.isArray(value)) {
        return value.join("\n");
      }

      return value || "";
    };

    const handleTextareaChange = (raw) => {
      if (!LIST_TEXTAREA_FIELDS.has(field)) {
        onChange(raw);
        return;
      }

      const nextList = raw
        .split(/\n|,/) 
        .map((item) => item.trim())
        .filter(Boolean);
      onChange(nextList);
    };

    return (
      <textarea
        value={normalizeTextareaValue()}
        onChange={(event) => handleTextareaChange(event.target.value)}
        rows={3}
        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50 resize-none"
      />
    );
  }

  return (
    <input
      type="text"
      value={value || ""}
      onChange={(event) => onChange(event.target.value)}
      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50"
    />
  );
};