import type { StockSnapshot } from "@/types/database";

interface WheelScoreBreakdownProps {
  snapshot: StockSnapshot;
}

interface SubScore {
  label: string;
  score: number | null;
  weight: number;
  description: string;
}

function ScoreBar({ score }: { score: number | null }) {
  const pct = score !== null ? Math.round(score * 100) : 0;
  const color = pct >= 65 ? "#16A34A" : pct >= 40 ? "#D97706" : "#DC2626";

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden border border-[var(--border-color)]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-semibold text-[var(--text-primary)] w-8 text-right">
        {pct}
      </span>
    </div>
  );
}

export function WheelScoreBreakdown({ snapshot }: WheelScoreBreakdownProps) {
  const subScores: SubScore[] = [
    {
      label: "IV Environment",
      score: snapshot.iv_rank_score,
      weight: 30,
      description: "IV rank relative to 52-week range",
    },
    {
      label: "Premium Quality",
      score: snapshot.premium_quality_score,
      weight: 25,
      description: "Put premium yield normalized to 3% annualized",
    },
    {
      label: "Liquidity",
      score: snapshot.liquidity_score,
      weight: 15,
      description: "Bid-ask spread tightness + open interest",
    },
    {
      label: "Trend Safety",
      score: snapshot.trend_safety_score,
      weight: 20,
      description: "RSI 40–60 scores highest; extremes penalized",
    },
    {
      label: "Earnings Distance",
      score: snapshot.earnings_distance_score,
      weight: 10,
      description: ">45 days = full score; <14 days = zero",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {subScores.map((sub) => (
        <div key={sub.label} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-sm font-semibold text-[var(--text-primary)]">{sub.label}</span>
              <span className="text-xs text-[var(--text-muted)] ml-2">{sub.weight}% weight</span>
            </div>
            <span className="text-xs text-[var(--text-muted)]">{sub.description}</span>
          </div>
          <ScoreBar score={sub.score} />
        </div>
      ))}
    </div>
  );
}
