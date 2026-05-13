import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export const BigThreeCard = ({ chart }) => {
  return (
    <Card className="bg-gradient-to-br from-purple-500/20 via-blue-500/10 to-yellow-500/10 border-purple-500/30 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-center text-lg">Your Big Three</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="text-4xl">{chart.sun_sign_info?.symbol || "☉"}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Sun</div>
            <div className="font-serif text-lg text-yellow-400">{chart.sun_sign}</div>
            <Badge variant="outline" className="text-xs">
              {chart.sun_sign_info?.element}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="text-4xl">{chart.moon_sign_info?.symbol || "☽"}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Moon</div>
            <div className="font-serif text-lg text-slate-300">{chart.moon_sign}</div>
            <Badge variant="outline" className="text-xs">
              {chart.moon_sign_info?.element}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="text-4xl">{chart.rising_sign_info?.symbol || "AC"}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Rising</div>
            <div className="font-serif text-lg text-primary">{chart.rising_sign}</div>
            <Badge variant="outline" className="text-xs">
              {chart.rising_sign_info?.element}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
