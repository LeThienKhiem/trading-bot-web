"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Header() {
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    async function checkLiveness() {
      const { data } = await supabase
        .from("market_contexts")
        .select("created_at")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        const diff = Date.now() - new Date(data.created_at).getTime();
        setIsLive(diff < 5 * 60 * 60 * 1000); // Live if data < 5 hours old
      }
    }
    checkLiveness();
    const interval = setInterval(checkLiveness, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-white/5 px-4 py-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              BTC Trading Bot
            </h1>
            <span className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-white/5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isLive ? "bg-accent live-dot" : "bg-muted"
                }`}
              />
              {isLive ? "Live" : "Offline"}
            </span>
          </div>
          <p className="text-muted text-sm mt-0.5">
            Powered by Claude AI &middot; Started Apr 2026
          </p>
        </div>
        <div className="hidden sm:block text-right text-xs text-muted">
          <div>BTC/USDT Spot</div>
          <div>Binance</div>
        </div>
      </div>
    </header>
  );
}
