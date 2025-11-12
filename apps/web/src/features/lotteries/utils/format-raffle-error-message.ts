import {
  ContractFunctionExecutionError,
  InsufficientFundsError,
  TransactionExecutionError,
  UserRejectedRequestError,
} from "viem";

export const formatRaffleErrorMessage = (error: unknown): string => {
  if (error instanceof ContractFunctionExecutionError) {
    const baseError = error.walk(
      (err) => err instanceof UserRejectedRequestError,
    );
    if (baseError instanceof UserRejectedRequestError) {
      return "You rejected the transaction. Please try again and approve the transaction in your wallet.";
    }

    const insufficientFundsError = error.walk(
      (err) => err instanceof InsufficientFundsError,
    );
    if (insufficientFundsError instanceof InsufficientFundsError) {
      return "Insufficient funds to enter the raffle. Please ensure you have enough ETH to cover the entrance fee and gas costs.";
    }

    return error.shortMessage || "An error occurred while entering the raffle.";
  }

  if (error instanceof TransactionExecutionError) {
    const baseError = error.walk(
      (err) => err instanceof UserRejectedRequestError,
    );
    if (baseError instanceof UserRejectedRequestError) {
      return "You rejected the transaction. Please try again and approve the transaction in your wallet.";
    }
  }

  if (error instanceof UserRejectedRequestError) {
    return "You rejected the transaction. Please try again and approve the transaction in your wallet.";
  }

  if (error instanceof InsufficientFundsError) {
    return "Insufficient funds to enter the raffle. Please ensure you have enough ETH to cover the entrance fee and gas costs.";
  }

  if (error instanceof Error) {
    return (
      error.message || "An unknown error occurred while entering the raffle."
    );
  }

  return "An error occurred while entering the raffle. Please try again.";
};
