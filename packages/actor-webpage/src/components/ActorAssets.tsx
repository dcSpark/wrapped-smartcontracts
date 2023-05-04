import React from "react";
import BigNumber from "bignumber.js";
import { EVMTokenBalance } from "../WSCLib";
import PendingManager from "../PendingManger";

interface WrappedSmartContractAssetsProps {
  destinationBalance: string | null;
  network: string | null;
  tokens: EVMTokenBalance[];
  unwrap: (destination: string | undefined, assetId: string, amount: number) => Promise<void>;
  moveAssetsToL1: (tokenId: string, tokenName: string) => void;
}

const WrappedSmartContractAssets: React.FC<WrappedSmartContractAssetsProps> = ({
  destinationBalance,
  network,
  tokens,
  unwrap,
  moveAssetsToL1,
}) => {
  return (
    <div>
      <h2>Assets in Your Wrapped Smart Contract Wallet</h2>
      <h4>
        (These are the assets held on Milkomeda. You can move them back to your Cardano wallet)
      </h4>
      <table>
        <thead>
          <tr>
            <th>Token</th>
            <th>Amount</th>
            <th>Contract Address</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {destinationBalance && (
            <tr>
              <td>ADA</td>
              <td>{destinationBalance}</td>
              <td>
                <a
                  href={`${PendingManager.getEVMExplorerUrl(
                    network
                  )}/address/0x319f10d19e21188ecF58b9a146Ab0b2bfC894648`}
                  target="_blank"
                  rel="noreferrer"
                >
                  0x319f...4648
                </a>
              </td>
              <td>
                <button
                  style={{ backgroundColor: "blue", color: "white" }}
                  onClick={() =>
                    unwrap(undefined, "0x319f10d19e21188ecF58b9a146Ab0b2bfC894648", parseInt(destinationBalance))
                    // moveAssetsToL1("0x319f10d19e21188ecF58b9a146Ab0b2bfC894648", "ADA")
                  }
                >
                  Move all to L1
                </button>
              </td>
            </tr>
          )}
          {tokens.map((token: EVMTokenBalance, index) => {
            const balance = new BigNumber(token.balance);
            const decimals = new BigNumber(token.decimals);
            const adjustedBalance = balance.dividedBy(new BigNumber(10).pow(decimals));
            const shortAddress = `${token.contractAddress.slice(
              0,
              6
            )}...${token.contractAddress.slice(-4)}`;

            return (
              <tr key={index}>
                <td>
                  {token.name} ({token.symbol.toUpperCase()})
                </td>
                <td>{adjustedBalance.toString()}</td>
                <td>
                  <a
                    href={`${PendingManager.getEVMExplorerUrl(network)}/address/${
                      token.contractAddress
                    }`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {shortAddress}
                  </a>
                </td>
                <td>
                  <button
                    style={{ backgroundColor: "blue", color: "white" }}
                    onClick={() => moveAssetsToL1(token.contractAddress, token.name)}
                  >
                    Move all to L1
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default WrappedSmartContractAssets;
