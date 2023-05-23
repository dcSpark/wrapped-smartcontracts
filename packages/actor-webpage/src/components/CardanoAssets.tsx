import React, { useState, useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { CardanoAmount } from 'milkomeda-wsc/build/CardanoPendingManger';

interface CardanoAssetsProps {
    tokens: CardanoAmount[];
    wrap: (destination: string | undefined, assetId: string, amount: BigNumber) => Promise<void>;
  }

const CardanoAssets: React.FC<CardanoAssetsProps> = ({ tokens, wrap }) => {
  const [tokenAmounts, setTokenAmounts] = useState<Map<string, string>>(new Map());
  const [amounts, setAmounts] = useState<string[]>([]);
 
  useEffect(() => {
    setAmounts(tokens.map((token) => {
      if (token.decimals) {
        const quantity = new BigNumber(token.quantity);
        const divisor = new BigNumber(10).pow(token.decimals);
        return quantity.dividedBy(divisor).toString();
      }
      return token.quantity;
    }));
  }, [tokens]);

  const updateTokenAmount = (tokenUnit: string, amount: string) => {
    const newTokenAmounts = new Map(tokenAmounts);
    newTokenAmounts.set(tokenUnit, amount);
    setTokenAmounts(newTokenAmounts);
  };

  const moveToken = async (token: CardanoAmount) => {
    console.log('Moving token', token.unit, 'with amount', tokenAmounts.get(token.unit));
    await wrap(undefined, token.unit, new BigNumber(tokenAmounts.get(token.unit) || '0'));
    updateTokenAmount(token.unit, '');
  };

  const setMaxAmount = (token: CardanoAmount) => {
    const amount = new BigNumber(token.quantity);
    const decimals = token.decimals ? new BigNumber(token.decimals) : new BigNumber(0);
    const adjustedAmount = amount.dividedBy(new BigNumber(10).pow(decimals));
    updateTokenAmount(token.unit, adjustedAmount.toString());
  };

  return (
    <div>
      <h2>Assets in Your Cardano Wallet</h2>
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
                    <input
                      type="text"
                      value={tokenAmounts.get(token.unit) || ''}
                      onChange={(e) => updateTokenAmount(token.unit, e.target.value)}
                    />
                  </td>
                  <td>
                    <button onClick={() => moveToken(token)}>Move to L2</button>
                    <button onClick={() => setMaxAmount(token)}>All</button>
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

export default CardanoAssets;
