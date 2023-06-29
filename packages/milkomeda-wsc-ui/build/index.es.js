import { configureChains, useNetwork, useSwitchNetwork, useConnect as useConnect$1, useSigner, erc20ABI, useDisconnect, useAccount, useBalance } from 'wagmi';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { publicProvider } from 'wagmi/providers/public';
import { CardanoWSCConnector } from '@dcspark/cardano-wsc-wagmi/dist';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import * as React from 'react';
import React__default, { useRef, useState, useEffect, useCallback, useLayoutEffect, useMemo, createContext, createElement } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled$1, { css, keyframes, ThemeProvider } from 'styled-components';
import { createPortal } from 'react-dom';
import { detect } from 'detect-browser';
import { useTransition } from 'react-transition-state';
import useMeasure from 'react-use-measure';
import ResizeObserver from 'resize-observer-polyfill';
import QRCodeUtil from 'qrcode';
import { Check, X, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import * as Separator from '@radix-ui/react-separator';
import BigNumber from 'bignumber.js';
import { TxPendingStatus } from 'milkomeda-wsc';
import { ethers } from 'ethers';

var types = /*#__PURE__*/Object.freeze({
  __proto__: null
});

const milkomedaChains = [
    {
        id: 200101,
        name: "Milkomeda C1 Testnet",
        network: "Milkomeda C1 Testnet",
        nativeCurrency: {
            name: "mTADA",
            symbol: "mTADA",
            decimals: 18,
        },
        rpcUrls: {
            public: { http: ["https://rpc-devnet-cardano-evm.c1.milkomeda.com"] },
            default: { http: ["https://rpc-devnet-cardano-evm.c1.milkomeda.com"] },
        },
        blockExplorers: {
            etherscan: { name: "", url: "" },
            default: {
                name: "",
                url: "https://explorer-devnet-cardano-evm.c1.milkomeda.com",
            },
        },
    },
    {
        id: 2001,
        name: "Milkomeda C1 Mainnet",
        network: "Milkomeda C1 Mainnet",
        nativeCurrency: {
            name: "mADA",
            symbol: "mADA",
            decimals: 18,
        },
        rpcUrls: {
            public: { http: ["https://rpc-mainnet-cardano-evm.c1.milkomeda.com"] },
            default: { http: ["https://rpc-mainnet-cardano-evm.c1.milkomeda.com"] },
        },
        blockExplorers: {
            etherscan: { name: "", url: "" },
            default: {
                name: "",
                url: "https://explorer-mainnet-cardano-evm.c1.milkomeda.com",
            },
        },
    },
];
const defaultChains = [...milkomedaChains];
const getDefaultConnectors = ({ chains }) => {
    let connectors = [];
    // Add the rest of the connectors
    connectors = [
        ...connectors,
        new CardanoWSCConnector({
            chains,
            options: {
                name: "flint",
                oracleUrl: "https://wsc-server-devnet.c1.milkomeda.com",
                blockfrostKey: "preprodliMqEQ9cvQgAFuV7b6dhA4lkjTX1eBLb",
                jsonRpcProviderUrl: undefined,
            },
        }),
        new CardanoWSCConnector({
            chains,
            options: {
                name: "etrnal",
                oracleUrl: "https://wsc-server-devnet.c1.milkomeda.com",
                blockfrostKey: "preprodliMqEQ9cvQgAFuV7b6dhA4lkjTX1eBLb",
                jsonRpcProviderUrl: undefined,
            },
        }),
    ];
    return connectors;
};
const defaultConfig = ({ autoConnect = false, // TODO: check why breaks in wsc
chains = defaultChains, connectors, provider, stallTimeout, webSocketProvider, enableWebSocketProvider, }) => {
    const providers = [];
    providers.push(jsonRpcProvider({
        rpc: (c) => {
            return { http: c.rpcUrls.default.http[0] };
        },
    }));
    providers.push(publicProvider());
    const { provider: configuredProvider, chains: configuredChains, webSocketProvider: configuredWebSocketProvider, } = configureChains(chains, providers, { stallTimeout });
    const milkomedaWSCClient = {
        autoConnect,
        connectors: connectors !== null && connectors !== void 0 ? connectors : getDefaultConnectors({
            chains: configuredChains,
        }),
        provider: provider !== null && provider !== void 0 ? provider : configuredProvider,
        webSocketProvider: enableWebSocketProvider // Removed by default, breaks if used in Next.js – "unhandledRejection: Error: could not detect network"
            ? webSocketProvider !== null && webSocketProvider !== void 0 ? webSocketProvider : configuredWebSocketProvider
            : undefined,
    };
    return { ...milkomedaWSCClient };
};

const defaultLightTheme = {
    font: {
        family: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, 'Apple Color Emoji', Arial, sans-serif, 'Segoe UI Emoji'`,
    },
    text: {
        primary: {
            color: "#373737",
        },
        secondary: {
            color: "#999999",
            hover: {
                color: "#111111",
            },
        },
        error: "#FC6464",
        valid: "#32D74B",
    },
    buttons: {
        primary: {
            borderRadius: 16,
            color: "#000373737000",
            background: "#FFFFFF",
            border: "#F0F0F0",
            hover: {
                color: "#000000",
                border: "#1A88F8",
            },
        },
        secondary: {
            borderRadius: 16,
            background: "#F6F7F9",
            color: "#000000",
        },
    },
    navigation: {
        color: "#999999",
    },
    modal: {
        background: "#ffffff",
        divider: "#f7f6f8",
    },
    tooltips: {
        color: "#999999",
        background: "#ffffff",
        hover: {
            background: "#f6f7f9",
        },
    },
    overlay: {
        background: "rgba(0, 0, 0, 0.06)",
    },
    qrCode: {
        accentColor: "#F7F6F8",
    },
};
// parse into css variables so we can use p3 colors
const parseTheme = (theme) => {
    return theme;
};
// let darkMode = userPrefersDarkMode();
//
// if (darkMode) {
// }
const defaultTheme$1 = {
    connectKit: {
        options: {
            iconStyle: "light",
        },
        //theme: parseTheme(defaultLightTheme),
        theme: {
            preferred: "dark",
            light: parseTheme(defaultLightTheme),
            dark: parseTheme(defaultLightTheme),
        },
    },
};

/**
 *
 * IMPORTANT NOTE: This file is a workaround for the following issue:
 *
 * When using rollup with styled-components to build into an ES module, styled components decides to move all of it’s DOM elements into "styled.default" rather than just within "styled"
 *
 * We're unsure as to why this issue occurs, if you have any ideas or a better solution please let us know by opening a discussion on our GitHub repo
 *
 */
var styled = typeof styled$1.div === "function" ? styled$1 : styled$1["default"];

const hexToP3 = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result == null)
        return hex;
    const values = {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    };
    return `color(display-p3 ${values.r / 255} ${values.g / 255} ${values.b / 255})`;
};

var base = {
    light: {
        /** Connect Wallet Button */
        "--ck-connectbutton-font-size": "15px",
        "--ck-connectbutton-color": "#373737",
        "--ck-connectbutton-background": "#F6F7F9",
        "--ck-connectbutton-background-secondary": "#FFFFFF",
        "--ck-connectbutton-hover-color": "#373737",
        "--ck-connectbutton-hover-background": "#F0F2F5",
        "--ck-connectbutton-active-color": "#373737",
        "--ck-connectbutton-active-background": "#EAECF1",
        "--ck-connectbutton-balance-color": "#373737",
        "--ck-connectbutton-balance-background": "#fff",
        "--ck-connectbutton-balance-box-shadow": "inset 0 0 0 1px var(--ck-connectbutton-background)",
        "--ck-connectbutton-balance-hover-background": "#F6F7F9",
        "--ck-connectbutton-balance-hover-box-shadow": "inset 0 0 0 1px var(--ck-connectbutton-hover-background)",
        "--ck-connectbutton-balance-active-background": "#F0F2F5",
        "--ck-connectbutton-balance-active-box-shadow": "inset 0 0 0 1px var(--ck-connectbutton-active-background)",
        /** Primary Button */
        "--ck-primary-button-border-radius": "16px",
        "--ck-primary-button-color": "#373737",
        "--ck-primary-button-background": "#F6F7F9",
        //'--ck-primary-button-box-shadow': 'inset 0 0 0 1px #F0F0F0',
        "--ck-primary-button-font-weight": "600",
        "--ck-primary-button-hover-color": "#373737",
        "--ck-primary-button-hover-background": "#F0F2F5",
        //'--ck-primary-button-hover-box-shadow': 'inset 0 0 0 2px var(--ck-focus-color)',
        "--ck-primary-button-active-background": "#EAECF1",
        /** Secondary Button */
        "--ck-secondary-button-border-radius": "16px",
        "--ck-secondary-button-color": "#373737",
        "--ck-secondary-button-background": "#F6F7F9",
        //'--ck-secondary-button-box-shadow': '',
        //'--ck-secondary-button-font-weight': '',
        /** Tertiary Button */
        "--ck-tertiary-button-background": "#FFFFFF",
        "--ck-secondary-button-hover-background": "#e0e4eb",
        /** Modal */
        "--ck-modal-box-shadow": "0px 2px 4px rgba(0, 0, 0, 0.02)",
        "--ck-overlay-background": "rgba(71, 88, 107, 0.24)",
        "--ck-body-color": "#373737",
        "--ck-body-color-muted": "#999999",
        "--ck-body-color-muted-hover": "#111111",
        "--ck-body-background": "#ffffff",
        "--ck-body-background-transparent": "rgba(255,255,255,0)",
        "--ck-body-background-secondary": "#f6f7f9",
        "--ck-body-background-secondary-hover-background": "#e0e4eb",
        "--ck-body-background-secondary-hover-outline": "#4282FF",
        "--ck-body-background-tertiary": "#F3F4F7",
        "--ck-body-action-color": "#999999",
        "--ck-body-divider": "#f7f6f8",
        "--ck-body-color-danger": "#FF4E4E",
        "--ck-body-color-valid": "#32D74B",
        "--ck-siwe-border": "#F0F0F0",
        /** Disclaimer */
        //'--ck-body-disclaimer-background': '#E3D6C9',
        //'--ck-body-disclaimer-box-shadow': 'none',
        "--ck-body-disclaimer-color": "#AAAAAB",
        "--ck-body-disclaimer-link-color": "#838485",
        "--ck-body-disclaimer-link-hover-color": "#000000",
        /** Tooltips */
        "--ck-tooltip-background": "#ffffff",
        "--ck-tooltip-background-secondary": "#ffffff",
        "--ck-tooltip-color": "#999999",
        "--ck-tooltip-shadow": "0px 2px 10px rgba(0, 0, 0, 0.08)",
        /** Network dropdown */
        "--ck-dropdown-button-color": "#999999",
        "--ck-dropdown-button-box-shadow": "0 0 0 1px rgba(0,0,0,0.01), 0px 0px 7px rgba(0, 0, 0, 0.05)",
        "--ck-dropdown-button-background": "#fff",
        "--ck-dropdown-button-hover-color": "#8B8B8B",
        "--ck-dropdown-button-hover-background": "#F5F7F9",
        /** QR Code */
        "--ck-qr-dot-color": "#000000",
        "--ck-qr-border-color": "#f7f6f8",
        /** Misc. */
        "--ck-focus-color": "#1A88F8",
        "--ck-spinner-color": "var(--ck-focus-color)",
        "--ck-copytoclipboard-stroke": "#CCCCCC",
    },
    dark: {
        "--ck-connectbutton-font-size": "15px",
        "--ck-connectbutton-color": "#ffffff",
        "--ck-connectbutton-background": "#383838",
        "--ck-connectbutton-background-secondary": "#282828",
        "--ck-connectbutton-hover-background": "#404040",
        "--ck-connectbutton-active-background": "#4D4D4D",
        "--ck-connectbutton-balance-color": "#fff",
        "--ck-connectbutton-balance-background": "#282828",
        "--ck-connectbutton-balance-box-shadow": "inset 0 0 0 1px var(--ck-connectbutton-background)",
        "--ck-connectbutton-balance-hover-background": "#383838",
        "--ck-connectbutton-balance-hover-box-shadow": "inset 0 0 0 1px var(--ck-connectbutton-hover-background)",
        "--ck-connectbutton-balance-active-background": "#404040",
        "--ck-connectbutton-balance-active-box-shadow": "inset 0 0 0 1px var(--ck-connectbutton-active-background)",
        "--ck-primary-button-color": "#ffffff",
        "--ck-primary-button-background": "#383838",
        //'--ck-primary-button-box-shadow': 'inset 0 0 0 1px #3D3D3D',
        "--ck-primary-button-border-radius": "16px",
        "--ck-primary-button-font-weight": "600",
        "--ck-primary-button-hover-background": "#404040",
        //'--ck-primary-button-hover-box-shadow': 'inset 0 0 0 2px rgba(255, 255, 255, 0.4)',
        //'--ck-primary-button-active-background': '#4D4D4D',
        "--ck-primary-button-active-border-radius": "16px",
        "--ck-secondary-button-color": "#ffffff",
        "--ck-secondary-button-background": "#333333",
        "--ck-secondary-button-hover-background": "#4D4D4D",
        /** Tertiary Button */
        "--ck-tertiary-button-background": "#424242",
        "--ck-focus-color": "#1A88F8",
        "--ck-overlay-background": "rgba(0,0,0,0.4)",
        "--ck-body-color": "#ffffff",
        "--ck-body-color-muted": "rgba(255, 255, 255, 0.4)",
        "--ck-body-color-muted-hover": "rgba(255, 255, 255, 0.8)",
        "--ck-body-background": "#2B2B2B",
        "--ck-body-background-transparent": "rgba(0,0,0,0)",
        "--ck-body-background-secondary": "#333333",
        "--ck-body-background-secondary-hover-background": "#4D4D4D",
        "--ck-body-background-secondary-hover-outline": "#ffffff",
        "--ck-body-background-tertiary": "#333333",
        "--ck-body-action-color": "#808080",
        "--ck-body-divider": "#383838",
        "--ck-body-color-danger": "#FF4E4E",
        "--ck-body-disclaimer-color": "#858585",
        "--ck-body-disclaimer-link-color": "#ADADAD",
        "--ck-body-disclaimer-link-hover-color": "#FFFFFF",
        "--ck-modal-box-shadow": "0px 2px 4px rgba(0, 0, 0, 0.02)",
        "--ck-copytoclipboard-stroke": "#555555",
        "--ck-tooltip-background": "#2B2B2B",
        "--ck-tooltip-background-secondary": "#333333",
        "--ck-tooltip-color": "#999999",
        "--ck-tooltip-shadow": "0px 2px 10px rgba(0, 0, 0, 0.08)",
        /** Network dropdown */
        "--ck-dropdown-button-color": "#6C7381",
        "--ck-spinner-color": "var(--ck-focus-color)",
        "--ck-qr-dot-color": "#ffffff",
        "--ck-qr-border-color": "#3d3d3d",
    },
};

var web95 = {
    "--ck-font-family": "Lato",
    "--ck-border-radius": "0px",
    "--ck-connectbutton-color": "#373737",
    "--ck-connectbutton-background": "linear-gradient(180deg, #F0F0EA 0%, #FFFFFF 50%, #F0F0EA 100%) 100% 100% / 200% 200%, #F5F5F1",
    "--ck-connectbutton-box-shadow": " 0 0 0 1px #003C74, 2px 2px 0px rgba(255, 255, 255, 0.75), -2px -2px 0px rgba(0, 0, 0, 0.05), inset 0px 0px 0px 0px #97B9EC, inset -1px -2px 2px rgba(0, 0, 0, 0.2)",
    "--ck-connectbutton-border-radius": "4.5px",
    "--ck-connectbutton-hover-color": "#373737",
    "--ck-connectbutton-hover-background": "linear-gradient(180deg, #F0F0EA 0%, #FFFFFF 50%, #F0F0EA 100%) 100% 0% / 200% 200%, #F5F5F1",
    "--ck-connectbutton-active-background": "linear-gradient(180deg, #F0F0EA 0%, #FFFFFF 50%, #F0F0EA 100%) 100% 100% / 200% 200%, #F5F5F1",
    "--ck-connectbutton-balance-color": "#373737",
    "--ck-connectbutton-balance-background": "#fff",
    "--ck-connectbutton-balance-box-shadow": "0 0 0 1px #E4E7E7",
    "--ck-connectbutton-balance-hover-box-shadow": "0 0 0 1px #d7dbdb",
    "--ck-connectbutton-balance-active-box-shadow": "0 0 0 1px #bbc0c0",
    "--ck-focus-color": "#1A88F8",
    "--ck-overlay-background": "rgba(0, 127,  128, 0.8)",
    "--ck-body-color": "#373737",
    "--ck-body-color-muted": "#808080",
    "--ck-body-color-muted-hover": "#111111",
    "--ck-body-background": "#F0EDE2",
    "--ck-body-background-transparent": "rgba(255,255,255,0)",
    "--ck-body-background-secondary-hover-background": "#FAFAFA",
    "--ck-body-background-secondary-hover-outline": "#4282FF",
    "--ck-body-action-color": "#373737",
    "--ck-body-color-danger": "#FC6464",
    "--ck-body-color-valid": "#32D74B",
    "--ck-body-divider": "#919B9C",
    "--ck-body-divider-box-shadow": "0px 1px 0px #FBFBF8",
    // Primary button
    "--ck-primary-button-background": "linear-gradient(180deg, #FFFFFF 0%, #F0F0EA 100%), #F5F5F1",
    "--ck-primary-button-box-shadow": "inset 0 0 0 1px #003C74, 1px 1px 0px rgba(255, 255, 255, 0.75), -1px -1px 0px rgba(0, 0, 0, 0.05), inset 0px 0px 0px 0px #97B9EC, inset -1px -2px 2px rgba(0, 0, 0, 0.2)",
    "--ck-primary-button-border-radius": "6px",
    // Primary button hover
    "--ck-primary-button-hover-box-shadow": "inset 0 0 0 1px #003C74, 1px 1px 0px rgba(255, 255, 255, 0.75), -1px -1px 0px rgba(0, 0, 0, 0.05), inset 0px 0px 0px 5px #97B9EC, inset -1px -2px 2px rgba(0, 0, 0, 0.2)",
    "--ck-primary-button-hover-border-radius": "6px",
    // Modal
    "--ck-modal-heading-font-weight": 400,
    "--ck-modal-box-shadow": `
    inset 0px -3px 0px #0F37A9,
    inset -2px 0px 0px #0F37A9,
    inset 0px -4px 0px #0D5DDF,
    inset -4px 0px 0px #0D5DDF,
    inset 2px 0px 0px #0453DD,
    inset 0px 2px 0px #044FD1,
    inset 4px 0px 0px #4283EB,
    inset 0px 4px 0px #4283EB
  `,
    "--ck-modal-h1-font-weight": 400,
    // Secondary button
    "--ck-secondary-button-color": "#373737",
    "--ck-secondary-button-border-radius": "6px",
    "--ck-secondary-button-box-shadow": "inset 0 0 0 1px #003C74, 1px 1px 0px rgba(255, 255, 255, 0.75), -1px -1px 0px rgba(0, 0, 0, 0.05), inset 0px 0px 0px 0px #97B9EC, inset -1px -2px 2px rgba(0, 0, 0, 0.2)",
    "--ck-secondary-button-background": "linear-gradient(180deg, #FFFFFF 0%, #F0F0EA 100%), #F5F5F1",
    // Secondary button hover
    "--ck-secondary-button-hover-box-shadow": "inset 0 0 0 1px #003C74, 1px 1px 0px rgba(255, 255, 255, 0.75), -1px -1px 0px rgba(0, 0, 0, 0.05), inset 0px 0px 0px 4px #97B9EC, inset -1px -2px 2px rgba(0, 0, 0, 0.2)",
    "--ck-body-background-secondary": "rgba(0, 0, 0, 0.1)",
    "--ck-body-background-tertiary": "linear-gradient(180deg, #FBFBFB 0%, #EFEFEE 100%)",
    "--ck-tertiary-border-radius": "0px",
    "--ck-tertiary-box-shadow": "inset 0 0 0 1px #919B9C, 1px 1px 2px rgba(0, 0, 0, 0.15), inset -2px -2px 0px #FFFFFF",
    "--ck-body-button-text-align": "left",
    "--ck-body-button-box-shadow": "0 2px 4px rgba(0, 0, 0, 0.05 )",
    "--ck-body-disclaimer-background": "linear-gradient(180deg, #FBFBFB 0%, #EFEFEE 100%)",
    "--ck-body-disclaimer-box-shadow": `
    inset 0px -3px 0px #0F37A9,
    inset -2px 0px 0px #0F37A9,
    inset 0px -4px 0px #0D5DDF,
    inset -4px 0px 0px #0D5DDF,
    inset 2px 0px 0px #0453DD,
    inset 4px 0px 0px #4283EB,
    inset 0 1px 0 0 #919B9C`,
    "--ck-body-disclaimer-font-size": "14px",
    "--ck-body-disclaimer-color": "#959594",
    "--ck-body-disclaimer-link-color": "#626262",
    "--ck-body-disclaimer-link-hover-color": "#000000",
    "--ck-qr-dot-color": "#000000",
    "--ck-qr-border-color": "#919B9C",
    "--ck-qr-border-radius": "0",
    "--ck-qr-background": "#FFFFFF",
    "--ck-copytoclipboard-stroke": "rgba(55, 55, 55, 0.4)",
    "--ck-tooltip-background": "linear-gradient(270deg, #F7F3E6 7.69%, #F5F7DA 100%)",
    "--ck-tooltip-background-secondary": "#f6f7f9",
    "--ck-tooltip-color": "#000000",
    "--ck-tooltip-shadow": " 0 0 0 1.5px #2b2622, 0px 2px 10px rgba(0, 0, 0, 0.08)",
    "--ck-spinner-color": "var(--ck-focus-color)",
    "--ck-dropdown-button-color": "#999999",
    "--ck-dropdown-button-box-shadow": "0 0 0 1px #A0A0A0, 1px 1px 0px rgba(255, 255, 255, 0.75), -1px -1px 0px rgba(0, 0, 0, 0.05), inset -1px -2px 2px rgba(0, 0, 0, 0.2)",
    "--ck-dropdown-button-background": "linear-gradient(180deg, #FFFFFF 0%, #F0F0EA 100%), #F5F5F1",
    "--ck-dropdown-button-hover-background": "linear-gradient(0deg, #FFFFFF 0%, #F0F0EA 100%), #F5F5F1",
    "--ck-dropdown-pending-color": "#ACA899",
    "--ck-dropdown-active-color": "#FFFFFF",
    "--ck-dropdown-active-static-color": "#ACA899",
    "--ck-dropdown-active-background": "#3F69BF",
    "--ck-dropdown-active-border-radius": "0",
    "--ck-dropdown-active-inset": "-12px",
    "--ck-dropdown-color": "#ACA899",
    "--ck-dropdown-background": "#FFFFFF",
    "--ck-dropdown-box-shadow": "inset 0 0 0 1px #ACA899, 2px 2px 7px rgba(0, 0, 0, 0.15)",
    "--ck-dropdown-border-radius": "0",
    "--ck-alert-color": "#ACA899",
    "--ck-alert-background": "linear-gradient(180deg, #FBFBFB 0%, #EFEFEE 100%)",
    "--ck-alert-box-shadow": "inset 0 0 0 1px #919B9C, 1px 1px 2px rgba(0, 0, 0, 0.15), inset -2px -2px 0px #FFFFFF",
    "--ck-alert-border-radius": "0",
    "--ck-recent-badge-border-radius": "32px",
    "--ck-recent-badge-top-offset": "0px",
    /** Graphics options for our themes, not to be exposed to devs */
    "--ck-graphic-primary-color": "#333333",
    "--ck-graphic-primary-background": "#FFFFFF",
    /*
    '--ck-graphic-secondary-color': '#7D7D7D',
    '--ck-graphic-secondary-background':
      'linear-gradient(180deg, #FFFFFF 0%, #F0F0EA 100%), #F5F5F1',
    '--ck-graphic-secondary-box-shadow':
      'inset 0 0 0 1px #003C74, 1px 1px 0px rgba(255, 255, 255, 0.75), -1px -1px 0px rgba(0, 0, 0, 0.05), inset 0px 0px 0px 0px #97B9EC, inset -1px -2px 2px rgba(0, 0, 0, 0.2)',
  
    '--ck-graphic-compass-color': '#7D7D7D',
    */
    "--ck-graphic-compass-background": "#FFFFFF",
    /*
    '--ck-graphic-compass-box-shadow':
      'inset 0 0 0 1px #003C74, 1px 1px 0px rgba(255, 255, 255, 0.75), -1px -1px 0px rgba(0, 0, 0, 0.05), inset 0px 0px 0px 0px #97B9EC, inset -1px -2px 2px rgba(0, 0, 0, 0.2)',
  
    '--ck-graphic-globe-background': '#ffffff',
    '--ck-graphic-globe-lines': '#808080',
    '--ck-graphic-globe-box-shadow':
      ' 0 0 0 1px #999A9E, 1px 1px 0px rgba(255, 255, 255, 0.75), -1px -1px 0px rgba(0, 0, 0, 0.05), inset 0px 0px 0px 0px #97B9EC',
      */
    "--ck-siwe-border": "#919B9C",
};

var retro = {
    "--ck-font-family": '"SF Pro Rounded",ui-rounded,"Nunito",-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol"',
    "--ck-border-radius": "8px",
    "--ck-connectbutton-font-size": "17px",
    "--ck-connectbutton-color": "#000000",
    "--ck-connectbutton-background": "#ffffff",
    "--ck-connectbutton-box-shadow": "-4px 4px 0px #000000, inset 0 0 0 2px #000000",
    "--ck-connectbutton-border-radius": "8px",
    "--ck-connectbutton-hover-background": "#F3EDE8",
    "--ck-connectbutton-active-box-shadow": "0 0 0 0 #000000, inset 0 0 0 2px #000000",
    "--ck-connectbutton-balance-color": "#000000",
    "--ck-connectbutton-balance-background": "#F3EDE8",
    "--ck-connectbutton-balance-box-shadow": "-4px 4px 0px #000000, inset 0 0 0 2px #000000",
    "--ck-connectbutton-balance-hover-background": "#eee5dd",
    "--ck-connectbutton-balance-connectbutton-box-shadow": "-4px 8px 0px -4px #000000, inset 0 0 0 2px #000000",
    "--ck-connectbutton-balance-connectbutton-border-radius": "0px 8px 8px 0",
    "--ck-primary-button-color": "#373737",
    "--ck-primary-button-background": "#ffffff",
    "--ck-primary-button-box-shadow": "inset 0 0 0 2px #000000, -4px 4px 0 0 #000000",
    "--ck-primary-button-border-radius": "8px",
    "--ck-primary-button-hover-background": "#F3EDE8",
    "--ck-primary-button-hover-box-shadow": "inset 0 0 0 2px #000000, -0px 0px 0 0 #000000",
    "--ck-secondary-button-border-radius": "8px",
    "--ck-secondary-button-color": "#373737",
    "--ck-secondary-button-background": "#ffffff",
    "--ck-secondary-button-box-shadow": "-4px 4px 0 0 #000000, inset 0 0 0 2px #000000",
    "--ck-secondary-button-hover-background": "#F3EDE8",
    "--ck-secondary-button-hover-box-shadow": "0 0 0 0 #000000, inset 0 0 0 2px #000000",
    "--ck-focus-color": "#3B99FC",
    "--ck-overlay-background": "rgba(133, 120, 122, 0.8)",
    "--ck-body-color": "#373737",
    "--ck-body-color-muted": "rgba(0, 0, 0, 0.5)",
    "--ck-body-color-muted-hover": "#000000",
    "--ck-body-background": "#EBE1D8",
    "--ck-body-background-transparent": "rgba(255,255,255,0)",
    "--ck-body-background-secondary": "rgba(0,0,0,0.1)",
    "--ck-body-background-secondary-hover-background": "#4D4D4D",
    "--ck-body-background-secondary-hover-outline": "#373737",
    "--ck-body-background-tertiary": "#ffffff",
    "--ck-tertiary-border-radius": "8px",
    "--ck-tertiary-box-shadow": "-4px 4px 0 0 #000000, inset 0 0 0 2px #000000",
    "--ck-body-action-color": "#373737",
    "--ck-body-divider": "#373737",
    "--ck-body-color-danger": "#FF4E4E",
    "--ck-body-disclaimer-background": "#E3D6C9",
    "--ck-body-disclaimer-box-shadow": "-4px 4px 0 0 #000000, inset 2px 0 0 0 #000000, inset -2px 0 0 0 #000000, inset 0 -2px 0 0 #000000",
    "--ck-body-disclaimer-font-weight": "500",
    "--ck-body-disclaimer-color": "#888079",
    "--ck-body-disclaimer-link-color": "#5B5650",
    "--ck-body-disclaimer-link-hover-color": "#000000",
    "--ck-modal-box-shadow": "-10px 10px 0px #000000, inset 0 0 0 2px #000000",
    "--ck-copytoclipboard-stroke": "#555555",
    "--ck-tooltip-border-radius": "8px",
    "--ck-tooltip-color": "#373737",
    "--ck-tooltip-background": "#ffffff",
    "--ck-tooltip-background-secondary": "#EBE1D8",
    "--ck-tooltip-shadow": "-6px 6px 0 0 #000000, 0 0 0 2px #000000",
    "--ck-spinner-color": "#1A88F8",
    "--ck-dropdown-button-color": "#000",
    "--ck-dropdown-button-box-shadow": "-2px 2px 0 2px #000000,  0 0 0 2px #000000",
    "--ck-dropdown-button-background": "#ffffff",
    "--ck-dropdown-button-hover-background": "#F3EDE8",
    "--ck-dropdown-button-hover-box-shadow": "-2px 2px 0 0 #000000,  0 0 0 2px #000000",
    "--ck-dropdown-pending-color": "rgba(0, 0, 0, 0.5)",
    "--ck-dropdown-active-color": "#FFFFFF",
    "--ck-dropdown-active-static-color": "rgba(0, 0, 0, 0.5)",
    "--ck-dropdown-active-background": "#3B99FC",
    "--ck-dropdown-active-box-shadow": "inset 0 0 0 2px #000000",
    "--ck-dropdown-active-border-radius": "8px",
    "--ck-dropdown-color": "rgba(0, 0, 0, 0.5)",
    "--ck-dropdown-background": "#FFFFFF",
    "--ck-dropdown-box-shadow": "-4px 4px 0 0 #000000, inset 0 0 0 2px #000000",
    "--ck-dropdown-border-radius": "8px",
    "--ck-alert-color": "rgba(0, 0, 0, 0.5)",
    "--ck-alert-background": " #F5F5F5",
    "--ck-alert-border-radius": "8px",
    "--ck-qr-border-radius": "8px",
    "--ck-qr-dot-color": "#000000",
    "--ck-qr-border-color": "#000000",
    "--ck-qr-background": "#ffffff",
    "--ck-recent-badge-border-radius": "32px",
    "--ck-recent-badge-box-shadow": "inset 0 0 0 2px currentColor",
    /** Graphics options for our themes, not to be exposed to devs */
    "--ck-graphic-primary-color": "#000000",
    "--ck-graphic-primary-background": "#ffffff",
    /*
    '--ck-graphic-secondary-color': '#ffffff',
    '--ck-graphic-secondary-background': '#808080',
    '--ck-graphic-secondary-box-shadow':
      '-4px 4px 0 2px #000000, 0 0 0 2px #000000',
  
    '--ck-graphic-compass-color': '#ffffff',*/
    "--ck-graphic-compass-background": "#FFFFFF",
    /*
    '--ck-graphic-compass-box-shadow':
      '-4px 4px 0 0 #000000, inset 0 0 0 2px #000000',
  
    '--ck-graphic-globe-background': '#ffffff',
    '--ck-graphic-globe-lines': '#808080',
    '--ck-graphic-globe-box-shadow': '6px -6px 0 2px #000000, 0 0 0 2px #000000',
    */
    "--ck-siwe-border": "#8E8985",
};

var soft = {
    "--ck-border-radius": "12px",
    "--ck-connectbutton-font-size": "17px",
    "--ck-connectbutton-border-radius": "12px",
    "--ck-connectbutton-color": "#414451",
    "--ck-connectbutton-background": "#ffffff",
    "--ck-connectbutton-box-shadow": "inset 0 0 0 1px #E9EAEC, 0px 2px 4px rgba(0, 0, 0, 0.02)",
    "--ck-connectbutton-hover-background": "#F6F7F9",
    "--ck-connectbutton-hover-box-shadow": "inset 0 0 0 1px #E9EAEC, 0px 2px 4px rgba(0, 0, 0, 0.02)",
    "--ck-connectbutton-balance-color": "#373737",
    "--ck-connectbutton-balance-background": "#F6F7F9",
    "--ck-connectbutton-balance-box-shadow": "none",
    "--ck-connectbutton-balance-hover-background": "#f1f1f3",
    "--ck-primary-button-border-radius": "12px",
    "--ck-primary-button-color": "#414451",
    "--ck-primary-button-background": "#ffffff",
    "--ck-primary-button-box-shadow": "0 0 0 1px #E9EAEC, 0px 2px 4px rgba(0, 0, 0, 0.02)",
    "--ck-primary-button-hover-background": "#F6F7F9",
    "--ck-primary-button-hover-box-shadow": "0 0 0 1px #D9DBDD, 0px 0 0 rgba(0, 0, 0, 0.02)",
    "--ck-secondary-button-border-radius": "12px",
    "--ck-secondary-button-color": "#414451",
    "--ck-secondary-button-background": "#ffffff",
    "--ck-secondary-button-box-shadow": "0 0 0 1px #E9EAEC, 0px 2px 4px rgba(0, 0, 0, 0.02)",
    "--ck-secondary-button-hover-background": "#F6F7F9",
    "--ck-secondary-button-hover-box-shadow": "0 0 0 1px #D9DBDD, 0px 0 0 rgba(0, 0, 0, 0.02)",
    "--ck-focus-color": "#1A88F8",
    "--ck-modal-box-shadow": `0px 3px 16px rgba(0, 0, 0, 0.08)`,
    "--ck-body-color": "#414451",
    "--ck-body-color-muted": "#9196A1",
    "--ck-body-color-muted-hover": "#000000",
    "--ck-body-background": "#ffffff",
    "--ck-body-background-transparent": "rgba(255,255,255,0)",
    "--ck-body-background-secondary": "#f6f7f9",
    "--ck-body-background-secondary-hover-background": "#e0e4eb",
    "--ck-body-background-secondary-hover-outline": "#4282FF",
    "--ck-body-background-tertiary": "#F6F8FA",
    "--ck-tertiary-border-radius": "13px",
    "--ck-tertiary-box-shadow": "inset 0 0 0 1px rgba(0, 0, 0, 0.04)",
    "--ck-body-action-color": "#999999",
    "--ck-body-divider": "#f7f6f8",
    "--ck-body-color-danger": "#FF4E4E",
    "--ck-body-color-valid": "#32D74B",
    "--ck-body-disclaimer-background": "#F9FAFA",
    "--ck-body-disclaimer-color": "#AFB1B6",
    "--ck-body-disclaimer-link-color": "#787B84",
    "--ck-body-disclaimer-link-hover-color": "#000000",
    "--ck-copytoclipboard-stroke": "#CCCCCC",
    "--ck-tooltip-background": "#ffffff",
    "--ck-tooltip-background-secondary": "#ffffff",
    "--ck-tooltip-color": "#999999",
    "--ck-tooltip-shadow": "0px 2px 10px rgba(0, 0, 0, 0.08)",
    "--ck-spinner-color": "var(--ck-focus-color)",
    "--ck-dropdown-button-color": "#999999",
    "--ck-dropdown-button-box-shadow": "0 0 0 1px rgba(0, 0, 0, 0.01), 0px 0px 7px rgba(0, 0, 0, 0.05)",
    "--ck-dropdown-button-background": "#fff",
    "--ck-dropdown-button-hover-color": "#8B8B8B",
    "--ck-dropdown-button-hover-background": "#E7E7E7",
    "--ck-dropdown-color": "rgba(55, 55, 55, 0.4)",
    "--ck-dropdown-box-shadow": "0px 2px 15px rgba(0, 0, 0, 0.15)",
    "--ck-alert-color": "#9196A1",
    "--ck-alert-background": "#F6F8FA",
    "--ck-alert-box-shadow": "inset 0 0 0 1px rgba(0, 0, 0, 0.04)",
    "--ck-alert-border-radius": "8px",
    "--ck-qr-border-radius": "12px",
    "--ck-qr-dot-color": "#2E3138",
    "--ck-qr-border-color": "#E9EAEC",
    "--ck-siwe-border": "#EAEBED",
};

var midnight = {
    "--ck-font-family": '"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol"',
    "--ck-border-radius": "10px",
    "--ck-connectbutton-font-size": "17px",
    "--ck-connectbutton-border-radius": "8px",
    "--ck-connectbutton-color": "#ffffff",
    "--ck-connectbutton-background": "#313235",
    "--ck-connectbutton-box-shadow": "inset 0 0 0 1px rgba(255, 255, 255, 0.05)",
    "--ck-connectbutton-hover-background": "#414144",
    "--ck-connectbutton-active-background": "#4C4D4F",
    "--ck-connectbutton-balance-color": "#ffffff",
    "--ck-connectbutton-balance-background": "#1F2023",
    "--ck-connectbutton-balance-box-shadow": "inset 0 0 0 1px #313235",
    "--ck-connectbutton-balance-hover-background": "#313235",
    "--ck-connectbutton-balance-active-background": "#414144",
    "--ck-primary-button-border-radius": "8px",
    "--ck-primary-button-color": "#ffffff",
    "--ck-primary-button-background": "rgba(255, 255, 255, 0.08)",
    "--ck-primary-button-box-shadow": "inset 0 0 0 1px rgba(255, 255, 255, 0.05)",
    "--ck-primary-button-hover-background": "rgba(255, 255, 255, 0.2)",
    "--ck-secondary-button-border-radius": "8px",
    "--ck-secondary-button-color": "#ffffff",
    "--ck-secondary-button-background": "#363638",
    "--ck-secondary-button-box-shadow": "inset 0 0 0 1px rgba(255, 255, 255, 0.05)",
    "--ck-secondary-button-hover-background": "#3c3c3e",
    "--ck-overlay-background": "rgba(0,0,0,0.4)",
    "--ck-modal-box-shadow": `inset 0 0 0 1px #38393C, 0px 2px 4px rgba(0, 0, 0, 0.02)`,
    "--ck-focus-color": "#1A88F8",
    "--ck-body-color": "#ffffff",
    "--ck-body-color-muted": "#8B8F97",
    "--ck-body-color-muted-hover": "#ffffff",
    "--ck-body-background": "#1F2023",
    "--ck-body-background-transparent": "rgba(31, 32, 35, 0)",
    "--ck-body-background-secondary": "#313235",
    "--ck-body-background-secondary-hover-background": "#e0e4eb",
    "--ck-body-background-secondary-hover-outline": "rgba(255, 255, 255, 0.02)",
    "--ck-body-background-tertiary": "#313235",
    "--ck-tertiary-border-radius": "12px",
    "--ck-tertiary-box-shadow": "inset 0 0 0 1px rgba(255, 255, 255, 0.02)",
    "--ck-body-action-color": "#8B8F97",
    "--ck-body-divider": "rgba(255,255,255,0.1)",
    "--ck-body-color-danger": "#FF4E4E",
    "--ck-body-color-valid": "#32D74B",
    "--ck-body-disclaimer-background": "#2B2D31",
    "--ck-body-disclaimer-box-shadow": "none",
    "--ck-body-disclaimer-color": "#808183",
    "--ck-body-disclaimer-link-color": "#AAABAD",
    "--ck-body-disclaimer-link-hover-color": "#ffffff",
    "--ck-copytoclipboard-stroke": "#CCCCCC",
    "--ck-tooltip-background": "#1F2023",
    "--ck-tooltip-background-secondary": "#1F2023",
    "--ck-tooltip-color": "#ffffff",
    "--ck-tooltip-shadow": " 0 0 0 1px rgba(255, 255, 255, 0.1), 0px 2px 4px rgba(0, 0, 0, 0.02)",
    "--ck-spinner-color": "var(--ck-focus-color)",
    "--ck-dropdown-button-color": "#6C7381",
    "--ck-dropdown-button-box-shadow": "inset 0 0 0 1px rgba(255, 255, 255, 0.05)",
    "--ck-dropdown-button-background": "#313235",
    "--ck-dropdown-pending-color": "#8B8F97",
    "--ck-dropdown-active-color": "#FFF",
    "--ck-dropdown-active-static-color": "#FFF",
    "--ck-dropdown-active-background": "rgba(255, 255, 255, 0.07)",
    "--ck-dropdown-color": "#8B8F97",
    "--ck-dropdown-background": "#313235",
    "--ck-dropdown-box-shadow": "inset 0 0 0 1px rgba(255, 255, 255, 0.03)",
    "--ck-dropdown-border-radius": "8px",
    "--ck-alert-color": "#8B8F97",
    "--ck-alert-background": "#404145",
    "--ck-alert-box-shadow": "inset 0 0 0 1px rgba(255, 255, 255, 0.02)",
    "--ck-qr-border-radius": "12px",
    "--ck-qr-dot-color": "#ffffff",
    "--ck-qr-border-color": "rgba(255,255,255,0.1)",
    "--ck-recent-badge-border-radius": "32px",
};

var minimal = {
    "--ck-font-family": '"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol"',
    "--ck-border-radius": "0px",
    "--ck-connectbutton-font-size": "17px",
    "--ck-connectbutton-border-radius": "0px",
    "--ck-connectbutton-color": "#414451",
    "--ck-connectbutton-background": "#ffffff",
    "--ck-connectbutton-box-shadow": "inset 0 0 0 1px #EBEBEB",
    "--ck-connectbutton-hover-color": "#111",
    "--ck-connectbutton-hover-box-shadow": "inset 0 0 0 1px #111",
    "--ck-connectbutton-balance-color": "#111111",
    "--ck-connectbutton-balance-background": "#F7F7F7",
    "--ck-connectbutton-balance-box-shadow": "inset 0 0 0 1px #F7F7F7",
    "--ck-connectbutton-balance-hover-background": "#f1f1f3",
    "--ck-connectbutton-balance-hover-box-shadow": "inset 0 0 0 1px #111",
    "--ck-primary-button-border-radius": "0px",
    "--ck-primary-button-color": "#111111",
    "--ck-primary-button-background": "#ffffff",
    "--ck-primary-button-box-shadow": "inset 0 0 0 1px #EBEBEB",
    "--ck-primary-button-hover-box-shadow": "inset 0 0 0 1px #111111",
    "--ck-secondary-button-border-radius": "0px",
    "--ck-secondary-button-color": "#111111",
    "--ck-secondary-button-background": "#ffffff",
    "--ck-secondary-button-box-shadow": "inset 0 0 0 1px #EBEBEB",
    "--ck-secondary-button-hover-box-shadow": "inset 0 0 0 1px #111111",
    "--ck-dropdown-button-color": "#999999",
    "--ck-dropdown-button-box-shadow": "0 0 0 1px rgba(0, 0, 0, 0.01), 0px 0px 7px rgba(0, 0, 0, 0.05)",
    "--ck-dropdown-button-background": "#fff",
    "--ck-dropdown-button-hover-color": "#8B8B8B",
    "--ck-dropdown-button-hover-background": "#E7E7E7",
    "--ck-focus-color": "#1A88F8",
    "--ck-modal-box-shadow": `0px 3px 16px rgba(0, 0, 0, 0.08)`,
    "--ck-body-color": "#111111",
    "--ck-body-color-muted": "#A0A0A0",
    "--ck-body-color-muted-hover": "#000000",
    "--ck-body-background": "#ffffff",
    "--ck-body-background-transparent": "rgba(255,255,255,0)",
    "--ck-body-background-secondary": "#f6f7f9",
    "--ck-body-background-secondary-hover-background": "#e0e4eb",
    "--ck-body-background-secondary-hover-outline": "#4282FF",
    "--ck-body-background-tertiary": "#ffffff",
    "--ck-tertiary-border-radius": "0px",
    "--ck-tertiary-box-shadow": "inset 0 0 0 1px rgba(0, 0, 0, 0.04)",
    "--ck-body-action-color": "#A0A0A0",
    "--ck-body-divider": "#EBEBEB",
    "--ck-body-color-danger": "#FF4E4E",
    "--ck-body-color-valid": "#32D74B",
    "--ck-body-disclaimer-background": "#FAFAFA",
    "--ck-body-disclaimer-box-shadow": "inset 0 1px 0 0 #ECECEC",
    "--ck-body-disclaimer-color": "#9D9D9D",
    "--ck-body-disclaimer-link-color": "#6E6E6E",
    "--ck-body-disclaimer-link-hover-color": "#000000",
    "--ck-copytoclipboard-stroke": "#CCCCCC",
    "--ck-tooltip-border-radius": "0px",
    "--ck-tooltip-background": "#ffffff",
    "--ck-tooltip-background-secondary": "#ffffff",
    "--ck-tooltip-color": "#999999",
    "--ck-tooltip-shadow": "0px 2px 10px rgba(0, 0, 0, 0.08)",
    "--ck-spinner-color": "var(--ck-focus-color)",
    "--ck-dropdown-active-border-radius": "0",
    "--ck-dropdown-box-shadow": "0px 2px 15px rgba(0, 0, 0, 0.15)",
    "--ck-dropdown-border-radius": "0",
    "--ck-alert-color": "rgba(17, 17, 17, 0.4)",
    "--ck-alert-background": "#fff",
    "--ck-alert-box-shadow": "inset 0 0 0 1px #EBEBEB",
    "--ck-alert-border-radius": "0",
    "--ck-qr-border-radius": "0px",
    "--ck-qr-dot-color": "#111111",
    "--ck-qr-border-color": "#EBEBEB",
    "--ck-modal-h1-font-weight": "400",
    "--ck-modal-heading-font-weight": "400",
    "--ck-primary-button-font-weight": "400",
    "--ck-recent-badge-top-offset": "0px",
    /** Graphics options for our themes, not to be exposed to devs */
    /**
    '--ck-graphic-primary-color': '#111111',
    '--ck-graphic-primary-background': '#ffffff',
    '--ck-graphic-primary-box-shadow': 'inset 0 0 0 1px #EBEBEB',
  
    '--ck-graphic-secondary-color': '#DCDDDE',
    '--ck-graphic-secondary-background': '#ffffff',
    '--ck-graphic-secondary-box-shadow': 'inset 0 0 0 1px #EBEBEB',
  
    '--ck-graphic-compass-color': '#111111',
    '--ck-graphic-compass-background': '#ffffff',
    '--ck-graphic-compass-box-shadow': 'inset 0 0 0 1px #EBEBEB',
  
    '--ck-graphic-globe-background': '#D9D9D9',
    '--ck-graphic-globe-lines': '#ffffff',
    '--ck-graphic-globe-box-shadow': 'inset 0 0 0 1px #EBEBEB',
    */
    "--ck-siwe-border": "#EBEBEB",
};

var rounded = {
    "--ck-font-family": '"Nunito",ui-rounded,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol"',
    "--ck-border-radius": "24px",
    "--ck-connectbutton-font-size": "17px",
    "--ck-connectbutton-font-weight": "700",
    "--ck-connectbutton-border-radius": "14px",
    "--ck-connectbutton-color": "#000000",
    "--ck-connectbutton-background": "#ffffff",
    "--ck-connectbutton-box-shadow": "inset 0 0 0 2px #DFE4EC, 0 2px 0 0 #DFE4EC, 0px 2px 4px rgba(0, 0, 0, 0.02)",
    "--ck-connectbutton-hover-background": "#F9FAFB",
    "--ck-connectbutton-balance-color": "#414451",
    "--ck-connectbutton-balance-background": "#F9FAFB",
    "--ck-connectbutton-balance-box-shadow": "0 2px 0 0 #DFE4EC, 0px 2px 4px rgba(0, 0, 0, 0.02)",
    "--ck-connectbutton-balance-hover-background": "#F5F7F9",
    "--ck-connectbutton-balance-hover-box-shadow": "0 2px 0 0 #DFE4EC, 0px 2px 4px rgba(0, 0, 0, 0.02)",
    "--ck-connectbutton-balance-active-box-shadow": "0 0 0 0 #DFE4EC, 0px 2px 4px rgba(0, 0, 0, 0.02)",
    "--ck-connectbutton-active-background": "#F5F7F9",
    "--ck-connectbutton-active-box-shadow": "inset 0 0 0 2px #CFD7E2, 0 0px 0 0 #CFD7E2, 0px 2px 4px rgba(0, 0, 0, 0.02)",
    "--ck-primary-button-border-radius": "18px",
    "--ck-primary-button-color": "#000000",
    "--ck-primary-button-background": "#ffffff",
    "--ck-primary-button-box-shadow": "inset 0 0 0 2px #DFE4EC, inset  0 -4px 0 0 #DFE4EC, 0px 2px 4px rgba(0, 0, 0, 0.02)",
    "--ck-primary-button-hover-background": "#F5F7F9",
    "--ck-primary-button-hover-box-shadow": "inset 0 0 0 2px #DFE4EC, inset  0 -2px 0 0 #DFE4EC, 0px 2px 4px rgba(0, 0, 0, 0.02)",
    "--ck-secondary-button-border-radius": "16px",
    "--ck-secondary-button-color": "#000000",
    "--ck-secondary-button-background": "#ffffff",
    "--ck-secondary-button-box-shadow": "inset 0 0 0 2px #DFE4EC, inset  0 -4px 0 0 #DFE4EC, 0px 2px 4px rgba(0, 0, 0, 0.02)",
    "--ck-secondary-button-hover-background": "#F5F7F9",
    "--ck-secondary-button-hover-box-shadow": "inset 0 0 0 2px #DFE4EC, inset  0 -2px 0 0 #DFE4EC, 0px 2px 4px rgba(0, 0, 0, 0.02)",
    "--ck-focus-color": "#1A88F8",
    "--ck-modal-box-shadow": `0px 3px 16px rgba(0, 0, 0, 0.08)`,
    "--ck-body-color": "#000000",
    "--ck-body-color-muted": "#93989F",
    "--ck-body-color-muted-hover": "#000000",
    "--ck-body-background": "#ffffff",
    "--ck-body-background-transparent": "rgba(255,255,255,0)",
    "--ck-body-background-secondary": "#f6f7f9",
    "--ck-body-background-secondary-hover-background": "#e0e4eb",
    "--ck-body-background-secondary-hover-outline": "#4282FF",
    "--ck-body-background-tertiary": "#ffffff",
    "--ck-tertiary-border-radius": "22px",
    "--ck-tertiary-box-shadow": "inset 0 0 0 2px #DFE4EC, 0px 2px 4px rgba(0, 0, 0, 0.02)",
    "--ck-body-action-color": "#93989F",
    "--ck-body-divider": "#DFE4EC",
    "--ck-body-color-danger": "#FF4E4E",
    "--ck-body-color-valid": "#32D74B",
    "--ck-body-disclaimer-background": "#F9FAFB",
    "--ck-body-disclaimer-font-size": "14px",
    "--ck-body-disclaimer-font-weight": "700",
    "--ck-body-disclaimer-color": "#959697",
    "--ck-body-disclaimer-link-color": "#646464",
    "--ck-body-disclaimer-link-hover-color": "#000000",
    "--ck-copytoclipboard-stroke": "#CCCCCC",
    "--ck-tooltip-background": "#ffffff",
    "--ck-tooltip-background-secondary": "#ffffff",
    "--ck-tooltip-color": "#999999",
    "--ck-tooltip-shadow": " 0 0 0 2px #DFE4EC, 0px 2px 4px rgba(0, 0, 0, 0.02)",
    "--ck-spinner-color": "var(--ck-focus-color)",
    "--ck-dropdown-button-color": "#999999",
    "--ck-dropdown-button-box-shadow": "0 0 0 2px #DFE4EC,  0 2px 0 2px #DFE4EC, 0px 2px 4px rgba(0, 0, 0, 0.02)",
    "--ck-dropdown-button-background": "#fff",
    "--ck-dropdown-button-hover-color": "#8B8B8B",
    "--ck-dropdown-button-hover-background": "#F5F7F9",
    "--ck-dropdown-pending-color": "#848D9A",
    "--ck-dropdown-active-color": "#000000",
    "--ck-dropdown-active-static-color": "#848D9A",
    "--ck-dropdown-active-background": "#F5F7F9",
    "--ck-dropdown-color": "#848D9A",
    "--ck-dropdown-background": "#FFFFFF",
    "--ck-dropdown-box-shadow": "0px 2px 15px rgba(0, 0, 0, 0.15)",
    "--ck-dropdown-border-radius": "16px",
    "--ck-alert-color": "#848D9A",
    "--ck-alert-background": "#F5F7F9",
    "--ck-qr-border-radius": "24px",
    "--ck-qr-dot-color": "#111111",
    "--ck-qr-border-color": "#DFE4EC",
    "--ck-modal-h1-font-weight": "700",
    "--ck-modal-heading-font-weight": "700",
    "--ck-primary-button-font-weight": "700",
    "--ck-recent-badge-box-shadow": "inset 0 0 0 2px currentColor",
    "--ck-recent-badge-top-offset": "0px",
    /** Graphics options for our themes, not to be exposed to devs */
    /*
    '--ck-graphic-primary-color': '#6C7381',
    '--ck-graphic-primary-background': '#ffffff',
    '--ck-graphic-primary-box-shadow': 'inset 0 0 0 2px #DFE4EC',
  
    '--ck-graphic-secondary-color': '#DFE4EC',
    '--ck-graphic-secondary-background': '#ffffff',
    '--ck-graphic-secondary-box-shadow': 'inset 0 0 0 2px #DFE4EC',
  
    '--ck-graphic-compass-color': '#ffffff',
    '--ck-graphic-compass-background': '#6C7381',
    '--ck-graphic-compass-box-shadow': 'inset 0 0 0 2px rgba(0,0,0,0.1)',
  
    '--ck-graphic-globe-background':
      'radial-gradient(84.37% 84.37% at 50% 15.63%, rgba(255, 255, 255, 0.2) 0%, rgba(0, 0, 0, 0) 100%), linear-gradient(180deg, #DFE4EC 0%, #DFE4EC 114.06%), #DFE4EC',
    '--ck-graphic-globe-lines': '#ffffff',
    '--ck-graphic-globe-box-shadow': 'inset 0 0 0 2px #DFE4EC',
    */
    "--ck-siwe-border": "#DFE4EC",
};

var nouns = {
    "--ck-font-family": '"PT Root UI",ui-rounded,"Nunito",-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol"',
    "--ck-border-radius": "24px",
    "--ck-connectbutton-font-size": "16px",
    "--ck-connectbutton-font-weight": "700",
    "--ck-connectbutton-border-radius": "10px",
    "--ck-connectbutton-color": "#151C3B",
    "--ck-connectbutton-background": "#ffffff",
    "--ck-connectbutton-box-shadow": "inset 0 0 0 1px #D6D8E1",
    "--ck-connectbutton-hover-background": "#E9EBF3",
    "--ck-connectbutton-hover-box-shadow": "inset 0 0 0 1px #D4D8E8",
    "--ck-connectbutton-active-background": "#D4D8E8",
    "--ck-connectbutton-active-box-shadow": "inset 0 0 0 1px #D4D8E8",
    "--ck-connectbutton-balance-color": "#373737",
    "--ck-connectbutton-balance-background": "#F6F7F9",
    "--ck-connectbutton-balance-box-shadow": "none",
    "--ck-connectbutton-balance-hover-background": "#f1f1f3",
    "--ck-primary-button-border-radius": "16px",
    "--ck-primary-button-color": "#151C3B",
    "--ck-primary-button-background": "#ffffff",
    "--ck-primary-button-font-weight": "700",
    "--ck-primary-button-hover-background": "#DEE1ED",
    "--ck-secondary-button-border-radius": "16px",
    "--ck-secondary-button-color": "#151C3B",
    "--ck-secondary-button-background": "#ffffff",
    "--ck-secondary-button-font-weight": "700",
    "--ck-secondary-button-hover-background": "#DEE1ED",
    "--ck-focus-color": "#1A88F8",
    "--ck-modal-box-shadow": `0px 2px 4px rgba(0, 0, 0, 0.02)`,
    "--ck-overlay-background": "rgba(213, 215, 225, 0.8)",
    "--ck-overlay-backdrop-filter": "blur(6px)",
    "--ck-body-color": "#151C3B",
    "--ck-body-color-muted": "#757A8E",
    "--ck-body-color-muted-hover": "#000000",
    "--ck-body-background": "#F4F4F8",
    "--ck-body-background-transparent": "rgba(255,255,255,0)",
    "--ck-body-background-secondary": "#E9E9F1",
    "--ck-body-background-secondary-hover-background": "#e0e4eb",
    "--ck-body-background-tertiary": "#E9E9F1",
    "--ck-tertiary-border-radius": "24px",
    "--ck-body-action-color": "#79809C",
    "--ck-body-divider": "#D9DBE3",
    "--ck-body-color-danger": "#FF4E4E",
    "--ck-body-color-valid": "#32D74B",
    "--ck-body-disclaimer-background": "#F9FAFA",
    "--ck-body-disclaimer-color": "#AFB1B6",
    "--ck-body-disclaimer-link-color": "#787B84",
    "--ck-body-disclaimer-link-hover-color": "#000000",
    "--ck-copytoclipboard-stroke": "#79809C",
    "--ck-tooltip-background": "#ffffff",
    "--ck-tooltip-background-secondary": "#ffffff",
    "--ck-tooltip-color": "#999999",
    "--ck-tooltip-shadow": "0px 2px 10px rgba(0, 0, 0, 0.08)",
    "--ck-spinner-color": "var(--ck-focus-color)",
    "--ck-dropdown-button-color": "#999999",
    "--ck-dropdown-button-box-shadow": "0 0 0 1px rgba(0, 0, 0, 0.01), 0px 0px 7px rgba(0, 0, 0, 0.05)",
    "--ck-dropdown-button-background": "#fff",
    "--ck-dropdown-button-hover-color": "#8B8B8B",
    "--ck-dropdown-button-hover-background": "#DEE1ED",
    "--ck-dropdown-button-hover-box-shadow": "0px 0px 7px rgba(0, 0, 0, 0.05)",
    "--ck-dropdown-color": "#757A8E",
    "--ck-dropdown-box-shadow": "0 0 0 1px rgba(0, 0, 0, 0.01), 0px 0px 7px rgba(0, 0, 0, 0.05)",
    "--ck-alert-color": "#9196A1",
    "--ck-alert-background": "#F6F8FA",
    "--ck-alert-box-shadow": "inset 0 0 0 1px rgba(0, 0, 0, 0.04)",
    "--ck-alert-border-radius": "8px",
    "--ck-qr-border-radius": "24px",
    "--ck-qr-dot-color": "#000000",
    "--ck-qr-background": "#ffffff",
    "--ck-recent-badge-color": "#79809C",
    "--ck-recent-badge-background": "#F4F4F8",
    "--ck-recent-badge-box-shadow": "none",
    "--ck-siwe-border": "#DFE4EC",
    "--ck-graphic-primary-background": "#fff",
    "--ck-graphic-compass-background": "#fff",
    "--ck-graphic-primary-box-shadow": "0px 2.94737px 14.7368px rgba(0, 0, 0, 0.1)",
    "--ck-graphic-compass-box-shadow": "0px 2px 9px rgba(0, 0, 0, 0.15)",
};

var predefinedThemes = { base, web95, retro, soft, midnight, minimal, rounded, nouns };

/**
 * Theme variables for the modal
 */
const themeGlobals = {
    default: {
        "--ck-font-family": `-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica,
    'Apple Color Emoji', Arial, sans-serif, 'Segoe UI Emoji',
    'Segoe UI Symbol'`,
        "--ck-border-radius": "20px",
        "--ck-secondary-button-border-radius": "16px",
    },
    graphics: {
        light: {
            "--ck-graphic-wave-stop-01": "#E8F17D",
            "--ck-graphic-wave-stop-02": "#A8ECDE",
            "--ck-graphic-wave-stop-03": "#7AA1F2",
            "--ck-graphic-wave-stop-04": "#DEA1E8",
            "--ck-graphic-wave-stop-05": "#F46D98",
            "--ck-graphic-scaniconwithlogos-01": "#4E4E4E",
            "--ck-graphic-scaniconwithlogos-02": "#272727",
            "--ck-graphic-scaniconwithlogos-03": "#F8D74A",
            "--ck-graphic-scaniconwithlogos-04": "#F6F7F9",
            "--ck-chain-ethereum-01": "#25292E",
            "--ck-chain-ethereum-02": "#fff",
            "--ck-chain-ethereum-03": "#DFE0E0",
        },
        dark: {
            "--ck-graphic-wave-stop-01": "#E8F17D",
            "--ck-graphic-wave-stop-02": "#A8ECDE",
            "--ck-graphic-wave-stop-03": "#7AA1F2",
            "--ck-graphic-wave-stop-04": "#DEA1E8",
            "--ck-graphic-wave-stop-05": "#F46D98",
            "--ck-graphic-scaniconwithlogos-01": "#AFAFAF",
            "--ck-graphic-scaniconwithlogos-02": "#696969",
            "--ck-graphic-scaniconwithlogos-03": "#F8D74A",
            "--ck-graphic-scaniconwithlogos-04": "#3D3D3D",
            //'--ck-chain-ethereum-01': '#fff',
            //'--ck-chain-ethereum-02': '#000',
            //'--ck-chain-ethereum-03': '#000',
        },
    },
    ens: {
        light: {
            "--ck-ens-01-start": "#FF3B30",
            "--ck-ens-01-stop": "#FF9500",
            "--ck-ens-02-start": "#FF9500",
            "--ck-ens-02-stop": "#FFCC00",
            "--ck-ens-03-start": "#FFCC00",
            "--ck-ens-03-stop": "#34C759",
            "--ck-ens-04-start": "#5856D6",
            "--ck-ens-04-stop": "#AF52DE",
            "--ck-ens-05-start": "#5AC8FA",
            "--ck-ens-05-stop": "#007AFF",
            "--ck-ens-06-start": "#007AFF",
            "--ck-ens-06-stop": "#5856D6",
            "--ck-ens-07-start": "#5856D6",
            "--ck-ens-07-stop": "#AF52DE",
            "--ck-ens-08-start": "#AF52DE",
            "--ck-ens-08-stop": "#FF2D55",
        },
        dark: {
            "--ck-ens-01-start": "#FF453A",
            "--ck-ens-01-stop": "#FF9F0A",
            "--ck-ens-02-start": "#FF9F0A",
            "--ck-ens-02-stop": "#FFD60A",
            "--ck-ens-03-start": "#FFD60A",
            "--ck-ens-03-stop": "#32D74B",
            "--ck-ens-04-start": "#32D74B",
            "--ck-ens-04-stop": "#64D2FF",
            "--ck-ens-05-start": "#64D2FF",
            "--ck-ens-05-stop": "#0A84FF",
            "--ck-ens-06-start": "#0A84FF",
            "--ck-ens-06-stop": "#5E5CE6",
            "--ck-ens-07-start": "#5E5CE6",
            "--ck-ens-07-stop": "#BF5AF2",
            "--ck-ens-08-start": "#BF5AF2",
            "--ck-ens-08-stop": "#FF2D55",
        },
    },
    brand: {
        "--ck-family-brand": "#1A88F8",
        "--ck-brand-walletConnect": "#3B99FC",
        "--ck-brand-coinbaseWallet": "#0052FF",
        "--ck-brand-metamask": "#f6851b",
        "--ck-brand-metamask-01": "#F6851B",
        "--ck-brand-metamask-02": "#E2761B",
        "--ck-brand-metamask-03": "#CD6116",
        "--ck-brand-metamask-04": "#161616",
        "--ck-brand-metamask-05": "#763D16",
        "--ck-brand-metamask-06": "#D7C1B3",
        "--ck-brand-metamask-07": "#C0AD9E",
        "--ck-brand-metamask-08": "#E4761B",
        "--ck-brand-metamask-09": "#233447",
        "--ck-brand-metamask-10": "#E4751F",
        "--ck-brand-metamask-11": "#FEF5E7",
        "--ck-brand-metamask-12": "#E3C8AB",
        "--ck-brand-trust-01": "#3375BB",
        "--ck-brand-trust-02": "#ffffff",
        "--ck-brand-trust-01b": "#ffffff",
        "--ck-brand-trust-02b": "#3375BB",
        "--ck-brand-argent": "#f36a3d",
        "--ck-brand-imtoken-01": "#11C4D1",
        "--ck-brand-imtoken-02": "#0062AD",
        "--ck-brand-gnosisSafe": "#12FF80",
        "--ck-brand-dawn": "#000000",
    },
};
const themeColors = {
    light: predefinedThemes.base.light,
    dark: predefinedThemes.base.dark,
    web95: predefinedThemes.web95,
    retro: predefinedThemes.retro,
    soft: predefinedThemes.soft,
    midnight: predefinedThemes.midnight,
    minimal: predefinedThemes.minimal,
    rounded: predefinedThemes.rounded,
    nouns: predefinedThemes.nouns,
};
/**
 *  Automatically use p3 if available
 */
//  TODO: Don't use :any type
const createCssVars = (scheme, important) => {
    return css `
    ${Object.keys(scheme).map((key) => {
        const value = scheme[key];
        return value && `${key}:${value};`;
    })}
  `;
};
const createCssColors = (scheme, override) => {
    const important = override ? " !important" : "";
    return css `
    ${Object.keys(scheme).map((key) => {
        const value = scheme[key];
        return value && `${key}:${value}${important};`;
    })}
    @supports (color: color(display-p3 1 1 1)) {
      ${Object.keys(scheme).map((key) => {
        const value = scheme[key];
        return `${key}:${hexToP3(value)}${important};`;
    })}
    }
  `;
};
const themes = {
    default: createCssVars(themeGlobals.default),
    light: createCssColors(themeColors.light),
    dark: createCssColors(themeColors.dark),
    web95: createCssColors(themeColors.web95),
    retro: createCssColors(themeColors.retro),
    soft: createCssColors(themeColors.soft),
    midnight: createCssColors(themeColors.midnight),
    minimal: createCssColors(themeColors.minimal),
    rounded: createCssColors(themeColors.rounded),
    nouns: createCssColors(themeColors.nouns),
};
const globals = {
    brand: createCssVars(themeGlobals.brand),
    ensLight: createCssVars(themeGlobals.ens.light),
    ensDark: createCssVars(themeGlobals.ens.dark),
    graphicsLight: createCssVars(themeGlobals.graphics.light),
    graphicsDark: createCssVars(themeGlobals.graphics.dark),
};
const globalsLight = css `
  ${globals.brand}
  ${globals.ensLight}
  ${globals.graphicsLight}
`;
const globalsDark = css `
  ${globals.brand}
  ${globals.ensDark}
  ${globals.graphicsDark}
`;
/*
 *  Reset stylings to avoid conflicting with the parent websites styling
 * Automatically apply theme based on system theme
 */
// TODO: Think more about how to reset our components as to not be affected by external stylings
// TODO: Merge theme objects instead of overriding
let mode = "auto";
const ResetContainer = styled(motion.div) `
  ${themes.default}

  ${(props) => {
    switch (props.$useTheme) {
        case "web95":
            mode = "light";
            return themes.web95;
        case "retro":
            mode = "light";
            return themes.retro;
        case "soft":
            mode = "light";
            return themes.soft;
        case "midnight":
            mode = "dark";
            return themes.midnight;
        case "minimal":
            mode = "light";
            return themes.minimal;
        case "rounded":
            mode = "light";
            return themes.rounded;
        case "nouns":
            mode = "light";
            return themes.nouns;
        default:
            if (props.$useMode === "light") {
                mode = "light";
                return themes.light;
            }
            else if (props.$useMode === "dark") {
                mode = "dark";
                return themes.dark;
            }
            else {
                return css `
            @media (prefers-color-scheme: light) {
              ${themes.light}
            }
            @media (prefers-color-scheme: dark) {
              ${themes.dark}
            }
          `;
            }
    }
}}

  ${(props) => {
    switch (mode) {
        case "light":
            return globalsLight;
        case "dark":
            return globalsDark;
        default:
            return css `
          ${globalsLight}
          @media (prefers-color-scheme: dark) {
            ${globalsDark}
          }
        `;
    }
}}


  ${(props) => {
    var _a;
    if (props.$customTheme &&
        props.$customTheme["--ck-accent-color"] &&
        ["light", "dark", "auto", "", undefined].includes(props.$useTheme)) {
        const accentColor = props.$customTheme["--ck-accent-color"];
        const accentTextColor = (_a = props.$customTheme["--ck-accent-text-color"]) !== null && _a !== void 0 ? _a : "#ffffff";
        return {
            "--ck-accent-color": accentColor,
            "--ck-accent-text-color": accentTextColor,
            // '--ck-connectbutton-color': accentTextColor,
            // '--ck-connectbutton-background': accentColor,
            // '--ck-connectbutton-background-hover': accentColor,
            // '--ck-connectbutton-background-active': LightenDarkenColor(
            // accentColor,
            // 20
            // ),
            "--ck-secondary-button-background": accentColor,
            "--ck-secondary-button-hover-background": accentColor,
            "--ck-secondary-button-color": accentTextColor,
            "--ck-button-primary-color": accentTextColor,
            "--ck-focus-color": accentColor,
        };
    }
    if (props.$customTheme) {
        return createCssColors(props.$customTheme, true);
    }
}}

  all: initial;
  text-align: left;
  text-direction: ltr;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-text-stroke: 0.001px transparent;
  text-size-adjust: none;
  font-size: 16px;

  button {
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    -webkit-text-stroke: 0.001px transparent;
  }

  &,
  * {
    font-family: var(--ck-font-family);
    box-sizing: border-box;
    outline: none;
    border: none;
  }
  /*
  @media (prefers-reduced-motion) {
    * {
      animation-duration: 60ms !important;
      transition-duration: 60ms !important;
    }
  }
  */
  img,
  svg {
    max-width: 100%;
  }
  strong {
    font-weight: 600;
  }
  a:focus-visible,
  button:focus-visible {
    outline: 2px solid var(--ck-focus-color);
  }
`;

const Portal = (props) => {
    props = {
        selector: "__CONNECTWSC__",
        ...props,
    };
    const { selector, children } = props;
    const ref = useRef(null);
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        const selectorPrefixed = "#" + selector.replace(/^#/, "");
        ref.current = document.querySelector(selectorPrefixed);
        if (!ref.current) {
            const div = document.createElement("div");
            div.setAttribute("id", selector);
            document.body.appendChild(div);
            ref.current = div;
        }
        setMounted(true);
    }, [selector]);
    if (!ref.current)
        return null;
    return mounted ? createPortal(children, ref.current) : null;
};

const Flint = ({ ...props }) => (jsxs("svg", { width: "60", height: "60", viewBox: "0 0 60 60", fill: "none", ...props, children: [jsx("path", { d: "M18.3354 19.1931L31.6521 5.68608C32.5625 4.68925 32.8875 4.78633 33.1978 5.92728L33.3167 15.5752C33.2838 17.0807 33.1742 17.7299 32.7222 18.3489L24.6371 26.6702C23.5799 27.9775 23.725 28.4994 23.6859 29.0822C23.6468 29.665 24.7146 31.3643 26.5395 31.4942C26.5395 31.4942 31.4879 31.4952 32.0088 31.4942C32.5297 31.4931 32.8947 32.3322 32.0088 33.1825L20.8323 44.3982C19.4491 45.7011 18.6667 45.6975 17.2653 45.2424C15.1146 44.0367 15.0761 42.9238 15.0091 40.9831L15.0063 40.9009V28.5998C14.9318 24.6784 15.4924 22.5888 18.3354 19.1931Z", fill: "#FF6100" }), jsx("path", { d: "M42.4487 41.3167L28.7285 54.8237C27.7906 55.8205 27.4557 55.7234 27.136 54.5825L27.0135 44.9346C27.0474 43.4291 27.1603 42.7798 27.626 42.1608L35.9561 33.8396C37.0454 32.5322 36.8959 32.0104 36.9361 31.4276C36.9764 30.8448 35.8763 29.1454 33.9961 29.0156C33.9961 29.0156 28.8977 29.0146 28.361 29.0156C27.8243 29.0166 27.4483 28.1776 28.361 27.3272L39.8762 16.1116C41.3013 14.8087 42.1075 14.8123 43.5513 15.2674C45.7672 16.473 45.8068 17.586 45.8759 19.5267L45.8788 19.6089L45.8788 31.91C45.9556 35.8314 45.378 37.9209 42.4487 41.3167Z", fill: "#FF6100" })] }));
const Eternl = ({ ...props }) => (jsxs("svg", { width: "30", height: "30", viewBox: "0 0 30 30", fill: "none", children: [jsx("div", { id: "in-page-channel-node-id" }), jsx("rect", { width: "30", height: "30", fill: "url(#pattern0)" }), jsxs("defs", { children: [jsx("pattern", { id: "pattern0", patternContentUnits: "objectBoundingBox", width: "1", height: "1", children: jsx("use", { xlinkHref: "#image0_1331_21520", transform: "scale(0.0078125)" }) }), jsx("image", { id: "image0_1331_21520", width: "128", height: "128", xlinkHref: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA4ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDcuMS1jMDAwIDc5LmVkYTJiM2ZhYywgMjAyMS8xMS8xNy0xNzoyMzoxOSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo4ZmU4ODM0My1iMjExLTQ2YWEtYmE3MS0xZWFiZmZkNWZjMzEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NzJEMDlDODVBMTI1MTFFQzhBMjdGRTQzMjI4NjJBRDIiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NzJEMDlDODRBMTI1MTFFQzhBMjdGRTQzMjI4NjJBRDIiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIzLjEgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo1YzY1MGU0NC04MzE3LTQxMjMtOGFlNy03ZWQyZTVlYmVhMTciIHN0UmVmOmRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo0N2NhMTg2Yy04YThlLThkNDYtYWE3OS0zODY4MWRiMTljMTUiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4vGRlgAAAb3klEQVR42uxdC5ReRX3/z9z7PfbLgzw3bGATiJAGSAgGaEBUWIoWrVgtetR6VKrSY/UgFvSojdpjJdpTD+Wcllo8fYA8RGzBelSkUE0QeSmEgJJEk5CQJRs2hGSTfXyPe+9MZ+a+ZubO/fZezq5+33InZzJzH3u/77v/3/85/5lBlFIoyqu34OIVFAAoSgGAohQAKEoBgKIUAChKAYCiFAAoSgGAohQAKEoBgKIUAChKAYCiFAAoSgGAohQAKEoBgKLMrGJP5cPq9TpkzTCirgdes8VaAlalBNasKuBKpcyuaN8JZfz05H3UdGUqEqDo5N+Eaq1UPOK2ms7EGBCnCQhbYJWrgKxspEAIQbVaFW1HAYATf2BgAIaGhtreR1oueI0W9CxdYC08f826RW9ce+G8c08/p3rCkhWWPXsBBVSmFLMX51egVtSnYT86Z03aB4oAMSogAmob9MFwLuyD3NeuR8c0eQwpbUAyh9TdkYmDL+0d2fX0loNPP/jQwa0P/WL84GAD24wRypW2oO/p6YFNmzbB0qVLp4RuaKpyAicmJmDFihUwPDzc9j6rd87C13zs7Vf0v++PPjD7D5avRajM3zMQ9j2Ix3+4FRAQq21QCbUkAktt0Ceib0fnBQAIxJUa+vI503naBjwpoFD6xCep3GeMD5grYBdgdP9zv9m3+b/u/O3/3PQfjYN7X2jLsbYNu3fvhmXLlnUeAFatWgWDg4NmY6NagtM+fflfrfzU5Z/vWbik3wUHPEoYoVDMrWlcrhAca8TmfTv1nAIACtn7k4BAlg66hEiTDgooID7Hpb/NGL95ZPzQb79/0w1bb/3K9c740abpPdZqNdixYwf09/d3jxF43Or+/kt++tUfr/vKld+oLJzV75BjQAj7fQwAjPysElF9jRnLZRS+oei8ympIUcp+Re0UNW3fRwpnBMdU+4igj0C6rhNbIi5kUBGkxfTCMQaC0qxFaz947ca33fjog71nvH71jPACFlx81jlvfnDjz5acf8alLXqUcWZLEDYkPCeqfOz3fWCABA7/OlWIDUDV8wFFkEK1duIvJqTMlQg0QsutBgiURnwwExwk4OjXqAfQYkBYsOK09Zd+/f4HT77wfZd2NQAuOrt09l/c854fw4LFJ7kwJnE0JzSROD+QvxKXR+c1NjICIZIG8VvObCObpILG7XqLNFEOGkEVo08Dj9FI1EDhTjBpUO5ZMLDhtu8xELylKwFw2nI44Qd/79zzhaF/XtTX3AkNqLAf6UWED4keqwCaUAfiWAJKJDWQfE2VBpP6arL4hiTBdU42VRMY2kmEyTg/0YKvFhBY1YHP3vqd41dftLarAMDcevytL+KbZy+2ls07NAQbtm2E/uY+BoJqIOZjgoacH5+nyXuit0sitQAJwoecTyd31A23KKK7nWQAMyBQChhgEmMwcQyqbWDZ9tyLP3fn7bN7T5rVNQC49j34ynPPsd4Eo9yrs6B3fJiB4DoGgucDSUDUiiRbgBnuyEJ+tf2Kw2rxFrNzWLRhH1lS37akyo/Br5ahYt8V41U+J1esVxTcL9+DpOdI9/FYDdYqArPNgKgakwhB4DWYEb30+NXrP/KPG6YukjVNbuDJr1kFZGJw/q67ys8eNxf6wAudXtYSAgdnLYGNp38BBivLmSxo+i4de+sW1NhNJeYSu9RpOHXiUIP7J7t4vB/6+nYQH7Aj98+/ZkfxAMXHDyo2nOMvHJN8sYGEO0jSJQNi6ChVqxW7zL8w0/X1OC4AJrUhqSvmKtbvvvr8NUd3P757997np8wNnLJIIP+SEw0KV78NrjhuMe6DMeqzA/8VxGeJUBL4IFgGNcH5JXjx4afu3XfXz79z5MndWxsHR0a8phNraaqadLGjpzhtmumntdRs+KE25gKik4eAUZbQsHQNYwuq85fMnn/ymauXX/COy5ed99Z3cfx7TQ0EkLQ1mCDtWfvOz1390PXv/GRHSoDRsQlYt3aV/aMv7H9q5crKanBSLCjm6xysLYF/WPcleO7ogv1bP/nNj+25dfMPX40DMf3rL3vdBZ/8l3+b09t/uttQvQZdEnC10qo3Xrrvb9avfPSBu0dOWnFKZ9kAdYbiN66xXrtyubUamkhE4IyVQb7XGYaPP37d0EOXfP6SVyvxeRl8/AeP3Pe5Sy9uHj36a9s2eARE4RvomVNd3H/WpQOe0+g8I9AjFC4607oImKEGRKoh4eV+yaLXfenARw49sXfHq304dmRw2/AjN171fsbhdQyThI8ZCJaeceElfASx4wBQYlb6ulPsc8ANCY0DwuOY+LytIHj4Mbjv5vvhPiiKKLs23/bM0NZHb7dLBsNRcisJM40WLjtzXaU2r/MAMKcHwfJeawU4EvGVNqgM6t++H24vyK6W3ZvvuE24kW3iC74a6D2xMmdBreMAUClDeXYVzwcPqyqASMfcrKkjb8tOurUguVoO7d6ynTRhRBh+KXkI/LxdKs+xS5W5nRcI4k43QZXY4MOg9v3aGEfN4SN0tCC5WhrHXppw681RDJPmFpSY41aaqs+d0pQwRmwa6XrB8FgdcuPCwMXgOAXB9UKYZU8dT0Qt9bEGuY+meE2vqQVAKPLDAFAULgmtGCoigq80nQ1XyhhZuJoeitLjL8lAEMoQsMka+Mr6N24rS7IkSuQXgBYPoBSmOhI85RLAF/VEs2YiCYCkyF72X7LwvJWnr7rmXVfNO3vl66ldPk6khQUhX0JLrF+K+lGFMmt5uhm7TizAzICSqwgHh8dc53pSGNjTQsU0Q0jYkALGf65br9d/tGFgYOLwJMmSku7XAQCQMgTdeQAIDD4khWKp9M2FBMjH/is/dME71v77Z79VtatzHfaGBKE5UYNWEDpqy+DRgPC0wvq82uLFCkK7cWt5AaFNVQaBp40dpIHBMJhjsdfhjLsusuxM71lOKQNDRlL0WZ2tApCk+2nM7JwdOAByIPj8VbDq9mtfuP0bMDhrNyyHCnWA2z+UuoLrKXisDSthx8RveYKpEJnMJKFVJgFsEURBru9KsT8HEhCbhuekSgLA0DAnxfO/OpZyVuTsNaoRPsS8eB2tVitrrrwsQXTuF4fToALwlEsAJQAU1FAyREGhbI/76z+3rlnhPj/rM8/8HSxr7oEmKrEv7DIs8cQSz08wgaDPWVUcx/kFxoF/qnKbMemj3SghSb/HeC6H2DZJEtN37FwAyL6/HAWMwBD0M5RqGaz1q6w3QLMES8aGYcOz1zEQ7I1BIIDgBkBwBRCwlHEUJ5ckZWYiyDLJULFx6FgiEDYQXL4vs2FJIDG8nJpw0pkSQCO6EQQYsmgxpjEqmOLZIrDEiN4rQPCVQBLY7LojCB9LBDeWCkIaSFQBza2ihlx/neg0Hxiw3qc5ATBZajmZeuJPgwSQQr4RCLBKfJL1IxnveowMzIIHjw9+lBUQNLgkYCCIgRCqBDdoiTk9LIVLsVRRilcQHmPPcH+bJJPMEoCmJ5ckvIPOAwBK6n6T+BegyPhIzv2c+KLFPghGfRAsbz4XSALXB0EAhoR9oGUKI0hyvkxohdiaV5BwD70U1aBJgTwqQNf9pqlrXWADoCTX55YA/HmWBIJQElQ0EFjM3fLAsghg26+WTVkLUS6hyC20DDl8rOWj1/wbWRlr1nvFs3kfZXQBoX0WsgKKjnQDKUhBIBy4f1qaK5JcnKwqhc8X9KRcAk4xKwbBxtO/CHvhhLrlNin3/QltMd+/xVoHPMKnn3l8Oi5z9zAgPtmKp1vzUHRYXd8VDFsauH804G6icTUYLHNjnj/1QeA06nUx8TGHCqDEHGlEHR8JlEPBKJgYbQRAxlCG4HoNABIQeI7hZ7Z8ub7+6urAyHB9iIZCns83BN/YpOEghBZcMYValWMTAbKGf0MQiDgYpeNHDxzIrQIMeYy088cCsBoKjmCLVADksQFcy4/aiMTSgA0Fm3LZ3cMkwSFq7aJ7J0ZguKtHg3QvANQgkB4n6NyxgDAUTJH6C0IAeDmeF+l+FKSWBypASAFPfI5Lqsw2bJSnXDb+HopRz0sSqbNtANBsAB3CoSSgOTiCE98NARBIAB6TtQKJwMWJyEBqwEwo+riCCSDRPIKOtwEi+OoLpNB8NoDL4/hyZIbG6oC/jRbKPbrYyRIA0oJH0xQHmHobIE0ChFZU5gEhZACA5LjjwFx2cKxuZogESJvjSrsPALInIEuAjMUNbABXyy8IpQEHU9OdCcyv2ABprjLKY0D/fo1ADMb1sSBnHMBjX8+xfdCYZlNyALSsGSEB9OifSQWg7pEAKEXPo/xxADcAAOhLeFDfo2h6M0cFBCCgBkOPgpYw0h1GoEmv50gKcQMAuNRsU/BQWw4A2OWeHpiyFfayezOuW6/TDEkhehAIScQXPk/XuIGJIYbASqdBVlBWN9AEAColenIANEgmAJStnp6P/+nmzbW+vj6uNfgwg5y5Hn5NmiKgKJrE1zD8DeeDVrNev/1fBwbGjk2eE5g2hIw0T6A7jECqET8IzeZWAY4MgDAIFFIEZ5YAfCWCU5ze5RWnf8k4f2TJNzEiIITOBI4fHyUV6wCBdA0n04eHLppN18U424AQkPZ6vsNtAGk4OCEBcPwm86gATqFIAkiEj9iWUa+VPeOi1hpulY8uh1aD/W2VPbHMPqLkg4AEw3whCKJhBemnGZcsaAMKwQ95cwJ1CYAMbmJ3SQDpLeEcKkCOA7hUJTwJZxux602S2Qao0gno8cag2ZjFXiQGN0juEDmjgSQgljqxSSY+RUk1EaqGhLQIcIRzZAQZB4KowU3sSABQzQikYGaRvHEAHQBKbiGXADS7EUhbDATjUPUQkCYHARIE8jx/HSFOfOypiU0hGHQghCBAmopA0k9GIdfmdQVJik3RHTYAag8AkjMULKSAFGMIqcNHCnnOP1cBGV+KRV0o0SZUGHA8zvataqx7iS8JSJA4ogMg0jpYVQtUmgZB1VVrlJXH8kQCFULLaqfj5wVQzQ2k2i8QMjaPDSBLAC2tTMhsHigimQGFqcekgAMlaEKZzx7iz3HK0SBlxIGWJgWIBAISD3YiTS0grR9KgIwKL3U0EJBmBHbucLAWCKKaBECBkoU8ALB86ijED57DWdbNbgNgvs4YkwI2MBDwzCG+ipiHxSwj0Bd7lFIbBPElLQSSVAhVgDICHvRxzvCtnAOoCE7TUrVdEQiikmykgV/k5YgDhPmALqg5hTIAnOxWkY2QVWZvsEyJmGRGwwRSJklcL7BRwTj5J3ZAwp9GpGNJqEU/mQb5g9S2c6kAEs8AQgYvAEhHA0CyAUwAkFkpbyhYJ76XXwLU3YmxujM60WRKoIUccFCD1Qq4rPLWc5GPK9kjkLLclVgB0iSCbAeEEoBrGCdbFLDdGsSRWukKCUClzF8dAAjn8wKijCAqEV/KEiZBskiG0vRa9Y89fNWAhWyLBE6+mDeEwj7ELWof4GlnclDNCOTEHxvPlhOozGXRZrZHObbdkRGk+UoyAEhWGYZionugcT9WAUCzaBRKDzVeHoIOLsbpX9LGQ92VFUw1IzAM3eYyAkNuh0kkwAwaDZS4nGrjAF20PgDWdD+SAJBdZ8fEpnG8Vp4tJM7BjCmKG4i60Q2MJABKxu5Bsw/yhJZ1IzAivpUjtNwFACDacvOSRxGm1KPOXyImNJchaSrDK5gaJggvu4GW5hHMkL0vtUmr8gg66ppQcMIIRGrMFHDsSOdRAUTzAqS+v2T8DEgJg0lmANNOHwxKuIHILAXyrBEURf+oeZIp+yyCZo4KAC0UHPr+ig0AHTsWgJIzgxIrheN44YgskcCI2CkAQD4APEq8mUB/eTCIyjaA/E66ZnYwNRiCeY3AaPiXaGsN+ZM/+Q4c/D3Ntiqze6xmLQ2YFMxRHDppZAcl3zfK/1pETiBkyAmUF4ZASSnQJSqgTZVjppm9AMMyM8Hewi57VtkqV+899+ObW4BdD9ligEe0rLpQgvCci0rBOX6tFN0T3S/9nQf+9jQe8remIUgMI7GWH+PEKriQ8jNFxhoj/j/9YGDg2HiOnEBpVTAkTXzqgjiAHggyxQFySoBw/EBadl7sESSIgvnWaqi/Z2GfFxE4aJXjkjgWFUraNR8QrgKAuC+AID6PHwdrkKHkYuhgWCKZL+tfd1w36yIRadO/ZDcQOn52cJaaWwJI2UDC8At2E0f+SkAOJWIfYg95rPqSgRPLRcFCMaLvBw1dvroge8MuYzUP+N8Elf9DXtC6EQh8rg9BYEXHYgWi0KmRRgbDUUIIcgeI22oB5B8MMqXNdNfEkFQjMM8M4ZDoNDIehQiGsOUgiMFAg2vxwhCQGMgJdxj1d/EKNqCkVNqyllcscgf8hSeRmEmAw+fyNDLxEL5TWTB+HIQ9Iv898HiVrY9zBoIMgcApzwaa5kBQmgTItkycWDyZYAThSw5W/aAK92NpM1mpRopTd5rkxaJkqATEp1gAAfPVRtnnINbiAMz8mSKHkH8u9aeXIOqPa4gsIawSK8wcysWx2mCQHASikWfUFQAw1ChXEGV8F7TF7q3LOVk04PqI+2VJEBCeStyfYD4KGlv6/la8eTWNJAAKLAwqVvGOJUCc/kOCFMdgcEuWBJpRl2csADQVQLVAUWevFEq1HUL0zaNI9kBQ3XPdbaMv/5LvKygifpLOj9tgHSAU83NM63YhE1VmiKVlaSgFwtZXBzjc4p7S5I6nXEKI1rysK+Scx2dcJJJM3zKx0wOAVBWA1ZyqDOX6Pb+4gbEY4VmasciXK0qtMe2ROeSqACEJCrlibfPqkPDiG9AQDG1W+Xwl4wH6dvSdv1AkGAguEV2WBBnL/S/veWLDjgc+AVaZYKvKHD5L7L6JxdqAfovFYpHSMWvFfchv1YqD6vft6Djuy210nZFBHIctQsHfheexv3odQNTG6wnmWycQNBAZdyXv7DhAsEsy0eL/Sj/7I7+69+Gbtk8c/s2nTnrDtatnLz0XsD2br/0XuWPCdfPdM485eZHbFvrwQTDHk87H9/v+fXyfJf19eBwEgeQ+Cm0Rue8bqCSQPvHUxYw5gZDcQVx2A2jHh4JlCZAWEYRXtpzL9w5u38RrX2XufMZxs9XFX2Wdr/URSoR7qeoMGhxErY/Mn5ElzOwbcZQeq2fICdQXmgRprsE07hryewkFv9Lh2wPNY0dYcwRmZKGK3jclBeWdafS7B4BgufYg4CGWEsIUiqK9OYsKh9OwOARC0m4hHWsE8hkWFDntAQBQtcrlxZWeWQXJ1TKn2ttTtXtqlLbfP1hEtJGYKtNZAHA8r9VwvZHUKGBo/OGyvXrOotMLkqulb/7q11QsWKAvOK2DwHVbo47bHOs4AIy5Dt0/PvF8tMpCGgiYi/PepaveV5BcLWcvf/e7xU43hlXHw2PuYh4bPzA01jjUeQBoeB48eeTQFnUo2DBI7rpwSe8p7/iTxSvWF2T3S//CdcvXnPimK1sOJPcOlFxDm/03fOTZpxvOMdpxAOCDJA8e3L9ZTOJoOybAfxAq3XLWZbece9zxS17txJ9XO6H24QtuvrWM7XmUJjOA5d1EeXhl59CDPyVTmAE3ZQDosWz42UtDv9w/duw5McG+HQiYtFhUmbPq/j98/wMfWrrm7Fcr8deecNkpG97yyI9OWnjmGzn3GzefoNHoMoxOTBzdtu/en5Tsaue5gTw8um9itHHX4K7brlnQ97fgttLVQKAK5lk9a2458/Kff2Tpulu+O7z9u1tGD2w70BwbdShJCdCkB3+UwAya7O/aPSfD3yFIfVZ6kIjvJFqGuZXe2gnz1px6zrJ3/dnqE9/8UXbbPEF8FG+wIrt+4aTQagXgiV33fm//4V8P27gydc5bxijlpGViYgJOOvUUqB462vfbt350W5WJtFR1QLQxA/Zi/EV6yJExzxnzlwSKh315eDYMtxLtfNwPQ7ZhSNZSzkXPCP6GSGllyvPBij47/iw15KuEf5XcBClbKRxGkhJVECpBuVSr2RYs5BBvefGqeTRlVbIQDEzAuhvvOf/sF0Yff2bPruehv7+/8wJBVfYtB1sTB27a/fTXP7XqdRvBbSpD74l5AkFsgHqun32D8PyaVZ5PlZesv3wrAYCIkCATOQkAHxwhAJJgoKACJwKCBhL5vEr0mOAyOOI8BgYUQqBJwsQVKcgTh9JUScDVK+OPh3fe/Z/Pv/zYM7VaT4cGgqTy5R2PXb/zyMEnwSobCQ6grrsmJ3O47NeLPZzYfQ7vM3UgzkXVz//jkAn7HuEt9fsQnOObRUXVPybKubgS6krX/D4/xzeb8q+5Yr/isE+Ies5vHVFpdM3xK/H74prYlUoaWqbJOL8yCMRqiZlTh8cOD979i2s2QKq66TAAjDjN5hVbfvzBluuOCNFuAgGN9a8++k61hK3kYg5I0rOmY11/U11ph/ovJYWEKpaBb4lTSM0ZoHJySfI6UDnbKL4/yk2UN6ySjrnbhyk4t/78yg8dHt93aDpoNW0zKx85PLTtiid/+F6PQkNs4mewBULRCIZUrogkCLXJ5IspZDIIzYUaj/WxwDh5NElUWachCSxmQBAjaDgocNRXQSC2nmdNib2aOx675i+37rtn03TRaVqn1t45tON/P7Dl+5c3PTICVkmiFpIIComEzjirRya4Kh1NfJu96HChkSJGUV/l6AQYqE5QkiCw+suIBhyigkhSAWUsiO/c8dinP/yT7TfcMp00mva51XcObb/30se/ffHuscNbwa5FH6kTHBIEN2f66qoBEsBARhesrStkcNxQWkvBCJRQTSiQppqaoOmqI/w1s5jZdKx+cM+Nm977lge2X3/zdNPndzK5fvPhfU+d/8jNb7hpz6NfY8bdGNg9fPhTSd+mykJNJmKDIblDJk+S8Glz/0x6XpUO6ZwPCQtF43Qq6XpFZQT3K5LCT0Ll6WW1ks/1j+z+729ed9/rznti310/+V3QZkrjAKeeeioMTTIFbm1t8cqrlp33ibf3nvbuxdV5fcIWYN/BERuAIDX5EyVdrSzHUb+NH6/GD5L3JD5D/hvJvSPRXAWUcP2ieQsIqwYuAz9ixrHFbSOGpNHW6OFfHbj/+/ftuOHGXYcf3tLu/VUqFdi5c+eUxQGmDAD1eh3OOusseOGFF9poXr6/A3eLCJxaW7TgjxetvOjCBScPnDG777XHV49b1mNV5hKKSvHLR0ZihyAh0kQRvZ+ZmDLxEDaDTwv2qAGe4O/lAJACCCSBQixx77ZIa/RY8+X9+44++/SOgw9t/tWL/7dpcOSZA/y9lLh0bGPT1Go1eOqpp+DEE0/sLADw57z44ovgutlyFVrM1254rhhEmmNVYH6pZ9YsuzyHPaaUFkqNF9+TUwvRJGHZlOe0URHG5yBISWVDBt8CpfgcIueHAaAxOt46MjbROipiDjb7/SUeDc1gzPIZSX19fWBZVmcBoCjdWXDxCgoAFKUAQFEKABSlAEBRCgAUpQBAUQoAFKUAQFEKABSlAEBRCgAUpQBAUQoAFKUAQFEKABSlAEBRZlb5fwEGAMzaOXay6mLeAAAAAElFTkSuQmCC" })] })] }));
const PlaceHolder = () => {
    return jsx("div", { style: { width: 80, height: 80, background: '#555' } });
};
var Logos$1 = {
    Flint,
    Eternl,
    PlaceHolder,
};

let supportedConnectors = [];
if (typeof window != 'undefined') {
    supportedConnectors = [
        {
            id: 'flint-wsc',
            name: 'WSC Flint',
            logos: {
                default: jsx(Logos$1.Flint, { background: true }),
                mobile: jsx(Logos$1.Flint, { background: true }),
                transparent: (jsx("div", { style: {
                        transform: 'scale(0.86)',
                        position: 'relative',
                        width: '100%',
                    }, children: jsx(Logos$1.Flint, {}) })),
                connectorButton: (jsx("div", { style: {
                        transform: 'scale(1.1)',
                    }, children: jsx(Logos$1.Flint, {}) })),
            },
            logoBackground: 'linear-gradient(0deg, var(--ck-brand-metamask-12), var(--ck-brand-metamask-11))',
            scannable: false,
            // defaultConnect:  () => {},
            extensions: {
                chrome: 'https://chrome.google.com/webstore/detail/flint-wallet/hnhobjmcibchnmglfbldbfabcgaknlkj',
                firefox: '',
                brave: 'https://chrome.google.com/webstore/detail/flint-wallet/hnhobjmcibchnmglfbldbfabcgaknlkj',
                edge: '',
            },
            appUrls: {
                download: '',
                website: 'https://flint-wallet.com/',
                android: 'https://play.google.com/store/apps/details?id=io.dcspark.flintwallet',
                ios: 'https://apps.apple.com/us/app/dcspark-flint-wallet/id1619660885',
            },
            extensionIsInstalled: () => {
                return isFlint();
            },
        },
        {
            id: 'etrnal-wsc',
            name: 'WSC Eternl',
            logos: {
                default: jsx(Logos$1.Eternl, { background: true }),
                mobile: jsx(Logos$1.Eternl, { background: true }),
                transparent: (jsx("div", { style: {
                        transform: 'scale(0.86)',
                        position: 'relative',
                        width: '100%',
                    }, children: jsx(Logos$1.Eternl, {}) })),
                connectorButton: (jsx("div", { style: {
                        transform: 'scale(1.1)',
                    }, children: jsx(Logos$1.Eternl, {}) })),
            },
            logoBackground: 'linear-gradient(0deg, var(--ck-brand-metamask-12), var(--ck-brand-metamask-11))',
            scannable: false,
            // defaultConnect:  () => {},
            extensions: {
                chrome: 'https://chrome.google.com/webstore/detail/eternl/kmhcihpebfmpgmihbkipmjlmmioameka/related',
                firefox: '',
                brave: 'https://chrome.google.com/webstore/detail/eternl/kmhcihpebfmpgmihbkipmjlmmioameka/related',
                edge: '',
            },
            appUrls: {
                download: 'https://chrome.google.com/webstore/detail/eternl/kmhcihpebfmpgmihbkipmjlmmioameka/related',
                website: 'https://eternl.io/',
                android: '',
                ios: '',
            },
            extensionIsInstalled: () => {
                return isEternl();
            },
        },
    ];
}
var supportedConnectors$1 = supportedConnectors;

const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;
const truncateEthAddress = (address, separator = "••••") => {
    if (!address)
        return "";
    const match = address.match(truncateRegex);
    if (!match)
        return address;
    return `${match[1]}${separator}${match[2]}`;
};
const nFormatter = (num, digits = 2) => {
    if (num < 10000)
        return num.toFixed(2);
    const lookup = [
        { value: 1, symbol: "" },
        { value: 1e3, symbol: "k" },
        { value: 1e6, symbol: "m" },
        { value: 1e9, symbol: "g" },
        { value: 1e12, symbol: "t" },
        { value: 1e15, symbol: "p" },
        { value: 1e18, symbol: "e" },
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    const item = lookup
        .slice()
        .reverse()
        .find(function (item) {
        return num >= item.value;
    });
    return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
};
const detectBrowser = () => {
    var _a;
    const browser = detect();
    return (_a = browser === null || browser === void 0 ? void 0 : browser.name) !== null && _a !== void 0 ? _a : "";
};
const detectOS = () => {
    var _a;
    const browser = detect();
    return (_a = browser === null || browser === void 0 ? void 0 : browser.os) !== null && _a !== void 0 ? _a : "";
};
const isIOS = () => {
    const os = detectOS();
    return os.toLowerCase().includes("ios");
};
const isAndroid = () => {
    const os = detectOS();
    return os.toLowerCase().includes("android");
};
const isMobile = () => {
    return isAndroid() || isIOS();
};
const isFlint = () => {
    if (typeof window === "undefined")
        return false;
    const { cardano } = window;
    if (!cardano)
        return false;
    const isFlint = Boolean(cardano.flint);
    if (isFlint)
        return true;
};
const isEternl = () => {
    if (typeof window === "undefined")
        return false;
    const { cardano } = window;
    if (!cardano)
        return false;
    const isEternl = Boolean(cardano.eternl);
    if (isEternl)
        return true;
};
function flattenChildren(children) {
    const childrenArray = React__default.Children.toArray(children);
    return childrenArray.reduce((flatChildren, child) => {
        if (child.type === React__default.Fragment) {
            return flatChildren.concat(flattenChildren(child.props.children));
        }
        flatChildren.push(child);
        return flatChildren;
    }, []);
}

var defaultTheme = {
    mobileWidth: 560,
};

const ErrorMessage$1 = styled(motion.div) `
  z-index: -1;
  pointer-events: auto;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: var(--width);
  top: 64px;
  color: #fff;
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  background: var(--ck-body-color-danger);
  border-radius: 20px;
  padding: 24px 46px 82px 24px;
  transition: width var(--duration) var(--ease);
  a {
    font-weight: 700;
    text-decoration: underline;
  }
  code {
    font-size: 0.9em;
    display: inline-block;
    font-family: monospace;
    margin: 1px;
    padding: 0 4px;
    border-radius: 8px;
    font-weight: bold;
    background: rgba(255, 255, 255, 0.1);
  }
`;
const FadeIn = keyframes `
from { opacity: 0; }
  to { opacity: 1; }
`;
const FadeInScaleUp = keyframes `
from { opacity: 0; transform: scale(0.85); }
  to { opacity: 1; transform: scale(1); }
`;
const FadeInScaleDown = keyframes `
from { opacity: 0; transform: scale(1.1); }
  to { opacity: 1; transform: scale(1); }
`;
const FadeOut = keyframes `
from { opacity: 1; }
  to { opacity: 0; }
`;
const FadeOutScaleUp = keyframes `
from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(1.1); }
`;
const FadeOutScaleDown = keyframes `
from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.85); }
`;
const PageContent = styled(motion.div) `
  max-width: 100%;
  width: 295px;
  padding-top: 48px;
`;
const MainPageContent = styled(motion.div) `
  max-width: 100%;
  width: 800px;
  padding-top: 48px;
`;
const TextWithHr = styled(motion.div) `
  user-select: none;
  position: relative;
  display: block;
  text-align: center;
  color: var(--ck-body-color-muted);
  font-size: 15px;
  font-weight: 400;
  line-height: 21px;
  span {
    z-index: 2;
    position: relative;
    display: inline-block;
    user-select: none;
    pointer-events: none;
    padding: 0 14px;
    background: var(--ck-body-background);
    transition: background-color 200ms ease;
  }
  &:before {
    z-index: 2;
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    transform: translateY(-1px);
    background: var(--ck-body-divider);
    box-shadow: var(--ck-body-divider-box-shadow);
  }
`;
const ModalHeading = styled(motion.div) `
  z-index: 3;
  pointer-events: none;
  user-select: none;
  position: absolute;
  top: 25px;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 26px;
  transform: translateX(-50%);
  width: var(--width);
  text-align: center;
  font-size: 17px;
  line-height: 20px;
  font-weight: var(--ck-modal-heading-font-weight, 600);
  color: var(--ck-body-color);
  span {
    display: inline-block;
  }
`;
const ModalContentContainer = styled(motion.div) `
  position: relative;
  padding: 0;
`;
const ModalContent = styled(motion.div) `
  left: 0;
  right: 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 0 16px;

  @media only screen and (max-width: ${defaultTheme.mobileWidth}px) {
    display: block;
  }
`;
const ModalH1 = styled(motion.h1) `
  margin: 0;
  padding: 0;
  line-height: ${(props) => (props.$small ? 20 : 22)}px;
  font-size: ${(props) => (props.$small ? 17 : 19)}px;
  font-weight: var(--ck-modal-h1-font-weight, 600);
  color: ${(props) => {
    if (props.$error)
        return "var(--ck-body-color-danger)";
    if (props.$valid)
        return "var(--ck-body-color-valid)";
    return "var(--ck-body-color)";
}};
  > svg {
    position: relative;
    top: -2px;
    display: inline-block;
    vertical-align: middle;
    margin-right: 6px;
  }
  @media only screen and (max-width: ${defaultTheme.mobileWidth}px) {
    margin-bottom: 6px;
    font-size: 17px;
  }
`;
const ModalBody = styled.div `
  font-size: 16px;
  font-weight: 400;
  line-height: 21px;
  color: var(--ck-body-color-muted);
  strong {
    font-weight: 500;
    color: var(--ck-body-color);
  }
`;
styled.div `
  padding: 0 12px;
  font-size: 13px;
  font-weight: 400;
  line-height: 16px;
  color: var(--ck-body-color-muted);
  strong {
    font-weight: 500;
    color: var(--ck-body-color);
  }
`;
const BackgroundOverlay = styled(motion.div) `
  z-index: 1;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--ck-overlay-background, rgba(71, 88, 107, 0.24));
  backdrop-filter: ${(props) => props.$blur ? `blur(${props.$blur}px)` : "var(--ck-overlay-backdrop-filter, none)"};
  opacity: 0;
  animation: ${(props) => (props.$active ? FadeIn : FadeOut)} 150ms ease-out both;
`;
const BoxIn = keyframes `
  from{ opacity: 0; transform: scale(0.97); }
  to{ opacity: 1; transform: scale(1); }
`;
const BoxOut = keyframes `
  from{ opacity: 1; transform: scale(1); }
  to{ opacity: 0; transform: scale(0.97); }
`;
const MobileBoxIn = keyframes `
  from { transform: translate3d(0, 100%, 0); }
  to { transform: translate3d(0, 0%, 0); }
`;
const MobileBoxOut = keyframes `
  from { opacity: 1; }
  to { opacity: 0; }
`;
const BoxContainer = styled(motion.div) `
  z-index: 2;
  position: relative;
  color: var(--ck-body-color);

  animation: 150ms ease both;
  animation-name: ${BoxOut};
  &.active {
    animation-name: ${BoxIn};
  }

  &:before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: var(--width);
    height: var(--height);
    transform: translateX(-50%);
    backface-visibility: hidden;
    transition: all 200ms ease;
    border-radius: var(--ck-border-radius, 20px);
    background: var(--ck-body-background);
    box-shadow: var(--ck-modal-box-shadow);
  }

  @media only screen and (max-width: ${defaultTheme.mobileWidth}px) {
    animation-name: ${MobileBoxOut};
    animation-duration: 130ms;
    animation-timing-function: ease;

    &.active {
      animation-name: ${MobileBoxIn};
      animation-duration: 300ms;
      animation-delay: 32ms;
      animation-timing-function: cubic-bezier(0.15, 1.15, 0.6, 1);
    }

    &:before {
      width: 100%;
      transition: 0ms height cubic-bezier(0.15, 1.15, 0.6, 1);
      will-change: height;
    }
  }
`;
const ControllerContainer = styled(motion.div) `
  z-index: 3;
  position: absolute;
  top: 0;
  left: 50%;
  height: 64px;
  transform: translateX(-50%);
  backface-visibility: hidden;
  width: var(--width);
  transition: 0.2s ease width;
  pointer-events: auto;
  //border-bottom: 1px solid var(--ck-body-divider);
`;
const InnerContainer$1 = styled(motion.div) `
  position: relative;
  overflow: hidden;
  height: var(--height);
  transition: 0.2s ease height;
  @media only screen and (max-width: ${defaultTheme.mobileWidth}px) {
    transition: 0ms height cubic-bezier(0.15, 1.15, 0.6, 1);
    /* animation-delay: 34ms; */
  }
`;
const PageContainer = styled(motion.div) `
  z-index: 2;
  position: relative;
  top: 0;
  left: 50%;
  margin-left: calc(var(--width) / -2);
  width: var(--width);
  /* left: 0; */
  /* width: 100%; */
  display: flex;
  justify-content: center;
  align-items: center;
  transform-origin: center center;
  animation: 200ms ease both;

  &.active {
    animation-name: ${FadeInScaleDown};
  }
  &.active-scale-up {
    animation-name: ${FadeInScaleUp};
  }
  &.exit-scale-down {
    z-index: 1;
    pointer-events: none;
    position: absolute;
    /* top: 0; */
    /* left: 0; */
    animation-name: ${FadeOutScaleDown};
  }
  &.exit {
    z-index: 1;
    pointer-events: none;
    position: absolute;
    /* top: 0; */
    /* left: 0; */
    /* left: 50%; */
    /* transform: translateX(-50%); */
    animation-name: ${FadeOutScaleUp};
    animation-delay: 16.6667ms;
  }
  @media only screen and (max-width: ${defaultTheme.mobileWidth}px) {
    /* animation: 0ms ease both; */
    /* animation-delay: 35ms; */
    animation: 0ms cubic-bezier(0.15, 1.15, 0.6, 1) both;

    &.active {
      animation-name: ${FadeIn};
    }
    &.active-scale-up {
      animation-name: ${FadeIn};
    }
    &.exit-scale-down {
      z-index: 3;
      animation-name: ${FadeOut};
    }
    &.exit {
      z-index: 3;
      animation-name: ${FadeOut};
      animation-delay: 0ms;
    }
  }
`;
const PageContents = styled(motion.div) `
  margin: 0 auto;
  width: fit-content;
  padding: 29px 24px 24px;
  backface-visibility: hidden;
`;
const ModalContainer = styled.div `
  z-index: 2147483646; // z-index set one below max (2147483647) for if we wish to layer things ontop of the modal in a seperate Portal
  position: fixed;
  inset: 0;
  --ck-spinner-color: #f07d00;
`;
const CloseButton = styled(motion.button) `
  z-index: 3;
  cursor: pointer;
  position: absolute;
  top: 22px;
  right: 17px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  padding: 0;
  margin: 0;
  color: var(--ck-body-action-color);
  background: var(--ck-body-background);
  transition: background-color 200ms ease, transform 100ms ease;
  /* will-change: transform; */
  svg {
    display: block;
  }

  &:hover {
    background: var(--ck-body-background-secondary);
  }
  &:active {
    transform: scale(0.9);
  }
`;
styled(motion.button) `
  z-index: 3;
  position: absolute;
  inset: 0;
  width: 100%; // FireFox fix
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  padding: 0;
  margin: 0;
  color: var(--ck-body-action-color);
  background: var(--ck-body-background);
  transition: background-color 200ms ease, transform 100ms ease;
  /* will-change: transform; */
  svg {
    display: block;
    position: relative;
  }

  &:enabled {
    cursor: pointer;
    &:hover {
      background: var(--ck-body-background-secondary);
    }
    &:active {
      transform: scale(0.9);
    }
  }
`;
const BackButton = styled(motion.button) `
  z-index: 3;
  position: absolute;
  inset: 0;
  width: 100%; // FireFox fix
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  padding: 0;
  margin: 0;
  color: var(--ck-body-action-color);
  background: var(--ck-body-background);
  transition: background-color 200ms ease, transform 100ms ease;
  /* will-change: transform; */
  svg {
    display: block;
    position: relative;
    left: -1px;
  }

  &:enabled {
    cursor: pointer;
    &:hover {
      background: var(--ck-body-background-secondary);
    }
    &:active {
      transform: scale(0.9);
    }
  }
`;
const InfoButton = styled(motion.button) `
  z-index: 3;
  position: absolute;
  inset: 0;
  width: 100%; // FireFox fix
  transform: translateX(-1px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  padding: 0;
  margin: 0;
  color: var(--ck-body-action-color);
  background: var(--ck-body-background);
  transition: background-color 200ms ease, transform 100ms ease;
  /* will-change: transform; */
  svg {
    display: block;
    position: relative;
  }
  &:enabled {
    cursor: pointer;
    &:hover {
      background: var(--ck-body-background-secondary);
    }
    &:active {
      transform: scale(0.9);
    }
  }
`;
const Container$5 = styled(motion.div) `
  --ease: cubic-bezier(0.25, 0.1, 0.25, 1);
  --duration: 200ms;
  --transition: height var(--duration) var(--ease), width var(--duration) var(--ease);
  z-index: 3;
  display: block;
  pointer-events: none;
  position: absolute;
  left: 50%;
  top: 50%;
  width: 100%;
  transform: translate3d(-50%, -50%, 0);
  backface-visibility: hidden;
  @media only screen and (max-width: ${defaultTheme.mobileWidth}px) {
    pointer-events: auto;
    left: 0;
    top: auto;
    bottom: -5px;
    transform: none;
    ${BoxContainer} {
      max-width: 448px;
      margin: 0 auto;
      &:before {
        width: 100%;
        border-radius: var(--ck-border-radius, 30px) var(--ck-border-radius, 30px) 0 0;
      }
    }
    ${PageContainer} {
      left: 0;
      right: 0;
      margin: 0 auto;
      width: auto;
    }
    ${PageContent} {
      margin: 0 auto;
      width: 100% !important;
    }
    ${ModalHeading} {
      top: 29px;
    }
    ${ModalContent} {
      gap: 12px;
    }
    ${ModalBody} {
      margin: 0 auto;
      max-width: 295px;
    }
    ${PageContents} {
      width: 100%;
      padding: 31px 24px;
    }
    ${ControllerContainer} {
      width: 100%;
      top: 4px;
      border-bottom: 0;
    }
    ${CloseButton} {
      right: 22px;
    }
    ${BackButton} {
      top: -1px;
      left: -3px;
    }
    ${InfoButton} {
      top: -1px;
      left: -3px;
      svg {
        width: 65%;
        height: auto;
      }
    }
    ${CloseButton},
    ${BackButton},
    ${InfoButton} {
      // Quick hack for bigger tappable area on mobile
      transform: scale(1.4) !important;
      background: transparent !important;
      svg {
        transform: scale(0.8) !important;
      }
    }
  }
`;
const Disclaimer = styled(motion.div) `
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 16px -24px -24px -24px;
  padding: 15px 40px 18px;
  font-size: var(--ck-body-disclaimer-font-size, 13px);
  font-weight: var(--ck-body-disclaimer-font-weight, 400);
  text-align: center;
  line-height: 19px;
  color: var(--ck-body-disclaimer-color, var(--ck-body-color-muted, inherit));

  & a {
    color: var(--ck-body-disclaimer-link-color, inherit);
    font-weight: var(--ck-body-disclaimer-font-weight, 400);
    text-decoration: none;
    transition: color 200ms ease;
    &:hover {
      color: var(--ck-body-disclaimer-link-hover-color, inherit);
    }
  }

  @media only screen and (max-width: ${defaultTheme.mobileWidth}px) {
    margin: 24px -24px -26px -24px;
    padding: 20px 42px 22px 42px;
  }
`;
styled(motion.div) `
  pointer-events: all;
  z-index: 9;
  position: absolute;
  bottom: 0;
  left: 50%;
  width: var(--width);
  backface-visibility: hidden;
  transform: translateX(-50%);
  transform-origin: bottom center;

  border-radius: var(--ck-border-radius, 30px);
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  transition: width 200ms ease;

  background: var(--ck-body-disclaimer-background, var(--ck-body-background-secondary));
  box-shadow: var(--ck-body-disclaimer-box-shadow);

  ${Disclaimer} {
    margin: 0 !important;
    /* visibility: hidden; */
  }

  @media only screen and (max-width: ${defaultTheme.mobileWidth}px) {
    border-radius: 0;
  }
`;
styled(motion.div) `
  z-index: 2;
  position: absolute;
  top: 100%;
  white-space: nowrap;
  padding: 8px 16px;
  color: #fff;
  font-size: 13px;
  line-height: 1.5;
  background: #1a88f8;
  border-radius: calc(var(--ck-border-radius) * 0.75);
  transform: translateY(8px) translateX(-48px);
  box-shadow: var(--ck-modal-box-shadow);
  &:before {
    content: "";
    position: absolute;
    box-shadow: var(--shadow);
    width: 18px;
    height: 18px;
    transform: translate(215%, -75%) rotate(45deg);
    background: inherit;
    border-radius: 3px 0 0 0;
  }

  @media only screen and (max-width: ${defaultTheme.mobileWidth}px) {
    transform: translateY(8px) translateX(-16px);
    &:before {
      transform: translate(40%, -75%) rotate(45deg);
    }
  }
`;

const KEYCODE_TAB = 9;
function useFocusTrap() {
    const elRef = useRef(null);
    function handleFocus(e) {
        if (!elRef.current)
            return;
        const focusableEls = elRef.current.querySelectorAll(`
        a[href]:not(:disabled),
        button:not(:disabled),
        textarea:not(:disabled),
        input[type="text"]:not(:disabled),
        input[type="radio"]:not(:disabled),
        input[type="checkbox"]:not(:disabled),
        select:not(:disabled)
      `), firstFocusableEl = focusableEls[0], lastFocusableEl = focusableEls[focusableEls.length - 1];
        const isTabPressed = e.key === 'Tab' || e.keyCode === KEYCODE_TAB;
        if (!isTabPressed) {
            return;
        }
        if (e.shiftKey) {
            /* shift + tab */ if (document.activeElement === firstFocusableEl) {
                lastFocusableEl.focus();
                e.preventDefault();
            }
        } /* tab */
        else {
            if (document.activeElement === lastFocusableEl) {
                firstFocusableEl.focus();
                e.preventDefault();
            }
        }
    }
    useEffect(() => {
        if (elRef.current) {
            elRef.current.addEventListener('keydown', handleFocus);
            elRef.current.focus({ preventScroll: true });
        }
        return () => {
            if (elRef.current) {
                elRef.current.removeEventListener('keydown', handleFocus);
            }
        };
    }, []);
    return elRef;
}
function FocusTrap(props) {
    const elRef = useFocusTrap();
    useEffect(() => {
        if (!elRef.current)
            return;
        elRef.current.focus({ preventScroll: true });
    }, []);
    return (jsx("div", { ref: elRef, tabIndex: 0, children: props.children }));
}

function usePrevious(value, initial) {
    const ref = useRef({ target: value, previous: initial });
    if (ref.current.target !== value) {
        // The value changed.
        ref.current.previous = ref.current.target;
        ref.current.target = value;
    }
    return ref.current.previous;
}

const ExternalLinkIcon = ({ ...props }) => (jsxs("svg", { "aria-hidden": "true", width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", style: {
        left: 0,
        top: 0,
    }, ...props, children: [jsx("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M4 4C2.89543 4 2 4.89543 2 6V12C2 13.1046 2.89543 14 4 14H10C11.1046 14 12 13.1046 12 12V9.66667C12 9.11438 12.4477 8.66667 13 8.66667C13.5523 8.66667 14 9.11438 14 9.66667V12C14 14.2091 12.2091 16 10 16H4C1.79086 16 0 14.2091 0 12V6C0 3.79086 1.79086 2 4 2H6.33333C6.88562 2 7.33333 2.44772 7.33333 3C7.33333 3.55228 6.88562 4 6.33333 4H4Z", fill: "currentColor", fillOpacity: 0.3 }), jsx("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M9.5 1C9.5 0.447715 9.94772 0 10.5 0H15C15.5523 0 16 0.447715 16 1V5.5C16 6.05228 15.5523 6.5 15 6.5C14.4477 6.5 14 6.05228 14 5.5V3.41421L8.70711 8.70711C8.31658 9.09763 7.68342 9.09763 7.29289 8.70711C6.90237 8.31658 6.90237 7.68342 7.29289 7.29289L12.5858 2H10.5C9.94772 2 9.5 1.55228 9.5 1Z", fill: "currentColor", fillOpacity: 0.3 })] }));
const AlertIcon = ({ ...props }) => {
    return (jsxs("svg", { "aria-hidden": "true", width: "19", height: "18", viewBox: "0 0 19 18", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: [jsx("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M6.81753 1.60122C7.39283 0.530035 8.46953 0 9.50409 0C10.5507 0 11.6022 0.539558 12.1805 1.59767L18.6047 13.3334C18.882 13.8283 19 14.3568 19 14.8622C19 16.5296 17.7949 18 15.9149 18H3.08514C1.20508 18 0 16.5296 0 14.8622C0 14.3454 0.131445 13.8172 0.405555 13.3379L6.81753 1.60122ZM9.50409 2C9.13355 2 8.77256 2.18675 8.57866 2.54907L8.57458 2.5567L2.14992 14.3166L2.144 14.3268C2.04638 14.4959 2 14.6817 2 14.8622C2 15.5497 2.43032 16 3.08514 16H15.9149C16.5697 16 17 15.5497 17 14.8622C17 14.6681 16.9554 14.4805 16.8588 14.309L16.8529 14.2986L10.4259 2.55741C10.2191 2.1792 9.86395 2 9.50409 2Z", fill: "currentColor" }), jsx("path", { d: "M9.5 11.2297C9.01639 11.2297 8.7459 10.9419 8.72951 10.4186L8.60656 6.4157C8.59016 5.88372 8.95902 5.5 9.4918 5.5C10.0164 5.5 10.4016 5.89244 10.3852 6.42442L10.2623 10.4099C10.2377 10.9419 9.96721 11.2297 9.5 11.2297ZM9.5 14.5C8.95082 14.5 8.5 14.0901 8.5 13.5058C8.5 12.9215 8.95082 12.5116 9.5 12.5116C10.0492 12.5116 10.5 12.9128 10.5 13.5058C10.5 14.0988 10.041 14.5 9.5 14.5Z", fill: "currentColor" })] }));
};
const TickIcon = ({ ...props }) => {
    return (jsx("svg", { "aria-hidden": "true", width: "18", height: "18", viewBox: "0 0 18 18", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: jsx("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M9 18C13.9706 18 18 13.9706 18 9C18 4.02944 13.9706 0 9 0C4.02944 0 0 4.02944 0 9C0 13.9706 4.02944 18 9 18ZM13.274 7.13324C13.6237 6.70579 13.5607 6.07577 13.1332 5.72604C12.7058 5.37632 12.0758 5.43932 11.726 5.86676L7.92576 10.5115L6.20711 8.79289C5.81658 8.40237 5.18342 8.40237 4.79289 8.79289C4.40237 9.18342 4.40237 9.81658 4.79289 10.2071L7.29289 12.7071C7.49267 12.9069 7.76764 13.0128 8.04981 12.9988C8.33199 12.9847 8.59505 12.8519 8.77396 12.6332L13.274 7.13324Z", fill: "currentColor" }) }));
};
const RetryIconCircle = ({ ...props }) => {
    return (jsx("svg", { "aria-hidden": "true", width: "32", height: "32", viewBox: "0 0 32 32", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: jsx("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M32 16C32 24.8366 24.8366 32 16 32C7.16344 32 0 24.8366 0 16C0 7.16344 7.16344 0 16 0C24.8366 0 32 7.16344 32 16ZM24.5001 8.74263C25.0834 8.74263 25.5563 9.21551 25.5563 9.79883V14.5997C25.5563 15.183 25.0834 15.6559 24.5001 15.6559H19.6992C19.1159 15.6559 18.643 15.183 18.643 14.5997C18.643 14.0164 19.1159 13.5435 19.6992 13.5435H21.8378L20.071 11.8798C20.0632 11.8724 20.0555 11.865 20.048 11.8574C19.1061 10.915 17.8835 10.3042 16.5643 10.1171C15.2452 9.92999 13.9009 10.1767 12.7341 10.82C11.5674 11.4634 10.6413 12.4685 10.0955 13.684C9.54968 14.8994 9.41368 16.2593 9.70801 17.5588C10.0023 18.8583 10.711 20.0269 11.7273 20.8885C12.7436 21.7502 14.0124 22.2582 15.3425 22.336C16.6726 22.4138 17.9919 22.0572 19.1017 21.3199C19.5088 21.0495 19.8795 20.7333 20.2078 20.3793C20.6043 19.9515 21.2726 19.9262 21.7004 20.3228C22.1282 20.7194 22.1534 21.3876 21.7569 21.8154C21.3158 22.2912 20.8176 22.7161 20.2706 23.0795C18.7793 24.0702 17.0064 24.5493 15.2191 24.4448C13.4318 24.3402 11.7268 23.6576 10.3612 22.4998C8.9956 21.3419 8.0433 19.7716 7.6478 18.0254C7.2523 16.2793 7.43504 14.4519 8.16848 12.8186C8.90192 11.1854 10.1463 9.83471 11.7142 8.97021C13.282 8.10572 15.0884 7.77421 16.861 8.02565C18.6282 8.27631 20.2664 9.09278 21.5304 10.3525L23.4439 12.1544V9.79883C23.4439 9.21551 23.9168 8.74263 24.5001 8.74263Z", fill: "currentColor" }) }));
};
const CopyToClipboardIcon$1 = ({ ...props }) => (jsxs("svg", { "aria-hidden": "true", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: [jsx("path", { d: "M14 9.5V7C14 5.89543 13.1046 5 12 5H7C5.89543 5 5 5.89543 5 7V12C5 13.1046 5.89543 14 7 14H9.5", stroke: "var(--ck-body-color-muted)", strokeWidth: "2" }), jsx("rect", { x: "10", y: "10", width: "9", height: "9", rx: "2", stroke: "var(--ck-body-color-muted)", strokeWidth: "2" }), jsx("path", { d: "M1 3L3 5L7 1", stroke: "var(--ck-body-color)", strokeWidth: "1.75", strokeLinecap: "round", strokeLinejoin: "round" })] }));

// https://github.com/saltycrane/use-fit-text
const LOG_LEVEL = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
    none: 100,
};
// Suppress `useLayoutEffect` warning when rendering on the server
// https://gist.github.com/gaearon/e7d97cdf38a2907924ea12e4ebdf3c85
const useIsoLayoutEffect = typeof window !== 'undefined' &&
    window.document &&
    window.document.createElement !== undefined
    ? useLayoutEffect
    : useEffect;
const useFitText = ({ logLevel: logLevelOption = 'info', maxFontSize = 100, minFontSize = 20, onFinish, onStart, resolution = 5, } = {}) => {
    const logLevel = LOG_LEVEL[logLevelOption];
    const initState = useCallback(() => {
        return {
            calcKey: 0,
            fontSize: maxFontSize,
            fontSizePrev: minFontSize,
            fontSizeMax: maxFontSize,
            fontSizeMin: minFontSize,
        };
    }, [maxFontSize, minFontSize]);
    const ref = useRef(null);
    const innerHtmlPrevRef = useRef();
    const isCalculatingRef = useRef(false);
    const [state, setState] = useState(initState);
    const { calcKey, fontSize, fontSizeMax, fontSizeMin, fontSizePrev } = state;
    // Montior div size changes and recalculate on resize
    let animationFrameId = null;
    const [ro] = useState(() => new ResizeObserver(() => {
        animationFrameId = window.requestAnimationFrame(() => {
            if (isCalculatingRef.current) {
                return;
            }
            onStart && onStart();
            isCalculatingRef.current = true;
            // `calcKey` is used in the dependencies array of
            // `useIsoLayoutEffect` below. It is incremented so that the font size
            // will be recalculated even if the previous state didn't change (e.g.
            // when the text fit initially).
            setState({
                ...initState(),
                calcKey: calcKey + 1,
            });
        });
    }));
    useEffect(() => {
        if (ref.current) {
            ro.observe(ref.current);
        }
        return () => {
            animationFrameId && window.cancelAnimationFrame(animationFrameId);
            ro.disconnect();
        };
    }, [animationFrameId, ro]);
    // Recalculate when the div contents change
    const innerHtml = ref.current && ref.current.innerHTML;
    useEffect(() => {
        if (calcKey === 0 || isCalculatingRef.current)
            return;
        if (innerHtml !== innerHtmlPrevRef.current) {
            onStart && onStart();
            setState({
                ...initState(),
                calcKey: calcKey + 1,
            });
        }
        innerHtmlPrevRef.current = innerHtml;
    }, [calcKey, initState, innerHtml, onStart]);
    // Check overflow and resize font
    useIsoLayoutEffect(() => {
        // Don't start calculating font size until the `resizeKey` is incremented
        // above in the `ResizeObserver` callback. This avoids an extra resize
        // on initialization.
        if (calcKey === 0) {
            return;
        }
        const isWithinResolution = Math.abs(fontSize - fontSizePrev) <= resolution;
        const isOverflow = !!ref.current &&
            (ref.current.scrollHeight > ref.current.offsetHeight ||
                ref.current.scrollWidth > ref.current.offsetWidth);
        const isFailed = isOverflow && fontSize === fontSizePrev;
        const isAsc = fontSize > fontSizePrev;
        // Return if the font size has been adjusted "enough" (change within `resolution`)
        // reduce font size by one increment if it's overflowing.
        if (isWithinResolution) {
            if (isFailed) {
                isCalculatingRef.current = false;
                if (logLevel <= LOG_LEVEL.info) {
                    console.info(`[use-fit-text] reached \`minFontSize = ${minFontSize}\` without fitting text`);
                }
            }
            else if (isOverflow) {
                setState({
                    fontSize: isAsc ? fontSizePrev : fontSizeMin,
                    fontSizeMax,
                    fontSizeMin,
                    fontSizePrev,
                    calcKey,
                });
            }
            else {
                isCalculatingRef.current = false;
                onFinish && onFinish(fontSize);
            }
            return;
        }
        // Binary search to adjust font size
        let delta;
        let newMax = fontSizeMax;
        let newMin = fontSizeMin;
        if (isOverflow) {
            delta = isAsc ? fontSizePrev - fontSize : fontSizeMin - fontSize;
            newMax = Math.min(fontSizeMax, fontSize);
        }
        else {
            delta = isAsc ? fontSizeMax - fontSize : fontSizePrev - fontSize;
            newMin = Math.max(fontSizeMin, fontSize);
        }
        setState({
            calcKey,
            fontSize: fontSize + delta / 2,
            fontSizeMax: newMax,
            fontSizeMin: newMin,
            fontSizePrev: fontSize,
        });
    }, [
        calcKey,
        fontSize,
        fontSizeMax,
        fontSizeMin,
        fontSizePrev,
        onFinish,
        ref,
        resolution,
    ]);
    return { fontSize, ref };
};

const FitText = ({ children }) => {
    const [ready, setReady] = React__default.useState(false);
    const { fontSize, ref: textRef } = useFitText({
        logLevel: 'none',
        maxFontSize: 100,
        minFontSize: 70,
        onStart: () => setReady(true),
        onFinish: () => setReady(true),
    });
    return (jsx("div", { ref: textRef, style: {
            visibility: ready ? 'visible' : 'hidden',
            fontSize: `${fontSize}%`,
            maxHeight: '100%',
            maxWidth: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }, children: children }));
};
FitText.displayName = 'FitText';

const InfoIcon = ({ ...props }) => (jsx("svg", { "aria-hidden": "true", width: "22", height: "22", viewBox: "0 0 22 22", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: jsx("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M20 11C20 15.9706 15.9706 20 11 20C6.02944 20 2 15.9706 2 11C2 6.02944 6.02944 2 11 2C15.9706 2 20 6.02944 20 11ZM22 11C22 17.0751 17.0751 22 11 22C4.92487 22 0 17.0751 0 11C0 4.92487 4.92487 0 11 0C17.0751 0 22 4.92487 22 11ZM11.6445 12.7051C11.6445 13.1348 11.3223 13.4678 10.7744 13.4678C10.2266 13.4678 9.92578 13.1885 9.92578 12.6191V12.4795C9.92578 11.4268 10.4951 10.8574 11.2686 10.3203C12.2031 9.67578 12.665 9.32129 12.665 8.59082C12.665 7.76367 12.0205 7.21582 11.043 7.21582C10.3232 7.21582 9.80762 7.57031 9.45312 8.16113C9.38282 8.24242 9.32286 8.32101 9.2667 8.39461C9.04826 8.68087 8.88747 8.8916 8.40039 8.8916C8.0459 8.8916 7.66992 8.62305 7.66992 8.15039C7.66992 7.96777 7.70215 7.7959 7.75586 7.61328C8.05664 6.625 9.27051 5.75488 11.1182 5.75488C12.9336 5.75488 14.5234 6.71094 14.5234 8.50488C14.5234 9.7832 13.7822 10.417 12.7402 11.1045C11.999 11.5986 11.6445 11.9746 11.6445 12.5762V12.7051ZM11.9131 15.5625C11.9131 16.1855 11.376 16.6797 10.7529 16.6797C10.1299 16.6797 9.59277 16.1748 9.59277 15.5625C9.59277 14.9395 10.1191 14.4453 10.7529 14.4453C11.3867 14.4453 11.9131 14.9287 11.9131 15.5625Z", fill: "currentColor" }) }));
const CloseIcon = ({ ...props }) => (jsxs(motion.svg, { width: 14, height: 14, viewBox: "0 0 14 14", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: [jsx("path", { d: "M1 13L13 1", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" }), jsx("path", { d: "M1 0.999999L13 13", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" })] }));
const BackIcon = ({ ...props }) => (jsx(motion.svg, { width: 9, height: 16, viewBox: "0 0 9 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: jsx("path", { d: "M8 1L1 8L8 15", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) }));
const contentTransitionDuration = 0.22;
const contentVariants$2 = {
    initial: {
        //willChange: 'transform,opacity',
        zIndex: 2,
        opacity: 0,
    },
    animate: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: contentTransitionDuration * 0.75,
            delay: contentTransitionDuration * 0.25,
            ease: [0.26, 0.08, 0.25, 1],
        },
    },
    exit: {
        zIndex: 1,
        opacity: 0,
        pointerEvents: "none",
        position: "absolute",
        left: ["50%", "50%"],
        x: ["-50%", "-50%"],
        transition: {
            duration: contentTransitionDuration,
            ease: [0.26, 0.08, 0.25, 1],
        },
    },
};
const Modal = ({ open, pages, pageId, positionInside, inline, onClose, onBack, onInfo, }) => {
    const context = useContext();
    const mobile = isMobile();
    const connector = supportedConnectors$1.find((x) => x.id === context.connector);
    const [state, setOpen] = useTransition({
        timeout: mobile ? 160 : 160,
        preEnter: true,
        mountOnEnter: true,
        unmountOnExit: true,
    });
    const mounted = !(state === "exited" || state === "unmounted");
    const rendered = state === "preEnter" || state !== "exiting";
    const currentDepth = context.route === routes.CONNECTORS ? 0 : context.route === routes.DOWNLOAD ? 2 : 1;
    const prevDepth = usePrevious(currentDepth, currentDepth);
    usePrevious(pageId, pageId);
    useEffect(() => {
        setOpen(open);
        if (open)
            setInTransition(undefined);
    }, [open]);
    const [dimensions, setDimensions] = useState({
        width: undefined,
        height: undefined,
    });
    const [inTransition, setInTransition] = useState(undefined);
    // Calculate new content bounds
    const updateBounds = (node) => {
        const bounds = {
            width: node === null || node === void 0 ? void 0 : node.offsetWidth,
            height: node === null || node === void 0 ? void 0 : node.offsetHeight,
        };
        setDimensions({
            width: `${bounds === null || bounds === void 0 ? void 0 : bounds.width}px`,
            height: `${bounds === null || bounds === void 0 ? void 0 : bounds.height}px`,
        });
    };
    let blockTimeout;
    const contentRef = useCallback((node) => {
        if (!node)
            return;
        ref.current = node;
        // Avoid transition mixups
        setInTransition(inTransition === undefined ? false : true);
        clearTimeout(blockTimeout);
        blockTimeout = setTimeout(() => setInTransition(false), 360);
        // Calculate new content bounds
        updateBounds(node);
    }, [open, inTransition]);
    // Update layout on chain/network switch to avoid clipping
    const { chain } = useNetwork();
    const { switchNetwork } = useSwitchNetwork();
    const ref = useRef(null);
    useEffect(() => {
        if (ref.current)
            updateBounds(ref.current);
    }, [chain, switchNetwork, mobile, context.options]);
    useEffect(() => {
        if (!mounted) {
            setDimensions({
                width: undefined,
                height: undefined,
            });
            return;
        }
        const listener = (e) => {
            if (e.key === "Escape" && onClose)
                onClose();
        };
        document.addEventListener("keydown", listener);
        return () => {
            document.removeEventListener("keydown", listener);
        };
    }, [mounted, onClose]);
    const dimensionsCSS = {
        "--height": dimensions.height,
        "--width": dimensions.width,
    };
    function shouldUseQrcode() {
        const c = supportedConnectors$1.filter((x) => x.id === context.connector)[0];
        if (!c)
            return false; // Fail states are shown in the injector flow
        const hasExtensionInstalled = c.extensionIsInstalled && c.extensionIsInstalled();
        const useInjector = !c.scannable || hasExtensionInstalled;
        return !useInjector;
    }
    function getHeading() {
        switch (context.route) {
            case routes.CONNECT:
                if (shouldUseQrcode()) {
                    return "Connect";
                }
                else {
                    return connector === null || connector === void 0 ? void 0 : connector.name;
                }
            case routes.CONNECTORS:
                return "Connectors";
            case routes.MOBILECONNECTORS:
                return "Mobile connectors";
            case routes.DOWNLOAD:
                return "download";
            case routes.ONBOARDING:
                return "onboarding";
            case routes.PROFILE:
                return "Buy Milkomeda-C1 Djed Osiris Dollar"; // TODO: fix it
            default:
                return "";
        }
    }
    const Content = (jsx(ResetContainer, { children: jsxs(ModalContainer, { role: "dialog", style: {
                pointerEvents: rendered ? "auto" : "none",
                position: positionInside ? "absolute" : undefined,
            }, children: [!inline && jsx(BackgroundOverlay, { "$active": rendered, onClick: onClose }), jsxs(Container$5, { style: dimensionsCSS, initial: false, children: [jsx("div", { style: {
                                pointerEvents: inTransition ? "all" : "none",
                                position: "absolute",
                                top: 0,
                                bottom: 0,
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: "var(--width)",
                                zIndex: 9,
                                transition: "width 200ms ease",
                            } }), jsxs(BoxContainer, { className: `${rendered && "active"}`, children: [jsx(AnimatePresence, { initial: false }), jsx(AnimatePresence, { initial: false, children: context.errorMessage && (jsxs(ErrorMessage$1, { initial: { y: "10%", x: "-50%" }, animate: { y: "-100%" }, exit: { y: "100%" }, transition: { duration: 0.2, ease: "easeInOut" }, children: [jsx("span", { children: context.errorMessage }), jsx("div", { onClick: () => context.displayError(null), style: {
                                                    position: "absolute",
                                                    right: 24,
                                                    top: 24,
                                                    cursor: "pointer",
                                                }, children: jsx(CloseIcon, {}) })] })) }), jsxs(ControllerContainer, { children: [onClose && (jsx(CloseButton, { onClick: onClose, children: jsx(CloseIcon, {}) })), jsx("div", { style: {
                                                position: "absolute",
                                                top: 23,
                                                left: 20,
                                                width: 32,
                                                height: 32,
                                            }, children: jsx(AnimatePresence, { children: onBack ? (jsx(BackButton, { disabled: inTransition, onClick: onBack, initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: {
                                                        duration: mobile ? 0 : 0.1,
                                                        delay: mobile ? 0.01 : 0,
                                                    }, children: jsx(BackIcon, {}) }, "backButton")) : (context.route === routes.PROFILE &&
                                                    onInfo && (jsx(InfoButton, { disabled: inTransition, onClick: onInfo, initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: {
                                                        duration: mobile ? 0 : 0.1,
                                                        delay: mobile ? 0.01 : 0,
                                                    }, children: jsx(InfoIcon, {}) }, "infoButton"))) }) })] }), jsx(ModalHeading, { children: jsx(AnimatePresence, { children: jsx(motion.div, { style: {
                                                position: "absolute",
                                                top: 0,
                                                bottom: 0,
                                                left: 52,
                                                right: 52,
                                                display: "flex",
                                                //alignItems: 'center',
                                                justifyContent: "center",
                                            }, initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: {
                                                duration: mobile ? 0 : 0.17,
                                                delay: mobile ? 0.01 : 0,
                                            }, children: jsx(FitText, { children: getHeading() }) }, `${context.route}`) }) }), jsx(InnerContainer$1, { children: Object.keys(pages).map((key) => {
                                        const page = pages[key];
                                        return (
                                        // TODO: We may need to use the follow check avoid unnecessary computations, but this causes a bug where the content flashes
                                        // (key === pageId || key === prevPage) && (
                                        jsx(Page, { open: key === pageId, initial: !positionInside && state !== "entered", enterAnim: key === pageId
                                                ? currentDepth > prevDepth
                                                    ? "active-scale-up"
                                                    : "active"
                                                : "", exitAnim: key !== pageId ? (currentDepth < prevDepth ? "exit-scale-down" : "exit") : "", children: jsx(PageContents, { ref: contentRef, style: {
                                                    pointerEvents: key === pageId && rendered ? "auto" : "none",
                                                }, children: page }, `inner-${key}`) }, key));
                                    }) })] })] })] }) }));
    return (jsx(Fragment, { children: mounted && (jsx(Fragment, { children: positionInside ? (Content) : (jsx(Fragment, { children: jsx(Portal, { children: jsx(FocusTrap, { children: Content }) }) })) })) }));
};
const Page = ({ children, open, initial, prevDepth, currentDepth, enterAnim, exitAnim, }) => {
    const [state, setOpen] = useTransition({
        timeout: 400,
        preEnter: true,
        initialEntered: open,
        mountOnEnter: true,
        unmountOnExit: true,
    });
    const mounted = !(state === "exited" || state === "unmounted");
    const rendered = state === "preEnter" || state !== "exiting";
    useEffect(() => {
        setOpen(open);
    }, [open]);
    if (!mounted)
        return null;
    return (jsx(PageContainer, { className: `${rendered ? enterAnim : exitAnim}`, style: {
            animationDuration: initial ? "0ms" : undefined,
            animationDelay: initial ? "0ms" : undefined,
        }, children: children }));
};
const OrDivider = ({ children }) => {
    return (jsx(TextWithHr, { children: jsx("span", { children: children }) }));
};

const Graphic = styled(motion.div) `
  position: relative;
  margin: 16px auto 20px;
  height: 190px;
  max-width: 295px;
  pointer-events: none;
  user-select: none;
  @media only screen and (max-width: ${defaultTheme.mobileWidth}px) {
    height: 200px;
    max-width: 100%;
    margin-bottom: 32px;
  }
`;
const LogoGroup = styled(motion.div) `
  position: absolute;
  inset: 0;
  z-index: 2;
`;
const graphicIn = keyframes `
  0%{
    opacity:0;
    transform:scale(0.9);
  }
  100%{
    opacity:1;
    transform:none;
  }
`;
const GraphicBackground = styled(motion.div) `
  z-index: 1;
  position: absolute;
  inset: 0;
  top: -2px;
  overflow: hidden;
  &:before {
    content: "";
    position: absolute;
    inset: 0;
    background: var(--ck-body-background);
    background: radial-gradient(
      closest-side,
      var(--ck-body-background-transparent, transparent) 18.75%,
      var(--ck-body-background) 100%
    );
    background-size: 100%;
  }
  svg {
    display: block;
    width: 100%;
    height: auto;
  }
  animation: ${graphicIn} 1000ms 100ms ease both;
  @media only screen and (max-width: ${defaultTheme.mobileWidth}px) {
    animation: none;
  }
`;
const logoIn = keyframes `
  0%{
    opacity:0;
    transform:scale(0) translateY(40%);
  }
  100%{
    opacity:1;
    transform:none;
  }
`;
const LogoPosition = styled(motion.div) `
  position: absolute;
  inset: 0;
  animation: cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite both;
  animation-delay: inherit;
`;
const LogoInner = styled(motion.div) `
  position: absolute;
`;
const LogoGraphic = styled(motion.div) `
  position: relative;
  overflow: hidden;
  height: 58px;
  width: 58px;
  border-radius: 13.84px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0 2px 20px 0 rgba(0, 0, 0, 0.03);

  svg {
    display: block;
    width: 100%;
    height: 100%;
  }
`;
const float = keyframes `
  0%,100%{ transform:none; }
  50%{ transform: translateY(-10%) }
`;
const FloatWrapper = styled(motion.div) `
  position: relative;
  animation: cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite both;
  animation-name: ${float};
  animation-duration: 3600ms;
`;
const rotate = keyframes `
  0%,100%{ transform:rotate(-3deg); }
  50%{ transform:rotate(3deg); }
`;
const RotateWrapper = styled(motion.div) `
  position: relative;
  animation: cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite both;
  animation-name: ${rotate};
  animation-duration: 3200ms;
`;
const Logo$1 = styled(motion.div) `
  position: absolute;
  inset: 0;

  animation: ${logoIn} 750ms cubic-bezier(0.19, 1, 0.22, 1) both;
  &:nth-child(1) {
    z-index: 2;
    animation-delay: 0ms;
  }
  &:nth-child(2) {
    z-index: 1;
    animation-delay: 60ms;
  }
  &:nth-child(3) {
    z-index: 1;
    animation-delay: 30ms;
  }
  &:nth-child(4) {
    z-index: 1;
    animation-delay: 90ms;
  }
  &:nth-child(5) {
    z-index: 1;
    animation-delay: 120ms;
  }

  &:nth-child(1) {
    ${RotateWrapper} {
      animation-delay: 0ms;
    }
  }
  &:nth-child(2) {
    ${RotateWrapper} {
      animation-delay: -600ms;
    }
  }
  &:nth-child(3) {
    ${RotateWrapper} {
      animation-delay: -1200ms;
    }
  }
  &:nth-child(4) {
    ${RotateWrapper} {
      animation-delay: -1800ms;
    }
  }
  &:nth-child(5) {
    ${RotateWrapper} {
      animation-delay: -2400ms;
    }
  }

  &:nth-child(1) {
    ${FloatWrapper} {
      animation-delay: -200ms;
    }
  }
  &:nth-child(2) {
    ${FloatWrapper} {
      animation-delay: -600ms;
    }
  }
  &:nth-child(3) {
    ${FloatWrapper} {
      animation-delay: -800ms;
    }
  }
  &:nth-child(4) {
    ${FloatWrapper} {
      animation-delay: -300ms;
    }
  }
  &:nth-child(5) {
    ${FloatWrapper} {
      animation-delay: -3200ms;
    }
  }

  @media only screen and (max-width: ${defaultTheme.mobileWidth}px) {
    animation: none !important;
    ${RotateWrapper},${FloatWrapper} {
      animation: none !important;
    }
  }

  ${LogoInner} {
    transform: translate(-50%, -50%);
  }

  &:nth-child(1) ${LogoPosition} {
    transform: translate(50%, 50%);
    ${LogoGraphic} {
      border-radius: 17.2px;
      width: 72px;
      height: 72px;
    }
  }
  &:nth-child(2) ${LogoPosition} {
    transform: translate(21%, 21.5%);
  }
  &:nth-child(3) ${LogoPosition} {
    transform: translate(78%, 14%);
  }
  &:nth-child(4) ${LogoPosition} {
    transform: translate(22.5%, 76%);
  }
  &:nth-child(5) ${LogoPosition} {
    transform: translate(76%, 80%);
  }
`;

var wave = (jsxs("svg", { "aria-hidden": "true", width: "298", height: "188", viewBox: "0 0 298 188", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [jsx("path", { d: "M1 55.2757L21.6438 46.0285C55.5896 30.8228 94.4104 30.8228 128.356 46.0286L169.644 64.5229C203.59 79.7287 242.41 79.7286 276.356 64.5229L297 55.2757M1 44.2118L21.6438 34.9646C55.5896 19.7589 94.4104 19.7589 128.356 34.9646L169.644 53.459C203.59 68.6647 242.41 68.6647 276.356 53.459L297 44.2118M1 33.1477L21.6438 23.9005C55.5896 8.69479 94.4104 8.69479 128.356 23.9005L169.644 42.3949C203.59 57.6006 242.41 57.6006 276.356 42.3949L297 33.1477M1 22.1477L21.6438 12.9005C55.5896 -2.30521 94.4104 -2.30521 128.356 12.9005L169.644 31.3949C203.59 46.6006 242.41 46.6006 276.356 31.3949L297 22.1477M1 66.3398L21.6438 57.0926C55.5896 41.8869 94.4104 41.8869 128.356 57.0926L169.644 75.587C203.59 90.7927 242.41 90.7927 276.356 75.587L297 66.3398M1 77.404L21.6438 68.1568C55.5896 52.9511 94.4104 52.9511 128.356 68.1569L169.644 86.6512C203.59 101.857 242.41 101.857 276.356 86.6512L297 77.404M1 88.4681L21.6438 79.2209C55.5896 64.0152 94.4104 64.0152 128.356 79.2209L169.644 97.7153C203.59 112.921 242.41 112.921 276.356 97.7153L297 88.4681M1 121.66L21.6438 112.413C55.5896 97.2075 94.4104 97.2075 128.356 112.413L169.644 130.908C203.59 146.113 242.41 146.113 276.356 130.908L297 121.66M1 110.596L21.6438 101.349C55.5896 86.1433 94.4104 86.1433 128.356 101.349L169.644 119.843C203.59 135.049 242.41 135.049 276.356 119.843L297 110.596M1 99.5321L21.6438 90.2849C55.5896 75.0792 94.4104 75.0792 128.356 90.2849L169.644 108.779C203.59 123.985 242.41 123.985 276.356 108.779L297 99.5321M1 132.724L21.6438 123.477C55.5896 108.271 94.4104 108.271 128.356 123.477L169.644 141.971C203.59 157.177 242.41 157.177 276.356 141.971L297 132.724M1 143.788L21.6438 134.541C55.5896 119.336 94.4104 119.336 128.356 134.541L169.644 153.036C203.59 168.241 242.41 168.241 276.356 153.036L297 143.788M1 154.853L21.6438 145.605C55.5896 130.4 94.4104 130.4 128.356 145.605L169.644 164.1C203.59 179.305 242.41 179.305 276.356 164.1L297 154.853M1 165.853L21.6438 156.605C55.5896 141.4 94.4104 141.4 128.356 156.605L169.644 175.1C203.59 190.305 242.41 190.305 276.356 175.1L297 165.853", stroke: "url(#paint0_linear_1094_2077)", strokeOpacity: "0.9", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("defs", { children: jsxs("linearGradient", { id: "paint0_linear_1094_2077", x1: "1", y1: "112.587", x2: "297.034", y2: "79.6111", gradientUnits: "userSpaceOnUse", children: [jsx("stop", { stopColor: "var(--ck-graphic-wave-stop-01)" }), jsx("stop", { stopColor: "var(--ck-graphic-wave-stop-02)", offset: "0.239583" }), jsx("stop", { stopColor: "var(--ck-graphic-wave-stop-03)", offset: "0.515625" }), jsx("stop", { stopColor: "var(--ck-graphic-wave-stop-04)", offset: "0.739583" }), jsx("stop", { stopColor: "var(--ck-graphic-wave-stop-05)", offset: "1" })] }) })] }));

const SpinnerContainer$2 = styled(motion.div) `
  position: absolute;
  right: 16px;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const Arrow = styled.svg `
  --x: -3px;
  --stroke-width: 2;
  position: relative;
  top: 1px;
  left: -0.5px;
  display: inline-block;
  vertical-align: middle;
  margin-left: 9px;
  margin-right: 1px;
  transition: all 100ms ease;
  transform: translateX(var(--x, -3px));
  color: var(--ck-secondary-button-color, var(--ck-body-color));
  opacity: 0.4;
`;
const ArrowChevron = styled.path ``;
const ArrowLine = styled.line `
  transition: inherit;
  transition-property: transform;
  transform-origin: 90% 50%;
  transform: scaleX(0.1);
`;
const DownloadArrow = styled.div `
  display: inline-block;
  vertical-align: middle;
  position: relative;
  margin-right: 6px;
  color: var(--ck-secondary-button-color, var(--ck-body-color));
`;
const DownloadArrowInner = styled.div `
  transform: rotate(90deg);
  ${Arrow} {
    margin: 0 auto;
  }
`;
const ButtonContainerInner = styled(motion.div) `
  display: flex;
  align-items: center;
  justify-content: center;
  inset: 0;
  height: 100%;
`;
const ButtonContainer = styled.button `

  ${({ disabled }) => disabled &&
    css `
      cursor: not-allowed;
      pointer-events: none;
      ${InnerContainer} {
        opacity: 0.4;
      }
    `}

  ${({ $variant }) => {
    if ($variant === "primary") {
        return css `
        --color: var(--ck-primary-button-color, var(--ck-body-color));
        --background: var(--ck-primary-button-background, var(--ck-body-background-primary));
        --box-shadow: var(--ck-primary-button-box-shadow);
        --border-radius: var(--ck-primary-button-border-radius);
        --font-weight: var(--ck-primary-button-font-weight, 500);

        --hover-color: var(--ck-button-primary-hover-color, var(--color));
        --hover-background: var(--ck-primary-button-hover-background, var(--background));
        --hover-box-shadow: var(--ck-primary-button-hover-box-shadow, var(--box-shadow));
        --hover-border-radius: var(--ck-primary-button-hover-border-radius, var(--border-radius));
        --hover-font-weight: var(--ck-primary-button-font-weight, var(--font-weight));
      `;
    }
    else if ($variant === "secondary") {
        return css `
        --color: var(--ck-secondary-button-color, var(--ck-body-color));
        --background: var(--ck-secondary-button-background, var(--ck-body-background-secondary));
        --box-shadow: var(--ck-secondary-button-box-shadow);
        --border-radius: var(--ck-secondary-button-border-radius);
        --font-weight: var(--ck-secondary-button-font-weight, 500);

        --hover-color: var(--ck-secondary-button-hover-color, var(--color));
        --hover-background: var(--ck-secondary-button-hover-background, var(--background));
        --hover-box-shadow: var(--ck-secondary-button-hover-box-shadow, var(--box-shadow));
        --hover-border-radius: var(
          --ck-secondary-button-hover-border-radius,
          var(--border-radius)
        );
        --hover-font-weight: var(--ck-secondary-button-font-weight, var(--font-weight));
      `;
    }
    else if ($variant === "tertiary") {
        return css `
        --color: var(--ck-tertiary-button-color, var(--ck-secondary-button-color));
        --background: var(--ck-tertiary-button-background, var(--ck-secondary-button-background));
        --box-shadow: var(--ck-tertiary-button-box-shadow, var(--ck-secondary-button-box-shadow));
        --border-radius: var(
          --ck-tertiary-button-border-radius,
          var(--ck-secondary-button-border-radius)
        );
        --font-weight: var(
          --ck-tertiary-button-font-weight,
          var(--ck-secondary-button-font-weight)
        );

        --hover-color: var(--button-tertiary-hover-color, var(--ck-tertiary-button-color));
        --hover-background: var(
          --ck-tertiary-button-hover-background,
          var(--ck-tertiary-button-background)
        );
        --hover-box-shadow: var(
          --ck-tertiary-button-hover-box-shadow,
          var(--ck-tertiary-button-box-shadow)
        );
        --hover-border-radius: var(
          --ck-tertiary-button-hover-border-radius,
          var(--ck-tertiary-button-border-radius, var(--border-radius))
        );
        --hover-font-weight: var(
          --ck-tertiary-button-font-weight,
          var(--ck-secondary-button-font-weight)
        );
      `;
    }
}}

  appearance: none;
  cursor: pointer;
  user-select: none;
  min-width: fit-content;
  width: 100%;
  display:block;
  text-align: center;
  height: 48px;
  margin: 12px 0 0;
  line-height: 48px;
  padding: 0 4px;
  font-size: 16px;
  font-weight: var(--font-weight,500);
  text-decoration: none;
  white-space: nowrap;
  transition: 100ms ease;
  transition-property: box-shadow, background-color;
  color: var(--color);
  background: var(--background);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  will-change: transform, box-shadow, background-color, color;

  ${DownloadArrow} {
    ${Arrow} {
      transform: translateX(0);
      ${ArrowLine} {
        transform: none;
      }
      ${ArrowChevron} {
      }
    }
  }
}

  @media only screen and (min-width: ${defaultTheme.mobileWidth + 1}px) {
    &:hover,
    &:focus-visible {
      color: var(--ck-accent-text-color, var(--hover-color));
      background: var(--ck-accent-color, var(--hover-background));
      border-radius: var(--hover-border-radius);
      box-shadow: var(--hover-box-shadow);

      ${Arrow} {
        transform: translateX(0);
        ${ArrowLine} {
          transform: none;
        }
        ${ArrowChevron} {
        }
      }
      ${DownloadArrow} {
        ${Arrow} {
          transform: translateX(var(--x));
          ${ArrowLine} {
            transform: scaleX(0.1);
          }
          ${ArrowChevron} {
          }
        }
      }
    }
    &:active {
      box-shadow: var(--ck-secondary-button-active-box-shadow, var(--hover-box-shadow));
    }
  }
  @media only screen and (max-width: ${defaultTheme.mobileWidth}px) {
    transition: transform 100ms ease;
    transform: scale(1);
    font-size: 17px;
    &:active {
    }
  }
`;
const InnerContainer = styled.div `
  transform: translateZ(0); // Shifting fix
  position: relative;
  display: inline-block;
  vertical-align: middle;
  max-width: calc(100% - 42px);
  transition: opacity 300ms ease;
  /*
  overflow: hidden;
  text-overflow: ellipsis;
  */
`;
const IconContainer$3 = styled(motion.div) `
  position: relative;
  display: inline-block;
  vertical-align: middle;
  max-width: 20px;
  max-height: 20px;
  margin: 0 10px;
  &:first-child {
    margin-left: 0;
  }
  &:last-child {
    margin-right: 0;
  }
  ${(props) => {
    return (props.$rounded &&
        css `
        overflow: hidden;
        border-radius: 5px;
      `);
}}
  svg {
    display: block;
    position: relative;
    max-width: 100%;
    height: auto;
  }
`;

const Spin = keyframes `
  0%{ transform: rotate(0deg); }
  100%{ transform: rotate(360deg); }
`;
const SpinnerContainer$1 = styled(motion.div) `
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${Spin} 1s linear infinite;
  svg {
    display: block;
    position: relative;
    animation: ${Spin} 1s ease-in-out infinite;
  }
`;

const transition$1 = {
    duration: 0.4,
    ease: [0.175, 0.885, 0.32, 0.98],
};
const Spinner$1 = () => (jsx(SpinnerContainer$1, { initial: { opacity: 0, rotate: 180 }, animate: {
        opacity: 1,
        rotate: 0,
    }, exit: {
        position: 'absolute',
        opacity: 0,
        rotate: -180,
        transition: {
            ...transition$1,
        },
    }, transition: {
        ...transition$1,
        delay: 0.2,
    }, children: jsxs("svg", { width: "18", height: "18", viewBox: "0 0 18 18", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [jsx("circle", { cx: "9", cy: "9", r: "7", stroke: "currentColor", strokeOpacity: "0.1", strokeWidth: "2.5" }), jsx("path", { d: "M16 9C16 5.13401 12.866 2 9 2", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round" })] }) }));

const transition = {
    duration: 0.4,
    ease: [0.175, 0.885, 0.32, 0.98],
};
const Button = ({ children, variant = 'secondary', // unique aspect to how we're handling buttons
disabled, icon, iconPosition = 'left', roundedIcon, waiting, arrow, download, href, style, onClick, }) => {
    const key = typeof children === 'string'
        ? children
        : flattenChildren(children).join(''); // Need to generate a string for the key so we can automatically animate between content
    const hrefUrl = typeof href === 'string' ? href : flattenChildren(href).join(''); // Need to have a flat string for the href
    return (jsx(ButtonContainer, { as: href ? 'a' : undefined, onClick: (event) => {
            if (!disabled && onClick)
                onClick(event);
        }, href: hrefUrl, target: href && '_blank', rel: href && 'noopener noreferrer', disabled: disabled, "$variant": variant, style: style, children: jsxs(AnimatePresence, { initial: false, children: [jsxs(ButtonContainerInner, { initial: { opacity: 0, y: -10 }, animate: {
                        opacity: 1,
                        y: -1,
                    }, exit: {
                        position: 'absolute',
                        opacity: 0,
                        y: 10,
                        transition: {
                            ...transition,
                        },
                    }, transition: {
                        ...transition,
                        delay: 0.2,
                    }, children: [icon && iconPosition === 'left' && (jsx(IconContainer$3, { "$rounded": roundedIcon, children: icon })), download && (jsx(DownloadArrow, { children: jsx(DownloadArrowInner, { children: jsxs(Arrow, { width: "13", height: "12", viewBox: "0 0 13 12", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [jsx(ArrowLine, { stroke: "currentColor", x1: "1", y1: "6", x2: "12", y2: "6", strokeWidth: "var(--stroke-width)", strokeLinecap: "round" }), jsx(ArrowChevron, { stroke: "currentColor", d: "M7.51431 1.5L11.757 5.74264M7.5 10.4858L11.7426 6.24314", strokeWidth: "var(--stroke-width)", strokeLinecap: "round" })] }) }) })), jsx(InnerContainer, { style: { paddingLeft: arrow ? 6 : 0 }, children: jsx(FitText, { children: children }) }), icon && iconPosition === 'right' && (jsx(IconContainer$3, { "$rounded": roundedIcon, children: icon })), arrow && (jsxs(Arrow, { width: "13", height: "12", viewBox: "0 0 13 12", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [jsx(ArrowLine, { stroke: "currentColor", x1: "1", y1: "6", x2: "12", y2: "6", strokeWidth: "2", strokeLinecap: "round" }), jsx(ArrowChevron, { stroke: "currentColor", d: "M7.51431 1.5L11.757 5.74264M7.5 10.4858L11.7426 6.24314", strokeWidth: "2", strokeLinecap: "round" })] }))] }, key), waiting && (jsx(SpinnerContainer$2, { children: jsx(Spinner$1, {}) }))] }) }));
};

const Introduction = () => {
    useContext();
    return (jsxs(PageContent, { children: [jsxs(Graphic, { children: [jsxs(LogoGroup, { children: [jsx(Logo$1, { children: jsx(LogoPosition, { children: jsx(LogoInner, { children: jsx(FloatWrapper, { children: jsx(RotateWrapper, { children: jsx(LogoGraphic, { children: jsx(Logos$1.Flint, { background: true }) }) }) }) }) }) }), jsx(Logo$1, { children: jsx(LogoPosition, { children: jsx(LogoInner, { children: jsx(FloatWrapper, { children: jsx(RotateWrapper, { children: jsx(LogoGraphic, { children: jsx(Logos$1.Flint, { background: true }) }) }) }) }) }) }), jsx(Logo$1, { children: jsx(LogoPosition, { children: jsx(LogoInner, { children: jsx(FloatWrapper, { children: jsx(RotateWrapper, { children: jsx(LogoGraphic, { children: jsx(Logos$1.Flint, {}) }) }) }) }) }) }), jsx(Logo$1, { children: jsx(LogoPosition, { children: jsx(LogoInner, { children: jsx(FloatWrapper, { children: jsx(RotateWrapper, { children: jsx(LogoGraphic, { children: jsx(Logos$1.Flint, {}) }) }) }) }) }) }), jsx(Logo$1, { children: jsx(LogoPosition, { children: jsx(LogoInner, { children: jsx(FloatWrapper, { children: jsx(RotateWrapper, { children: jsx(LogoGraphic, { children: jsx(Logos$1.Flint, {}) }) }) }) }) }) })] }), jsx(GraphicBackground, { children: wave })] }), jsxs(ModalContent, { style: { paddingBottom: 18 }, children: [jsx(ModalH1, { "$small": true, children: "Welcome!" }), jsx(ModalBody, { children: "Welcome, heres description" })] }), jsx(Button, { href: "", arrow: true, children: "Start" })] }));
};

/**
 * This is a wrapper around wagmi's useConnect hook that adds some
 * additional functionality.
 */
function useConnect({ ...props } = {}) {
    const context = useContext();
    const connectProps = {};
    const { connect, connectAsync, connectors, ...rest } = useConnect$1({
        onError(err) {
            if (err.message) {
                if (err.message !== "User rejected request") {
                    context.log(err.message, err);
                }
            }
            else {
                context.log(`Could not connect.`, err);
            }
        },
        ...props,
        /*
        onSuccess: (data) => {
          context.onConnect?.({
            address: data.account,
            //chainId: data.chain.id,
            connectorId: data.connector?.id,
          });
        },
        */
    });
    return {
        connect: ({ ...opts }) => {
            return connect({
                ...opts,
                ...connectProps,
            });
        },
        connectAsync: async ({ ...opts }) => {
            return await connectAsync({
                ...opts,
                ...connectProps,
            });
        },
        connectors,
        ...rest,
    };
}

const Shimmer = keyframes `
  0%{ transform: translate(-100%) rotate(-45deg); }
  100%{ transform: translate(100%) rotate(-80deg); }
`;
const InfoBox = styled.div `
  padding: 24px 24px 28px;
  border-radius: var(--ck-tertiary-border-radius, 24px);
  box-shadow: var(--ck-tertiary-box-shadow, none);
  background: var(--ck-body-background-tertiary);
  ${ModalBody} {
    max-width: none;
  }
`;
const InfoBoxButtons = styled.div `
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 5px -8px -12px;
  button {
  }
`;
styled(motion.div) `
  text-align: center;
  margin-bottom: -6px;
`;
styled(motion.button) `
  appearance: none;
  user-select: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 42px;
  padding: 0 16px;
  border-radius: 6px;
  background: none;
  color: var(--ck-body-color-muted);
  font-size: 15px;
  line-height: 18px;
  font-weight: 500;
  /* will-change: transform; */
  transition: color 200ms ease, transform 100ms ease;
  svg {
    transition: all 100ms ease-out;
    display: block;
    position: relative;
    top: 2px;
    left: 2px;
    transform: translateZ(0px);
    path,
    circle {
      transition: all 100ms ease-out;
    }
    path:last-of-type {
      transform-origin: 0 0;
      transform: scaleX(1.3) skewY(-12deg);
      opacity: 0;
    }
    circle {
      transform: translate(20%, -15%);
    }
  }
  &:hover {
    color: var(--ck-body-color-muted-hover);
    svg {
      path,
      circle {
        opacity: 1;
        transform: none;
      }
    }
  }
  &:active {
    transform: scale(0.96);
  }
`;
const ConnectorsContainer = styled(motion.div) `
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 0 16px;
`;
const ConnectorButton = styled(motion.button) `
  cursor: pointer;
  user-select: none;
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 20px;
  width: 100%;
  height: 64px;
  font-size: 17px;
  font-weight: var(--ck-primary-button-font-weight, 500);
  line-height: 20px;
  text-align: var(--ck-body-button-text-align, left);
  transition: 180ms ease;
  transition-property: background, color, box-shadow, transform;
  will-change: transform, box-shadow, background-color, color;

  --fallback-color: var(--ck-primary-button-color);
  --fallback-background: var(--ck-primary-button-background);
  --fallback-box-shadow: var(--ck-primary-button-box-shadow);
  --fallback-border-radius: var(--ck-primary-button-border-radius);

  --color: var(--ck-primary-button-color, var(--fallback-color));
  --background: var(--ck-primary-button-background, var(--fallback-background));
  --box-shadow: var(--ck-primary-button-box-shadow, var(--fallback-box-shadow));
  --border-radius: var(--ck-primary-button-border-radius, var(--fallback-border-radius));

  --hover-color: var(--ck-primary-button-hover-color, var(--color));
  --hover-background: var(--ck-primary-button-hover-background, var(--background));
  --hover-box-shadow: var(--ck-primary-button-hover-box-shadow, var(--box-shadow));
  --hover-border-radius: var(--ck-primary-button-hover-border-radius, var(--border-radius));

  --active-color: var(--ck-primary-button-active-color, var(--hover-color));
  --active-background: var(--ck-primary-button-active-background, var(--hover-background));
  --active-box-shadow: var(--ck-primary-button-active-box-shadow, var(--hover-box-shadow));
  --active-border-radius: var(
    --ck-primary-button-active-border-radius,
    var(--hover-border-radius)
  );

  color: var(--color);
  background: var(--background);
  box-shadow: var(--box-shadow);
  border-radius: var(--border-radius);

  &:disabled {
    transition: 180ms ease;
  }

  --bg: var(--background);
  &:not(:disabled) {
    &:hover {
      color: var(--hover-color);
      background: var(--hover-background);
      box-shadow: var(--hover-box-shadow);
      border-radius: var(--hover-border-radius);
      --bg: var(--hover-background, var(--background));
    }
    &:focus-visible {
      transition-duration: 100ms;
      color: var(--hover-color);
      background: var(--hover-background);
      box-shadow: var(--hover-box-shadow);
      border-radius: var(--hover-border-radius);
      --bg: var(--hover-background, var(--background));
    }
    &:active {
      color: var(--active-color);
      background: var(--active-background);
      box-shadow: var(--active-box-shadow);
      border-radius: var(--active-border-radius);
      --bg: var(--active-background, var(--background));
    }
  }
`;
styled(motion.span) `
  position: relative;
  top: var(--ck-recent-badge-top-offset, 0.5px);
  display: inline-block;
  padding: 10px 7px;
  line-height: 0;
  font-size: 13px;
  font-weight: 400;
  border-radius: var(--ck-recent-badge-border-radius, var(--border-radius));
  color: var(
    --ck-recent-badge-color,
    var(--ck-accent-color, var(--ck-body-color-muted, currentColor))
  );
  background: var(--ck-recent-badge-background, transparent);
  overflow: hidden;
  span {
    display: inline-block;
    position: relative;
  }
  &:before {
    z-index: 1;
    content: "";
    position: absolute;
    inset: 0;
    opacity: 0.4;
    box-shadow: var(--ck-recent-badge-box-shadow, inset 0 0 0 1px currentColor);
    border-radius: inherit;
  }
  &:after {
    z-index: 2;
    content: "";
    position: absolute;
    inset: -10%;
    top: -110%;
    aspect-ratio: 1/1;
    opacity: 0.7;
    background: linear-gradient(
      170deg,
      transparent 10%,
      var(--ck-recent-badge-background, var(--bg)) 50%,
      transparent 90%
    );
    animation: ${Shimmer} 2s linear infinite;
  }
`;
const ConnectorLabel = styled(motion.span) `
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 2px 0;
  padding-right: 38px;
`;
const ConnectorIcon = styled(motion.div) `
  position: absolute;
  right: 20px;
  width: 32px;
  height: 32px;
  overflow: hidden;
  svg {
    display: block;
    width: 100%;
    height: 100%;
  }
`;
const MobileConnectorsContainer = styled(motion.div) `
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  padding: 14px 0 28px;
  margin: 0 0;
`;
const MobileConnectorButton = styled(motion.button) `
  --background: var(--ck-body-background-secondary);
  cursor: pointer;
  user-select: none;
  position: relative;
  padding: 0;
  width: 100%;
  min-width: 25%;
  font-size: 13px;
  font-weight: 500;
  line-height: 13px;
  text-align: center;
  transition: transform 100ms ease;

  background: none;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }

  &:not(:disabled) {
    &:active {
      transform: scale(0.97);
    }
  }
`;
const MobileConnectorLabel = styled(motion.span) `
  display: block;
  padding: 10px 0 0;
  color: var(--ck-body-color);
  opacity: 0.75;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;
const MobileConnectorIcon = styled(motion.div) `
  margin: 0 auto;
  width: 60px;
  height: 60px;
  overflow: hidden;
  svg {
    border-radius: inherit;
    display: block;
    position: relative;
    transform: translate3d(0, 0, 0);
    width: 100%;
    height: 100%;
  }
`;

const Wallets = () => {
    const context = useContext();
    const mobile = isMobile();
    const { connectAsync, connectors } = useConnect();
    const openDefaultConnect = async (connector) => {
        try {
            await connectAsync({ connector: connector });
        }
        catch (err) {
            context.displayError("Async connect error. See console for more details.", err);
        }
    };
    return (jsx(PageContent, { style: { width: 312 }, children: mobile ? (jsxs(Fragment, { children: [jsx(MobileConnectorsContainer, { children: connectors.map((connector) => {
                        var _a, _b, _c, _d, _e;
                        const info = supportedConnectors$1.filter((c) => c.id === connector.id)[0];
                        if (!info)
                            return null;
                        const logos = info.logos;
                        const name = (_b = (_a = info.shortName) !== null && _a !== void 0 ? _a : info.name) !== null && _b !== void 0 ? _b : connector.name;
                        return (jsxs(MobileConnectorButton, { disabled: !connector.ready, onClick: () => {
                                context.setRoute(routes.CONNECT);
                                context.setConnector(connector.id);
                                openDefaultConnect(connector);
                            }, children: [jsx(MobileConnectorIcon, { children: (_e = (_d = (_c = logos.mobile) !== null && _c !== void 0 ? _c : logos.appIcon) !== null && _d !== void 0 ? _d : logos.connectorButton) !== null && _e !== void 0 ? _e : logos.default }), jsx(MobileConnectorLabel, { children: name })] }, `m-${connector.id}`));
                    }) }), jsxs(InfoBox, { children: [jsxs(ModalContent, { style: { padding: 0, textAlign: "left" }, children: [jsx(ModalH1, { "$small": true, children: "connectorsScreen_h1" }), jsx(ModalBody, { children: "connectorsScreen_p" })] }), jsx(InfoBoxButtons, { children: jsx(Button, { variant: "tertiary", onClick: () => context.setRoute(routes.ONBOARDING), children: "getWallet" }) })] })] })) : (jsx(Fragment, { children: jsx(ConnectorsContainer, { children: connectors.map((connector) => {
                    var _a, _b;
                    const info = supportedConnectors$1.filter((c) => c.id === connector.id)[0];
                    if (!info)
                        return null;
                    const logos = info.logos;
                    const name = (_a = info.name) !== null && _a !== void 0 ? _a : connector.name;
                    let logo = (_b = logos.connectorButton) !== null && _b !== void 0 ? _b : logos.default;
                    if (info.extensionIsInstalled && logos.appIcon) {
                        if (info.extensionIsInstalled()) {
                            logo = logos.appIcon;
                        }
                    }
                    return (jsxs(ConnectorButton, { disabled: context.route !== routes.CONNECTORS, onClick: () => {
                            context.setRoute(routes.CONNECT);
                            context.setConnector(connector.id);
                        }, children: [jsx(ConnectorIcon, { children: logo }), jsx(ConnectorLabel, { children: name })] }, connector.id));
                }) }) })) }));
};

const WalletItem = styled.div `
  text-align: center;
  transition: opacity 100ms ease;
  opacity: ${(props) => (props.$waiting ? 0.4 : 1)};
`;
const WalletIcon = styled.div `
  z-index: 9;
  position: relative;
  margin: 0 auto 10px;
  border-radius: 16px;
  width: 60px;
  height: 60px;
  overflow: hidden;
  ${(props) => props.$outline &&
    `
  &:before {
    content: '';
    z-index: 2;
    position: absolute;
    inset: 0;
    border-radius: inherit;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.04);
  }`}
  svg {
    display: block;
    position: relative;
    width: 100%;
    height: auto;
  }
`;
const WalletLabel = styled.div `
  color: var(--ck-body-color);
  font-size: 13px;
  line-height: 15px;
  font-weight: 500;
  opacity: 0.75;
`;
const PulseKeyframes = keyframes `
  0%,100% { opacity:1; }
  50% { opacity:0.5; }
`;
const WalletList = styled.div `
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 22px 8px;
  margin: 0 -10px -20px;
  padding: 4px 0 0;
  transition: opacity 300ms ease;
  ${(props) => props.$disabled &&
    css `
      pointer-events: none;
      opacity: 0.4;
      ${WalletItem} {
        animation: ${PulseKeyframes} 1s infinite ease-in-out;
      }
    `}
`;
const Container$4 = styled.div ``;

const flint = () => {
    return {
        id: 'flint-wsc',
        name: 'Flint WSC',
        logos: {
            default: jsx(Logos$1.Flint, {}),
            mobile: jsx(Logos$1.Flint, {}),
            transparent: jsx(Logos$1.Flint, { background: false }),
            connectorButton: jsx(Logos$1.Flint, {}),
            qrCode: jsx(Logos$1.Flint, { background: true }),
        },
        logoBackground: 'var(--ck-brand-walletConnect)',
        scannable: true,
        createUri: (uri) => uri,
    };
};

const etrnal = () => {
    return {
        id: 'etrnal-wsc',
        name: 'Etrnal',
        logos: {
            default: jsx(Logos$1.Eternl, {}),
            mobile: jsx(Logos$1.Eternl, {}),
            transparent: jsx(Logos$1.Eternl, { background: false }),
            connectorButton: jsx(Logos$1.Eternl, {}),
            qrCode: jsx(Logos$1.Eternl, { background: true }),
        },
        logoBackground: 'var(--ck-brand-walletConnect)',
        scannable: true,
        createUri: (uri) => uri,
    };
};

const getWallets = () => {
    return [flint(), etrnal()];
};

function useDefaultWallets() {
    useConnect$1();
    const defaultWallets = [];
    // define the order of the wallets
    defaultWallets.push("flint", "eternl");
    const wallets = getWallets();
    return wallets.filter((wallet) => defaultWallets.includes(wallet.id));
}

const IconContainer$2 = styled(motion.div) `
  transition: all 220ms cubic-bezier(0.175, 0.885, 0.32, 1.1);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  svg {
    display: block;
  }
  svg,
  svg path,
  svg rect {
    transition: inherit;
  }
  svg path:first-child {
    transform-origin: 50% 50%;
    fill: var(--bg);
    stroke: var(--color);
  }
  svg rect {
    transform-origin: 53% 63%;
    fill: var(--bg);
    stroke: var(--color);
  }
  svg path:last-child {
    opacity: 0;
    stroke: var(--bg);
    transform: translate(11.75px, 10px) rotate(90deg) scale(0.6);
  }
  ${(props) => props.$clipboard
    ? css `
          --color: var(--ck-focus-color) !important;
          --bg: var(--ck-body-background);
          svg {
            transition-delay: 0ms;
            path:first-child {
              opacity: 0;
              transform: rotate(-90deg) scale(0.2);
            }
            rect {
              rx: 10px;
              fill: var(--color);
              transform: rotate(-90deg) scale(1.45);
            }
            path:last-child {
              transition-delay: 100ms;
              opacity: 1;
              transform: translate(7.75px, 9.5px);
            }
          }
        `
    : css `
          &:hover {
          }
          &:hover:active {
          }
        `}
`;
const CopyToClipboardIcon = ({ copied, small, }) => (jsx(IconContainer$2, { "$clipboard": copied, children: jsx(CopyToClipboardIcon$1, { style: {
            transform: small ? 'scale(1)' : 'translateX(3px) scale(1.5)',
            opacity: small || copied ? 1 : 0.3,
        } }) }));

const Container$3 = styled.div `
  --color: var(--ck-copytoclipboard-stroke);
  --bg: var(--ck-body-background);
  transition: all 220ms cubic-bezier(0.175, 0.885, 0.32, 1.1);

  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  ${(props) => props.$disabled
    ? css `
          cursor: not-allowed;
          opacity: 0.4;
        `
    : css `
          &:hover {
            --color: var(--ck-body-color-muted);
          }
        `}
`;
const OffsetContainer = styled.div `
  display: block;
  position: relative;
  transition: inherit;
  svg {
    position: absolute;
    left: 100%;
    display: block;
    top: -1px;
    margin: 0;
    margin-left: 4px;
  }
`;
const CopyToClipboard = ({ string, children, variant }) => {
    const [clipboard, setClipboard] = useState(false);
    let timeout;
    const onCopy = () => {
        if (!string)
            return;
        const str = string.trim();
        if (navigator.clipboard) {
            navigator.clipboard.writeText(str);
        }
        setClipboard(true);
        clearTimeout(timeout);
        timeout = setTimeout(() => setClipboard(false), 1000);
    };
    if (variant === 'button')
        return (jsx(Button, { disabled: !string, onClick: onCopy, icon: jsx(CopyToClipboardIcon, { copied: clipboard }), children: children }));
    return (jsx(Container$3, { onClick: onCopy, "$disabled": !string, children: jsxs(OffsetContainer, { children: [children, jsx(CopyToClipboardIcon, { copied: clipboard, small: true })] }) }));
};

(jsx("svg", { width: "60", height: "60", viewBox: "0 0 60 60", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: jsx("path", { d: "M30 42V19M19 30.5H42", stroke: "var(--ck-body-color-muted)", strokeWidth: "3", strokeLinecap: "round" }) }));
const MobileConnectors = () => {
    const context = useContext();
    const wallets = useDefaultWallets().filter((wallet) => wallet.installed === undefined);
    const connectWallet = (wallet) => {
        if (wallet.installed) {
            context.setRoute(routes.CONNECT);
            context.setConnector(wallet.id);
        }
    };
    return (jsx(PageContent, { style: { width: 312 }, children: jsxs(Container$4, { children: [jsx(ModalContent, { children: jsx(WalletList, { children: wallets.map((wallet, i) => {
                            var _a;
                            const { name, shortName, logos, logoBackground } = wallet;
                            return (jsxs(WalletItem, { onClick: () => connectWallet(wallet), style: {
                                    animationDelay: `${i * 50}ms`,
                                }, children: [jsx(WalletIcon, { "$outline": true, style: logoBackground
                                            ? {
                                                background: logoBackground,
                                            }
                                            : undefined, children: (_a = logos.mobile) !== null && _a !== void 0 ? _a : logos.default }), jsx(WalletLabel, { children: shortName !== null && shortName !== void 0 ? shortName : name })] }, i));
                        }) }) }), jsx("div", { style: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 14,
                        paddingTop: 16,
                    }, children: jsx(CopyToClipboard, { variant: "button", string: "random", children: "Copy to clipboard" }) })] }) }));
};

const Content = styled(motion.div) `
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
  left: 0;
  right: 0;
  ${ModalContent} {
    padding: 0 8px 32px;
    gap: 12px;
  }
`;
const dist = 2;
const shakeKeyframes = keyframes `
  0%{ transform:none; }
  25%{ transform:translateX(${dist}px); }
  50%{ transform:translateX(-${dist}px); }
  75%{ transform:translateX(${dist}px); }
  100%{ transform:none; }
`;
const outlineKeyframes = keyframes `
  0%{ opacity:1; }
  100%{ opacity:0; }
`;
const Container$2 = styled(motion.div) `
  /*
  background: var(
    --ck-body-background
  ); // To stop the overlay issue during transition for the squircle spinner
  */
`;
const ConnectingContainer = styled(motion.div) `
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px auto 16px;
  height: 120px;
  //transform: scale(1.001); // fixes shifting issue between states
`;
const ConnectingAnimation = styled(motion.div) `
  user-select: none;
  position: relative;
  --spinner-error-opacity: 0;
  &:before {
    content: "";
    position: absolute;
    inset: -5px;
    opacity: 0;
    background: var(--ck-body-color-danger);
    ${(props) => props.$circle &&
    css `
        border-radius: 50%;
        background: none;
        box-shadow: inset 0 0 0 3.5px var(--ck-body-color-danger);
      `}
  }
  ${(props) => props.$shake &&
    css `
      animation: ${shakeKeyframes} 220ms ease-out both;
      &:before {
        animation: ${outlineKeyframes} 220ms ease-out 750ms both;
      }
    `}
`;
const RetryButton = styled(motion.button) `
  z-index: 5;
  appearance: none;
  position: absolute;
  right: 2px;
  bottom: 2px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  cursor: pointer;
  overflow: hidden;
  background: none;

  color: var(--ck-body-background);
  transition: color 200ms ease;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.15);

  &:before {
    z-index: 3;
    content: "";
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 200ms ease;
    background: var(--ck-body-color);
  }

  &:hover:before {
    opacity: 0.1;
  }
`;
const RetryIconContainer = styled(motion.div) `
  position: absolute;
  inset: 0;

  &:before {
    z-index: 1;
    content: "";
    position: absolute;
    inset: 3px;
    border-radius: 16px;
    background: conic-gradient(from 90deg, currentColor 10%, var(--ck-body-color) 80%);
  }

  svg {
    z-index: 2;
    display: block;
    position: relative;
    width: 100%;
    height: 100%;
  }
`;

const TooltipWindow = styled(motion.div) `
  z-index: 2147483647;
  position: fixed;
  inset: 0;
  pointer-events: none;
`;
const TooltipContainer = styled(motion.div) `
  --shadow: var(--ck-tooltip-shadow);
  z-index: 2147483647;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  gap: 8px;
  width: fit-content;
  align-items: center;
  justify-content: center;
  border-radius: var(
    --ck-tooltip-border-radius,
    ${(props) => (props.$size === "small" ? 11 : 14)}px
  );
  border-radius: ;
  padding: 10px 16px 10px 12px;
  font-size: 14px;
  line-height: 19px;
  font-weight: 500;
  letter-spacing: -0.1px;
  color: var(--ck-tooltip-color);
  background: var(--ck-tooltip-background);
  box-shadow: var(--shadow);
  > span {
    z-index: 3;
    position: relative;
  }
  > div {
    margin: -4px 0; // offset for icon
  }
  strong {
    color: var(--ck-spinner-color);
  }

  .ck-tt-logo {
    display: inline-block;
    vertical-align: text-bottom;
    height: 1em;
    width: 1.25em;
    svg {
      display: block;
      height: 100%;
      transform: translate(0.5px, -1px) scale(1.75);
    }
  }
`;
const TooltipTail = styled(motion.div) `
  z-index: 2;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${(props) => (props.$size === "small" ? 14 : 18)}px;
  right: 100%;
  top: 0;
  bottom: 0;
  overflow: hidden;
  &:before {
    content: "";
    position: absolute;
    box-shadow: var(--shadow);
    width: ${(props) => (props.$size === "small" ? 14 : 18)}px;
    height: ${(props) => (props.$size === "small" ? 14 : 18)}px;
    transform: translate(75%, 0) rotate(45deg);
    background: var(--ck-tooltip-background);
    border-radius: ${(props) => (props.$size === "small" ? 2 : 3)}px 0 0 0;
  }
`;

const Tooltip = ({ children, message, open, xOffset = 0, yOffset = 0, delay, }) => {
    const context = useContext();
    const [isOpen, setIsOpen] = useState(false);
    const [outOfBounds, setOutOfBounds] = useState(false);
    const [size, setSize] = useState("small");
    const [ready, setReady] = useState(false);
    const [currentRoute] = useState(context.route);
    const targetRef = useRef(null);
    const [ref, bounds] = useMeasure({
        debounce: !ready ? 220 : 0,
        offsetSize: true,
        scroll: true,
    });
    const checkBounds = () => {
        let flag = false;
        const x = xOffset + bounds.left + bounds.width;
        const y = yOffset + bounds.top + bounds.height * 0.5;
        if (x > window.innerWidth || x < 0 || y > window.innerHeight || y < 0) {
            flag = true;
        }
        return flag;
    };
    const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
    const refreshLayout = () => {
        if (!targetRef.current ||
            bounds.top + bounds.bottom + bounds.left + bounds.right + bounds.height + bounds.width === 0)
            return;
        const x = xOffset + bounds.left + bounds.width;
        const y = yOffset + bounds.top + bounds.height * 0.5;
        if (!ready && x !== 0 && y !== 0)
            setReady(true);
        targetRef.current.style.left = `${x}px`;
        targetRef.current.style.top = `${y}px`;
        setSize(targetRef.current.offsetHeight <= 40 ? "small" : "large");
        setOutOfBounds(checkBounds());
    };
    useIsomorphicLayoutEffect(refreshLayout, [bounds, open, isOpen]);
    useEffect(() => {
        if (!context.open)
            setIsOpen(false);
    }, [context.open]);
    useEffect(() => {
        setIsOpen(!!open);
    }, [open]);
    return (jsxs(Fragment, { children: [jsx(motion.div, { ref: ref, style: open === undefined
                    ? {
                        cursor: "help",
                    }
                    : {}, onHoverStart: () => setIsOpen(true), onHoverEnd: () => setIsOpen(false), onClick: () => setIsOpen(false), children: children }), jsx(Portal, { children: jsx(AnimatePresence, { children: currentRoute === context.route && !outOfBounds && isOpen && (jsx(ResetContainer, { children: jsx(TooltipWindow, { children: jsxs(TooltipContainer, { role: "tooltip", "$size": size, ref: targetRef, initial: "collapsed", animate: ready ? "open" : {}, exit: "collapsed", variants: {
                                    collapsed: {
                                        transformOrigin: "20px 50%",
                                        opacity: 0,
                                        scale: 0.9,
                                        z: 0.01,
                                        y: "-50%",
                                        x: 20,
                                        transition: {
                                            duration: 0.1,
                                        },
                                    },
                                    open: {
                                        willChange: "opacity,transform",
                                        opacity: 1,
                                        scale: 1,
                                        z: 0.01,
                                        y: "-50%",
                                        x: 20,
                                        transition: {
                                            ease: [0.76, 0, 0.24, 1],
                                            duration: 0.15,
                                            delay: delay ? delay : 0.5,
                                        },
                                    },
                                }, children: [message, jsx(TooltipTail, { "$size": size })] }) }) })) }) })] }));
};

const AlertContainer = styled(motion.div) `
  display: flex;
  gap: 8px;
  position: relative;
  border-radius: 9px;
  margin: 0 auto;
  padding: 10px;
  text-align: left;
  font-size: 14px;
  line-height: 17px;
  font-weight: 400;
  max-width: 260px;
  min-width: 100%;

  border-radius: var(--ck-alert-border-radius, 12px);
  color: var(--ck-alert-color, var(--ck-body-color-muted));
  background: var(--ck-alert-background, var(--ck-body-background-secondary));
  box-shadow: var(--ck-alert-box-shadow, var(--ck-body-box-shadow));

  @media only screen and (max-width: ${defaultTheme.mobileWidth}px) {
    padding: 16px;
    font-size: 16px;
    line-height: 21px;
    border-radius: 24px;
    text-align: center;
  }
`;
const IconContainer$1 = styled(motion.div) `
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  svg {
    display: block;
    width: 100%;
    height: auto;
  }
`;

const Alert = ({ children, icon }) => {
    return (jsxs(AlertContainer, { children: [icon && jsx(IconContainer$1, { children: icon }), jsx("div", { children: children })] }));
};
Alert.displayName = 'Alert';

const LogoContainer$1 = styled(motion.div) `
  z-index: 4;
  position: relative;
  width: 100px;
  height: 100px;
  svg {
    z-index: 3;
    position: relative;
    display: block;
  }
`;
const Logo = styled(motion.div) `
  z-index: 2;
  position: absolute;
  //overflow: hidden;
  inset: 6px;
  border-radius: 50px;
  background: var(--ck-body-background);
  display: flex;
  align-items: center;
  justify-content: center;
  svg,
  img {
    pointer-events: none;
    display: block;
    margin: 0 auto;
    width: 100%;
    height: 100%;
    ${(props) => props.$small &&
    css `
        width: 60%;
        height: 60%;
      `}
  }
`;
const SpinnerContainer = styled(motion.div) `
  position: absolute;
  inset: -5px;
`;
const ExpiringSpinner = styled(motion.div) `
  pointer-events: none;
  user-select: none;
  z-index: 1;
  position: absolute;
  inset: -25%;
  background: var(--ck-body-background);
  div:first-child {
    position: absolute;
    left: 50%;
    right: 0;
    top: 0;
    bottom: 0;
    overflow: hidden;
    &:before {
      position: absolute;
      content: "";
      inset: 0;
      background: var(--ck-spinner-color);
      transform-origin: 0% 50%;
      animation: rotateExpiringSpinner 5000ms ease-in both;
    }
  }
  div:last-child {
    position: absolute;
    left: 0;
    right: 50%;
    top: 0;
    bottom: 0;
    overflow: hidden;
    &:before {
      position: absolute;
      content: "";
      inset: 0;
      background: var(--ck-spinner-color);
      transform-origin: 100% 50%;
      animation: rotateExpiringSpinner 5000ms ease-out 5000ms both;
    }
  }
  @keyframes rotateExpiringSpinner {
    0% {
      transform: rotate(-180deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }
`;
const Spinner = styled(motion.div) `
  pointer-events: none;
  user-select: none;
  z-index: 1;
  position: absolute;
  inset: 0;
  svg {
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    animation: rotateSpinner 1200ms linear infinite;
  }
  @keyframes rotateSpinner {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const CircleSpinner = ({ logo, smallLogo, connecting = true, unavailable = false, countdown = false, }) => {
    return (jsxs(LogoContainer$1, { transition: { duration: 0.5, ease: [0.175, 0.885, 0.32, 0.98] }, children: [jsx(Logo, { "$small": !unavailable && smallLogo, style: unavailable ? { borderRadius: 0 } : undefined, children: logo }), jsx(SpinnerContainer, { children: jsxs(AnimatePresence, { children: [connecting && (jsx(Spinner, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: {
                                opacity: 0,
                                transition: {
                                    duration: countdown ? 1 : 0,
                                },
                            }, children: jsxs("svg", { "aria-hidden": "true", width: "102", height: "102", viewBox: "0 0 102 102", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [jsx("path", { d: "M52 100C24.3858 100 2 77.6142 2 50", stroke: "url(#paint0_linear_1943_4139)", strokeWidth: "3.5", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("defs", { children: jsxs("linearGradient", { id: "paint0_linear_1943_4139", x1: "2", y1: "48.5", x2: "53", y2: "100", gradientUnits: "userSpaceOnUse", children: [jsx("stop", { stopColor: "var(--ck-spinner-color)" }), jsx("stop", { offset: "1", stopColor: "var(--ck-spinner-color)", stopOpacity: "0" })] }) })] }) }, "Spinner")), countdown && (jsxs(ExpiringSpinner, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.25 }, children: [jsx("div", {}), jsx("div", {})] }, "ExpiringSpinner"))] }) })] }));
};

const BrowserIconContainer = styled(motion.div) `
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 32px;
  max-height: 32px;
  width: 100%;
  height: 100%;
  svg {
    display: block;
    width: 100%;
    height: 100%;
  }
`;

/**
 * TODO: Move hex colors into css variables for p3 support
 */
const Chrome = (jsxs("svg", { "aria-hidden": "true", width: 20, height: 20, viewBox: "0 0 20 20", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [jsx("g", { filter: "url(#filter0_ii_927_5781)", children: jsxs("g", { clipPath: "url(#clip0_927_5781)", children: [jsx("path", { d: "M1.58771 0V12.2727H6.06498L10.0002 5.45455H20.0002V0H1.58771Z", fill: "#DB4437" }), jsx("path", { d: "M1.58771 0V12.2727H6.06498L10.0002 5.45455H20.0002V0H1.58771Z", fill: "url(#paint0_linear_927_5781)" }), jsx("path", { d: "M6.17038 12.2272L1.64538 4.46582L1.57947 4.57946L6.07265 12.284L6.17038 12.2272Z", fill: "black", fillOpacity: "0.15" }), jsx("path", { d: "M0 20.0003H9.51932L13.9375 15.5821V12.273H6.0625L0 1.87305V20.0003Z", fill: "#0F9D58" }), jsx("path", { d: "M0 20.0003H9.51932L13.9375 15.5821V12.273H6.0625L0 1.87305V20.0003Z", fill: "url(#paint1_linear_927_5781)" }), jsx("path", { d: "M13.8412 12.4208L13.7469 12.3662L9.38324 19.9969H9.51392L13.8435 12.4242L13.8412 12.4208Z", fill: "#263238", fillOpacity: "0.15" }), jsx("path", { d: "M10.0006 5.45459L13.9381 12.2728L9.51996 20H20.0006V5.45459H10.0006Z", fill: "#FFCD40" }), jsx("path", { d: "M10.0006 5.45459L13.9381 12.2728L9.51996 20H20.0006V5.45459H10.0006Z", fill: "url(#paint2_linear_927_5781)" }), jsx("path", { d: "M9.9996 5.45459L13.9371 12.2728L9.51892 20H19.9996V5.45459H9.9996Z", fill: "#FFCD40" }), jsx("path", { d: "M9.9996 5.45459L13.9371 12.2728L9.51892 20H19.9996V5.45459H9.9996Z", fill: "url(#paint3_linear_927_5781)" }), jsx("path", { d: "M1.58691 0V12.2727H6.06419L9.99941 5.45455H19.9994V0H1.58691Z", fill: "#DB4437" }), jsx("path", { d: "M1.58691 0V12.2727H6.06419L9.99941 5.45455H19.9994V0H1.58691Z", fill: "url(#paint4_linear_927_5781)" }), jsx("path", { d: "M10 5.45459V7.83527L18.9091 5.45459H10Z", fill: "url(#paint5_radial_927_5781)" }), jsx("path", { d: "M0 19.9998H9.51932L11.9318 15.9089L13.9375 12.2726H6.0625L0 1.87256V19.9998Z", fill: "#0F9D58" }), jsx("path", { d: "M0 19.9998H9.51932L12.1023 15.5112L13.9375 12.2726H6.0625L0 1.87256V19.9998Z", fill: "url(#paint6_linear_927_5781)" }), jsx("path", { d: "M1.58771 4.59668L8.09339 11.1012L6.06384 12.2728L1.58771 4.59668Z", fill: "url(#paint7_radial_927_5781)" }), jsx("path", { d: "M9.52661 19.9884L11.9084 11.1021L13.938 12.2725L9.52661 19.9884Z", fill: "url(#paint8_radial_927_5781)" }), jsx("path", { d: "M10.0003 14.5455C12.5107 14.5455 14.5458 12.5104 14.5458 10C14.5458 7.48966 12.5107 5.45459 10.0003 5.45459C7.48996 5.45459 5.4549 7.48966 5.4549 10C5.4549 12.5104 7.48996 14.5455 10.0003 14.5455Z", fill: "#F1F1F1" }), jsx("path", { d: "M9.99995 13.6365C12.0083 13.6365 13.6363 12.0084 13.6363 10.0001C13.6363 7.99183 12.0083 6.36377 9.99995 6.36377C7.99164 6.36377 6.36359 7.99183 6.36359 10.0001C6.36359 12.0084 7.99164 13.6365 9.99995 13.6365Z", fill: "#4285F4" }), jsx("path", { d: "M10.0003 5.34082C7.48899 5.34082 5.4549 7.37491 5.4549 9.88628V9.99991C5.4549 7.48855 7.48899 5.45446 10.0003 5.45446H20.0003V5.34082H10.0003Z", fill: "black", fillOpacity: "0.2" }), jsx("path", { d: "M13.9318 12.273C13.1455 13.6299 11.6818 14.5458 10 14.5458C8.31818 14.5458 6.85227 13.6299 6.06818 12.273H6.06364L0 1.87305V1.98668L6.06818 12.3867C6.85455 13.7435 8.31818 14.6594 10 14.6594C11.6818 14.6594 13.1455 13.7446 13.9318 12.3867H13.9375V12.273H13.9307H13.9318Z", fill: "white", fillOpacity: "0.1" }), jsx("path", { opacity: "0.1", d: "M10.1133 5.45459C10.094 5.45459 10.0758 5.45686 10.0565 5.458C12.5406 5.48868 14.5452 7.50913 14.5452 10C14.5452 12.491 12.5406 14.5114 10.0565 14.5421C10.0758 14.5421 10.094 14.5455 10.1133 14.5455C12.6247 14.5455 14.6588 12.5114 14.6588 10C14.6588 7.48868 12.6247 5.45459 10.1133 5.45459Z", fill: "black" }), jsx("path", { d: "M13.9769 12.4204C14.3632 11.7522 14.5871 10.9795 14.5871 10.1522C14.5874 9.68602 14.5157 9.22262 14.3746 8.77832C14.4826 9.16696 14.5451 9.57377 14.5451 9.99764C14.5451 10.8249 14.3212 11.5976 13.9348 12.2658L13.9371 12.2704L9.51892 19.9976H9.65074L13.9769 12.4204Z", fill: "white", fillOpacity: "0.2" }), jsx("path", { d: "M10 0.113636C15.5034 0.113636 19.9682 4.56023 20 10.0568C20 10.0375 20.0011 10.0193 20.0011 10C20.0011 4.47727 15.5239 0 10.0011 0C4.47841 0 0 4.47727 0 10C0 10.0193 0.00113639 10.0375 0.00113639 10.0568C0.0318182 4.56023 4.49659 0.113636 10 0.113636Z", fill: "white", fillOpacity: "0.2" }), jsx("path", { d: "M10 19.8865C15.5034 19.8865 19.9682 15.4399 20 9.94336C20 9.96268 20.0011 9.98086 20.0011 10.0002C20.0011 15.5229 15.5239 20.0002 10.0011 20.0002C4.47841 20.0002 0 15.5229 0 10.0002C0 9.98086 0.00113639 9.96268 0.00113639 9.94336C0.0318182 15.4399 4.49659 19.8865 10.0011 19.8865H10Z", fill: "black", fillOpacity: "0.15" })] }) }), jsxs("defs", { children: [jsxs("filter", { id: "filter0_ii_927_5781", x: 0, y: "-0.235294", width: 20, height: "20.4706", filterUnits: "userSpaceOnUse", colorInterpolationFilters: "sRGB", children: [jsx("feFlood", { floodOpacity: 0, result: "BackgroundImageFix" }), jsx("feBlend", { mode: "normal", in: "SourceGraphic", in2: "BackgroundImageFix", result: "shape" }), jsx("feColorMatrix", { in: "SourceAlpha", type: "matrix", values: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0", result: "hardAlpha" }), jsx("feOffset", { dy: "0.235294" }), jsx("feGaussianBlur", { stdDeviation: "0.235294" }), jsx("feComposite", { in2: "hardAlpha", operator: "arithmetic", k2: -1, k3: 1 }), jsx("feColorMatrix", { type: "matrix", values: "0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0" }), jsx("feBlend", { mode: "normal", in2: "shape", result: "effect1_innerShadow_927_5781" }), jsx("feColorMatrix", { in: "SourceAlpha", type: "matrix", values: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0", result: "hardAlpha" }), jsx("feOffset", { dy: "-0.235294" }), jsx("feGaussianBlur", { stdDeviation: "0.235294" }), jsx("feComposite", { in2: "hardAlpha", operator: "arithmetic", k2: -1, k3: 1 }), jsx("feColorMatrix", { type: "matrix", values: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0" }), jsx("feBlend", { mode: "normal", in2: "effect1_innerShadow_927_5781", result: "effect2_innerShadow_927_5781" })] }), jsxs("linearGradient", { id: "paint0_linear_927_5781", x1: "2.42521", y1: "7.61591", x2: "8.39112", y2: "4.13068", gradientUnits: "userSpaceOnUse", children: [jsx("stop", { stopColor: "#A52714", stopOpacity: "0.6" }), jsx("stop", { offset: "0.66", stopColor: "#A52714", stopOpacity: 0 })] }), jsxs("linearGradient", { id: "paint1_linear_927_5781", x1: "11.6932", y1: "17.7844", x2: "5.06136", y2: "13.8981", gradientUnits: "userSpaceOnUse", children: [jsx("stop", { stopColor: "#055524", stopOpacity: "0.4" }), jsx("stop", { offset: "0.33", stopColor: "#055524", stopOpacity: 0 })] }), jsxs("linearGradient", { id: "paint2_linear_927_5781", x1: "12.9438", y1: "4.75004", x2: "14.6143", y2: "12.0569", gradientUnits: "userSpaceOnUse", children: [jsx("stop", { stopColor: "#EA6100", stopOpacity: "0.3" }), jsx("stop", { offset: "0.66", stopColor: "#EA6100", stopOpacity: 0 })] }), jsxs("linearGradient", { id: "paint3_linear_927_5781", x1: "12.9428", y1: "4.75004", x2: "14.6132", y2: "12.0569", gradientUnits: "userSpaceOnUse", children: [jsx("stop", { stopColor: "#EA6100", stopOpacity: "0.3" }), jsx("stop", { offset: "0.66", stopColor: "#EA6100", stopOpacity: 0 })] }), jsxs("linearGradient", { id: "paint4_linear_927_5781", x1: "2.42441", y1: "7.61591", x2: "8.39032", y2: "4.13068", gradientUnits: "userSpaceOnUse", children: [jsx("stop", { stopColor: "#A52714", stopOpacity: "0.6" }), jsx("stop", { offset: "0.66", stopColor: "#A52714", stopOpacity: 0 })] }), jsxs("radialGradient", { id: "paint5_radial_927_5781", cx: 0, cy: 0, r: 1, gradientUnits: "userSpaceOnUse", gradientTransform: "translate(9.56818 5.44891) scale(9.55455)", children: [jsx("stop", { stopColor: "#3E2723", stopOpacity: "0.2" }), jsx("stop", { offset: 1, stopColor: "#3E2723", stopOpacity: 0 })] }), jsxs("linearGradient", { id: "paint6_linear_927_5781", x1: "11.6932", y1: "17.7839", x2: "5.06136", y2: "13.8976", gradientUnits: "userSpaceOnUse", children: [jsx("stop", { stopColor: "#055524", stopOpacity: "0.4" }), jsx("stop", { offset: "0.33", stopColor: "#055524", stopOpacity: 0 })] }), jsxs("radialGradient", { id: "paint7_radial_927_5781", cx: 0, cy: 0, r: 1, gradientUnits: "userSpaceOnUse", gradientTransform: "translate(1.57975 4.60463) scale(8.86818)", children: [jsx("stop", { stopColor: "#3E2723", stopOpacity: "0.2" }), jsx("stop", { offset: 1, stopColor: "#3E2723", stopOpacity: 0 })] }), jsxs("radialGradient", { id: "paint8_radial_927_5781", cx: 0, cy: 0, r: 1, gradientUnits: "userSpaceOnUse", gradientTransform: "translate(9.97775 10.0157) scale(9.98523)", children: [jsx("stop", { stopColor: "#263238", stopOpacity: "0.2" }), jsx("stop", { offset: 1, stopColor: "#263238", stopOpacity: 0 })] }), jsx("clipPath", { id: "clip0_927_5781", children: jsx("rect", { width: 20, height: 20, rx: 10, fill: "white" }) })] })] }));
const FireFox = (jsxs("svg", { "aria-hidden": "true", width: 20, height: 20, viewBox: "0 0 20 20", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [jsxs("g", { clipPath: "url(#clip0_927_5847)", children: [jsx("path", { d: "M19.011 6.71023C18.5898 5.69685 17.7355 4.60269 17.0665 4.25681C17.5436 5.18063 17.8747 6.17276 18.0481 7.19792L18.0499 7.21417C16.954 4.48315 15.0963 3.38023 13.5782 0.981835C13.5014 0.860539 13.4246 0.738994 13.3498 0.610696C13.3071 0.537418 13.2728 0.471393 13.2431 0.410621C13.1801 0.288713 13.1316 0.159878 13.0985 0.0267267C13.0985 0.0205825 13.0963 0.0146369 13.0923 0.0100242C13.0882 0.00541151 13.0826 0.00245454 13.0765 0.00171737C13.0705 7.85858e-05 13.0642 7.85858e-05 13.0582 0.00171737C13.057 0.00171737 13.055 0.00396821 13.0535 0.0044684C13.052 0.00496859 13.0487 0.00721943 13.0465 0.00821981L13.0502 0.00171737C10.6156 1.42725 9.78901 4.06574 9.71399 5.38624C8.74136 5.45292 7.81141 5.81121 7.04549 6.41437C6.96561 6.34671 6.88212 6.28343 6.79539 6.2248C6.57456 5.45174 6.56514 4.6336 6.76813 3.85566C5.87401 4.28877 5.07954 4.90279 4.43501 5.65884H4.43051C4.04636 5.17191 4.07337 3.5663 4.09538 3.23093C3.98174 3.2766 3.87326 3.33419 3.77176 3.40274C3.43264 3.64477 3.11562 3.91635 2.8244 4.2143C2.49255 4.55075 2.18946 4.91441 1.91831 5.30146V5.30296V5.3012C1.29521 6.18444 0.853213 7.18234 0.617826 8.23731L0.604821 8.30133C0.586564 8.38661 0.52079 8.81377 0.509535 8.90656C0.509535 8.91381 0.508035 8.92056 0.507285 8.92781C0.42244 9.36882 0.369864 9.81542 0.349976 10.2641V10.3141C0.354259 12.7396 1.26772 15.0754 2.91002 16.8604C4.55233 18.6454 6.80415 19.7498 9.22094 19.9556C11.6377 20.1615 14.0439 19.4538 15.9644 17.9723C17.8849 16.4908 19.1803 14.3431 19.5947 11.9532C19.6109 11.8282 19.6242 11.7044 19.6387 11.5781C19.8384 9.92791 19.6222 8.25404 19.01 6.70873L19.011 6.71023ZM7.83928 14.2981C7.88455 14.3198 7.92707 14.3433 7.97358 14.3641L7.98034 14.3684C7.93332 14.3458 7.8863 14.3224 7.83928 14.2981ZM18.0501 7.21692V7.20767L18.0519 7.21792L18.0501 7.21692Z", fill: "url(#paint0_linear_927_5847)" }), jsx("path", { d: "M19.0109 6.71026C18.5898 5.69688 17.7354 4.60272 17.0664 4.25684C17.5435 5.18066 17.8746 6.17278 18.0481 7.19794V7.20719L18.0498 7.21745C18.797 9.35551 18.689 11.6997 17.7482 13.7599C16.6373 16.1435 13.9493 18.5867 9.7402 18.4667C5.19349 18.3379 1.18699 14.9629 0.439211 10.5437C0.30291 9.84668 0.439211 9.4933 0.507737 8.92684C0.414265 9.36685 0.362102 9.81463 0.351929 10.2643V10.3144C0.356212 12.7399 1.26967 15.0757 2.91198 16.8607C4.55429 18.6456 6.8061 19.7501 9.2229 19.9559C11.6397 20.1617 14.0458 19.4541 15.9664 17.9725C17.8869 16.491 19.1822 14.3434 19.5966 11.9535C19.6129 11.8284 19.6262 11.7046 19.6407 11.5783C19.8403 9.92819 19.6242 8.25431 19.0119 6.70901L19.0109 6.71026Z", fill: "url(#paint1_radial_927_5847)" }), jsx("path", { d: "M19.0109 6.71026C18.5898 5.69688 17.7354 4.60272 17.0664 4.25684C17.5435 5.18066 17.8746 6.17278 18.0481 7.19794V7.20719L18.0498 7.21745C18.797 9.35551 18.689 11.6997 17.7482 13.7599C16.6373 16.1435 13.9493 18.5867 9.7402 18.4667C5.19349 18.3379 1.18699 14.9629 0.439211 10.5437C0.30291 9.84668 0.439211 9.4933 0.507737 8.92684C0.414265 9.36685 0.362102 9.81463 0.351929 10.2643V10.3144C0.356212 12.7399 1.26967 15.0757 2.91198 16.8607C4.55429 18.6456 6.8061 19.7501 9.2229 19.9559C11.6397 20.1617 14.0458 19.4541 15.9664 17.9725C17.8869 16.491 19.1822 14.3434 19.5966 11.9535C19.6129 11.8284 19.6262 11.7046 19.6407 11.5783C19.8403 9.92819 19.6242 8.25431 19.0119 6.70901L19.0109 6.71026Z", fill: "url(#paint2_radial_927_5847)" }), jsx("path", { d: "M14.2993 7.84794C14.3203 7.8627 14.3398 7.87745 14.3595 7.89221C14.1161 7.46047 13.813 7.06519 13.4592 6.71802C10.4456 3.70439 12.6696 0.18557 13.0445 0.00550206L13.0483 0C10.6136 1.42553 9.78706 4.06402 9.71204 5.38452C9.82508 5.37677 9.93712 5.36726 10.0527 5.36726C10.9164 5.36893 11.7644 5.59929 12.5103 6.03492C13.2562 6.47055 13.8734 7.09592 14.2993 7.84744V7.84794Z", fill: "url(#paint3_radial_927_5847)" }), jsx("path", { d: "M10.0577 8.45061C10.0417 8.6917 9.18992 9.52326 8.89206 9.52326C6.13602 9.52326 5.68835 11.1906 5.68835 11.1906C5.8104 12.5947 6.78877 13.7516 7.97146 14.3618C8.02548 14.3898 8.08025 14.4151 8.13502 14.4399C8.22989 14.4819 8.32476 14.5207 8.41963 14.5564C8.82553 14.7 9.25065 14.7821 9.68085 14.7997C14.5127 15.0263 15.448 9.02257 11.9615 7.27942C12.7839 7.1724 13.6168 7.37463 14.2986 7.84688C13.8727 7.09536 13.2555 6.46999 12.5096 6.03436C11.7637 5.59873 10.9158 5.36837 10.052 5.3667C9.93695 5.3667 9.82441 5.3762 9.71136 5.38396C8.73874 5.45064 7.80879 5.80893 7.04286 6.41209C7.19067 6.53714 7.35748 6.7042 7.70886 7.05058C8.36661 7.69857 10.0535 8.36983 10.0572 8.44861L10.0577 8.45061Z", fill: "url(#paint4_radial_927_5847)" }), jsx("path", { d: "M10.0577 8.45061C10.0417 8.6917 9.18992 9.52326 8.89206 9.52326C6.13602 9.52326 5.68835 11.1906 5.68835 11.1906C5.8104 12.5947 6.78877 13.7516 7.97146 14.3618C8.02548 14.3898 8.08025 14.4151 8.13502 14.4399C8.22989 14.4819 8.32476 14.5207 8.41963 14.5564C8.82553 14.7 9.25065 14.7821 9.68085 14.7997C14.5127 15.0263 15.448 9.02257 11.9615 7.27942C12.7839 7.1724 13.6168 7.37463 14.2986 7.84688C13.8727 7.09536 13.2555 6.46999 12.5096 6.03436C11.7637 5.59873 10.9158 5.36837 10.052 5.3667C9.93695 5.3667 9.82441 5.3762 9.71136 5.38396C8.73874 5.45064 7.80879 5.80893 7.04286 6.41209C7.19067 6.53714 7.35748 6.7042 7.70886 7.05058C8.36661 7.69857 10.0535 8.36983 10.0572 8.44861L10.0577 8.45061Z", fill: "url(#paint5_radial_927_5847)" }), jsx("path", { d: "M6.59134 6.0923C6.66987 6.14231 6.73464 6.18583 6.79141 6.2251C6.57058 5.45204 6.56117 4.63389 6.76415 3.85596C5.87003 4.28907 5.07556 4.90308 4.43103 5.65913C4.4783 5.65788 5.88432 5.63262 6.59134 6.0923Z", fill: "url(#paint6_radial_927_5847)" }), jsx("path", { d: "M0.437567 10.5439C1.1856 14.963 5.19185 18.3393 9.73855 18.4668C13.9476 18.5859 16.6361 16.1425 17.7466 13.7601C18.6873 11.6998 18.7954 9.35569 18.0482 7.21762V7.20837C18.0482 7.20111 18.0467 7.19686 18.0482 7.19911L18.0499 7.21537C18.3938 9.46046 17.2519 11.6345 15.4665 13.1076L15.4609 13.1201C11.9821 15.9536 8.6534 14.8292 7.98064 14.3706C7.93363 14.348 7.88661 14.3246 7.83959 14.3003C5.81158 13.3309 4.97352 11.4842 5.15358 9.89862C4.67218 9.90573 4.19905 9.77307 3.79151 9.51672C3.38397 9.26038 3.05952 8.89134 2.85747 8.45433C3.38987 8.1282 3.99692 7.94382 4.62077 7.91878C5.24461 7.89374 5.86448 8.02887 6.42131 8.31128C7.56906 8.83225 8.87507 8.8836 10.0602 8.45433C10.0564 8.37555 8.36954 7.70405 7.71179 7.05631C7.36041 6.70993 7.1936 6.54312 7.04579 6.41782C6.96591 6.35016 6.88243 6.28688 6.7957 6.22825C6.73818 6.18898 6.6734 6.14647 6.59562 6.09545C5.88861 5.63578 4.48258 5.66104 4.43607 5.66229H4.43156C4.04742 5.17535 4.07443 3.56975 4.09644 3.23438C3.9828 3.28005 3.87431 3.33764 3.77282 3.40619C3.4337 3.64822 3.11667 3.91979 2.82546 4.21774C2.49242 4.55325 2.18808 4.91607 1.91562 5.3024V5.3039V5.30215C1.29252 6.18539 0.850521 7.18329 0.615133 8.23825C0.610381 8.25801 0.266002 9.76357 0.435816 10.5444L0.437567 10.5439Z", fill: "url(#paint7_radial_927_5847)" }), jsx("path", { d: "M13.459 6.71761C13.8128 7.06516 14.1159 7.46087 14.3593 7.89305C14.4126 7.93331 14.4624 7.97333 14.5046 8.01209C16.7022 10.0378 15.5508 12.9014 15.465 13.104C17.2502 11.6332 18.3911 9.45763 18.0485 7.21179C16.952 4.47826 15.0923 3.37535 13.5768 0.976952C13.5 0.855657 13.4232 0.734111 13.3484 0.605813C13.3057 0.532535 13.2714 0.466511 13.2417 0.405738C13.1787 0.283831 13.1302 0.154995 13.0971 0.0218439C13.0971 0.0156997 13.0949 0.0097541 13.0909 0.0051414C13.0868 0.000528701 13.0812 -0.00242828 13.0751 -0.00316545C13.0691 -0.00480423 13.0628 -0.00480423 13.0568 -0.00316545C13.0556 -0.00316545 13.0536 -0.000914601 13.0521 -0.000414413C13.0506 8.57743e-05 13.0473 0.00233662 13.0451 0.00333699C12.6702 0.181154 10.4466 3.70222 13.4602 6.71335L13.459 6.71761Z", fill: "url(#paint8_radial_927_5847)" }), jsx("path", { d: "M14.5043 8.01315C14.462 7.97439 14.4122 7.93437 14.359 7.8941C14.3392 7.87935 14.3197 7.86459 14.2987 7.84984C13.6169 7.37759 12.784 7.17536 11.9616 7.28238C15.4479 9.02553 14.5125 15.0278 9.68095 14.8027C9.25075 14.785 8.82562 14.703 8.41973 14.5594C8.32486 14.5238 8.22999 14.485 8.13512 14.4428C8.08035 14.4178 8.02558 14.3928 7.97156 14.3648L7.97831 14.369C8.65206 14.829 11.9798 15.9526 15.4586 13.1186L15.4641 13.1061C15.5509 12.9035 16.7023 10.0399 14.5038 8.01415L14.5043 8.01315Z", fill: "url(#paint9_radial_927_5847)" }), jsx("path", { d: "M5.68842 11.1892C5.68842 11.1892 6.13583 9.52179 8.89212 9.52179C9.18998 9.52179 10.0425 8.69023 10.0578 8.44914C8.8727 8.8784 7.56669 8.82706 6.41894 8.30608C5.86211 8.02367 5.24224 7.88855 4.61839 7.91359C3.99455 7.93863 3.3875 8.123 2.8551 8.44914C3.05715 8.88615 3.3816 9.25518 3.78914 9.51153C4.19668 9.76787 4.66981 9.90053 5.15121 9.89343C4.97165 11.4783 5.80946 13.3247 7.83722 14.2951C7.88249 14.3168 7.925 14.3403 7.97152 14.3611C6.78783 13.7496 5.81046 12.5932 5.68842 11.1899V11.1892Z", fill: "url(#paint10_radial_927_5847)" }), jsx("path", { d: "M19.0112 6.71023C18.59 5.69685 17.7357 4.60269 17.0667 4.25681C17.5438 5.18063 17.8749 6.17276 18.0483 7.19792L18.0501 7.21417C16.9542 4.48315 15.0965 3.38023 13.5784 0.981835C13.5016 0.860539 13.4249 0.738994 13.3501 0.610696C13.3073 0.537418 13.2731 0.471393 13.2433 0.410621C13.1803 0.288713 13.1318 0.159878 13.0987 0.0267267C13.0988 0.0205825 13.0966 0.0146369 13.0925 0.0100242C13.0884 0.00541151 13.0828 0.00245454 13.0767 0.00171737C13.0708 7.85859e-05 13.0644 7.85859e-05 13.0585 0.00171737C13.0572 0.00171737 13.0552 0.00396821 13.0537 0.0044684C13.0522 0.00496859 13.049 0.00721943 13.0467 0.00821981L13.0505 0.00171737C10.6158 1.42725 9.78925 4.06574 9.71422 5.38624C9.82726 5.37848 9.9393 5.36898 10.0548 5.36898C10.9186 5.37065 11.7666 5.60101 12.5125 6.03664C13.2584 6.47227 13.8756 7.09764 14.3014 7.84916C13.6196 7.37691 12.7868 7.17468 11.9643 7.2817C15.4506 9.02485 14.5153 15.0271 9.68371 14.802C9.25351 14.7843 8.82838 14.7023 8.42248 14.5587C8.32761 14.5232 8.23275 14.4843 8.13788 14.4421C8.08311 14.4171 8.02834 14.3921 7.97432 14.3641L7.98107 14.3684C7.93405 14.3458 7.88703 14.3224 7.84002 14.2981C7.88528 14.3198 7.9278 14.3433 7.97432 14.3641C6.79062 13.7524 5.81326 12.5959 5.69121 11.1929C5.69121 11.1929 6.13863 9.52554 8.89491 9.52554C9.19277 9.52554 10.0453 8.69398 10.0606 8.45289C10.0568 8.37411 8.36996 7.7026 7.71222 7.05486C7.36084 6.70848 7.19402 6.54167 7.04622 6.41637C6.96634 6.34871 6.88285 6.28543 6.79612 6.2268C6.57529 5.45374 6.56588 4.6356 6.76886 3.85766C5.87474 4.29077 5.08027 4.90479 4.43574 5.66084H4.43124C4.04709 5.17391 4.0741 3.5683 4.09611 3.23293C3.98247 3.2786 3.87399 3.33619 3.77249 3.40474C3.43337 3.64677 3.11635 3.91835 2.82514 4.2163C2.49328 4.55275 2.19019 4.91641 1.91905 5.30345V5.30496V5.30321C1.29595 6.18644 0.853946 7.18434 0.618558 8.23931L0.605554 8.30333C0.587297 8.38861 0.505516 8.82177 0.493762 8.91481C0.418959 9.36194 0.371188 9.81318 0.350708 10.2661V10.3161C0.354992 12.7416 1.26845 15.0774 2.91076 16.8624C4.55307 18.6474 6.80488 19.7518 9.22168 19.9576C11.6385 20.1635 14.0446 19.4558 15.9652 17.9743C17.8857 16.4928 19.181 14.3451 19.5954 11.9552C19.6117 11.8302 19.6249 11.7064 19.6394 11.5801C19.8391 9.92991 19.623 8.25604 19.0107 6.71073L19.0112 6.71023ZM18.0496 7.20817L18.0513 7.21842L18.0496 7.20817Z", fill: "url(#paint11_linear_927_5847)" })] }), jsxs("defs", { children: [jsxs("linearGradient", { id: "paint0_linear_927_5847", x1: "17.728", y1: "3.09786", x2: "1.63621", y2: "18.6237", gradientUnits: "userSpaceOnUse", children: [jsx("stop", { offset: "0.048", stopColor: "#FFF44F" }), jsx("stop", { offset: "0.111", stopColor: "#FFE847" }), jsx("stop", { offset: "0.225", stopColor: "#FFC830" }), jsx("stop", { offset: "0.368", stopColor: "#FF980E" }), jsx("stop", { offset: "0.401", stopColor: "#FF8B16" }), jsx("stop", { offset: "0.462", stopColor: "#FF672A" }), jsx("stop", { offset: "0.534", stopColor: "#FF3647" }), jsx("stop", { offset: "0.705", stopColor: "#E31587" })] }), jsxs("radialGradient", { id: "paint1_radial_927_5847", cx: 0, cy: 0, r: 1, gradientUnits: "userSpaceOnUse", gradientTransform: "translate(17.1052 2.25108) scale(20.2076)", children: [jsx("stop", { offset: "0.129", stopColor: "#FFBD4F" }), jsx("stop", { offset: "0.186", stopColor: "#FFAC31" }), jsx("stop", { offset: "0.247", stopColor: "#FF9D17" }), jsx("stop", { offset: "0.283", stopColor: "#FF980E" }), jsx("stop", { offset: "0.403", stopColor: "#FF563B" }), jsx("stop", { offset: "0.467", stopColor: "#FF3750" }), jsx("stop", { offset: "0.71", stopColor: "#F5156C" }), jsx("stop", { offset: "0.782", stopColor: "#EB0878" }), jsx("stop", { offset: "0.86", stopColor: "#E50080" })] }), jsxs("radialGradient", { id: "paint2_radial_927_5847", cx: 0, cy: 0, r: 1, gradientUnits: "userSpaceOnUse", gradientTransform: "translate(9.6024 10.5042) scale(20.2076)", children: [jsx("stop", { offset: "0.3", stopColor: "#960E18" }), jsx("stop", { offset: "0.351", stopColor: "#B11927", stopOpacity: "0.74" }), jsx("stop", { offset: "0.435", stopColor: "#DB293D", stopOpacity: "0.343" }), jsx("stop", { offset: "0.497", stopColor: "#F5334B", stopOpacity: "0.094" }), jsx("stop", { offset: "0.53", stopColor: "#FF3750", stopOpacity: 0 })] }), jsxs("radialGradient", { id: "paint3_radial_927_5847", cx: 0, cy: 0, r: 1, gradientUnits: "userSpaceOnUse", gradientTransform: "translate(12.1034 -2.25084) scale(14.638)", children: [jsx("stop", { offset: "0.132", stopColor: "#FFF44F" }), jsx("stop", { offset: "0.252", stopColor: "#FFDC3E" }), jsx("stop", { offset: "0.506", stopColor: "#FF9D12" }), jsx("stop", { offset: "0.526", stopColor: "#FF980E" })] }), jsxs("radialGradient", { id: "paint4_radial_927_5847", cx: 0, cy: 0, r: 1, gradientUnits: "userSpaceOnUse", gradientTransform: "translate(7.35173 15.7558) scale(9.62111)", children: [jsx("stop", { offset: "0.353", stopColor: "#3A8EE6" }), jsx("stop", { offset: "0.472", stopColor: "#5C79F0" }), jsx("stop", { offset: "0.669", stopColor: "#9059FF" }), jsx("stop", { offset: 1, stopColor: "#C139E6" })] }), jsxs("radialGradient", { id: "paint5_radial_927_5847", cx: 0, cy: 0, r: 1, gradientUnits: "userSpaceOnUse", gradientTransform: "translate(10.5799 8.76923) rotate(-13.5916) scale(5.10194 5.97309)", children: [jsx("stop", { offset: "0.206", stopColor: "#9059FF", stopOpacity: 0 }), jsx("stop", { offset: "0.278", stopColor: "#8C4FF3", stopOpacity: "0.064" }), jsx("stop", { offset: "0.747", stopColor: "#7716A8", stopOpacity: "0.45" }), jsx("stop", { offset: "0.975", stopColor: "#6E008B", stopOpacity: "0.6" })] }), jsxs("radialGradient", { id: "paint6_radial_927_5847", cx: 0, cy: 0, r: 1, gradientUnits: "userSpaceOnUse", gradientTransform: "translate(9.35238 1.50057) scale(6.9226)", children: [jsx("stop", { stopColor: "#FFE226" }), jsx("stop", { offset: "0.121", stopColor: "#FFDB27" }), jsx("stop", { offset: "0.295", stopColor: "#FFC82A" }), jsx("stop", { offset: "0.502", stopColor: "#FFA930" }), jsx("stop", { offset: "0.732", stopColor: "#FF7E37" }), jsx("stop", { offset: "0.792", stopColor: "#FF7139" })] }), jsxs("radialGradient", { id: "paint7_radial_927_5847", cx: 0, cy: 0, r: 1, gradientUnits: "userSpaceOnUse", gradientTransform: "translate(14.8545 -3.00121) scale(29.5361)", children: [jsx("stop", { offset: "0.113", stopColor: "#FFF44F" }), jsx("stop", { offset: "0.456", stopColor: "#FF980E" }), jsx("stop", { offset: "0.622", stopColor: "#FF5634" }), jsx("stop", { offset: "0.716", stopColor: "#FF3647" }), jsx("stop", { offset: "0.904", stopColor: "#E31587" })] }), jsxs("radialGradient", { id: "paint8_radial_927_5847", cx: 0, cy: 0, r: 1, gradientUnits: "userSpaceOnUse", gradientTransform: "translate(12.3996 -1.36343) rotate(83.976) scale(21.6445 14.2051)", children: [jsx("stop", { stopColor: "#FFF44F" }), jsx("stop", { offset: "0.06", stopColor: "#FFE847" }), jsx("stop", { offset: "0.168", stopColor: "#FFC830" }), jsx("stop", { offset: "0.304", stopColor: "#FF980E" }), jsx("stop", { offset: "0.356", stopColor: "#FF8B16" }), jsx("stop", { offset: "0.455", stopColor: "#FF672A" }), jsx("stop", { offset: "0.57", stopColor: "#FF3647" }), jsx("stop", { offset: "0.737", stopColor: "#E31587" })] }), jsxs("radialGradient", { id: "paint9_radial_927_5847", cx: 0, cy: 0, r: 1, gradientUnits: "userSpaceOnUse", gradientTransform: "translate(9.35233 4.00165) scale(18.4369)", children: [jsx("stop", { offset: "0.137", stopColor: "#FFF44F" }), jsx("stop", { offset: "0.48", stopColor: "#FF980E" }), jsx("stop", { offset: "0.592", stopColor: "#FF5634" }), jsx("stop", { offset: "0.655", stopColor: "#FF3647" }), jsx("stop", { offset: "0.904", stopColor: "#E31587" })] }), jsxs("radialGradient", { id: "paint10_radial_927_5847", cx: 0, cy: 0, r: 1, gradientUnits: "userSpaceOnUse", gradientTransform: "translate(14.1041 5.00184) scale(20.1801)", children: [jsx("stop", { offset: "0.094", stopColor: "#FFF44F" }), jsx("stop", { offset: "0.231", stopColor: "#FFE141" }), jsx("stop", { offset: "0.509", stopColor: "#FFAF1E" }), jsx("stop", { offset: "0.626", stopColor: "#FF980E" })] }), jsxs("linearGradient", { id: "paint11_linear_927_5847", x1: "17.5331", y1: "3.01533", x2: "3.84302", y2: "16.708", gradientUnits: "userSpaceOnUse", children: [jsx("stop", { offset: "0.167", stopColor: "#FFF44F", stopOpacity: "0.8" }), jsx("stop", { offset: "0.266", stopColor: "#FFF44F", stopOpacity: "0.634" }), jsx("stop", { offset: "0.489", stopColor: "#FFF44F", stopOpacity: "0.217" }), jsx("stop", { offset: "0.6", stopColor: "#FFF44F", stopOpacity: 0 })] }), jsx("clipPath", { id: "clip0_927_5847", children: jsx("rect", { width: 20, height: 20, fill: "white" }) })] })] }));
const Brave = (jsxs("svg", { "aria-hidden": "true", width: 20, height: 20, viewBox: "0 0 20 20", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [jsx("path", { d: "M17.2924 5.22043L17.7256 4.15905L16.4982 2.8883C15.8339 2.22404 14.4187 2.61393 14.4187 2.61393L12.8158 0.794434H7.16242L5.55231 2.62115C5.55231 2.62115 4.13715 2.23848 3.47289 2.8883L2.24545 4.15183L2.67866 5.21321L2.13715 6.78721L3.9422 13.6681C4.31765 15.141 4.57036 15.7114 5.63173 16.4623L8.93137 18.7006C9.24906 18.8955 9.63895 19.2349 9.99274 19.2349C10.3465 19.2349 10.7364 18.8955 11.0541 18.7006L14.3538 16.4623C15.4151 15.7114 15.6678 15.141 16.0433 13.6681L17.8483 6.78721L17.2924 5.22043Z", fill: "url(#paint0_linear_927_5861)" }), jsx("path", { d: "M13.9711 3.78343C13.9711 3.78343 16.0433 6.28884 16.0433 6.81592C16.0433 7.35744 15.7834 7.49462 15.5234 7.77621L13.9711 9.43686C13.8267 9.58126 13.5162 9.82675 13.6967 10.2527C13.8772 10.686 14.1299 11.2203 13.8411 11.769C13.5523 12.3249 13.0469 12.6932 12.722 12.6354C12.2387 12.4786 11.7777 12.2602 11.3502 11.9856C11.0758 11.8051 10.1949 11.0758 10.1949 10.7943C10.1949 10.5127 11.1047 10 11.278 9.89895C11.444 9.78343 12.2166 9.33577 12.231 9.16249C12.2455 8.9892 12.2455 8.94588 12.0144 8.51267C11.7834 8.07946 11.379 7.50184 11.4368 7.12639C11.509 6.75094 12.1588 6.54877 12.6426 6.36827L14.1372 5.80509C14.2527 5.74733 14.2238 5.69679 13.8772 5.66068C13.5307 5.6318 12.5559 5.50184 12.1155 5.62458C11.6751 5.74733 10.9386 5.93505 10.8664 6.03614C10.8086 6.13722 10.7509 6.13722 10.8159 6.48379L11.2346 8.75816C11.2635 9.04697 11.3213 9.24191 11.018 9.31411C10.7003 9.38632 10.1733 9.50906 9.99276 9.50906C9.81225 9.50906 9.27796 9.38632 8.96749 9.31411C8.65702 9.24191 8.71478 9.04697 8.75088 8.75816C8.77976 8.46935 9.09745 6.82314 9.16243 6.48379C9.23464 6.13722 9.16965 6.13722 9.11189 6.03614C9.03969 5.93505 8.29601 5.74733 7.85558 5.62458C7.42236 5.50184 6.44041 5.6318 6.09384 5.66791C5.74727 5.69679 5.71839 5.74011 5.83391 5.81231L7.3285 6.36827C7.80503 6.54877 8.46929 6.75094 8.53428 7.12639C8.60648 7.50906 8.19493 8.07946 7.95666 8.51267C7.71839 8.94588 7.72561 8.9892 7.74005 9.16249C7.75449 9.33577 8.53428 9.78343 8.69312 9.89895C8.86641 10.0073 9.77615 10.5127 9.77615 10.7943C9.77615 11.0758 8.91695 11.8051 8.62814 11.9856C8.20063 12.2602 7.73957 12.4786 7.2563 12.6354C6.93139 12.6932 6.42597 12.3249 6.12994 11.769C5.84113 11.2203 6.10106 10.686 6.27435 10.2527C6.45485 9.81953 6.1516 9.58848 5.99998 9.43686L4.44763 7.77621C4.19493 7.50906 3.935 7.36466 3.935 6.83036C3.935 6.29606 6.0072 3.79787 6.0072 3.79787L7.97832 4.11556C8.20937 4.11556 8.722 3.92061 9.19132 3.75455C9.66063 3.61014 9.98554 3.5957 9.98554 3.5957C9.98554 3.5957 10.3032 3.5957 10.7798 3.75455C11.2563 3.91339 11.7617 4.11556 11.9928 4.11556C12.231 4.11556 13.9783 3.77621 13.9783 3.77621L13.9711 3.78343ZM12.4188 13.3719C12.5487 13.4441 12.4693 13.6029 12.3465 13.6896L10.5126 15.1192C10.3682 15.2636 10.1372 15.4802 9.98554 15.4802C9.83391 15.4802 9.61009 15.2636 9.45846 15.1192C8.8506 14.6351 8.23683 14.1586 7.61731 13.6896C7.50178 13.6029 7.42236 13.4513 7.54511 13.3719L8.62814 12.7943C9.05864 12.5665 9.51417 12.3897 9.98554 12.2672C10.0938 12.2672 10.7798 12.5127 11.3357 12.7943L12.4188 13.3719Z", fill: "white" }), jsx("path", { d: "M14.4332 2.62115L12.8159 0.794434H7.16243L5.55232 2.62115C5.55232 2.62115 4.13716 2.23848 3.4729 2.8883C3.4729 2.8883 5.35016 2.72223 5.99998 3.77638L7.99276 4.11573C8.2238 4.11573 8.73644 3.92079 9.20575 3.75472C9.67507 3.61032 9.99998 3.59588 9.99998 3.59588C9.99998 3.59588 10.3177 3.59588 10.7942 3.75472C11.2707 3.91357 11.7761 4.11573 12.0072 4.11573C12.2455 4.11573 13.9928 3.77638 13.9928 3.77638C14.6426 2.72223 16.5198 2.8883 16.5198 2.8883C15.8556 2.22404 14.4404 2.61393 14.4404 2.61393", fill: "url(#paint1_linear_927_5861)" }), jsxs("defs", { children: [jsxs("linearGradient", { id: "paint0_linear_927_5861", x1: "2.13715", y1: "10.1991", x2: "17.8483", y2: "10.1991", gradientUnits: "userSpaceOnUse", children: [jsx("stop", { offset: "0.4", stopColor: "#FF5500" }), jsx("stop", { offset: "0.6", stopColor: "#FF2000" })] }), jsxs("linearGradient", { id: "paint1_linear_927_5861", x1: "3.73384", y1: "2.4883", x2: "16.5198", y2: "2.4883", gradientUnits: "userSpaceOnUse", children: [jsx("stop", { stopColor: "#FF452A" }), jsx("stop", { offset: 1, stopColor: "#FF2000" })] })] })] }));
const Edge = (jsxs("svg", { "aria-hidden": "true", width: 20, height: 20, viewBox: "0 0 20 20", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [jsxs("g", { clipPath: "url(#clip0_927_5865)", children: [jsx("path", { d: "M18.0547 14.8828C17.7865 15.0222 17.5099 15.1448 17.2266 15.25C16.3293 15.584 15.3792 15.7533 14.4219 15.75C10.7266 15.75 7.50781 13.2109 7.50781 9.94531C7.51262 9.50803 7.63385 9.07993 7.85905 8.70506C8.08424 8.33019 8.40526 8.0221 8.78906 7.8125C5.44531 7.95312 4.58594 11.4375 4.58594 13.4766C4.58594 19.2578 9.90625 19.8359 11.0547 19.8359C11.6719 19.8359 12.6016 19.6562 13.1641 19.4766L13.2656 19.4453C15.4183 18.7014 17.2534 17.2465 18.4688 15.3203C18.5041 15.2618 18.5192 15.1933 18.5119 15.1253C18.5046 15.0574 18.4752 14.9937 18.4282 14.944C18.3812 14.8944 18.3192 14.8615 18.2518 14.8505C18.1843 14.8394 18.1151 14.8508 18.0547 14.8828Z", fill: "url(#paint0_linear_927_5865)" }), jsx("path", { opacity: "0.35", d: "M18.0547 14.8828C17.7865 15.0222 17.5099 15.1448 17.2266 15.25C16.3293 15.584 15.3792 15.7533 14.4219 15.75C10.7266 15.75 7.50781 13.2109 7.50781 9.94531C7.51262 9.50803 7.63385 9.07993 7.85905 8.70506C8.08424 8.33019 8.40526 8.0221 8.78906 7.8125C5.44531 7.95312 4.58594 11.4375 4.58594 13.4766C4.58594 19.2578 9.90625 19.8359 11.0547 19.8359C11.6719 19.8359 12.6016 19.6562 13.1641 19.4766L13.2656 19.4453C15.4183 18.7014 17.2534 17.2465 18.4688 15.3203C18.5041 15.2618 18.5192 15.1933 18.5119 15.1253C18.5046 15.0574 18.4752 14.9937 18.4282 14.944C18.3812 14.8944 18.3192 14.8615 18.2518 14.8505C18.1843 14.8394 18.1151 14.8508 18.0547 14.8828Z", fill: "url(#paint1_radial_927_5865)" }), jsx("path", { d: "M8.2578 18.8516C7.56239 18.4196 6.95961 17.854 6.48436 17.1875C5.94166 16.4447 5.56809 15.5921 5.38987 14.6896C5.21165 13.787 5.23311 12.8565 5.45272 11.9631C5.67234 11.0697 6.08479 10.2353 6.66115 9.51826C7.23751 8.80123 7.96379 8.21903 8.78905 7.8125C9.03905 7.69531 9.45311 7.49219 10.0078 7.5C10.3981 7.50302 10.7824 7.59627 11.1308 7.77245C11.4791 7.94864 11.7819 8.20299 12.0156 8.51562C12.3299 8.93835 12.5023 9.4498 12.5078 9.97656C12.5078 9.96094 14.4219 3.75781 6.2578 3.75781C2.82811 3.75781 0.00780015 7.00781 0.00780015 9.86719C-0.00584162 11.3776 0.317079 12.8721 0.953112 14.2422C1.99473 16.4602 3.81447 18.2185 6.06689 19.1834C8.3193 20.1483 10.8476 20.2526 13.1719 19.4766C12.3576 19.7337 11.4972 19.811 10.6501 19.7031C9.80297 19.5952 8.98941 19.3047 8.26561 18.8516H8.2578Z", fill: "url(#paint2_linear_927_5865)" }), jsx("path", { opacity: "0.41", d: "M8.2578 18.8516C7.56239 18.4196 6.95961 17.854 6.48436 17.1875C5.94166 16.4447 5.56809 15.5921 5.38987 14.6896C5.21165 13.787 5.23311 12.8565 5.45272 11.9631C5.67234 11.0697 6.08479 10.2353 6.66115 9.51826C7.23751 8.80123 7.96379 8.21903 8.78905 7.8125C9.03905 7.69531 9.45311 7.49219 10.0078 7.5C10.3981 7.50302 10.7824 7.59627 11.1308 7.77245C11.4791 7.94864 11.7819 8.20299 12.0156 8.51562C12.3299 8.93835 12.5023 9.4498 12.5078 9.97656C12.5078 9.96094 14.4219 3.75781 6.2578 3.75781C2.82811 3.75781 0.00780015 7.00781 0.00780015 9.86719C-0.00584162 11.3776 0.317079 12.8721 0.953112 14.2422C1.99473 16.4602 3.81447 18.2185 6.06689 19.1834C8.3193 20.1483 10.8476 20.2526 13.1719 19.4766C12.3576 19.7337 11.4972 19.811 10.6501 19.7031C9.80297 19.5952 8.98941 19.3047 8.26561 18.8516H8.2578Z", fill: "url(#paint3_radial_927_5865)" }), jsx("path", { d: "M11.9062 11.625C11.8359 11.7031 11.6406 11.8203 11.6406 12.0625C11.6406 12.2656 11.7734 12.4688 12.0156 12.6328C13.1328 13.4141 15.25 13.3047 15.2578 13.3047C16.0907 13.3041 16.9081 13.0802 17.625 12.6562C18.3467 12.2341 18.9456 11.6307 19.3622 10.9057C19.7788 10.1808 19.9986 9.35955 20 8.52344C20.0234 6.77344 19.375 5.60937 19.1172 5.09375C17.4531 1.85937 13.8828 4.89564e-08 10 4.89564e-08C7.37202 -0.00025981 4.84956 1.03398 2.97819 2.87904C1.10682 4.7241 0.0369559 7.23166 0 9.85938C0.0390625 7.00781 2.875 4.70312 6.25 4.70312C6.52344 4.70312 8.08594 4.72656 9.53125 5.48438C10.5466 5.98895 11.3875 6.78627 11.9453 7.77344C12.4219 8.60156 12.5078 9.65625 12.5078 10.0781C12.5078 10.5 12.2969 11.1172 11.8984 11.6328L11.9062 11.625Z", fill: "url(#paint4_radial_927_5865)" }), jsx("path", { d: "M11.9062 11.625C11.8359 11.7031 11.6406 11.8203 11.6406 12.0625C11.6406 12.2656 11.7734 12.4688 12.0156 12.6328C13.1328 13.4141 15.25 13.3047 15.2578 13.3047C16.0907 13.3041 16.9081 13.0802 17.625 12.6562C18.3467 12.2341 18.9456 11.6307 19.3622 10.9057C19.7788 10.1808 19.9986 9.35955 20 8.52344C20.0234 6.77344 19.375 5.60937 19.1172 5.09375C17.4531 1.85937 13.8828 4.89564e-08 10 4.89564e-08C7.37202 -0.00025981 4.84956 1.03398 2.97819 2.87904C1.10682 4.7241 0.0369559 7.23166 0 9.85938C0.0390625 7.00781 2.875 4.70312 6.25 4.70312C6.52344 4.70312 8.08594 4.72656 9.53125 5.48438C10.5466 5.98895 11.3875 6.78627 11.9453 7.77344C12.4219 8.60156 12.5078 9.65625 12.5078 10.0781C12.5078 10.5 12.2969 11.1172 11.8984 11.6328L11.9062 11.625Z", fill: "url(#paint5_radial_927_5865)" })] }), jsxs("defs", { children: [jsxs("linearGradient", { id: "paint0_linear_927_5865", x1: "4.58594", y1: "13.8281", x2: "18.5234", y2: "13.8281", gradientUnits: "userSpaceOnUse", children: [jsx("stop", { stopColor: "#0C59A4" }), jsx("stop", { offset: 1, stopColor: "#114A8B" })] }), jsxs("radialGradient", { id: "paint1_radial_927_5865", cx: 0, cy: 0, r: 1, gradientUnits: "userSpaceOnUse", gradientTransform: "translate(12.2813 13.9332) scale(7.45313 7.08047)", children: [jsx("stop", { offset: "0.7", stopOpacity: 0 }), jsx("stop", { offset: "0.9", stopOpacity: "0.5" }), jsx("stop", { offset: 1 })] }), jsxs("linearGradient", { id: "paint2_linear_927_5865", x1: "11.9297", y1: "7.78125", x2: "3.23436", y2: "17.2578", gradientUnits: "userSpaceOnUse", children: [jsx("stop", { stopColor: "#1B9DE2" }), jsx("stop", { offset: "0.2", stopColor: "#1595DF" }), jsx("stop", { offset: "0.7", stopColor: "#0680D7" }), jsx("stop", { offset: 1, stopColor: "#0078D4" })] }), jsxs("radialGradient", { id: "paint3_radial_927_5865", cx: 0, cy: 0, r: 1, gradientUnits: "userSpaceOnUse", gradientTransform: "translate(5.51209 15.5419) rotate(-81.3844) scale(11.202 9.05011)", children: [jsx("stop", { offset: "0.8", stopOpacity: 0 }), jsx("stop", { offset: "0.9", stopOpacity: "0.5" }), jsx("stop", { offset: 1 })] }), jsxs("radialGradient", { id: "paint4_radial_927_5865", cx: 0, cy: 0, r: 1, gradientUnits: "userSpaceOnUse", gradientTransform: "translate(2.02266 3.69656) rotate(92.2906) scale(15.8251 33.7043)", children: [jsx("stop", { stopColor: "#35C1F1" }), jsx("stop", { offset: "0.1", stopColor: "#34C1ED" }), jsx("stop", { offset: "0.2", stopColor: "#2FC2DF" }), jsx("stop", { offset: "0.3", stopColor: "#2BC3D2" }), jsx("stop", { offset: "0.7", stopColor: "#36C752" })] }), jsxs("radialGradient", { id: "paint5_radial_927_5865", cx: 0, cy: 0, r: 1, gradientUnits: "userSpaceOnUse", gradientTransform: "translate(18.7547 6.03906) rotate(73.7398) scale(7.60156 6.18159)", children: [jsx("stop", { stopColor: "#66EB6E" }), jsx("stop", { offset: 1, stopColor: "#66EB6E", stopOpacity: 0 })] }), jsx("clipPath", { id: "clip0_927_5865", children: jsx("rect", { width: 20, height: 20, fill: "white" }) })] })] }));
var browsers = { Chrome, FireFox, Brave, Edge };

const BrowserIcon = React__default.forwardRef(({ browser }, ref) => {
    const currentBrowser = browser !== null && browser !== void 0 ? browser : detectBrowser();
    let icon;
    switch (currentBrowser) {
        case 'chrome':
            icon = browsers.Chrome;
            break;
        case 'firefox':
            icon = browsers.FireFox;
            break;
        case 'edge':
            icon = browsers.Edge;
            break;
    }
    if (!icon)
        return jsx(Fragment, {});
    return jsx(BrowserIconContainer, { children: icon });
});
BrowserIcon.displayName = 'BrowserIcon';

const states$1 = {
    CONNECTED: "connected",
    CONNECTING: "connecting",
    EXPIRING: "expiring",
    FAILED: "failed",
    REJECTED: "rejected",
    NOTCONNECTED: "notconnected",
    UNAVAILABLE: "unavailable",
};
const contentVariants$1 = {
    initial: {
        willChange: "transform,opacity",
        position: "relative",
        opacity: 0,
        scale: 0.95,
    },
    animate: {
        position: "relative",
        opacity: 1,
        scale: 1,
        transition: {
            ease: [0.16, 1, 0.3, 1],
            duration: 0.4,
            delay: 0.05,
            position: { delay: 0 },
        },
    },
    exit: {
        position: "absolute",
        opacity: 0,
        scale: 0.95,
        transition: {
            ease: [0.16, 1, 0.3, 1],
            duration: 0.3,
        },
    },
};
const ConnectWithInjector = ({ connectorId, switchConnectMethod, forceState }) => {
    var _a, _b;
    const { connect, connectors } = useConnect({
        onMutate: (connector) => {
            if (connector.connector) {
                setStatus(states$1.CONNECTING);
            }
            else {
                setStatus(states$1.UNAVAILABLE);
            }
        },
        onError(err) {
            console.error(err);
        },
        onSettled(data, error) {
            if (error) {
                setShowTryAgainTooltip(true);
                setTimeout(() => setShowTryAgainTooltip(false), 3500);
                if (error.code) {
                    // https://github.com/MetaMask/eth-rpc-errors/blob/main/src/error-constants.ts
                    switch (error.code) {
                        case -32002:
                            setStatus(states$1.NOTCONNECTED);
                            break;
                        case 4001:
                            setStatus(states$1.REJECTED);
                            break;
                        default:
                            setStatus(states$1.FAILED);
                            break;
                    }
                }
                else {
                    // Sometimes the error doesn't respond with a code
                    if (error.message) {
                        switch (error.message) {
                            case "User rejected request":
                                setStatus(states$1.REJECTED);
                                break;
                            default:
                                setStatus(states$1.FAILED);
                                break;
                        }
                    }
                }
            }
        },
    });
    const [id, setId] = useState(connectorId);
    const [showTryAgainTooltip, setShowTryAgainTooltip] = useState(false);
    const connector = supportedConnectors$1.filter((c) => c.id === id)[0];
    const expiryDefault = 9; // Starting at 10 causes layout shifting, better to start at 9
    useState(expiryDefault);
    const hasExtensionInstalled = connector.extensionIsInstalled && connector.extensionIsInstalled();
    const browser = detectBrowser();
    const extensionUrl = connector.extensions ? connector.extensions[browser] : undefined;
    const suggestedExtension = connector.extensions
        ? {
            name: Object.keys(connector.extensions)[0],
            label: Object.keys(connector.extensions)[0].charAt(0).toUpperCase() +
                Object.keys(connector.extensions)[0].slice(1),
            url: connector.extensions[Object.keys(connector.extensions)[0]],
        }
        : undefined;
    const [status, setStatus] = useState(forceState ? forceState : !hasExtensionInstalled ? states$1.UNAVAILABLE : states$1.CONNECTING);
    const runConnect = () => {
        if (!hasExtensionInstalled)
            return;
        const con = connectors.find((c) => c.id === id);
        if (con) {
            connect({ connector: con });
        }
        else {
            setStatus(states$1.UNAVAILABLE);
        }
    };
    let connectTimeout;
    useEffect(() => {
        if (status === states$1.UNAVAILABLE)
            return;
        // UX: Give user time to see the UI before opening the extension
        connectTimeout = setTimeout(runConnect, 600);
        return () => {
            clearTimeout(connectTimeout);
        };
    }, []);
    /** Timeout functionality if necessary
    let expiryTimeout: any;
    useEffect(() => {
      if (status === states.EXPIRING) {
        expiryTimeout = setTimeout(
          () => {
            if (expiryTimer <= 0) {
              setStatus(states.FAILED);
              setExpiryTimer(expiryDefault);
            } else {
              setExpiryTimer(expiryTimer - 1);
            }
          },
          expiryTimer === 9 ? 1500 : 1000 // Google: Chronostasis
        );
      }
      return () => {
        clearTimeout(expiryTimeout);
      };
    }, [status, expiryTimer]);
    */
    if (!connector) {
        return (jsx(PageContent, { children: jsxs(Container$2, { children: [jsx(ModalHeading, { children: "Invalid State" }), jsx(ModalContent, { children: jsx(Alert, { children: "No connectors match the id given. This state should never happen." }) })] }) }));
    }
    return (jsx(PageContent, { children: jsxs(Container$2, { children: [jsx(ConnectingContainer, { children: jsxs(ConnectingAnimation, { "$shake": status === states$1.FAILED || status === states$1.REJECTED, "$circle": true, children: [jsx(AnimatePresence, { children: (status === states$1.FAILED || status === states$1.REJECTED) && (jsx(RetryButton, { "aria-label": "Retry", initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.8 }, whileTap: { scale: 0.9 }, transition: { duration: 0.1 }, onClick: runConnect, children: jsx(RetryIconContainer, { children: jsx(Tooltip, { open: showTryAgainTooltip &&
                                                (status === states$1.FAILED || status === states$1.REJECTED), message: "try again", xOffset: -6, children: jsx(RetryIconCircle, {}) }) }) })) }), jsx(CircleSpinner, { logo: status === states$1.UNAVAILABLE ? (jsx("div", { style: {
                                        transform: "scale(1.14)",
                                        position: "relative",
                                        width: "100%",
                                    }, children: (_a = connector.logos.transparent) !== null && _a !== void 0 ? _a : connector.logos.default })) : (jsx(Fragment, { children: (_b = connector.logos.transparent) !== null && _b !== void 0 ? _b : connector.logos.default })), smallLogo: connector.id === "injected", connecting: status === states$1.CONNECTING, unavailable: status === states$1.UNAVAILABLE, countdown: status === states$1.EXPIRING })] }) }), jsx(ModalContentContainer, { children: jsxs(AnimatePresence, { initial: false, children: [status === states$1.FAILED && (jsx(Content, { initial: "initial", animate: "animate", exit: "exit", variants: contentVariants$1, children: jsxs(ModalContent, { children: [jsxs(ModalH1, { "$error": true, children: [jsx(AlertIcon, {}), "Connection Failed"] }), jsx(ModalBody, { children: "Sorry, something went wrong. Please try connecting again." })] }) }, states$1.FAILED)), status === states$1.REJECTED && (jsx(Content, { initial: "initial", animate: "animate", exit: "exit", variants: contentVariants$1, children: jsxs(ModalContent, { style: { paddingBottom: 28 }, children: [jsx(ModalH1, { children: "Rejected" }), jsx(ModalBody, { children: "rejected description" })] }) }, states$1.REJECTED)), (status === states$1.CONNECTING || status === states$1.EXPIRING) && (jsx(Content, { initial: "initial", animate: "animate", exit: "exit", variants: contentVariants$1, children: jsxs(ModalContent, { style: { paddingBottom: 28 }, children: [jsx(ModalH1, { children: "Requesting Connection" }), jsxs(ModalBody, { children: ["Open the ", connector.name, " browser extension to connect your wallet."] })] }) }, states$1.CONNECTING)), status === states$1.CONNECTED && (jsx(Content, { initial: "initial", animate: "animate", exit: "exit", variants: contentVariants$1, children: jsxs(ModalContent, { children: [jsxs(ModalH1, { "$valid": true, children: [jsx(TickIcon, {}), " aaab"] }), jsx(ModalBody, { children: "description" })] }) }, states$1.CONNECTED)), status === states$1.NOTCONNECTED && (jsx(Content, { initial: "initial", animate: "animate", exit: "exit", variants: contentVariants$1, children: jsxs(ModalContent, { children: [jsx(ModalH1, { children: "not connected" }), jsx(ModalBody, { children: "not connected description" })] }) }, states$1.NOTCONNECTED)), status === states$1.UNAVAILABLE && (jsx(Content, { initial: "initial", animate: "animate", exit: "exit", variants: contentVariants$1, children: !extensionUrl ? (jsxs(Fragment, { children: [jsxs(ModalContent, { style: { paddingBottom: 12 }, children: [jsx(ModalH1, { children: "injectionScreen_unavailable_h1" }), jsx(ModalBody, { children: "injectionScreen_unavailable_p" })] }), !hasExtensionInstalled && suggestedExtension && (jsxs(Button, { href: suggestedExtension === null || suggestedExtension === void 0 ? void 0 : suggestedExtension.url, icon: jsx(BrowserIcon, { browser: suggestedExtension === null || suggestedExtension === void 0 ? void 0 : suggestedExtension.name }), children: ["Install on ", suggestedExtension === null || suggestedExtension === void 0 ? void 0 : suggestedExtension.label] }))] })) : (jsxs(Fragment, { children: [jsxs(ModalContent, { style: { paddingBottom: 18 }, children: [jsx(ModalH1, { children: "injectionScreen_install_h1" }), jsx(ModalBody, { children: "injectionScreen_install_p" })] }), !hasExtensionInstalled && extensionUrl && (jsx(Button, { href: extensionUrl, icon: jsx(BrowserIcon, {}), children: "Install extension" }))] })) }, states$1.UNAVAILABLE))] }) })] }) }));
};

const states = {
    QRCODE: "qrcode",
    INJECTOR: "injector",
};
const ConnectUsing = ({ connectorId }) => {
    const [id, setId] = useState(connectorId);
    const connector = supportedConnectors$1.filter((c) => c.id === id)[0];
    const hasExtensionInstalled = connector.extensionIsInstalled && connector.extensionIsInstalled();
    // If cannot be scanned, display injector flow, which if extension is not installed will show CTA to install it
    const useInjector = !connector.scannable || hasExtensionInstalled;
    const [status, setStatus] = useState(useInjector ? states.INJECTOR : states.QRCODE);
    if (!connector)
        return jsx(Alert, { children: "Connector not found" });
    return (jsx(AnimatePresence, { children: status === states.INJECTOR && (jsx(motion.div, { initial: "initial", animate: "animate", exit: "exit", variants: contentVariants$2, children: jsx(ConnectWithInjector, { connectorId: id, switchConnectMethod: (id) => {
                    if (id)
                        setId(id);
                    setStatus(states.QRCODE);
                } }) }, states.INJECTOR)) }));
};

const QRCodeContainer = styled(motion.div) `
  z-index: 3;
  position: relative;
  overflow: hidden;
  height: 0;
  padding-bottom: 100% !important;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1px 0 2px;
  border-radius: var(--ck-qr-border-radius, 24px);
  background: var(--ck-qr-background, transparent);
  box-shadow: 0 0 0 1px var(--ck-qr-border-color);
  backface-visibility: hidden;
  svg {
    display: block;
    max-width: 100%;
    width: 100%;
    height: auto;
  }
`;
const QRCodeContent = styled(motion.div) `
  position: absolute;
  inset: 13px;
  svg {
    width: 100% !important;
    height: auto !important;
  }
`;
const PlaceholderKeyframes$2 = keyframes `
  0%{ background-position: 100% 0; }
  100%{ background-position: -100% 0; }
`;
const QRPlaceholder = styled(motion.div) `
  --color: var(--ck-qr-dot-color);
  --bg: var(--ck-qr-background, var(--ck-body-background));

  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  > div {
    z-index: 4;
    position: relative;
    width: 28%;
    height: 28%;
    border-radius: 20px;
    background: var(--bg);
    box-shadow: 0 0 0 7px var(--bg);
  }
  > span {
    z-index: 4;
    position: absolute;
    background: var(--color);
    border-radius: 12px;
    width: 13.25%;
    height: 13.25%;
    box-shadow: 0 0 0 4px var(--bg);
    &:before {
      content: "";
      position: absolute;
      inset: 9px;
      border-radius: 3px;
      box-shadow: 0 0 0 4px var(--bg);
    }
    &:nth-child(1) {
      top: 0;
      left: 0;
    }
    &:nth-child(2) {
      top: 0;
      right: 0;
    }
    &:nth-child(3) {
      bottom: 0;
      left: 0;
    }
  }
  &:before {
    z-index: 3;
    content: "";
    position: absolute;
    inset: 0;
    background: repeat;
    background-size: 1.888% 1.888%;
    background-image: radial-gradient(var(--color) 41%, transparent 41%);
  }
  &:after {
    z-index: 5;
    content: "";
    position: absolute;
    inset: 0;
    transform: scale(1.5) rotate(45deg);
    background-image: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 50%,
      rgba(255, 255, 255, 1),
      rgba(255, 255, 255, 0)
    );
    background-size: 200% 100%;
    animation: ${PlaceholderKeyframes$2} 1000ms linear infinite both;
  }
`;
const LogoContainer = styled(motion.div) `
  z-index: 6;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: translateY(50%) scale(0.9999); // Shifting fix
`;
const LogoIcon = styled(motion.div) `
  z-index: 6;
  position: absolute;
  left: 50%;
  overflow: hidden;

  transform: translate(-50%, -50%) scale(0.9999); // Shifting fix

  svg {
    display: block;
    position: relative;
    width: 100%;
    height: 100%;
  }

  ${(props) => props.$wcLogo
    ? css `
          width: 29%;
          height: 20.5%;
        `
    : css `
          width: 28%;
          height: 28%;
          border-radius: 17px;
          &:before {
            pointer-events: none;
            z-index: 2;
            content: "";
            position: absolute;
            inset: 0;
            border-radius: inherit;
            box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.02);
          }
        `}
`;

const generateMatrix = (value, errorCorrectionLevel) => {
    const arr = Array.prototype.slice.call(QRCodeUtil.create(value, { errorCorrectionLevel }).modules.data, 0);
    const sqrt = Math.sqrt(arr.length);
    return arr.reduce((rows, key, index) => (index % sqrt === 0 ? rows.push([key]) : rows[rows.length - 1].push(key)) && rows, []);
};
function QRCode({ ecl = "M", size: sizeProp = 200, uri, clearArea = false, image, imageBackground = "transparent", }) {
    const logoSize = clearArea ? 76 : 0;
    const size = sizeProp - 10 * 2;
    const dots = useMemo(() => {
        const dots = [];
        const matrix = generateMatrix(uri, ecl);
        const cellSize = size / matrix.length;
        const qrList = [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
        ];
        qrList.forEach(({ x, y }) => {
            const x1 = (matrix.length - 7) * cellSize * x;
            const y1 = (matrix.length - 7) * cellSize * y;
            for (let i = 0; i < 3; i++) {
                dots.push(jsx("rect", { fill: i % 2 !== 0
                        ? "var(--ck-qr-background, var(--ck-body-background))"
                        : "var(--ck-qr-dot-color)", rx: (i - 2) * -5 + (i === 0 ? 2 : 3), ry: (i - 2) * -5 + (i === 0 ? 2 : 3), width: cellSize * (7 - i * 2), height: cellSize * (7 - i * 2), x: x1 + cellSize * i, y: y1 + cellSize * i }, `${i}-${x}-${y}`));
            }
        });
        if (image) {
            const x1 = (matrix.length - 7) * cellSize * 1;
            const y1 = (matrix.length - 7) * cellSize * 1;
            dots.push(jsxs(Fragment, { children: [jsx("rect", { fill: imageBackground, rx: (0 - 2) * -5 + 2, ry: (0 - 2) * -5 + 2, width: cellSize * (7 - 0 * 2), height: cellSize * (7 - 0 * 2), x: x1 + cellSize * 0, y: y1 + cellSize * 0 }), jsx("foreignObject", { width: cellSize * (7 - 0 * 2), height: cellSize * (7 - 0 * 2), x: x1 + cellSize * 0, y: y1 + cellSize * 0, children: jsx("div", { style: { borderRadius: (0 - 2) * -5 + 2, overflow: "hidden" }, children: image }) })] }));
        }
        const clearArenaSize = Math.floor((logoSize + 25) / cellSize);
        const matrixMiddleStart = matrix.length / 2 - clearArenaSize / 2;
        const matrixMiddleEnd = matrix.length / 2 + clearArenaSize / 2 - 1;
        matrix.forEach((row, i) => {
            row.forEach((_, j) => {
                if (matrix[i][j]) {
                    // Do not render dots under position squares
                    if (!((i < 7 && j < 7) ||
                        (i > matrix.length - 8 && j < 7) ||
                        (i < 7 && j > matrix.length - 8))) {
                        //if (image && i > matrix.length - 9 && j > matrix.length - 9) return;
                        if (image ||
                            !(i > matrixMiddleStart &&
                                i < matrixMiddleEnd &&
                                j > matrixMiddleStart &&
                                j < matrixMiddleEnd)) {
                            dots.push(jsx("circle", { cx: i * cellSize + cellSize / 2, cy: j * cellSize + cellSize / 2, fill: "var(--ck-qr-dot-color)", r: cellSize / 3 }, `circle-${i}-${j}`));
                        }
                    }
                }
            });
        });
        return dots;
    }, [ecl, size, uri]);
    return (jsxs("svg", { height: size, width: size, viewBox: `0 0 ${size} ${size}`, style: {
            width: size,
            height: size,
        }, children: [jsx("rect", { fill: "transparent", height: size, width: size }), dots] }));
}

function useWindowSize() {
    const [windowSize, setWindowSize] = useState({
        width: 0,
        height: 0,
    });
    useEffect(() => {
        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    return windowSize;
}

function CustomQRCode({ value, image, imageBackground, imagePosition = 'center', tooltipMessage, }) {
    const windowSize = useWindowSize();
    const Logo = windowSize.width > 920 && tooltipMessage ? (jsx(Tooltip, { xOffset: 139, yOffset: 5, delay: 0.1, message: tooltipMessage, children: image })) : (image);
    return (jsx(QRCodeContainer, { children: jsxs(QRCodeContent, { children: [image && (jsx(LogoContainer, { children: jsx(LogoIcon, { "$wcLogo": imagePosition !== 'center', style: {
                            background: imagePosition === 'center' ? imageBackground : undefined,
                        }, children: Logo }) })), jsx(AnimatePresence, { initial: false, children: value ? (jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0, position: 'absolute', inset: [0, 0] }, transition: {
                            duration: 0.2,
                        }, children: jsx(QRCode, { uri: value, size: 288, ecl: "M", clearArea: !!(imagePosition === 'center' && image) }) }, value)) : (jsxs(QRPlaceholder, { initial: { opacity: 0.1 }, animate: { opacity: 0.1 }, exit: { opacity: 0, position: 'absolute', inset: [0, 0] }, transition: {
                            duration: 0.2,
                        }, children: [jsx("span", {}), jsx("span", {}), jsx("span", {}), jsx("div", {})] })) })] }) }));
}
CustomQRCode.displayName = 'CustomQRCode';

const DownloadApp = ({ connectorId }) => {
    var _a, _b, _c;
    const [id] = useState(connectorId);
    const connector = supportedConnectors$1.filter((c) => c.id === id)[0];
    if (!connector)
        return jsx(Fragment, { children: "Connector not found" });
    const ios = (_a = connector.appUrls) === null || _a === void 0 ? void 0 : _a.ios;
    const android = (_b = connector.appUrls) === null || _b === void 0 ? void 0 : _b.android;
    const downloadUri = (_c = connector.appUrls) === null || _c === void 0 ? void 0 : _c.download;
    const bodycopy = ios && android ? "ios" : ios ? "app ios" : "android";
    return (jsxs(PageContent, { children: [jsxs(ModalContent, { style: { paddingBottom: 4, gap: 14 }, children: [downloadUri && jsx(CustomQRCode, { value: downloadUri }), !downloadUri && jsx(Fragment, { children: "No download link available" }), jsx(ModalBody, { style: { fontSize: 15, lineHeight: "20px", padding: "0 12px" }, children: bodycopy }), connector.defaultConnect && jsx(OrDivider, {})] }), connector.defaultConnect && ( // Open the default connector modal
            jsx(Button, { icon: jsx(ExternalLinkIcon, {}), children: "Open Default Modal" }))] }));
};

function useStepper({ initialStep }) {
    const [activeStep, setActiveStep] = React.useState(initialStep);
    const nextStep = () => {
        setActiveStep((prev) => prev + 1);
    };
    const prevStep = () => {
        setActiveStep((prev) => prev - 1);
    };
    const resetSteps = () => {
        setActiveStep(initialStep);
    };
    const setStep = (step) => {
        setActiveStep(step);
    };
    const isDisabledStep = activeStep === 0;
    return {
        nextStep,
        prevStep,
        resetSteps,
        setStep,
        activeStep,
        isDisabledStep,
    };
}
/**
 * Older versions of Safari (shipped withCatalina and before) do not support addEventListener on matchMedia
 * https://stackoverflow.com/questions/56466261/matchmedia-addlistener-marked-as-deprecated-addeventlistener-equivalent
 * */
function attachMediaListener(query, callback) {
    try {
        query.addEventListener("change", callback);
        return () => query.removeEventListener("change", callback);
    }
    catch (e) {
        query.addListener(callback);
        return () => query.removeListener(callback);
    }
}
function getInitialValue(query, initialValue) {
    if (typeof initialValue === "boolean") {
        return initialValue;
    }
    if (typeof window !== "undefined" && "matchMedia" in window) {
        return window.matchMedia(query).matches;
    }
    return false;
}
function useMediaQuery(query, initialValue, { getInitialValueInEffect } = {
    getInitialValueInEffect: true,
}) {
    const [matches, setMatches] = React.useState(getInitialValueInEffect ? false : getInitialValue(query, initialValue));
    const queryRef = React.useRef();
    React.useEffect(() => {
        if ("matchMedia" in window) {
            queryRef.current = window.matchMedia(query);
            setMatches(queryRef.current.matches);
            return attachMediaListener(queryRef.current, (event) => setMatches(event.matches));
        }
        return undefined;
    }, [query]);
    return matches;
}

const StepperTransactionContainer = styled(motion.div) `
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 16px;
  padding-top: 50px;
  padding-right: 20px;
  padding-left: 20px;
  --ck-primary-button-background: rgb(55, 55, 55);
  --ck-primary-button-color: #ffffff;
  --ck-primary-button-border-radius: 16px;
  --ck-primary-button-font-weight: 600;
  --ck-primary-button-hover-background: #404040;
`;
styled(motion.div) `
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
`;
const StepperTransactionContent = styled(motion.div) `
  border-radius: 10px;
  padding: 16px;
`;
styled(motion.div) `
  padding: 18px 0 20px;
  @media only screen and (max-width: ${defaultTheme.mobileWidth}px) {
    padding: 16px 0 20px;
  }
`;
styled(motion.div) `
  position: relative;
  display: inline-block;
`;
styled(motion.div) `
  z-index: 3;
  position: absolute;
  bottom: 0px;
  right: -16px;
`;
const BalanceContainer = styled(motion.div) `
  position: relative;
`;
const Balance$1 = styled(motion.div) `
  position: relative;
  min-width: 150px;
  text-align: left;
  span {
    color: rgb(55 55 55);
    font-size: 1.125rem;
  }
`;
const PlaceholderKeyframes$1 = keyframes `
  0%{ background-position: 100% 0; }
  100%{ background-position: -100% 0; }
`;
const LoadingBalance = styled(motion.div) `
  min-width: 150px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  background: var(--ck-body-background-secondary);
  inset: 0;
  &:before {
    z-index: 4;
    content: "";
    position: absolute;
    inset: 0;
    background-image: linear-gradient(
      90deg,
      var(--ck-body-background-transparent) 50%,
      var(--ck-body-background),
      var(--ck-body-background-transparent)
    );
    opacity: 0.75;
    background-size: 200% 100%;
    animation: ${PlaceholderKeyframes$1} 1000ms linear infinite both;
  }
`;

const StepperStepLabelContainer = styled(motion.div) `
  display: flex;
  flex-direction: column;
  align-items: ${({ $isLabelVertical }) => ($isLabelVertical ? "center" : "flex-start")};
  text-align: ${({ $isLabelVertical }) => ($isLabelVertical ? "center" : "left")};
`;
const StepperStepOptionalLabel = styled(motion.span) `
  font-size: 0.875rem;
  color: rgb(113, 113, 122);
  margin-left: 4px;
`;
const StepperSteLabelDescription = styled(motion.span) `
  font-size: 0.875rem;
  color: rgb(113, 113, 122);
`;
const StepperStepConnectorContainer = styled(motion.div) `
  margin-left: 24px;
  display: flex;
  margin-top: 0.25rem;
  height: auto;
  min-height: 2rem;
  flex: 1 1 0;
  align-self: stretch;
  border-left: 2px solid;
  ${({ $isLastStep }) => $isLastStep &&
    css `
      min-height: 0;
      border-color: transparent;
    `}
  ${({ $isCompletedStep }) => $isCompletedStep &&
    css `
      border-color: rgb(14, 117, 55);
    `}
`;
const StepperStepConnectorLast = styled(motion.div) `
  display: block;
  margin-top: 1rem;
  margin-bottom: 1rem;
  width: 100%;
  height: auto;
`;
const StepperStepContainer = styled(motion.div) `
  display: flex;
  flex-direction: row;
  position: relative;
  gap: 8px;

  ${({ $isLastStep }) => $isLastStep
    ? css `
          justify-content: flex-end;
          flex: 0 0 auto;
        `
    : css `
          justify-content: flex-start;
          flex: 1 0 auto;
        `}
  ${({ $isVertical }) => $isVertical
    ? css `
          flex-direction: column;
        `
    : css `
          align-items: center;
        `}
  ${({ $isClickable }) => $isClickable &&
    css `
      cursor: pointer;
    `}
  ${({ $isVertical, $isLastStep }) => $isVertical &&
    $isLastStep &&
    css `
      flex-direction: column;
      align-items: flex-start;
      flex: 1 0 auto;
      justify-content: flex-start;
      width: 100%;
    `}
`;
const StepperContainer = styled(motion.div) `
  display: flex;
  flex: 1 1 0%;
  width: 100%;
  justify-content: space-between;
  gap: 16px;
  text-align: center;
  flex-direction: ${({ $isVertical }) => ($isVertical ? "column" : "row")};
`;
const StepperStepRow = styled(motion.div) `
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 100px;

  ${({ $isLabelVertical }) => $isLabelVertical &&
    css `
      flex-direction: column;
    `}
`;
const StepperStepButton = styled(motion.button) `
  height: 48px;
  width: 48px;
  border-radius: 9999px;
  background: rgb(24, 24, 27);
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 500;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 0.15s;

  &[data-highlighted="true"] {
    background-color: rgb(14, 117, 55);
    color: white;
  }

  &:hover {
    background-color: rgba(24, 24, 27, 0.9);
  }

  ${({ $isCompletedStep }) => $isCompletedStep &&
    css `
      padding: 8px 12px;
    `}
  ${({ $variant }) => $variant === "destructive" &&
    css `
      background: rgb(239, 68, 68);
    `}
`;
const StepperSeparator = styled(Separator.Root) `
  flex: 1 1 auto;
  height: 2px;
  min-height: auto;
  align-self: auto;
  background-color: rgb(228, 228, 231);
  &[data-highlighted="true"] {
    background-color: rgb(14, 117, 55);
  }
`;

const StepsContext = React.createContext({
    activeStep: 0,
});
const useStepperContext = () => React.useContext(StepsContext);
const StepperProvider = ({ value, children }) => {
    const isError = value.state === "error";
    const isLoading = value.state === "loading";
    const isVertical = value.orientation === "vertical";
    const isLabelVertical = value.orientation !== "vertical" && value.labelOrientation === "vertical";
    return (jsx(StepsContext.Provider, { value: {
            ...value,
            isError,
            isLoading,
            isVertical,
            isLabelVertical,
        }, children: children }));
};
const Stepper = React.forwardRef(({ activeStep = 0, state, responsive = true, orientation: orientationProp = "horizontal", onClickStep, labelOrientation = "horizontal", children, errorIcon, successIcon, variant = "default", }, ref) => {
    const childArr = React.Children.toArray(children);
    const stepCount = childArr.length;
    const renderHorizontalContent = () => {
        if (activeStep <= childArr.length) {
            return React.Children.map(childArr[activeStep], (node) => {
                if (!React.isValidElement(node))
                    return;
                return React.Children.map(node.props.children, (childNode) => childNode);
            });
        }
        return null;
    };
    const isClickable = !!onClickStep;
    const isMobile = useMediaQuery("(max-width: 43em)");
    const orientation = isMobile && responsive ? "vertical" : orientationProp;
    return (jsxs(StepperProvider, { value: {
            activeStep,
            orientation,
            state,
            responsive,
            onClickStep,
            labelOrientation,
            isClickable,
            stepCount,
            errorIcon,
            successIcon,
            variant,
        }, children: [jsx(StepperContainer, { ref: ref, "$isVertical": orientation === "vertical", children: React.Children.map(children, (child, i) => {
                    var _a;
                    const isCompletedStep = (_a = (React.isValidElement(child) && child.props.isCompletedStep)) !== null && _a !== void 0 ? _a : i < activeStep;
                    const isLastStep = i === stepCount - 1;
                    const isCurrentStep = i === activeStep;
                    const stepProps = {
                        index: i,
                        isCompletedStep,
                        isCurrentStep,
                        isLastStep,
                    };
                    if (React.isValidElement(child)) {
                        return React.cloneElement(child, stepProps);
                    }
                    return null;
                }) }), orientation === "horizontal" && renderHorizontalContent()] }));
});
Stepper.displayName = "Stepper";
const StepperStep = React.forwardRef((props, ref) => {
    const { children, description, icon: CustomIcon, index, isCompletedStep, isCurrentStep, isLastStep, label, optional, optionalLabel, } = props;
    const { isVertical, isError, isLoading, successIcon: CustomSuccessIcon, errorIcon: CustomErrorIcon, isLabelVertical, onClickStep, isClickable, variant, } = useStepperContext();
    const hasVisited = isCurrentStep || isCompletedStep;
    const handleClick = (index) => {
        if (isClickable && onClickStep) {
            onClickStep(index);
        }
    };
    const Icon = React.useMemo(() => CustomIcon !== null && CustomIcon !== void 0 ? CustomIcon : null, [CustomIcon]);
    const Success = React.useMemo(() => CustomSuccessIcon !== null && CustomSuccessIcon !== void 0 ? CustomSuccessIcon : jsx(Check, {}), [CustomSuccessIcon]);
    const Error = React.useMemo(() => CustomErrorIcon !== null && CustomErrorIcon !== void 0 ? CustomErrorIcon : jsx(X, {}), [CustomErrorIcon]);
    const RenderIcon = React.useMemo(() => {
        if (isCompletedStep)
            return Success;
        if (isCurrentStep) {
            if (isError)
                return Error;
            if (isLoading)
                return (jsx(SpinnerContainer$1, { children: jsx(Loader2, {}) }));
        }
        if (Icon)
            return Icon;
        return (index || 0) + 1;
    }, [isCompletedStep, Success, isCurrentStep, Icon, index, isError, Error, isLoading]);
    return (jsxs(StepperStepContainer, { "$isLastStep": isLastStep, "$isVertical": isVertical, "$isClickable": isClickable && !!onClickStep, ref: ref, onClick: () => handleClick(index), "aria-disabled": !hasVisited, children: [jsxs(StepperStepRow, { "$isLabelVertical": isLabelVertical, children: [jsx(StepperStepButton, { "aria-current": isCurrentStep ? "step" : undefined, "data-invalid": isCurrentStep && isError, "data-highlighted": isCompletedStep, "data-clickable": isClickable, disabled: !(hasVisited || isClickable), "$isCompletedStep": isCompletedStep || typeof RenderIcon !== "number", "$variant": isCurrentStep && isError ? "destructive" : variant, children: RenderIcon }), jsx(StepperStepLabel, { label: label, description: description, optional: optional, optionalLabel: optionalLabel, ...{ isCurrentStep } })] }), jsx(StepperStepConnector, { index: index, isLastStep: isLastStep, hasLabel: !!label || !!description, isCompletedStep: isCompletedStep || false, children: (isCurrentStep || isCompletedStep) && children })] }));
});
StepperStep.displayName = "StepperStep";
const StepperStepLabel = ({ isCurrentStep, label, description, optional, optionalLabel, }) => {
    const { isLabelVertical } = useStepperContext();
    const shouldRender = !!label || !!description;
    const renderOptionalLabel = !!optional && !!optionalLabel;
    return shouldRender ? (jsxs(StepperStepLabelContainer, { "aria-current": isCurrentStep ? "step" : undefined, "$isLabelVertical": isLabelVertical, children: [!!label && (jsxs("p", { children: [label, renderOptionalLabel && (jsxs(StepperStepOptionalLabel, { children: ["(", optionalLabel, ")"] }))] })), !!description && jsx(StepperSteLabelDescription, { children: description })] })) : null;
};
StepperStepLabel.displayName = "StepperStepLabel";
const StepperStepConnector = React.memo(({ isCompletedStep, children, isLastStep }) => {
    const { isVertical } = useStepperContext();
    if (isVertical) {
        return (jsx(StepperStepConnectorContainer, { "data-highlighted": isCompletedStep, "$isLastStep": isLastStep, "$isCompletedStep": isCompletedStep, children: !isCompletedStep && jsx(StepperStepConnectorLast, { children: children }) }));
    }
    if (isLastStep) {
        return null;
    }
    return (jsx(StepperSeparator, { "data-highlighted": isCompletedStep, orientation: isVertical ? "vertical" : "horizontal" }));
});
StepperStepConnector.displayName = "StepperStepConnector";

const convertWeiToTokens = ({ valueWei, token }) => new BigNumber(valueWei).dividedBy(new BigNumber(10).pow(token.decimals)).dp(+token.decimals);
const convertTokensToWei = ({ value, token }) => new BigNumber(value).multipliedBy(new BigNumber(10).pow(token.decimals)).dp(0);

const StepTitle = styled.h1 `
  font-size: 1.25rem;
  text-align: center;
  color: rgb(55 55 55);
  margin-bottom: 10px;
`;
const StepDescription = styled.p `
  font-size: 1rem;
  text-align: center;
  color: rgb(153 153 153);
  margin-bottom: 40px;
  line-height: 1.5;
`;
const BalancesWrapper = styled.div `
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
`;
const LabelWithBalanceContainer = styled.div `
  display: flex;
  align-items: center;
  gap: 20px;
  justify-content: center;
`;
const LabelText = styled.div `
  min-width: 150px;
  text-align: right;
`;
const ErrorMessage = styled.div `
  color: rgb(239, 68, 68);
  margin-bottom: 18px;
`;
const SpinnerWrapper = styled.div `
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px 0 40px;
  svg {
    color: #f07d00;
  }
`;
const WrapperButtons = styled.div `
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 40px;
`;

const useInterval = (callback, delay) => {
    const savedCallback = useRef(callback);
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);
    useEffect(() => {
        if (!delay && delay !== 0) {
            return;
        }
        const id = setInterval(() => savedCallback.current(), delay);
        return () => clearInterval(id);
    }, [delay]);
};

const WrapStatus = {
    ...TxPendingStatus,
    Idle: "Idle",
    Init: "Init",
    Pending: "Pending",
    Error: "Error",
};
const statusWrapMessages = {
    [WrapStatus.Init]: "Confirm Wrapping",
    [WrapStatus.Pending]: "Wrapping your token",
    [WrapStatus.WaitingL1Confirmation]: "Waiting for L1 confirmation",
    [WrapStatus.WaitingBridgeConfirmation]: "Waiting for bridge confirmation",
    [WrapStatus.WaitingL2Confirmation]: "Waiting for L2 confirmation",
    [WrapStatus.Confirmed]: "Your asset has been successfully wrapped!",
};
const WrapStep = ({ defaultAmountEth = "30", defaultTokenUnit = "lovelace", nextStep }) => {
    const { setOpen } = useContext();
    useStepperContext();
    const [selectedWrapToken, setSelectedWrapToken] = React__default.useState(null);
    const { wscProvider, originTokens, stargateInfo } = useContext();
    const [txHash, setTxHash] = React__default.useState(null);
    const [txStatus, setTxStatus] = React__default.useState(WrapStatus.Idle);
    const [txStatusError, setTxStatusError] = React__default.useState(null);
    const isIdle = txStatus === WrapStatus.Idle;
    const isLoading = txStatus === WrapStatus.Init ||
        txStatus === WrapStatus.Pending ||
        txStatus === WrapStatus.WaitingL1Confirmation ||
        txStatus === WrapStatus.WaitingBridgeConfirmation ||
        txStatus === WrapStatus.WaitingL2Confirmation;
    const isError = txStatus === WrapStatus.Error;
    const isSuccess = txStatus === WrapStatus.Confirmed;
    useInterval(async () => {
        if (!wscProvider || txHash == null)
            return;
        const response = await wscProvider.getTxStatus(txHash);
        setTxStatus(response);
        if (response === TxPendingStatus.Confirmed) {
            setTxHash(null);
            setTimeout(() => {
                nextStep();
            }, 2000);
        }
    }, txHash != null ? 4000 : null);
    const wrapToken = async () => {
        setTxStatus(WrapStatus.Init);
        try {
            const txHash = await (wscProvider === null || wscProvider === void 0 ? void 0 : wscProvider.wrap(undefined, selectedWrapToken === null || selectedWrapToken === void 0 ? void 0 : selectedWrapToken.unit, new BigNumber(defaultAmountEth !== null && defaultAmountEth !== void 0 ? defaultAmountEth : "0")));
            setTxHash(txHash);
            setTxStatus(WrapStatus.Pending);
        }
        catch (err) {
            setTxStatus(WrapStatus.Error);
            if (err instanceof Error) {
                setTxStatusError(err.message);
            }
        }
    };
    React__default.useEffect(() => {
        const loadOriginToken = async () => {
            const token = originTokens.find((t) => t.unit === defaultTokenUnit);
            if (!token)
                return;
            const defaultToken = {
                ...token,
                quantity: convertWeiToTokens({ valueWei: token.quantity, token }),
            };
            setSelectedWrapToken(defaultToken);
        };
        loadOriginToken();
    }, [defaultAmountEth, defaultTokenUnit, originTokens, setSelectedWrapToken]);
    const fee = stargateInfo != null ? new BigNumber(stargateInfo === null || stargateInfo === void 0 ? void 0 : stargateInfo.stargateMinNativeTokenFromL1) : null;
    const isAmountValid = selectedWrapToken != null && fee != null
        ? new BigNumber(defaultAmountEth).plus(fee).lte(selectedWrapToken === null || selectedWrapToken === void 0 ? void 0 : selectedWrapToken.quantity)
        : false;
    return (jsxs("div", { children: [jsx(StepTitle, { children: "Wrap Tokens" }), jsx(StepDescription, { children: "Explore the power of wrap tokens as they seamlessly connect Cardano and Ethereum, enabling users to leverage the benefits of both blockchain ecosystems. With wrap tokens, Cardano tokens can be wrapped and utilized on the Ethereum network." }), jsxs(BalancesWrapper, { children: [jsx(LabelWithBalance, { label: "You're moving:", amount: new BigNumber(defaultAmountEth).toFixed(), assetName: selectedWrapToken === null || selectedWrapToken === void 0 ? void 0 : selectedWrapToken.assetName }), jsx(LabelWithBalance, { label: "Wrapping fee:", amount: fee === null || fee === void 0 ? void 0 : fee.toFixed(), assetName: selectedWrapToken === null || selectedWrapToken === void 0 ? void 0 : selectedWrapToken.assetName }), jsx(LabelWithBalance, { label: "You'll transfer:", amount: fee && new BigNumber(defaultAmountEth).plus(fee).toFixed(), assetName: selectedWrapToken === null || selectedWrapToken === void 0 ? void 0 : selectedWrapToken.assetName })] }), isLoading && (jsxs(Fragment, { children: [jsxs(SpinnerWrapper, { children: [jsx(Spinner$1, {}), jsx("span", { children: statusWrapMessages[txStatus] })] }), jsx("p", { children: "Wrapping transaction may take a few minutes (~3m)." })] })), isSuccess && (jsxs(SpinnerWrapper, { children: [jsx(CheckCircle2, {}), jsx("span", { children: statusWrapMessages[TxPendingStatus.Confirmed] })] })), selectedWrapToken != null && !selectedWrapToken.bridgeAllowed && (jsx(ErrorMessage, { role: "alert", children: "Error: Bridge doesn't allow this token" })), selectedWrapToken != null && !isAmountValid && (jsx(ErrorMessage, { role: "alert", children: "Error: Amount exceeds your current balance" })), isError && (jsxs(ErrorMessage, { role: "alert", children: ["Ups, something went wrong. ", txStatusError ? `Error: ${txStatusError}` : "", " "] })), (isIdle || isError) && (jsxs(WrapperButtons, { children: [jsx(Button, { onClick: () => setOpen(false), children: "Cancel" }), jsx(Button, { variant: "primary", onClick: wrapToken, children: "Confirm wrapping" })] }))] }));
};
const LabelWithBalance = ({ label, amount, assetName }) => {
    return (jsxs(LabelWithBalanceContainer, { children: [jsxs(LabelText, { children: [label, " "] }), jsx(BalanceContainer, { children: jsx(AnimatePresence, { exitBeforeEnter: true, initial: false, children: amount && assetName ? (jsx(Balance$1, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.2 }, children: jsxs("span", { children: [amount, ` `, assetName] }) })) : (jsx(LoadingBalance, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.2 }, children: "\u00A0" })) }) })] }));
};

const ActionExecutionStep = ({ nextStep }) => {
    const onWSCAction = () => {
        nextStep();
    };
    return (jsxs("div", { children: [jsx(StepTitle, { children: "Executing Actions with Wrap Tokens: Smart Contract Interoperability" }), jsx(StepDescription, { children: "Discover the power of wrap tokens in smart contracts, enabling seamless execution of actions across multiple blockchains. These tokens act as a bridge, empowering smart contracts to interact with assets and access decentralized applications on different blockchain networks." }), jsx(Button, { variant: "primary", onClick: onWSCAction, children: "Confirm wrapping" })] }));
};

const statusUnwrapMessages = {
    [WrapStatus.Init]: "Confirm Unwrapping",
    [WrapStatus.Pending]: "Unwrapping your token",
    [WrapStatus.WaitingL1Confirmation]: "Waiting for L1 confirmation",
    [WrapStatus.WaitingBridgeConfirmation]: "Waiting for bridge confirmation",
    [WrapStatus.WaitingL2Confirmation]: "Waiting for L2 confirmation",
    [WrapStatus.Confirmed]: "Your asset has been successfully unwrapped!",
};
const UnwrapStep = ({ contractAddress }) => {
    const { wscProvider, tokens, stargateInfo } = useContext();
    const [selectedUnwrapToken, setSelectedUnwrapToken] = React__default.useState(null);
    const [txHash, setTxHash] = React__default.useState(null);
    const [txStatus, setTxStatus] = React__default.useState(WrapStatus.Idle);
    const [txStatusError, setTxStatusError] = React__default.useState(null);
    const isIdle = txStatus === WrapStatus.Idle;
    const isLoading = txStatus === WrapStatus.Init ||
        txStatus === WrapStatus.Pending ||
        txStatus === WrapStatus.WaitingL1Confirmation ||
        txStatus === WrapStatus.WaitingBridgeConfirmation ||
        txStatus === WrapStatus.WaitingL2Confirmation;
    const isError = txStatus === WrapStatus.Error;
    const isSuccess = txStatus === WrapStatus.Confirmed;
    useInterval(async () => {
        if (!wscProvider || txHash == null)
            return;
        const response = await wscProvider.getTxStatus(txHash);
        setTxStatus(response);
        if (response === statusUnwrapMessages.Confirmed) {
            setTxHash(null);
        }
    }, txHash != null ? 4000 : null);
    useEffect(() => {
        const selectedToken = tokens.find((t) => t.contractAddress === contractAddress);
        if (!selectedToken)
            return;
        setSelectedUnwrapToken(selectedToken);
    }, [tokens, contractAddress]);
    const unwrapToken = async () => {
        if (!selectedUnwrapToken)
            return;
        setTxStatus(WrapStatus.Init);
        try {
            const txHash = await wscProvider.unwrap(undefined, selectedUnwrapToken.contractAddress, new BigNumber(selectedUnwrapToken.balance));
            setTxHash(txHash);
            setTxStatus(WrapStatus.Pending);
        }
        catch (err) {
            console.error(err);
            setTxStatus(WrapStatus.Error);
            if (err instanceof Error) {
                setTxStatusError(err.message);
            }
        }
    };
    const fee = stargateInfo != null ? new BigNumber(stargateInfo === null || stargateInfo === void 0 ? void 0 : stargateInfo.stargateMinNativeTokenToL1) : null;
    return (jsxs("div", { children: [jsx(StepTitle, { children: "Unwrap Tokens: Liberating Assets from Wrapper Chains" }), jsx(StepDescription, { children: "Unwrap Tokens liberate assets from wrapper chains, providing users with the ability to seamlessly retrieve their original tokens from a wrapped form." }), jsxs(BalancesWrapper, { children: [jsx(LabelWithBalance, { label: "You're moving:", amount: (selectedUnwrapToken === null || selectedUnwrapToken === void 0 ? void 0 : selectedUnwrapToken.balance) &&
                            convertWeiToTokens({
                                valueWei: selectedUnwrapToken === null || selectedUnwrapToken === void 0 ? void 0 : selectedUnwrapToken.balance,
                                token: selectedUnwrapToken,
                            }).toFixed(), assetName: selectedUnwrapToken === null || selectedUnwrapToken === void 0 ? void 0 : selectedUnwrapToken.symbol }), jsx(LabelWithBalance, { label: "Unwrapping fee:", amount: fee === null || fee === void 0 ? void 0 : fee.toFixed(), assetName: "mADA" })] }), isLoading && (jsxs(Fragment, { children: [jsxs(SpinnerWrapper, { children: [jsx(Spinner$1, {}), jsx("span", { children: statusUnwrapMessages[txStatus] })] }), jsx("p", { children: "Unwrapping transaction may take a few minutes (~2m)." })] })), isError && (jsxs(ErrorMessage, { role: "alert", children: ["Ups, something went wrong. ", txStatusError ? `Error: ${txStatusError}` : "", " "] })), isSuccess && (jsxs(SpinnerWrapper, { children: [jsx(CheckCircle2, {}), jsx("span", { children: statusUnwrapMessages[TxPendingStatus.Confirmed] })] })), (isIdle || isError) && (jsx(Button, { variant: "primary", onClick: unwrapToken, children: "Confirm Unwrapping" }))] }));
};

const bridgeAddress = "0x319f10d19e21188ecF58b9a146Ab0b2bfC894648";
const TokenAllowanceStep = ({ contractAddress, nextStep }) => {
    const { data: signer } = useSigner();
    const { tokens } = useContext();
    const [approvalStatus, setApprovalStatus] = React__default.useState("idle");
    const onTokenAllowance = async () => {
        const selectedToken = tokens.find((t) => t.contractAddress === contractAddress);
        if (!selectedToken)
            return;
        const convertAmountBN = convertTokensToWei({
            value: selectedToken.balance,
            token: selectedToken,
        }).toFixed();
        try {
            setApprovalStatus("pending");
            const erc20Contract = new ethers.Contract(selectedToken.contractAddress, erc20ABI, signer);
            const approvalTx = await erc20Contract.approve(bridgeAddress, convertAmountBN, {
                gasLimit: 500000,
            });
            const approvalReceipt = await approvalTx.wait();
            console.log(approvalReceipt, "approvalReceipt");
            setApprovalStatus("success");
            setTimeout(() => {
                nextStep();
            }, 2000);
        }
        catch (err) {
            setApprovalStatus("error");
            console.error(err);
        }
    };
    const isLoading = approvalStatus === "pending";
    const isSuccess = approvalStatus === "success";
    const isError = approvalStatus === "error";
    return (jsxs("div", { children: [jsx(StepTitle, { children: "Token Allowance: Empowering Controlled Asset Transfers" }), jsx(StepDescription, { style: { marginBottom: 30 }, children: "Allow the smart contract to spend the specified amount of tokens on your behalf, enabling the unwrapping process from the Sidechain to the L1 chain." }), isLoading && (jsxs(SpinnerWrapper, { children: [jsx(Spinner$1, {}), jsx("span", { children: "Approving token allowance" })] })), isError && jsx(ErrorMessage, { role: "alert", children: "Ups, something went wrong." }), isSuccess && (jsxs(SpinnerWrapper, { children: [jsx(CheckCircle2, {}), jsx("span", { children: "You've successfully approved the bridge to spend your tokens." })] })), jsx(Button, { variant: "primary", onClick: onTokenAllowance, children: "Grant token allowance" })] }));
};

const reserveCoinAddress = "0x66c34c454f8089820c44e0785ee9635c425c9128";
const TransactionStepper = ({ contractAddress = reserveCoinAddress, // TODO
 }) => {
    const { nextStep, prevStep, activeStep } = useStepper({
        initialStep: 0,
    });
    const { setOpen } = useContext();
    const [value, setValue] = useState("loading");
    const steps = [
        {
            label: "Cardano Wrapping",
            children: (jsx(WrapStep
            // TODO: hardcoded for now
            , { 
                // TODO: hardcoded for now
                defaultTokenUnit: "lovelace", defaultAmountEth: "30", nextStep: nextStep })),
        },
        { label: "Action Execution", children: jsx(ActionExecutionStep, { nextStep: nextStep }) },
        {
            label: "Token Allowance",
            children: jsx(TokenAllowanceStep, { nextStep: nextStep, contractAddress: contractAddress }),
        },
        { label: "Milkomeda Unwrapping", children: jsx(UnwrapStep, { contractAddress: contractAddress }) },
    ];
    return (jsxs(StepperTransactionContainer, { children: [jsx(Stepper, { activeStep: activeStep, successIcon: jsx(CheckCircle2, {}), errorIcon: jsx(XCircle, {}), labelOrientation: "vertical", state: value, children: steps.map((step, index) => (jsx(StepperStep, { index: index, ...step, children: jsx(StepperTransactionContent, { children: step.children }) }, index))) }), jsx("div", { children: activeStep === steps.length ? (jsxs(Fragment, { children: [jsx("p", { children: "The entire process has been completed successfully" }), jsx(Button, { onClick: () => {
                                setOpen(false);
                            }, children: "Close" })] })) : null })] }));
};

const Profile = ({ closeModal }) => {
    const context = useContext();
    const { reset } = useConnect$1();
    const { disconnect } = useDisconnect();
    useNetwork();
    const { address, isConnected, connector } = useAccount();
    const [shouldDisconnect, setShouldDisconnect] = useState(false);
    useEffect(() => {
        if (!isConnected)
            context.setOpen(false);
    }, [isConnected]);
    useEffect(() => {
        if (!shouldDisconnect)
            return;
        // Close before disconnecting to avoid layout shifting while modal is still open
        if (closeModal) {
            closeModal();
        }
        else {
            context.setOpen(false);
        }
        return () => {
            disconnect();
            reset();
        };
    }, [shouldDisconnect, disconnect, reset]);
    return (jsx(MainPageContent, { children: jsx(ModalContent, { style: { paddingBottom: 22, gap: 6, marginBottom: 40 }, children: jsx(ModalBody, { children: jsx(TransactionStepper, {}) }) }) }));
};

const ConnectModal = () => {
    const context = useContext();
    const { isConnected } = useAccount();
    const { chain } = useNetwork();
    //if chain is unsupported we enforce a "switch chain" prompt
    const closeable = !(chain === null || chain === void 0 ? void 0 : chain.unsupported);
    const showBackButton = closeable && context.route !== routes.CONNECTORS && context.route !== routes.PROFILE;
    const onBack = () => {
        if (context.route === routes.DOWNLOAD) {
            context.setRoute(routes.CONNECT);
        }
        else {
            context.setRoute(routes.CONNECTORS);
        }
    };
    const pages = {
        onboarding: jsx(Introduction, {}),
        download: jsx(DownloadApp, { connectorId: context.connector }),
        connectors: jsx(Wallets, {}),
        mobileConnectors: jsx(MobileConnectors, {}),
        connect: jsx(ConnectUsing, { connectorId: context.connector }),
        profile: jsx(Profile, {}),
    };
    function hide() {
        context.setOpen(false);
    }
    useEffect(() => {
        if (isConnected) {
            if (context.route !== routes.PROFILE) {
                hide(); // Hide on connect
            }
        }
        else {
            hide(); // Hide on connect
        }
    }, [isConnected]);
    return (jsx(Modal, { open: context.open, pages: pages, pageId: context.route, onClose: closeable ? hide : undefined, onInfo: undefined, onBack: showBackButton ? onBack : undefined }));
};

const useConnectCallback = ({ onConnect, onDisconnect }) => {
    useAccount({
        onConnect: ({ address, connector, isReconnected }) => {
            if (!isReconnected) {
                onConnect === null || onConnect === void 0 ? void 0 : onConnect({
                    address: address,
                    connectorId: connector === null || connector === void 0 ? void 0 : connector.id,
                });
            }
        },
        onDisconnect: () => onDisconnect === null || onDisconnect === void 0 ? void 0 : onDisconnect(),
    });
};

const routes = {
    ONBOARDING: "onboarding",
    CONNECTORS: "connectors",
    MOBILECONNECTORS: "mobileConnectors",
    CONNECT: "connect",
    DOWNLOAD: "download",
    PROFILE: "profile",
};
const Context = createContext(null);
const ConnectWSCProvider = ({ children, onConnect, onDisconnect, debugMode = false, }) => {
    // Only allow for mounting ConnectKitProvider once, so we avoid weird global
    // state collisions.
    if (React__default.useContext(Context)) {
        throw new Error("Multiple, nested usages of ConnectWSCProvider detected. Please use only one.");
    }
    useConnectCallback({
        onConnect,
        onDisconnect,
    });
    // if (typeof window !== "undefined") {
    // Buffer Polyfill, needed for bundlers that don't provide Node polyfills (e.g CRA, Vite, etc.)
    // window.Buffer = window.Buffer ?? Buffer;
    // Some bundlers may need `global` and `process.env` polyfills as well
    // Not implemented here to avoid unexpected behaviors, but leaving example here for future reference
    /*
     * window.global = window.global ?? window;
     * window.process = window.process ?? { env: {} };
     */
    // }
    const [open, setOpen] = useState(false);
    const [connector, setConnector] = useState("");
    const [route, setRoute] = useState(routes.CONNECTORS);
    const [errorMessage, setErrorMessage] = useState("");
    // wsc connector
    const { connector: activeConnector } = useAccount();
    const [wscProvider, setWscProvider] = React__default.useState(null);
    const [originTokens, setOriginTokens] = useState([]);
    const [tokens, setTokens] = useState([]);
    const [destinationBalance, setDestinationBalance] = useState(null);
    const [stargateInfo, setStargateInfo] = useState(null);
    useState(null);
    useState([]);
    useState(null);
    useState(null);
    useState([]);
    useState(false);
    useState(false);
    useState(null);
    useEffect(() => {
        var _a;
        if (!((_a = activeConnector === null || activeConnector === void 0 ? void 0 : activeConnector.id) === null || _a === void 0 ? void 0 : _a.includes("wsc")))
            return;
        const loadWscProvider = async () => {
            try {
                const provider = await activeConnector.getProvider();
                if (!provider)
                    return;
                const originTokens = await provider.origin_getTokenBalances();
                const tokenBalances = await provider.getTokenBalances();
                const destinationBalance = await provider.eth_getBalance();
                const stargate = await provider.stargateObject();
                setWscProvider(provider);
                setOriginTokens(originTokens);
                setTokens(tokenBalances !== null && tokenBalances !== void 0 ? tokenBalances : []);
                setDestinationBalance(destinationBalance);
                setStargateInfo(stargate);
            }
            catch (e) {
                console.log(e);
            }
        };
        loadWscProvider();
    }, [activeConnector, wscProvider]);
    useEffect(() => setErrorMessage(null), [route, open]);
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const log = debugMode ? console.log : () => { };
    const value = {
        open,
        setOpen,
        route,
        setRoute,
        connector,
        setConnector,
        onConnect,
        // wsc provider
        wscProvider,
        originTokens,
        stargateInfo,
        tokens,
        // Other configuration
        errorMessage,
        debugMode,
        log,
        displayError: (message, code) => {
            setErrorMessage(message);
            console.log("---------CONNECTWSC DEBUG---------");
            console.log(message);
            if (code)
                console.table(code);
            console.log("---------/CONNECTWSC DEBUG---------");
        },
    };
    return createElement(Context.Provider, { value }, jsx(Fragment, { children: jsxs(ThemeProvider, { theme: defaultTheme$1, children: [children, jsx(ConnectModal, {})] }) }));
};
const useContext = () => {
    const context = React__default.useContext(Context);
    if (!context)
        throw Error("ConnectWSC Hook must be inside a Provider.");
    return context;
};

const safeRoutes = {
    disconnected: [routes.CONNECTORS, routes.ONBOARDING, routes.MOBILECONNECTORS, routes.ONBOARDING],
    connected: [routes.PROFILE],
};
const allRoutes = [...safeRoutes.connected, ...safeRoutes.disconnected];
const useModal = ({ onConnect, onDisconnect } = {}) => {
    const context = useContext();
    useConnectCallback({
        onConnect,
        onDisconnect,
    });
    const { isConnected } = useAccount();
    const close = () => {
        context.setOpen(false);
    };
    const open = () => {
        context.setOpen(true);
    };
    const gotoAndOpen = (route) => {
        let validRoute = route;
        if (!allRoutes.includes(route)) {
            validRoute = isConnected ? routes.PROFILE : routes.CONNECTORS;
            context.log(`Route ${route} is not a valid route, navigating to ${validRoute} instead.`);
        }
        else {
            if (isConnected) {
                if (!safeRoutes.connected.includes(route)) {
                    validRoute = routes.PROFILE;
                    context.log(`Route ${route} is not a valid route when connected, navigating to ${validRoute} instead.`);
                }
            }
            else {
                if (!safeRoutes.disconnected.includes(route)) {
                    validRoute = routes.CONNECTORS;
                    context.log(`Route ${route} is not a valid route when disconnected, navigating to ${validRoute} instead.`);
                }
            }
        }
        context.setRoute(validRoute);
        open();
    };
    return {
        open: context.open,
        setOpen: (show) => {
            if (show) {
                gotoAndOpen(isConnected ? routes.PROFILE : routes.CONNECTORS);
            }
            else {
                close();
            }
        },
        // Disconnected Routes
        openOnboarding: () => gotoAndOpen(routes.ONBOARDING),
        // Connected Routes
        openProfile: () => gotoAndOpen(routes.PROFILE),
    };
};

function useIsMounted() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    return mounted;
}

const TextContainer = styled(motion.div) `
  top: 0;
  bottom: 0;
  left: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
`;
styled(motion.div) `
  position: relative;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  overflow: hidden;
  svg {
    display: block;
  }
`;
const IconContainer = styled(motion.div) `
  pointer-events: none;
  user-select: none;
  position: relative;
  width: 24px;
  height: 24px;
  margin-right: 8px;
`;
const UnsupportedNetworkContainer = styled(motion.div) `
  z-index: 1;
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100%;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.02);
  background: var(--ck-body-color-danger, red);
  color: #fff;
  svg {
    display: block;
    position: relative;
    top: -1px;
  }
`;

const KnownChain = ({ testnet, ...props }) => (jsxs("svg", { ...props, "aria-hidden": "true", width: "44", height: "44", viewBox: "0 0 44 44", fill: "none", xmlns: "http://www.w3.org/2000/svg", style: {
        background: testnet
            ? 'linear-gradient(180deg, #8995A9 0%, #424D5F 99.48%)'
            : 'black',
    }, children: [jsx("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M20.5611 8.12948C21.0082 7.90729 21.5007 7.79167 22 7.79167C22.4993 7.79167 22.9919 7.90729 23.439 8.12948L23.4408 8.1304L33.0387 12.9293C33.577 13.197 34.031 13.61 34.3478 14.121C34.6649 14.6323 34.833 15.2218 34.8333 15.8234V27.2595C34.833 27.8611 34.6649 28.4511 34.3478 28.9624C34.031 29.4733 33.578 29.8858 33.0398 30.1535L23.4411 34.9528C22.9919 35.1775 22.4963 35.2947 21.994 35.2947C21.4918 35.2947 20.9964 35.1777 20.5472 34.9529L10.9475 30.1531L10.9452 30.1519C10.4071 29.8808 9.95535 29.4646 9.6411 28.9504C9.32739 28.437 9.16312 27.8464 9.16673 27.2448L9.16675 27.2417L10.0004 27.2475H9.16673V27.2448V15.8239C9.16705 15.2223 9.33518 14.6322 9.65222 14.121C9.96906 13.61 10.4221 13.1976 10.9604 12.9298L20.5592 8.1304L20.5611 8.12948ZM21.3031 9.62267L11.8706 14.3389L22 19.4036L32.1294 14.3389L22.697 9.62267C22.4806 9.51531 22.2416 9.45905 22 9.45905C21.7585 9.45905 21.5194 9.51534 21.3031 9.62267ZM10.8341 15.8241C10.8341 15.7785 10.8362 15.733 10.8401 15.6878L21.1663 20.8509V33.3983L11.6955 28.6629C11.4352 28.5315 11.2159 28.3297 11.0638 28.0809C10.9116 27.8318 10.8321 27.5452 10.8341 27.2533L10.8341 27.2475V15.8241ZM22.8337 33.3923L32.2967 28.6608C32.5576 28.5312 32.7772 28.3313 32.9308 28.0836C33.0844 27.836 33.1658 27.5504 33.166 27.259V15.8243C33.1659 15.7786 33.1639 15.7331 33.1599 15.6878L22.8337 20.8509V33.3923Z", fill: "url(#paint0_linear_3546_7073)" }), jsx("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M10.8341 15.8241C10.8341 15.7785 10.8362 15.733 10.8401 15.6878L21.1663 20.8509V33.3983L11.6955 28.6629C11.4352 28.5315 11.2159 28.3297 11.0638 28.0809C10.9116 27.8318 10.8321 27.5452 10.8341 27.2533L10.8341 27.2475V15.8241Z", fill: "url(#paint1_linear_3546_7073)", fillOpacity: "0.3" }), jsxs("defs", { children: [jsxs("linearGradient", { id: "paint0_linear_3546_7073", x1: "22", y1: "7.79167", x2: "22", y2: "35.2947", gradientUnits: "userSpaceOnUse", children: [jsx("stop", { stopColor: "white" }), jsx("stop", { offset: "1", stopColor: "white", stopOpacity: "0.7" })] }), jsxs("linearGradient", { id: "paint1_linear_3546_7073", x1: "22", y1: "7.79167", x2: "22", y2: "35.2947", gradientUnits: "userSpaceOnUse", children: [jsx("stop", { stopColor: "white" }), jsx("stop", { offset: "1", stopColor: "white", stopOpacity: "0.7" })] })] })] }));
const UnknownChain = ({ testnet, ...props }) => {
    return jsx(KnownChain, { testnet: true, ...props });
};
const Ethereum = ({ testnet, ...props }) => {
    let bg = 'var(--ck-chain-ethereum-01, #25292E)';
    let fill = 'var(--ck-chain-ethereum-02, #ffffff)';
    if (testnet) {
        bg = 'linear-gradient(180deg, #8995A9 0%, #424D5F 99.48%)';
        fill = '#fff';
    }
    return (jsxs("svg", { ...props, "aria-hidden": "true", width: "44", height: "44", viewBox: "0 0 44 44", fill: "none", xmlns: "http://www.w3.org/2000/svg", style: {
            background: bg,
        }, children: [jsx("path", { d: "M21.9967 6.99621L21.7955 7.67987V27.5163L21.9967 27.7171L31.2044 22.2744L21.9967 6.99621Z", fill: fill }), jsx("path", { d: "M21.9957 6.99621L12.7878 22.2744L21.9957 27.7171V18.0891V6.99621Z", fill: fill }), jsx("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M21.9959 36.9996L21.9959 36.9997V36.9995L31.2091 24.0243L21.9959 29.4642L12.788 24.0243L21.9957 36.9993L21.9958 36.9997L21.9959 36.9996Z", fill: fill }), jsx("path", { d: "M21.996 27.7181L31.2037 22.2753L21.996 18.09V27.7181Z", fill: fill }), jsx("path", { d: "M12.7878 22.2753L21.9957 27.7181V18.09L12.7878 22.2753Z", fill: fill })] }));
};
const Polygon = ({ testnet, ...props }) => (jsx("svg", { ...props, "aria-hidden": "true", width: "44", height: "44", viewBox: "0 0 44 44", fill: "none", xmlns: "http://www.w3.org/2000/svg", style: {
        background: testnet
            ? 'linear-gradient(180deg, #8995A9 0%, #424D5F 99.48%)'
            : '#6F41D8',
    }, children: jsx("path", { d: "M29.0015 17.4529C28.4941 17.1572 27.8355 17.1572 27.2773 17.4529L23.3186 19.7271L20.6305 21.2094L16.6719 23.4822C16.1645 23.7792 15.5059 23.7792 14.9476 23.4822L11.8016 21.703C11.2943 21.4074 10.9395 20.8642 10.9395 20.2702V16.7612C10.9395 16.1686 11.2434 15.6255 11.8016 15.3285L14.8954 13.5988C15.4041 13.3018 16.0641 13.3018 16.6224 13.5988L19.7161 15.3285C20.2249 15.6255 20.5796 16.1686 20.5796 16.7612V19.0355L23.2678 17.5024V15.2295C23.2707 14.9343 23.1917 14.6441 23.0395 14.3911C22.8873 14.1381 22.6679 13.9324 22.4056 13.7968L16.6719 10.5353C16.1645 10.2382 15.5059 10.2382 14.9476 10.5353L9.11214 13.7968C8.84992 13.9324 8.63049 14.1381 8.47828 14.3911C8.32607 14.6441 8.24705 14.9343 8.25002 15.2295V21.802C8.25002 22.396 8.55389 22.9391 9.11214 23.2361L14.9476 26.4976C15.455 26.7932 16.115 26.7932 16.6719 26.4976L20.6305 24.2729L23.3186 22.7411L27.2773 20.5177C27.7846 20.2207 28.4433 20.2207 29.0015 20.5177L32.0966 22.2475C32.6054 22.5431 32.9588 23.0863 32.9588 23.6803V27.1893C32.9588 27.7819 32.6563 28.325 32.0966 28.622L29.0029 30.4013C28.4941 30.6983 27.8341 30.6983 27.2773 30.4013L24.1821 28.6715C23.6734 28.3745 23.3186 27.8314 23.3186 27.2387V24.9645L20.6305 26.4976V28.7705C20.6305 29.3631 20.9344 29.9076 21.4926 30.2032L27.3281 33.4647C27.8355 33.7617 28.4941 33.7617 29.0524 33.4647L34.8879 30.2032C35.3953 29.9076 35.75 29.3645 35.75 28.7705V22.198C35.753 21.9028 35.674 21.6126 35.5218 21.3596C35.3695 21.1066 35.1501 20.9009 34.8879 20.7653L29.0029 17.4529H29.0015Z", fill: "white" }) }));
const Optimism = ({ testnet, ...props }) => (jsxs("svg", { ...props, "aria-hidden": "true", width: "44", height: "44", viewBox: "0 0 44 44", fill: "none", xmlns: "http://www.w3.org/2000/svg", style: {
        background: testnet
            ? 'linear-gradient(180deg, #8995A9 0%, #424D5F 99.48%)'
            : '#FF0420',
    }, children: [jsx("path", { d: "M15.5877 27.8473C14.2777 27.8473 13.2045 27.539 12.3679 26.9226C11.5422 26.2952 11.1294 25.4035 11.1294 24.2477C11.1294 24.0055 11.157 23.7082 11.212 23.356C11.3552 22.5634 11.5588 21.6112 11.823 20.4994C12.5715 17.4722 14.5034 15.9586 17.6187 15.9586C18.4664 15.9586 19.2259 16.1017 19.8974 16.3879C20.5689 16.663 21.0973 17.0814 21.4826 17.6428C21.8678 18.1932 22.0605 18.8537 22.0605 19.6242C22.0605 19.8554 22.033 20.1471 21.9779 20.4994C21.8128 21.4791 21.6146 22.4313 21.3835 23.356C20.9982 24.8641 20.3322 25.9924 19.3855 26.741C18.4388 27.4785 17.1729 27.8473 15.5877 27.8473ZM15.8189 25.4695C16.4354 25.4695 16.9582 25.2879 17.3876 24.9247C17.8279 24.5614 18.1416 24.0055 18.3287 23.257C18.5819 22.2222 18.7746 21.3195 18.9067 20.5489C18.9507 20.3178 18.9727 20.0811 18.9727 19.8389C18.9727 18.8372 18.4498 18.3363 17.4041 18.3363C16.7876 18.3363 16.2592 18.5179 15.8189 18.8812C15.3896 19.2445 15.0813 19.8004 14.8943 20.5489C14.6961 21.2865 14.4979 22.1892 14.2998 23.257C14.2557 23.477 14.2337 23.7082 14.2337 23.9504C14.2337 24.9632 14.7622 25.4695 15.8189 25.4695Z", fill: "white" }), jsx("path", { d: "M22.8188 27.6815C22.6977 27.6815 22.6041 27.6429 22.5381 27.5659C22.483 27.4778 22.4665 27.3788 22.4885 27.2687L24.7672 16.5358C24.7892 16.4147 24.8498 16.3156 24.9489 16.2385C25.0479 16.1615 25.1525 16.1229 25.2626 16.1229H29.6548C30.8767 16.1229 31.8564 16.3761 32.5939 16.8825C33.3426 17.3889 33.7168 18.1209 33.7168 19.0786C33.7168 19.3538 33.6838 19.64 33.6177 19.9372C33.3426 21.2032 32.7867 22.1389 31.95 22.7443C31.1244 23.3498 29.9905 23.6525 28.5485 23.6525H26.3194L25.5598 27.2687C25.5377 27.3898 25.4772 27.4888 25.3782 27.5659C25.2791 27.6429 25.1745 27.6815 25.0645 27.6815H22.8188ZM28.6641 21.3738C29.1264 21.3738 29.5282 21.2472 29.8695 20.994C30.2217 20.7408 30.4529 20.3776 30.563 19.9042C30.596 19.717 30.6125 19.552 30.6125 19.4089C30.6125 19.0896 30.519 18.8474 30.3318 18.6823C30.1446 18.5062 29.8255 18.4182 29.3741 18.4182H27.3926L26.7652 21.3738H28.6641Z", fill: "white" })] }));
const Arbitrum = ({ testnet, ...props }) => {
    const fill = testnet ? '#ffffff' : '#28A0F0';
    const outlineFill = testnet ? '#ffffff' : '#96BEDC';
    return (jsxs("svg", { ...props, "aria-hidden": "true", width: "44", height: "44", viewBox: "0 0 44 44", fill: "none", xmlns: "http://www.w3.org/2000/svg", style: {
            background: testnet
                ? 'linear-gradient(180deg, #8995A9 0%, #424D5F 99.48%)'
                : '#2C364F',
        }, children: [!testnet && (jsx("path", { d: "M25.7948 20.5826L28.2683 16.3854L34.9355 26.7696L34.9386 28.7625L34.9168 15.0491C34.9011 14.7137 34.7231 14.407 34.4391 14.2261L22.4357 7.32182C22.1551 7.1838 21.7989 7.18546 21.5187 7.32618C21.4807 7.34524 21.4453 7.36576 21.4113 7.38835L21.3694 7.41467L9.71816 14.1664L9.67298 14.1871C9.61474 14.2137 9.55609 14.2479 9.50076 14.2872C9.27983 14.4456 9.1331 14.68 9.08564 14.9425C9.07859 14.9823 9.0732 15.023 9.07092 15.064L9.08916 26.239L15.2994 16.6138C16.0811 15.3376 17.7847 14.9262 19.3662 14.9488L21.2221 14.9977L10.2862 32.5356L11.5753 33.2778L22.6422 15.0155L27.5338 14.9977L16.4956 33.7209L21.0955 36.3668L21.6451 36.6827C21.8776 36.7772 22.1516 36.7819 22.386 36.6972L34.5581 29.6433L32.2309 30.9918L25.7948 20.5826ZM26.7384 34.175L22.0925 26.8829L24.9287 22.0702L31.0303 31.6876L26.7384 34.175Z", fill: '#2D374B' })), jsx("path", { d: "M22.0924 26.8832L26.7385 34.1751L31.0302 31.6879L24.9286 22.0705L22.0924 26.8832Z", fill: fill }), jsx("path", { d: "M34.9387 28.7627L34.9356 26.7698L28.2684 16.3856L25.7949 20.5828L32.2312 30.992L34.5584 29.6435C34.7866 29.4582 34.9248 29.1861 34.9393 28.8926L34.9387 28.7627Z", fill: fill }), jsx("path", { d: "M7 30.642L10.2863 32.5356L21.2222 14.9976L19.3663 14.9487C17.785 14.9263 16.0814 15.3375 15.2995 16.6137L9.08927 26.239L7 29.449V30.642V30.642Z", fill: "white" }), jsx("path", { d: "M27.534 14.9977L22.6423 15.0155L11.5754 33.2778L15.4437 35.5049L16.4955 33.7209L27.534 14.9977Z", fill: "white" }), jsx("path", { d: "M37 14.9723C36.9592 13.9493 36.4052 13.013 35.5377 12.4677L23.377 5.47434C22.5187 5.04223 21.4466 5.04161 20.5868 5.47414C20.4852 5.52533 8.76078 12.3251 8.76078 12.3251C8.5985 12.4029 8.44224 12.4955 8.2953 12.6008C7.52081 13.156 7.0487 14.0186 7 14.9661V29.4492L9.08927 26.2392L9.07103 15.0639C9.07352 15.0231 9.0787 14.9827 9.08575 14.9431C9.133 14.6801 9.27994 14.4457 9.50086 14.2872C9.5562 14.2478 21.4806 7.34517 21.5186 7.32611C21.799 7.18538 22.155 7.18373 22.4356 7.32175L34.439 14.226C34.723 14.4069 34.901 14.7137 34.9167 15.049V28.8921C34.9022 29.1856 34.7862 29.4577 34.558 29.643L32.2308 30.9916L31.03 31.6875L26.7383 34.1747L22.3859 36.6969C22.1515 36.7817 21.8773 36.7769 21.645 36.6824L16.4955 33.7206L15.4435 35.5046L20.0713 38.169C20.2243 38.256 20.3607 38.3331 20.4726 38.3961C20.6458 38.4933 20.764 38.5582 20.8056 38.5785C21.1345 38.7383 21.6077 38.8311 22.0342 38.8311C22.4251 38.8311 22.8064 38.7594 23.1672 38.6181L35.8092 31.2971C36.5347 30.7348 36.9617 29.8869 37 28.9686V14.9723Z", fill: outlineFill })] }));
};
const Telos = ({ testnet, ...props }) => (jsx("svg", { ...props, "aria-hidden": "true", width: "44", height: "44", viewBox: "0 0 44 44", fill: "none", xmlns: "http://www.w3.org/2000/svg", style: {
        background: testnet
            ? 'linear-gradient(180deg, #8995A9 0%, #424D5F 99.48%)'
            : '#571AFF',
    }, children: jsx("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M26.1834 8.14754C25.6606 8.23504 25.3644 8.50235 24.9216 9.28591C24.5651 9.91722 24.4762 10.0244 24.2024 10.1592L23.9832 10.2668L19.2967 10.286L14.6097 10.3057L14.3875 10.3902C13.7059 10.6492 13.6192 10.7135 11.6291 12.4407C9.72243 14.0953 9.64893 14.1723 9.59249 14.5836C9.54437 14.9362 9.78981 15.6327 10.5191 17.2143C11.2847 18.8737 11.2839 18.8641 10.7444 19.5256C10.2645 20.1136 10.2269 20.2588 10.2041 21.5915C10.1717 23.502 10.2487 27.6023 10.3222 27.8591C10.3572 27.9816 10.7908 29.204 11.2861 30.5755C11.7813 31.9471 12.4192 33.715 12.704 34.5038C13.4281 36.5107 13.4814 36.5986 14.0392 36.7237C14.3066 36.7837 14.3206 36.781 18.9677 35.7258C24.4395 34.4837 23.7264 34.709 25.0739 33.7968C29.8732 30.5475 29.7337 30.66 29.8969 29.9083C30.0583 29.1642 30.1082 29.1379 31.8267 28.8999C34.6122 28.5145 34.6328 28.5083 34.8831 28.0109C35.0182 27.7423 35.7786 23.3406 35.8136 22.6209C35.8504 21.8828 36.042 22.221 33.3816 18.3395C30.022 13.4382 30.2381 13.7777 30.2399 13.4041C30.2407 13.1735 30.3366 12.9736 31.3236 11.1418C31.8236 10.2134 32.2742 9.35241 32.3254 9.22904C32.5236 8.74691 32.4204 8.3921 32.0301 8.21622L31.8267 8.12391L29.1102 8.11822C27.6048 8.11516 26.2997 8.12829 26.1834 8.14754ZM30.0474 9.4876C30.5623 9.72297 30.5382 9.82447 29.5119 11.7398C28.4317 13.7558 28.3157 13.2711 30.7154 16.7707C31.639 18.1173 32.8076 19.8218 33.3124 20.5581C34.6844 22.5592 34.6048 22.1799 34.1831 24.6903C33.7858 27.0602 33.7792 27.0817 33.3759 27.282C33.1506 27.394 33.2276 27.3813 30.8493 27.7117C28.9147 27.9803 28.8543 28.017 28.6719 29.0338C28.5778 29.557 28.4606 29.8169 28.2243 30.0247C28.0808 30.1512 24.8682 32.368 23.9451 32.9778C23.2587 33.4311 23.6861 33.3152 17.7471 34.6574C17.1997 34.7812 16.4079 34.9632 15.987 35.0617C14.4588 35.4195 14.4299 35.4033 13.8804 33.8948C12.9188 31.2528 11.6811 27.7957 11.6194 27.5787C11.5534 27.3463 11.549 27.1202 11.549 24.059V20.7878L11.6501 20.5966C11.7056 20.4912 11.8671 20.2759 12.0088 20.118C12.8418 19.19 12.8383 19.1183 11.8601 16.9907C10.7663 14.612 10.6797 14.9992 12.697 13.2501C14.2418 11.91 14.3048 11.8593 14.5905 11.7237L14.8394 11.6055L19.6983 11.5854C23.5417 11.5692 24.5891 11.5543 24.7103 11.515C25.1465 11.3728 25.4086 11.1094 25.7975 10.4203C26.3851 9.38041 26.3111 9.40797 28.4597 9.41891C29.6996 9.42547 29.9332 9.43554 30.0474 9.4876Z", fill: "#F7F5FC" }) }));
const Aurora = ({ testnet, ...props }) => (jsx("svg", { ...props, "aria-hidden": "true", width: "44", height: "44", viewBox: "0 0 44 44", fill: "none", xmlns: "http://www.w3.org/2000/svg", style: {
        background: testnet
            ? 'linear-gradient(180deg, #8995A9 0%, #424D5F 99.48%)'
            : '#6CD544',
    }, children: jsx("path", { d: "M22.0006 7.292C22.6198 7.29004 23.2271 7.46144 23.754 7.7868C24.2808 8.11216 24.706 8.57848 24.9816 9.133L34.3566 27.883C34.611 28.3912 34.7312 28.956 34.7058 29.5238C34.6805 30.0915 34.5103 30.6433 34.2116 31.1268C33.9129 31.6103 33.4956 32.0094 32.9992 32.2861C32.5028 32.5629 31.9439 32.7081 31.3756 32.708H12.6256C12.0573 32.7079 11.4985 32.5626 11.0023 32.2858C10.506 32.009 10.0888 31.6099 9.79022 31.1264C9.49163 30.6429 9.3216 30.0912 9.29628 29.5235C9.27096 28.9558 9.39119 28.3911 9.64556 27.883L19.0196 9.133C19.2951 8.57848 19.7203 8.11216 20.2472 7.7868C20.774 7.46144 21.3814 7.29004 22.0006 7.292ZM22.0006 5C20.9561 4.9999 19.9322 5.29059 19.0437 5.83952C18.1551 6.38846 17.4369 7.17394 16.9696 8.108L7.59456 26.858C7.16544 27.7156 6.96271 28.6687 7.00564 29.6268C7.04856 30.5848 7.33572 31.516 7.83982 32.3318C8.34392 33.1476 9.04823 33.821 9.88584 34.288C10.7235 34.755 11.6666 35.0001 12.6256 35H31.3756C32.3345 34.9999 33.2775 34.7547 34.1149 34.2876C34.9524 33.8206 35.6566 33.1472 36.1606 32.3314C36.6645 31.5156 36.9516 30.5845 36.9945 29.6265C37.0374 28.6686 36.8346 27.7156 36.4056 26.858L27.0316 8.108C26.5642 7.17394 25.846 6.38846 24.9574 5.83952C24.0689 5.29059 23.045 4.9999 22.0006 5Z", fill: "white" }) }));
const Avalanche = ({ testnet, ...props }) => (jsxs("svg", { ...props, "aria-hidden": "true", width: "44", height: "44", viewBox: "0 0 44 44", fill: "none", xmlns: "http://www.w3.org/2000/svg", style: {
        background: testnet
            ? 'linear-gradient(180deg, #8995A9 0%, #424D5F 99.48%)'
            : '#E84142',
    }, children: [jsx("path", { d: "M11.0188 32.1528H15.4825C16.5334 32.1528 17.0589 32.1528 17.5278 32.023C18.042 31.8701 18.511 31.5991 18.9009 31.2261C19.2589 30.885 19.5173 30.4328 20.0269 29.5409L20.0272 29.5404L20.0422 29.5142L25.8314 19.2804C26.3456 18.3821 26.5999 17.93 26.7129 17.4554C26.8372 16.9412 26.8372 16.3988 26.7129 15.8847C26.6007 15.4136 26.3439 14.9648 25.8373 14.0798L25.8258 14.0597L23.56 10.1045C23.0911 9.27958 22.8538 8.86711 22.5543 8.71456C22.2323 8.55071 21.848 8.55071 21.526 8.71456C21.2265 8.86711 20.9892 9.27958 20.5202 10.1045L9.49892 29.5311C9.03561 30.3447 8.80392 30.7517 8.82089 31.0849C8.84349 31.4466 9.02994 31.7743 9.33507 31.9721C9.61756 32.1528 10.0809 32.1528 11.0188 32.1528Z", fill: "white" }), jsx("path", { d: "M33.1506 32.1528H26.7547C25.8111 32.1528 25.3365 32.1528 25.0596 31.9721C24.7545 31.7743 24.5681 31.4411 24.5455 31.0794C24.5286 30.7486 24.7621 30.3456 25.2294 29.539L25.2295 29.5388L25.2404 29.5199L28.4328 24.0392C28.9018 23.2313 29.1391 22.8301 29.4329 22.6776C29.7548 22.5137 30.1336 22.5137 30.4555 22.6776C30.7472 22.8261 30.9744 23.2102 31.4241 23.9708L31.4248 23.9719L31.4613 24.0336L34.665 29.5143C34.6806 29.5413 34.696 29.5678 34.7113 29.5939L34.7113 29.594C35.1554 30.3603 35.382 30.7514 35.3657 31.0739C35.3486 31.4353 35.1566 31.7688 34.8515 31.9666C34.5689 32.1528 34.0942 32.1528 33.1506 32.1528Z", fill: "white" })] }));
const Celo = ({ testnet, ...props }) => (jsx("svg", { ...props, "aria-hidden": "true", width: "44", height: "44", viewBox: "0 0 44 44", fill: "none", xmlns: "http://www.w3.org/2000/svg", style: {
        background: testnet
            ? 'linear-gradient(180deg, #8995A9 0%, #424D5F 99.48%)'
            : '#FCFE72',
    }, children: jsx("path", { d: "M9 9H34.5183V18.112H30.3564C28.896 14.7687 25.6102 12.4171 21.777 12.4171C16.593 12.4171 12.3948 16.6422 12.3948 21.823C12.3948 27.0039 16.593 31.2654 21.777 31.2654C25.5373 31.2654 28.8231 28.9876 30.2829 25.7172H34.5178V34.682H9V9Z", fill: testnet ? '#ffffff' : 'black' }) }));
const Gnosis = ({ testnet, ...props }) => (jsx("svg", { ...props, "aria-hidden": "true", width: "44", height: "44", viewBox: "0 0 44 44", fill: "none", xmlns: "http://www.w3.org/2000/svg", style: {
        background: testnet
            ? 'linear-gradient(180deg, #8995A9 0%, #424D5F 99.48%)'
            : '#009CB4',
    }, children: jsx("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M12.3439 11.8664C17.9374 6.53462 26.7953 6.74397 32.1271 12.3374C32.4738 12.7038 32.8075 13.0832 33.1084 13.4823L22 24.5972L10.8916 13.4823C11.1991 13.0832 11.5262 12.7038 11.8729 12.3374C12.0234 12.1804 12.1804 12.0234 12.3439 11.8664ZM30.6094 13.3972C28.3196 11.0944 25.271 9.83182 22 9.83182C18.729 9.83182 15.6804 11.0944 13.3907 13.3972L22 22.0066L30.6094 13.3972ZM33.9785 14.7446L31.7215 17.0016C33.5402 19.1801 33.2523 22.425 31.0738 24.2437C29.1636 25.84 26.3897 25.84 24.4794 24.2437L22 26.7231L19.5271 24.2502C17.3486 26.0689 14.1037 25.7811 12.285 23.6026C10.6888 21.6923 10.6888 18.9185 12.285 17.0082L11.1271 15.8502L10.028 14.7446C8.7 16.9297 8 19.4418 8 21.9998C8 29.7325 14.2673 35.9998 22 35.9998C29.7327 35.9998 36 29.7325 36 21.9998C36.0065 19.4418 35.3 16.9297 33.9785 14.7446ZM30.6486 18.0747C31.1392 18.7093 31.4075 19.4943 31.4075 20.299C31.4075 21.1037 31.1392 21.8887 30.6486 22.5233C29.4187 24.113 27.1355 24.4074 25.5458 23.1775L30.6486 18.0747ZM18.4542 23.1839C17.8196 23.6745 17.0346 23.9427 16.2299 23.9427C15.4252 23.9427 14.6467 23.6745 14.0056 23.1904C12.4159 21.9605 12.1215 19.6708 13.3514 18.0811L18.4542 23.1839Z", fill: "white" }) }));
const Evmos = ({ testnet, ...props }) => (jsx("svg", { ...props, "aria-hidden": "true", width: "44", height: "44", viewBox: "0 0 44 44", fill: "none", xmlns: "http://www.w3.org/2000/svg", style: {
        background: testnet
            ? 'linear-gradient(180deg, #8995A9 0%, #424D5F 99.48%)'
            : '#2D2A25',
    }, children: jsx("path", { d: "M18.4916 12.6668C12.9416 14.806 12.4332 20.2846 10.8418 22.8432C9.23155 25.4322 5.54251 26.8607 6.04698 28.1801C6.55143 29.4994 10.2449 28.0824 13.1669 28.9242C16.0543 29.7561 20.0831 33.4862 25.633 31.3469C28.4603 30.2573 30.5076 28.0143 31.449 25.3574C31.5502 25.0723 31.361 24.7673 31.0606 24.7391C30.874 24.7215 30.6948 24.8196 30.6106 24.9877C29.759 26.6908 28.2981 28.0934 26.3864 28.8301C23.2303 30.0465 19.777 29.0915 17.6562 26.6961C17.1746 26.1522 16.7626 25.533 16.4374 24.8487C16.348 24.6603 16.2629 24.4689 16.1875 24.2708C16.1117 24.0728 16.0473 23.8735 15.9881 23.6732C17.6562 22.8925 19.5812 22.0656 21.7635 21.2246C23.903 20.3999 25.8505 19.731 27.5841 19.1958C28.7571 18.8341 29.8322 18.5331 30.8029 18.2871C30.8732 18.2695 30.9423 18.2519 31.0112 18.2347C31.158 18.1982 31.3088 18.2769 31.363 18.4186L31.364 18.4213C31.396 18.5053 31.4236 18.5898 31.4535 18.6743C31.6453 19.2196 31.7892 19.7706 31.8841 20.3229C31.9258 20.5645 32.1888 20.6961 32.4044 20.5799C33.2014 20.1504 33.9302 19.7314 34.5814 19.3283C37.0083 17.8276 38.3538 16.5549 38.0776 15.8336C37.802 15.1119 35.9541 15.0705 33.1503 15.5854C32.2593 15.7491 31.2716 15.9691 30.207 16.2416C30.0229 16.2886 29.8365 16.3375 29.6481 16.3877C28.7522 16.6262 27.8073 16.8995 26.8234 17.2053C24.9936 17.7744 23.0305 18.4561 21.0038 19.2372C19.1078 19.9682 17.3109 20.726 15.6629 21.4812C15.6428 18.2761 17.5725 15.2461 20.7286 14.0297C22.6399 13.293 24.6605 13.3533 26.4285 14.0473C26.6029 14.116 26.8015 14.0684 26.9291 13.9298C27.1331 13.7076 27.0706 13.3537 26.8053 13.2094C24.3353 11.8685 21.319 11.5771 18.4916 12.6668Z", fill: "#FAF1E4" }) }));
const BinanceSmartChain = ({ testnet, ...props }) => (jsxs("svg", { ...props, "aria-hidden": "true", width: "44", height: "44", viewBox: "0 0 44 44", fill: "none", xmlns: "http://www.w3.org/2000/svg", style: {
        background: testnet
            ? 'linear-gradient(180deg, #8995A9 0%, #424D5F 99.48%)'
            : '#16181A',
    }, children: [jsx("path", { d: "M16.0445 19.6063L21.8705 13.7805L27.6996 19.6093L31.0896 16.2193L21.8705 7L12.6545 16.2163L16.0445 19.6063Z", fill: testnet ? '#fff' : '#F3BA2F' }), jsx("path", { d: "M13.6505 21.9995L10.2606 18.6096L6.87046 21.9997L10.2604 25.3896L13.6505 21.9995Z", fill: testnet ? '#fff' : '#F3BA2F' }), jsx("path", { d: "M16.0445 24.3937L21.8705 30.2195L27.6994 24.3909L31.0913 27.779L31.0896 27.7809L21.8705 37L12.6542 27.7839L12.6495 27.7792L16.0445 24.3937Z", fill: testnet ? '#fff' : '#F3BA2F' }), jsx("path", { d: "M33.4808 25.3911L36.8709 22.001L33.481 18.6111L30.0909 22.0012L33.4808 25.3911Z", fill: testnet ? '#fff' : '#F3BA2F' }), jsx("path", { d: "M25.3091 21.9982H25.3105L21.8705 18.5582L19.3283 21.1004H19.3281L19.0362 21.3926L18.4336 21.9951L18.4289 21.9999L18.4336 22.0048L21.8705 25.4418L25.3105 22.0018L25.3122 21.9999L25.3091 21.9982Z", fill: testnet ? '#fff' : '#F3BA2F' })] }));
const Canto = ({ testnet, ...props }) => (jsx("svg", { ...props, "aria-hidden": "true", width: "44", height: "44", viewBox: "0 0 44 44", fill: "none", xmlns: "http://www.w3.org/2000/svg", style: {
        background: testnet
            ? 'linear-gradient(180deg, #8995A9 0%, #424D5F 99.48%)'
            : 'white',
    }, children: jsx("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M35 8V36H9L13.875 35.9998V31.0586H9V12.9412H13.875V8H35ZM17.9373 12.9414H30.1247V17.8826H17.9373V12.9414ZM30.1247 26.9414H17.9373V17.8826L13.0623 17.8828V26.9416L17.9373 26.9414V31.8826H30.1247V26.9414Z", fill: "#06FC99" }) }));
const Fantom = ({ testnet, ...props }) => (jsx("svg", { ...props, "aria-hidden": "true", width: "44", height: "44", viewBox: "0 0 44 44", fill: "none", xmlns: "http://www.w3.org/2000/svg", style: {
        background: testnet
            ? 'linear-gradient(180deg, #8995A9 0%, #424D5F 99.48%)'
            : '#0911EF',
    }, children: jsx("path", { d: "M20.92 9.25864C21.5933 8.91379 22.6178 8.91379 23.2911 9.25864L30.1616 12.7775C30.5671 12.9852 30.7898 13.2947 30.8297 13.6142H30.8363V31.302C30.8274 31.6504 30.6025 31.9966 30.1616 32.2225L23.2911 35.7413C22.6178 36.0862 21.5933 36.0862 20.92 35.7413L14.0495 32.2225C13.6104 31.9976 13.3997 31.6489 13.3893 31.302C13.3883 31.2678 13.3881 31.2393 13.3891 31.2157L13.3891 13.7278C13.3884 13.7086 13.3883 13.6895 13.3889 13.6705L13.3893 13.6142L13.3924 13.6142C13.4229 13.2912 13.6355 12.9896 14.0495 12.7775L20.92 9.25864ZM29.7547 23.4821L23.2911 26.7926C22.6178 27.1374 21.5933 27.1374 20.92 26.7926L14.4706 23.4895V31.2669L20.92 34.5527C21.2842 34.7415 21.6622 34.9254 22.0318 34.9488L22.1056 34.9512C22.4907 34.9524 22.8646 34.7628 23.2438 34.5833L29.7547 31.2387V23.4821ZM11.3214 31.8437C11.3214 32.5212 11.4026 32.9667 11.5639 33.2806C11.6976 33.5407 11.8981 33.7394 12.2643 33.9813L12.2852 33.9951C12.3656 34.0476 12.4541 34.1026 12.5619 34.1672L12.689 34.2427L13.0792 34.4711L12.5195 35.3685L12.0827 35.1126L12.0093 35.0689C11.883 34.9932 11.7783 34.9284 11.6807 34.8645C10.637 34.1822 10.2478 33.4384 10.2401 31.8907L10.24 31.8437H11.3214ZM21.5647 18.7412C21.5147 18.7579 21.4678 18.7772 21.4251 18.7991L14.5546 22.318C14.5474 22.3216 14.5405 22.3253 14.534 22.3289L14.5281 22.3322L14.5389 22.3382L14.5546 22.3464L21.4251 25.8653C21.4678 25.8872 21.5147 25.9065 21.5647 25.9231V18.7412ZM22.6465 18.7412V25.9231C22.6965 25.9065 22.7433 25.8872 22.7861 25.8653L29.6566 22.3464C29.6638 22.3427 29.6707 22.3391 29.6772 22.3355L29.683 22.3322L29.6722 22.3262L29.6566 22.318L22.7861 18.7991C22.7433 18.7772 22.6965 18.7579 22.6465 18.7412ZM29.7547 14.8689L23.5915 18.0256L29.7547 21.1822V14.8689ZM14.4706 14.8763V21.1749L20.6195 18.0256L14.4706 14.8763ZM22.7861 10.1859C22.4288 10.0029 21.7824 10.0029 21.4251 10.1859L14.5546 13.7048C14.5474 13.7085 14.5405 13.7122 14.534 13.7158L14.5281 13.719L14.5389 13.725L14.5546 13.7333L21.4251 17.2522C21.7824 17.4352 22.4288 17.4352 22.7861 17.2522L29.6566 13.7333C29.6638 13.7296 29.6707 13.7259 29.6772 13.7223L29.683 13.719L29.6722 13.7131L29.6566 13.7048L22.7861 10.1859ZM31.7205 9.64552L32.1573 9.90132L32.2307 9.94503C32.357 10.0206 32.4616 10.0856 32.5593 10.1494C33.603 10.8317 33.9922 11.5756 33.9998 13.1231L34 13.1703H32.9186C32.9186 12.4926 32.8373 12.0472 32.6761 11.7334C32.5424 11.4733 32.3419 11.2745 31.9757 11.0327L31.9547 11.0189C31.8744 10.9664 31.7858 10.9113 31.6781 10.8466L31.551 10.7712L31.1608 10.5428L31.7205 9.64552Z", fill: "white" }) }));
const Filecoin = ({ testnet, ...props }) => (jsx("svg", { ...props, "aria-hidden": "true", width: "44", height: "44", viewBox: "0 0 44 44", fill: "none", xmlns: "http://www.w3.org/2000/svg", style: {
        background: testnet
            ? 'linear-gradient(180deg, #8995A9 0%, #424D5F 99.48%)'
            : '#0090FF',
    }, children: jsx("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M23.75 19.3069L23.15 22.5069L28.85 23.3069L28.45 24.8069L22.85 24.0069C22.45 25.3069 22.25 26.7069 21.75 27.9069C21.25 29.3069 20.75 30.7069 20.15 32.0069C19.35 33.7069 17.95 34.9069 16.05 35.2069C14.95 35.4069 13.75 35.3069 12.85 34.6069C12.55 34.4069 12.25 34.0069 12.25 33.7069C12.25 33.3069 12.45 32.8069 12.75 32.6069C12.95 32.5069 13.45 32.6069 13.75 32.7069C14.05 33.0069 14.35 33.4069 14.55 33.8069C15.15 34.6069 15.95 34.7069 16.75 34.1069C17.65 33.3069 18.15 32.2069 18.45 31.1069C19.05 28.7069 19.65 26.4069 20.15 24.0069V23.6069L14.85 22.8069L15.05 21.3069L20.55 22.1069L21.25 19.0069L15.55 18.1069L15.75 16.5069L21.65 17.3069C21.85 16.7069 21.95 16.2069 22.15 15.7069C22.65 13.9069 23.15 12.1069 24.35 10.5069C25.55 8.90687 26.95 7.90687 29.05 8.00687C29.95 8.00687 30.85 8.30687 31.45 9.00687C31.55 9.10687 31.75 9.30687 31.75 9.50687C31.75 9.90687 31.75 10.4069 31.45 10.7069C31.05 11.0069 30.55 10.9069 30.15 10.5069C29.85 10.2069 29.65 9.90687 29.35 9.60687C28.75 8.80687 27.85 8.70687 27.15 9.40687C26.65 9.90687 26.15 10.6069 25.85 11.3069C25.15 13.4069 24.65 15.6069 23.95 17.8069L29.45 18.6069L29.05 20.1069L23.75 19.3069Z", fill: "white" }) }));
const IoTeX = ({ testnet, ...props }) => (jsxs("svg", { ...props, "aria-hidden": "true", width: "44", height: "44", viewBox: "0 0 44 44", fill: "none", xmlns: "http://www.w3.org/2000/svg", style: {
        background: testnet
            ? 'linear-gradient(180deg, #8995A9 0%, #424D5F 99.48%)'
            : '#00D4D5',
    }, children: [jsx("path", { d: "M23.7136 6.875V14.3784L30.2284 10.6315L23.7136 6.875Z", fill: "white" }), jsx("path", { opacity: "0.9", d: "M30.2284 10.6316V18.135L36.7418 14.3785L30.2284 10.6316Z", fill: "white" }), jsx("path", { opacity: "0.8", d: "M23.7136 14.3784V21.8818L30.2284 18.1349L23.7136 14.3784ZM30.2284 18.1349V25.6383L36.7417 21.8818L30.2284 18.1349Z", fill: "white" }), jsx("path", { opacity: "0.8", d: "M23.7136 21.8817V29.385L30.2284 25.6382L23.7136 21.8817Z", fill: "white" }), jsx("path", { d: "M30.2284 25.6382V33.1416L36.7418 29.3851L30.2284 25.6382Z", fill: "white" }), jsx("path", { opacity: "0.4", d: "M6.87537 14.1253V21.6287L13.3901 17.8722L6.87537 14.1253Z", fill: "white" }), jsx("path", { opacity: "0.2", d: "M15.0938 16.9153V24.4186L21.5975 20.6718L15.0938 16.9153Z", fill: "white" }), jsx("path", { opacity: "0.3", d: "M10.2648 21.6604V29.1638L16.7781 25.4073L10.2648 21.6604Z", fill: "white" }), jsx("path", { opacity: "0.9", d: "M14.5575 27.3226V34.826L21.0612 31.0695L14.5575 27.3226Z", fill: "white" }), jsx("path", { opacity: "0.7", d: "M23.66 30.5525V38.0572L30.1637 34.2993L23.66 30.5525Z", fill: "white" }), jsx("path", { opacity: "0.9", d: "M16.1786 13.2097V20.7145L22.6824 16.9676L16.1786 13.2097Z", fill: "white" }), jsx("path", { opacity: "0.8", d: "M23.7136 6.875V14.3784L17.1989 10.6315L23.7136 6.875Z", fill: "white" }), jsx("path", { opacity: "0.6", d: "M16.1786 10.0649V17.5669L9.66248 13.8104L16.1786 10.0649Z", fill: "white" }), jsx("path", { opacity: "0.6", d: "M22.6934 13.7775V21.2823L16.1786 17.5244L22.6934 13.7775Z", fill: "white" }), jsx("path", { opacity: "0.95", d: "M15.0635 16.9153V24.4186L8.54877 20.6718L15.0635 16.9153Z", fill: "white" }), jsx("path", { opacity: "0.6", d: "M23.7136 21.8817V29.385L17.2099 25.6382L23.7136 21.8817Z", fill: "white" }), jsx("path", { opacity: "0.55", d: "M10.2648 23.6295V31.1328L3.75 27.375L10.2648 23.6295Z", fill: "white" }), jsx("path", { d: "M36.7418 14.3784V21.8818L30.2284 18.1349L36.7418 14.3784Z", fill: "white" }), jsx("path", { opacity: "0.95", d: "M30.2284 18.1362V25.6382L23.7136 21.8817L30.2284 18.1362Z", fill: "white" }), jsx("path", { opacity: "0.9", d: "M36.7418 21.8817V29.385L30.2284 25.6382L36.7418 21.8817Z", fill: "white" }), jsx("path", { opacity: "0.7", d: "M30.2284 25.6382V33.1416L23.7136 29.3851L30.2284 25.6382Z", fill: "white" }), jsx("path", { opacity: "0.4", d: "M22.2712 28.7651V36.2684L15.7579 32.5216L22.2712 28.7651Z", fill: "white" }), jsx("path", { d: "M30.2284 10.6316V18.135L23.7136 14.3785L30.2284 10.6316Z", fill: "white" })] }));
const Metis = ({ testnet, ...props }) => (jsx("svg", { ...props, "aria-hidden": "true", width: "44", height: "44", viewBox: "0 0 44 44", fill: "none", xmlns: "http://www.w3.org/2000/svg", style: {
        background: testnet
            ? 'linear-gradient(180deg, #8995A9 0%, #424D5F 99.48%)'
            : '#2F3140',
    }, children: jsx("path", { d: "M37.5175 22.0531C37.4579 19.2923 36.6563 16.5985 35.1968 14.2542C33.7374 11.91 31.674 10.0017 29.223 8.72965C26.772 7.45759 24.0238 6.86863 21.2668 7.02455C18.5098 7.18047 15.8456 8.07553 13.5537 9.61582C11.2617 11.1561 9.42659 13.2849 8.24079 15.7787C7.05498 18.2725 6.56222 21.0396 6.81419 23.7895C7.06617 26.5394 8.05359 29.1708 9.67288 31.4076C11.2922 33.6444 13.4836 35.4042 16.0173 36.5023C16.7657 35.3775 17.3385 34.1453 17.716 32.848C18.0245 32.0632 18.3595 31.2913 18.7067 30.5446C19.5444 30.7955 20.4345 30.8143 21.282 30.5989C22.1295 30.3835 22.9026 29.942 23.5188 29.3215L23.5704 29.2699C22.8136 28.9884 21.9979 28.9032 21.1993 29.022C20.4006 29.1408 19.6451 29.4598 19.0029 29.9494C19.4276 29.0613 19.891 28.1997 20.3667 27.3632C21.189 27.6541 22.075 27.7156 22.9296 27.541C23.7842 27.3665 24.5751 26.9626 25.2175 26.3726L25.2692 26.3209C24.538 26.0116 23.7416 25.8885 22.9513 25.9626C22.1609 26.0368 21.4013 26.3058 20.7404 26.7456C21.216 25.9608 21.7053 25.1889 22.2203 24.468C23.0713 24.6915 23.9672 24.6777 24.811 24.4282C25.6547 24.1787 26.414 23.703 27.0066 23.0526L27.0453 23.001C26.3425 22.7718 25.5958 22.7106 24.8651 22.8224C24.1344 22.9341 23.4401 23.2157 22.838 23.6444C22.8767 23.5928 22.9283 23.5289 22.9664 23.4773C23.2749 23.0784 23.5969 22.6796 23.9177 22.2936C24.8969 21.9731 25.7703 21.3916 26.4436 20.6117C27.117 19.8318 27.5649 18.883 27.7391 17.8674L27.752 17.79H27.7391C26.7194 18.0552 25.7944 18.6007 25.0689 19.3648C24.3434 20.1288 23.8464 21.0808 23.6343 22.1129C23.3258 22.4859 23.0167 22.8603 22.7211 23.2449C22.9706 22.5925 23.0724 21.893 23.0191 21.1966C22.9657 20.5002 22.7586 19.8243 22.4126 19.2176L22.3739 19.2692C21.8489 19.9862 21.5326 20.8345 21.4599 21.7201C21.3873 22.6058 21.5611 23.4942 21.9621 24.2872C21.4729 24.9823 20.9972 25.6897 20.5467 26.4357C20.6918 25.6858 20.6542 24.9118 20.4369 24.1795C20.2196 23.4471 19.8291 22.7779 19.2985 22.2284L19.2727 22.2929C18.9445 23.1107 18.8477 24.0031 18.9929 24.8723C19.1382 25.7415 19.5199 26.5539 20.0962 27.2205C19.6457 28.0054 19.2211 28.816 18.8093 29.6524C18.9344 28.8712 18.8712 28.0715 18.6251 27.3196C18.3789 26.5677 17.9568 25.8855 17.3939 25.3295L17.3681 25.3941C17.0745 26.2514 17.0201 27.1724 17.2105 28.0583C17.401 28.9442 17.8292 29.7614 18.4492 30.4223C18.1774 31.0012 17.9219 31.5774 17.6773 32.1849C17.61 32.1231 17.5313 32.0751 17.4456 32.0435C17.0066 31.916 16.5867 31.7299 16.1974 31.4904C15.8754 31.2994 15.5337 31.144 15.1781 31.027C13.7886 30.5765 13.9945 29.9079 13.2756 28.5564C13.0416 28.2781 12.7931 28.0125 12.5309 27.7607C12.2876 27.603 12.0884 27.386 11.9519 27.1302C11.7934 26.8107 11.6931 26.4656 11.6557 26.1109C11.6514 25.9148 11.5858 25.7249 11.4681 25.5679C11.3504 25.4109 11.1864 25.2948 10.9993 25.2358C8.95338 24.5284 9.86728 21.8778 9.94406 21.5299C9.91262 21.08 9.81271 20.6375 9.64781 20.2178C9.63057 20.1632 9.61763 20.1073 9.60908 20.0506C9.55449 19.776 9.56444 19.4924 9.63813 19.2223C9.71183 18.9521 9.84726 18.7028 10.0338 18.4939C10.2784 18.2493 11.1277 17.8505 11.3078 17.6188C11.4879 17.387 11.6163 17.1295 11.797 16.9114C12.3687 16.3412 13.0291 15.8675 13.7526 15.509C14.3444 15.1876 14.4477 14.364 14.6787 14.1065C15.0647 13.6689 15.6565 13.6689 16.0941 13.283C16.3129 13.09 16.6377 12.9867 16.8415 12.7815C17.8692 11.8403 19.1644 11.2423 20.5474 11.0706C21.5064 10.9924 22.4717 11.0795 23.4012 11.3281C23.5358 11.3507 23.669 11.3809 23.8001 11.4185C25.9228 11.4959 28.4709 11.9328 29.397 12.8338C29.8555 13.2744 30.1961 13.8229 30.3877 14.4293C30.5382 14.8988 30.7456 15.3481 31.0054 15.7672L31.5714 16.6933C31.932 17.2773 32.0475 17.9801 31.8928 18.6489C31.7885 18.974 31.7795 19.3223 31.8669 19.6525C32.1655 20.1031 32.5152 20.5177 32.9093 20.8878C33.0658 21.0427 33.2382 21.1807 33.4236 21.2995C33.8592 21.5594 34.2802 21.8429 34.6848 22.1489C34.698 22.2729 34.6775 22.3982 34.6254 22.5115C34.5732 22.6247 34.4914 22.7218 34.3885 22.7924C34.0284 23.1137 33.3333 23.6159 33.3333 23.6159C33.3584 23.758 33.4016 23.8964 33.4617 24.0276C33.5643 24.2077 33.796 24.4911 33.7192 24.735C33.6424 24.9789 33.1403 25.1855 33.2816 25.4552C33.423 25.7386 33.7831 25.8154 33.6805 26.0729C33.5779 26.3175 33.0757 26.7524 33.1274 26.9352C33.179 27.1179 33.5908 28.8377 32.6382 29.1353C31.4592 29.3685 30.2627 29.5019 29.0614 29.5342C28.8675 29.5454 28.6797 29.6055 28.5155 29.709C28.3513 29.8125 28.216 29.956 28.1223 30.126C27.9399 30.4661 27.8222 30.837 27.7751 31.22C27.4275 32.5896 26.9671 33.928 26.3985 35.2215C26.3985 35.2215 26.3597 35.2989 26.3081 35.4144C26.1833 35.6687 26.1048 35.9432 26.0764 36.2251C26.1573 36.4321 26.2799 36.6204 26.4365 36.7782C26.519 36.8726 26.6271 36.9411 26.7477 36.9753C26.8683 37.0096 26.9962 37.0081 27.116 36.9711C30.1997 35.8965 32.8655 33.8757 34.7332 31.197C36.601 28.5182 37.5754 25.3182 37.5175 22.0531Z", fill: testnet ? '#ffffff' : '#00DACC' }) }));
var Logos = {
    UnknownChain,
    Ethereum,
    Polygon,
    Optimism,
    Arbitrum,
    Aurora,
    Avalanche,
    Celo,
    Telos,
    Gnosis,
    Evmos,
    BinanceSmartChain,
    Foundry: KnownChain,
    Sepolia: KnownChain,
    Taraxa: KnownChain,
    zkSync: KnownChain,
    Flare: KnownChain,
    Canto,
    Fantom,
    Filecoin,
    Metis,
    IoTeX,
};

const supportedChains = [
    {
        id: 1,
        name: 'Ethereum',
        logo: jsx(Logos.Ethereum, {}),
    },
    {
        id: 3,
        name: 'Rinkeby',
        logo: jsx(Logos.Ethereum, { testnet: true }),
    },
    {
        id: 4,
        name: 'Ropsten',
        logo: jsx(Logos.Ethereum, { testnet: true }),
    },
    {
        id: 5,
        name: 'Görli',
        logo: jsx(Logos.Ethereum, { testnet: true }),
    },
    {
        id: 42,
        name: 'Kovan',
        logo: jsx(Logos.Ethereum, { testnet: true }),
    },
    {
        id: 10,
        name: 'Optimism',
        logo: jsx(Logos.Optimism, {}),
    },
    {
        id: 69,
        name: 'Optimism Kovan',
        logo: jsx(Logos.Optimism, { testnet: true }),
    },
    {
        id: 420,
        name: 'Optimism Goerli',
        logo: jsx(Logos.Optimism, { testnet: true }),
    },
    {
        id: 137,
        name: 'Polygon',
        logo: jsx(Logos.Polygon, {}),
    },
    {
        id: 80001,
        name: 'Polygon Mumbai',
        logo: jsx(Logos.Polygon, { testnet: true }),
    },
    {
        id: 31337,
        name: 'Hardhat',
        logo: jsx(Logos.Ethereum, { testnet: true }),
    },
    {
        id: 1337,
        name: 'Localhost',
        logo: jsx(Logos.Ethereum, { testnet: true }),
    },
    {
        id: 42161,
        name: 'Arbitrum',
        logo: jsx(Logos.Arbitrum, {}),
    },
    {
        id: 421611,
        name: 'Arbitrum Rinkeby',
        logo: jsx(Logos.Arbitrum, { testnet: true }),
    },
    {
        id: 421613,
        name: 'Arbitrum Goerli',
        logo: jsx(Logos.Arbitrum, { testnet: true }),
    },
    {
        id: 40,
        name: 'Telos',
        logo: jsx(Logos.Telos, {}),
    },
    {
        id: 41,
        name: 'Telos Testnet',
        logo: jsx(Logos.Telos, { testnet: true }),
    },
    {
        id: 1313161554,
        name: 'Aurora',
        logo: jsx(Logos.Aurora, {}),
    },
    {
        id: 1313161555,
        name: 'Aurora Testnet',
        logo: jsx(Logos.Aurora, { testnet: true }),
    },
    {
        id: 43114,
        name: 'Avalanche',
        logo: jsx(Logos.Avalanche, {}),
    },
    {
        id: 43113,
        name: 'Avalanche Fuji',
        logo: jsx(Logos.Avalanche, { testnet: true }),
    },
    {
        id: 31337,
        name: 'Foundry',
        logo: jsx(Logos.Foundry, { testnet: true }),
    },
    {
        id: 100,
        name: 'Gnosis',
        logo: jsx(Logos.Gnosis, {}),
    },
    {
        id: 9001,
        name: 'Evmos',
        logo: jsx(Logos.Evmos, {}),
    },
    {
        id: 9000,
        name: 'Evmos Testnet',
        logo: jsx(Logos.Evmos, { testnet: true }),
    },
    {
        id: 56,
        name: 'BNB Smart Chain',
        logo: jsx(Logos.BinanceSmartChain, {}),
    },
    {
        id: 97,
        name: 'Binance Smart Chain Testnet',
        logo: jsx(Logos.BinanceSmartChain, { testnet: true }),
    },
    {
        id: 11155111,
        name: 'Sepolia',
        logo: jsx(Logos.Sepolia, {}),
    },
    {
        id: 841,
        name: 'Taraxa',
        logo: jsx(Logos.Taraxa, {}),
    },
    {
        id: 842,
        name: 'Taraxa Testnet',
        logo: jsx(Logos.Taraxa, { testnet: true }),
    },
    {
        id: 324,
        name: 'zkSync',
        logo: jsx(Logos.zkSync, {}),
    },
    {
        id: 280,
        name: 'zkSync Testnet',
        logo: jsx(Logos.zkSync, { testnet: true }),
    },
    {
        id: 42220,
        name: 'Celo',
        logo: jsx(Logos.Celo, {}),
    },
    {
        id: 44787,
        name: 'Celo Alfajores',
        logo: jsx(Logos.Celo, { testnet: true }),
    },
    {
        id: 7700,
        name: 'Canto',
        logo: jsx(Logos.Canto, {}),
    },
    {
        id: 250,
        name: 'Fantom',
        logo: jsx(Logos.Fantom, {}),
    },
    {
        id: 4002,
        name: 'Fantom Testnet',
        logo: jsx(Logos.Fantom, { testnet: true }),
    },
    {
        id: 14,
        name: 'Flare',
        logo: jsx(Logos.Flare, {}),
    },
    {
        id: 114,
        name: 'Coston2',
        logo: jsx(Logos.Flare, {}),
    },
    {
        id: 314,
        name: 'Filecoin',
        logo: jsx(Logos.Filecoin, {}),
    },
    {
        id: 3141,
        name: 'Filecoin Hyperspace',
        logo: jsx(Logos.Filecoin, { testnet: true }),
    },
    {
        id: 314159,
        name: 'Filecoin Calibration',
        logo: jsx(Logos.Filecoin, { testnet: true }),
    },
    {
        id: 1088,
        name: 'Metis',
        logo: jsx(Logos.Metis, {}),
    },
    {
        id: 599,
        name: 'Metis Goerli',
        logo: jsx(Logos.Metis, { testnet: true }),
    },
    {
        id: 4689,
        name: 'IoTeX',
        logo: jsx(Logos.IoTeX, {}),
    },
    {
        id: 4690,
        name: 'IoTeX Testnet',
        logo: jsx(Logos.IoTeX, { testnet: true }),
    },
];

const Container$1 = styled(motion.div) `
  display: flex;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  height: 40px;
  padding: 0;
  line-height: 0;
  letter-spacing: -0.2px;
  font-size: var(--ck-connectbutton-font-size, 16px);
  font-weight: var(--ck-connectbutton-font-weight, 500);
  text-align: center;
  transition: 100ms ease;
  transition-property: color, background, box-shadow, border-radius;

  color: var(--color);
  background: var(--background);
  box-shadow: var(--box-shadow);
  border-radius: var(--border-radius);

  &.primary {
    --color: var(--ck-connectbutton-color);
    --background: var(--ck-connectbutton-background);
    --box-shadow: var(--ck-connectbutton-box-shadow);
    --border-radius: var(--ck-connectbutton-border-radius, 12px);

    --hover-color: var(--ck-connectbutton-hover-color, var(--color));
    --hover-background: var(--ck-connectbutton-hover-background, var(--background));
    --hover-box-shadow: var(--ck-connectbutton-hover-box-shadow, var(--box-shadow));
    --hover-border-radius: var(--ck-connectbutton-hover-border-radius, var(--border-radius));

    --active-color: var(--ck-connectbutton-active-color, var(--hover-color));
    --active-background: var(--ck-connectbutton-active-background, var(--hover-background));
    --active-box-shadow: var(--ck-connectbutton-active-box-shadow, var(--hover-box-shadow));
    --active-border-radius: var(
      --ck-connectbutton-active-border-radius,
      var(--hover-border-radius)
    );
  }
  &.secondary {
    --color: var(--ck-connectbutton-balance-color);
    --background: var(--ck-connectbutton-balance-background);
    --box-shadow: var(--ck-connectbutton-balance-box-shadow);
    --border-radius: var(
      --ck-connectbutton-balance-border-radius,
      var(--ck-connectbutton-border-radius, 12px)
    );

    --hover-color: var(--ck-connectbutton-balance-hover-color, var(--color));
    --hover-background: var(--ck-connectbutton-balance-hover-background, var(--background));
    --hover-box-shadow: var(--ck-connectbutton-balance-hover-box-shadow, var(--box-shadow));
    --hover-border-radius: var(
      --ck-connectbutton-balance-hover-border-radius,
      var(--border-radius)
    );

    --active-color: var(--ck-connectbutton-balance-active-color, var(--hover-color));
    --active-background: var(
      --ck-connectbutton-balance-active-background,
      var(--hover-background)
    );
    --active-box-shadow: var(
      --ck-connectbutton-balance-active-box-shadow,
      var(--hover-box-shadow)
    );
    --active-border-radius: var(
      --ck-connectbutton-balance-active-border-radius,
      var(--hover-border-radius)
    );
  }
`;
const ThemeContainer = styled.button `
  all: initial;
  appearance: none;
  user-select: none;
  position: relative;
  padding: 0;
  margin: 0;
  background: none;
  border-radius: var(--ck-border-radius);

  &:disabled {
    pointer-events: none;
    opacity: 0.3;
  }

  display: flex;
  flex-wrap: nowrap;
  background: none;
  cursor: pointer;
  * {
    cursor: pointer;
  }
  &:hover {
    ${Container$1} {
      color: var(--hover-color, var(--color));
      background: var(--hover-background, var(--background));
      box-shadow: var(--hover-box-shadow, var(--box-shadow));
      border-radius: var(--hover-border-radius, var(--border-radius));
    }
  }
  &:active {
    ${Container$1} {
      color: var(--active-color, var(--hover-color, var(--color)));
      background: var(--active-background, var(--hover-background, var(--background)));
      box-shadow: var(--active-box-shadow, var(--hover-box-shadow, var(--box-shadow)));
      border-radius: var(--active-border-radius, var(--hover-border-radius, var(--border-radius)));
    }
  }
  &:focus-visible {
    outline: 2px solid var(--ck-family-brand);
  }
`;

const ThemedButton = ({ children, variant = "primary", autoSize = true, duration = 0.3, style, }) => {
    const [contentRef, bounds] = useMeasure();
    return (jsx(Container$1, { className: variant, initial: false, animate: autoSize
            ? {
                width: bounds.width > 10 ? bounds.width : "auto",
            }
            : undefined, transition: {
            duration: duration,
            ease: [0.25, 1, 0.5, 1],
            delay: 0.01,
        }, style: style, children: jsx("div", { ref: contentRef, style: {
                whiteSpace: "nowrap",
                width: "fit-content",
                position: "relative",
                padding: "0 12px",
            }, children: children }) }));
};

const Container = styled(motion.div) `
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;
const PlaceholderKeyframes = keyframes `
  0%,100%{ opacity: 0.1; transform: scale(0.75); }
  50%{ opacity: 0.75; transform: scale(1.2) }
`;
const PulseContainer = styled.div `
  pointer-events: none;
  user-select: none;
  padding: 0 5px;
  span {
    display: inline-block;
    vertical-align: middle;
    margin: 0 2px;
    width: 3px;
    height: 3px;
    border-radius: 4px;
    background: currentColor;
    animation: ${PlaceholderKeyframes} 1000ms ease infinite both;
  }
`;
const Balance = ({ hideIcon, hideSymbol }) => {
    const isMounted = useIsMounted();
    const [isInitial, setIsInitial] = useState(true);
    const { address } = useAccount();
    const { chain } = useNetwork();
    const { data: balance } = useBalance({
        address,
        chainId: chain === null || chain === void 0 ? void 0 : chain.id,
        watch: true,
    });
    const currentChain = supportedChains.find((c) => c.id === (chain === null || chain === void 0 ? void 0 : chain.id));
    const state = `${!isMounted || (balance === null || balance === void 0 ? void 0 : balance.formatted) === undefined
        ? `balance-loading`
        : `balance-${currentChain === null || currentChain === void 0 ? void 0 : currentChain.id}-${balance === null || balance === void 0 ? void 0 : balance.formatted}`}`;
    useEffect(() => {
        setIsInitial(false);
    }, []);
    return (jsx("div", { style: { position: "relative" }, children: jsx(AnimatePresence, { initial: false, children: jsx(motion.div, { initial: (balance === null || balance === void 0 ? void 0 : balance.formatted) !== undefined && isInitial
                    ? {
                        opacity: 1,
                    }
                    : { opacity: 0, position: "absolute", top: 0, left: 0, bottom: 0 }, animate: { opacity: 1, position: "relative" }, exit: {
                    opacity: 0,
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                }, transition: {
                    duration: 0.4,
                    ease: [0.25, 1, 0.5, 1],
                    delay: 0.4,
                }, children: !address || !isMounted || (balance === null || balance === void 0 ? void 0 : balance.formatted) === undefined ? (jsx(Container, { children: jsx("span", { style: { minWidth: 32 }, children: jsxs(PulseContainer, { children: [jsx("span", { style: { animationDelay: "0ms" } }), jsx("span", { style: { animationDelay: "50ms" } }), jsx("span", { style: { animationDelay: "100ms" } })] }) }) })) : (chain === null || chain === void 0 ? void 0 : chain.unsupported) ? (jsx(Container, { children: jsx("span", { style: { minWidth: 32 }, children: "???" }) })) : (jsxs(Container, { children: [jsx("span", { style: { minWidth: 32 }, children: nFormatter(Number(balance === null || balance === void 0 ? void 0 : balance.formatted)) }), !hideSymbol && ` ${balance === null || balance === void 0 ? void 0 : balance.symbol}`] })) }, state) }) }));
};

const contentVariants = {
    initial: {
        zIndex: 2,
        opacity: 0,
        x: "-100%",
    },
    animate: {
        opacity: 1,
        x: 0.1,
        transition: {
            duration: 0.4,
            ease: [0.25, 1, 0.5, 1],
        },
    },
    exit: {
        zIndex: 1,
        opacity: 0,
        x: "-100%",
        pointerEvents: "none",
        position: "absolute",
        transition: {
            duration: 0.4,
            ease: [0.25, 1, 0.5, 1],
        },
    },
};
const addressVariants = {
    initial: {
        zIndex: 2,
        opacity: 0,
        x: "100%",
    },
    animate: {
        x: 0.2,
        opacity: 1,
        transition: {
            duration: 0.4,
            ease: [0.25, 1, 0.5, 1],
        },
    },
    exit: {
        zIndex: 1,
        x: "100%",
        opacity: 0,
        pointerEvents: "none",
        position: "absolute",
        transition: {
            duration: 0.4,
            ease: [0.25, 1, 0.5, 1],
        },
    },
};
const textVariants = {
    initial: {
        opacity: 0,
    },
    animate: {
        opacity: 1,
        transition: {
            duration: 0.3,
            ease: [0.25, 1, 0.5, 1],
        },
    },
    exit: {
        position: "absolute",
        opacity: 0,
        transition: {
            duration: 0.3,
            ease: [0.25, 1, 0.5, 1],
        },
    },
};
const ConnectButtonRenderer = ({ children }) => {
    const isMounted = useIsMounted();
    const context = useContext();
    const { open, setOpen } = useModal();
    const { chain } = useNetwork();
    const { address, isConnected } = useAccount();
    function hide() {
        setOpen(false);
    }
    function show() {
        setOpen(true);
        context.setRoute(isConnected ? routes.PROFILE : routes.CONNECTORS);
    }
    if (!children)
        return null;
    if (!isMounted)
        return null;
    return (jsx(Fragment, { children: children({
            show,
            hide,
            chain: chain,
            unsupported: !!(chain === null || chain === void 0 ? void 0 : chain.unsupported),
            isConnected: !!address,
            isConnecting: open,
            address: address,
            truncatedAddress: address ? truncateEthAddress(address) : undefined,
        }) }));
};
ConnectButtonRenderer.displayName = "ConnectKitButton.Custom";
function ConnectWSCButtonInner({ label, showAvatar, separator, }) {
    useContext();
    const { address } = useAccount();
    const { chain } = useNetwork();
    const defaultLabel = "Connect WSC";
    return (jsx(AnimatePresence, { initial: false, children: address ? (jsxs(TextContainer, { initial: "initial", animate: "animate", exit: "exit", variants: addressVariants, style: {
                height: 40,
                //padding: !showAvatar ? '0 5px' : undefined,
            }, children: [showAvatar && (jsx(IconContainer, { children: jsx(AnimatePresence, { initial: false, children: (chain === null || chain === void 0 ? void 0 : chain.unsupported) && (jsx(UnsupportedNetworkContainer, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, children: jsx("svg", { width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: jsx("path", { d: "M1.68831 13.5H12.0764C13.1026 13.5 13.7647 12.7197 13.7647 11.763C13.7647 11.4781 13.6985 11.1863 13.5462 10.9149L8.34225 1.37526C8.02445 0.791754 7.45505 0.5 6.88566 0.5C6.31627 0.5 5.73364 0.791754 5.42246 1.37526L0.225108 10.9217C0.0728291 11.1863 0 11.4781 0 11.763C0 12.7197 0.662083 13.5 1.68831 13.5ZM6.88566 8.8048C6.49503 8.8048 6.27655 8.5809 6.26331 8.1738L6.16399 5.0595C6.15075 4.64562 6.44869 4.34708 6.87904 4.34708C7.30278 4.34708 7.61396 4.6524 7.60071 5.06628L7.5014 8.16701C7.48154 8.5809 7.26305 8.8048 6.88566 8.8048ZM6.88566 11.3492C6.44207 11.3492 6.07792 11.0303 6.07792 10.5757C6.07792 10.1211 6.44207 9.80219 6.88566 9.80219C7.32926 9.80219 7.69341 10.1143 7.69341 10.5757C7.69341 11.0371 7.32264 11.3492 6.88566 11.3492Z", fill: "currentColor" }) }) })) }) })), jsx("div", { style: {
                        position: "relative",
                        paddingRight: showAvatar ? 1 : 0,
                    }, children: jsx(AnimatePresence, { initial: false, children: jsxs(TextContainer, { initial: "initial", animate: "animate", exit: "exit", variants: textVariants, style: {
                                position: "relative",
                            }, children: [truncateEthAddress(address, separator), " "] }, "ckTruncatedAddress") }) })] }, "connectedText")) : (jsx(TextContainer, { initial: "initial", animate: "animate", exit: "exit", variants: contentVariants, style: {
                height: 40,
                //padding: '0 5px',
            }, children: label ? label : defaultLabel }, "connectWalletText")) }));
}
function ConnectWSCButton({ onClick }) {
    const isMounted = useIsMounted();
    const context = useContext();
    const { isConnected, address } = useAccount();
    const { chain } = useNetwork();
    function show() {
        context.setOpen(true);
        context.setRoute(isConnected ? routes.PROFILE : routes.CONNECTORS);
    }
    const separator = ["web95", "rounded", "minimal"].includes("") ? "...." : undefined;
    if (!isMounted)
        return null;
    const shouldShowBalance = !(chain === null || chain === void 0 ? void 0 : chain.unsupported);
    const willShowBalance = address && shouldShowBalance;
    return (jsx(ResetContainer, { children: jsxs(ThemeContainer, { onClick: () => {
                if (onClick) {
                    onClick(show);
                }
                else {
                    show();
                }
            }, children: [shouldShowBalance && (jsx(AnimatePresence, { initial: false, children: willShowBalance && (jsx(motion.div, { initial: {
                            opacity: 0,
                            x: "100%",
                            width: 0,
                            marginRight: 0,
                        }, animate: {
                            opacity: 1,
                            x: 0,
                            width: "auto",
                            marginRight: -24,
                            transition: {
                                duration: 0.4,
                                ease: [0.25, 1, 0.5, 1],
                            },
                        }, exit: {
                            opacity: 0,
                            x: "100%",
                            width: 0,
                            marginRight: 0,
                            transition: {
                                duration: 0.4,
                                ease: [0.25, 1, 0.5, 1],
                            },
                        }, children: jsx(ThemedButton, { variant: "secondary", style: { overflow: "hidden" }, children: jsx(motion.div, { style: { paddingRight: 24 }, children: jsx(Balance, { hideSymbol: true }) }) }) }, "balance")) })), jsx(ThemedButton, { style: shouldShowBalance && address
                        ? {
                            /** Special fix for the retro theme... not happy about this one */
                            boxShadow: "var(--ck-connectbutton-balance-connectbutton-box-shadow)",
                            borderRadius: "var(--ck-connectbutton-balance-connectbutton-border-radius)",
                            overflow: "hidden",
                        }
                        : {
                            overflow: "hidden",
                        }, children: jsx(ConnectWSCButtonInner, { separator: separator }) })] }) }));
}
ConnectWSCButton.Custom = ConnectButtonRenderer;

function useConnectors() {
    const { connectors } = useConnect$1();
    return connectors;
}

function useChains() {
    var _a;
    // TODO: Find a better way to get configuration chains, but for now just grab first connector's chains
    const connectors = useConnectors();
    return (_a = connectors[0]) === null || _a === void 0 ? void 0 : _a.chains;
}

export { ConnectWSCButton, ConnectWSCProvider, Context, types as Types, defaultConfig as getDefaultConfig, supportedConnectors$1 as supportedConnectors, useChains, useIsMounted, useModal };
//# sourceMappingURL=index.es.js.map
