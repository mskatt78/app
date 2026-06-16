export const RitualBuilderLoadingView = () => {
  return (
    <div className="max-w-6xl mx-auto p-6" data-testid="ritual-builder-loading-view">
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground">Loading your rituals...</p>
      </div>
    </div>
  );
};
