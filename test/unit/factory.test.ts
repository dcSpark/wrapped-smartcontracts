import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { deployContracts, encodePayload, getActorInitCode } from "../fixtures";

describe("Factory", () => {
  it("should deploy successfully and return correct address", async () => {
    // Arrange
    const { actorFactory, exampleContract } = await loadFixture(deployContracts);

    const salt = ethers.utils.keccak256("0x01");
    const payload = encodePayload(
      ["bool", "string", "address"],
      [true, "Hello World", exampleContract.address]
    );

    const initCode = await getActorInitCode("ExampleActor", {
      payload,
      emergencyWithdrawalTimeout: 42,
    });

    const expectedActorAddress = ethers.utils.getCreate2Address(
      actorFactory.address,
      salt,
      ethers.utils.keccak256(initCode)
    );

    // Act & Assert
    await expect(actorFactory.deploy(salt, initCode))
      .to.emit(actorFactory, "Deployed")
      .withArgs(expectedActorAddress);

    const actor = await ethers.getContractAt("ExampleActor", expectedActorAddress);
    expect(await actor.emergencyWithdrawPossibleAt()).to.equal(
      (await ethers.provider.getBlockNumber()) + 42
    );
  });
});
