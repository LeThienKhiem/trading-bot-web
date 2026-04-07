"use client";

import { useEffect, useState } from "react";
import { supabase, Trade } from "@/lib/supabase";

const ACTION_STYLES: Record<string, { dot: string; text: string }> = {
  BUY: { dot: "bg-positive", text: "text-positive" },
  SELL: { dot: "bg-gold", text: "text-gold" },
  HOLD: { dot: "bg-neutral", text: "text-neutral" },
  BLOCKED: { dot: "bg-negative", text: "text-negative" },
};

export default function BrainLog() {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    fetchTrades();
    const channel = supabase
      .channel("brain-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "trades" },
        (payload) => {
          setTrades((prev) => [payload.new as Trade, ...prev].slice(0, 10));
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchTrades() {
    const { data } = await supabase
      .from("trades")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setTrades(data);
  }

  if (trades.length === 0) {
    return (
      <div className="bg-surface rounded-sm border border-border p-8 card-hover">
        <h2 className="font-serif font-normal italic text-lg text-primary mb-6">
          Decision Log
        </h2>
        <p className="font-sans font-light text-sm text-subtle">
          No decisions yet. The bot is warming up...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-sm border border-border p-8 card-hover animate-fade-in-delay-3">
      <h2 className="font-serif font-normal italic text-lg text-primary mb-6">
        Decision Log
      </h2>
      <div className="space-y-0 max-h-[420px] overflow-y-auto pr-2">
        {trades.map((trade, i) => {
          const style = ACTION_STYLES[trade.action] || ACTION_STYLES.HOLD;
          const pnl = trade.pnl_usdt;
          const hasPnl = pnl !== null && pnl !== undefined;

          return (
            <div
              key={trade.id}
              className={`py-5 animate-fade-in ${
                i < trades.length - 1 ? "border-b border-border-light" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                  <span
                    className={`font-sans font-normal text-[10px] tracking-luxury uppercase ${style.text}`}
                  >
                    {trade.action}
                  </span>
                  <span className="font-sans font-light text-[10px] text-subtle ml-1">
                    {trade.confidence}/10
                  </span>
                </div>
                {hasPnl && (
                  <span
                    className={`font-serif font-light text-sm ${
                      pnl > 0 ? "text-positive" : "text-negative"
                    }`}
                  >
                    {pnl > 0 ? "+" : ""}${pnl.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="font-sans font-light text-[10px] text-subtle mb-2">
                {new Date(trade.created_at).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {" \u2014 "}BTC ${trade.price_at_decision?.toLocaleString()}
              </div>
              <p className="font-sans font-light text-sm text-secondary leading-relaxed">
                {trade.reasoning}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
