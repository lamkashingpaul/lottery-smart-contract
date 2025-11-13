import { MainHeader } from "@/features/common/components/main-header";
import { LotterySection } from "@/features/lotteries/components/lottery-section";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainHeader />
      <main className="relative flex-1">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 -right-1/4 size-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 -left-1/4 size-96 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-4 py-8">
          <LotterySection />
        </div>
      </main>
    </div>
  );
}
