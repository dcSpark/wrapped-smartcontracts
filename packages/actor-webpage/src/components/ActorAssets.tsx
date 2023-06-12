import React, { useEffect, useState } from "react";
import BigNumber from "bignumber.js";
import { EVMTokenBalance } from "milkomeda-wsc/build/WSCLibTypes";
import { MilkomedaConstants } from "milkomeda-wsc/src/MilkomedaConstants";
import { toast } from "react-toastify";

interface WrappedSmartContractAssetsProps {
  destinationBalance: string | null;
  network: string | null;
  tokens: EVMTokenBalance[];
  unwrap: (destination: string | undefined, assetId: string, amount: BigNumber) => Promise<void>;
  moveAssetsToL1: (tokenId: string, tokenName: string, amount: BigNumber) => void;
  areTokensAllowed: (assetIds: string[]) => Promise<{ [key: string]: boolean }>;
  isCardano: boolean;
}

const WrappedSmartContractAssets: React.FC<WrappedSmartContractAssetsProps> = ({
  destinationBalance,
  network,
  tokens,
  unwrap,
  moveAssetsToL1,
  areTokensAllowed,
  isCardano,
}) => {
  const [allowedTokensMap, setAllowedTokensMap] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const assetIds = tokens.map((token) => token.contractAddress);
    areTokensAllowed(assetIds).then(setAllowedTokensMap);
  }, [tokens, areTokensAllowed]);

  const normalizeAda = (amount: string): string => {
    const maxDecimalPlaces = 6;
    const decimalIndex = amount.indexOf(".");
    const truncatedDestinationBalance =
      decimalIndex === -1
        ? destinationBalance
        : destinationBalance.slice(0, decimalIndex + maxDecimalPlaces + 1);

    return truncatedDestinationBalance;
  };

  return (
    <div>
      <h2 className="subtitle">Assets in Your Wrapped Smart Contract Wallet</h2>
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
              <td>{isCardano ? "ADA" : "ALGO"}</td>
              <td>{destinationBalance}</td>
              <td>
                <a
                  href={`${MilkomedaConstants.getEVMExplorerUrl(
                    network,
                  )}/address/0x319f10d19e21188ecF58b9a146Ab0b2bfC894648`}
                  target="_blank"
                  rel="noreferrer"
                >
                  0x319f...4648
                </a>
              </td>
              <td>
                <button
                  className="button-primary-small"
                  onClick={async () => {
                    try {
                      const normalizedAda = normalizeAda(destinationBalance);
                      const lovelace = new BigNumber(normalizedAda).multipliedBy(
                        new BigNumber(10).pow(6),
                      );
                      await unwrap(undefined, undefined, lovelace);
                      toast.success("You have moved the token to L1 successfully");
                    } catch (error) {
                      toast.error(error.message);
                    }
                  }}
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
              6,
            )}...${token.contractAddress.slice(-4)}`;

            return (
              <tr key={index}>
                <td>
                  {token.name} ({token.symbol.toUpperCase()})
                </td>
                <td>{adjustedBalance.toString()}</td>
                <td>
                  <a
                    href={`${MilkomedaConstants.getEVMExplorerUrl(network)}/address/${
                      token.contractAddress
                    }`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {shortAddress}
                  </a>
                </td>
                <td>
                  {allowedTokensMap[token.contractAddress] ? (
                    <button
                      style={{ backgroundColor: "blue", color: "white" }}
                      onClick={() =>
                        moveAssetsToL1(
                          token.contractAddress,
                          token.name,
                          new BigNumber(token.balance),
                        )
                      }
                    >
                      Move all to L1
                    </button>
                  ) : (
                    "Not Allowed in Bridge"
                  )}
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
