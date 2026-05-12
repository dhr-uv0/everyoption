import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getStockAggregates, getOptionsChain } from "@/lib/polygon";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { StatCard } from "@/components/ui/StatCard";
import { PriceChart } from "@/components/stock/PriceChart";
import { WheelScoreBreakdown } from "@/components/stock/WheelScoreBreakdown";
import type { Stock, StockSnapshot } from "@/types/database";
import { format, subMonths, addDays } from "date-fns";

interface PageProps {
  params: Promise<{ ticker: string }>;
}

async function getStockData(ticker: string): Promise<{ stock: Stock; snapshot: StockSnapshot | null } | null> {
  const supabase = await createClient();

  const { data: stockData } = await supabase
    .from("stocks")
    .select("*")
    .eq("ticker", ticker)
    .single();

  if (!stockData) return null;
  const stock = stockData as unknown as Stock;

  const { data: snapshotData } = await supabase
    .from("stock_snapshots")
    .select("*")
    .eq("ticker", ticker)
    .order("snapshot_date", { ascending: false })
    .limit(1)
    .single();

  const snapshot = snapshotData ? (snapshotData as unknown as StockSnapshot) : null;

  return { stock, snapshot };
}

function fmt(val: number | null, decimals = 2, prefix = "", suffix = ""): string {
  if (val === null || val === undefined) return "—";
  return `${prefix}${val.toFixed(decimals)}${suffix}`;
}

function fmtMarketCap(val: number | null): string {
  if (!val) return "—";
  if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
  if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
  return `$${val.toLocaleString()}`;
}

