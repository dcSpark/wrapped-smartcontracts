import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { deployContracts, getActorInitCode } from "./fixtures";

describe("Factory", () => {
  it("should deploy successfully and return correct address", async () => {
    // Arrange
    const { actorFactory, exampleContract } = await loadFixture(deployContracts);

    const salt = ethers.utils.keccak256("0x01");
    const executeArgs = ethers.utils.defaultAbiCoder.encode(
      ["string", "address"],
      ["Hello World", exampleContract.address]
    );
    const executeConditionArgs = ethers.utils.defaultAbiCoder.encode(["bool"], [true]);

    const initCode = await getActorInitCode("ExampleActor", { executeArgs, executeConditionArgs });

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
    expect(await actor._executeArgs()).to.equal(executeArgs);
  });
});
