import { ethers } from "ethers";
import React from "react";

// Deployed in testing genesis block, change for live chain
const COUNTER_ADDRESS = "0000000000000000000000000000000000222222";

const App = () => {
  const inject = async () => {
    const provider = await import("provider");
    await provider.inject("http://localhost:8080", "http://localhost:8545").setup();

    alert("Injected");
  };

  const eth_requestAccounts = async () => {
    const result = (await window.ethereum.request({
      method: "eth_requestAccounts",
      params: [],
    })) as string[];

    alert(result);
  };

  const eth_accounts = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.listAccounts();
    alert(accounts);
  };

  const eth_blockNumber = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const blockNumber = await provider.getBlockNumber();
    alert(blockNumber);
  };

  const eth_getBalance = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const balance = await provider.getBalance(signer.getAddress());
    alert(balance);
  };

  const sendEther = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const receiverAddress = prompt("Receiver address");

    console.log(
      await signer.sendTransaction({
        to: receiverAddress,
        value: ethers.utils.parseEther("1.0"),
        gasLimit: 1_000_000,
      })
    );
  };

  const getCounter = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const counter = new ethers.Contract(
      COUNTER_ADDRESS,
      ["function count() view returns (uint256)", "function increment(uint256)"],
      provider
    );

    alert(await counter.count());
  };

  const incrementCounter = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
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
      <div>
        <button onClick={inject}>Inject</button>
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
