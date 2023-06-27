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
  MobileConnectorIcon,
} from "./styles";

import { isMobile } from "../../../utils";

import Button from "../../Common/Button";
import { Connector } from "wagmi";

const Wallets: React.FC = () => {
  const context = useContext();

  const mobile = isMobile();

  const { connectAsync, connectors } = useConnect();

  const openDefaultConnect = async (connector: Connector) => {
    try {
      await connectAsync({ connector: connector });
    } catch (err) {
      context.displayError("Async connect error. See console for more details.", err);
    }
  };

  return (
    <PageContent style={{ width: 312 }}>
      {mobile ? (
        <>
          <MobileConnectorsContainer>
            {connectors.map((connector) => {
              const info = supportedConnectors.filter((c) => c.id === connector.id)[0];

              if (!info) return null;
              const logos = info.logos;
              const name = info.shortName ?? info.name ?? connector.name;

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
                  <MobileConnectorIcon>
                    {logos.mobile ?? logos.appIcon ?? logos.connectorButton ?? logos.default}
                  </MobileConnectorIcon>
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
