import { task } from "hardhat/config";

task("actor-factory:deploy", "Deploy the actor factory contract")
  .addParam("l1Type", "Cardano or Algorand")
  .setAction(async ({ l1Type }, { ethers }) => {
    const factory = await ethers.getContractFactory("ActorFactory");

    const contract = await factory.deploy(l1Type === "Algorand" ? 0 : 1);

    await contract.deployed();

    console.log(`Actor factory deployed at address ${contract.address}`);
  });
