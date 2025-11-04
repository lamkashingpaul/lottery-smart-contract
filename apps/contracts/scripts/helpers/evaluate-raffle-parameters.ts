import type { NetworkConnection } from "hardhat/types/network";
import { decodeEventLog, getContract, parseEther } from "viem";
import {
  deployMyVRFCoordinatorV25Mock,
  type MyVRFCoordinatorV25Mock,
} from "./deploy-my-vrf-coordinator-v2-5-mock.js";
import { isDevelopmentChain, zeroGasLane } from "./deployment-helpers.js";

export const evaluateRaffleParameters = async (
  connection: NetworkConnection,
) => {
  const { networkConfig, viem } = connection;
  const chainId = networkConfig.chainId;
  const publicClient = await viem.getPublicClient();

  if (isDevelopmentChain(chainId)) {
    const MyVRFCoordinatorV25Mock =
      await deployMyVRFCoordinatorV25Mock(connection);
    const transactionHash =
      await MyVRFCoordinatorV25Mock.write.createSubscription();
    const transactionReceipt = await publicClient.waitForTransactionReceipt({
      hash: transactionHash,
    });
    if (!transactionReceipt) {
      throw new Error("Transaction receipt is undefined");
    }
    const firstEventLog = transactionReceipt.logs[0];
    const decodedLog = decodeEventLog({
      abi: [MyVRFCoordinatorV25Mock.abi[31]],
      data: firstEventLog.data,
      topics: firstEventLog.topics,
    });
    const subscriptionId = decodedLog.args.subId;
    await MyVRFCoordinatorV25Mock.write.fundSubscription([
      subscriptionId,
      parseEther("100"),
    ]);

    return {
      vrfCoordinator: MyVRFCoordinatorV25Mock,
      entranceFee: parseEther("0.01"),
      gasLane: zeroGasLane,
      subscriptionId,
      callbackGasLimit: 500000,
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
    }) as unknown as MyVRFCoordinatorV25Mock;

    return {
      vrfCoordinator,
      entranceFee: parseEther(entranceFee),
      gasLane,
      subscriptionId: BigInt(subscriptionId),
      callbackGasLimit: Number(callbackGasLimit),
      interval: BigInt(interval),
    };
  }

  throw new Error(`Raffle parameters not configured for chain ID ${chainId}`);
};
