import React, { useState, useEffect } from "react";
import BigNumber from "bignumber.js";
import { OriginAmount } from "milkomeda-wsc/build/CardanoPendingManger";
import { toast } from "react-toastify";
interface L1AssetsProps {
  tokens: OriginAmount[];
  wrap: (destination: string | undefined, assetId: string, amount: BigNumber) => Promise<void>;
  isCardano: boolean;
}

const L1Assets: React.FC<L1AssetsProps> = ({ tokens, wrap }) => {
  const [tokenAmounts, setTokenAmounts] = useState<Map<string, string>>(new Map());
  const [amounts, setAmounts] = useState<string[]>([]);

  useEffect(() => {
    setAmounts(
      tokens.map((token) => {
        if (token.decimals) {
          const quantity = new BigNumber(token.quantity);
          const divisor = new BigNumber(10).pow(token.decimals);
          return quantity.dividedBy(divisor).toString();
        }
        return token.quantity;
      }),
    );
  }, [tokens]);

  const updateTokenAmount = (tokenUnit: string, amount: string) => {
    const newTokenAmounts = new Map(tokenAmounts);
    newTokenAmounts.set(tokenUnit, amount);
    setTokenAmounts(newTokenAmounts);
  };

  const moveToken = async (token: OriginAmount) => {
    try {
      console.log("Moving token", token.unit, "with amount", tokenAmounts.get(token.unit));
      await wrap(undefined, token.unit, new BigNumber(tokenAmounts.get(token.unit) || "0"));
      updateTokenAmount(token.unit, "");
      toast.success("You have moved the token to L2 successfully");
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const setMaxAmount = (token: OriginAmount) => {
    const amount = new BigNumber(token.quantity);
    const decimals = token.decimals ? new BigNumber(token.decimals) : new BigNumber(0);
    const adjustedAmount = amount.dividedBy(new BigNumber(10).pow(decimals));
    updateTokenAmount(token.unit, adjustedAmount.toString());
  };

  console.log("L1Assets", tokens);

  return (
    <div>
      <h2 className="subtitle">Assets in Your Cardano Wallet</h2>
      <h4>(We only show the ones that can be moved)</h4>
      <table>
        <thead>
          <tr>
            <th>Token</th>
            <th>Amount</th>
            {tokens.some((t) => t.bridgeAllowed) && (
              <>
                <th>Move Amount</th>
                <th>Actions</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {tokens.map((token, index) => (
            <tr key={index}>
              <td>{token.assetName}</td>
              <td>{amounts[index]}</td>
              {token.bridgeAllowed && (
                <>
                  <td>
                    <div className="relative h-[48px] px-4 py-1 pr-12 border border-gray-400 rounded-md overflow-hidden flex focus-within:border-blue-500">
                      <input
                        type="text"
                        value={tokenAmounts.get(token.unit) || ""}
                        className="h-full min-w-[200px] outline-none bg-transparent text-sm"
                        onChange={(e) => updateTokenAmount(token.unit, e.target.value)}
                      />
                      <button
                        className="p-2 absolute rounded-md bg-gray-700 h-[39px] text-gray-50 right-[3px] self-center text-sm"
                        onClick={() => setMaxAmount(token)}
                      >
                        MAX
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="flex space-x-4">
                      <button className="button-primary-small" onClick={() => moveToken(token)}>
                        Move to L2
                      </button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default L1Assets;
