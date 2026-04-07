"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { supabase, AccountSnapshot } from "@/lib/supabase";

type Range = "7D" | "30D" | "ALL";

export default function EquityCurve() {
  const [data, setData] = useState<AccountSnapshot[]>([]);
  const [range, setRange] = useState<Range>("30D");

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel("snapshots-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "account_snapshots" },
        (payload) => {
          setData((prev) => [...prev, payload.new as AccountSnapshot]);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchData() {
    const { data: snapshots } = await supabase
      .from("account_snapshots")
      .select("*")
      .order("created_at", { ascending: true });
    if (snapshots) setData(snapshots);
  }

  const now = Date.now();
  const rangeMs = {
    "7D": 7 * 24 * 60 * 60 * 1000,
    "30D": 30 * 24 * 60 * 60 * 1000,
    ALL: Infinity,
  };

  const filtered = data.filter(
    (s) => now - new Date(s.created_at).getTime() < rangeMs[range]
  );

  const chartData = filtered.map((s) => ({
    time: new Date(s.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    value: s.total_value_usdt,
  }));

  const latestValue = chartData.length > 0 ? chartData[chartData.length - 1].value : 100;
  const isProfit = latestValue >= 100;

  return (
    <div className="bg-card rounded-xl p-4 border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold">Equity Curve</h2>
        <div className="flex gap-1">
          {(["7D", "30D", "ALL"] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                range === r
                  ? "bg-white/10 text-white"
                  : "text-muted hover:text-white"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      {chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-muted text-sm">
          Bot just started — check back soon!
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={isProfit ? "#00ff88" : "#ff4444"}
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor={isProfit ? "#00ff88" : "#ff4444"}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              stroke="#333"
              tick={{ fill: "#888", fontSize: 11 }}
              tickLine={false}
            />
            <YAxis
              stroke="#333"
              tick={{ fill: "#888", fontSize: 11 }}
              tickLine={false}
              domain={["auto", "auto"]}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                background: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, "Value"]}
            />
            <ReferenceLine
              y={100}
              stroke="#444"
              strokeDasharray="3 3"
              label={{ value: "$100", fill: "#666", fontSize: 11 }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={isProfit ? "#00ff88" : "#ff4444"}
              strokeWidth={2}
              fill="url(#gradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
