import "../styles/globals.css";
import type { AppProps } from "next/app";

import { WagmiConfig, createClient } from "wagmi";
import { mainnet, polygon, optimism, arbitrum } from "wagmi/chains";
import { ConnectWSCProvider, getDefaultConfig } from "milkomeda-wsc-ui";

const client = createClient(
  getDefaultConfig({
    chains: [mainnet, polygon, optimism, arbitrum],
  })
);

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={client}>
      <ConnectWSCProvider debugMode>
        <Component {...pageProps} />
      </ConnectWSCProvider>
    </WagmiConfig>
  );
}

export default MyApp;
