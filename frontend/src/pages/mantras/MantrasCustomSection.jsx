import { motion } from "framer-motion";
import { Edit2, PenLine, Sparkles, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";

export const MantrasCustomSection = ({
  user,
  navigate,
  userMantras,
  elementColors,
  setEditingMantra,
  setNewMantra,
  setIsCreatingMantra,
  startEditingMantra,
  deleteUserMantra,
}) => {
  return (
    <div className="space-y-6" data-testid="custom-mantras-section">
      {user ? (
        <Button
          onClick={() => {
            setEditingMantra(null);
            setNewMantra({ text: "", category: "personal", element: "", notes: "" });
            setIsCreatingMantra(true);
          }}
          className="w-full py-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-purple-300 hover:from-purple-600/30 hover:to-pink-600/30"
          data-testid="create-mantra-btn"
        >
          <PenLine className="w-5 h-5 mr-2" />
          Write Your Own Powerful Mantra
        </Button>
      ) : (
        <div className="p-6 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center" data-testid="custom-mantras-signin-prompt">
          <Sparkles className="w-10 h-10 mx-auto mb-3 text-purple-400" />
          <p className="text-lg font-serif mb-2">Sign in to create your own mantras</p>
          <p className="text-sm text-muted-foreground mb-4">Save and organize your personal sacred words</p>
          <Button onClick={() => navigate("/")} className="bg-purple-600 hover:bg-purple-700" data-testid="custom-mantras-signin-btn">
            Sign In
          </Button>
        </div>
      )}

      {userMantras.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="custom-mantras-grid">
          {userMantras.map((mantra, index) => {
            const colors = mantra.element
              ? elementColors[mantra.element]
              : { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400" };
            return (
              <motion.div
                key={mantra.mantra_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-6 rounded-2xl border ${colors.bg} ${colors.border} relative group`}
              >
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEditingMantra(mantra)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    data-testid={`edit-mantra-${mantra.mantra_id}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteUserMantra(mantra.mantra_id)}
                    className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                    data-testid={`delete-mantra-${mantra.mantra_id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex gap-2 mb-3">
                  <span className="px-2 py-1 rounded-full bg-white/10 text-xs capitalize">
                    {mantra.category}
                  </span>
                  {mantra.element && (
                    <span className={`px-2 py-1 rounded-full text-xs ${colors.bg} ${colors.text}`}>
                      {mantra.element}
                    </span>
                  )}
                </div>

                <p className="text-lg font-serif italic leading-relaxed mb-3">"{mantra.text}"</p>

                {mantra.notes && (
                  <p className="text-sm text-muted-foreground">
                    {mantra.notes}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : user && (
        <div className="text-center py-12" data-testid="custom-mantras-empty-state">
          <PenLine className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-serif mb-2">No custom mantras yet</p>
          <p className="text-muted-foreground">Write your first powerful mantra above</p>
        </div>
      )}
    </div>
  );
};
