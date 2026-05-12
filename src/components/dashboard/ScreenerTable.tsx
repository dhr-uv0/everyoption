"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { ScreenerFilters, type ScreenerFilterValues } from "./ScreenerFilters";
import type { Stock, StockSnapshot } from "@/types/database";

export type ScreenerRow = Stock & { snapshot: StockSnapshot | null };

type SortKey = keyof StockSnapshot | "ticker" | "company_name";
type SortDir = "asc" | "desc";

const ROWS_PER_PAGE = 50;

function fmt(val: number | null, decimals = 2, suffix = ""): string {
  if (val === null || val === undefined) return "—";
  return val.toFixed(decimals) + suffix;
}

function fmtMarketCap(val: number | null): string {
  if (!val) return "—";
  if (val >= 1e12) return `$${(val / 1e12).toFixed(1)}T`;
  if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(0)}M`;
  return `$${val.toLocaleString()}`;
}

interface ColumnDef {
  key: SortKey;
  label: string;
  render: (row: ScreenerRow) => React.ReactNode;
  sortValue: (row: ScreenerRow) => number | string | null;
}

const columns: ColumnDef[] = [
  {
    key: "ticker",
    label: "Ticker",
    render: (row) => (
      <div>
        <div className="font-semibold text-[var(--text-primary)]">{row.ticker}</div>
        <div className="text-xs text-[var(--text-muted)] truncate max-w-[140px]">{row.company_name}</div>
      </div>
    ),
    sortValue: (row) => row.ticker,
  },
  {
    key: "price",
    label: "Price",
    render: (row) => (
      <div>
        <div>${fmt(row.snapshot?.price ?? null)}</div>
        {row.snapshot?.price_change_pct != null && (
          <div className={`text-xs ${row.snapshot.price_change_pct >= 0 ? "text-success" : "text-error"}`}>
            {row.snapshot.price_change_pct >= 0 ? "+" : ""}{fmt(row.snapshot.price_change_pct)}%
          </div>
        )}
      </div>
    ),
    sortValue: (row) => row.snapshot?.price ?? null,
  },
  {
    key: "market_cap",
    label: "Market Cap",
    render: (row) => fmtMarketCap(row.snapshot?.market_cap ?? null),
    sortValue: (row) => row.snapshot?.market_cap ?? null,
  },
  {
    key: "iv_rank",
    label: "IV Rank",
    render: (row) => fmt(row.snapshot?.iv_rank ?? null, 0),
    sortValue: (row) => row.snapshot?.iv_rank ?? null,
  },
  {
    key: "iv_percentile",
    label: "IV %ile",
    render: (row) => fmt(row.snapshot?.iv_percentile ?? null, 0),
    sortValue: (row) => row.snapshot?.iv_percentile ?? null,
  },
  {
    key: "iv_30d",
    label: "30D IV",
    render: (row) => fmt(row.snapshot?.iv_30d ?? null, 1, "%"),
    sortValue: (row) => row.snapshot?.iv_30d ?? null,
  },
  {
    key: "hv_30d",
    label: "HV 30D",
    render: (row) => fmt(row.snapshot?.hv_30d ?? null, 1, "%"),
    sortValue: (row) => row.snapshot?.hv_30d ?? null,
  },
  {
    key: "put_premium_yield",
    label: "Put Yield",
    render: (row) => fmt(row.snapshot?.put_premium_yield ?? null, 2, "%"),
    sortValue: (row) => row.snapshot?.put_premium_yield ?? null,
  },
  {
    key: "atm_put_delta",
    label: "Delta",
    render: (row) => fmt(row.snapshot?.atm_put_delta ?? null, 2),
    sortValue: (row) => row.snapshot?.atm_put_delta ?? null,
  },
  {
    key: "bid_ask_spread",
    label: "B/A Spread",
    render: (row) => fmt(row.snapshot?.bid_ask_spread ?? null, 2),
    sortValue: (row) => row.snapshot?.bid_ask_spread ?? null,
  },
  {
    key: "open_interest_puts",
    label: "OI (Puts)",
    render: (row) => row.snapshot?.open_interest_puts?.toLocaleString() ?? "—",
    sortValue: (row) => row.snapshot?.open_interest_puts ?? null,
  },
  {
    key: "beta",
    label: "Beta",
    render: (row) => fmt(row.snapshot?.beta ?? null, 2),
    sortValue: (row) => row.snapshot?.beta ?? null,
  },
  {
    key: "rsi_14",
    label: "RSI",
    render: (row) => {
      const rsi = row.snapshot?.rsi_14;
      if (rsi == null) return "—";
      const color = rsi > 70 ? "text-error" : rsi < 30 ? "text-warning" : "text-[var(--text-primary)]";
      return <span className={color}>{fmt(rsi, 0)}</span>;
    },
    sortValue: (row) => row.snapshot?.rsi_14 ?? null,
  },
  {
    key: "week_52_position",
    label: "52W Pos",
    render: (row) => fmt(row.snapshot?.week_52_position ?? null, 0, "%"),
    sortValue: (row) => row.snapshot?.week_52_position ?? null,
  },
  {
    key: "dividend_yield",
    label: "Div Yield",
    render: (row) => fmt(row.snapshot?.dividend_yield ?? null, 2, "%"),
    sortValue: (row) => row.snapshot?.dividend_yield ?? null,
  },
  {
    key: "days_to_earnings",
    label: "Days to Earn.",
    render: (row) => {
      const d = row.snapshot?.days_to_earnings;
      if (d == null) return "—";
      const color = d < 14 ? "text-error" : d < 30 ? "text-warning" : "text-[var(--text-primary)]";
      return <span className={color}>{d}</span>;
    },
    sortValue: (row) => row.snapshot?.days_to_earnings ?? null,
  },
  {
    key: "pe_ratio",
    label: "P/E",
    render: (row) => fmt(row.snapshot?.pe_ratio ?? null, 1),
    sortValue: (row) => row.snapshot?.pe_ratio ?? null,
  },
  {
    key: "wheel_score",
    label: "Wheel Score",
    render: (row) => <ScoreBadge score={row.snapshot?.wheel_score ?? null} size="sm" />,
    sortValue: (row) => row.snapshot?.wheel_score ?? null,
  },
];

interface ScreenerTableProps {
  rows: ScreenerRow[];
}

export function ScreenerTable({ rows }: ScreenerTableProps) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>("wheel_score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ScreenerFilterValues>({
    search: "",
    ivRankMin: "",
    ivRankMax: "",
    maxDaysToEarnings: "",
    minPutPremiumYield: "",
  });

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!row.ticker.toLowerCase().includes(q) && !row.company_name.toLowerCase().includes(q)) {
          return false;
        }
      }
      const ivRank = row.snapshot?.iv_rank;
      if (filters.ivRankMin && ivRank != null && ivRank < Number(filters.ivRankMin)) return false;
      if (filters.ivRankMax && ivRank != null && ivRank > Number(filters.ivRankMax)) return false;
      if (filters.maxDaysToEarnings) {
        const dte = row.snapshot?.days_to_earnings;
        if (dte != null && dte > Number(filters.maxDaysToEarnings)) return false;
      }
      if (filters.minPutPremiumYield) {
        const yield_ = row.snapshot?.put_premium_yield;
        if (yield_ == null || yield_ < Number(filters.minPutPremiumYield)) return false;
      }
      return true;
    });
  }, [rows, filters]);

  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return filtered;
    return [...filtered].sort((a, b) => {
      const av = col.sortValue(a);
      const bv = col.sortValue(b);
      if (av === null && bv === null) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      const an = av as number;
      const bn = bv as number;
      return sortDir === "asc" ? an - bn : bn - an;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / ROWS_PER_PAGE);
  const pageRows = sorted.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(1);
  }

  function handleFiltersChange(newFilters: ScreenerFilterValues) {
    setFilters(newFilters);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-4">
      <ScreenerFilters filters={filters} onChange={handleFiltersChange} />

      <div className="overflow-x-auto rounded-md border border-[var(--border-color)]">
        <table className="w-full min-w-[1400px] border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-color)] bg-surface">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="table-header text-left py-3 px-4 whitespace-nowrap"
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (
                      <span className="text-accent">{sortDir === "asc" ? "↑" : "↓"}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-[var(--text-muted)] text-sm">
                  No stocks match the current filters.
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr
                  key={row.ticker}
                  onClick={() => router.push(`/stock/${row.ticker}`)}
                  className="table-row"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="table-cell whitespace-nowrap">
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--text-muted)]">
            {sorted.length} results — page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
