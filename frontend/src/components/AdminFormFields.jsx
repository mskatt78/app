/**
 * Reusable Admin Form Components for CMS
 * Reduces code duplication across admin forms
 */
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Upload, Image, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

// Form field components
export const FormField = ({ label, children, className = "" }) => (
  <div className={className}>
    <label className="text-sm text-muted-foreground block mb-1">{label}</label>
    {children}
  </div>
);

export const TextField = ({ label, value, onChange, placeholder, className = "" }) => (
  <FormField label={label} className={className}>
    <Input
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </FormField>
);

export const TextAreaField = ({ label, value, onChange, placeholder, rows = 3, className = "" }) => (
  <FormField label={label} className={className}>
    <Textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
    />
  </FormField>
);

export const NumberField = ({ label, value, onChange, min = 0, step = 1, className = "" }) => (
  <FormField label={label} className={className}>
    <Input
      type="number"
      value={value || 0}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      min={min}
      step={step}
    />
  </FormField>
);

export const DateField = ({ label, value, onChange, className = "" }) => (
  <FormField label={label} className={className}>
    <Input
      type="date"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
    />
  </FormField>
);

export const TimeField = ({ label, value, onChange, className = "" }) => (
  <FormField label={label} className={className}>
    <Input
      type="time"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
    />
  </FormField>
);

export const SelectField = ({ label, value, onChange, options, className = "" }) => (
  <FormField label={label} className={className}>
    <Select value={value || options[0]} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map(opt => (
          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </FormField>
);

export const ArrayField = ({ label, value, onChange, placeholder, rows = 3, className = "" }) => {
  const handleChange = (text) => {
    const arr = text.split("\n").filter(v => v.trim());
    onChange(arr);
  };
  
  return (
    <FormField label={label} className={className}>
      <Textarea
        value={(value || []).join("\n")}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
    </FormField>
  );
};

export const ImageUploadField = ({ value, onChange, api }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid image (JPG, PNG, GIF, or WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      onChange(response.data.url);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <FormField label="Image">
      <div className="flex gap-2">
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste URL or upload image"
          className="flex-1"
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUpload}
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="shrink-0"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
        </Button>
      </div>
      {value && (
        <div className="mt-2 relative w-24 h-24 rounded-lg overflow-hidden bg-white/5">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}
    </FormField>
  );
};

// Form grid layouts
export const FormRow = ({ children, cols = 2 }) => (
  <div className={`grid grid-cols-${cols} gap-4`}>
    {children}
  </div>
);

export const FormSection = ({ title, children }) => (
  <div className="space-y-4">
    {title && <h4 className="font-medium text-sm text-primary">{title}</h4>}
    {children}
  </div>
);
