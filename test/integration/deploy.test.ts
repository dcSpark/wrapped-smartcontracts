import { expect, request, use } from "chai";
import chaiHttp from "chai-http";
import { ethers } from "hardhat";
import { encodePayload, getActorInitCode } from "../fixtures";

use(chaiHttp);

describe("Deploy", () => {
  it("should return correct actor address and deploy actor", async () => {
    const salt = ethers.utils.keccak256("0x01");
    const initCode = await getActorInitCode("ExampleActor", {
      payload: encodePayload(
        ["bool", "string", "address"],
        [true, "Hello World", "0x0000000000000000000000000000000000000000"]
      ),
      emergencyWithdrawalTimeout: 42,
    });

    const result = await request("http://localhost:8080").post("/deploy").send({ salt, initCode });

    expect(result).to.have.status(200);
    expect(result.body).to.have.property("actorAddress");
    expect(result.body).to.have.property("factoryAddress");
    expect(result.body).to.have.property("txHash");

    const { actorAddress, factoryAddress, txHash } = result.body;

    const expectedActorAddress = ethers.utils.getCreate2Address(
      factoryAddress,
      salt,
      ethers.utils.keccak256(initCode)
    );

    expect(actorAddress).to.equal(expectedActorAddress);

    const tx = await ethers.provider.getTransaction(txHash);
    expect(tx.to).to.equal(factoryAddress);

    await tx.wait();

    const actor = await ethers.getContractAt("ExampleActor", actorAddress);

    expect(await actor.canExecute()).to.be.true;
  });
});
