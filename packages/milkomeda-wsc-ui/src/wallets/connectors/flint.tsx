import React from "react";
import { WalletProps } from "../wallet";

import Logos from "../../assets/logos";

export const flint = (): WalletProps => {
  return {
    id: "flint-wsc",
    name: "Flint WSC",
    logos: {
      default: <Logos.Flint />,
      mobile: <Logos.Flint />,
      transparent: <Logos.Flint background={false} />,
      connectorButton: <Logos.Flint />,
      qrCode: <Logos.Flint background={true} />,
    },
    logoBackground: "var(--ck-brand-walletConnect)",
    scannable: true,
    createUri: (uri: string) => uri,
  };
};
