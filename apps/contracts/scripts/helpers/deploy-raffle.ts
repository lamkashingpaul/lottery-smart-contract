import type { NetworkConnection } from "hardhat/types/network";
import RaffleModule from "../../ignition/modules/Raffle.js";
import type { MyVRFCoordinatorV25Mock } from "./deploy-my-vrf-coordinator-v2-5-mock.js";
import { isDevelopmentChain } from "./deployment-helpers.js";
import { verifyContractAfterDeployment } from "./verify-contract-after-deployment.js";

export const deployRaffle = async (
  connection: NetworkConnection,
  vrfCoordinator: MyVRFCoordinatorV25Mock,
  entranceFee: bigint,
  gasLane: string,
  subscriptionId: bigint,
  callbackGasLimit: number,
  interval: bigint,
) => {
  const { networkName, networkConfig, ignition, viem } = connection;
  const chainId = networkConfig.chainId;

  console.log(`Deploying Raffle on ${networkName} network...`);
  const { raffle } = await ignition.deploy(RaffleModule, {
    parameters: {
      Raffle: {
        vrfCoordinator: vrfCoordinator.address,
        entranceFee,
        gasLane,
        subscriptionId,
        callbackGasLimit,
        interval,
      },
    },
  });
  const raffleAddress = raffle.address;
  console.log(`Raffle deployed at: ${raffleAddress}`);

  if (isDevelopmentChain(chainId)) {
    const publicClient = await viem.getPublicClient();
    const transactionHash = await vrfCoordinator.write.addConsumer([
      subscriptionId,
      raffleAddress,
    ]);
    await publicClient.waitForTransactionReceipt({ hash: transactionHash });
    console.log(
      `Raffle added as consumer to VRF subscription ID ${subscriptionId}`,
    );
  }

  if (!isDevelopmentChain(chainId) && process.env.ETHERSCAN_API_KEY) {
    await verifyContractAfterDeployment({
      address: raffleAddress,
      constructorArgs: [
        vrfCoordinator.address,
        entranceFee,
        gasLane,
        subscriptionId,
        callbackGasLimit,
        interval,
      ],
    });
  }

  return raffle;
};
