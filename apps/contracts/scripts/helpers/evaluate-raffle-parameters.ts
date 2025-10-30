import type { NetworkConnection } from "hardhat/types/network";
import { decodeEventLog, getContract, parseEther } from "viem";
import {
  deployMyVRFCoordinatorV2_5Mock,
  type MyVRFCoordinatorV2_5Mock,
} from "./deploy-my-vrf-coordinator-v2-5-mock.js";
import { isDevelopmentChain } from "./deployment-helpers.js";

export const evaluateRaffleParameters = async (
  connection: NetworkConnection,
) => {
  const { networkConfig, viem } = connection;
  const chainId = networkConfig.chainId;
  const publicClient = await viem.getPublicClient();

  if (isDevelopmentChain(chainId)) {
    const myVRFCoordinatorV2_5Mock =
      await deployMyVRFCoordinatorV2_5Mock(connection);
    const transactionHash =
      await myVRFCoordinatorV2_5Mock.write.createSubscription();
    const transactionReceipt = await publicClient.waitForTransactionReceipt({
      hash: transactionHash,
    });
    if (!transactionReceipt) {
      throw new Error("Transaction receipt is undefined");
    }
    const firstEventLog = transactionReceipt.logs[0];
    const decodedLog = decodeEventLog({
      abi: [myVRFCoordinatorV2_5Mock.abi[31]],
      data: firstEventLog.data,
      topics: firstEventLog.topics,
    });
    const subscriptionId = decodedLog.args.subId;
    await myVRFCoordinatorV2_5Mock.write.fundSubscription([
      subscriptionId,
      parseEther("100"),
    ]);

    return {
      vrfCoordinator: myVRFCoordinatorV2_5Mock,
      entranceFee: parseEther("0.01"),
      gasLane: `0x0000000000000000000000000000000000000000000000000000000000000000`,
      subscriptionId,
      callbackGasLimit: BigInt(500000),
      interval: BigInt(30),
    };
  }

  if (chainId === 11155111) {
    const vrfCoordinatorAddress = process.env.SEPOLIA_VRF_COORDINATOR_ADDRESS;
    const entranceFee = process.env.SEPOLIA_RAFFLE_ENTRANCE_FEE;
    const gasLane = process.env.SEPOLIA_RAFFLE_GAS_LANE;
    const subscriptionId = process.env.SEPOLIA_RAFFLE_SUBSCRIPTION_ID;
    const callbackGasLimit = process.env.SEPOLIA_RAFFLE_CALLBACK_GAS_LIMIT;
    const interval = process.env.SEPOLIA_RAFFLE_INTERVAL;

    const vrfCoordinator = getContract({
      address: vrfCoordinatorAddress,
      abi: [],
      client: publicClient,
    }) as unknown as MyVRFCoordinatorV2_5Mock;

    return {
      vrfCoordinator,
      entranceFee: parseEther(entranceFee),
      gasLane,
      subscriptionId: BigInt(subscriptionId),
      callbackGasLimit: BigInt(callbackGasLimit),
      interval: BigInt(interval),
    };
  }

  throw new Error(`Raffle parameters not configured for chain ID ${chainId}`);
};
