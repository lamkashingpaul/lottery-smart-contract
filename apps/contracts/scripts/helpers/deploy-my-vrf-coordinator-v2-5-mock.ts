import type { NetworkConnection } from "hardhat/types/network";
import MyVRFCoordinatorV2_5MockModule from "../../ignition/modules/mocks/MyVRFCoordinatorV2_5Mock.js";

export const deployMyVRFCoordinatorV2_5Mock = async (
  connection: NetworkConnection,
) => {
  const { networkName, ignition } = connection;

  console.log(`Deploying MyVRFCoordinatorV2_5Mock on ${networkName} ...`);
  const { myVRFCoordinatorV2_5Mock } = await ignition.deploy(
    MyVRFCoordinatorV2_5MockModule,
  );

  const address = myVRFCoordinatorV2_5Mock.address;
  console.log(`MyVRFCoordinatorV2_5Mock deployed at: ${address}`);

  return myVRFCoordinatorV2_5Mock;
};

export type MyVRFCoordinatorV2_5Mock = Awaited<
  ReturnType<typeof deployMyVRFCoordinatorV2_5Mock>
>;
