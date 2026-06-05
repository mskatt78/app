import { MantrasHeader } from "./MantrasHeader";
import { MantrasTabs } from "./MantrasTabs";

export const MantrasFilters = ({
  navigate,
  selectedElement,
  setSelectedElement,
  elements,
  activeTab,
  setActiveTab,
  userMantrasCount,
}) => {
  return (
    <>
      <MantrasHeader
        navigate={navigate}
        selectedElement={selectedElement}
        setSelectedElement={setSelectedElement}
        elements={elements}
      />
      <MantrasTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userMantrasCount={userMantrasCount}
      />
    </>
  );
};
