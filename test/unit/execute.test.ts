import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { deployActor, deployContracts, encodePayload } from "../fixtures";

describe("Execute function", () => {
  it("should execute ExampleContract and get the correct return value", async () => {
    // Arrange
    const { actorFactory, exampleContract } = await loadFixture(deployContracts);

    const actor = await deployActor(actorFactory, "ExampleActor", ethers.utils.keccak256("0x01"), {
      payload: encodePayload(
        ["bool", "string", "address"],
        [true, "Hello World", exampleContract.address]
      ),
      emergencyWithdrawalTimeout: 0,
    });

    // Act & Assert
    await expect(actor.execute())
      .to.emit(actor, "ExecuteResponse")
      .withArgs(
        ethers.utils.defaultAbiCoder.encode(["string"], [`I've got the message: Hello World`])
      );
  });

  it("should fail to execute twice", async () => {
    // Arrange
    const { actorFactory, exampleContract } = await loadFixture(deployContracts);

    const actor = await deployActor(actorFactory, "ExampleActor", ethers.utils.keccak256("0x01"), {
      payload: encodePayload(
        ["bool", "string", "address"],
        [true, "Hello World", exampleContract.address]
      ),
      emergencyWithdrawalTimeout: 0,
    });

    // Act & Assert
    await actor.execute();
    await expect(actor.execute()).to.be.revertedWith("Transaction was already executed");
  });

  it("should not execute if condition is not met", async () => {
    // Arrange
    const { actorFactory, exampleContract } = await loadFixture(deployContracts);

    const actor = await deployActor(actorFactory, "ExampleActor", ethers.utils.keccak256("0x01"), {
      payload: encodePayload(
        ["bool", "string", "address"],
        [false, "Hello World", exampleContract.address]
      ),
      emergencyWithdrawalTimeout: 0,
    });

    // Act & Assert
    await expect(actor.execute()).to.be.revertedWith("Transaction condition not met");
  });
});
