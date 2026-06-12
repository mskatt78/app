import { CHAKRA_CONFIG, getFilterButtonClassName } from "./chakraConfig";

export const ChakraFilterBar = ({ chakras, filterChakra, setFilterChakra }) => {
  return (
    <div className="flex gap-2 flex-wrap mb-8 justify-center" data-testid="chakra-filter-bar">
      {chakras.map((chakra) => {
        const config = CHAKRA_CONFIG[chakra];
        return (
          <button
            key={chakra}
            onClick={() => setFilterChakra(chakra)}
            className={`px-4 py-2 rounded-full text-sm capitalize transition-all flex items-center gap-2 ${getFilterButtonClassName(
              filterChakra,
              chakra,
              config
            )}`}
            data-testid={`filter-${chakra}`}
          >
            {config && <span>{config.icon}</span>}
            {chakra === "all" ? "All Chakras" : chakra.replace("_", " ")}
          </button>
        );
      })}
    </div>
  );
};