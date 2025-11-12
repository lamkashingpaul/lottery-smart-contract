"use client";

import { useChainId, useReadContracts } from "wagmi";
import { RAFFLE_CONTRACT_ADDRESSES } from "@/features/lotteries/constants/raffle-contract-addresses.constant";
import { raffleContractConfig } from "@/features/lotteries/contracts/raffle.contract";

export const useReadRaffleDetails = () => {
  const chainId = useChainId();
  const address = RAFFLE_CONTRACT_ADDRESSES[chainId];
  const enabled = Boolean(address);

  const r = useReadContracts({
    contracts: [
      { address, ...raffleContractConfig, functionName: "getEntranceFee" },
      { address, ...raffleContractConfig, functionName: "getRecentWinner" },
      { address, ...raffleContractConfig, functionName: "getRaffleState" },
      { address, ...raffleContractConfig, functionName: "getNumberOfPlayers" },
      { address, ...raffleContractConfig, functionName: "getLastTimeStamp" },
      { address, ...raffleContractConfig, functionName: "getInterval" },
    ],
    query: { enabled },
  });

  return r;
};
