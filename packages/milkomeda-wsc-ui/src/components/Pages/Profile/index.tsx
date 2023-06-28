import React, { useEffect, useState } from "react";
import { useContext } from "../../ConnectWSC";
import { truncateEthAddress } from "../../../utils";

import { useConnect, useDisconnect, useAccount, useNetwork } from "wagmi";

import { ModalBody, ModalContent, ModalH1, MainPageContent } from "../../Common/Modal/styles";
import Button from "../../Common/Button";

import { DisconnectIcon } from "../../../assets/icons";
import CopyToClipboard from "../../Common/CopyToClipboard";
import { AnimatePresence } from "framer-motion";
import TransactionStepper from "../../TransactionStepper";

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

  return (
    <MainPageContent>
      <ModalContent style={{ paddingBottom: 22, gap: 6, marginBottom: 40 }}>
        {/*<ModalH1>*/}
        {/*<CopyToClipboard string={address}>{truncateEthAddress(address, "....")}</CopyToClipboard>*/}
        {/*Wrapped Smart Contracts*/}
        {/*</ModalH1>*/}
        <ModalBody>
          <TransactionStepper />
        </ModalBody>
      </ModalContent>
      {/*<Button onClick={() => setShouldDisconnect(true)} icon={<DisconnectIcon />}>*/}
      {/*  Disconnect*/}
      {/*</Button>*/}
    </MainPageContent>
  );
};

export default Profile;
