import React from "react";
import { useContext, routes } from "../../ConnectWSC";
import supportedConnectors from "../../../constants/supportedConnectors";

import { useConnect } from "../../../hooks/useConnect";

import { PageContent } from "../../Common/Modal/styles";

import {
  ConnectorsContainer,
  ConnectorButton,
  ConnectorLabel,
  ConnectorIcon,
  MobileConnectorsContainer,
  MobileConnectorButton,
  MobileConnectorLabel,
  MobileConnectorIcon,
} from "./styles";

import { isMobile } from "../../../utils";

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
        <MobileConnectorsContainer>
          {connectors.map((connector) => {
            const info = supportedConnectors.filter((c) => c.id === connector.id)[0];

            if (!info) return null;
            const logos = info.logos;
            const name = info.shortName ?? info.name ?? connector.name;

            return (
              <MobileConnectorButton
                key={connector.id}
                disabled={context.route !== routes.CONNECTORS}
                onClick={() => {
                  context.setRoute(routes.CONNECT);
                  context.setConnector(connector.id);
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
