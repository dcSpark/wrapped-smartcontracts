import { expect } from "chai";
import { ethers } from "hardhat";
import type { Actor, Counter, InfiniteLoop } from "../typechain-types";
import { ResponseEvent } from "../typechain-types/Actor";
import cip8 from "../utils/cip8";
import { encodePayload, getActorAddress, getActorFactory } from "./fixtures";

describe("Actor", () => {
  const salt = ethers.utils.hexlify(ethers.utils.randomBytes(32));

  const privateKey =
    "ed25519e_sk1wzm7jmql8tnf3p4yx5seg389dhrg49z9j86a0hrwemehcx3he3dlvxcc663vxnl4anykugu9ttu94yfzuq5ulrxc6lckl647tm58jhqrr7at4";
  const mainchainAddress =
    "addr_test1qz5dj9dh8cmdxvtr4jh3kca8rjw0vjt4anz79k4aefh9wcjjvmavqj3jhujkkn4kpz9ky09xhtt4v3447fesn7ptkfvsa0ymyn";

  let actorAddress: string;
  let actor: Actor;
  let counter: Counter;
  let infiniteLoop: InfiniteLoop;

  before(async () => {
    const factory = await getActorFactory();
    actorAddress = await getActorAddress(factory.address, mainchainAddress, salt);

    actor = await ethers.getContractAt("Actor", actorAddress);

    const [signer] = await ethers.getSigners();

    const depositGasTx = await signer.sendTransaction({
      to: actorAddress,
      value: ethers.utils.parseEther("2000000"),
    });

    const deployTx = await factory.deploy(mainchainAddress, salt);

    const counterFactory = await ethers.getContractFactory("Counter");
    counter = await counterFactory.deploy();

    const infiniteLoopFactory = await ethers.getContractFactory("InfiniteLoop");
    infiniteLoop = await infiniteLoopFactory.deploy();

    await Promise.all([
      depositGasTx.wait(),
      deployTx.wait(),
      counter.deployed(),
      infiniteLoop.deployed(),
    ]);
  });

  it("should send ether", async () => {
    // Arrange
    const gasPrice = await ethers.provider.getGasPrice();
    const gasBalance = await ethers.provider.getBalance(actorAddress);

    // Deposit 1000 ether to the actor
    const [signer] = await ethers.getSigners();

    const depositTx = await signer.sendTransaction({
      to: actorAddress,
      value: ethers.utils.parseEther("1000"),
    });

    await depositTx.wait();

    const originalSignerBalance = await ethers.provider.getBalance(signer.address);

    expect(await ethers.provider.getBalance(actorAddress)).to.equal(
      ethers.utils.parseEther("1000").add(gasBalance)
    );

    const destination = ethers.Wallet.createRandom();

    // Act
    const payload = encodePayload({
      from: actorAddress,
      nonce: 0,
      to: destination.address,
      value: ethers.utils.parseEther("1000"),
      gasLimit: 500_000,
      gasPrice,
      calldata: [],
    });

    const { coseSign1, coseKey } = cip8.signCIP8(
      Buffer.from(payload.slice(2), "hex"),
      privateKey,
      mainchainAddress
    );

    const executeTx = await actor.execute(coseSign1.to_bytes(), coseKey.to_bytes(), {
      gasLimit: 500_000,
      gasPrice,
    });

    const receipt = await executeTx.wait();

    const paidForGas = receipt.gasUsed.mul(receipt.effectiveGasPrice);

    // Assert
    // should've send whole balance to the destination
    expect(await ethers.provider.getBalance(actorAddress)).to.equal(gasBalance.sub(paidForGas));
    expect(await ethers.provider.getBalance(destination.getAddress())).to.equal(
      ethers.utils.parseEther("1000")
    );

    // Actor transaction should've succeeded
    const responseEvent = receipt.events?.at(0) as ResponseEvent;
    expect(responseEvent.args?.success).to.be.true;

    // signer's balance should be left unchanged
    expect(await ethers.provider.getBalance(signer.address)).to.equal(originalSignerBalance);
  });

  it("should call destination contract", async () => {
    // Arrange
    const gasPrice = await ethers.provider.getGasPrice();
    const [signer] = await ethers.getSigners();
    const originalSignerBalance = await ethers.provider.getBalance(signer.address);

    const gasBalance = await ethers.provider.getBalance(actorAddress);

    const destination = counter;
    const initialCount = await counter.count();

    // Act
    const payload = encodePayload({
      from: actorAddress,
      nonce: 1,
      to: destination.address,
      value: 0,
      gasLimit: 500_000,
      gasPrice,
      calldata: destination.interface.encodeFunctionData("increment", [42]),
    });

    const { coseSign1, coseKey } = cip8.signCIP8(
      Buffer.from(payload.slice(2), "hex"),
      privateKey,
      mainchainAddress
    );

    const executeTx = await actor.execute(coseSign1.to_bytes(), coseKey.to_bytes(), {
      gasLimit: 500_000,
      gasPrice,
    });

    const receipt = await executeTx.wait();

    const paidForGas = receipt.gasUsed.mul(receipt.effectiveGasPrice);

    // Assert
    expect(await ethers.provider.getBalance(actorAddress)).to.equal(gasBalance.sub(paidForGas));
    expect(await destination.count()).to.equal(initialCount.add(42));

    // Actor transaction should've succeeded
    const responseEvent = receipt.events?.at(0) as ResponseEvent;
    expect(responseEvent.args?.success).to.be.true;

    // signer's balance should be left unchanged
    expect(await ethers.provider.getBalance(signer.address)).to.equal(originalSignerBalance);
  });

  it("should deploy and execute transaction", async () => {
    // Arrange
    const gasPrice = await ethers.provider.getGasPrice();
    const [signer] = await ethers.getSigners();
    const salt = ethers.utils.hexlify(ethers.utils.randomBytes(32));
    const factory = await getActorFactory();

    const actorAddress = await getActorAddress(factory.address, mainchainAddress, salt);

    const gasBalance = ethers.utils.parseEther("2000000");

    const depositGasTx = await signer.sendTransaction({
      to: actorAddress,
      value: gasBalance,
    });

    await depositGasTx.wait();

    const destination = counter;
    const initialCount = await counter.count();

    const payload = encodePayload({
      from: actorAddress,
      nonce: 0,
      to: destination.address,
      value: 0,
      gasLimit: 1_000_000,
      gasPrice,
      calldata: destination.interface.encodeFunctionData("increment", [42]),
    });

    const { coseSign1, coseKey } = cip8.signCIP8(
      Buffer.from(payload.slice(2), "hex"),
      privateKey,
      mainchainAddress
    );

    // Act
    const deployTx = await factory.deployAndExecute(
      mainchainAddress,
      salt,
      coseSign1.to_bytes(),
      coseKey.to_bytes(),
      1_000_000,
      { gasLimit: 2_000_000, gasPrice }
    );

    const receipt = await deployTx.wait();

    console.log(receipt.gasUsed.mul(receipt.effectiveGasPrice));
    console.log(gasBalance.sub(await ethers.provider.getBalance(actorAddress)));

    // Assert
    const actor = await ethers.getContractAt("Actor", actorAddress);

    expect(await destination.count()).to.equal(initialCount.add(42));
    expect(await actor.nonce()).to.equal(1);
  });

  it("should revert if different gasLimit was provided", async () => {
    // Arrange
    const gasPrice = await ethers.provider.getGasPrice();
    const destination = counter;
    const initialCount = await counter.count();

    const payload = encodePayload({
      from: actorAddress,
      nonce: 2,
      to: destination.address,
      value: 0,
      gasLimit: 500_000,
      gasPrice,
      calldata: destination.interface.encodeFunctionData("increment", [42]),
    });

    const { coseSign1, coseKey } = cip8.signCIP8(
      Buffer.from(payload.slice(2), "hex"),
      privateKey,
      mainchainAddress
    );

    // Act
    const tx = await actor.execute(coseSign1.to_bytes(), coseKey.to_bytes(), {
      gasLimit: 400_000,
      gasPrice,
    });

    await expect(tx.wait()).to.be.rejected;

    // Assert
    expect(await destination.count()).to.equal(initialCount);
    expect(await actor.nonce()).to.equal(2);
  });

  it("should revert if different gasPrice was provided", async () => {
    // Arrange
    const gasPrice = await ethers.provider.getGasPrice();
    const destination = counter;
    const initialCount = await counter.count();

    const payload = encodePayload({
      from: actorAddress,
      nonce: 2,
      to: destination.address,
      value: 0,
      gasLimit: 500_000,
      gasPrice,
      calldata: destination.interface.encodeFunctionData("increment", [42]),
    });

    const { coseSign1, coseKey } = cip8.signCIP8(
      Buffer.from(payload.slice(2), "hex"),
      privateKey,
      mainchainAddress
    );

    // Act
    const tx = await actor.execute(coseSign1.to_bytes(), coseKey.to_bytes(), {
      gasLimit: 500_000,
      gasPrice: gasPrice.add(100),
    });

    await expect(tx.wait()).to.be.rejected;

    // Assert
    expect(await destination.count()).to.equal(initialCount);
    expect(await actor.nonce()).to.equal(2);
  });

  it("should revert if private key is invalid", async () => {
    // Arrange
    const gasPrice = await ethers.provider.getGasPrice();
    const destination = counter;
    const initialCount = await counter.count();

    const payload = encodePayload({
      from: actorAddress,
      nonce: 2,
      to: destination.address,
      value: 0,
      gasLimit: 500_000,
      gasPrice,
      calldata: destination.interface.encodeFunctionData("increment", [42]),
    });

    const { coseSign1, coseKey } = cip8.signCIP8(
      Buffer.from(payload.slice(2), "hex"),
      // bad private key,
      "ed25519e_sk1tzvc2amgpuz9ryhgg37gcmk0280mu02ktfkzcx7a28qc68phe3dnppwe830teqt2wk3nflwhlyneexkn37vnkqlfv9wzk4hz62e6fkcyk83hj",
      mainchainAddress
    );

    const tx = await actor.execute(coseSign1.to_bytes(), coseKey.to_bytes(), {
      gasLimit: 500_000,
      gasPrice,
    });

    await expect(tx.wait()).to.be.rejected;

    // Assert
    expect(await destination.count()).to.equal(initialCount);
    expect(await actor.nonce()).to.equal(2);
  });

  it("should revert with not matching address", async () => {
    // Arrange
    const gasPrice = await ethers.provider.getGasPrice();
    const destination = counter;
    const initialCount = await counter.count();

    const payload = encodePayload({
      from: actorAddress,
      nonce: 2,
      to: destination.address,
      value: 0,
      gasLimit: 500_000,
      gasPrice,
      calldata: destination.interface.encodeFunctionData("increment", [42]),
    });

    const { coseSign1, coseKey } = cip8.signCIP8(
      Buffer.from(payload.slice(2), "hex"),
      privateKey,
      // bad address
      "addr_test1qpmh9svhrqxg7u6nqdxh44zlz0l2w22xc4zpwwfvj84cfwg2w3neh3dundxpwsr229yffepdec0z0yusftfn5teh6qwss2pt3j"
    );

    // Act
    const tx = await actor.execute(coseSign1.to_bytes(), coseKey.to_bytes(), {
      gasLimit: 500_000,
      gasPrice,
    });

    await expect(tx.wait()).to.be.rejected;

    // Assert
    expect(await destination.count()).to.equal(initialCount);
    expect(await actor.nonce()).to.equal(2);
  });

  it("should revert with incorrect nonce", async () => {
    // Arrange
    const gasPrice = await ethers.provider.getGasPrice();
    const destination = counter;
    const initialCount = await counter.count();
    const wrongNonce = 69;

    const payload = encodePayload({
      from: actorAddress,
      nonce: wrongNonce,
      to: destination.address,
      value: 0,
      gasLimit: 500_000,
      gasPrice,
      calldata: destination.interface.encodeFunctionData("increment", [42]),
    });

    const { coseSign1, coseKey } = cip8.signCIP8(
      Buffer.from(payload.slice(2), "hex"),
      privateKey,
      mainchainAddress
    );

    // Act
    const tx = await actor.execute(coseSign1.to_bytes(), coseKey.to_bytes(), {
      gasLimit: 500_000,
      gasPrice,
    });

    await expect(tx.wait()).to.be.rejected;

    // Assert
    expect(await destination.count()).to.equal(initialCount);
    expect(await actor.nonce()).to.equal(2);
  });

  it("should revert with incorrect from address", async () => {
    // Arrange
    const gasPrice = await ethers.provider.getGasPrice();
    const destination = counter;
    const initialCount = await counter.count();

    const wrongAddress = ethers.Wallet.createRandom().address;

    const payload = encodePayload({
      from: wrongAddress,
      nonce: 2,
      to: destination.address,
      value: 0,
      gasLimit: 500_000,
      gasPrice,
      calldata: destination.interface.encodeFunctionData("increment", [42]),
    });

    const { coseSign1, coseKey } = cip8.signCIP8(
      Buffer.from(payload.slice(2), "hex"),
      privateKey,
      mainchainAddress
    );

    // Act
    const tx = await actor.execute(coseSign1.to_bytes(), coseKey.to_bytes(), {
      gasLimit: 500_000,
      gasPrice,
    });

    await expect(tx.wait()).to.be.rejected;

    // Assert
    expect(await destination.count()).to.equal(initialCount);
    expect(await actor.nonce()).to.equal(2);
  });

  it("should call inifinite loop and finish refund", async () => {
    // Arrange
    const gasPrice = await ethers.provider.getGasPrice();
    const [signer] = await ethers.getSigners();
    const originalSignerBalance = await ethers.provider.getBalance(signer.address);

    const gasBalance = await ethers.provider.getBalance(actorAddress);

    const destination = infiniteLoop;

    // Act
    const payload = encodePayload({
      from: actorAddress,
      nonce: 2,
      to: destination.address,
      value: 0,
      gasLimit: 1_000_000,
      gasPrice,
      calldata: destination.interface.encodeFunctionData("loop"),
    });

    const { coseSign1, coseKey } = cip8.signCIP8(
      Buffer.from(payload.slice(2), "hex"),
      privateKey,
      mainchainAddress
    );

    const executeTx = await actor.execute(coseSign1.to_bytes(), coseKey.to_bytes(), {
      gasLimit: 1_000_000,
      gasPrice,
    });

    const receipt = await executeTx.wait();

    const paidForGas = receipt.gasUsed.mul(receipt.effectiveGasPrice);

    // Assert
    expect(await ethers.provider.getBalance(actorAddress)).to.equal(gasBalance.sub(paidForGas));

    // Actor transaction should have failed
    const responseEvent = receipt.events?.at(0) as ResponseEvent;
    expect(responseEvent.args?.success).to.be.false;

    // signer's balance should be left unchanged
    expect(await ethers.provider.getBalance(signer.address)).to.equal(originalSignerBalance);
  });
});
