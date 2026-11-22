# TradingView Next.js Chart 📈

A clean, standalone, and production-ready **TradingView Advanced Charting Library** implementation built with **Next.js 14 (App Router)**, **TypeScript**, and **Tailwind CSS**.

Includes a complete **built-in mock datafeed** with realistic historical OHLCV candles and simulated real-time price ticks—ready to run out of the box with zero external APIs, credentials, or backend setup.

---

## ✨ Features

- **TradingView Advanced Charting Library**: Fully integrated with custom dark styling, full toolbar tools, indicators, drawing tools, and autoscaling.
- **Realistic Mock Datafeed**:
  - Continuous OHLCV historical candle generation across all timeframes.
  - Realistic volume profiling and price volatility.
  - Simulated **live real-time tick updates** (candles update live every second).
- **Multi-Asset Support**: Switch between Crypto (`BTC/USD`, `ETH/USD`, `SOL/USD`) and Stocks (`AAPL`, `TSLA`, `NVDA`), plus search for symbols directly in the chart search bar.
- **Timeframe Quick Switcher**: Instant switching between `1m`, `5m`, `15m`, `1h`, `4h`, `1D`, and `1W`.
- **Zero Bloat**: Stripped of any unnecessary crypto wallet, contract, or backend dependencies—strictly focused on the chart.
- **Easy Customization**: Clear, modular code structure to easily plug in your own REST API, WebSocket feed, or backend database.

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/trading-chart.git
cd trading-chart
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the chart.

---

## 📁 Project Structure

```
├── public/
│   ├── libraries/
│   │   └── charting_library/      # TradingView Advanced Charting Library bundle
│   └── tradingview-chart.css       # Custom chart theme and dark UI overrides
├── src/
│   ├── app/
│   │   ├── globals.css             # Tailwind & base styling
│   │   ├── layout.tsx              # Root HTML & body layout
│   │   └── page.tsx                # Main chart page & asset navigation
│   ├── components/
│   │   └── TVChart/
│   │       ├── TVChartContainer.tsx # Core TradingView widget lifecycle component
│   │       ├── TradingChart.tsx    # Dynamic client-only wrapper (SSR-safe)
│   │       └── datafeed.ts         # TradingView JS Datafeed API implementation
│   └── utils/
│       ├── constants.ts            # Chart theme colors, features & overrides
│       ├── mockData.ts             # Historical candle generator & realtime tick engine
│       └── types.ts                # TypeScript interfaces for bars and symbols
├── package.json
└── tsconfig.json
```

---

## 🔌 Connecting Your Own Live Data

The datafeed in `src/components/TVChart/datafeed.ts` implements TradingView's standard `IBasicDataFeed` interface.

### 1. Fetching Historical Bars (`getBars`)
Replace `generateMockBars` with your backend REST API or external provider (e.g. Binance, Bybit, CryptoCompare):

```typescript
getBars: async (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
  const { from, to, firstDataRequest } = periodParams;
  try {
    const response = await fetch(
      `/api/history?symbol=${symbolInfo.name}&resolution=${resolution}&from=${from}&to=${to}`
    );
    const bars = await response.json();
    onHistoryCallback(bars, { noData: bars.length === 0 });
  } catch (err) {
    onErrorCallback(err.message);
  }
}
```

### 2. Streaming Real-Time Updates (`subscribeBars`)
Replace the mock timer in `subscribeBars` with your WebSocket client:

```typescript
subscribeBars: (symbolInfo, resolution, onRealtimeCallback, subscriberUID) => {
  socket.on("price_tick", (tick) => {
    onRealtimeCallback({
      time: tick.timestamp,
      open: tick.open,
      high: tick.high,
      low: tick.low,
      close: tick.close,
      volume: tick.volume,
    });
  });
}
```

---

## 🛠️ Scripts

- `npm run dev` - Start development server on `http://localhost:3000`
- `npm run build` - Create an optimized production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks

---

## 📄 License & Notes

- **TradingView Advanced Charts**: Note that the TradingView Charting Library files (`public/libraries/charting_library/`) are subject to [TradingView's License Agreement](https://www.tradingview.com/charting-library/). Ensure compliance with their terms if deploying publicly.
- The project wrapper code is licensed under the MIT License.
