import axios from "axios";
import { ethers } from "hardhat";
import { encodePayload, getActorInitCode } from "../test/fixtures";
import { ExampleContract } from "../typechain-types/dev";

const prepareExampleContract = async (): Promise<ExampleContract> => {
  const exampleFactory = await ethers.getContractFactory("ExampleContract");
  const exampleContract = await exampleFactory.deploy();

  console.log("Deploying example contract");
  await exampleContract.deployTransaction.wait();
  console.log("Example contract deployed");

  return exampleContract;
};

const main = async () => {
  const exampleContract = await prepareExampleContract();

  const salt = ethers.utils.hashMessage(Date.now().toString());

  const initCode = await getActorInitCode("ExampleActor", {
    payload: encodePayload(
      ["bool", "string", "address"],
      [true, "Hello World", exampleContract.address]
    ),
    emergencyWithdrawalTimeout: 0,
  });

  console.log("Sending request to deploy actor");
  const { data } = await axios.post("http://localhost:8080/deploy", {
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
