import React, { useEffect } from "react";
import { useContext, routes } from "../../ConnectWSC";
import supportedConnectors from "../../../constants/supportedConnectors";

import { useConnect } from "../../../hooks/useConnect";

import { PageContent, ModalH1, ModalBody, ModalContent } from "../../Common/Modal/styles";

import {
  ConnectorsContainer,
  ConnectorButton,
  ConnectorLabel,
  ConnectorIcon,
  MobileConnectorsContainer,
  MobileConnectorButton,
  MobileConnectorLabel,
  InfoBox,
  InfoBoxButtons,
  ConnectorRecentlyUsed,
} from "./styles";

import { isMobile } from "../../../utils";

import Button from "../../Common/Button";
import useDefaultWallets from "../../../wallets/useDefaultWallets";
import { Connector } from "wagmi";

import { useLastConnector } from "../../../hooks/useLastConnector";

const Wallets: React.FC = () => {
  const context = useContext();

  const mobile = isMobile();

  const { connectAsync, connectors } = useConnect();
  const { lastConnectorId } = useLastConnector();
  const openDefaultConnect = async (connector: Connector) => {
    try {
      await connectAsync({ connector: connector });
    } catch (err) {
      context.displayError("Async connect error. See console for more details.", err);
    }
  };

  /**
   * Some injected connectors pretend to be metamask, this helps avoid that issue.
   */

  const shouldShowInjectedConnector = () => {
    // Only display if an injected connector is detected
    const { ethereum } = window;

    const needsInjectedWalletFallback = typeof window !== "undefined";
    //!ethereum?.isBraveWallet; // TODO: Add this line when Brave is supported

    return needsInjectedWalletFallback;
  };

  const wallets = useDefaultWallets();

  const findInjectedConnectorInfo = (name: string) => {
    let walletList = name.split(/[(),]+/);
    walletList.shift(); // remove "Injected" from array
    walletList = walletList.map((x) => x.trim());

    const hasWalletLogo = walletList.filter((x) => {
      const a = wallets.map((wallet: any) => wallet.name).includes(x);
      if (a) return x;
      return null;
    });
    if (hasWalletLogo.length === 0) return null;

    const foundInjector = wallets.filter(
      (wallet: any) => wallet.installed && wallet.name === hasWalletLogo[0]
    )[0];

    return foundInjector;
  };

  return (
    <PageContent style={{ width: 312 }}>
      {mobile ? (
        <>
          <MobileConnectorsContainer>
            {connectors.map((connector) => {
              const info = supportedConnectors.filter((c) => c.id === connector.id)[0];
              if (!info) return null;

              return (
                <MobileConnectorButton
                  key={`m-${connector.id}`}
                  disabled={!connector.ready}
                  onClick={() => {
                    context.setRoute(routes.CONNECT);
                    context.setConnector(connector.id);
                    openDefaultConnect(connector);
                  }}
                >
                  <MobileConnectorLabel>{name}</MobileConnectorLabel>
                </MobileConnectorButton>
              );
            })}
          </MobileConnectorsContainer>
          <InfoBox>
            <ModalContent style={{ padding: 0, textAlign: "left" }}>
              <ModalH1 $small>connectorsScreen_h1</ModalH1>
              <ModalBody>connectorsScreen_p</ModalBody>
            </ModalContent>
            <InfoBoxButtons>
              <Button variant={"tertiary"} onClick={() => context.setRoute(routes.ONBOARDING)}>
                getWallet
              </Button>
            </InfoBoxButtons>
          </InfoBox>
        </>
      ) : (
        <>
          <ConnectorsContainer>
            {connectors.map((connector) => {
              const info = supportedConnectors.filter((c) => c.id === connector.id)[0];
              if (!info) return null;

              const logos = info.logos;

              const name = info.name ?? connector.name;

              let logo = logos.connectorButton ?? logos.default;
              if (info.extensionIsInstalled && logos.appIcon) {
                if (info.extensionIsInstalled()) {
                  logo = logos.appIcon;
                }
              }
              return (
                <ConnectorButton
                  key={connector.id}
                  disabled={context.route !== routes.CONNECTORS}
                  onClick={() => {
                    console.log(connector, "connector-id");
                    context.setRoute(routes.CONNECT);
                    context.setConnector(connector.id);
                  }}
                >
                  <ConnectorIcon>{logo}</ConnectorIcon>
                  <ConnectorLabel>{name}</ConnectorLabel>
                </ConnectorButton>
              );
            })}
          </ConnectorsContainer>
        </>
      )}
    </PageContent>
  );
};

export default Wallets;
