import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateWheelSummary(
  ticker: string,
  companyName: string,
  metrics: {
    ivRank: number | null;
    putPremiumYield: number | null;
    daysToEarnings: number | null;
    wheelScore: number | null;
    rsi: number | null;
    price: number | null;
  }
): Promise<string> {
  const prompt = `You are a concise options trading analyst. Write a 1-2 sentence plain-English summary of why ${ticker} (${companyName}) is a wheel candidate today.

Data:
- IV Rank: ${metrics.ivRank?.toFixed(0) ?? "N/A"}
- Put Premium Yield: ${metrics.putPremiumYield?.toFixed(2) ?? "N/A"}% annualized
- Days to Earnings: ${metrics.daysToEarnings ?? "N/A"}
- Wheel Score: ${metrics.wheelScore?.toFixed(0) ?? "N/A"}/100
- RSI(14): ${metrics.rsi?.toFixed(1) ?? "N/A"}
- Price: $${metrics.price?.toFixed(2) ?? "N/A"}

Rules: No emojis. No filler phrases like "This stock...". Professional, factual tone. Focus on what makes it a good wheel candidate right now. Example format: "IV rank is elevated at 72 with a 45-DTE put yielding 2.1% — strong premium with earnings 6 weeks out."`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 150,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type === "text") {
    return content.text.trim();
  }

  return "Elevated IV rank with reasonable premium yield relative to current price.";
}
