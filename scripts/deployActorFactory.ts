import { ethers } from "hardhat";

const main = async () => {
  const factory = await ethers.getContractFactory("ActorFactory");
  const actorFactory = await factory.deploy();

  return actorFactory.address;
};

main().then(console.log).catch(console.error);
