import { Plus, Search } from "lucide-react";
import { Button } from "../../components/ui/button";

export const AdminListToolbar = ({ metaName, search, setSearch, setPage, onAddNew }) => {
  return (
    <div className="flex items-center gap-3 mb-6" data-testid="admin-list-toolbar">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder={`Search ${metaName}...`}
          data-testid="search-input"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-card border border-white/10 text-sm focus:outline-none focus:border-primary/50"
        />
      </div>
      <Button onClick={onAddNew} data-testid="add-item-btn">
        <Plus className="w-4 h-4 mr-1" /> Add New
      </Button>
    </div>
  );
};