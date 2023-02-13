import chai, { expect } from "chai";
import chaiHttp from "chai-http";
import { ethers } from "ethers";
import server from "../../src";
import eth_getActorNonce from "../../src/methods/eth_getActorNonce";
import { getActorAddress } from "../../src/services/actor.service";
import { provider, wallet } from "../../src/services/blockchain.service";
import cip8 from "../cip8";

chai.use(chaiHttp);

describe("eth_sendActorTransaction", () => {
  const mainchainAddress =
    "addr_test1qz5dj9dh8cmdxvtr4jh3kca8rjw0vjt4anz79k4aefh9wcjjvmavqj3jhujkkn4kpz9ky09xhtt4v3447fesn7ptkfvsa0ymyn";
  const privateKey =
    "ed25519e_sk1wzm7jmql8tnf3p4yx5seg389dhrg49z9j86a0hrwemehcx3he3dlvxcc663vxnl4anykugu9ttu94yfzuq5ulrxc6lckl647tm58jhqrr7at4";

  let actorAddress: string;

  before(async () => {
    actorAddress = await getActorAddress(mainchainAddress);

    const depositTx = await wallet.sendTransaction({
      to: actorAddress,
      value: ethers.utils.parseEther("1000"),
    });

    await depositTx.wait();
  });

  it("should send transaction", async () => {
    const nonce = +(await eth_getActorNonce([actorAddress]));
    const amount = ethers.utils.parseEther("500");

    const recipient = ethers.Wallet.createRandom();
    const recipientBeforeBalance = await provider.getBalance(recipient.address);
    const actorBeforeBalance = await provider.getBalance(actorAddress);

    const payload = ethers.utils.defaultAbiCoder
      .encode(
        ["uint256", "address", "uint256", "bytes"], // nonce, to, value, calldata
        [nonce, recipient.address, amount, []]
      )
      .slice(2);

    const { coseSign1, coseKey } = cip8.signCIP8(
      Buffer.from(payload, "hex"),
      privateKey,
      mainchainAddress
    );

    const { body } = await chai
      .request(server)
      .post("/")
      .send({
        jsonrpc: "2.0",
        method: "eth_sendActorTransaction",
        params: [
          {
            key: Buffer.from(coseKey.to_bytes()).toString("hex"),
            signature: Buffer.from(coseSign1.to_bytes()).toString("hex"),
          },
        ],
        id: 1,
      });

    expect(body).to.have.property("result");
    expect(body).to.not.have.property("error");

    const tx = await provider.getTransaction(body.result);
    await tx.wait();

    expect(await provider.getBalance(recipient.address)).to.deep.equal(
      recipientBeforeBalance.add(amount)
    );

    expect(await provider.getBalance(actorAddress)).to.deep.equal(actorBeforeBalance.sub(amount));
  });

  it("should detect invalid signature", async () => {
    const key =
      "a40101032720062158201ddca651fe2488e9c5a8b50ae05af40f7274157c163a3cfc964827a9bc399cd0";
    const signature =
      "845846a201276761646472657373583900a8d915b73e36d33163acaf1b63a71c9cf64975ecc5e2dabdca6e57625266fac04a32bf256b4eb6088b623ca6bad75646b5f27309f82bb259a166686173686564f44501020304055840cf4b6735681c7c4e14faadc7ea0a416e994b30ed3b44589faaeb3893fed56566ab48701c95859710ddf55c707f543892627f7cd660bdfea86e3b766c921d5a03";

    const { body } = await chai
      .request(server)
      .post("/")
      .send({
        jsonrpc: "2.0",
        method: "eth_sendActorTransaction",
        params: [{ key, signature }],
        id: 1,
      });

    expect(body).to.have.property("error");
    expect(body).to.not.have.property("result");

    expect(body.error.code).to.equal(-32600);
    expect(body.error.message).to.contain("Invalid signature");
  });

  it("should return error on invalid parameters", async () => {
    const params = [
      [],
      [{}],
      [
        {
          key: "a40101032720062158201ddca651fe2488e9c5a8b50ae05af40f7274157c163a3cfc964827a9bc399cd0",
        },
      ],
      [
        {
          signature:
            "845846a201276761646472657373583900a8d915b73e36d33163acaf1b63a71c9cf64975ecc5e2dabdca6e57625266fac04a32bf256b4eb6088b623ca6bad75646b5f27309f82bb259a166686173686564f44501020304055840cf4b6735681c7c4e14faadc7ea0a416e994b30ed3b44589faaeb3893fed56566ab48701c95859710ddf55c707f543892627f7cd660bdfea86e3b766c921d5a03",
        },
      ],
    ];

    const responses = await Promise.all(
      params.map(async (param) =>
        chai.request(server).post("/").send({
          jsonrpc: "2.0",
          method: "eth_sendActorTransaction",
          params: param,
          id: 1,
        })
      )
    );

    responses.forEach(({ body }) => {
      expect(body).to.have.property("error");
      expect(body).to.not.have.property("result");

      expect(body.error.code).to.equal(-32602);
    });
  });
});
