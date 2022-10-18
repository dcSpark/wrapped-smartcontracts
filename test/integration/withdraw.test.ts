import { expect, request, use } from "chai";
import chaiHttp from "chai-http";
import { ethers } from "hardhat";
import { SidechainBridge, SwapActor, TestToken } from "../../typechain-types";
import {
  deployBridge,
  deploySwap,
  deployTestToken,
  encodePayload,
  getActorInitCode,
} from "../fixtures";

use(chaiHttp);

describe("Withdraw", () => {
  let swapActor: SwapActor;
  let testToken: TestToken;
  let bridge: SidechainBridge;

  const salt = ethers.utils.keccak256("0x01");
  const amount = ethers.utils.parseEther("100");
  const fee = ethers.utils.parseEther("1");
  const emergencyWithdrawalTimeout = 100;

  before(async () => {
    testToken = await deployTestToken("Test Token", "TT");
    bridge = await deployBridge([testToken]);
    const swap = await deploySwap();

    await testToken.mint(swap.address, ethers.utils.parseEther("1000000"));

    const payload = encodePayload(
      ["address", "address", "address", "bytes32", "bytes", "uint256", "uint256"],
      [
        swap.address,
        bridge.address,
        testToken.address,
        ethers.utils.hexZeroPad(testToken.address, 32),
        ethers.utils.toUtf8Bytes("mainchain address"),
        amount,
        fee,
      ]
    );

    const initCode = await getActorInitCode("SwapActor", {
      payload,
      emergencyWithdrawalTimeout: emergencyWithdrawalTimeout,
    });

    const { body } = await request("http://localhost:8080")
      .post("/deploy")
      .send({ salt, initCode });

    swapActor = await ethers.getContractAt("SwapActor", body.actorAddress);

    // Wrapping...
    const [signer] = await ethers.getSigners();
    await signer.sendTransaction({
      to: swapActor.address,
      value: amount.add(fee),
    });
  });

  it("should return true on canExecute", async () => {
    const result = await request("http://localhost:8080").get(`/canExecute/${swapActor.address}`);

    expect(result).to.have.status(200);
    expect(result.body).to.have.property("canExecute");
    expect(result.body.canExecute).to.be.true;
  });

  it("should successfuly execute", async () => {
    const result = await request("http://localhost:8080")
      .post("/execute")
      .send({ actorAddress: swapActor.address });

    expect(result).to.have.status(200);
    expect(result.body.success).to.be.true;
  });

  it("should return true on canWithdraw", async () => {
    const result = await request("http://localhost:8080").get(`/canWithdraw/${swapActor.address}`);

    expect(result).to.have.status(200);
    expect(result.body).to.have.property("canWithdraw");
    expect(result.body.canWithdraw).to.be.true;
  });

  it("should successfuly withdraw", async () => {
    const result = await request("http://localhost:8080")
      .post("/withdraw")
      .send({ actorAddress: swapActor.address });

    expect(result).to.have.status(200);
    expect(result.body.success).to.be.true;

    expect(await testToken.balanceOf(bridge.address)).to.be.equal(amount);
  });
});
