import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TradingView Next.js Chart - Advanced Charting Library",
  description:
    "A clean, standalone TradingView Advanced Charting Library implementation with Next.js, TypeScript, and simulated real-time mock datafeed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0b0e14] text-gray-100 min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}
