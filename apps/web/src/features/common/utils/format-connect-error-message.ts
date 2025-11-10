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
  if (error instanceof Error) {
    return (
      error.message ||
      "An unknown error occurred while connecting to the wallet."
    );
  }
  return "An error occurred while connecting to the wallet. Please try again.";
};
