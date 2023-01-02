import { task } from "hardhat/config";

task("actor-factory:deploy", "Deploy the actor factory contract").setAction(
  async (_, { ethers }) => {
    const factory = await ethers.getContractFactory("ActorFactory");

    const contract = await factory.deploy();

    await contract.deployed();

    console.log(`Actor factory deployed at address ${contract.address}`);
  }
);
