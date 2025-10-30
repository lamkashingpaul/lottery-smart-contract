import hre from "hardhat";
import { deployRaffle } from "./helpers/deploy-raffle.js";
import { evaluateRaffleParameters } from "./helpers/evaluate-raffle-parameters.js";

const main = async () => {
  const connection = await hre.network.connect();
  const params = await evaluateRaffleParameters(connection);
  await deployRaffle(
    connection,
    params.vrfCoordinator,
    params.entranceFee,
    params.gasLane,
    params.subscriptionId,
    params.callbackGasLimit,
    params.interval,
  );
};

main().catch(console.error);
