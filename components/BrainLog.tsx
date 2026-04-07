"use client";

import { useEffect, useState } from "react";
import { supabase, Trade } from "@/lib/supabase";

const ACTION_STYLES: Record<string, { emoji: string; color: string; bg: string }> = {
  BUY: { emoji: "🟢", color: "text-accent", bg: "bg-accent/10" },
  SELL: { emoji: "🟡", color: "text-yellow-400", bg: "bg-yellow-400/10" },
  HOLD: { emoji: "⏸️", color: "text-muted", bg: "bg-white/5" },
  BLOCKED: { emoji: "🚫", color: "text-negative", bg: "bg-negative/10" },
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
      <div className="bg-card rounded-xl p-4 border border-white/5">
        <h2 className="text-white font-semibold mb-3">Brain Log</h2>
        <p className="text-muted text-sm">No decisions yet. Bot is warming up...</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-4 border border-white/5">
      <h2 className="text-white font-semibold mb-3">Brain Log</h2>
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {trades.map((trade) => {
          const style = ACTION_STYLES[trade.action] || ACTION_STYLES.HOLD;
          const pnl = trade.pnl_usdt;
          const hasPnl = pnl !== null && pnl !== undefined;

          return (
            <div
              key={trade.id}
              className={`${style.bg} rounded-lg p-3 border border-white/5 animate-fade-in`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`font-semibold text-sm ${style.color}`}>
                  {style.emoji} {trade.action}
                </span>
                <span className="text-xs text-muted">
                  Confidence: {trade.confidence}/10
                </span>
              </div>
              <div className="text-xs text-muted mb-2">
                {new Date(trade.created_at).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZoneName: "short",
                })}
                {" | "}BTC ${trade.price_at_decision?.toLocaleString()}
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                &ldquo;{trade.reasoning}&rdquo;
              </p>
              {hasPnl && (
                <div
                  className={`mt-2 text-xs font-medium ${
                    pnl > 0 ? "text-accent" : "text-negative"
                  }`}
                >
                  Result: {pnl > 0 ? "+" : ""}${pnl.toFixed(2)} (
                  {trade.pnl_percent != null
                    ? `${trade.pnl_percent > 0 ? "+" : ""}${trade.pnl_percent.toFixed(2)}%`
                    : ""}
                  ) {pnl > 0 ? "✅" : "❌"}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
