import { mine } from "@nomicfoundation/hardhat-network-helpers";
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

  const salt = ethers.utils.keccak256("0x02");
  const amount = ethers.utils.parseEther("100");
  const wrapAmount = ethers.utils.parseEther("90");
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
      value: wrapAmount,
    });
  });

  it("should return false on canWithdraw", async () => {
    const result = await request("http://localhost:8080").get(`/canWithdraw/${swapActor.address}`);

    expect(result).to.have.status(200);
    expect(result.body).to.have.property("canWithdraw");
    expect(result.body.canWithdraw).to.be.false;
  });

  it("should not successfuly withdraw", async () => {
    const result = await request("http://localhost:8080")
      .post("/withdraw")
      .send({ actorAddress: swapActor.address });

    expect(result).to.have.status(400);
    expect(result.body.success).to.be.false;

    expect(await testToken.balanceOf(bridge.address)).to.be.equal(0);
  });

  it("should return true on canEmergencyWithdraw", async () => {
    await mine(emergencyWithdrawalTimeout);

    const result = await request("http://localhost:8080").get(
      `/canEmergencyWithdraw/${swapActor.address}`
    );

    expect(result).to.have.status(200);
    expect(result.body).to.have.property("canEmergencyWithdraw");
    expect(result.body.canEmergencyWithdraw).to.be.true;
  });

  it("should successfuly emergencyWithdraw", async () => {
    const result = await request("http://localhost:8080")
      .post("/emergencyWithdraw")
      .send({ actorAddress: swapActor.address });

    expect(result).to.have.status(200);
    expect(result.body.success).to.be.true;

    const unwrappingRequest = await bridge.requests(0);

    expect(unwrappingRequest.amount).to.equal(wrapAmount.sub(fee));
    expect(unwrappingRequest.from).to.equal(swapActor.address);
    expect(unwrappingRequest.to).to.equal(
      ethers.utils.hexlify(ethers.utils.toUtf8Bytes("mainchain address"))
    );
    expect(unwrappingRequest.assetId).to.equal(ethers.constants.HashZero);
  });
});
