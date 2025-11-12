import { useQueryClient } from "@tanstack/react-query";
import { useChainId, useWriteContract } from "wagmi";
import { useReadRaffleDetails } from "@/features/lotteries/api/use-read-raffle-details";
import { RAFFLE_CONTRACT_ADDRESSES } from "@/features/lotteries/constants/raffle-contract-addresses.constant";
import { raffleContractConfig } from "@/features/lotteries/contracts/raffle.contract";

export const useEnterRaffle = () => {
  const queryClient = useQueryClient();
  const chainId = useChainId();
  const address = RAFFLE_CONTRACT_ADDRESSES[chainId];
  const { data, queryKey } = useReadRaffleDetails();

  const w = useWriteContract();

  const enterRaffle = async () => {
    if (!address) {
      throw new Error(
        "Raffle contract address not found for the current chain.",
      );
    }

    const entranceFee = data?.[0].result;
    if (entranceFee === undefined) {
      throw new Error("Entrance fee not found in raffle details.");
    }

    await w.mutateAsync({
      address,
      abi: raffleContractConfig.abi,
      functionName: "enterRaffle",
      value: entranceFee,
    });
    await queryClient.invalidateQueries({ queryKey });
  };

  return { w, enterRaffle };
};
