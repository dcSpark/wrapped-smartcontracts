import { ethers } from "ethers";
import type { MilkomedaProvider } from "milkomeda-wsc-provider";
import React from "react";
import { Link } from "react-router-dom";

// Deployed in testing genesis block, change for live chain
const COUNTER_ADDRESS = "0000000000000000000000000000000000222222";

const App = () => {
  const [injectedProvider, setInjectedProvider] = React.useState<undefined | MilkomedaProvider>();
  const injectCardano = async () => {
    const provider = await import("milkomeda-wsc-provider");
    const injectedProvider = provider
      .injectCardano("http://localhost:8080", "https://rpc-devnet-cardano-evm.c1.milkomeda.com");
    setInjectedProvider(injectedProvider);
    await injectedProvider.setup(1);

    alert("Injected");
  };

  const injectAlgorand = async () => {
    const provider = await import("milkomeda-wsc-provider");
    const injectedProvider = provider
      .injectAlgorand("http://localhost:8080", "https://rpc-devnet-cardano-evm.c1.milkomeda.com");
    setInjectedProvider(injectedProvider);
    await injectedProvider.setup();

    alert("Injected");
  };

  const eth_requestAccounts = async () => {
    if (injectedProvider == null) alert("Provider not injected");
    const result = (await injectedProvider.request({
      method: "eth_requestAccounts",
      params: [],
    })) as string[];

    // also make sure it doesn't crash when no `params` is specified. This is allowed by EIP-1193
    (await injectedProvider.request({
      method: "eth_requestAccounts",
    })) as string[];

    alert(result);
  };

  const eth_accounts = async () => {
    if (injectedProvider == null) alert("Provider not injected");
    const provider = new ethers.providers.Web3Provider(injectedProvider);
    const accounts = await provider.listAccounts();
    alert(accounts);
  };

  const eth_blockNumber = async () => {
    if (injectedProvider == null) alert("Provider not injected");
    const provider = new ethers.providers.Web3Provider(injectedProvider);
    const blockNumber = await provider.getBlockNumber();
    alert(blockNumber);
  };

  const eth_getBalance = async () => {
    if (injectedProvider == null) alert("Provider not injected");
    const provider = new ethers.providers.Web3Provider(injectedProvider);
    const signer = provider.getSigner();
    const balance = await provider.getBalance(signer.getAddress());
    alert(ethers.utils.formatEther(balance));
  };

  const sendEther = async () => {
    if (injectedProvider == null) alert("Provider not injected");
    const provider = new ethers.providers.Web3Provider(injectedProvider);
    const signer = provider.getSigner();

    const receiverAddress = prompt("Receiver address");
    const amount = prompt("Amount");

    console.log(
      await signer.sendTransaction({
        to: receiverAddress,
        value: ethers.utils.parseEther(amount),
        gasLimit: 1_000_000,
      })
    );
  };

  const getCounter = async () => {
    if (injectedProvider == null) alert("Provider not injected");
    const provider = new ethers.providers.Web3Provider(injectedProvider);
    const counter = new ethers.Contract(
      COUNTER_ADDRESS,
      ["function count() view returns (uint256)", "function increment(uint256)"],
      provider
    );

    alert(await counter.count());
  };

  const incrementCounter = async () => {
    if (injectedProvider == null) alert("Provider not injected");
    const provider = new ethers.providers.Web3Provider(injectedProvider);
    const counter = new ethers.Contract(
      COUNTER_ADDRESS,
      ["function count() view returns (uint256)", "function increment(uint256)"],
      provider
    );

    const signer = provider.getSigner();

    console.log(await counter.connect(signer).increment(1, { gasLimit: 1_000_000 }));
  };

  return (
    <>
      <Link to="/swap">
        <h1>Swap page</h1>
      </Link>
      <div>
        <button onClick={injectCardano}>Inject Cardano</button>
      </div>
      <div>
        <button onClick={injectAlgorand}>Inject Algorand</button>
      </div>
      <div>
        <button onClick={eth_requestAccounts}>eth_requestAccounts</button>
      </div>
      <div>
        <button onClick={eth_accounts}>eth_accounts</button>
      </div>
      <div>
        <button onClick={eth_blockNumber}>eth_blockNumber</button>
      </div>
      <div>
        <button onClick={eth_getBalance}>eth_getBalance</button>
      </div>
      <div>
        <button onClick={sendEther}>sendEther</button>
      </div>
      <div>
        <button onClick={getCounter}>getCounter</button>
      </div>
      <div>
        <button onClick={incrementCounter}>incrementCounter</button>
      </div>
    </>
  );
};

export default App;
