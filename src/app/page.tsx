"use client";

import { useState } from "react";
import TradingChart from "@/components/TVChart/TradingChart";
import { MOCK_SYMBOLS } from "@/utils/mockData";
import { ResolutionString } from "@/libraries/charting_library";

const TIMEFRAMES: { label: string; value: ResolutionString }[] = [
  { label: "1m", value: "1" as ResolutionString },
  { label: "5m", value: "5" as ResolutionString },
  { label: "15m", value: "15" as ResolutionString },
  { label: "1h", value: "60" as ResolutionString },
  { label: "4h", value: "240" as ResolutionString },
  { label: "1D", value: "1D" as ResolutionString },
  { label: "1W", value: "1W" as ResolutionString },
];

export default function Home() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>("BTC/USD");
  const [selectedInterval, setSelectedInterval] = useState<ResolutionString>(
    "1D" as ResolutionString
  );

  const activeSymbolInfo =
    MOCK_SYMBOLS.find((s) => s.symbol === selectedSymbol) || MOCK_SYMBOLS[0];

  return (
    <main className="flex flex-col h-screen w-screen overflow-hidden bg-[#0e1118]">
      {/* Top Navbar */}
      <header className="h-14 bg-[#141823] border-b border-[#232738] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-base">
              📈
            </div>
            <div>
              <h1 className="font-semibold text-sm text-gray-100 leading-tight">
                TradingView Chart
              </h1>
              <p className="text-[11px] text-gray-400">Next.js & TypeScript</p>
            </div>
          </div>

          <div className="h-5 w-[1px] bg-gray-700/60 hidden sm:block" />

          {/* Asset Selectors */}
          <div className="hidden md:flex items-center gap-1">
            {MOCK_SYMBOLS.map((asset) => {
              const isActive = asset.symbol === selectedSymbol;
              return (
                <button
                  key={asset.symbol}
                  onClick={() => setSelectedSymbol(asset.symbol)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                    isActive
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/60 border border-transparent"
                  }`}
                >
                  {asset.symbol}
                </button>
              );
            })}
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-3">
          {/* Mobile Symbol Selector */}
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="md:hidden bg-[#1c2233] text-xs text-gray-200 border border-[#2d344d] rounded px-2 py-1 outline-none focus:border-emerald-500"
          >
            {MOCK_SYMBOLS.map((asset) => (
              <option key={asset.symbol} value={asset.symbol}>
                {asset.symbol}
              </option>
            ))}
          </select>

          {/* Timeframe Quick Switcher */}
          <div className="hidden lg:flex items-center bg-[#1c2233] rounded-md p-0.5 border border-[#2d344d]">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.label}
                onClick={() => setSelectedInterval(tf.value)}
                className={`px-2 py-0.5 text-xs rounded font-medium transition-all ${
                  selectedInterval === tf.value
                    ? "bg-emerald-500 text-gray-950 font-semibold shadow-sm"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium hidden sm:inline">Mock Datafeed Active</span>
            <span className="font-medium sm:hidden">Mock Live</span>
          </div>
        </div>
      </header>

      {/* Main Chart Workspace */}
      <section className="flex-1 w-full h-[calc(100vh-56px)] relative">
        <TradingChart
          key={`${selectedSymbol}-${selectedInterval}`}
          symbol={selectedSymbol}
          interval={selectedInterval}
          className="h-full w-full"
        />
      </section>
    </main>
  );
}
