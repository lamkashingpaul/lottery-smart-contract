import assert from "node:assert";
import { beforeEach, describe, it } from "node:test";
import type {
  ContractReturnType,
  HardhatViemHelpers,
} from "@nomicfoundation/hardhat-viem/types";
import hre from "hardhat";
import { decodeEventLog, getAddress, isAddressEqual, parseEther } from "viem";
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
  let testClient: Awaited<ReturnType<HardhatViemHelpers["getTestClient"]>>;
  let myVrfCoordinator: Awaited<ContractReturnType<"MyVRFCoordinatorV2_5Mock">>;
  let raffle: Awaited<ContractReturnType<"Raffle">>;
  type RaffleErrors = Extract<
    (typeof raffle.abi)[number],
    { type: "error" }
  >["name"];
  type RaffleEvents = Extract<
    (typeof raffle.abi)[number],
    { type: "event" }
  >["name"];

  beforeEach(async () => {
    const connection = await hre.network.connect();
    viem = connection.viem;
    publicClient = await viem.getPublicClient();
    testClient = await viem.getTestClient();
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
    await myVrfCoordinator.write.fundSubscription([
      subscriptionId,
      parseEther("100"),
    ]);

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

  describe("enterRaffle", () => {
    it("reverts when not enough ETH is sent", async () => {
      const errorName: RaffleErrors = "Raffle__NotEnoughETHEntered";
      await viem.assertions.revertWithCustomError(
        raffle.write.enterRaffle(),
        raffle,
        errorName,
      );
    });

    it("reverts when raffle is not open", async () => {
      await raffle.write.enterRaffle({ value: initialEntranceFee });
      await testClient.increaseTime({ seconds: Number(initialInterval) + 1 });
      await raffle.write.performUpkeep(["0x"]);

      const errorName: RaffleErrors = "Raffle__NotOpen";
      await viem.assertions.revertWithCustomError(
        raffle.write.enterRaffle({ value: initialEntranceFee }),
        raffle,
        errorName,
      );
    });

    it("records player when they enter raffle", async () => {
      const [playerWallet] = await viem.getWalletClients();
      await raffle.write.enterRaffle({
        value: initialEntranceFee,
        account: playerWallet.account,
      });
      const recordedPlayerAddress = await raffle.read.getPlayer([0n]);
      assert.ok(
        isAddressEqual(recordedPlayerAddress, playerWallet.account.address),
      );
    });

    it("emits RaffleEnter event on entry", async () => {
      const [playerWallet] = await viem.getWalletClients();

      const eventName: RaffleEvents = "RaffleEntered";
      await viem.assertions.emitWithArgs(
        raffle.write.enterRaffle({
          value: initialEntranceFee,
          account: playerWallet.account,
        }),
        raffle,
        eventName,
        [getAddress(playerWallet.account.address)],
      );
    });
  });

  describe("checkUpkeep", () => {
    it("returns false if raffle is not open", async () => {
      await raffle.write.enterRaffle({ value: initialEntranceFee });
      await testClient.increaseTime({ seconds: Number(initialInterval) + 1 });
      await raffle.write.performUpkeep(["0x"]);

      const [upkeepNeeded] = await raffle.read.checkUpkeep(["0x"]);
      assert.strictEqual(upkeepNeeded, false);
    });

    it("returns false if not enough time has passed", async () => {
      await raffle.write.enterRaffle({ value: initialEntranceFee });
      await testClient.increaseTime({ seconds: Number(initialInterval) - 5 });

      const [upkeepNeeded] = await raffle.read.checkUpkeep(["0x"]);
      assert.strictEqual(upkeepNeeded, false);
    });

    it("returns false if there are no players", async () => {
      await testClient.increaseTime({ seconds: Number(initialInterval) + 1 });
      const [upkeepNeeded] = await raffle.read.checkUpkeep(["0x"]);
      assert.strictEqual(upkeepNeeded, false);
    });

    it("return false if not enough balance in the contract", async () => {
      await raffle.write.enterRaffle({ value: initialEntranceFee });
      await testClient.increaseTime({ seconds: Number(initialInterval) + 1 });
      await testClient.setBalance({ address: raffle.address, value: 0n });
      const [upkeepNeeded] = await raffle.read.checkUpkeep(["0x"]);
      assert.strictEqual(upkeepNeeded, false);
    });

    it("returns true if raffle is open, enough time has passed, there are players, and contract has balance", async () => {
      await raffle.write.enterRaffle({ value: initialEntranceFee });
      await testClient.increaseTime({ seconds: Number(initialInterval) + 1 });
      await testClient.mine({ blocks: 1 });
      const [upkeepNeeded] = await raffle.read.checkUpkeep(["0x"]);
      assert.strictEqual(upkeepNeeded, true);
    });
  });

  describe("performUpkeep", () => {
    it("reverts if upkeep is not needed", async () => {
      const balance = await publicClient.getBalance({
        address: raffle.address,
      });
      const numberOfPlayers = await raffle.read.getNumberOfPlayers();
      const raffleState = await raffle.read.getRaffleState();

      const errorName: RaffleErrors = "Raffle__UpkeepNotNeeded";
      await viem.assertions.revertWithCustomErrorWithArgs(
        raffle.write.performUpkeep(["0x"]),
        raffle,
        errorName,
        [balance, numberOfPlayers, BigInt(raffleState)],
      );
    });

    it("updates the timestamp if upkeep is performed successfully", async () => {
      await raffle.write.enterRaffle({ value: initialEntranceFee });
      await testClient.increaseTime({ seconds: Number(initialInterval) + 1 });
      const txHash = await raffle.write.performUpkeep(["0x"]);
      const txReceipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });
      const block = await publicClient.getBlock({
        blockNumber: txReceipt.blockNumber,
      });
      const lastTimeStamp = await raffle.read.getLastTimeStamp();
      assert.strictEqual(lastTimeStamp, BigInt(block.timestamp));
    });

    it('updates the raffle state to "calculating" when upkeep is performed successfully', async () => {
      await raffle.write.enterRaffle({ value: initialEntranceFee });
      await testClient.increaseTime({ seconds: Number(initialInterval) + 1 });
      await raffle.write.performUpkeep(["0x"]);
      const raffleState = await raffle.read.getRaffleState();
      assert.strictEqual(raffleState, 1); // CALCULATING
    });

    it("emits RaffleWinnerRequested event with correct requestId", async () => {
      await raffle.write.enterRaffle({ value: initialEntranceFee });
      await testClient.increaseTime({ seconds: Number(initialInterval) + 1 });

      const expectedRequestId = 1n;
      const eventName: RaffleEvents = "RaffleWinnerRequested";
      await viem.assertions.emitWithArgs(
        raffle.write.performUpkeep(["0x"]),
        raffle,
        eventName,
        [expectedRequestId],
      );
    });
  });

  describe("fulfillRandomWords", () => {
    beforeEach(async () => {
      await raffle.write.enterRaffle({ value: initialEntranceFee });
      await testClient.increaseTime({ seconds: Number(initialInterval) + 1 });
    });

    it("reverts if fulfillRandomWords is called before performUpkeep", async () => {
      const errorName = "InvalidRequest";
      await viem.assertions.revertWithCustomError(
        myVrfCoordinator.write.fulfillRandomWords([1n, raffle.address]),
        myVrfCoordinator,
        errorName,
      );
    });
  });
});
