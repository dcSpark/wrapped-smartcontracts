import { task } from "hardhat/config";

task("actor:deploy", "Deploy the Actor contract")
  .addParam("actorFactory", "The address of the ActorFactory contract")
  .addParam("cardanoAddress", "The Cardano address of the actor")
  .setAction(async ({ actorFactory, cardanoAddress }, { ethers }) => {
    const factory = await ethers.getContractAt("ActorFactory", actorFactory);

    const tx = await factory.deploy(cardanoAddress, `0x${"0".repeat(64)}`);

    const receipt = await tx.wait();

    console.log(`Actor deployed at address ${receipt.events?.at(0)?.args?.at(0)}`);
  });
