import Header from "@/components/Header";
import StatsBar from "@/components/StatsBar";
import EquityCurve from "@/components/EquityCurve";
import MarketStatus from "@/components/MarketStatus";
import BrainLog from "@/components/BrainLog";
import TradeHistory from "@/components/TradeHistory";
import DailyLesson from "@/components/DailyLesson";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <StatsBar />
        <EquityCurve />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-2">
            <MarketStatus />
          </div>
          <div className="md:col-span-3">
            <BrainLog />
          </div>
        </div>
        <TradeHistory />
        <DailyLesson />
        <footer className="text-center text-xs text-muted py-6 border-t border-white/5">
          Self-learning trading bot powered by Claude AI &middot; Read-only dashboard &middot; Not financial advice
        </footer>
      </div>
    </main>
  );
}
