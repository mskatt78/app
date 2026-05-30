import { Button } from "../../components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";

export const CoursesBundleOffer = ({
  allCoursesUnlocked,
  courses,
  handleBundlePurchase,
  purchaseLoading,
}) => {
  if (allCoursesUnlocked || courses.length === 0) return null;

  return (
    <div className="mb-8 p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5" data-testid="bundle-offer">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs bg-amber-500/20 text-amber-300 mb-2">Save $124</span>
          <h3 className="text-xl font-serif mb-1">All Sacred Rites Bundle</h3>
          <p className="text-sm text-muted-foreground">Get all 3 courses: Munay Ki, Nusta Karpay & 13th Rite of the Womb</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-2xl font-medium text-amber-300">$397</span>
            <span className="text-sm text-muted-foreground line-through ml-2">$521</span>
          </div>
          <Button onClick={handleBundlePurchase} disabled={purchaseLoading} className="bg-amber-500 hover:bg-amber-600" data-testid="bundle-purchase-btn">
            {purchaseLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CreditCard className="w-4 h-4 mr-2" /> Unlock All</>}
          </Button>
        </div>
      </div>
    </div>
  );
};