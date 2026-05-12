interface StatCardProps {
  label: string;
  value: string | number | null;
  subvalue?: string;
  highlight?: "positive" | "negative" | "neutral";
}

export function StatCard({ label, value, subvalue, highlight }: StatCardProps) {
  const valueColor =
    highlight === "positive"
      ? "text-success"
      : highlight === "negative"
      ? "text-error"
      : "text-[var(--text-primary)]";

  return (
    <div className="card flex flex-col gap-1">
      <span className="label">{label}</span>
      <span className={`text-[15px] font-semibold ${valueColor}`}>
        {value ?? "—"}
      </span>
      {subvalue && (
        <span className="text-xs text-[var(--text-muted)]">{subvalue}</span>
      )}
    </div>
  );
}
