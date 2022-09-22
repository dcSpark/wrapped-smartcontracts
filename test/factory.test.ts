import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { deployContracts, encodeTransaction, getActorInitCode } from "./fixtures";

describe("Factory", () => {
  it("should return correct address and deploy successfully", async () => {
    // Arrange
    const { actorFactory, exampleContract } = await loadFixture(deployContracts);

    const salt = ethers.utils.keccak256("0x01");
    const txData = await encodeTransaction("ExampleContract", "foo", [0]);
    const initCodeHash = ethers.utils.keccak256(
      await getActorInitCode(txData, exampleContract.address)
    );

    const expectedActorAddress = ethers.utils.getCreate2Address(
      actorFactory.address,
      salt,
      initCodeHash
    );

    // Act & Assert
    await expect(actorFactory.deploy(salt, txData, exampleContract.address))
      .to.emit(actorFactory, "Deployed")
      .withArgs(expectedActorAddress);

    const actor = await ethers.getContractAt("Actor", expectedActorAddress);
    expect(await actor.txData()).to.equal(txData);
    expect(await actor.destinationContract()).to.equal(exampleContract.address);
  });
});
