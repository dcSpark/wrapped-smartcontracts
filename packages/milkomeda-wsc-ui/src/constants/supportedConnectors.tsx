import React from "react";
import { ReactNode } from "react";
import Logos from "../assets/logos";
import { isEternl, isFlint, isNami, isNufi, isYoroi } from "../utils";

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
  extensionIsInstalled: () => boolean | undefined;
  defaultConnect?: () => void;
}[] = [];

if (typeof window != "undefined") {
  interface IDictionary {
    [index: string]: string;
  }

  supportedConnectors = [
    {
      id: "flint-wsc",
      name: "Flint WSC",
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
        "linear-gradient(0deg, var(--wsc-brand-metamask-12), var(--wsc-brand-metamask-11))",
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
      id: "eternl-wsc",
      name: "Eternl WSC",
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
        "linear-gradient(0deg, var(--wsc-brand-metamask-12), var(--wsc-brand-metamask-11))",
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
    {
      id: "nami-wsc",
      name: "Nami WSC",
      logos: {
        default: <Logos.Nami background />,
        mobile: <Logos.Nami background />,
        transparent: (
          <div
            style={{
              transform: "scale(0.86)",
              position: "relative",
              width: "100%",
            }}
          >
            <Logos.Nami />
          </div>
        ),
        connectorButton: (
          <div
            style={{
              transform: "scale(1.1)",
            }}
          >
            <Logos.Nami />
          </div>
        ),
      },
      logoBackground:
        "linear-gradient(0deg, var(--wsc-brand-metamask-12), var(--wsc-brand-metamask-11))",
      scannable: false,
      // defaultConnect:  () => {},
      extensions: {
        chrome: "https://chrome.google.com/webstore/detail/nami/lpfcbjknijpeeillifnkikgncikgfhdo",
        firefox: "",
        brave: "https://chrome.google.com/webstore/detail/nami/lpfcbjknijpeeillifnkikgncikgfhdo",
        edge: "",
      } as IDictionary,
      appUrls: {
        download:
          "https://chrome.google.com/webstore/detail/nami/lpfcbjknijpeeillifnkikgncikgfhdo",
        website: "https://namiwallet.io/",
        android: "",
        ios: "",
      } as IDictionary,
      extensionIsInstalled: () => {
        return isNami();
      },
    },
    {
      id: "nufi-wsc",
      name: "NuFi WSC",
      logos: {
        default: <Logos.Nufi background />,
        mobile: <Logos.Nufi background />,
        transparent: (
          <div
            style={{
              transform: "scale(0.86)",
              position: "relative",
              width: "100%",
            }}
          >
            <Logos.Nufi />
          </div>
        ),
        connectorButton: (
          <div
            style={{
              transform: "scale(1.1)",
            }}
          >
            <Logos.Nufi />
          </div>
        ),
      },
      logoBackground:
        "linear-gradient(0deg, var(--wsc-brand-metamask-12), var(--wsc-brand-metamask-11))",
      scannable: false,
      // defaultConnect:  () => {},
      extensions: {
        chrome: "https://chrome.google.com/webstore/detail/nufi/gpnihlnnodeiiaakbikldcihojploeca",
        firefox: "",
        brave: "https://chrome.google.com/webstore/detail/nufi/gpnihlnnodeiiaakbikldcihojploeca",
        edge: "",
      } as IDictionary,
      appUrls: {
        download:
          "https://chrome.google.com/webstore/detail/nufi/gpnihlnnodeiiaakbikldcihojploeca",
        website: "https://nu.fi/",
        android: "",
        ios: "",
      } as IDictionary,
      extensionIsInstalled: () => {
        return isNufi();
      },
    },
    {
      id: "yoroi-wsc",
      name: "Yoroi WSC",
      logos: {
        default: <Logos.Yoroi background />,
        mobile: <Logos.Yoroi background />,
        transparent: (
          <div
            style={{
              transform: "scale(0.86)",
              position: "relative",
              width: "100%",
            }}
          >
            <Logos.Yoroi />
          </div>
        ),
        connectorButton: (
          <div
            style={{
              transform: "scale(1.1)",
            }}
          >
            <Logos.Yoroi />
          </div>
        ),
      },
      logoBackground:
        "linear-gradient(0deg, var(--wsc-brand-metamask-12), var(--wsc-brand-metamask-11))",
      scannable: false,
      // defaultConnect:  () => {},
      extensions: {
        chrome: "https://chrome.google.com/webstore/detail/yoroi/ffnbelfdoeiohenkjibnmadjiehjhajb",
        firefox: "",
        brave: "https://chrome.google.com/webstore/detail/yoroi/ffnbelfdoeiohenkjibnmadjiehjhajb",
        edge: "",
      } as IDictionary,
      appUrls: {
        download:
          "https://chrome.google.com/webstore/detail/yoroi/ffnbelfdoeiohenkjibnmadjiehjhajb",
        website: "https://yoroi-wallet.com/#/",
        android: "",
        ios: "",
      } as IDictionary,
      extensionIsInstalled: () => {
        return isYoroi();
      },
    },
  ];
}

export default supportedConnectors;
