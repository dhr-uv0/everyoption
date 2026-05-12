import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getStockSnapshot, getOptionsChain } from "@/lib/polygon";
import { computeWheelScore } from "@/lib/wheel-score";
import { generateWheelSummary } from "@/lib/anthropic";
import { format, addDays } from "date-fns";

export const maxDuration = 300;

interface StockRow {
  ticker: string;
  company_name: string;
}

interface SnapshotRow {
  ticker: string;
  wheel_score: number | null;
  iv_rank: number | null;
  put_premium_yield: number | null;
  days_to_earnings: number | null;
  rsi_14: number | null;
  price: number | null;
  stocks: { company_name: string } | null;
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceClient();
  const today = format(new Date(), "yyyy-MM-dd");
  const thirtyDaysOut = format(addDays(new Date(), 30), "yyyy-MM-dd");
  const fortyFiveDaysOut = format(addDays(new Date(), 45), "yyyy-MM-dd");

  console.log(`[cron] Starting data refresh for ${today}`);

  const { data: stocksRaw, error: stocksError } = await supabase
    .from("stocks")
    .select("ticker, company_name");

  if (stocksError || !stocksRaw?.length) {
    return NextResponse.json({ error: "No stocks found", detail: stocksError }, { status: 500 });
  }

  const stocks = stocksRaw as unknown as StockRow[];
  console.log(`[cron] Processing ${stocks.length} stocks`);

  const results: { ticker: string; success: boolean; error?: string }[] = [];

  const BATCH_SIZE = 5;
  for (let i = 0; i < stocks.length; i += BATCH_SIZE) {
    const batch = stocks.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (stock) => {
        try {
          const [snapshot, optionsChain] = await Promise.all([
            getStockSnapshot(stock.ticker),
            getOptionsChain(stock.ticker, thirtyDaysOut, fortyFiveDaysOut),
          ]);

          if (!snapshot) {
            results.push({ ticker: stock.ticker, success: false, error: "No snapshot data" });
            return;
          }

          const price = snapshot.day?.c ?? snapshot.lastTrade?.p ?? null;
          const prevPrice = snapshot.prevDay?.c ?? null;
          const priceChange = price !== null && prevPrice !== null ? price - prevPrice : null;
          const priceChangePct =
            priceChange !== null && prevPrice !== null && prevPrice !== 0
              ? (priceChange / prevPrice) * 100
              : null;

          const atmPuts = optionsChain
            .filter((o) => o.details.contract_type === "put")
            .sort(
              (a, b) =>
                Math.abs(a.details.strike_price - (price ?? 0)) -
                Math.abs(b.details.strike_price - (price ?? 0))
            );

          const atmPut = atmPuts[0] ?? null;

          let putPremiumYield: number | null = null;
          if (atmPut && price) {
            const mid =
              ((atmPut.last_quote?.bid ?? 0) + (atmPut.last_quote?.ask ?? 0)) / 2;
            const expiryDate = new Date(atmPut.details.expiration_date);
            const dte = Math.max(1, Math.round((expiryDate.getTime() - Date.now()) / 86400000));
            putPremiumYield = mid > 0 && price > 0 ? (mid / price) * (365 / dte) * 100 : null;
          }

          const bidAskSpread =
            atmPut?.last_quote
              ? atmPut.last_quote.ask - atmPut.last_quote.bid
              : null;

          const openInterestPuts = optionsChain
            .filter((o) => o.details.contract_type === "put")
            .reduce((sum, o) => sum + (o.open_interest ?? 0), 0);

          const currentIV = atmPut?.implied_volatility
            ? atmPut.implied_volatility * 100
            : null;

          const scoreResult = computeWheelScore({
            iv_rank: currentIV,
            put_premium_yield: putPremiumYield,
            bid_ask_spread: bidAskSpread,
            open_interest_puts: openInterestPuts || null,
            rsi_14: null,
            days_to_earnings: null,
          });

          const { error: upsertError } = await supabase.from("stock_snapshots").upsert(
            {
              ticker: stock.ticker,
              snapshot_date: today,
              price,
              price_change: priceChange,
              price_change_pct: priceChangePct,
              market_cap: null,
              volume: snapshot.day?.v ?? null,
              iv_rank: currentIV,
              iv_percentile: null,
              iv_30d: currentIV,
              hv_30d: null,
              put_premium_yield: putPremiumYield,
              atm_put_delta: atmPut?.greeks?.delta ?? null,
              bid_ask_spread: bidAskSpread,
              open_interest_puts: openInterestPuts || null,
              beta: null,
              rsi_14: null,
              week_52_position: null,
              dividend_yield: null,
              ex_dividend_date: null,
              days_to_earnings: null,
              pe_ratio: null,
              wheel_score: scoreResult.wheel_score,
              iv_rank_score: scoreResult.iv_rank_score,
              premium_quality_score: scoreResult.premium_quality_score,
              liquidity_score: scoreResult.liquidity_score,
              trend_safety_score: scoreResult.trend_safety_score,
              earnings_distance_score: scoreResult.earnings_distance_score,
              ai_summary: null,
            },
            { onConflict: "ticker,snapshot_date" }
          );

          if (upsertError) {
            results.push({ ticker: stock.ticker, success: false, error: upsertError.message });
          } else {
            results.push({ ticker: stock.ticker, success: true });
          }
        } catch (err) {
          results.push({
            ticker: stock.ticker,
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
          });
        }
      })
    );

    if (i + BATCH_SIZE < stocks.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  const successCount = results.filter((r) => r.success).length;
  console.log(`[cron] Processed ${successCount}/${stocks.length} stocks`);

  // Compute Top 10
  const { data: topRaw } = await supabase
    .from("stock_snapshots")
    .select("ticker, wheel_score, iv_rank, put_premium_yield, rsi_14, price, days_to_earnings, stocks(company_name)")
    .eq("snapshot_date", today)
    .not("wheel_score", "is", null)
    .order("wheel_score", { ascending: false })
    .limit(10);

  const topSnapshots = topRaw as unknown as SnapshotRow[] | null;

  if (topSnapshots?.length) {
    console.log(`[cron] Generating AI summaries for top ${topSnapshots.length} stocks`);

    const topTenRecords = await Promise.all(
      topSnapshots.map(async (s, idx) => {
        let aiSummary: string | null = null;
        try {
          const companyName = s.stocks?.company_name ?? s.ticker;
          aiSummary = await generateWheelSummary(s.ticker, companyName, {
            ivRank: s.iv_rank,
            putPremiumYield: s.put_premium_yield,
            daysToEarnings: s.days_to_earnings,
            wheelScore: s.wheel_score,
            rsi: s.rsi_14,
            price: s.price,
          });
        } catch (err) {
          console.error(`[cron] AI summary failed for ${s.ticker}:`, err);
        }

        if (aiSummary) {
          await supabase
            .from("stock_snapshots")
            .update({ ai_summary: aiSummary })
            .eq("ticker", s.ticker)
            .eq("snapshot_date", today);
        }

        return {
          snapshot_date: today,
          rank: idx + 1,
          ticker: s.ticker,
          wheel_score: s.wheel_score ?? 0,
          ai_summary: aiSummary,
        };
      })
    );

    await supabase.from("top_ten").delete().eq("snapshot_date", today);
    await supabase.from("top_ten").insert(topTenRecords);

    console.log(`[cron] Top 10 saved for ${today}`);
  }

  return NextResponse.json({
    success: true,
    date: today,
    processed: successCount,
    total: stocks.length,
    failed: results.filter((r) => !r.success).map((r) => r.ticker),
  });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
