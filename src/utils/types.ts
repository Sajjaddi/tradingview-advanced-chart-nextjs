export interface Bar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface SymbolItem {
  symbol: string;
  name: string;
  ticker: string;
  description: string;
  exchange: string;
  type: string;
  pricescale: number;
  basePrice: number;
  volatility: number;
}
