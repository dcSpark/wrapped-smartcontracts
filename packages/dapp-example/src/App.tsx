import React from "react";

const App = () => {
  const inject = async () => {
    const provider = await import("provider");
    provider.inject("http://localhost:3000");

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
    const result = (await window.ethereum.request({
      method: "eth_accounts",
      params: [],
    })) as string[];

    alert(result);
  };

  const eth_blockNumber = async () => {
    const result = (await window.ethereum.request({
      method: "eth_blockNumber",
      params: [],
    })) as string;

    alert(result);
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
    </>
  );
};

export default App;
