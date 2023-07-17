import type { NextPage } from "next";
import { ConnectWSCButton, useWSCTransactionConfig } from "milkomeda-wsc-ui";
import { StepTxDirection } from "milkomeda-wsc-ui-test-beta/build/components/ConnectWSC";
import { TransactionConfigWSCProvider } from "milkomeda-wsc-ui";
import { useState } from "react";

import djedABI from "../abi/djed.json";
import { useAccount } from "wagmi";

const DJED_ADDRESS = "0xc4c0669ea7bff70a6cfa5905a0ba487fc181dc37";

const reserveCoinAddress = "0x66c34c454f8089820c44e0785ee9635c425c9128";
const cardanoAddressTReserveCoin =
  "cc53696f7d40c96f2bca9e2e8fe31905d8207c4106f326f417ec36727452657365727665436f696e";

const buyOptions = {
  defaultCardanoToken: {
    unit: "lovelace", //default lovelace
    amount: 10178117048345515637, // 10.17 mADA -> 10 MOR
  },
  evmTokenAddress: reserveCoinAddress,
  stepTxDirection: "buy" as StepTxDirection,
  titleModal: "Buy Reserve Coin",
};

const sellOptions = {
  defaultCardanoToken: {
    unit: cardanoAddressTReserveCoin,
    amount: 1000000, // amount: 0.01 MOR - 0010000 ReserveCoin -> ~ 0.009 mADA
    // amount: 10000, // amount: 0.01 MOR - 0010000 ReserveCoin -> ~ 0.009 mADA
  },
  evmTokenAddress: reserveCoinAddress, // default to mTADA
  stepTxDirection: "sell" as StepTxDirection,
  titleModal: "Sell Reserve Coin",
};
const Home: NextPage = () => {
  const promiseFunction = () => fetch("https://jsonplaceholder.typicode.com/posts/1");
  const { address: account } = useAccount();

  const [address, setAddress] = useState("1112");
  useWSCTransactionConfig({ ...sellOptions, wscActionCallback: promiseFunction });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <TransactionConfigWSCProvider
        options={{
          wscSmartContractInfo: {
            address: DJED_ADDRESS,
            abi: djedABI.abi as any,
            functionName: "sellReserveCoins", //account, FEE_UI_UNSCALED, UI
            args: [
              1000000,
              "0xb839b4c203dbda1bd53adc82e197e449655b84e9",
              "0000000000000000000000000",
              "0x0232556c83791b8291e9b23bfea7d67405bd9839",
            ],
          },
          // wscSmartContractInfo: {
          //   address: DJED_ADDRESS,
          //   abi: djedABI.abi as any,
          //   functionName: "buyReserveCoins", //account, FEE_UI_UNSCALED, UI
          //   args: [
          //     account,
          //     "0000000000000000000000000",
          //     "0x0232556C83791b8291E9b23BfEa7d67405Bd9839",
          //   ],
          // },
        }}
        //     .sellReserveCoins(amount, account, FEE_UI_UNSCALED, UI)
      >
        <ConnectWSCButton />
      </TransactionConfigWSCProvider>

      <button
        onClick={() => {
          setAddress("0x66c34c454f8089820c44e0785ee9635c425c9128");
        }}
      >
        update
      </button>
    </div>
  );
};

export default Home;

// function WSCButton() {
//   return <ConnectWSCButton />;
// }
