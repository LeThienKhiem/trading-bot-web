import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const INITIAL_CAPITAL = 100;

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }
  const supabase = createClient(url, key);

  try {
    // Latest snapshot
    const { data: snapshot } = await supabase
      .from("account_snapshots")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const currentBalance = snapshot?.total_value_usdt ?? INITIAL_CAPITAL;
    const allTimePnl = ((currentBalance - INITIAL_CAPITAL) / INITIAL_CAPITAL) * 100;

    // Win rate from closed trades
    const { data: closedTrades } = await supabase
      .from("trades")
      .select("pnl_usdt")
      .not("pnl_usdt", "is", null);

    const totalClosed = closedTrades?.length ?? 0;
    const wins = closedTrades?.filter((t) => (t.pnl_usdt ?? 0) > 0).length ?? 0;
    const winRate = totalClosed > 0 ? (wins / totalClosed) * 100 : 0;

    // Avg strategy confidence from last 7 lessons
    const { data: lessons } = await supabase
      .from("daily_lessons")
      .select("*")
      .order("date", { ascending: false })
      .limit(7);

    // Strategy confidence is not directly stored, use wins as proxy
    const totalLessons = lessons?.length ?? 0;
    const avgConfidence = totalLessons > 0
      ? lessons!.reduce((sum, l) => sum + (l.wins ?? 0), 0) / totalLessons
      : 0;

    // Best day
    const { data: snapshots } = await supabase
      .from("account_snapshots")
      .select("daily_pnl_percent, created_at")
      .not("daily_pnl_percent", "is", null)
      .order("daily_pnl_percent", { ascending: false })
      .limit(1);

    const bestDay = snapshots?.[0]?.daily_pnl_percent ?? 0;

    // Current streak
    const { data: recentTrades } = await supabase
      .from("trades")
      .select("pnl_usdt, action")
      .not("pnl_usdt", "is", null)
      .order("created_at", { ascending: false })
      .limit(20);

    let streak = 0;
    let streakType: "win" | "loss" | "none" = "none";
    if (recentTrades && recentTrades.length > 0) {
      const first = (recentTrades[0].pnl_usdt ?? 0) > 0;
      streakType = first ? "win" : "loss";
      for (const t of recentTrades) {
        const isWin = (t.pnl_usdt ?? 0) > 0;
        if (isWin === first) streak++;
        else break;
      }
    }

    // Total trades
    const { count: totalTrades } = await supabase
      .from("trades")
      .select("*", { count: "exact", head: true })
      .neq("action", "HOLD");

    return NextResponse.json({
      currentBalance: Math.round(currentBalance * 100) / 100,
      allTimePnl: Math.round(allTimePnl * 100) / 100,
      winRate: Math.round(winRate * 10) / 10,
      avgConfidence: Math.round(avgConfidence * 10) / 10,
      bestDay: Math.round(bestDay * 100) / 100,
      streak,
      streakType,
      totalTrades: totalTrades ?? 0,
      totalClosed,
      wins,
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
