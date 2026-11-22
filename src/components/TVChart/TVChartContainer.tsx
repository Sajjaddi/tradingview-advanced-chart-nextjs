"use client";

import {
  ChartingLibraryWidgetOptions,
  IChartingLibraryWidget,
  ResolutionString,
  widget,
} from "@/libraries/charting_library";
import {
  chartOverrides,
  disabledFeatures,
  enabledFeatures,
} from "@/utils/constants";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { getMockDataFeed } from "./datafeed";

export type TVChartContainerProps = {
  symbol?: string;
  interval?: ResolutionString;
  className?: string;
};

export const TVChartContainer = ({
  symbol = "BTC/USD",
  interval = "1D" as ResolutionString,
  className,
}: TVChartContainerProps) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const tvWidgetRef = useRef<IChartingLibraryWidget | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!chartContainerRef.current) {
      return;
    }

    if (tvWidgetRef.current) {
      tvWidgetRef.current.remove();
      tvWidgetRef.current = null;
    }

    setIsLoading(true);

    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: symbol,
      debug: false,
      datafeed: getMockDataFeed(),
      theme: "dark",
      locale: "en",
      container: chartContainerRef.current,
      library_path: "/libraries/charting_library/",
      loading_screen: {
        backgroundColor: "#111114",
        foregroundColor: "#47D0A5",
      },
      enabled_features: enabledFeatures,
      disabled_features: disabledFeatures,
      client_id: "tradingview.com",
      user_id: "public_user_id",
      fullscreen: false,
      autosize: true,
      custom_css_url: "/tradingview-chart.css",
      overrides: chartOverrides,
      interval: interval,
    };

    const tvWidget = new widget(widgetOptions);
    tvWidgetRef.current = tvWidget;

    tvWidget.onChartReady(() => {
      setIsLoading(false);
      try {
        const priceScale = tvWidget
          .activeChart()
          .getPanes()[0]
          ?.getMainSourcePriceScale();
        priceScale?.setAutoScale(true);
      } catch (e) {
        console.error("Error setting autoscale", e);
      }
    });

    return () => {
      if (tvWidgetRef.current) {
        tvWidgetRef.current.remove();
        tvWidgetRef.current = null;
      }
    };
  }, [symbol, interval]);

  return (
    <div className={twMerge("relative w-full h-full min-h-[500px]", className)}>
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#111114] text-gray-300">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mb-3" />
          <span className="text-sm font-medium tracking-wide">
            Loading Chart ({symbol})...
          </span>
        </div>
      )}
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
};
