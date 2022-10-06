import axios from "axios";
import { ethers } from "hardhat";
import { DeployResponse } from "../server/services/deploy.service";
import { getActorInitCode } from "../test/fixtures";

const main = async () => {
  const exampleFactory = await ethers.getContractFactory("ExampleContract");
  const exampleContract = await exampleFactory.deploy();

  console.log("Deploying example contract");
  await exampleContract.deployTransaction.wait();
  console.log("Example contract deployed");

  const salt = ethers.utils.hashMessage(Date.now().toString());
  const executeArgs = ethers.utils.defaultAbiCoder.encode(
    ["string", "address"],
    ["Hello World", exampleContract.address]
  );
  const executeConditionArgs = ethers.utils.defaultAbiCoder.encode(["bool"], [true]);

  const initCode = await getActorInitCode("ExampleActor", { executeArgs, executeConditionArgs });

  console.log("Sending request to deploy actor");
  const { data } = await axios.post<DeployResponse>("http://localhost:8080/deploy", {
    salt,
    initCode,
  });

  const { actorAddress, txHash } = data;

  console.log("Waiting for deployment");
  const tx = await ethers.provider.getTransaction(txHash);
  await tx.wait();
  console.log("Actor deployed");

  console.log("Sending request to execute actor");
  const execResponse = await axios.post("http://localhost:8080/execute", {
    actorAddress,
  });

  console.log(execResponse.data);
};

main().catch(console.error);
