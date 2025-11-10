import { MainHeader } from "@/features/common/components/main-header";
import { LotterySection } from "@/features/lotteries/components/lottery-section";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainHeader />
      <LotterySection />
    </div>
  );
}
