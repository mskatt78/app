import { Copy } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";

export const RitualBuilderShareDialog = ({ open, onOpenChange, shareUrl, onCopy }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-white/10" data-testid="ritual-share-dialog">
        <DialogHeader>
          <DialogTitle>Share Ritual</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-background border border-white/10 break-all text-sm" data-testid="ritual-share-url">
            {shareUrl}
          </div>
          <Button className="w-full" onClick={onCopy} data-testid="copy-ritual-share-url-btn">
            <Copy className="w-4 h-4 mr-2" /> Copy Link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
