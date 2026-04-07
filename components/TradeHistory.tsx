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
    BUY: "text-accent",
    SELL: "text-yellow-400",
    HOLD: "text-muted",
    BLOCKED: "text-negative",
  };

  if (trades.length === 0) {
    return (
      <div className="bg-card rounded-xl p-4 border border-white/5">
        <h2 className="text-white font-semibold mb-3">Trade History</h2>
        <p className="text-muted text-sm">No trades yet. Bot is warming up...</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-4 border border-white/5">
      <h2 className="text-white font-semibold mb-3">Trade History</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted text-xs uppercase tracking-wider border-b border-white/5">
              <th className="text-left py-2 pr-2">Time</th>
              <th className="text-left py-2 pr-2">Action</th>
              <th className="text-right py-2 pr-2">BTC Price</th>
              <th className="text-right py-2 pr-2">Conf</th>
              <th className="text-right py-2 pr-2">P&L</th>
              <th className="text-right py-2">%</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => {
              const pnl = trade.pnl_usdt;
              const pnlPct = trade.pnl_percent;
              const isExpanded = expanded === trade.id;

              return (
                <>
                  <tr
                    key={trade.id}
                    onClick={() =>
                      setExpanded(isExpanded ? null : trade.id)
                    }
                    className="border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <td className="py-2 pr-2 text-muted text-xs whitespace-nowrap">
                      {new Date(trade.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      {new Date(trade.created_at).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-2 pr-2">
                      <span
                        className={`font-medium ${
                          actionColors[trade.action] || "text-muted"
                        }`}
                      >
                        {trade.action}
                      </span>
                    </td>
                    <td className="py-2 pr-2 text-right font-mono text-white">
                      ${trade.price_at_decision?.toLocaleString()}
                    </td>
                    <td className="py-2 pr-2 text-right text-muted">
                      {trade.confidence}/10
                    </td>
                    <td
                      className={`py-2 pr-2 text-right font-mono ${
                        pnl === null
                          ? "text-muted"
                          : pnl > 0
                          ? "text-accent"
                          : pnl < 0
                          ? "text-negative"
                          : "text-muted"
                      }`}
                    >
                      {pnl !== null ? `${pnl > 0 ? "+" : ""}$${pnl.toFixed(2)}` : "—"}
                    </td>
                    <td
                      className={`py-2 text-right font-mono ${
                        pnlPct === null
                          ? "text-muted"
                          : pnlPct > 0
                          ? "text-accent"
                          : pnlPct < 0
                          ? "text-negative"
                          : "text-muted"
                      }`}
                    >
                      {pnlPct !== null
                        ? `${pnlPct > 0 ? "+" : ""}${pnlPct.toFixed(2)}%`
                        : "—"}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${trade.id}-detail`}>
                      <td
                        colSpan={6}
                        className="py-3 px-3 bg-white/5 text-sm text-gray-300"
                      >
                        <div className="font-medium text-xs text-muted mb-1 uppercase">
                          Claude&apos;s Reasoning
                        </div>
                        {trade.reasoning}
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
