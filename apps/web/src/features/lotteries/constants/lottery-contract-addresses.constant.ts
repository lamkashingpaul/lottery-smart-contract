import type { Address } from "viem";
import { hardhat, mainnet, sepolia } from "wagmi/chains";
import type { ChainId } from "@/features/common/types/chain-id.type";

export type LotteryContractAddresses = {
  [chainId in ChainId]?: Address;
};

export const lotteryContractAddresses: LotteryContractAddresses = {
  [hardhat.id]: process.env
    .NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS_HARDHAT as Address,
  [sepolia.id]: process.env
    .NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS_SEPOLIA as Address,
  [mainnet.id]: process.env
    .NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS_MAINNET as Address,
};
