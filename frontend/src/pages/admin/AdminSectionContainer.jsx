import { AnimatePresence } from "framer-motion";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";
import { AdminAudioLibrary } from "./AdminAudioLibrary";
import { AdminItemModal } from "./AdminItemModal";
import { AdminItemsList } from "./AdminItemsList";
import { AdminListToolbar } from "./AdminListToolbar";
import { AdminYogaVerificationPanel } from "./AdminYogaVerificationPanel";
import { useAdminSectionData } from "./useAdminSectionData";
import { getCollectionMeta } from "./utils";

export default function AdminSection() {
  const { collection } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const apiBaseUrl = process.env.REACT_APP_BACKEND_URL;
  const meta = getCollectionMeta(collection);

  const {
    items,
    total,
    verificationSummary,
    loading,
    hasAdminSession,
    search,
    setSearch,
    page,
    setPage,
    modalItem,
    setModalItem,
    deleting,
    verificationFilter,
    setVerificationFilter,
    priorityFilter,
    setPriorityFilter,
    isAudio,
    isYogaCollection,
    updateYogaQueueParams,
    handleSave,
    handleDelete,
    pagination,
  } = useAdminSectionData({
    collection,
    apiBaseUrl,
    navigate,
    searchParams,
    setSearchParams,
  });

  return (
    <div className="min-h-screen bg-background" data-testid="admin-section">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center gap-4 bg-card/50 backdrop-blur-xl sticky top-0 z-10">
        <button onClick={() => navigate("/admin")} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-xl">{meta.icon}</span>
        <div>
          <h1 className="font-serif text-lg leading-none">{meta.name}</h1>
          {!isAudio && <p className="text-xs text-muted-foreground">{total} entries</p>}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {isAudio ? (
          hasAdminSession ? (
            <AdminAudioLibrary apiBaseUrl={apiBaseUrl} />
          ) : (
            <div className="space-y-2">
              {Array.from({ length: 4 }, (_, idx) => `admin-audio-loading-${idx}`).map((placeholderKey) => (
                <div key={placeholderKey} className="h-16 rounded-xl bg-card/50 animate-pulse" />
              ))}
            </div>
          )
        ) : (
          <>
            <AdminListToolbar
              metaName={meta.name}
              search={search}
              setSearch={setSearch}
              setPage={setPage}
              onAddNew={() => setModalItem(null)}
            />

            {isYogaCollection && (
              <AdminYogaVerificationPanel
                verificationSummary={verificationSummary}
                verificationFilter={verificationFilter}
                setVerificationFilter={setVerificationFilter}
                priorityFilter={priorityFilter}
                setPriorityFilter={setPriorityFilter}
                setPage={setPage}
                updateYogaQueueParams={updateYogaQueueParams}
              />
            )}

            <AdminItemsList
              loading={loading}
              items={items}
              isYogaCollection={isYogaCollection}
              deleting={deleting}
              onEdit={setModalItem}
              onDelete={handleDelete}
              onAddFirst={() => setModalItem(null)}
            />

            {/* Pagination */}
            {pagination.hasPages && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <span className="text-sm text-muted-foreground">Page {page} of {pagination.totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {modalItem !== undefined && hasAdminSession && (
          <AdminItemModal
            collection={collection}
            item={modalItem}
            onClose={() => setModalItem(undefined)}
            onSave={handleSave}
            apiBaseUrl={apiBaseUrl}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
