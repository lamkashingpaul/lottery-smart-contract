import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const baseFee = 10000000000000000n; // 0.01 LINK
const gasPrice = 1000000000n; // 1 Gwei
const weiPerUnitLink = 2000000000000000n; // 0.002 ETH per LINK

export default buildModule("MyVRFCoordinatorV2_5Mock", (m) => {
  const myVRFCoordinatorV2_5Mock = m.contract("MyVRFCoordinatorV2_5Mock", [
    m.getParameter("baseFee", baseFee),
    m.getParameter("gasPrice", gasPrice),
    m.getParameter("weiPerUnitLink", weiPerUnitLink),
  ]);
  return { myVRFCoordinatorV2_5Mock };
});
