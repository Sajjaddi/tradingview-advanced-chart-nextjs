import { Bar, SymbolItem } from "./types";

export const MOCK_SYMBOLS: SymbolItem[] = [
  {
    symbol: "BTC/USD",
    name: "BTC/USD",
    ticker: "BTC/USD",
    description: "Bitcoin / US Dollar",
    exchange: "Crypto",
    type: "crypto",
    pricescale: 100,
    basePrice: 65420.0,
    volatility: 0.0018,
  },
  {
    symbol: "ETH/USD",
    name: "ETH/USD",
    ticker: "ETH/USD",
    description: "Ethereum / US Dollar",
    exchange: "Crypto",
    type: "crypto",
    pricescale: 100,
    basePrice: 3480.0,
    volatility: 0.0022,
  },
  {
    symbol: "SOL/USD",
    name: "SOL/USD",
    ticker: "SOL/USD",
    description: "Solana / US Dollar",
    exchange: "Crypto",
    type: "crypto",
    pricescale: 100,
    basePrice: 154.5,
    volatility: 0.003,
  },
  {
    symbol: "AAPL",
    name: "AAPL",
    ticker: "AAPL",
    description: "Apple Inc.",
    exchange: "NASDAQ",
    type: "stock",
    pricescale: 100,
    basePrice: 228.4,
    volatility: 0.0012,
  },
  {
    symbol: "TSLA",
    name: "TSLA",
    ticker: "TSLA",
    description: "Tesla Inc.",
    exchange: "NASDAQ",
    type: "stock",
    pricescale: 100,
    basePrice: 242.8,
    volatility: 0.0025,
  },
  {
    symbol: "NVDA",
    name: "NVDA",
    ticker: "NVDA",
    description: "NVIDIA Corporation",
    exchange: "NASDAQ",
    type: "stock",
    pricescale: 100,
    basePrice: 128.5,
    volatility: 0.002,
  },
];

export function findSymbol(symbolName: string): SymbolItem {
  const cleanName = symbolName.toUpperCase().replace(/\s+/g, "");
  const match = MOCK_SYMBOLS.find(
    (s) =>
      s.symbol.toUpperCase() === cleanName ||
      s.name.toUpperCase() === cleanName ||
      s.ticker.toUpperCase() === cleanName
  );
  return (
    match || {
      symbol: symbolName,
      name: symbolName,
      ticker: symbolName,
      description: `${symbolName} Mock Asset`,
      exchange: "Custom",
      type: "crypto",
      pricescale: 100,
      basePrice: 1000.0,
      volatility: 0.002,
    }
  );
}

export function resolutionToSeconds(resolution: string): number {
  switch (resolution) {
    case "1":
      return 60;
    case "3":
      return 180;
    case "5":
      return 300;
    case "15":
      return 900;
    case "30":
      return 1800;
    case "60":
    case "1H":
      return 3600;
    case "120":
    case "2H":
      return 7200;
    case "240":
    case "4H":
      return 14400;
    case "1D":
    case "D":
      return 86400;
    case "1W":
    case "W":
      return 604800;
    case "1M":
    case "M":
      return 2592000;
    default: {
      const minutes = parseInt(resolution, 10);
      if (!isNaN(minutes)) {
        return minutes * 60;
      }
      return 86400;
    }
  }
}

// Pseudo-random pseudo-deterministic number generator for reproducible historical data
function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function generateMockBars(
  symbolName: string,
  resolution: string,
  from: number,
  to: number
): Bar[] {
  const symbolInfo = findSymbol(symbolName);
  const step = resolutionToSeconds(resolution);
  const bars: Bar[] = [];

  // Align timestamps to step boundaries
  const startSec = Math.floor(from / step) * step;
  const endSec = Math.min(Math.floor(to / step) * step, Math.floor(Date.now() / 1000));

  if (startSec >= endSec) {
    return [];
  }

  // Calculate approximate price trend based on symbol basePrice
  let currentPrice = symbolInfo.basePrice;
  const baseVolatility = symbolInfo.volatility;

  // We can anchor starting price by how far in the past it is
  const hoursFromNow = (Date.now() / 1000 - startSec) / 3600;
  const driftFactor = 1 + Math.sin(hoursFromNow / 48) * 0.08;
  currentPrice = currentPrice * driftFactor;

  for (let timeSec = startSec; timeSec <= endSec; timeSec += step) {
    const seed = timeSec + symbolName.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const rand1 = pseudoRandom(seed);
    const rand2 = pseudoRandom(seed + 1);
    const rand3 = pseudoRandom(seed + 2);
    const rand4 = pseudoRandom(seed + 3);

    const changePercent = (rand1 - 0.495) * baseVolatility * Math.sqrt(step / 60);
    const open = currentPrice;
    const close = Math.max(open * (1 + changePercent), 0.0001);

    const highExtra = Math.abs(rand2) * (baseVolatility * open * Math.sqrt(step / 60));
    const lowExtra = Math.abs(rand3) * (baseVolatility * open * Math.sqrt(step / 60));

    const high = Math.max(open, close) + highExtra;
    const low = Math.max(Math.min(open, close) - lowExtra, 0.00001);

    const volume = Math.floor(rand4 * 500 * (10000 / Math.max(currentPrice, 1)) + 50);

    bars.push({
      time: timeSec * 1000, // TradingView expects milliseconds
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
    });

    currentPrice = close;
  }

  return bars;
}

export function getNextRealtimeBar(
  lastBar: Bar,
  resolution: string,
  symbolName: string
): { updatedBar: Bar; isNew: boolean } {
  const symbolInfo = findSymbol(symbolName);
  const step = resolutionToSeconds(resolution);
  const now = Date.now();
  const stepMs = step * 1000;

  // Check if current time has moved to the next candle slot
  const currentBarStartTime = Math.floor(now / stepMs) * stepMs;

  const volatility = symbolInfo.volatility * 0.2;
  const randomDelta = (Math.random() - 0.49) * volatility * lastBar.close;

  if (lastBar.time < currentBarStartTime) {
    // Start a new bar
    const open = lastBar.close;
    const close = open + randomDelta;
    const newBar: Bar = {
      time: currentBarStartTime,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(Math.max(open, close).toFixed(2)),
      low: parseFloat(Math.min(open, close).toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(Math.random() * 5) + 1,
    };
    return { updatedBar: newBar, isNew: true };
  } else {
    // Update existing bar
    const close = lastBar.close + randomDelta;
    const updatedBar: Bar = {
      ...lastBar,
      close: parseFloat(close.toFixed(2)),
      high: parseFloat(Math.max(lastBar.high, close).toFixed(2)),
      low: parseFloat(Math.min(lastBar.low, close).toFixed(2)),
      volume: (lastBar.volume || 0) + Math.floor(Math.random() * 3) + 1,
    };
    return { updatedBar, isNew: false };
  }
}
