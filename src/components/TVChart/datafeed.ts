"use client";

import type {
  Bar,
  DatafeedConfiguration,
  IBasicDataFeed,
  LibrarySymbolInfo,
  ResolutionString,
  SearchSymbolResultItem,
  SubscribeBarsCallback,
} from "@/libraries/charting_library";

import {
  findSymbol,
  generateMockBars,
  getNextRealtimeBar,
  MOCK_SYMBOLS,
} from "@/utils/mockData";

const configurationData: DatafeedConfiguration = {
  supported_resolutions: [
    "1",
    "5",
    "15",
    "30",
    "60",
    "240",
    "1D",
    "1W",
  ] as ResolutionString[],
  exchanges: [
    { value: "Crypto", name: "Crypto", desc: "Cryptocurrency Markets" },
    { value: "NASDAQ", name: "NASDAQ", desc: "NASDAQ Stock Market" },
  ],
  symbols_types: [
    { name: "crypto", value: "crypto" },
    { name: "stock", value: "stock" },
  ],
};

interface Subscription {
  subscriberUID: string;
  resolution: string;
  symbolInfo: LibrarySymbolInfo;
  callback: SubscribeBarsCallback;
  timer: NodeJS.Timeout;
}

const activeSubscriptions = new Map<string, Subscription>();
const lastBarsCache = new Map<string, Bar>();

export function getMockDataFeed(): IBasicDataFeed {
  return {
    onReady: (callback) => {
      setTimeout(() => callback(configurationData), 0);
    },

    searchSymbols: (
      userInput: string,
      _exchange: string,
      _symbolType: string,
      onResultReadyCallback
    ) => {
      const query = (userInput || "").toLowerCase().trim();
      const results: SearchSymbolResultItem[] = MOCK_SYMBOLS.filter(
        (item) =>
          !query ||
          item.symbol.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      ).map((item) => ({
        symbol: item.symbol,
        full_name: `${item.exchange}:${item.symbol}`,
        description: item.description,
        exchange: item.exchange,
        ticker: item.ticker,
        type: item.type,
      }));
      onResultReadyCallback(results);
    },

    resolveSymbol: (
      symbolName,
      onSymbolResolvedCallback,
      _onResolveErrorCallback
    ) => {
      const symbolItem = findSymbol(symbolName);

      const symbolInfo: LibrarySymbolInfo = {
        ticker: symbolItem.ticker,
        name: symbolItem.name,
        description: symbolItem.description,
        type: symbolItem.type,
        session: "24x7",
        timezone: "Etc/UTC",
        minmov: 1,
        pricescale: symbolItem.pricescale,
        exchange: symbolItem.exchange,
        has_intraday: true,
        has_weekly_and_monthly: true,
        visible_plots_set: "ohlcv",
        supported_resolutions: configurationData.supported_resolutions,
        volume_precision: 2,
        data_status: "streaming",
        format: "price",
        listed_exchange: symbolItem.exchange,
      };

      setTimeout(() => onSymbolResolvedCallback(symbolInfo), 0);
    },

    getBars: async (
      symbolInfo,
      resolution,
      periodParams,
      onHistoryCallback,
      onErrorCallback
    ) => {
      const { from, to, firstDataRequest } = periodParams;

      try {
        const bars = generateMockBars(symbolInfo.name, resolution, from, to);

        if (!bars || bars.length === 0) {
          onHistoryCallback([], { noData: true });
          return;
        }

        if (firstDataRequest && bars.length > 0) {
          lastBarsCache.set(symbolInfo.name, bars[bars.length - 1]);
        }

        onHistoryCallback(bars, { noData: false });
      } catch (err: any) {
        console.error("[getBars]: error generating bars", err);
        onErrorCallback(err?.message || "Error generating bars");
      }
    },

    subscribeBars: (
      symbolInfo,
      resolution,
      onRealtimeCallback,
      subscriberUID,
      _onResetCacheNeededCallback
    ) => {
      // Clear existing subscription if any
      if (activeSubscriptions.has(subscriberUID)) {
        clearInterval(activeSubscriptions.get(subscriberUID)!.timer);
        activeSubscriptions.delete(subscriberUID);
      }

      let lastBar = lastBarsCache.get(symbolInfo.name);

      if (!lastBar) {
        const nowSec = Math.floor(Date.now() / 1000);
        const bars = generateMockBars(symbolInfo.name, resolution, nowSec - 3600, nowSec);
        if (bars.length > 0) {
          lastBar = bars[bars.length - 1];
        } else {
          const item = findSymbol(symbolInfo.name);
          lastBar = {
            time: Date.now(),
            open: item.basePrice,
            high: item.basePrice,
            low: item.basePrice,
            close: item.basePrice,
            volume: 10,
          };
        }
      }

      // Simulate a tick every 1000ms
      const timer = setInterval(() => {
        if (!lastBar) return;
        const { updatedBar } = getNextRealtimeBar(
          lastBar,
          resolution,
          symbolInfo.name
        );
        lastBar = updatedBar;
        lastBarsCache.set(symbolInfo.name, updatedBar);
        onRealtimeCallback(updatedBar);
      }, 1000);

      activeSubscriptions.set(subscriberUID, {
        subscriberUID,
        resolution,
        symbolInfo,
        callback: onRealtimeCallback,
        timer,
      });
    },

    unsubscribeBars: (subscriberUID) => {
      const subscription = activeSubscriptions.get(subscriberUID);
      if (subscription) {
        clearInterval(subscription.timer);
        activeSubscriptions.delete(subscriberUID);
      }
    },
  };
}
