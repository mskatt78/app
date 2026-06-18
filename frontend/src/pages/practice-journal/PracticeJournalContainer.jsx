import { useNavigate } from "react-router-dom";
import { getMoonPhase, getRandomPrompt } from "./constants";
import { PracticeJournalEntriesList } from "./PracticeJournalEntriesList";
import { PracticeJournalEmptyState } from "./PracticeJournalEmptyState";
import { PracticeJournalFilters } from "./PracticeJournalFilters";
import { PracticeJournalFormModal } from "./PracticeJournalFormModal";
import { PracticeJournalHeader } from "./PracticeJournalHeader";
import { usePracticeJournalData } from "./usePracticeJournalData";

export const PracticeJournalContainer = ({ user, api }) => {
  const navigate = useNavigate();
  const moonPhase = getMoonPhase();
  const {
    entries,
    showForm,
    editingEntry,
    filterType,
    searchTerm,
    expandedEntry,
    currentPrompt,
    sharingId,
    formData,
    filteredEntries,
    streak,
    milestone,
    totalEntries,
    thisWeek,
    setShowForm,
    setFilterType,
    setSearchTerm,
    setExpandedEntry,
    setCurrentPrompt,
    setFormData,
    handleSubmit,
    handleDelete,
    resetForm,
    startEdit,
    handleShareToCommunity,
  } = usePracticeJournalData({ api, navigate, user });

  const hasEntriesToRender = filteredEntries.length > 0;

  return (
    <div className="min-h-screen bg-background" data-testid="practice-journal-page">
      <PracticeJournalHeader
        navigate={navigate}
        setShowForm={setShowForm}
        streak={streak}
        milestone={milestone}
        totalEntries={totalEntries}
        thisWeek={thisWeek}
        moonPhase={moonPhase}
      />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <PracticeJournalFilters
          filterType={filterType}
          setFilterType={setFilterType}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {hasEntriesToRender ? (
          <PracticeJournalEntriesList
            filteredEntries={filteredEntries}
            expandedEntry={expandedEntry}
            setExpandedEntry={setExpandedEntry}
            startEdit={startEdit}
            handleDelete={handleDelete}
            handleShareToCommunity={handleShareToCommunity}
            sharingId={sharingId}
          />
        ) : (
          <PracticeJournalEmptyState entriesCount={entries.length} setShowForm={setShowForm} />
        )}
      </main>

      <PracticeJournalFormModal
        showForm={showForm}
        resetForm={resetForm}
        editingEntry={editingEntry}
        currentPrompt={currentPrompt}
        onGeneratePrompt={() => setCurrentPrompt(getRandomPrompt())}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        moonPhase={moonPhase}
        api={api}
        user={user}
      />
    </div>
  );
};
