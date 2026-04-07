"use client";

import { useEffect, useState } from "react";
import { supabase, MarketContext } from "@/lib/supabase";

function getFearLabel(index: number | null): string {
  if (index === null) return "N/A";
  if (index <= 25) return "Extreme Fear";
  if (index <= 45) return "Fear";
  if (index <= 55) return "Neutral";
  if (index <= 75) return "Greed";
  return "Extreme Greed";
}

function getFearColor(index: number | null): string {
  if (index === null) return "text-muted";
  if (index <= 25) return "text-negative";
  if (index <= 45) return "text-orange-400";
  if (index <= 55) return "text-yellow-400";
  if (index <= 75) return "text-accent";
  return "text-accent";
}

export default function MarketStatus() {
  const [market, setMarket] = useState<MarketContext | null>(null);

  useEffect(() => {
    fetchLatest();
    const channel = supabase
      .channel("market-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "market_contexts" },
        (payload) => setMarket(payload.new as MarketContext)
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchLatest() {
    const { data } = await supabase
      .from("market_contexts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (data) setMarket(data);
  }

  if (!market) {
    return (
      <div className="bg-card rounded-xl p-4 border border-white/5">
        <h2 className="text-white font-semibold mb-3">Market Status</h2>
        <p className="text-muted text-sm">Waiting for market data...</p>
      </div>
    );
  }

  const sentimentEmoji = {
    positive: "🟢",
    negative: "🔴",
    neutral: "⚪",
  }[market.news_sentiment ?? "neutral"] ?? "⚪";

  return (
    <div className="bg-card rounded-xl p-4 border border-white/5">
      <h2 className="text-white font-semibold mb-3">Market Status</h2>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-muted text-sm">BTC Price</span>
          <span className="text-white font-mono font-semibold">
            ${market.btc_price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted text-sm">RSI (1h)</span>
          <span
            className={`font-mono ${
              (market.rsi_1h ?? 50) > 70
                ? "text-negative"
                : (market.rsi_1h ?? 50) < 30
                ? "text-accent"
                : "text-white"
            }`}
          >
            {market.rsi_1h?.toFixed(1) ?? "N/A"}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted text-sm">MACD</span>
          <span
            className={`text-sm font-medium ${
              market.macd_signal === "bullish"
                ? "text-accent"
                : market.macd_signal === "bearish"
                ? "text-negative"
                : "text-muted"
            }`}
          >
            {market.macd_signal ?? "N/A"}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted text-sm">Fear & Greed</span>
          <span className={`font-mono ${getFearColor(market.fear_greed_index)}`}>
            {market.fear_greed_index ?? "N/A"}{" "}
            <span className="text-xs">{getFearLabel(market.fear_greed_index)}</span>
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted text-sm">Sentiment</span>
          <span className="text-sm">
            {sentimentEmoji} {market.news_sentiment ?? "N/A"}
          </span>
        </div>
        <div className="pt-2 border-t border-white/5 text-xs text-muted">
          Updated{" "}
          {new Date(market.created_at).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}
