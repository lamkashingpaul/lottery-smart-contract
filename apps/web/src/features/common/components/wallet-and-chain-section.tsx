import type { ReactNode } from "react";
import { useConnection } from "wagmi";
import { ConnectedCard } from "@/features/common/components/connected-card";
import { DisconnectedCard } from "@/features/common/components/disconnected-card";

export const WalletAndChainSection = () => {
  const { status } = useConnection();

  if (status === "disconnected") {
    return (
      <WalletAndChainSectionWrapper>
        <DisconnectedCard />
      </WalletAndChainSectionWrapper>
    );
  }

  return (
    <WalletAndChainSectionWrapper>
      <ConnectedCard />
    </WalletAndChainSectionWrapper>
  );
};

const WalletAndChainSectionWrapper = ({
  children,
}: {
  children: ReactNode;
}) => {
  return <div className="flex flex-col items-center gap-4">{children}</div>;
};
