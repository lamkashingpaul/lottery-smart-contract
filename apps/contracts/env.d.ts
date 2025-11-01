declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TZ: "UTC";
      NODE_ENV: "development" | "production" | "test";

      ETHERSCAN_API_KEY: string;
      SEPOLIA_RPC_URL: string;
      SEPOLIA_PRIVATE_KEY: string;

      SEPOLIA_VRF_COORDINATOR_ADDRESS: `0x${string}`;
      SEPOLIA_RAFFLE_ENTRANCE_FEE: string;
      SEPOLIA_RAFFLE_GAS_LANE: `0x${string}`;
      SEPOLIA_RAFFLE_SUBSCRIPTION_ID: string;
      SEPOLIA_RAFFLE_CALLBACK_GAS_LIMIT: string;
      SEPOLIA_RAFFLE_INTERVAL: string;
    }
  }
}
export {};
