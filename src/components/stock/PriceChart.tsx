"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { format } from "date-fns";

interface PriceChartProps {
  data: { t: number; c: number }[];
}

interface TooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-[var(--border-color)] rounded-sm px-3 py-2 shadow-card text-sm">
      <p className="text-[var(--text-muted)] text-xs">{label}</p>
      <p className="font-semibold text-[var(--text-primary)]">
        ${payload[0].value.toFixed(2)}
      </p>
    </div>
  );
}

export function PriceChart({ data }: PriceChartProps) {
  if (!data.length) {
    return (
      <div className="h-52 flex items-center justify-center text-sm text-[var(--text-muted)]">
        No price data available.
      </div>
    );
  }

  const formatted = data.map((d) => ({
    date: format(new Date(d.t), "MMM d"),
    price: d.c,
  }));

  const prices = data.map((d) => d.c);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const isPositive = prices[prices.length - 1] >= prices[0];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={formatted} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={isPositive ? "#16A34A" : "#DC2626"} stopOpacity={0.15} />
            <stop offset="95%" stopColor={isPositive ? "#16A34A" : "#DC2626"} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "var(--text-muted)" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--text-muted)" }}
          tickLine={false}
          axisLine={false}
          domain={[min * 0.97, max * 1.03]}
          tickFormatter={(v) => `$${v.toFixed(0)}`}
          width={50}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="price"
          stroke={isPositive ? "#16A34A" : "#DC2626"}
          strokeWidth={1.5}
          fill="url(#priceGradient)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
