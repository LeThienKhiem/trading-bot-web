import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : (null as unknown as ReturnType<typeof createClient>);

export type Trade = {
  id: string;
  created_at: string;
  action: "BUY" | "SELL" | "HOLD" | "BLOCKED";
  symbol: string;
  price_at_decision: number;
  quantity_usdt: number;
  reasoning: string;
  confidence: number;
  suggested_stop_loss: number;
  status: string;
  exit_price: number | null;
  pnl_usdt: number | null;
  pnl_percent: number | null;
};

export type DailyLesson = {
  id: string;
  date: string;
  total_trades: number;
  wins: number;
  losses: number;
  lesson_text: string;
  pattern_identified: string | null;
  adjustment_made: string | null;
};

export type AccountSnapshot = {
  id: string;
  created_at: string;
  usdt_balance: number;
  btc_balance: number;
  total_value_usdt: number;
  daily_pnl_percent: number | null;
};

export type MarketContext = {
  id: string;
  created_at: string;
  btc_price: number;
  rsi_1h: number | null;
  macd_signal: string | null;
  fear_greed_index: number | null;
  top_news_headlines: string | null;
  news_sentiment: string | null;
};
