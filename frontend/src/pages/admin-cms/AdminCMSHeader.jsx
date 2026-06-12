import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "../../components/ui/button";

export const AdminCMSHeader = ({ navigate, onCreate }) => {
  return (
    <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-white/10" data-testid="admin-cms-header">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} data-testid="admin-cms-back-button">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-serif">Admin CMS</h1>
          </div>
          <Button onClick={onCreate} data-testid="create-new-btn">
            <Plus className="w-4 h-4 mr-2" /> Add New
          </Button>
        </div>
      </div>
    </div>
  );
};