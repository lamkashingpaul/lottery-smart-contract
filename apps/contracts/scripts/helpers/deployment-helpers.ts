export const zeroAddress =
  `0x0000000000000000000000000000000000000000` as `0x${string}`;

export const zeroGasLane =
  `0x0000000000000000000000000000000000000000000000000000000000000000` as `0x${string}`;

export const developmentChainIds = new Set<number>([
  31337, // Hardhat
  1337, // Localhost
]);

export const isDevelopmentChain = (chainId?: number): boolean => {
  if (chainId === undefined) {
    throw new Error("Chain ID is undefined");
  }

  return developmentChainIds.has(chainId);
};
