import { expect, request, use } from "chai";
import chaiHttp from "chai-http";
import { ethers } from "hardhat";
import { ExampleActor } from "../../typechain-types";
import { deployExampleContract, encodePayload, getActorInitCode } from "../fixtures";

use(chaiHttp);

describe("Execute", () => {
  let exampleActor: ExampleActor;

  before(async () => {
    const exampleContract = await deployExampleContract();

    const salt = ethers.utils.keccak256("0x01");
    const initCode = await getActorInitCode("ExampleActor", {
      payload: encodePayload(
        ["bool", "string", "address"],
        [true, "Hello World", exampleContract.address]
      ),
      emergencyWithdrawalTimeout: 42,
    });

    const { body } = await request("http://localhost:8080")
      .post("/deploy")
      .send({ salt, initCode });

    exampleActor = await ethers.getContractAt("ExampleActor", body.actorAddress);
  });

  it("should return true on canExecute", async () => {
    const result = await request("http://localhost:8080").get(
      `/canExecute/${exampleActor.address}`
    );

    expect(result).to.have.status(200);
    expect(result.body).to.have.property("canExecute");
    expect(result.body.canExecute).to.be.true;
  });

  it("should successfuly execute", async () => {
    const result = await request("http://localhost:8080")
      .post("/execute")
      .send({ actorAddress: exampleActor.address });

    expect(result).to.have.status(200);
    expect(result.body).to.have.property("txHash");

    const tx = await ethers.provider.getTransaction(result.body.txHash);
    expect(tx.to).to.equal(exampleActor.address);
  });
});
