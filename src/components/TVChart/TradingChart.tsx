"use client";

import dynamic from "next/dynamic";
import React from "react";
import { ResolutionString } from "@/libraries/charting_library";

const TVChartContainer = dynamic(
  () =>
    import("@/components/TVChart/TVChartContainer").then(
      (mod) => mod.TVChartContainer
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center bg-[#111114] text-gray-400">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-sm font-medium">Initializing TradingView Chart...</span>
      </div>
    ),
  }
);

export interface TradingChartProps {
  symbol?: string;
  interval?: ResolutionString;
  className?: string;
}

export const TradingChart: React.FC<TradingChartProps> = ({
  symbol = "BTC/USD",
  interval = "1D" as ResolutionString,
  className,
}) => {
  return (
    <TVChartContainer
      symbol={symbol}
      interval={interval}
      className={className}
    />
  );
};

export default TradingChart;
