import React from "react";
import { ReactNode } from "react";
import Logos from "../assets/logos";
import { isEternl, isFlint } from "../utils";

let supportedConnectors: {
  id: string;
  name?: string;
  shortName?: string;
  logos: {
    default: ReactNode;
    transparent?: ReactNode;
    connectorButton?: ReactNode;
    qrCode?: ReactNode;
    appIcon?: ReactNode;
    mobile?: ReactNode;
  };
  logoBackground?: string;
  scannable?: boolean;
  extensions?: { [key: string]: string };
  appUrls?: { [key: string]: string };
  extensionIsInstalled: () => boolean;
  defaultConnect?: () => void;
}[] = [];

if (typeof window != "undefined") {
  interface IDictionary {
    [index: string]: string;
  }

  supportedConnectors = [
    {
      id: "flint-wsc",
      name: "WSC Flint",
      logos: {
        default: <Logos.Flint background />,
        mobile: <Logos.Flint background />,
        transparent: (
          <div
            style={{
              transform: "scale(0.86)",
              position: "relative",
              width: "100%",
            }}
          >
            <Logos.Flint />
          </div>
        ),
        connectorButton: (
          <div
            style={{
              transform: "scale(1.1)",
            }}
          >
            <Logos.Flint />
          </div>
        ),
      },
      logoBackground:
        "linear-gradient(0deg, var(--ck-brand-metamask-12), var(--ck-brand-metamask-11))",
      scannable: false,
      // defaultConnect:  () => {},
      extensions: {
        chrome:
          "https://chrome.google.com/webstore/detail/flint-wallet/hnhobjmcibchnmglfbldbfabcgaknlkj",
        firefox: "",
        brave:
          "https://chrome.google.com/webstore/detail/flint-wallet/hnhobjmcibchnmglfbldbfabcgaknlkj",
        edge: "",
      } as IDictionary,
      appUrls: {
        download: "",
        website: "https://flint-wallet.com/",
        android: "https://play.google.com/store/apps/details?id=io.dcspark.flintwallet",
        ios: "https://apps.apple.com/us/app/dcspark-flint-wallet/id1619660885",
      } as IDictionary,
      extensionIsInstalled: () => {
        return isFlint();
      },
    },
    {
      id: "etrnal-wsc",
      name: "WSC Eternl",
      logos: {
        default: <Logos.Eternl background />,
        mobile: <Logos.Eternl background />,
        transparent: (
          <div
            style={{
              transform: "scale(0.86)",
              position: "relative",
              width: "100%",
            }}
          >
            <Logos.Eternl />
          </div>
        ),
        connectorButton: (
          <div
            style={{
              transform: "scale(1.1)",
            }}
          >
            <Logos.Eternl />
          </div>
        ),
      },
      logoBackground:
        "linear-gradient(0deg, var(--ck-brand-metamask-12), var(--ck-brand-metamask-11))",
      scannable: false,
      // defaultConnect:  () => {},
      extensions: {
        chrome:
          "https://chrome.google.com/webstore/detail/eternl/kmhcihpebfmpgmihbkipmjlmmioameka/related",
        firefox: "",
        brave:
          "https://chrome.google.com/webstore/detail/eternl/kmhcihpebfmpgmihbkipmjlmmioameka/related",
        edge: "",
      } as IDictionary,
      appUrls: {
        download:
          "https://chrome.google.com/webstore/detail/eternl/kmhcihpebfmpgmihbkipmjlmmioameka/related",
        website: "https://eternl.io/",
        android: "",
        ios: "",
      } as IDictionary,
      extensionIsInstalled: () => {
        return isEternl();
      },
    },
  ];
}

export default supportedConnectors;
