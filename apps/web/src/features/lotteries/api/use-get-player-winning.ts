import { zeroAddress } from "viem";
import { useChainId, useConnection, useReadContract } from "wagmi";
import { RAFFLE_CONTRACT_ADDRESSES } from "@/features/lotteries/constants/raffle-contract-addresses.constant";
import { raffleContractConfig } from "@/features/lotteries/contracts/raffle.contract";

export const useGetPlayerWinning = () => {
  const chainId = useChainId();
  const address = RAFFLE_CONTRACT_ADDRESSES[chainId];
  const { address: playerAddress } = useConnection();

  const r = useReadContract({
    address,
    ...raffleContractConfig,
    functionName: "getWinning",
    args: [playerAddress ?? zeroAddress],
    query: { enabled: Boolean(address) && Boolean(playerAddress) },
  });

  return r;
};