export default async function StockDetailPage({ params }: PageProps) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();

  const stockData = await getStockData(upperTicker);
  if (!stockData) return notFound();

  const { stock, snapshot } = stockData;

  const sixMonthsAgo = format(subMonths(new Date(), 6), "yyyy-MM-dd");
  const today = format(new Date(), "yyyy-MM-dd");
  const thirtyDaysOut = format(addDays(new Date(), 30), "yyyy-MM-dd");
  const fortyFiveDaysOut = format(addDays(new Date(), 45), "yyyy-MM-dd");

  const [priceHistory, optionsChain] = await Promise.all([
    getStockAggregates(upperTicker, sixMonthsAgo, today),
    getOptionsChain(upperTicker, thirtyDaysOut, fortyFiveDaysOut),
  ]);

  const priceChange = snapshot?.price_change ?? 0;
  const priceChangePct = snapshot?.price_change_pct ?? 0;
  const isPositive = priceChange >= 0;

  const atmStrike = snapshot?.price ?? 0;
  const sortedOptions = [...optionsChain]
    .sort(
      (a, b) =>
        Math.abs(a.details.strike_price - atmStrike) -
        Math.abs(b.details.strike_price - atmStrike)
    )
    .slice(0, 20);

  return (
    <div className="flex flex-col gap-8 max-w-[1200px]">
      {/* Back nav */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors w-fit"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back to screener
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="screen-title">{upperTicker}</h1>
            <span
              className={`text-sm font-semibold px-2 py-0.5 rounded-sm ${
                isPositive
                  ? "text-success bg-green-50 dark:bg-green-900/20"
                  : "text-error bg-red-50 dark:bg-red-900/20"
              }`}
            >
              {isPositive ? "+" : ""}{fmt(priceChange, 2, "$")} ({isPositive ? "+" : ""}{fmt(priceChangePct, 2, "", "%")})
            </span>
          </div>
          <p className="text-[var(--text-secondary)] mt-1">{stock.company_name}</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {fmtMarketCap(snapshot?.market_cap ?? null)} market cap
            {stock.sector && ` · ${stock.sector}`}
          </p>
        </div>

        <div className="text-right">
          <div className="text-[28px] font-bold text-[var(--text-primary)]">
            {fmt(snapshot?.price ?? null, 2, "$")}
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Last updated: {snapshot?.snapshot_date ?? "—"}
          </p>
        </div>
      </div>

      {/* Wheel Score Card */}
      {snapshot && (
        <div className="card flex flex-col sm:flex-row gap-6 items-start">
          <div className="flex flex-col items-center gap-2 shrink-0">
            <ScoreBadge score={snapshot.wheel_score} size="lg" />
            <span className="label">Wheel Score</span>
          </div>
          <div className="flex-1">
            {snapshot.ai_summary ? (
              <p className="text-[15px] text-[var(--text-primary)] leading-6">
                {snapshot.ai_summary}
              </p>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">
                AI summary will be available after the next data refresh.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Key Metrics Grid */}
      {snapshot && (
        <section>
          <h2 className="section-title mb-4">Key Metrics</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <StatCard label="Price" value={fmt(snapshot.price, 2, "$")} />
            <StatCard label="Market Cap" value={fmtMarketCap(snapshot.market_cap)} />
            <StatCard label="IV Rank" value={fmt(snapshot.iv_rank, 0)} />
            <StatCard label="IV Percentile" value={fmt(snapshot.iv_percentile, 0)} />
            <StatCard label="30D IV" value={fmt(snapshot.iv_30d, 1, "", "%")} />
            <StatCard label="HV 30D" value={fmt(snapshot.hv_30d, 1, "", "%")} />
            <StatCard
              label="Put Premium Yield"
              value={fmt(snapshot.put_premium_yield, 2, "", "%")}
              highlight={
                snapshot.put_premium_yield !== null && snapshot.put_premium_yield >= 1.5
                  ? "positive"
                  : undefined
              }
            />
            <StatCard label="ATM Put Delta" value={fmt(snapshot.atm_put_delta, 2)} />
            <StatCard label="Bid-Ask Spread" value={fmt(snapshot.bid_ask_spread, 2, "$")} />
            <StatCard label="OI (Puts)" value={snapshot.open_interest_puts?.toLocaleString() ?? "—"} />
            <StatCard label="Beta" value={fmt(snapshot.beta, 2)} />
            <StatCard
              label="RSI (14)"
              value={fmt(snapshot.rsi_14, 1)}
              highlight={
                snapshot.rsi_14 !== null
                  ? snapshot.rsi_14 > 70
                    ? "negative"
                    : snapshot.rsi_14 < 30
                    ? "positive"
                    : "neutral"
                  : undefined
              }
            />
            <StatCard label="52W Position" value={fmt(snapshot.week_52_position, 0, "", "%")} />
            <StatCard label="Dividend Yield" value={fmt(snapshot.dividend_yield, 2, "", "%")} />
            <StatCard label="Ex-Div Date" value={snapshot.ex_dividend_date ?? "—"} />
            <StatCard
              label="Days to Earnings"
              value={snapshot.days_to_earnings ?? "—"}
              highlight={
                snapshot.days_to_earnings !== null
                  ? snapshot.days_to_earnings < 14
                    ? "negative"
                    : snapshot.days_to_earnings > 30
                    ? "positive"
                    : "neutral"
                  : undefined
              }
            />
            <StatCard label="P/E Ratio" value={fmt(snapshot.pe_ratio, 1)} />
          </div>
        </section>
      )}

      {/* Price Chart */}
      <section>
        <h2 className="section-title mb-4">6-Month Price Chart</h2>
        <div className="card">
          <PriceChart data={priceHistory.map((d) => ({ t: d.t, c: d.c }))} />
        </div>
      </section>

      {/* Options Chain */}
      <section>
        <h2 className="section-title mb-1">Options Chain</h2>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          ATM puts and calls — nearest 30–45 DTE expiration
        </p>
        {sortedOptions.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">
            Options data unavailable. Check your Polygon API key and tier.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-[var(--border-color)]">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-surface border-b border-[var(--border-color)]">
                  {["Strike", "Type", "Expiry", "Bid", "Ask", "Mid", "IV", "Delta", "Theta", "OI", "Volume"].map((h) => (
                    <th key={h} className="table-header text-left py-3 px-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedOptions.map((opt, i) => {
                  const isPut = opt.details.contract_type === "put";
                  const mid = ((opt.last_quote?.bid ?? 0) + (opt.last_quote?.ask ?? 0)) / 2;
                  return (
                    <tr key={i} className="table-row">
                      <td className="table-cell font-semibold">${opt.details.strike_price}</td>
                      <td className="table-cell">
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-sm ${
                          isPut ? "bg-red-50 text-error dark:bg-red-900/20" : "bg-green-50 text-success dark:bg-green-900/20"
                        }`}>
                          {isPut ? "Put" : "Call"}
                        </span>
                      </td>
                      <td className="table-cell text-[var(--text-secondary)]">{opt.details.expiration_date}</td>
                      <td className="table-cell">${(opt.last_quote?.bid ?? 0).toFixed(2)}</td>
                      <td className="table-cell">${(opt.last_quote?.ask ?? 0).toFixed(2)}</td>
                      <td className="table-cell">${mid.toFixed(2)}</td>
                      <td className="table-cell">{opt.implied_volatility ? (opt.implied_volatility * 100).toFixed(1) + "%" : "—"}</td>
                      <td className="table-cell">{opt.greeks?.delta?.toFixed(3) ?? "—"}</td>
                      <td className="table-cell">{opt.greeks?.theta?.toFixed(3) ?? "—"}</td>
                      <td className="table-cell">{opt.open_interest?.toLocaleString() ?? "—"}</td>
                      <td className="table-cell">{opt.day?.volume?.toLocaleString() ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Wheel Score Breakdown */}
      {snapshot && (
        <section>
          <h2 className="section-title mb-4">Wheel Score Breakdown</h2>
          <div className="card">
            <WheelScoreBreakdown snapshot={snapshot} />
          </div>
        </section>
      )}
    </div>
  );
}
