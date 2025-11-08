import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { hardhat, mainnet, sepolia } from "wagmi/chains";

export const getWagmiConfig = () => {
  return createConfig({
    chains: [hardhat, sepolia, mainnet],
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports: {
      [hardhat.id]: http(),
      [sepolia.id]: http(),
      [mainnet.id]: http(),
    },
  });
};

declare module "wagmi" {
  interface Register {
    config: ReturnType<typeof getWagmiConfig>;
  }
}
