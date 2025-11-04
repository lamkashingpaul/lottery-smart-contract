import assert from "node:assert";
import { beforeEach, describe, it } from "node:test";
import type {
  ContractReturnType,
  HardhatViemHelpers,
} from "@nomicfoundation/hardhat-viem/types";
import hre from "hardhat";
import { decodeEventLog, isAddressEqual } from "viem";
import type { MyVRFCoordinatorV25Mock } from "../scripts/helpers/deploy-my-vrf-coordinator-v2-5-mock.js";
import { deployRaffle } from "../scripts/helpers/deploy-raffle.js";
import { isDevelopmentChain } from "../scripts/helpers/deployment-helpers.js";
import { evaluateRaffleParameters } from "../scripts/helpers/evaluate-raffle-parameters.js";

const { networkConfig } = await hre.network.connect();
const chainId = networkConfig.chainId;
const shouldSkip = isDevelopmentChain(chainId);

describe("Raffle", { skip: shouldSkip }, () => {
  let initialVrfCoordinator: MyVRFCoordinatorV25Mock;
  let initialEntranceFee: bigint;
  let initialGasLane: `0x${string}`;
  let initialSubscriptionId: bigint;
  let initialCallbackGasLimit: number;
  let initialInterval: bigint;

  let viem: HardhatViemHelpers;
  let publicClient: Awaited<ReturnType<HardhatViemHelpers["getPublicClient"]>>;
  let raffle: Awaited<ContractReturnType<"Raffle">>;
  type RaffleEvents = Extract<
    (typeof raffle.abi)[number],
    { type: "event" }
  >["name"];

  beforeEach(async () => {
    const connection = await hre.network.connect();
    viem = connection.viem;
    publicClient = await viem.getPublicClient();

    const raffleParams = await evaluateRaffleParameters(connection);
    initialVrfCoordinator = raffleParams.vrfCoordinator;
    initialEntranceFee = raffleParams.entranceFee;
    initialGasLane = raffleParams.gasLane;
    initialSubscriptionId = raffleParams.subscriptionId;
    initialCallbackGasLimit = raffleParams.callbackGasLimit;
    initialInterval = raffleParams.interval;

    raffle = await deployRaffle(
      connection,
      initialVrfCoordinator,
      initialEntranceFee,
      initialGasLane,
      initialSubscriptionId,
      initialCallbackGasLimit,
      initialInterval,
    );
  });

  describe("fulfillRandomWords", () => {
    it("works with live Chainlink VRF and picks a winner", async () => {
      const [playerWallet] = await viem.getWalletClients();

      await new Promise<void>((resolve, reject) => {
        const eventName: RaffleEvents = "WinnerPicked";
        const unwatch = publicClient.watchContractEvent({
          address: raffle.address,
          abi: raffle.abi,
          eventName,
          onLogs: (logs) => {
            const decodedLog = decodeEventLog({
              abi: [raffle.abi[14]], // WinnerPicked event
              data: logs[0].data,
              topics: logs[0].topics,
            });
            const winner = decodedLog.args.winner;
            assert.ok(
              isAddressEqual(winner, playerWallet.account.address),
              "The winner should be the player who entered the raffle",
            );
            unwatch();
            resolve();
          },
          onError: (error) => {
            unwatch();
            reject(error);
          },
        });

        (async () => {
          await raffle.write.enterRaffle({ value: initialEntranceFee });
        })();
      });
    });
  });
});
