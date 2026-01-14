export enum PresetTicker {
  TOTAL = 'TOTAL (Crypto Total Market Cap)',
  TOTAL3 = 'TOTAL3',
  BTC_D = 'BTC.D',
  ETHBTC = 'ETHBTC',
  BTCUSD = 'BTCUSD',
  ETHUSD = 'ETHUSD',
  STABLE_D = 'USDT.D + USDC.D'
}

// Allow Ticker to be a string for custom inputs, but use the enum for presets
export type Ticker = string;

export type Timeframe = '2h' | '4h' | '1D' | '1W';

export interface TechnicalData {
  currentPrice: string;
  supportResistance: Record<Timeframe, string>;
  weeklySweep: {
    sweep1: string;
    sweep2: string;
  };
  fvgFibs: Record<Timeframe, string>;
  candleFibs: Record<Timeframe, string>;
  timeFibs: {
    t0: string;
    t0_618: string;
    t0_786: string;
    t1_618: string;
  };
  timeFibsTimeframe: Timeframe;
}

export interface Preset {
  id: string;
  name: string;
  data: TechnicalData;
  timestamp: number;
}

export interface AnalysisResponse {
  markdown: string;
  groundingSources?: { title: string; uri: string }[];
}