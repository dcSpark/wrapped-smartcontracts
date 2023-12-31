import React from "react";
import { WalletProps } from "../wallet";

import Logos from "../../assets/logos";

export const etrnal = (): WalletProps => {
  return {
    id: "eternl-wsc",
    name: "Etrnal",
    logos: {
      default: <Logos.Eternl />,
      mobile: <Logos.Eternl />,
      transparent: <Logos.Eternl background={false} />,
      connectorButton: <Logos.Eternl />,
      qrCode: <Logos.Eternl background={true} />,
    },
    logoBackground: "var(--wsc-brand-walletConnect)",
    scannable: true,
    createUri: (uri: string) => uri,
  };
};
