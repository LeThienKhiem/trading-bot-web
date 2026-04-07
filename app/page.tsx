import Header from "@/components/Header";
import StatsBar from "@/components/StatsBar";
import EquityCurve from "@/components/EquityCurve";
import MarketStatus from "@/components/MarketStatus";
import BrainLog from "@/components/BrainLog";
import TradeHistory from "@/components/TradeHistory";
import DailyLesson from "@/components/DailyLesson";

export default function Home() {
  return (
    <main className="min-h-screen bg-bg">
      <Header />

      <div className="max-w-[1200px] mx-auto px-6">
        {/* Stats */}
        <section className="py-12 border-b border-border">
          <StatsBar />
        </section>

        {/* Equity Curve */}
        <section className="py-16">
          <EquityCurve />
        </section>

        {/* Market Status + Brain Log */}
        <section className="pb-16">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="md:col-span-2">
              <MarketStatus />
            </div>
            <div className="md:col-span-3">
              <BrainLog />
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Trade History */}
        <section className="py-16">
          <TradeHistory />
        </section>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Daily Lesson */}
        <section className="py-20">
          <DailyLesson />
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-12 text-center">
          <p className="font-sans font-light text-[10px] tracking-luxury uppercase text-subtle">
            AlphaBot &middot; Autonomous Trading Intelligence &middot; Read-only Dashboard
          </p>
          <p className="font-sans font-light text-[10px] text-subtle mt-1">
            Not financial advice
          </p>
        </footer>
      </div>
    </main>
  );
}
