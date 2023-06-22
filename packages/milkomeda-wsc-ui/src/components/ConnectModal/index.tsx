import { useEffect } from "react";
import { useAccount, useNetwork } from "wagmi";
import { routes, useContext } from "../ConnectWSC";
import Modal from "../Common/Modal";

import Onboarding from "../Pages/Onboarding";
import Connectors from "../Pages/Connectors";
import MobileConnectors from "../Pages/MobileConnectors";
import ConnectUsing from "./ConnectUsing";
import DownloadApp from "../Pages/DownloadApp";
import Profile from "../Pages/Profile";

const ConnectModal = () => {
  const context = useContext();
  const { isConnected } = useAccount();
  const { chain } = useNetwork();

  //if chain is unsupported we enforce a "switch chain" prompt
  const closeable = !chain?.unsupported;

  const showBackButton =
    closeable && context.route !== routes.CONNECTORS && context.route !== routes.PROFILE;

  const onBack = () => {
    if (context.route === routes.DOWNLOAD) {
      context.setRoute(routes.CONNECT);
    } else {
      context.setRoute(routes.CONNECTORS);
    }
  };

  const pages: any = {
    onboarding: <Onboarding />,
    download: <DownloadApp connectorId={context.connector} />,
    connectors: <Connectors />,
    mobileConnectors: <MobileConnectors />,
    connect: <ConnectUsing connectorId={context.connector} />,
    profile: <Profile />,
  };

  function hide() {
    context.setOpen(false);
  }

  useEffect(() => {
    if (isConnected) {
      if (context.route !== routes.PROFILE) {
        hide(); // Hide on connect
      }
    } else {
      hide(); // Hide on connect
    }
  }, [isConnected]);

  return (
    <Modal
      open={context.open}
      pages={pages}
      pageId={context.route}
      onClose={closeable ? hide : undefined}
      onInfo={undefined}
      onBack={showBackButton ? onBack : undefined}
    />
  );
};

export default ConnectModal;
