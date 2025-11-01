import assert from "node:assert";
import { beforeEach, describe, it } from "node:test";
import type {
  ContractReturnType,
  HardhatViemHelpers,
} from "@nomicfoundation/hardhat-viem/types";
import hre from "hardhat";
import { decodeEventLog } from "viem";
import {
  isDevelopmentChain,
  zeroGasLane,
} from "../scripts/helpers/deployment-helpers.js";

const { networkConfig } = await hre.network.connect();
const chainId = networkConfig.chainId;
const shouldSkip = !isDevelopmentChain(chainId);

describe("Raffle", { skip: shouldSkip }, () => {
  const initialBaseFee = 10000000000000000n; // 0.01 LINK
  const initialGasPrice = 1000000000n; // 1 Gwei
  const initialWeiPerUnitLink = 2000000000000000n; // 0.002 ETH per LINK

  const initialEntranceFee = 10000000000000000n; // 0.01 ETH
  const initialGasLane = zeroGasLane;
  const initialCallbackGasLimit = 500000;
  const initialInterval = 30n;

  let viem: HardhatViemHelpers;
  let publicClient: Awaited<ReturnType<HardhatViemHelpers["getPublicClient"]>>;
  let myVrfCoordinator: Awaited<ContractReturnType<"MyVRFCoordinatorV2_5Mock">>;
  let raffle: Awaited<ContractReturnType<"Raffle">>;

  beforeEach(async () => {
    const connection = await hre.network.connect();
    viem = connection.viem;
    publicClient = await viem.getPublicClient();
    myVrfCoordinator = await viem.deployContract("MyVRFCoordinatorV2_5Mock", [
      initialBaseFee,
      initialGasPrice,
      initialWeiPerUnitLink,
    ]);

    const txHash = await myVrfCoordinator.write.createSubscription();
    const txReceipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });
    const firstEventLog = txReceipt.logs[0];
    const decodedLog = decodeEventLog({
      abi: [myVrfCoordinator.abi[31]], // SubscriptionCreated event
      data: firstEventLog.data,
      topics: firstEventLog.topics,
    });
    const subscriptionId = decodedLog.args.subId;
    await myVrfCoordinator.write.fundSubscription([subscriptionId, 100n]);

    raffle = await viem.deployContract("Raffle", [
      myVrfCoordinator.address,
      initialEntranceFee,
      initialGasLane,
      subscriptionId,
      initialCallbackGasLimit,
      initialInterval,
    ]);

    await myVrfCoordinator.write.addConsumer([subscriptionId, raffle.address]);
  });

  describe("constructor", () => {
    it("initializes the raffle with correct parameters", async () => {
      const raffleState = await raffle.read.getRaffleState();
      const entranceFee = await raffle.read.getEntranceFee();
      assert.strictEqual(raffleState, 0); // OPEN
      assert.strictEqual(entranceFee, initialEntranceFee);
    });
  });
});
