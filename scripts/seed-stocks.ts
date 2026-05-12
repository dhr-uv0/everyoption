/**
 * Seed script for the stocks table.
 * Run with: npx ts-node -r tsconfig-paths/register scripts/seed-stocks.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface StockEntry {
  ticker: string;
  company_name: string;
  sector: string;
  market_cap_tier: "large" | "mid";
}

// S&P 500 large-cap stocks (representative sample — expand as needed)
const SP500_STOCKS: StockEntry[] = [
  // Technology
  { ticker: "AAPL", company_name: "Apple Inc.", sector: "Technology", market_cap_tier: "large" },
  { ticker: "MSFT", company_name: "Microsoft Corporation", sector: "Technology", market_cap_tier: "large" },
  { ticker: "NVDA", company_name: "NVIDIA Corporation", sector: "Technology", market_cap_tier: "large" },
  { ticker: "GOOGL", company_name: "Alphabet Inc.", sector: "Technology", market_cap_tier: "large" },
  { ticker: "META", company_name: "Meta Platforms Inc.", sector: "Technology", market_cap_tier: "large" },
  { ticker: "AVGO", company_name: "Broadcom Inc.", sector: "Technology", market_cap_tier: "large" },
  { ticker: "ORCL", company_name: "Oracle Corporation", sector: "Technology", market_cap_tier: "large" },
  { ticker: "CRM", company_name: "Salesforce Inc.", sector: "Technology", market_cap_tier: "large" },
  { ticker: "AMD", company_name: "Advanced Micro Devices Inc.", sector: "Technology", market_cap_tier: "large" },
  { ticker: "INTC", company_name: "Intel Corporation", sector: "Technology", market_cap_tier: "large" },
  { ticker: "QCOM", company_name: "QUALCOMM Incorporated", sector: "Technology", market_cap_tier: "large" },
  { ticker: "TXN", company_name: "Texas Instruments Incorporated", sector: "Technology", market_cap_tier: "large" },
  { ticker: "AMAT", company_name: "Applied Materials Inc.", sector: "Technology", market_cap_tier: "large" },
  { ticker: "MU", company_name: "Micron Technology Inc.", sector: "Technology", market_cap_tier: "large" },
  { ticker: "LRCX", company_name: "Lam Research Corporation", sector: "Technology", market_cap_tier: "large" },
  { ticker: "KLAC", company_name: "KLA Corporation", sector: "Technology", market_cap_tier: "large" },
  { ticker: "ADI", company_name: "Analog Devices Inc.", sector: "Technology", market_cap_tier: "large" },
  { ticker: "MRVL", company_name: "Marvell Technology Inc.", sector: "Technology", market_cap_tier: "large" },
  { ticker: "NOW", company_name: "ServiceNow Inc.", sector: "Technology", market_cap_tier: "large" },
  { ticker: "PANW", company_name: "Palo Alto Networks Inc.", sector: "Technology", market_cap_tier: "large" },
  { ticker: "SNOW", company_name: "Snowflake Inc.", sector: "Technology", market_cap_tier: "large" },
  { ticker: "ADBE", company_name: "Adobe Inc.", sector: "Technology", market_cap_tier: "large" },
  { ticker: "IBM", company_name: "International Business Machines", sector: "Technology", market_cap_tier: "large" },
  { ticker: "HPQ", company_name: "HP Inc.", sector: "Technology", market_cap_tier: "large" },
  { ticker: "CSCO", company_name: "Cisco Systems Inc.", sector: "Technology", market_cap_tier: "large" },
  // Consumer Discretionary
  { ticker: "AMZN", company_name: "Amazon.com Inc.", sector: "Consumer Discretionary", market_cap_tier: "large" },
  { ticker: "TSLA", company_name: "Tesla Inc.", sector: "Consumer Discretionary", market_cap_tier: "large" },
  { ticker: "HD", company_name: "The Home Depot Inc.", sector: "Consumer Discretionary", market_cap_tier: "large" },
  { ticker: "MCD", company_name: "McDonald's Corporation", sector: "Consumer Discretionary", market_cap_tier: "large" },
  { ticker: "NKE", company_name: "NIKE Inc.", sector: "Consumer Discretionary", market_cap_tier: "large" },
  { ticker: "SBUX", company_name: "Starbucks Corporation", sector: "Consumer Discretionary", market_cap_tier: "large" },
  { ticker: "TGT", company_name: "Target Corporation", sector: "Consumer Discretionary", market_cap_tier: "large" },
  { ticker: "LOW", company_name: "Lowe's Companies Inc.", sector: "Consumer Discretionary", market_cap_tier: "large" },
  { ticker: "BKNG", company_name: "Booking Holdings Inc.", sector: "Consumer Discretionary", market_cap_tier: "large" },
  { ticker: "CMG", company_name: "Chipotle Mexican Grill Inc.", sector: "Consumer Discretionary", market_cap_tier: "large" },
  // Financials
  { ticker: "BRK.B", company_name: "Berkshire Hathaway Inc.", sector: "Financials", market_cap_tier: "large" },
  { ticker: "JPM", company_name: "JPMorgan Chase & Co.", sector: "Financials", market_cap_tier: "large" },
  { ticker: "V", company_name: "Visa Inc.", sector: "Financials", market_cap_tier: "large" },
  { ticker: "MA", company_name: "Mastercard Incorporated", sector: "Financials", market_cap_tier: "large" },
  { ticker: "BAC", company_name: "Bank of America Corporation", sector: "Financials", market_cap_tier: "large" },
  { ticker: "WFC", company_name: "Wells Fargo & Company", sector: "Financials", market_cap_tier: "large" },
  { ticker: "GS", company_name: "The Goldman Sachs Group Inc.", sector: "Financials", market_cap_tier: "large" },
  { ticker: "MS", company_name: "Morgan Stanley", sector: "Financials", market_cap_tier: "large" },
  { ticker: "AXP", company_name: "American Express Company", sector: "Financials", market_cap_tier: "large" },
  { ticker: "BLK", company_name: "BlackRock Inc.", sector: "Financials", market_cap_tier: "large" },
  { ticker: "SCHW", company_name: "The Charles Schwab Corporation", sector: "Financials", market_cap_tier: "large" },
  { ticker: "C", company_name: "Citigroup Inc.", sector: "Financials", market_cap_tier: "large" },
  { ticker: "USB", company_name: "U.S. Bancorp", sector: "Financials", market_cap_tier: "large" },
  { ticker: "PGR", company_name: "The Progressive Corporation", sector: "Financials", market_cap_tier: "large" },
  // Healthcare
  { ticker: "LLY", company_name: "Eli Lilly and Company", sector: "Healthcare", market_cap_tier: "large" },
  { ticker: "UNH", company_name: "UnitedHealth Group Incorporated", sector: "Healthcare", market_cap_tier: "large" },
  { ticker: "JNJ", company_name: "Johnson & Johnson", sector: "Healthcare", market_cap_tier: "large" },
  { ticker: "ABBV", company_name: "AbbVie Inc.", sector: "Healthcare", market_cap_tier: "large" },
  { ticker: "MRK", company_name: "Merck & Co. Inc.", sector: "Healthcare", market_cap_tier: "large" },
  { ticker: "TMO", company_name: "Thermo Fisher Scientific Inc.", sector: "Healthcare", market_cap_tier: "large" },
  { ticker: "DHR", company_name: "Danaher Corporation", sector: "Healthcare", market_cap_tier: "large" },
  { ticker: "AMGN", company_name: "Amgen Inc.", sector: "Healthcare", market_cap_tier: "large" },
  { ticker: "PFE", company_name: "Pfizer Inc.", sector: "Healthcare", market_cap_tier: "large" },
  { ticker: "ISRG", company_name: "Intuitive Surgical Inc.", sector: "Healthcare", market_cap_tier: "large" },
  { ticker: "GILD", company_name: "Gilead Sciences Inc.", sector: "Healthcare", market_cap_tier: "large" },
  { ticker: "CVS", company_name: "CVS Health Corporation", sector: "Healthcare", market_cap_tier: "large" },
  { ticker: "MDT", company_name: "Medtronic plc", sector: "Healthcare", market_cap_tier: "large" },
  { ticker: "BMY", company_name: "Bristol-Myers Squibb Company", sector: "Healthcare", market_cap_tier: "large" },
  { ticker: "SYK", company_name: "Stryker Corporation", sector: "Healthcare", market_cap_tier: "large" },
  // Industrials
  { ticker: "GE", company_name: "GE Aerospace", sector: "Industrials", market_cap_tier: "large" },
  { ticker: "HON", company_name: "Honeywell International Inc.", sector: "Industrials", market_cap_tier: "large" },
  { ticker: "UPS", company_name: "United Parcel Service Inc.", sector: "Industrials", market_cap_tier: "large" },
  { ticker: "CAT", company_name: "Caterpillar Inc.", sector: "Industrials", market_cap_tier: "large" },
  { ticker: "DE", company_name: "Deere & Company", sector: "Industrials", market_cap_tier: "large" },
  { ticker: "BA", company_name: "The Boeing Company", sector: "Industrials", market_cap_tier: "large" },
  { ticker: "RTX", company_name: "RTX Corporation", sector: "Industrials", market_cap_tier: "large" },
  { ticker: "LMT", company_name: "Lockheed Martin Corporation", sector: "Industrials", market_cap_tier: "large" },
  { ticker: "NOC", company_name: "Northrop Grumman Corporation", sector: "Industrials", market_cap_tier: "large" },
  { ticker: "WM", company_name: "Waste Management Inc.", sector: "Industrials", market_cap_tier: "large" },
  // Communication Services
  { ticker: "NFLX", company_name: "Netflix Inc.", sector: "Communication Services", market_cap_tier: "large" },
  { ticker: "DIS", company_name: "The Walt Disney Company", sector: "Communication Services", market_cap_tier: "large" },
  { ticker: "T", company_name: "AT&T Inc.", sector: "Communication Services", market_cap_tier: "large" },
  { ticker: "VZ", company_name: "Verizon Communications Inc.", sector: "Communication Services", market_cap_tier: "large" },
  { ticker: "CMCSA", company_name: "Comcast Corporation", sector: "Communication Services", market_cap_tier: "large" },
  { ticker: "TMUS", company_name: "T-Mobile US Inc.", sector: "Communication Services", market_cap_tier: "large" },
  // Consumer Staples
  { ticker: "WMT", company_name: "Walmart Inc.", sector: "Consumer Staples", market_cap_tier: "large" },
  { ticker: "PG", company_name: "The Procter & Gamble Company", sector: "Consumer Staples", market_cap_tier: "large" },
  { ticker: "KO", company_name: "The Coca-Cola Company", sector: "Consumer Staples", market_cap_tier: "large" },
  { ticker: "PEP", company_name: "PepsiCo Inc.", sector: "Consumer Staples", market_cap_tier: "large" },
  { ticker: "COST", company_name: "Costco Wholesale Corporation", sector: "Consumer Staples", market_cap_tier: "large" },
  { ticker: "PM", company_name: "Philip Morris International Inc.", sector: "Consumer Staples", market_cap_tier: "large" },
  { ticker: "MO", company_name: "Altria Group Inc.", sector: "Consumer Staples", market_cap_tier: "large" },
  { ticker: "CL", company_name: "Colgate-Palmolive Company", sector: "Consumer Staples", market_cap_tier: "large" },
  // Energy
  { ticker: "XOM", company_name: "Exxon Mobil Corporation", sector: "Energy", market_cap_tier: "large" },
  { ticker: "CVX", company_name: "Chevron Corporation", sector: "Energy", market_cap_tier: "large" },
  { ticker: "COP", company_name: "ConocoPhillips", sector: "Energy", market_cap_tier: "large" },
  { ticker: "SLB", company_name: "Schlumberger Limited", sector: "Energy", market_cap_tier: "large" },
  { ticker: "EOG", company_name: "EOG Resources Inc.", sector: "Energy", market_cap_tier: "large" },
  { ticker: "OXY", company_name: "Occidental Petroleum Corporation", sector: "Energy", market_cap_tier: "large" },
  // Materials
  { ticker: "LIN", company_name: "Linde plc", sector: "Materials", market_cap_tier: "large" },
  { ticker: "APD", company_name: "Air Products and Chemicals Inc.", sector: "Materials", market_cap_tier: "large" },
  { ticker: "FCX", company_name: "Freeport-McMoRan Inc.", sector: "Materials", market_cap_tier: "large" },
  { ticker: "NEM", company_name: "Newmont Corporation", sector: "Materials", market_cap_tier: "large" },
  // Real Estate
  { ticker: "PLD", company_name: "Prologis Inc.", sector: "Real Estate", market_cap_tier: "large" },
  { ticker: "AMT", company_name: "American Tower Corporation", sector: "Real Estate", market_cap_tier: "large" },
  { ticker: "EQIX", company_name: "Equinix Inc.", sector: "Real Estate", market_cap_tier: "large" },
  { ticker: "SPG", company_name: "Simon Property Group Inc.", sector: "Real Estate", market_cap_tier: "large" },
  // Utilities
  { ticker: "NEE", company_name: "NextEra Energy Inc.", sector: "Utilities", market_cap_tier: "large" },
  { ticker: "DUK", company_name: "Duke Energy Corporation", sector: "Utilities", market_cap_tier: "large" },
  { ticker: "SO", company_name: "The Southern Company", sector: "Utilities", market_cap_tier: "large" },
  { ticker: "D", company_name: "Dominion Energy Inc.", sector: "Utilities", market_cap_tier: "large" },
];

// S&P 400 mid-cap stocks (representative sample)
const SP400_STOCKS: StockEntry[] = [
  // Technology
  { ticker: "FTNT", company_name: "Fortinet Inc.", sector: "Technology", market_cap_tier: "mid" },
  { ticker: "GDDY", company_name: "GoDaddy Inc.", sector: "Technology", market_cap_tier: "mid" },
  { ticker: "JNPR", company_name: "Juniper Networks Inc.", sector: "Technology", market_cap_tier: "mid" },
  { ticker: "NTAP", company_name: "NetApp Inc.", sector: "Technology", market_cap_tier: "mid" },
  { ticker: "FFIV", company_name: "F5 Inc.", sector: "Technology", market_cap_tier: "mid" },
  { ticker: "CTSH", company_name: "Cognizant Technology Solutions", sector: "Technology", market_cap_tier: "mid" },
  { ticker: "EPAM", company_name: "EPAM Systems Inc.", sector: "Technology", market_cap_tier: "mid" },
  { ticker: "GLOB", company_name: "Globant S.A.", sector: "Technology", market_cap_tier: "mid" },
  { ticker: "WEX", company_name: "WEX Inc.", sector: "Technology", market_cap_tier: "mid" },
  { ticker: "PEGA", company_name: "Pegasystems Inc.", sector: "Technology", market_cap_tier: "mid" },
  // Healthcare
  { ticker: "HOLX", company_name: "Hologic Inc.", sector: "Healthcare", market_cap_tier: "mid" },
  { ticker: "JAZZ", company_name: "Jazz Pharmaceuticals plc", sector: "Healthcare", market_cap_tier: "mid" },
  { ticker: "LNTH", company_name: "Lantheus Holdings Inc.", sector: "Healthcare", market_cap_tier: "mid" },
  { ticker: "PRGO", company_name: "Perrigo Company plc", sector: "Healthcare", market_cap_tier: "mid" },
  { ticker: "ACAD", company_name: "ACADIA Pharmaceuticals Inc.", sector: "Healthcare", market_cap_tier: "mid" },
  { ticker: "NVCR", company_name: "NovoCure Limited", sector: "Healthcare", market_cap_tier: "mid" },
  { ticker: "HALO", company_name: "Halozyme Therapeutics Inc.", sector: "Healthcare", market_cap_tier: "mid" },
  { ticker: "INVA", company_name: "Innoviva Inc.", sector: "Healthcare", market_cap_tier: "mid" },
  // Financials
  { ticker: "SNV", company_name: "Synovus Financial Corp.", sector: "Financials", market_cap_tier: "mid" },
  { ticker: "GBCI", company_name: "Glacier Bancorp Inc.", sector: "Financials", market_cap_tier: "mid" },
  { ticker: "IBOC", company_name: "International Bancshares Corporation", sector: "Financials", market_cap_tier: "mid" },
  { ticker: "CATY", company_name: "Cathay General Bancorp", sector: "Financials", market_cap_tier: "mid" },
  { ticker: "PB", company_name: "Prosperity Bancshares Inc.", sector: "Financials", market_cap_tier: "mid" },
  { ticker: "CVBF", company_name: "CVB Financial Corp.", sector: "Financials", market_cap_tier: "mid" },
  { ticker: "SFNC", company_name: "Simmons First National Corporation", sector: "Financials", market_cap_tier: "mid" },
  // Consumer Discretionary
  { ticker: "RH", company_name: "RH", sector: "Consumer Discretionary", market_cap_tier: "mid" },
  { ticker: "WSM", company_name: "Williams-Sonoma Inc.", sector: "Consumer Discretionary", market_cap_tier: "mid" },
  { ticker: "FIVE", company_name: "Five Below Inc.", sector: "Consumer Discretionary", market_cap_tier: "mid" },
  { ticker: "BJ", company_name: "BJ's Wholesale Club Holdings Inc.", sector: "Consumer Discretionary", market_cap_tier: "mid" },
  { ticker: "SKX", company_name: "Skechers U.S.A. Inc.", sector: "Consumer Discretionary", market_cap_tier: "mid" },
  { ticker: "LEVI", company_name: "Levi Strauss & Co.", sector: "Consumer Discretionary", market_cap_tier: "mid" },
  { ticker: "GPC", company_name: "Genuine Parts Company", sector: "Consumer Discretionary", market_cap_tier: "mid" },
  // Industrials
  { ticker: "GNRC", company_name: "Generac Holdings Inc.", sector: "Industrials", market_cap_tier: "mid" },
  { ticker: "GATX", company_name: "GATX Corporation", sector: "Industrials", market_cap_tier: "mid" },
  { ticker: "MATX", company_name: "Matson Inc.", sector: "Industrials", market_cap_tier: "mid" },
  { ticker: "WERN", company_name: "Werner Enterprises Inc.", sector: "Industrials", market_cap_tier: "mid" },
  { ticker: "R", company_name: "Ryder System Inc.", sector: "Industrials", market_cap_tier: "mid" },
  { ticker: "AIT", company_name: "Applied Industrial Technologies Inc.", sector: "Industrials", market_cap_tier: "mid" },
  // Energy
  { ticker: "CHX", company_name: "ChampionX Corporation", sector: "Energy", market_cap_tier: "mid" },
  { ticker: "NOV", company_name: "NOV Inc.", sector: "Energy", market_cap_tier: "mid" },
  { ticker: "PTEN", company_name: "Patterson-UTI Energy Inc.", sector: "Energy", market_cap_tier: "mid" },
  { ticker: "RRC", company_name: "Range Resources Corporation", sector: "Energy", market_cap_tier: "mid" },
  { ticker: "SM", company_name: "SM Energy Company", sector: "Energy", market_cap_tier: "mid" },
  // Materials
  { ticker: "ATR", company_name: "AptarGroup Inc.", sector: "Materials", market_cap_tier: "mid" },
  { ticker: "SLGN", company_name: "Silgan Holdings Inc.", sector: "Materials", market_cap_tier: "mid" },
  { ticker: "UFPI", company_name: "UFP Technologies Inc.", sector: "Materials", market_cap_tier: "mid" },
  // Consumer Staples
  { ticker: "SFM", company_name: "Sprouts Farmers Market Inc.", sector: "Consumer Staples", market_cap_tier: "mid" },
  { ticker: "INGR", company_name: "Ingredion Incorporated", sector: "Consumer Staples", market_cap_tier: "mid" },
  { ticker: "HLF", company_name: "Herbalife Ltd.", sector: "Consumer Staples", market_cap_tier: "mid" },
  { ticker: "COTY", company_name: "Coty Inc.", sector: "Consumer Staples", market_cap_tier: "mid" },
  // Communication Services
  { ticker: "IPG", company_name: "The Interpublic Group of Companies", sector: "Communication Services", market_cap_tier: "mid" },
  { ticker: "OMC", company_name: "Omnicom Group Inc.", sector: "Communication Services", market_cap_tier: "mid" },
  { ticker: "CNMD", company_name: "CONMED Corporation", sector: "Communication Services", market_cap_tier: "mid" },
  // Real Estate
  { ticker: "KIM", company_name: "Kimco Realty Corporation", sector: "Real Estate", market_cap_tier: "mid" },
  { ticker: "BRX", company_name: "Brixmor Property Group Inc.", sector: "Real Estate", market_cap_tier: "mid" },
  { ticker: "RPAI", company_name: "Inland Real Estate Income Trust", sector: "Real Estate", market_cap_tier: "mid" },
  { ticker: "IIPR", company_name: "Innovative Industrial Properties Inc.", sector: "Real Estate", market_cap_tier: "mid" },
  { ticker: "PINE", company_name: "Alpine Income Property Trust Inc.", sector: "Real Estate", market_cap_tier: "mid" },
  // Utilities
  { ticker: "NWE", company_name: "NorthWestern Energy Group Inc.", sector: "Utilities", market_cap_tier: "mid" },
  { ticker: "SPKL", company_name: "Spark Power Group", sector: "Utilities", market_cap_tier: "mid" },
  { ticker: "MGEE", company_name: "MGE Energy Inc.", sector: "Utilities", market_cap_tier: "mid" },
  { ticker: "OTTR", company_name: "Otter Tail Corporation", sector: "Utilities", market_cap_tier: "mid" },
  { ticker: "SWX", company_name: "Southwest Gas Holdings Inc.", sector: "Utilities", market_cap_tier: "mid" },
];

const ALL_STOCKS = [...SP500_STOCKS, ...SP400_STOCKS];

async function seed() {
  console.log(`Seeding ${ALL_STOCKS.length} stocks...`);

  // Process in batches of 50
  const BATCH_SIZE = 50;
  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < ALL_STOCKS.length; i += BATCH_SIZE) {
    const batch = ALL_STOCKS.slice(i, i + BATCH_SIZE);

    const { data, error } = await supabase
      .from("stocks")
      .upsert(batch, { onConflict: "ticker", ignoreDuplicates: true });

    if (error) {
      console.error(`Batch ${i / BATCH_SIZE + 1} error:`, error.message);
      skipped += batch.length;
    } else {
      inserted += batch.length;
      console.log(`Batch ${i / BATCH_SIZE + 1}: inserted/updated ${batch.length} stocks`);
    }
  }

  console.log(`\nDone. ${inserted} stocks processed, ${skipped} skipped.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
