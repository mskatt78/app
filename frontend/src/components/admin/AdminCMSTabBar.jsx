export const AdminCMSTabBar = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
              activeTab === tab.id ? "bg-primary text-primary-foreground" : "bg-white/5 hover:bg-white/10"
            }`}
            data-testid={`tab-${tab.id}`}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
