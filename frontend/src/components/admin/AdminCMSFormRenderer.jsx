import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { Loader2, Upload } from "lucide-react";

export const AdminCMSFormRenderer = ({
  activeTab,
  formData,
  updateField,
  updateArrayField,
  uploading,
  fileInputRef,
  handleImageUpload,
  constants,
}) => {
  const {
    ELEMENTS,
    DIFFICULTIES,
    CHAKRAS,
    HEART_CATEGORIES,
    CREATIVE_CATEGORIES,
    SHAMANIC_CATEGORIES,
    ELEMENTAL_CATEGORIES,
  } = constants;

  const TextField = ({ name, label, placeholder, required }) => (
    <div className="space-y-1" data-testid={`admin-form-field-${name}`}>
      <label className="text-sm text-muted-foreground">{label} {required && <span className="text-red-400">*</span>}</label>
      <Input value={formData[name] || ""} onChange={(e) => updateField(name, e.target.value)} placeholder={placeholder || label} />
    </div>
  );

  const TextareaField = ({ name, label, rows = 3 }) => (
    <div className="space-y-1" data-testid={`admin-form-textarea-${name}`}>
      <label className="text-sm text-muted-foreground">{label}</label>
      <Textarea value={formData[name] || ""} onChange={(e) => updateField(name, e.target.value)} rows={rows} />
    </div>
  );

  const NumberField = ({ name, label, min, max }) => (
    <div className="space-y-1" data-testid={`admin-form-number-${name}`}>
      <label className="text-sm text-muted-foreground">{label}</label>
      <Input
        type="number"
        min={min}
        max={max}
        value={formData[name] || 0}
        onChange={(e) => updateField(name, parseFloat(e.target.value) || 0)}
      />
    </div>
  );

  const SelectField = ({ name, label, options }) => (
    <div className="space-y-1" data-testid={`admin-form-select-${name}`}>
      <label className="text-sm text-muted-foreground">{label}</label>
      <Select value={formData[name] || ""} onValueChange={(v) => updateField(name, v)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );

  const ArrayField = ({ name, label, placeholder }) => (
    <div className="space-y-1" data-testid={`admin-form-array-${name}`}>
      <label className="text-sm text-muted-foreground">{label} (one per line)</label>
      <Textarea
        value={(formData[name] || []).join("\n")}
        onChange={(e) => updateArrayField(name, e.target.value)}
        placeholder={placeholder}
        rows={3}
      />
    </div>
  );

  const ImageField = () => (
    <div className="space-y-2" data-testid="admin-form-image-field">
      <label className="text-sm text-muted-foreground">Image</label>
      <div className="flex gap-2">
        <Input value={formData.image_url || ""} onChange={(e) => updateField("image_url", e.target.value)} placeholder="Image URL" className="flex-1" />
        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
        <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading} data-testid="admin-upload-image-button">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        </Button>
      </div>
      {formData.image_url && <img src={formData.image_url} alt="Preview" className="w-24 h-24 object-cover rounded-lg" />}
    </div>
  );

  const ChakraField = () => (
    <div className="space-y-2" data-testid="admin-form-chakra-field">
      <label className="text-sm text-muted-foreground">Chakras</label>
      <div className="flex flex-wrap gap-2">
        {CHAKRAS.map((chakra) => (
          <button
            key={chakra}
            type="button"
            onClick={() => {
              const current = formData.chakras || [];
              const updated = current.includes(chakra)
                ? current.filter((c) => c !== chakra)
                : [...current, chakra];
              updateField("chakras", updated);
            }}
            className={`px-3 py-1 rounded-full text-xs transition-colors ${(formData.chakras || []).includes(chakra) ? "bg-primary text-primary-foreground" : "bg-white/5 hover:bg-white/10"}`}
          >
            {chakra}
          </button>
        ))}
      </div>
    </div>
  );

  const commonFields = (
    <>
      <TextField name="name" label="Name" required />
      <TextareaField name="description" label="Description" />
      <SelectField name="element" label="Element" options={ELEMENTS} />
      <ImageField />
    </>
  );

  switch (activeTab) {
    case "yoga":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <TextField name="name" label="Pose Name" required />
            <TextField name="sanskrit_name" label="Sanskrit Name" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <SelectField name="element" label="Element" options={ELEMENTS} />
            <SelectField name="difficulty" label="Difficulty" options={DIFFICULTIES} />
            <NumberField name="duration_minutes" label="Duration (min)" />
          </div>
          <TextareaField name="description" label="Description" />
          <ImageField />
          <ArrayField name="instructions" label="Instructions" />
          <ArrayField name="benefits" label="Benefits" />
          <ChakraField />
        </div>
      );
    case "crystals":
      return (
        <div className="space-y-4">
          <TextField name="name" label="Crystal Name" required />
          <SelectField name="element" label="Element" options={ELEMENTS} />
          <TextareaField name="description" label="Description" />
          <ArrayField name="properties" label="Properties" />
          <ChakraField />
          <ImageField />
        </div>
      );
    case "retreats":
      return (
        <div className="space-y-4">
          <TextField name="name" label="Retreat Name" required />
          <TextareaField name="description" label="Description" />
          <div className="grid grid-cols-2 gap-4">
            <SelectField name="retreat_mode" label="Retreat Mode" options={["physical", "online", "hybrid"]} />
            <TextField name="online_session_url" label="Online Session URL" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField name="location" label="Location" />
            <NumberField name="price" label="Price ($)" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-sm text-muted-foreground">Start Date</label><Input type="date" value={formData.start_date || ""} onChange={(e) => updateField("start_date", e.target.value)} /></div>
            <div className="space-y-1"><label className="text-sm text-muted-foreground">End Date</label><Input type="date" value={formData.end_date || ""} onChange={(e) => updateField("end_date", e.target.value)} /></div>
          </div>
          <NumberField name="capacity" label="Capacity" />
          <ArrayField name="features" label="Features" />
          <ArrayField name="includes" label="What's Included" />
          <div className="grid grid-cols-2 gap-4">
            <TextField name="instagram_url" label="Instagram URL" />
            <TextField name="youtube_url" label="YouTube URL" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField name="facebook_url" label="Facebook URL" />
            <TextField name="tiktok_url" label="TikTok URL" />
          </div>
          <TextField name="website_url" label="Website URL" />
          <ImageField />
        </div>
      );
    case "books":
      return (
        <div className="space-y-4">
          <TextField name="title" label="Book Title" required />
          <TextField name="author" label="Author" />
          <TextareaField name="description" label="Description" />
          <div className="grid grid-cols-2 gap-4">
            <NumberField name="price" label="Price ($)" />
            <TextField name="purchase_url" label="Purchase URL" />
          </div>
          <ImageField />
        </div>
      );
    case "custom-oracle-cards":
      return (
        <div className="space-y-4">
          <TextField name="name" label="Card Name" required />
          <SelectField name="element" label="Element" options={ELEMENTS} />
          <TextareaField name="meaning" label="Upright Meaning" />
          <TextareaField name="reversed_meaning" label="Reversed Meaning" />
          <ArrayField name="keywords" label="Keywords" />
          <ImageField />
        </div>
      );
    case "live-sessions":
      return (
        <div className="space-y-4">
          <TextField name="title" label="Session Title" required />
          <TextareaField name="description" label="Description" />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-sm text-muted-foreground">Date & Time</label><Input type="datetime-local" value={formData.scheduled_at || ""} onChange={(e) => updateField("scheduled_at", e.target.value)} /></div>
            <NumberField name="duration_minutes" label="Duration (min)" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField name="platform" label="Platform" options={["zoom", "youtube", "other"]} />
            <TextField name="join_url" label="Join URL" />
          </div>
          <NumberField name="price" label="Price ($)" />
        </div>
      );
    case "heart-practices":
      return (
        <div className="space-y-4">
          <TextField name="name" label="Practice Name" required />
          <SelectField name="category" label="Category" options={HEART_CATEGORIES} />
          <TextareaField name="description" label="Description" />
          <TextField name="tradition" label="Tradition" />
          <NumberField name="duration_minutes" label="Duration (min)" />
          <ArrayField name="benefits" label="Benefits" />
          <ArrayField name="steps" label="Steps" />
          <TextField name="affirmation" label="Affirmation" />
          <ImageField />
        </div>
      );
    case "shamanic-practices":
      return (
        <div className="space-y-4">
          <TextField name="name" label="Practice Name" required />
          <SelectField name="category" label="Category" options={SHAMANIC_CATEGORIES} />
          <TextareaField name="description" label="Description" />
          <TextField name="tradition" label="Tradition" />
          <NumberField name="duration_minutes" label="Duration (min)" />
          <TextareaField name="preparation" label="Preparation" />
          <ArrayField name="journey_steps" label="Journey Steps" />
          <TextareaField name="safety_notes" label="Safety Notes" />
          <ImageField />
        </div>
      );
    case "elemental-practices":
      return (
        <div className="space-y-4">
          <TextField name="name" label="Practice Name" required />
          <div className="grid grid-cols-2 gap-4">
            <SelectField name="element" label="Element" options={ELEMENTS} />
            <SelectField name="category" label="Category" options={ELEMENTAL_CATEGORIES} />
          </div>
          <TextareaField name="description" label="Description" />
          <div className="grid grid-cols-2 gap-4">
            <SelectField name="difficulty" label="Difficulty" options={DIFFICULTIES} />
            <NumberField name="duration_minutes" label="Duration (min)" />
          </div>
          <ArrayField name="benefits" label="Benefits" />
          <ArrayField name="instructions" label="Instructions" />
          <ImageField />
        </div>
      );
    case "creative-processes":
      return (
        <div className="space-y-4">
          <TextField name="name" label="Process Name" required />
          <SelectField name="category" label="Category" options={CREATIVE_CATEGORIES} />
          <TextareaField name="description" label="Description" />
          <TextField name="tradition" label="Tradition" />
          <NumberField name="duration_minutes" label="Duration (min)" />
          <ArrayField name="materials" label="Materials Needed" />
          <ArrayField name="process_steps" label="Process Steps" />
          <TextField name="spiritual_purpose" label="Spiritual Purpose" />
          <ImageField />
        </div>
      );
    default:
      return (
        <div className="space-y-4">
          {commonFields}
          <ArrayField name="benefits" label="Benefits" />
        </div>
      );
  }
};
