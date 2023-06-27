import React, { useEffect, useState } from "react";
import { useContext } from "../../ConnectWSC";
import { nFormatter, truncateEthAddress } from "../../../utils";

import { useConnect, useDisconnect, useAccount, useNetwork } from "wagmi";

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

import { DisconnectIcon } from "../../../assets/icons";
import CopyToClipboard from "../../Common/CopyToClipboard";
import { AnimatePresence } from "framer-motion";

const Profile: React.FC<{ closeModal?: () => void }> = ({ closeModal }) => {
  const context = useContext();

  const { reset } = useConnect();
  const { disconnect } = useDisconnect();

  const { chain } = useNetwork();
  const { address, isConnected, connector } = useAccount();
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

  const separator = ["web95", "rounded", "minimal"].includes("") ? "...." : undefined;
  return (
    <PageContent>
      <ModalContent style={{ paddingBottom: 22, gap: 6 }}>
        <AvatarContainer>
          <AvatarInner></AvatarInner>
        </AvatarContainer>
        <ModalH1>
          <CopyToClipboard string={address}>
            {truncateEthAddress(address, separator)}
          </CopyToClipboard>
        </ModalH1>
      </ModalContent>
      <Button onClick={() => setShouldDisconnect(true)} icon={<DisconnectIcon />}>
        Disconnect
      </Button>
    </PageContent>
  );
};

export default Profile;
