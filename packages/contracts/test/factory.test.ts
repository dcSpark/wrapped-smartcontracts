import { expect } from "chai";
import { ethers } from "hardhat";
import { getActorAddress, getActorFactory } from "./fixtures";

describe("ActorFactory", () => {
  it("should deploy to correct address", async () => {
    // Arrange
    const mainchainAddress = "example_mainchain_address";
    const salt = ethers.utils.hashMessage(Date.now().toString());

    const factory = await getActorFactory();

    const expectedActorAddress = await getActorAddress(factory.address, mainchainAddress, salt);

    // Act & Assert
    await expect(await factory.deploy(mainchainAddress, salt))
      .to.emit(factory, "Deployed")
      .withArgs(expectedActorAddress, mainchainAddress, salt);

    const actor = await ethers.getContractAt("Actor", expectedActorAddress);

    expect(await actor.mainchainAddress()).to.equal(mainchainAddress);
    expect(await actor.nonce()).to.equal(0);
  });
});
