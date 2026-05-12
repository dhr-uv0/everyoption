export interface WheelScoreInputs {
  iv_rank: number | null;
  put_premium_yield: number | null;
  bid_ask_spread: number | null;
  open_interest_puts: number | null;
  rsi_14: number | null;
  days_to_earnings: number | null;
}

export interface WheelScoreResult {
  wheel_score: number;
  iv_rank_score: number;
  premium_quality_score: number;
  liquidity_score: number;
  trend_safety_score: number;
  earnings_distance_score: number;
}

function clamp(val: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, val));
}

function normalizePutPremiumYield(yield_pct: number | null): number {
  if (yield_pct === null) return 0;
  // 0% -> 0, 3% -> 1.0 (cap at 3% annualized)
  return clamp(yield_pct / 3);
}

function normalizeLiquidity(
  bidAskSpread: number | null,
  openInterest: number | null
): number {
  // bid-ask spread: lower is better. 0 spread = 1.0, $2 spread = 0
  const spreadScore =
    bidAskSpread !== null ? clamp(1 - bidAskSpread / 2) : 0;

  // open interest: higher is better. 1000 OI = 0.5, 5000+ = 1.0
  const oiScore =
    openInterest !== null ? clamp(openInterest / 5000) : 0;

  return (spreadScore + oiScore) / 2;
}

function normalizeTrendSafety(rsi: number | null): number {
  if (rsi === null) return 0.5;
  if (rsi >= 40 && rsi <= 60) return 1.0;
  if ((rsi >= 30 && rsi < 40) || (rsi > 60 && rsi <= 70)) return 0.6;
  return 0.2; // RSI < 30 or > 70
}

function normalizeEarningsDistance(daysToEarnings: number | null): number {
  if (daysToEarnings === null) return 1.0; // unknown = no penalty
  if (daysToEarnings > 45) return 1.0;
  if (daysToEarnings >= 30) return 0.7;
  if (daysToEarnings >= 14) return 0.3;
  return 0.0;
}

export function computeWheelScore(inputs: WheelScoreInputs): WheelScoreResult {
  const ivRankNorm = inputs.iv_rank !== null ? clamp(inputs.iv_rank / 100) : 0;
  const premiumNorm = normalizePutPremiumYield(inputs.put_premium_yield);
  const liquidityNorm = normalizeLiquidity(inputs.bid_ask_spread, inputs.open_interest_puts);
  const trendNorm = normalizeTrendSafety(inputs.rsi_14);
  const earningsNorm = normalizeEarningsDistance(inputs.days_to_earnings);

  const wheel_score =
    (ivRankNorm * 0.3 +
      premiumNorm * 0.25 +
      liquidityNorm * 0.15 +
      trendNorm * 0.2 +
      earningsNorm * 0.1) *
    100;

  return {
    wheel_score: Math.round(wheel_score * 10) / 10,
    iv_rank_score: ivRankNorm,
    premium_quality_score: premiumNorm,
    liquidity_score: liquidityNorm,
    trend_safety_score: trendNorm,
    earnings_distance_score: earningsNorm,
  };
}

export function getScoreColor(score: number): string {
  if (score >= 65) return "score-badge-high";
  if (score >= 40) return "score-badge-mid";
  return "score-badge-low";
}

export function getScoreLabel(score: number): string {
  if (score >= 65) return "Strong";
  if (score >= 40) return "Moderate";
  return "Weak";
}
