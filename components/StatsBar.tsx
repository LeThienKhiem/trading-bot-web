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

function Stat({
  label,
  value,
  color,
  isLast,
}: {
  label: string;
  value: string;
  color?: string;
  isLast?: boolean;
}) {
  return (
    <div
      className={`flex-1 text-center py-4 ${
        !isLast ? "border-r border-border" : ""
      }`}
    >
      <div className="font-sans font-light text-[10px] tracking-luxury uppercase text-subtle mb-2">
        {label}
      </div>
      <div
        className={`font-serif font-light text-2xl sm:text-3xl ${
          color || "text-primary"
        }`}
      >
        {value}
      </div>
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
      <div className="flex animate-fade-in">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`flex-1 text-center py-4 ${
              i < 4 ? "border-r border-border" : ""
            }`}
          >
            <div className="h-3 w-16 bg-border-light rounded mx-auto mb-3" />
            <div className="h-8 w-20 bg-border-light rounded mx-auto" />
          </div>
        ))}
      </div>
    );
  }

  const pnlColor =
    stats.allTimePnl > 0
      ? "text-positive"
      : stats.allTimePnl < 0
      ? "text-negative"
      : "text-primary";

  return (
    <div className="flex animate-fade-in-delay-1">
      <Stat
        label="Balance"
        value={`$${stats.currentBalance.toFixed(2)}`}
      />
      <Stat
        label="All-Time Return"
        value={`${stats.allTimePnl >= 0 ? "+" : ""}${stats.allTimePnl.toFixed(2)}%`}
        color={pnlColor}
      />
      <Stat
        label="Win Rate"
        value={`${stats.winRate.toFixed(1)}%`}
      />
      <Stat
        label="Trades"
        value={`${stats.totalTrades}`}
        isLast
      />
    </div>
  );
}
