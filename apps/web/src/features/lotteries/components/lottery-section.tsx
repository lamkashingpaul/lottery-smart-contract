"use client";

import { cn } from "@workspace/ui/lib/utils";
import type { HTMLProps, ReactNode } from "react";
import { useConnection } from "wagmi";
import { ConnectedCard } from "@/features/common/components/connected-card";
import { DisconnectedCard } from "@/features/common/components/disconnected-card";
import { LotteryDashboardCard } from "@/features/lotteries/components/lottery-dashboard-card";

type LotterySectionWrapperProps = {
  children: ReactNode;
  className?: HTMLProps<HTMLDivElement>["className"];
};

export const LotterySection = () => {
  const { isConnected } = useConnection();

  if (!isConnected) {
    return (
      <LotterySectionWrapper className="justify-center">
        <DisconnectedCard />
      </LotterySectionWrapper>
    );
  }

  return (
    <LotterySectionWrapper className="justify-start">
      <ConnectedCard />
      <LotteryDashboardCard />
    </LotterySectionWrapper>
  );
};

const LotterySectionWrapper = (props: LotterySectionWrapperProps) => {
  const { children, className } = props;

  return (
    <div
      className={cn("flex flex-1 flex-col items-center gap-4 p-4", className)}
    >
      {children}
    </div>
  );
};
