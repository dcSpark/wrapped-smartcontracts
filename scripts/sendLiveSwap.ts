import axios from "axios";
import { ethers } from "hardhat";
import { encodePayload, getActorInitCode } from "../test/fixtures";

const main = async () => {
  const bridgeAddress = "0x319f10d19e21188ecF58b9a146Ab0b2bfC894648";
  const swapAddress = "0x5008FE488dd5370B5970DFc35a7De45752F4EE36";
  const tokenAssetId = "0xa67511d72436041586a68fc22ea9579e1fecb052000000000000000000000000";
  const tokenAddress = "0xAfd5A8443C2BbDB01e875A5C6e59337938651DA6";
  const mainchainAddress =
    "addr_test1qrhtzksm78slgfypumge0qv8k73fzg4ul7c0pwuk56xxw3445wq8vu5m3lqwremlt7erutjem9622qne4xcy28quut0smg0ckh";

  const salt = ethers.utils.hashMessage(Date.now().toString());
  const amount = ethers.utils.parseEther("10");
  const unwrapFee = ethers.utils.parseEther("4");

  const initCode = await getActorInitCode("SwapActor", {
    payload: encodePayload(
      ["address", "address", "address", "bytes32", "bytes", "uint256", "uint256"],
      [
        swapAddress,
        bridgeAddress,
        tokenAddress,
        tokenAssetId,
        ethers.utils.toUtf8Bytes(mainchainAddress),
        amount,
        unwrapFee,
      ]
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
  let tx = await ethers.provider.getTransaction(txHash);
  await tx.wait();
  console.log("Actor deployed");

  console.log("Waiting for wrap");
  while (!(await axios.get(`http://localhost:8080/canExecute/${actorAddress}`)).data.canExecute) {
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  console.log("Sending request to execute actor");
  const execResponse = await axios.post("http://localhost:8080/execute", {
    actorAddress,
  });

  console.log(execResponse.data);
  console.log("Waiting for execution");
  tx = await ethers.provider.getTransaction(execResponse.data.txHash);
  await tx.wait();
  console.log("Executed");

  console.log((await axios.get(`http://localhost:8080/canWithdraw/${actorAddress}`)).data);

  console.log("Sending request to withdraw actor");
  const withdrawResponse = await axios.post("http://localhost:8080/withdraw", {
    actorAddress,
  });

  console.log(withdrawResponse.data);
};

main().catch(console.error);
