import type { NetworkConnection } from "hardhat/types/network";
import MyVRFCoordinatorV2_5MockModule from "../../ignition/modules/mocks/MyVRFCoordinatorV2_5Mock.js";

export const deployMyVRFCoordinatorV2_5MockModuleFixture = async (
  connection: NetworkConnection,
) => {
  const { networkName, ignition } = connection;

  console.log(
    `Deploying MyVRFCoordinatorV2_5Mock on ${networkName} network...`,
  );
  const myVRFCoordinatorV2_5MockModuleFixture = await ignition.deploy(
    MyVRFCoordinatorV2_5MockModule,
  );

  const { myVRFCoordinatorV2_5Mock } = myVRFCoordinatorV2_5MockModuleFixture;
  const myVRFCoordinatorV2_5MockAddress = myVRFCoordinatorV2_5Mock.address;
  console.log(
    `MyVRFCoordinatorV2_5Mock deployed at: ${myVRFCoordinatorV2_5MockAddress}`,
  );

  return myVRFCoordinatorV2_5MockModuleFixture;
};
