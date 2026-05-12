"use client";

export interface ScreenerFilterValues {
  search: string;
  ivRankMin: string;
  ivRankMax: string;
  maxDaysToEarnings: string;
  minPutPremiumYield: string;
}

interface ScreenerFiltersProps {
  filters: ScreenerFilterValues;
  onChange: (filters: ScreenerFilterValues) => void;
}

export function ScreenerFilters({ filters, onChange }: ScreenerFiltersProps) {
  function update(key: keyof ScreenerFilterValues, value: string) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="flex flex-wrap gap-3 items-end">
      {/* Search */}
      <div className="flex flex-col gap-1 min-w-[200px]">
        <label className="label">Search</label>
        <input
          type="text"
          placeholder="Ticker or company..."
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
          className="input-field"
        />
      </div>

      {/* IV Rank range */}
      <div className="flex flex-col gap-1">
        <label className="label">IV Rank</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            min={0}
            max={100}
            value={filters.ivRankMin}
            onChange={(e) => update("ivRankMin", e.target.value)}
            className="input-field w-16 text-center"
          />
          <span className="text-[var(--text-muted)] text-xs">to</span>
          <input
            type="number"
            placeholder="Max"
            min={0}
            max={100}
            value={filters.ivRankMax}
            onChange={(e) => update("ivRankMax", e.target.value)}
            className="input-field w-16 text-center"
          />
        </div>
      </div>

      {/* Days to earnings */}
      <div className="flex flex-col gap-1">
        <label className="label">Max Days to Earnings</label>
        <input
          type="number"
          placeholder="e.g. 14"
          min={0}
          value={filters.maxDaysToEarnings}
          onChange={(e) => update("maxDaysToEarnings", e.target.value)}
          className="input-field w-28"
        />
      </div>

      {/* Min put premium yield */}
      <div className="flex flex-col gap-1">
        <label className="label">Min Put Yield %</label>
        <input
          type="number"
          placeholder="e.g. 1.0"
          min={0}
          step={0.1}
          value={filters.minPutPremiumYield}
          onChange={(e) => update("minPutPremiumYield", e.target.value)}
          className="input-field w-24"
        />
      </div>

      {/* Reset */}
      {(filters.search ||
        filters.ivRankMin ||
        filters.ivRankMax ||
        filters.maxDaysToEarnings ||
        filters.minPutPremiumYield) && (
        <button
          onClick={() =>
            onChange({
              search: "",
              ivRankMin: "",
              ivRankMax: "",
              maxDaysToEarnings: "",
              minPutPremiumYield: "",
            })
          }
          className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150 self-end pb-2"
        >
          Reset filters
        </button>
      )}
    </div>
  );
}
