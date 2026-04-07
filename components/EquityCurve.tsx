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

  return (
    <div className="bg-surface rounded-sm border border-border p-8 sm:p-10 card-hover animate-fade-in-delay-2">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-serif font-normal italic text-lg text-primary">
          Portfolio Value
        </h2>
        <div className="flex gap-1">
          {(["7D", "30D", "ALL"] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-1.5 text-[10px] tracking-luxury uppercase font-sans font-light rounded-full transition-all duration-300 ${
                range === r
                  ? "bg-gold text-white"
                  : "text-subtle hover:text-primary"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      {chartData.length === 0 ? (
        <div className="h-72 flex flex-col items-center justify-center">
          <p className="font-serif font-light italic text-secondary text-lg">
            The bot begins its journey.
          </p>
          <p className="font-sans font-light text-xs text-subtle mt-2">
            Performance data will appear with each trade cycle.
          </p>
          <div className="w-12 h-px bg-gold mt-6" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#B8975A" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#B8975A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              stroke="#F0EDE8"
              tick={{ fill: "#A09890", fontSize: 11, fontFamily: "Inter" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#F0EDE8"
              tick={{ fill: "#A09890", fontSize: 11, fontFamily: "Inter" }}
              tickLine={false}
              axisLine={false}
              domain={["auto", "auto"]}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                background: "#FFFFFF",
                border: "1px solid #E8E4DE",
                borderRadius: "2px",
                fontSize: "12px",
                fontFamily: "Inter",
                boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, "Value"]}
            />
            <ReferenceLine
              y={100}
              stroke="#E8E4DE"
              strokeDasharray="4 4"
              label={{
                value: "$100",
                fill: "#A09890",
                fontSize: 11,
                fontFamily: "Inter",
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#B8975A"
              strokeWidth={2}
              fill="url(#goldGradient)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
