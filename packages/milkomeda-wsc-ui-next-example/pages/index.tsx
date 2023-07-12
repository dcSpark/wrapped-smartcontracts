import type { NextPage } from "next";
import { ConnectWSCButton, useWSCTransactionConfig } from "milkomeda-wsc-ui";

const reserveCoinAddress = "0x66c34c454f8089820c44e0785ee9635c425c9128";
const cardanoAddressTReserveCoin =
  "cc53696f7d40c96f2bca9e2e8fe31905d8207c4106f326f417ec36727452657365727665436f696e";

const Home: NextPage = () => {
  const promiseFunction = () => fetch("https://jsonplaceholder.typicode.com/posts/1");

  useWSCTransactionConfig({
    defaultCardanoToken: {
      unit: cardanoAddressTReserveCoin, //default lovelace when buying, selling to cardanoAddressTReserveCoin
      // amount: 30534351145036551261, // 30
      amount: 10, // 30
      // unit: cardanoAddressTReserveCoin,
    },
    wscActionCallback: promiseFunction,
    evmTokenAddress: reserveCoinAddress,
    stepTxDirection: "sell",
    titleModal: "Buy Reserve Coin",
  });

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
