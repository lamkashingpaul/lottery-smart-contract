import { zeroAddress } from "viem";
import { truncateAddress } from "@/features/common/utils/truncate-address";

export const formatRaffleWinner = (address: string): string => {
  if (address === zeroAddress) {
    return "No winner yet";
  }
  return truncateAddress(address);
};
