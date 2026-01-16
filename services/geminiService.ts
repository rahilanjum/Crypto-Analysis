import { Ticker, TechnicalData, AnalysisResponse } from '../types';

export const analyzeTechnicalData = async (
  ticker: string,
  data: TechnicalData
): Promise<AnalysisResponse> => {

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
    ...
  `;

  try {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
    });

    if (!res.ok) {
      throw new Error("Server API call failed");
    }

    const response = await res.json();

    const groundingSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web ? { title: chunk.web.title, uri: chunk.web.uri } : null)
      .filter(Boolean) || [];

    return {
      markdown: response.candidates?.[0]?.content?.parts?.[0]?.text || "Analysis failed.",
      groundingSources,
    };
  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
};
