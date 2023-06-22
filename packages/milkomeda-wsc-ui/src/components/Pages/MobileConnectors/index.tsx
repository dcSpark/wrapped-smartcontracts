import React from "react";
import { Container, WalletList, WalletItem, WalletIcon, WalletLabel } from "./styles";

import { PageContent, ModalContent } from "../../Common/Modal/styles";

import useDefaultWallets from "../../../wallets/useDefaultWallets";
import { routes, useContext } from "../../ConnectWSC";
import { WalletProps } from "../../../wallets/wallet";
import CopyToClipboard from "../../Common/CopyToClipboard";

import { Spinner } from "../../Common/Spinner";

const MoreIcon = (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M30 42V19M19 30.5H42"
      stroke="var(--ck-body-color-muted)"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

const MobileConnectors: React.FC = () => {
  const context = useContext();

  const wallets = useDefaultWallets().filter(
    (wallet: WalletProps) => wallet.installed === undefined
  );

  const connectWallet = (wallet: WalletProps) => {
    if (wallet.installed) {
      context.setRoute(routes.CONNECT);
      context.setConnector(wallet.id);
    } else {
      //if (uri) window.open(uri, '_blank');
    }
  };

  return (
    <PageContent style={{ width: 312 }}>
      <Container>
        <ModalContent>
          <WalletList>
            {wallets.map((wallet: WalletProps, i: number) => {
              const { name, shortName, logos, logoBackground } = wallet;
              return (
                <WalletItem
                  key={i}
                  onClick={() => connectWallet(wallet)}
                  style={{
                    animationDelay: `${i * 50}ms`,
                  }}
                >
                  <WalletIcon
                    $outline={true}
                    style={
                      logoBackground
                        ? {
                            background: logoBackground,
                          }
                        : undefined
                    }
                  >
                    {logos.mobile ?? logos.default}
                  </WalletIcon>
                  <WalletLabel>{shortName ?? name}</WalletLabel>
                </WalletItem>
              );
            })}
          </WalletList>
        </ModalContent>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            paddingTop: 16,
          }}
        >
          <CopyToClipboard variant="button" string={"random"}>
            Copy to clipboard
          </CopyToClipboard>
        </div>
      </Container>
    </PageContent>
  );
};

export default MobileConnectors;
