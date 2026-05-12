export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      stocks: {
        Row: {
          id: string;
          ticker: string;
          company_name: string;
          sector: string | null;
          market_cap_tier: "large" | "mid" | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["stocks"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["stocks"]["Insert"]>;
      };
      stock_snapshots: {
        Row: {
          id: string;
          ticker: string;
          snapshot_date: string;
          // Price & market data
          price: number | null;
          price_change: number | null;
          price_change_pct: number | null;
          market_cap: number | null;
          volume: number | null;
          // Volatility
          iv_rank: number | null;
          iv_percentile: number | null;
          iv_30d: number | null;
          hv_30d: number | null;
          // Options metrics
          put_premium_yield: number | null;
          atm_put_delta: number | null;
          bid_ask_spread: number | null;
          open_interest_puts: number | null;
          // Stock fundamentals
          beta: number | null;
          rsi_14: number | null;
          week_52_position: number | null;
          dividend_yield: number | null;
          ex_dividend_date: string | null;
          days_to_earnings: number | null;
          pe_ratio: number | null;
          // Wheel score
          wheel_score: number | null;
          iv_rank_score: number | null;
          premium_quality_score: number | null;
          liquidity_score: number | null;
          trend_safety_score: number | null;
          earnings_distance_score: number | null;
          ai_summary: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["stock_snapshots"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["stock_snapshots"]["Insert"]>;
      };
      top_ten: {
        Row: {
          id: string;
          snapshot_date: string;
          rank: number;
          ticker: string;
          wheel_score: number;
          ai_summary: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["top_ten"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["top_ten"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      market_cap_tier: "large" | "mid";
    };
  };
}

// Convenience types
export type Stock = Database["public"]["Tables"]["stocks"]["Row"];
export type StockSnapshot = Database["public"]["Tables"]["stock_snapshots"]["Row"];
export type TopTen = Database["public"]["Tables"]["top_ten"]["Row"];

export type StockWithSnapshot = Stock & {
  latest_snapshot?: StockSnapshot | null;
};
