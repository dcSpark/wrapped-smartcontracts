import { task } from "hardhat/config";

task("deploy:counter", "Deploy the testing counter contract").setAction(async (_, { ethers }) => {
  const factory = await ethers.getContractFactory("Counter");

  const contract = await factory.deploy();

  await contract.deployed();

  console.log(`Counter deployed at address ${contract.address}`);
});
