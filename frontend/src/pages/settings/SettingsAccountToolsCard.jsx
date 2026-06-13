import { motion } from "framer-motion";
import { Download, Globe, Radio, ShieldCheck, Smartphone, Sparkles, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";

export const SettingsAccountToolsCard = ({
  navigate,
  exporting,
  exportAccountData,
  isAdminUser,
  deletionStatus,
  requestingDeletion,
  requestAccountDeletion,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.18 }}
    className="p-6 rounded-2xl bg-card/50 border border-white/5"
    data-testid="settings-account-tools"
  >
    <h2 className="text-xl font-serif mb-6 flex items-center gap-2">
      <ShieldCheck className="w-5 h-5 text-primary" />
      Account & App Support
    </h2>

    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <Button variant="outline" onClick={() => navigate("/support")} data-testid="settings-support-btn">
          <Smartphone className="w-4 h-4 mr-2" /> Support & install guide
        </Button>
        <Button variant="outline" onClick={() => navigate("/privacy")} data-testid="settings-privacy-btn">
          <Globe className="w-4 h-4 mr-2" /> Privacy policy
        </Button>
        <Button variant="outline" onClick={exportAccountData} disabled={exporting} data-testid="settings-export-btn">
          <Download className="w-4 h-4 mr-2" /> {exporting ? "Exporting..." : "Export my data"}
        </Button>
        <Button variant="outline" onClick={() => navigate("/demo")} data-testid="settings-demo-btn">
          <Sparkles className="w-4 h-4 mr-2" /> Open polished demo
        </Button>
        <Button variant="outline" onClick={() => navigate("/live")} data-testid="settings-live-btn">
          <Radio className="w-4 h-4 mr-2" /> Live client spaces
        </Button>
        {isAdminUser && (
          <Button variant="outline" onClick={() => navigate("/admin")} data-testid="settings-admin-btn">
            <ShieldCheck className="w-4 h-4 mr-2" /> Temple admin
          </Button>
        )}
      </div>

      <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
        <p className="text-sm font-medium mb-1">Account deletion</p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          If you need your account removed, you can submit a deletion request here instead of emailing support.
        </p>
        {deletionStatus?.status === "requested" ? (
          <div className="text-sm text-primary" data-testid="settings-deletion-status">
            Deletion request submitted{deletionStatus.requested_at ? ` on ${new Date(deletionStatus.requested_at).toLocaleDateString()}` : ""}.
          </div>
        ) : (
          <Button
            variant="destructive"
            onClick={requestAccountDeletion}
            disabled={requestingDeletion}
            data-testid="settings-delete-request-btn"
          >
            <Trash2 className="w-4 h-4 mr-2" /> {requestingDeletion ? "Submitting..." : "Request account deletion"}
          </Button>
        )}
      </div>
    </div>
  </motion.div>
);
