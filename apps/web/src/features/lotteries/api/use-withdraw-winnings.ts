import { useQueryClient } from "@tanstack/react-query";
import { useChainId, useWriteContract } from "wagmi";
import { RAFFLE_CONTRACT_ADDRESSES } from "@/features/lotteries/constants/raffle-contract-addresses.constant";
import { raffleContractConfig } from "@/features/lotteries/contracts/raffle.contract";

export const useWithdrawWinnings = () => {
  const queryClient = useQueryClient();
  const chainId = useChainId();
  const address = RAFFLE_CONTRACT_ADDRESSES[chainId];

  const w = useWriteContract();

  const withdrawWinnings = async () => {
    if (!address) {
      throw new Error(
        "Raffle contract address not found for the current chain.",
      );
    }

    await w.mutateAsync({
      address,
      abi: raffleContractConfig.abi,
      functionName: "withdrawWinnings",
    });

    // Invalidate all queries to refresh player winnings
    await queryClient.invalidateQueries();
  };

  return { w, withdrawWinnings };
};
