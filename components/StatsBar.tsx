"use client";

import { useEffect, useState } from "react";

type Stats = {
  currentBalance: number;
  allTimePnl: number;
  winRate: number;
  totalTrades: number;
  streak: number;
  streakType: "win" | "loss" | "none";
  wins: number;
  totalClosed: number;
};

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-card rounded-xl p-4 border border-white/5">
      <div className="text-muted text-xs uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className={`text-xl sm:text-2xl font-bold ${color || "text-white"}`}>
        {value}
      </div>
      {sub && <div className="text-muted text-xs mt-0.5">{sub}</div>}
    </div>
  );
}

export default function StatsBar() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) setStats(await res.json());
      } catch {}
    }
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-card rounded-xl p-4 border border-white/5 animate-pulse h-20"
          />
        ))}
      </div>
    );
  }

  const pnlColor = stats.allTimePnl >= 0 ? "text-accent" : "text-negative";
  const streakText =
    stats.streak > 0
      ? `${stats.streak} ${stats.streakType === "win" ? "W" : "L"} streak`
      : "No streak";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in">
      <StatCard
        label="Balance"
        value={`$${stats.currentBalance.toFixed(2)}`}
        sub={`${stats.totalTrades} total decisions`}
      />
      <StatCard
        label="All-Time P&L"
        value={`${stats.allTimePnl >= 0 ? "+" : ""}${stats.allTimePnl.toFixed(2)}%`}
        color={pnlColor}
        sub={`vs $100 initial`}
      />
      <StatCard
        label="Win Rate"
        value={`${stats.winRate.toFixed(1)}%`}
        sub={`${stats.wins}/${stats.totalClosed} closed`}
      />
      <StatCard label="Streak" value={streakText} sub="Recent trades" />
    </div>
  );
}
