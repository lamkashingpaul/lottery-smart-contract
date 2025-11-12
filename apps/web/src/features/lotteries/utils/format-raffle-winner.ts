import { ZERO_ADDRESS } from "@/features/common/constants/zero-address";
import { truncateAddress } from "@/features/common/utils/truncate-address";

export const formatRaffleWinner = (address: string): string => {
  if (address === ZERO_ADDRESS) {
    return "No winner yet";
  }
  return truncateAddress(address);
};
