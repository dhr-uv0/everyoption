-- EveryOption Initial Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- STOCKS - master ticker list
-- ============================================================
CREATE TABLE IF NOT EXISTS public.stocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticker TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  sector TEXT,
  market_cap_tier TEXT CHECK (market_cap_tier IN ('large', 'mid')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stocks_ticker ON public.stocks(ticker);
CREATE INDEX idx_stocks_sector ON public.stocks(sector);

-- ============================================================
-- STOCK_SNAPSHOTS - daily per-ticker metrics
-- ============================================================
CREATE TABLE IF NOT EXISTS public.stock_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticker TEXT NOT NULL REFERENCES public.stocks(ticker) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,

  -- Price & market data
  price NUMERIC(12, 4),
  price_change NUMERIC(12, 4),
  price_change_pct NUMERIC(8, 4),
  market_cap BIGINT,
  volume BIGINT,

  -- Volatility
  iv_rank NUMERIC(6, 2),
  iv_percentile NUMERIC(6, 2),
  iv_30d NUMERIC(8, 4),
  hv_30d NUMERIC(8, 4),

  -- Options metrics
  put_premium_yield NUMERIC(8, 4),
  atm_put_delta NUMERIC(8, 4),
  bid_ask_spread NUMERIC(8, 4),
  open_interest_puts INTEGER,

  -- Stock fundamentals
  beta NUMERIC(6, 3),
  rsi_14 NUMERIC(6, 2),
  week_52_position NUMERIC(6, 2),
  dividend_yield NUMERIC(6, 4),
  ex_dividend_date DATE,
  days_to_earnings INTEGER,
  pe_ratio NUMERIC(10, 2),

  -- Wheel score and sub-scores
  wheel_score NUMERIC(6, 2),
  iv_rank_score NUMERIC(5, 4),
  premium_quality_score NUMERIC(5, 4),
  liquidity_score NUMERIC(5, 4),
  trend_safety_score NUMERIC(5, 4),
  earnings_distance_score NUMERIC(5, 4),

  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(ticker, snapshot_date)
);

CREATE INDEX idx_snapshots_ticker ON public.stock_snapshots(ticker);
CREATE INDEX idx_snapshots_date ON public.stock_snapshots(snapshot_date);
CREATE INDEX idx_snapshots_wheel_score ON public.stock_snapshots(wheel_score DESC);

-- ============================================================
-- TOP_TEN - daily top 10 wheel candidates
-- ============================================================
CREATE TABLE IF NOT EXISTS public.top_ten (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  snapshot_date DATE NOT NULL,
  rank INTEGER NOT NULL CHECK (rank BETWEEN 1 AND 10),
  ticker TEXT NOT NULL REFERENCES public.stocks(ticker) ON DELETE CASCADE,
  wheel_score NUMERIC(6, 2) NOT NULL,
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(snapshot_date, rank)
);

CREATE INDEX idx_top_ten_date ON public.top_ten(snapshot_date);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- stocks and snapshots are public read-only for authenticated users
ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.top_ten ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stocks_read_authenticated"
  ON public.stocks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "snapshots_read_authenticated"
  ON public.stock_snapshots FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "top_ten_read_authenticated"
  ON public.top_ten FOR SELECT
  TO authenticated
  USING (true);

-- Service role can write (used by cron job)
CREATE POLICY "stocks_write_service"
  ON public.stocks FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "snapshots_write_service"
  ON public.stock_snapshots FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "top_ten_write_service"
  ON public.top_ten FOR ALL
  TO service_role
  USING (true);
