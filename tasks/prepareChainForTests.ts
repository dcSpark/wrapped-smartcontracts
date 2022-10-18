import { task } from "hardhat/config";

task("prepare-chain-for-tests", "Prepares the chain for integration tests").setAction(
  async (_, { ethers }) => {
    const [hardhatAccount] = await ethers.getSigners();

    const signer = ethers.Wallet.createRandom();

    await hardhatAccount.sendTransaction({
      to: signer.address,
      value: ethers.utils.parseEther("100"),
    });

    const f = await ethers.getContractFactory("ActorFactory");
    const actorFactory = await f.deploy();

    console.log(signer.privateKey, actorFactory.address);
  }
);
