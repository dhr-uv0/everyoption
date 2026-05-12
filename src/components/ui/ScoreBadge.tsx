import { getScoreColor } from "@/lib/wheel-score";

interface ScoreBadgeProps {
  score: number | null;
  size?: "sm" | "md" | "lg";
}

export function ScoreBadge({ score, size = "md" }: ScoreBadgeProps) {
  if (score === null) {
    return (
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold bg-surface text-[var(--text-muted)] border border-[var(--border-color)]">
        —
      </span>
    );
  }

  const colorClass = getScoreColor(score);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-xl",
  };

  return (
    <span className={`score-badge ${colorClass} ${sizeClasses[size]}`}>
      {Math.round(score)}
    </span>
  );
}
