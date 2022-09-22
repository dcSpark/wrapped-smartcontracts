import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { deployActor, deployContracts, encodeTransaction } from "./fixtures";

describe("Execute function", () => {
  it("should execute ExampleContract and get the correct return value", async () => {
    // Arrange
    const { actorFactory, exampleContract } = await loadFixture(deployContracts);

    const fooParameter = "example message";

    const actor = await deployActor(
      actorFactory,
      ethers.utils.keccak256("0x01"),
      await encodeTransaction("ExampleContract", "foo", [fooParameter]),
      exampleContract.address
    );

    // Act & Assert
    await expect(actor.execute())
      .to.emit(actor, "Response")
      .withArgs(true, ethers.utils.defaultAbiCoder.encode(["string"], [fooParameter]));
  });

  it("should fail to execute twice", async () => {
    // Arrange
    const { actorFactory, exampleContract } = await loadFixture(deployContracts);

    const fooParameter = "example message";

    const actor = await deployActor(
      actorFactory,
      ethers.utils.keccak256("0x01"),
      await encodeTransaction("ExampleContract", "foo", [fooParameter]),
      exampleContract.address
    );

    // Act & Assert
    await actor.execute();
    await expect(actor.execute()).to.be.revertedWith("Transaction was already executed");
  });
});
