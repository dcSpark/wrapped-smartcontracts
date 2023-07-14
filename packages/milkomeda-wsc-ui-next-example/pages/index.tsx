import type { NextPage } from "next";
import { ConnectWSCButton, useWSCTransactionConfig } from "milkomeda-wsc-ui";
import { StepTxDirection } from "milkomeda-wsc-ui-test-beta/build/components/ConnectWSC";

const reserveCoinAddress = "0x66c34c454f8089820c44e0785ee9635c425c9128";
const cardanoAddressTReserveCoin =
  "cc53696f7d40c96f2bca9e2e8fe31905d8207c4106f326f417ec36727452657365727665436f696e";

const buyOptions = {
  defaultCardanoToken: {
    unit: "lovelace", //default lovelace
    // @ts-ignore
    amount: 10178117048345515637, // 10.17 mADA -> 10 MOR
  },
  evmTokenAddress: reserveCoinAddress,
  stepTxDirection: "buy" as StepTxDirection,
  titleModal: "Buy Reserve Coin",
};

const sellOptions = {
  defaultCardanoToken: {
    unit: cardanoAddressTReserveCoin,
    amount: 10000, // amount: 0.01 MOR - 0010000 ReserveCoin -> ~ 0.009 mADA
  },
  evmTokenAddress: "", // default to mTADA
  stepTxDirection: "sell" as StepTxDirection,
  titleModal: "Sell Reserve Coin",
};
const Home: NextPage = () => {
  const promiseFunction = () => fetch("https://jsonplaceholder.typicode.com/posts/1");

  useWSCTransactionConfig({ ...buyOptions, wscActionCallback: promiseFunction });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <ConnectWSCButton />
    </div>
  );
};

export default Home;
