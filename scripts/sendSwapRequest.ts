import axios from "axios";
import { ethers } from "hardhat";
import { encodePayload, getActorInitCode } from "../test/fixtures";
import { SidechainBridge, SimpleSwap, TestToken } from "../typechain-types";

const prepareToken = async (): Promise<TestToken> => {
  const tokenFactory = await ethers.getContractFactory("TestToken");
  const token = await tokenFactory.deploy("Test Token", "TT");

  await token.deployTransaction.wait();

  return token;
};

const prepareBridge = async (tokens: TestToken[]): Promise<SidechainBridge> => {
  const bridgeFactory = await ethers.getContractFactory("SidechainBridge");
  const bridge = await bridgeFactory.deploy(tokens.map((t) => t.address));

  await bridge.deployTransaction.wait();

  return bridge;
};

const prepareSwap = async (): Promise<SimpleSwap> => {
  const swapFactory = await ethers.getContractFactory("SimpleSwap");
  const swap = await swapFactory.deploy();

  await swap.deployTransaction.wait();

  return swap;
};

const main = async () => {
  const token = await prepareToken();
  const bridge = await prepareBridge([token]);
  const swap = await prepareSwap();
  const [bridgeSigner] = await ethers.getSigners();

  const mintTx = await token.mint(swap.address, ethers.utils.parseEther("1000"));
  await mintTx.wait();

  const salt = ethers.utils.hashMessage(Date.now().toString());
  const amount = ethers.utils.parseEther("100");
  const unwrapFee = ethers.utils.parseEther("1");

  const initCode = await getActorInitCode("SwapActor", {
    payload: encodePayload(
      ["address", "address", "address", "bytes32", "bytes", "uint256", "uint256"],
      [
        swap.address,
        bridge.address,
        token.address,
        ethers.utils.hexZeroPad(token.address, 32),
        ethers.utils.toUtf8Bytes("mainchain address"),
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
  const tx = await ethers.provider.getTransaction(txHash);
  await tx.wait();
  console.log("Actor deployed");

  console.log("Wrapping");
  const wrapTx = await bridgeSigner.sendTransaction({
    to: actorAddress,
    value: amount.add(unwrapFee),
  });
  await wrapTx.wait();

  console.log("Sending request to execute actor");
  const execResponse = await axios.post("http://localhost:8080/execute", {
    actorAddress,
  });

  console.log(execResponse.data);

  console.log((await axios.get(`http://localhost:8080/canWithdraw/${actorAddress}`)).data);

  console.log("Sending request to withdraw actor");
  const withdrawResponse = await axios.post("http://localhost:8080/withdraw", {
    actorAddress,
  });

  console.log(withdrawResponse.data);
  console.log(await token.balanceOf(bridge.address));
};

main().catch(console.error);
