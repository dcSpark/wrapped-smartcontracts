import { expect } from "chai";
import { ethers } from "hardhat";
import cip8 from "../utils/cip8";
import { Actor, Counter } from "../typechain-types";
import { getActorAddress, getActorFactory } from "./fixtures";

describe("Actor", () => {
  const salt = ethers.utils.hexlify(ethers.utils.randomBytes(32));

  const privateKey =
    "ed25519e_sk1wzm7jmql8tnf3p4yx5seg389dhrg49z9j86a0hrwemehcx3he3dlvxcc663vxnl4anykugu9ttu94yfzuq5ulrxc6lckl647tm58jhqrr7at4";
  const mainchainAddress =
    "addr_test1qz5dj9dh8cmdxvtr4jh3kca8rjw0vjt4anz79k4aefh9wcjjvmavqj3jhujkkn4kpz9ky09xhtt4v3447fesn7ptkfvsa0ymyn";

  let actorAddress: string;
  let actor: Actor;
  let counter: Counter;

  before(async () => {
    const factory = await getActorFactory();
    actorAddress = await getActorAddress(factory.address, mainchainAddress, salt);

    const deployTx = await factory.deploy(mainchainAddress, salt);
    await deployTx.wait();

    actor = await ethers.getContractAt("Actor", actorAddress);

    const contractFactory = await ethers.getContractFactory("Counter");
    counter = await contractFactory.deploy();
  });

  it("should send ether", async () => {
    // Arrange
    // Deposit 1000 ether to the actor
    const [signer] = await ethers.getSigners();

    const depositTx = await signer.sendTransaction({
      to: actorAddress,
      value: ethers.utils.parseEther("1000"),
    });

    await depositTx.wait();

    expect(await ethers.provider.getBalance(actorAddress)).to.equal(
      ethers.utils.parseEther("1000")
    );

    const destination = ethers.Wallet.createRandom();

    // Act
    const payload = ethers.utils.defaultAbiCoder
      .encode(
        ["uint256", "address", "uint256", "bytes"], // nonce, to, value, calldata
        [0, destination.address, ethers.utils.parseEther("1000"), []]
      )
      .slice(2);

    const { coseSign1, coseKey } = cip8.signCIP8(
      Buffer.from(payload, "hex"),
      privateKey,
      mainchainAddress
    );

    const executeTx = await actor.execute(coseSign1.to_bytes(), coseKey.to_bytes());

    await executeTx.wait();

    // Assert
    // should've send whole balance to the destination
    expect(await ethers.provider.getBalance(actorAddress)).to.equal(0);
    expect(await ethers.provider.getBalance(destination.getAddress())).to.equal(
      ethers.utils.parseEther("1000")
    );
  });

  it("should call destination contract", async () => {
    // Arrange
    const destination = counter;
    const initialCount = await counter.count();

    // Act
    const payload = ethers.utils.defaultAbiCoder
      .encode(
        ["uint256", "address", "uint256", "bytes"], // nonce, to, value, calldata
        [1, destination.address, 0, destination.interface.encodeFunctionData("increment", [42])]
      )
      .slice(2);

    const { coseSign1, coseKey } = cip8.signCIP8(
      Buffer.from(payload, "hex"),
      privateKey,
      mainchainAddress
    );

    const executeTx = await actor.execute(coseSign1.to_bytes(), coseKey.to_bytes());

    await executeTx.wait();

    // Assert
    expect(await destination.count()).to.equal(initialCount.add(42));
  });

  it("should deploy and execute transaction", async () => {
    // Arrange
    const salt = ethers.utils.hexlify(ethers.utils.randomBytes(32));
    const factory = await getActorFactory();

    const destination = counter;
    const initialCount = await counter.count();

    const payload = ethers.utils.defaultAbiCoder
      .encode(
        ["uint256", "address", "uint256", "bytes"], // nonce, to, value, calldata
        [0, destination.address, 0, destination.interface.encodeFunctionData("increment", [42])]
      )
      .slice(2);

    const { coseSign1, coseKey } = cip8.signCIP8(
      Buffer.from(payload, "hex"),
      privateKey,
      mainchainAddress
    );

    // Act
    const deployTx = await factory.deployAndExecute(
      mainchainAddress,
      salt,
      coseSign1.to_bytes(),
      coseKey.to_bytes()
    );

    await deployTx.wait();

    // Assert
    const actorAddress = await getActorAddress(factory.address, mainchainAddress, salt);
    const actor = await ethers.getContractAt("Actor", actorAddress);

    expect(await destination.count()).to.equal(initialCount.add(42));
    expect(await actor.nonce()).to.equal(1);
  });

  it("should revert if private key is invalid", async () => {
    // Arrange
    const destination = counter;
    const initialCount = await counter.count();

    const payload = ethers.utils.defaultAbiCoder
      .encode(
        ["uint256", "address", "uint256", "bytes"], // nonce, to, value, calldata
        [2, destination.address, 0, destination.interface.encodeFunctionData("increment", [42])]
      )
      .slice(2);

    const { coseSign1, coseKey } = cip8.signCIP8(
      Buffer.from(payload, "hex"),
      // bad private key,
      "ed25519e_sk1tzvc2amgpuz9ryhgg37gcmk0280mu02ktfkzcx7a28qc68phe3dnppwe830teqt2wk3nflwhlyneexkn37vnkqlfv9wzk4hz62e6fkcyk83hj",
      mainchainAddress
    );

    // Act
    await expect(actor.execute(coseSign1.to_bytes(), coseKey.to_bytes())).to.be.rejected;

    // Assert
    expect(await destination.count()).to.equal(initialCount);
    expect(await actor.nonce()).to.equal(2);
  });

  it("should revert with not matching address", async () => {
    // Arrange
    const destination = counter;
    const initialCount = await counter.count();

    const payload = ethers.utils.defaultAbiCoder
      .encode(
        ["uint256", "address", "uint256", "bytes"], // nonce, to, value, calldata
        [2, destination.address, 0, destination.interface.encodeFunctionData("increment", [42])]
      )
      .slice(2);

    const { coseSign1, coseKey } = cip8.signCIP8(
      Buffer.from(payload, "hex"),
      privateKey,
      // bad address
      "addr_test1qpmh9svhrqxg7u6nqdxh44zlz0l2w22xc4zpwwfvj84cfwg2w3neh3dundxpwsr229yffepdec0z0yusftfn5teh6qwss2pt3j"
    );

    // Act
    await expect(actor.execute(coseSign1.to_bytes(), coseKey.to_bytes())).to.be.rejected;

    // Assert
    expect(await destination.count()).to.equal(initialCount);
    expect(await actor.nonce()).to.equal(2);
  });

  it("should revert with incorrect nonce", async () => {
    // Arrange
    const destination = counter;
    const initialCount = await counter.count();
    const wrongNonce = 69;

    const payload = ethers.utils.defaultAbiCoder
      .encode(
        ["uint256", "address", "uint256", "bytes"], // nonce, to, value, calldata
        [
          wrongNonce,
          destination.address,
          0,
          destination.interface.encodeFunctionData("increment", [42]),
        ]
      )
      .slice(2);

    const { coseSign1, coseKey } = cip8.signCIP8(
      Buffer.from(payload, "hex"),
      privateKey,
      mainchainAddress
    );

    // Act
    await expect(actor.execute(coseSign1.to_bytes(), coseKey.to_bytes())).to.be.rejected;

    // Assert
    expect(await destination.count()).to.equal(initialCount);
    expect(await actor.nonce()).to.equal(2);
  });
});
