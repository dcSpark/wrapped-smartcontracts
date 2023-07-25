import { ethers } from "ethers";
import { Blockfrost, Lucid, WalletApi } from "lucid-cardano";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { default as bridgeArtifact } from "./contracts/bridge_abi_v1.json";
import { bech32ToHexAddress, hexToBytes } from "./utils";
let cml: typeof import("@dcspark/cardano-multiplatform-lib-browser");

const JSON_RPC_URL = "https://rpc-devnet-cardano-evm.c1.milkomeda.com";
const ORACLE_URL = "http://localhost:8080";

const STARGATE_ADDRESS = "addr_test1wz6lvjg3anml96vl22mls5vae3x2cgaqwy2ewp5gj3fcxdcw652wz";
const BLOCKFROST_API_KEY = "preprodliMqEQ9cvQgAFuV7b6dhA4lkjTX1eBLb";

const BRIDGE_ADDRESS = "0x319f10d19e21188ecF58b9a146Ab0b2bfC894648";

const inject = async () => {
  const provider = await import("milkomeda-wsc-provider");
  await provider.injectCardano(ORACLE_URL, JSON_RPC_URL).setup();

  cml = await import("@dcspark/cardano-multiplatform-lib-browser");
};

export const getLucid = async (key: string) =>
  Lucid.new(new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", key), "Preprod");

const wrap = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const lucid = await getLucid(BLOCKFROST_API_KEY);

  const destination = await provider.getSigner().getAddress();

  const api = await window.cardano.enable();

  lucid.selectWallet(api as unknown as WalletApi);

  const amountToWrap = prompt("Amount to wrap");

  const tx = await lucid
    .newTx()
    .payToAddress(STARGATE_ADDRESS, { lovelace: BigInt(amountToWrap) * BigInt(10 ** 6) })
    .attachMetadata(87, "devnet.cardano-evm.c1")
    .attachMetadata(88, destination)
    .complete();

  const signedTx = await tx.sign().complete();

  const txHash = await signedTx.submit();

  console.log(txHash);
  alert("Wrapping submitted");
};

const swap = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const swapContract = new ethers.Contract(
    "0xAE84Ee320C66F2E1f984e28cACa37492f853FC6a",
    [
      "function swapExactETHForTokensWithPortfolios(uint256,address[],address,uint256,address[],uint256) payable returns (uint256[])",
    ],
    provider
  );

  const signer = provider.getSigner();

  const deadline = Math.floor(Date.now() / 1000) + 60;

  const amountToSwap = ethers.utils.parseEther(prompt("Amount to swap"));

  const tx = await swapContract.connect(signer).swapExactETHForTokensWithPortfolios(
    0, // amountOutMin
    [
      // path
      "0x1a40217B16E7329E27FDC9cED672e1F264e07Cc2", // wADA
      "0x5fA38625dbd065B3e336e7ef627B06a8e6090e8F", // m3s6
    ],
    await signer.getAddress(), // to
    deadline, // deadline
    ["0xe91645ACbeC95400E26C4fDb87052D45a0aDE9A6"], // portfolios
    0,
    { value: amountToSwap, gasLimit: 1_000_000 }
  );

  console.log(tx.hash);

  await tx.wait();

  console.log("Swapped");
};

const unwrap = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const tokenContract = new ethers.Contract(
    "0x5fA38625dbd065B3e336e7ef627B06a8e6090e8F",
    ["function approve(address spender, uint256 amount) public returns (bool)"],
    provider
  );
  const bridgeContract = new ethers.Contract(BRIDGE_ADDRESS, bridgeArtifact.abi, provider);

  const signer = provider.getSigner();

  const amountToUnwrap = ethers.utils.parseUnits(prompt("Amount to swap"), 6);

  const approvalTx = await tokenContract
    .connect(signer)
    .approve(BRIDGE_ADDRESS, amountToUnwrap, { gasLimit: 1_000_000 });

  console.log(approvalTx.hash);

  await approvalTx.wait();

  const api = await window.cardano.enable();
  const cardanoDestination = bech32ToHexAddress(
    cml.Address.from_bytes(hexToBytes(await api.getChangeAddress())).to_bech32()
  );

  const tx = await bridgeContract.connect(signer).submitUnwrappingRequest(
    {
      assetId: "0x1a19f891ca4d508c7f86ec03c598b7d11c2f1cc6000000000000000000000000",
      from: await signer.getAddress(),
      to: cardanoDestination,
      amount: amountToUnwrap,
    },
    { gasLimit: 1_000_000, value: ethers.utils.parseEther("4") }
  );

  console.log(tx.hash);

  await tx.wait();

  console.log("Unwrapped");
};

const App = () => {
  useEffect(() => {
    inject().catch(console.error);
  }, []);

  return (
    <>
      <Link to="/">
        <h1>Back</h1>
      </Link>
      <h1>Swap</h1>
      <div>
        <button onClick={wrap}>Wrap</button>
      </div>
      <div>
        <button onClick={swap}>Swap</button>
      </div>
      <div>
        <button onClick={unwrap}>Unwrap</button>
      </div>
    </>
  );
};

export default App;
