import chai, { expect } from "chai";
import chaiHttp from "chai-http";
import { ethers } from "ethers";
import server from "../../src";
import { actorFactory, attachActor, getActorAddress } from "../../src/services/actor.service";
import { wallet } from "../../src/services/blockchain.service";

chai.use(chaiHttp);

describe("eth_getActorNonce", () => {
  const mainchainAddress =
    "addr_test1qz5dj9dh8cmdxvtr4jh3kca8rjw0vjt4anz79k4aefh9wcjjvmavqj3jhujkkn4kpz9ky09xhtt4v3447fesn7ptkfvsa0ymyn";
  const salt = ethers.utils.hexlify(ethers.utils.randomBytes(32));

  let actorAddress: string;

  before(async () => {
    actorAddress = await getActorAddress(mainchainAddress, salt);

    const depositTx = await wallet.sendTransaction({
      to: actorAddress,
      value: ethers.utils.parseEther("1000"),
    });

    await depositTx.wait();
  });

  it("should return 0 before deploy", async () => {
    const { body } = await chai
      .request(server)
      .post("/")
      .send({
        jsonrpc: "2.0",
        method: "eth_getActorNonce",
        params: [actorAddress],
        id: 1,
      });

    expect(body).to.deep.equal({
      jsonrpc: "2.0",
      result: "0",
      id: 1,
    });
  });

  it("should return 0 after deploy", async () => {
    const tx = await actorFactory.connect(wallet).deploy(mainchainAddress, salt);

    await tx.wait();

    const { body } = await chai
      .request(server)
      .post("/")
      .send({
        jsonrpc: "2.0",
        method: "eth_getActorNonce",
        params: [actorAddress],
        id: 1,
      });

    expect(body).to.deep.equal({
      jsonrpc: "2.0",
      result: "0",
      id: 1,
    });
  });

  it("should return 1 after one transaction", async () => {
    const sign1 =
      "0x845846a201276761646472657373583900a8d915b73e36d33163acaf1b63a71c9cf64975ecc5e2dabdca6e57625266fac04a32bf256b4eb6088b623ca6bad75646b5f27309f82bb259a166686173686564f458a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e711d384de113c1de1a659043927c556fede6a6200000000000000000000000000000000000000000000003635c9adc5dea00000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000005840cc12e0fc8d40841c82b5015a9416395443d01cc8aa65b3f01e5b0f8085c79cef29a871fbf474110bafb40370599e6c7677b8c5ae39d0a62bc925c037fda46504";
    const key =
      "0xa4010103272006215820a0057bf300a1fafa83a429a725775db34370472376e27ab634c4032170a72324";

    const actor = attachActor(actorAddress);

    const tx = await actor.connect(wallet).execute(sign1, key);

    await tx.wait();

    const { body } = await chai
      .request(server)
      .post("/")
      .send({
        jsonrpc: "2.0",
        method: "eth_getActorNonce",
        params: [actorAddress],
        id: 1,
      });

    expect(body).to.deep.equal({
      jsonrpc: "2.0",
      result: "1",
      id: 1,
    });
  });

  it("should return Invalid address for invalid parameters", async () => {
    const { body } = await chai
      .request(server)
      .post("/")
      .send({
        jsonrpc: "2.0",
        method: "eth_getActorNonce",
        params: ["0x123"],
        id: 1,
      });

    expect(body).to.have.property("error");
    expect(body).to.not.have.property("result");

    expect(body.error.code).to.equal(-32602);
    expect(body.error.message).to.contain("Invalid address");
  });
});
