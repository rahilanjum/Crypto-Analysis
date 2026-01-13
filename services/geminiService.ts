import { GoogleGenAI } from "@google/genai";
import { Ticker, TechnicalData, AnalysisResponse } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeTechnicalData = async (
  ticker: Ticker,
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
    
    Use Google Search to specifically find:
    1. "Hyperliquid whale positions" or general whale/smart money positioning relevant to ${ticker}.
    2. "X / twitter sentiments" - Recent impactful tweets or sentiment regarding ${ticker}.
    
    OUTPUT FORMAT (Markdown):
    
    ## ${ticker} Technical Analysis
    
    ### 1. 2H & 4H Analysis (Lower Time Frame)
    *Synthesize the 2h, 4h Support/Resistance, FVG Fibs, and Candle Fibs. Identify immediate trends, entries, or invalidation points.*
    
    ### 2. High Time Frame Analysis (Daily & Weekly)
    *Synthesize Daily/Weekly S/R, Weekly Sweeps, and major Fib levels. Determine the macro bias.*
    
    ### 3. Hyperliquid Whale Positions & Smart Money
    *Summarize findings from search regarding Open Interest (OI), funding rates, or whale movements on Hyperliquid/Binance.*
    
    ### 4. Market Sentiment (X / Twitter)
    *Summarize current social sentiment. Bullish/Bearish? What are the KOLs saying?*
    
    ### 5. Final Summary
    *Conclusive actionable bias (Long/Short/Neutral) with key levels to watch based on the Time Vertical Fibs and Price Levels.*
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