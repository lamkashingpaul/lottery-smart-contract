import { MainHeader } from "@/features/common/components/main-header";
import { LotterySection } from "@/features/lotteries/components/lottery-section";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainHeader />
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <LotterySection />
      </div>
    </div>
  );
}
