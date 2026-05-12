import { createClient } from "@/lib/supabase/server";
import { TopTenCard } from "@/components/dashboard/TopTenCard";
import { ScreenerTable, type ScreenerRow } from "@/components/dashboard/ScreenerTable";
import { EmptyState } from "@/components/ui/EmptyState";
import type { TopTen, Stock, StockSnapshot } from "@/types/database";
import { format } from "date-fns";

export const revalidate = 300;

type TopTenWithCompany = TopTen & { company_name?: string };

async function getTopTen(): Promise<TopTenWithCompany[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data } = await supabase
    .from("top_ten")
    .select("*, stocks(company_name)")
    .eq("snapshot_date", today)
    .order("rank", { ascending: true })
    .limit(10);

  if (!data || data.length === 0) {
    const { data: latest } = await supabase
      .from("top_ten")
      .select("snapshot_date")
      .order("snapshot_date", { ascending: false })
      .limit(1)
      .single();

    if (!latest) return [];

    const latestDate = (latest as { snapshot_date: string }).snapshot_date;

    const { data: fallback } = await supabase
      .from("top_ten")
      .select("*, stocks(company_name)")
      .eq("snapshot_date", latestDate)
      .order("rank", { ascending: true })
      .limit(10);

    if (!fallback) return [];

    return (fallback as unknown[]).map((item) => {
      const row = item as Record<string, unknown>;
      const stocks = row.stocks as { company_name: string } | null;
      return {
        id: row.id as string,
        snapshot_date: row.snapshot_date as string,
        rank: row.rank as number,
        ticker: row.ticker as string,
        wheel_score: row.wheel_score as number,
        ai_summary: row.ai_summary as string | null,
        created_at: row.created_at as string,
        company_name: stocks?.company_name,
      };
    });
  }

  return (data as unknown[]).map((item) => {
    const row = item as Record<string, unknown>;
    const stocks = row.stocks as { company_name: string } | null;
    return {
      id: row.id as string,
      snapshot_date: row.snapshot_date as string,
      rank: row.rank as number,
      ticker: row.ticker as string,
      wheel_score: row.wheel_score as number,
      ai_summary: row.ai_summary as string | null,
      created_at: row.created_at as string,
      company_name: stocks?.company_name,
    };
  });
}

async function getScreenerRows(): Promise<ScreenerRow[]> {
  const supabase = await createClient();

  const { data: latestDate } = await supabase
    .from("stock_snapshots")
    .select("snapshot_date")
    .order("snapshot_date", { ascending: false })
    .limit(1)
    .single();

  if (!latestDate) return [];

  const { snapshot_date } = latestDate as { snapshot_date: string };

  const { data: snapshots } = await supabase
    .from("stock_snapshots")
    .select("*, stocks(*)")
    .eq("snapshot_date", snapshot_date)
    .order("wheel_score", { ascending: false });

  if (!snapshots) return [];

  return (snapshots as unknown[]).map((item) => {
    const row = item as Record<string, unknown>;
    const stock = row.stocks as Stock;
    const snapshot = { ...row } as StockSnapshot;
    return {
      ...stock,
      snapshot,
    };
  });
}

export default async function DashboardPage() {
  const [topTen, screenerRows] = await Promise.all([getTopTen(), getScreenerRows()]);

  const todayFormatted = format(new Date(), "MMMM d, yyyy");
  const hasData = screenerRows.length > 0;

  return (
    <div className="flex flex-col gap-10">
      {/* Top 10 Section */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="section-title">Top 10 to Wheel</h2>
          <span className="text-xs text-[var(--text-muted)]">{todayFormatted}</span>
        </div>

        {topTen.length === 0 ? (
          <EmptyState
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            }
            title="No data yet"
            subtitle="Top 10 rankings are generated daily after market close at 5:00 PM ET."
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3">
            {topTen.map((entry) => (
              <TopTenCard key={entry.ticker} entry={entry} />
            ))}
          </div>
        )}
      </section>

      {/* Full Screener Section */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h2 className="section-title">Screener</h2>
            {hasData && (
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {screenerRows.length} stocks tracked — sorted by wheel score
              </p>
            )}
          </div>
        </div>

        {!hasData ? (
          <EmptyState
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="9" y1="21" x2="9" y2="9"/>
              </svg>
            }
            title="Screener data loading"
            subtitle="Data populates after the first cron job run. Seed your stocks table and trigger /api/cron/refresh-data to populate."
          />
        ) : (
          <ScreenerTable rows={screenerRows} />
        )}
      </section>
    </div>
  );
}
