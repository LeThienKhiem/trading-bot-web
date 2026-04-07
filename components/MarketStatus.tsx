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
      <div className="bg-surface rounded-sm border border-border p-8 card-hover">
        <h2 className="font-serif font-normal italic text-lg text-primary mb-6">
          Market Status
        </h2>
        <p className="font-sans font-light text-sm text-subtle">
          Awaiting first market data...
        </p>
      </div>
    );
  }

  const rows = [
    {
      label: "BTC / USDT",
      value: `$${market.btc_price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      large: true,
    },
    {
      label: "RSI (1h)",
      value: market.rsi_1h?.toFixed(1) ?? "N/A",
      color:
        (market.rsi_1h ?? 50) > 70
          ? "text-negative"
          : (market.rsi_1h ?? 50) < 30
          ? "text-positive"
          : undefined,
    },
    {
      label: "MACD",
      value: market.macd_signal ?? "N/A",
      color:
        market.macd_signal === "bullish"
          ? "text-positive"
          : market.macd_signal === "bearish"
          ? "text-negative"
          : undefined,
    },
    {
      label: "Fear & Greed",
      value: `${market.fear_greed_index ?? "N/A"} ${getFearLabel(market.fear_greed_index)}`,
    },
    {
      label: "Sentiment",
      value: market.news_sentiment ?? "N/A",
    },
  ];

  return (
    <div className="bg-surface rounded-sm border border-border p-8 card-hover animate-fade-in-delay-3">
      <h2 className="font-serif font-normal italic text-lg text-primary mb-6">
        Market Status
      </h2>
      <div className="space-y-0">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={`flex justify-between items-baseline py-3 ${
              i < rows.length - 1 ? "border-b border-border-light" : ""
            }`}
          >
            <span className="font-sans font-light text-[10px] tracking-luxury uppercase text-subtle">
              {row.label}
            </span>
            <span
              className={`font-sans font-normal tabular-nums ${
                row.large
                  ? "font-serif font-light text-xl text-primary"
                  : `text-sm ${row.color || "text-primary"}`
              }`}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-border-light">
        <span className="font-sans font-light text-[10px] text-subtle">
          Updated{" "}
          {new Date(market.created_at).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
