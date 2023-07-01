import type { NextPage } from "next";
import { ConnectWSCButton, useWSCTransactionConfig } from "milkomeda-wsc-ui";

const reserveCoinAddress = "0x66c34c454f8089820c44e0785ee9635c425c9128";

const Home: NextPage = () => {
  useWSCTransactionConfig({
    defaultCardanoToken: {
      unit: "lovelace", //default lovelace
      amount: 6,
    },
    contractAddress: reserveCoinAddress,
    wscActionCallback: async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    },
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
