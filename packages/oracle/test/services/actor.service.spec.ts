import { expect } from "chai";
import { ethers } from "ethers";
import {
  getActorAddress,
  getActorFactory,
  isActorDeployed,
} from "../../src/services/actor.service";
import { wallet } from "../../src/services/blockchain.service";

describe("ActorService", () => {
  it("should correctly determine wether Actor is deployed", async () => {
    const mainchainAddress =
      "addr_test1qz5dj9dh8cmdxvtr4jh3kca8rjw0vjt4anz79k4aefh9wcjjvmavqj3jhujkkn4kpz9ky09xhtt4v3447fesn7ptkfvsa0ymyn";
    const salt = ethers.utils.hexlify(ethers.utils.randomBytes(32));

    const actorAddress = await getActorAddress(mainchainAddress, salt);

    expect(await isActorDeployed(actorAddress)).to.be.false;

    const tx = await getActorFactory().connect(wallet).deploy(mainchainAddress, salt);

    await tx.wait();

    expect(await isActorDeployed(actorAddress)).to.be.true;
  });
});
