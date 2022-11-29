import { expect } from "chai";
import { ethers } from "hardhat";
import cip8 from "../utils/cip8";
import { Actor } from "../typechain-types";
import { getActorAddress, getActorFactory } from "./fixtures";

describe("Actor", () => {
  const salt = ethers.utils.hexlify(ethers.utils.randomBytes(32));

  const privateKey =
    "ed25519e_sk1wzm7jmql8tnf3p4yx5seg389dhrg49z9j86a0hrwemehcx3he3dlvxcc663vxnl4anykugu9ttu94yfzuq5ulrxc6lckl647tm58jhqrr7at4";
  const mainchainAddress =
    "addr_test1qz5dj9dh8cmdxvtr4jh3kca8rjw0vjt4anz79k4aefh9wcjjvmavqj3jhujkkn4kpz9ky09xhtt4v3447fesn7ptkfvsa0ymyn";

  let actorAddress: string;
  let actor: Actor;

  before(async () => {
    const factory = await getActorFactory();
    actorAddress = await getActorAddress(factory.address, mainchainAddress, salt);

    const deployTx = await factory.deploy(mainchainAddress, salt);
    await deployTx.wait();

    actor = await ethers.getContractAt("Actor", actorAddress);
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
    const contractFactory = await ethers.getContractFactory("Counter");
    const destination = await contractFactory.deploy();
    const initialCount = await destination.count();

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
});
