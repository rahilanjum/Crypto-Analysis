import { GoogleGenAI } from "@google/genai";
import { Ticker, TechnicalData, AnalysisResponse } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeTechnicalData = async (
  ticker: string,
  data: TechnicalData
): Promise<AnalysisResponse> => {
  const modelId = 'gemini-3-pro-preview';

  const prompt = `
    Act as a professional Institutional Cryptocurrency Technical Analyst (KOL style). 
    Perform a deep analysis for the ticker: ${ticker}.

    INPUT DATA:
    1. Reference Price: ${data.currentPrice || 'Fetch current price'}
    2. S/R Levels: ${JSON.stringify(data.supportResistance)}
    3. Sweeps: ${JSON.stringify(data.weeklySweep)}
    4. FVGs: ${JSON.stringify(data.fvgFibs)}
    5. Candle Fibs: ${JSON.stringify(data.candleFibs)}
    6. Time Fibs: ${JSON.stringify(data.timeFibs)} (${data.timeFibsTimeframe} chart)

    SEARCH TASKS:
    1. "${ticker} whale positions Hyperliquid Binance open interest delta"
    2. "${ticker} twitter sentiment smart money vs retail"
    3. "latest technical analysis ${ticker} key opinion leaders"

    CRITICAL INSTRUCTIONS (PRO STYLE):
    1. **Dynamic Zones**: Never state prices as exact numbers (e.g., "95.7k"). Always convert provided levels into **0.5% zones** (e.g., "95.5k - 95.9k Demand Zone").
    2. **Citations**: 
       - Every technical claim (FVG, Fib) MUST cite the timeframe (e.g., "4H FVG", "Weekly Breaker").
       - Whale data MUST include a "Data Freshness" tag (e.g., "[Data: <4h old]").
    3. **Whale References**: Mention insights for:
       - https://legacy.hyperdash.com/trader/0x94d3735543ecb3d339064151118644501c933814
       - https://legacy.hyperdash.com/trader/0x152e41f0b83e6cad4b5dc730c1d6279b7d67c9dc
       - https://legacy.hyperdash.com/trader/0x0ddf9bae2af4b874b96d287a5ad42eb47138a902

    OUTPUT FORMAT (Markdown):

    **AI Conviction Score:** [Score]/10 ([Short Rationale, e.g., "Strong Confluence"])

    ### Quick Reference
    | Indicator | Status | Level |
    | :--- | :--- | :--- |
    | Primary Trend | [e.g., Bullish/Neutral] | [Key Pivot Zone] |
    | Whale Flow | [e.g., Aggressive Buy] | [Top Trader Action] |
    | Retail Sentiment | [e.g., Extreme Fear] | [Contrarian Signal?] |
    | Key Trigger | [e.g., 4H Close Above] | [Price Zone] |

    ## ${ticker} Institutional Analysis

    ### 1. Market Structure & Zones (2H/4H)
    *Synthesize levels into executable zones. Use professional terms: "Acceptance," "Deviation," "Reclaim."*

    ### 2. High Time Frame Bias (Daily/Weekly)
    *Macro S/R and Sweep analysis.*

    ### 3. Smart Money & Order Flow
    *Hyperliquid/Binance whale positioning. Use "Net Long Delta" terminology.*

    ### 4. Sentiment Analysis
    *Summary of CT (Crypto Twitter) narratives.*

    ### 5. Execution Summary
    *Final bias and invalidation levels.*

    ### Social Media Summary
    *A concise, engaging paragraph (max 280 chars) summarizing the 2H setup for X/Twitter. Focus on the actionable trigger. No hashtags except $${ticker}.*
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'text/plain',
      },
    });

    const groundingSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web ? { title: chunk.web.title, uri: chunk.web.uri } : null)
      .filter(Boolean) || [];

    return {
      markdown: response.text || "Analysis generation failed. Please try again.",
      groundingSources: groundingSources,
    };
  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
};