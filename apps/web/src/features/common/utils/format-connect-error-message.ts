import { ResourceUnavailableRpcError, UserRejectedRequestError } from "viem";
import { ConnectorAlreadyConnectedError } from "wagmi";

export const formatConnectErrorMessage = (error: unknown): string => {
  if (error instanceof ConnectorAlreadyConnectedError) {
    return "Your wallet is already connected. Please check your wallet and try again.";
  }

  if (error instanceof UserRejectedRequestError) {
    return "You rejected the connection request. Please try again and approve the connection in your wallet.";
  }

  if (error instanceof ResourceUnavailableRpcError) {
    return "The RPC resource is currently unavailable. Please check your network connection and try again.";
  }

  if (error && typeof error === "object" && "walk" in error) {
    const walkedError = error as {
      walk: (fn: (err: unknown) => boolean) => unknown;
    };

    const userRejectedError = walkedError.walk(
      (err) => err instanceof UserRejectedRequestError,
    );
    if (userRejectedError instanceof UserRejectedRequestError) {
      return "You rejected the connection request. Please try again and approve the connection in your wallet.";
    }

    const resourceUnavailableError = walkedError.walk(
      (err) => err instanceof ResourceUnavailableRpcError,
    );
    if (resourceUnavailableError instanceof ResourceUnavailableRpcError) {
      return "The RPC resource is currently unavailable. Please check your network connection and try again.";
    }
  }

  if (error instanceof Error) {
    return (
      error.message ||
      "An unknown error occurred while connecting to the wallet."
    );
  }

  return "An error occurred while connecting to the wallet. Please try again.";
};
