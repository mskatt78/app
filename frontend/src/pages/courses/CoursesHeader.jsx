import { ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "../../components/ui/button";

export const CoursesHeader = ({ navigate }) => (
  <header className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-violet-950/40 to-background">
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-4 text-muted-foreground" data-testid="courses-back-btn">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Button>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 rounded-xl bg-violet-500/10">
          <BookOpen className="w-8 h-8 text-violet-400" />
        </div>
        <div>
          <h1 className="text-4xl sm:text-5xl font-serif">Courses</h1>
          <p className="text-muted-foreground mt-1">Live & recorded teachings for your spiritual journey</p>
        </div>
      </div>
    </div>
  </header>
);
