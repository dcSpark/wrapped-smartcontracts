import React, { useEffect, useState } from "react";
import { useContext } from "../../ConnectWSC";
import { nFormatter, truncateEthAddress } from "../../../utils";

import { useConnect, useDisconnect, useAccount, useEnsName, useBalance, useNetwork } from "wagmi";

import {
  AvatarContainer,
  AvatarInner,
  ChainSelectorContainer,
  BalanceContainer,
  LoadingBalance,
  Balance,
} from "./styles";

import { PageContent, ModalBody, ModalContent, ModalH1 } from "../../Common/Modal/styles";
import Button from "../../Common/Button";
import Avatar from "../../Common/Avatar";

import { DisconnectIcon } from "../../../assets/icons";
import CopyToClipboard from "../../Common/CopyToClipboard";
import { AnimatePresence } from "framer-motion";
import { useThemeContext } from "../../ConnectWSCThemeProvider/ConnectWSCThemeProvider";
import useLocales from "../../../hooks/useLocales";

const Profile: React.FC<{ closeModal?: () => void }> = ({ closeModal }) => {
  const context = useContext();
  const themeContext = useThemeContext();

  const locales = useLocales();

  const { reset } = useConnect();
  const { disconnect } = useDisconnect();

  const { chain } = useNetwork();
  const { address, isConnected, connector } = useAccount();
  const { data: ensName } = useEnsName({
    chainId: 1,
    address: address,
  });
  const { data: balance } = useBalance({
    address,
    //watch: true,
  });

  const [shouldDisconnect, setShouldDisconnect] = useState(false);

  useEffect(() => {
    if (!isConnected) context.setOpen(false);
  }, [isConnected]);

  useEffect(() => {
    if (!shouldDisconnect) return;

    // Close before disconnecting to avoid layout shifting while modal is still open
    if (closeModal) {
      closeModal();
    } else {
      context.setOpen(false);
    }
    return () => {
      disconnect();
      reset();
    };
  }, [shouldDisconnect, disconnect, reset]);

  const separator = ["web95", "rounded", "minimal"].includes(
    themeContext.theme ?? context.theme ?? ""
  )
    ? "...."
    : undefined;
  return (
    <PageContent>
      <ModalContent style={{ paddingBottom: 22, gap: 6 }}>
        <AvatarContainer>
          <AvatarInner>
            <Avatar address={address} />
          </AvatarInner>
        </AvatarContainer>
        <ModalH1>
          <CopyToClipboard string={address}>
            {ensName ?? truncateEthAddress(address, separator)}
          </CopyToClipboard>
        </ModalH1>
        {context?.options?.hideBalance ? null : (
          <ModalBody>
            <BalanceContainer>
              <AnimatePresence exitBeforeEnter initial={false}>
                {balance && (
                  <Balance
                    key={`chain-${chain?.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {nFormatter(Number(balance?.formatted))}
                    {` `}
                    {balance?.symbol}
                  </Balance>
                )}
                {!balance && (
                  <LoadingBalance
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    &nbsp;
                  </LoadingBalance>
                )}
              </AnimatePresence>
            </BalanceContainer>
          </ModalBody>
        )}
      </ModalContent>
      <Button onClick={() => setShouldDisconnect(true)} icon={<DisconnectIcon />}>
        {locales.disconnect}
      </Button>
    </PageContent>
  );
};

export default Profile;
