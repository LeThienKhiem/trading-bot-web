"use client";

import { useEffect, useState } from "react";
import { supabase, Trade } from "@/lib/supabase";

export default function TradeHistory() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetchTrades();
    const channel = supabase
      .channel("trades-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trades" },
        () => fetchTrades()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchTrades() {
    const { data } = await supabase
      .from("trades")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setTrades(data);
  }

  const actionColors: Record<string, string> = {
    BUY: "text-positive",
    SELL: "text-gold",
    HOLD: "text-neutral",
    BLOCKED: "text-negative",
  };

  if (trades.length === 0) {
    return (
      <div className="bg-surface rounded-sm border border-border p-8 card-hover">
        <h2 className="font-serif font-normal italic text-lg text-primary mb-6">
          Trade History
        </h2>
        <p className="font-sans font-light text-sm text-subtle">
          No trades recorded yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-sm border border-border p-8 sm:p-10 card-hover animate-fade-in-delay-4">
      <h2 className="font-serif font-normal italic text-lg text-primary mb-8">
        Trade History
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 pr-4 font-sans font-light text-[10px] tracking-luxury uppercase text-subtle">
                Time
              </th>
              <th className="text-left py-3 pr-4 font-sans font-light text-[10px] tracking-luxury uppercase text-subtle">
                Action
              </th>
              <th className="text-right py-3 pr-4 font-sans font-light text-[10px] tracking-luxury uppercase text-subtle">
                Price
              </th>
              <th className="text-right py-3 pr-4 font-sans font-light text-[10px] tracking-luxury uppercase text-subtle hidden sm:table-cell">
                Confidence
              </th>
              <th className="text-right py-3 pr-4 font-sans font-light text-[10px] tracking-luxury uppercase text-subtle">
                P&L
              </th>
              <th className="text-right py-3 font-sans font-light text-[10px] tracking-luxury uppercase text-subtle">
                Return
              </th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => {
              const pnl = trade.pnl_usdt;
              const pnlPct = trade.pnl_percent;
              const isExpanded = expanded === trade.id;
              const pnlColor =
                pnl === null
                  ? "text-subtle"
                  : pnl > 0
                  ? "text-positive"
                  : pnl < 0
                  ? "text-negative"
                  : "text-subtle";

              return (
                <>
                  <tr
                    key={trade.id}
                    onClick={() => setExpanded(isExpanded ? null : trade.id)}
                    className="cursor-pointer hover:bg-surface-alt transition-colors duration-200"
                  >
                    <td className="py-3.5 pr-4 font-sans font-light text-xs text-secondary tabular-nums whitespace-nowrap">
                      {new Date(trade.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      {new Date(trade.created_at).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3.5 pr-4">
                      <span
                        className={`font-sans font-normal text-xs tracking-wider uppercase ${
                          actionColors[trade.action] || "text-subtle"
                        }`}
                      >
                        {trade.action}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-right font-sans font-normal text-sm text-primary tabular-nums">
                      ${trade.price_at_decision?.toLocaleString()}
                    </td>
                    <td className="py-3.5 pr-4 text-right font-sans font-light text-xs text-subtle hidden sm:table-cell">
                      {trade.confidence}/10
                    </td>
                    <td className={`py-3.5 pr-4 text-right font-serif font-light text-sm tabular-nums ${pnlColor}`}>
                      {pnl !== null
                        ? `${pnl > 0 ? "+" : ""}$${pnl.toFixed(2)}`
                        : "\u2014"}
                    </td>
                    <td className={`py-3.5 text-right font-serif font-light text-sm tabular-nums ${pnlColor}`}>
                      {pnlPct !== null
                        ? `${pnlPct > 0 ? "+" : ""}${pnlPct.toFixed(2)}%`
                        : "\u2014"}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${trade.id}-detail`}>
                      <td colSpan={6} className="py-4 px-6 bg-surface-alt">
                        <div className="font-sans font-light text-[10px] tracking-luxury uppercase text-subtle mb-2">
                          Claude&apos;s Reasoning
                        </div>
                        <p className="font-sans font-light text-sm text-secondary leading-relaxed italic">
                          {trade.reasoning}
                        </p>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
