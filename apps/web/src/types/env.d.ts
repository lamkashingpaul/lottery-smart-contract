export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TZ: "UTC";
      NODE_ENV: NodeJS.ProcessEnv;

      NEXT_PUBLIC_SITE_AUTHOR_NAME: string;
      NEXT_PUBLIC_SITE_AUTHOR_LINKEDIN_URL: string;
      NEXT_PUBLIC_SITE_AUTHOR_GITHUB_URL: string;

      NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS_HARDHAT?: string;
      NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS_SEPOLIA?: string;
      NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS_MAINNET?: string;
    }
  }
}
