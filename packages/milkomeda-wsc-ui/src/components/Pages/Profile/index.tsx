import React, { useEffect, useState } from "react";
import { useContext } from "../../ConnectWSC";

import { useConnect, useDisconnect, useAccount, useNetwork } from "wagmi";

import { ModalBody, ModalContent, MainPageContent } from "../../Common/Modal/styles";

import TransactionStepper from "../../TransactionStepper";

const Profile: React.FC<{ closeModal?: () => void }> = ({ closeModal }) => {
  const context = useContext();

  const { reset } = useConnect();
  const { disconnect } = useDisconnect();

  const { isConnected } = useAccount();
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
        <ModalBody>
          <TransactionStepper />
        </ModalBody>
      </ModalContent>
    </MainPageContent>
  );
};

export default Profile;
