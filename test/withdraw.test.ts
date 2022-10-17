import { loadFixture, mine } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { SwapActor } from "../typechain-types";
import { deployActor, deployContracts, encodePayload } from "./fixtures";

describe("Withdraw function", () => {
  it("should successfuly swap and withdraw", async () => {
    const { swap, bridge, testToken, actorFactory } = await loadFixture(deployContracts);
    const [user] = await ethers.getSigners();

    const amount = ethers.utils.parseEther("100");
    const fee = ethers.utils.parseEther("1");
    const emergencyWithdrawalTimeout = 100;

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

    const actor = (await deployActor(actorFactory, "SwapActor", ethers.utils.keccak256("0x01"), {
      payload,
      emergencyWithdrawalTimeout,
    })) as SwapActor;

    // We didn't wrap the assets yet
    expect(await actor.canExecute()).to.be.false;

    // Wrapping...
    await user.sendTransaction({
      to: actor.address,
      value: amount.add(fee),
    });

    expect(await actor.canExecute()).to.be.true;

    // Executing...
    await actor.execute();

    // We have new token in wallet
    expect(await testToken.balanceOf(actor.address)).to.equal(amount);

    expect(await actor.canWithdraw()).to.be.true;

    // Withdrawing...
    await actor.withdraw();

    // We sent everything to the bridge
    expect(await testToken.balanceOf(actor.address)).to.equal(0);
    expect(await testToken.balanceOf(bridge.address)).to.equal(amount);

    const unwrappingRequest = await bridge.requests(0);

    expect(unwrappingRequest.amount).to.equal(amount);
    expect(unwrappingRequest.from).to.equal(actor.address);
    expect(unwrappingRequest.to).to.equal(
      ethers.utils.hexlify(ethers.utils.toUtf8Bytes("mainchain address"))
    );
    expect(unwrappingRequest.assetId).to.equal(
      ethers.utils.hexZeroPad(testToken.address, 32).toLowerCase()
    );
  });

  it("should successfuly do emergency withdraw", async () => {
    const { swap, bridge, testToken, actorFactory } = await loadFixture(deployContracts);
    const [user] = await ethers.getSigners();

    const amount = ethers.utils.parseEther("100");
    const wrapAmount = ethers.utils.parseEther("50");
    const fee = ethers.utils.parseEther("1");
    const emergencyWithdrawalTimeout = 100;

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

    const actor = (await deployActor(actorFactory, "SwapActor", ethers.utils.keccak256("0x01"), {
      payload,
      emergencyWithdrawalTimeout,
    })) as SwapActor;

    expect(await actor.canExecute()).to.be.false;

    // Wrapping...
    await user.sendTransaction({
      to: actor.address,
      value: wrapAmount,
    });

    // Still cannot execute, we sent less than required amount
    expect(await actor.canExecute()).to.be.false;

    // Emergency timeout hasn't passed yet
    expect(await actor.canEmergencyWithdraw()).to.be.false;

    await mine(emergencyWithdrawalTimeout);

    expect(await actor.canEmergencyWithdraw()).to.be.true;

    // Emergency withdrawing...
    await actor.emergencyWithdraw();

    const unwrappingRequest = await bridge.requests(0);

    expect(unwrappingRequest.amount).to.equal(wrapAmount.sub(fee));
    expect(unwrappingRequest.from).to.equal(actor.address);
    expect(unwrappingRequest.to).to.equal(
      ethers.utils.hexlify(ethers.utils.toUtf8Bytes("mainchain address"))
    );
    expect(unwrappingRequest.assetId).to.equal(ethers.constants.HashZero);
  });
});
