import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Raffle", (m) => {
  const raffle = m.contract("Raffle", [
    m.getParameter("vrfCoordinator"),
    m.getParameter("entranceFee"),
    m.getParameter("gasLane"),
    m.getParameter("subscriptionId"),
    m.getParameter("callbackGasLimit"),
    m.getParameter("interval"),
  ]);

  return { raffle };
});
