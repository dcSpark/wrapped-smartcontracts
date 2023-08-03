import "../styles/globals.css";
import type { AppProps } from "next/app";

import { WagmiConfig, createClient } from "wagmi";
import { ConnectWSCProvider, getDefaultConfig } from "milkomeda-wsc-ui";

const client = createClient(
  getDefaultConfig({
    oracleUrl: "oracleUrl",
    blockfrostId: "blockfrostId",
  })
);

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={client}>
      <ConnectWSCProvider>
        <Component {...pageProps} />
      </ConnectWSCProvider>
    </WagmiConfig>
  );
}

export default MyApp;
