import type { NextPage } from "next";
import { ConnectWSCButton } from "milkomeda-wsc-ui";
import { TransactionConfigWSCProvider } from "milkomeda-wsc-ui";
import type { TransactionConfigWSCOptions } from "milkomeda-wsc-ui";

import djedABI from "../abi/djed.json";
import { ethers } from "ethers";

const DJED_ADDRESS = "0xc4c0669ea7bff70a6cfa5905a0ba487fc181dc37";

const reserveCoinAddress = "0x66c34c454f8089820c44e0785ee9635c425c9128";
const cardanoAddressTReserveCoin =
  "cc53696f7d40c96f2bca9e2e8fe31905d8207c4106f326f417ec36727452657365727665436f696e";

const account = "0xb449b3B9943b57F50bEc4E2C6FF861353490Afdb";

const buyOptions: TransactionConfigWSCOptions = {
  defaultWrapToken: {
    unit: "lovelace",
    amount: "10178117048345515637", // 10.17 mADA -> 10 MOR
  },
  defaultUnwrapToken: {
    unit: reserveCoinAddress,
    amount: "10000000", // amountUnscaled
  },
  titleModal: "Buy Reserve Coin",
  evmTokenAddress: reserveCoinAddress,
  evmContractRequest: {
    address: DJED_ADDRESS,
    abi: djedABI.abi as any,
    functionName: "buyReserveCoins", //account, FEE_UI_UNSCALED, UI
    args: [account, "0000000000000000000000000", "0x0232556C83791b8291E9b23BfEa7d67405Bd9839"],
    overrides: {
      value: ethers.BigNumber.from("10178117048345515637"),
    },
  },
};
``;

const sellOptions: TransactionConfigWSCOptions = {
  defaultWrapToken: {
    unit: cardanoAddressTReserveCoin,
    amount: "1000000", // 1 MOR
  },
  defaultUnwrapToken: {
    unit: "",
    amount: "977761210430239846",
    // amount: 977761210430239846,
  },
  titleModal: "Sell Reserve Coin",
  evmTokenAddress: reserveCoinAddress,
  evmContractRequest: {
    address: DJED_ADDRESS,
    abi: djedABI.abi as any,
    functionName: "sellReserveCoins", //account, FEE_UI_UNSCALED, UI
    args: [
      "1000000",
      account,
      "0000000000000000000000000",
      "0x0232556C83791b8291E9b23BfEa7d67405Bd9839",
    ],
    overrides: {
      value: ethers.BigNumber.from("0"),
    },
  },
};

const Home: NextPage = () => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <TransactionConfigWSCProvider options={buyOptions}>
        <ConnectWSCButton />
      </TransactionConfigWSCProvider>
    </div>
  );
};

export default Home;
