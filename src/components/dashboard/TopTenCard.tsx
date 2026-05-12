import Link from "next/link";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import type { TopTen } from "@/types/database";

interface TopTenCardProps {
  entry: TopTen & { company_name?: string };
}

export function TopTenCard({ entry }: TopTenCardProps) {
  return (
    <Link href={`/stock/${entry.ticker}`} className="block">
      <div className="card flex flex-col gap-3 h-full min-w-[200px] hover:border-accent/40 transition-all duration-200">
        {/* Rank + badge */}
        <div className="flex items-start justify-between">
          <span className="label text-[var(--text-muted)]">#{entry.rank}</span>
          <ScoreBadge score={entry.wheel_score} size="sm" />
        </div>

        {/* Ticker + company */}
        <div>
          <p className="text-[15px] font-bold text-[var(--text-primary)] tracking-tight">
            {entry.ticker}
          </p>
          {entry.company_name && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-1">
              {entry.company_name}
            </p>
          )}
        </div>

        {/* AI summary */}
        {entry.ai_summary && (
          <p className="text-xs text-[var(--text-secondary)] leading-5 line-clamp-3">
            {entry.ai_summary}
          </p>
        )}

        {/* Score label */}
        <div className="mt-auto pt-2 border-t border-[var(--border-color)]">
          <span className="text-xs text-[var(--text-muted)]">
            Wheel score:{" "}
            <span className="font-semibold text-[var(--text-primary)]">
              {Math.round(entry.wheel_score)}/100
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
