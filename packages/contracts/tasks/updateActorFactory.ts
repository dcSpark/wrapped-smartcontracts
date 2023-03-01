import { task } from "hardhat/config";
import fs from "fs";

task(
  "actor-factory:update-genesis-block",
  "Update the genesis block with the actor factory contract"
)
  .addPositionalParam("genesisFile", "Genesis file")
  .setAction(async ({ genesisFile }, { artifacts }) => {
    const genesis = JSON.parse(fs.readFileSync(genesisFile, "utf8"));

    const actorFactoryArtifact = await artifacts.readArtifact("ActorFactory");

    genesis.alloc["0000000000000000000000000000000000111111"].code =
      actorFactoryArtifact.deployedBytecode;

    fs.writeFileSync(genesisFile, JSON.stringify(genesis, null, 2) + "\n", "utf8");
  });
