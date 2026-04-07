"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Header() {
  const [isLive, setIsLive] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
        setIsLive(diff < 5 * 60 * 60 * 1000);
      }
    }
    checkLiveness();
    const interval = setInterval(checkLiveness, 60000);

    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => {
      clearInterval(interval);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 bg-surface border-b border-border transition-shadow duration-500 ${
        scrolled ? "shadow-[0_1px_20px_rgba(0,0,0,0.04)]" : ""
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="font-serif font-light text-2xl tracking-luxury-wide text-primary uppercase">
            AlphaBot
          </h1>
          <p className="font-sans font-light text-[10px] tracking-luxury uppercase text-subtle mt-0.5">
            Autonomous Trading Intelligence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isLive ? "bg-gold live-dot" : "bg-subtle"
            }`}
          />
          <span className="font-sans font-light text-[10px] tracking-luxury uppercase text-gold">
            {isLive ? "Live" : "Offline"}
          </span>
        </div>
      </div>
    </header>
  );
}
