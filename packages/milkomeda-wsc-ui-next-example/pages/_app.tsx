import "../styles/globals.css";
import type { AppProps } from "next/app";

import { createClient, WagmiConfig } from "wagmi";
import { ConnectWSCProvider, getDefaultConfig, MilkomedaNetworkName } from "milkomeda-wsc-ui";

const client = createClient(
  getDefaultConfig({
    oracleUrl: "oracleUrl",
    blockfrostId: "blockfrostId",
    network: MilkomedaNetworkName.C1Devnet,
    cardanoWalletNames: ["flint", "eternl", "nami", "nufi", "yoroi"],
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
