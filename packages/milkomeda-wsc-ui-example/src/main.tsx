import "./polyfills";

import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import App from "./App";

import { WagmiConfig, createClient } from "wagmi";
import { mainnet, polygon, optimism, arbitrum } from "wagmi/chains";
import { ConnectWSCProvider, getDefaultConfig } from "milkomeda-wsc-ui";

const client = createClient(
  getDefaultConfig({
    chains: [mainnet, polygon, optimism, arbitrum],
  })
);

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <React.StrictMode>
    <WagmiConfig client={client}>
      <ConnectWSCProvider debugMode>
        <App />
      </ConnectWSCProvider>
    </WagmiConfig>
  </React.StrictMode>
);
