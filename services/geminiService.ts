import { GoogleGenAI } from "@google/genai";
import { Ticker, TechnicalData, AnalysisResponse } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


export const analyzeTechnicalData = async (
  ticker: string,
  data: TechnicalData
): Promise<AnalysisResponse> => {
  const modelId = 'gemini-3-pro-preview';

  const prompt = `
    Act as a world-class Cryptocurrency Technical Analyst. 
    Perform a deep analysis for the ticker: ${ticker}.
    
    I have provided the following technical inputs:
    
    1. Current Price (Reference): ${data.currentPrice || 'Please fetch current price'}
    
    2. Support & Resistance Levels (Key Levels per timeframe):
       - 2h: ${data.supportResistance['2h']}
       - 4h: ${data.supportResistance['4h']}
       - Daily: ${data.supportResistance['1D']}
       - Weekly: ${data.supportResistance['1W']}
       
    3. Weekly Sweeps (Liquidity Grabs):
       - Event 1: ${data.weeklySweep.sweep1}
       - Event 2: ${data.weeklySweep.sweep2}
       
    4. FVG (Fair Value Gap) Fibs:
       - 2h: ${data.fvgFibs['2h']}
       - 4h: ${data.fvgFibs['4h']}
       - Daily: ${data.fvgFibs['1D']}
       - Weekly: ${data.fvgFibs['1W']}
       
    5. Candle Fibs:
       - 2h: ${data.candleFibs['2h']}
       - 4h: ${data.candleFibs['4h']}
       - Daily: ${data.candleFibs['1D']}
       - Weekly: ${data.candleFibs['1W']}
       
    6. Time Vertical Fibs (Based on ${data.timeFibsTimeframe || '2h'} Chart):
       - 0.0: ${data.timeFibs.t0}
       - 0.618: ${data.timeFibs.t0_618}
       - 0.786: ${data.timeFibs.t0_786}
       - 1.618: ${data.timeFibs.t1_618}

    TASK:
    Generate a comprehensive analysis report using the provided technicals combined with live market data found via Google Search.
    
    SEARCH INSTRUCTIONS:
    1. Search for: "${ticker} whale positions Hyperliquid Binance"
    2. Search for: "${ticker} twitter sentiment X latest"
    3. Search for: "top crypto KOLs views on ${ticker} today"
    
    CRITICAL: In section 3 (Whale Positions), mention any insights for these specific addresses:
    - https://legacy.hyperdash.com/trader/0x94d3735543ecb3d339064151118644501c933814
    - https://legacy.hyperdash.com/trader/0x152e41f0b83e6cad4b5dc730c1d6279b7d67c9dc
    - https://legacy.hyperdash.com/trader/0x0ddf9bae2af4b874b96d287a5ad42eb47138a902
    
    CRITICAL: Section 4 MUST be a detailed summary of Twitter/X sentiment. Use recent tweets, hashtag trends, and KOL (Key Opinion Leader) opinions found in search.

    OUTPUT FORMAT (Markdown):
    
    ## ${ticker} Technical Analysis
    
    ### 1. 2H & 4H Analysis (Lower Time Frame)
    *Synthesize the 2h, 4h levels. Identify immediate trends and entries.*
    
    ### 2. High Time Frame Analysis (Daily & Weekly)
    *Synthesize macro S/R and Weekly Sweeps. Determine the macro bias.*
    
    ### 3. Hyperliquid Whale Positions & Smart Money
    *Summarize findings regarding whale movements and Hyperdash trader links.*
    
    ### 4. Market Sentiment (Twitter/X & KOLs)
    *Provide a robust summary of social sentiment from Twitter/X. Is the "CT" (Crypto Twitter) crowd bullish or bearish? What are the specific narratives or fears circulating right now?*
    
    ### 5. Final Summary
    *Conclusive actionable bias with key levels and timing pivots.*

    ### 6. X Post Draft
    *Write a short, easy-to-understand summary (max 270 chars) specifically describing the 2H Timeframe structure. Mention $${ticker} and the direction (Long/Short). Do not use external links or hashtags other than the ticker.*
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
