// Admin form field components for consistent styling
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { Upload, X, Plus, Loader2 } from "lucide-react";

// Text input field
export const TextField = ({ label, name, value, onChange, placeholder, required, type = "text" }) => (
  <div className="space-y-1">
    <label className="text-sm text-muted-foreground">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <Input
      type={type}
      placeholder={placeholder || label}
      value={value || ""}
      onChange={(e) => onChange(name, e.target.value)}
      data-testid={`admin-${name}-input`}
    />
  </div>
);

// Textarea field
export const TextareaField = ({ label, name, value, onChange, placeholder, rows = 3 }) => (
  <div className="space-y-1">
    <label className="text-sm text-muted-foreground">{label}</label>
    <Textarea
      placeholder={placeholder || label}
      value={value || ""}
      onChange={(e) => onChange(name, e.target.value)}
      rows={rows}
      data-testid={`admin-${name}-textarea`}
    />
  </div>
);

// Number input field
export const NumberField = ({ label, name, value, onChange, min, max, step }) => (
  <div className="space-y-1">
    <label className="text-sm text-muted-foreground">{label}</label>
    <Input
      type="number"
      min={min}
      max={max}
      step={step}
      value={value || 0}
      onChange={(e) => onChange(name, parseFloat(e.target.value) || 0)}
      data-testid={`admin-${name}-input`}
    />
  </div>
);

// Select field
export const SelectField = ({ label, name, value, onChange, options, placeholder }) => (
  <div className="space-y-1">
    <label className="text-sm text-muted-foreground">{label}</label>
    <Select value={value || ""} onValueChange={(val) => onChange(name, val)}>
      <SelectTrigger data-testid={`admin-${name}-select`}>
        <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
            {typeof opt === 'string' ? opt : opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

// Image upload field
export const ImageUploadField = ({ label, value, onUpload, uploading, onRemove }) => (
  <div className="space-y-2">
    <label className="text-sm text-muted-foreground">{label}</label>
    {value ? (
      <div className="relative group">
        <img 
          src={value} 
          alt="Preview" 
          className="w-full h-40 object-cover rounded-lg"
        />
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>
    ) : (
      <div className="border-2 border-dashed border-white/10 rounded-lg p-4 text-center">
        <input
          type="file"
          accept="image/*"
          onChange={onUpload}
          className="hidden"
          id="image-upload"
        />
        <label 
          htmlFor="image-upload" 
          className="flex flex-col items-center cursor-pointer"
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          ) : (
            <>
              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Upload image</span>
            </>
          )}
        </label>
      </div>
    )}
  </div>
);

// Array field (for lists like benefits, instructions, etc.)
export const ArrayField = ({ label, name, value, onChange, placeholder }) => {
  const items = Array.isArray(value) ? value : [];
  
  const addItem = () => {
    onChange(name, [...items, ""]);
  };
  
  const updateItem = (index, newValue) => {
    const updated = [...items];
    updated[index] = newValue;
    onChange(name, updated);
  };
  
  const removeItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    onChange(name, updated);
  };
  
  return (
    <div className="space-y-2">
      <label className="text-sm text-muted-foreground">{label}</label>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={`${placeholder || label} ${index + 1}`}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeItem(index)}
              className="shrink-0 hover:bg-red-500/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addItem}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" /> Add {label}
      </Button>
    </div>
  );
};

// Multi-select checkboxes (for chakras, etc.)
export const CheckboxGroupField = ({ label, name, value, onChange, options }) => {
  const selected = Array.isArray(value) ? value : [];
  
  const toggleOption = (opt) => {
    if (selected.includes(opt)) {
      onChange(name, selected.filter(v => v !== opt));
    } else {
      onChange(name, [...selected, opt]);
    }
  };
  
  return (
    <div className="space-y-2">
      <label className="text-sm text-muted-foreground">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggleOption(opt)}
            className={`px-3 py-1 rounded-full text-xs transition-colors ${
              selected.includes(opt)
                ? "bg-primary text-primary-foreground"
                : "bg-white/5 text-muted-foreground hover:bg-white/10"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

// Date/time field
export const DateTimeField = ({ label, name, value, onChange, type = "date" }) => (
  <div className="space-y-1">
    <label className="text-sm text-muted-foreground">{label}</label>
    <Input
      type={type}
      value={value || ""}
      onChange={(e) => onChange(name, e.target.value)}
      data-testid={`admin-${name}-input`}
    />
  </div>
);

// Toggle/Switch field
export const ToggleField = ({ label, name, value, onChange }) => (
  <div className="flex items-center justify-between">
    <label className="text-sm text-muted-foreground">{label}</label>
    <button
      type="button"
      onClick={() => onChange(name, !value)}
      className={`w-12 h-6 rounded-full transition-colors ${
        value ? "bg-primary" : "bg-white/10"
      }`}
    >
      <div
        className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
          value ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);

export default {
  TextField,
  TextareaField,
  NumberField,
  SelectField,
  ImageUploadField,
  ArrayField,
  CheckboxGroupField,
  DateTimeField,
  ToggleField
};
