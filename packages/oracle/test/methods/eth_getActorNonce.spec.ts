import chai, { expect } from "chai";
import chaiHttp from "chai-http";
import { ethers } from "ethers";
import server from "../../src";
import {
  actorFactory,
  attachActor,
  encodePayload,
  getActorAddress,
} from "../../src/services/actor.service";
import { provider, wallet } from "../../src/services/blockchain.service";
import cip8 from "../cip8";

chai.use(chaiHttp);

describe("eth_getActorNonce", () => {
  const mainchainAddress =
    "addr_test1qz5dj9dh8cmdxvtr4jh3kca8rjw0vjt4anz79k4aefh9wcjjvmavqj3jhujkkn4kpz9ky09xhtt4v3447fesn7ptkfvsa0ymyn";
  const privateKey =
    "ed25519e_sk1wzm7jmql8tnf3p4yx5seg389dhrg49z9j86a0hrwemehcx3he3dlvxcc663vxnl4anykugu9ttu94yfzuq5ulrxc6lckl647tm58jhqrr7at4";
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
    const gasPrice = await provider.getGasPrice();
    const payload = encodePayload({
      from: actorAddress,
      nonce: 0,
      to: wallet.address,
      value: ethers.utils.parseEther("100"),
      gasLimit: 1_000_000,
      gasPrice: gasPrice,
      calldata: [],
    });

    const { coseSign1, coseKey } = cip8.signCIP8(
      Buffer.from(payload.slice(2), "hex"),
      privateKey,
      mainchainAddress
    );

    const sign1 = `0x${Buffer.from(coseSign1.to_bytes()).toString("hex")}`;
    const key = `0x${Buffer.from(coseKey.to_bytes()).toString("hex")}`;

    const actor = attachActor(actorAddress);

    const tx = await actor.connect(wallet).execute(sign1, key, { gasLimit: 1_000_000, gasPrice });

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
