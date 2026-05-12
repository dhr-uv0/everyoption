const BASE_URL = "https://api.polygon.io";

async function polygonFetch<T>(path: string): Promise<T> {
  const url = `${BASE_URL}${path}${path.includes("?") ? "&" : "?"}apiKey=${process.env.POLYGON_API_KEY}`;
  const res = await fetch(url, { next: { revalidate: 0 } });

  if (!res.ok) {
    throw new Error(`Polygon API error ${res.status}: ${path}`);
  }

  return res.json() as Promise<T>;
}

export interface PolygonSnapshot {
  ticker: string;
  day: {
    c: number; // close
    h: number; // high
    l: number; // low
    o: number; // open
    v: number; // volume
    vw: number; // VWAP
  };
  prevDay: {
    c: number;
    h: number;
    l: number;
    o: number;
    v: number;
    vw: number;
  };
  min?: {
    c: number;
    h: number;
    l: number;
    o: number;
  };
  todaysChangePerc: number;
  todaysChange: number;
  lastQuote: {
    P: number; // ask
    S: number; // ask size
    p: number; // bid
    s: number; // bid size
  };
  lastTrade: {
    p: number; // price
    s: number; // size
  };
}

export interface PolygonTickerDetails {
  ticker: string;
  name: string;
  market_cap: number;
  share_class_shares_outstanding: number;
  description: string;
  sic_description: string;
  homepage_url: string;
  primary_exchange: string;
}

export interface PolygonOptionsSnapshot {
  break_even_price: number;
  day: {
    close: number;
    high: number;
    low: number;
    open: number;
    volume: number;
    vwap: number;
  };
  details: {
    contract_type: "call" | "put";
    exercise_style: string;
    expiration_date: string;
    shares_per_contract: number;
    strike_price: number;
    ticker: string;
  };
  greeks: {
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
  };
  implied_volatility: number;
  open_interest: number;
  underlying_asset: {
    price: number;
    ticker: string;
  };
  last_quote: {
    ask: number;
    ask_size: number;
    bid: number;
    bid_size: number;
    last_updated: number;
    midpoint: number;
  };
}

export async function getStockSnapshot(ticker: string): Promise<PolygonSnapshot | null> {
  try {
    const data = await polygonFetch<{ ticker: PolygonSnapshot; status: string }>(
      `/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}`
    );
    return data.ticker;
  } catch {
    return null;
  }
}

export async function getStockDetails(ticker: string): Promise<PolygonTickerDetails | null> {
  try {
    const data = await polygonFetch<{ results: PolygonTickerDetails; status: string }>(
      `/v3/reference/tickers/${ticker}`
    );
    return data.results;
  } catch {
    return null;
  }
}

export async function getOptionsChain(
  ticker: string,
  expirationDateGte: string,
  expirationDateLte: string
): Promise<PolygonOptionsSnapshot[]> {
  try {
    const data = await polygonFetch<{ results: PolygonOptionsSnapshot[]; status: string }>(
      `/v3/snapshot/options/${ticker}?expiration_date.gte=${expirationDateGte}&expiration_date.lte=${expirationDateLte}&limit=250`
    );
    return data.results ?? [];
  } catch {
    return [];
  }
}

export async function getStockAggregates(
  ticker: string,
  from: string,
  to: string
): Promise<{ t: number; o: number; h: number; l: number; c: number; v: number }[]> {
  try {
    const data = await polygonFetch<{
      results: { t: number; o: number; h: number; l: number; c: number; v: number }[];
      status: string;
    }>(`/v2/aggs/ticker/${ticker}/range/1/day/${from}/${to}?adjusted=true&sort=asc&limit=252`);
    return data.results ?? [];
  } catch {
    return [];
  }
}
