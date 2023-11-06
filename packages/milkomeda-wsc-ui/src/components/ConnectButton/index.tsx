import React from "react";
import { Chain, useAccount, useNetwork } from "wagmi";
import useIsMounted from "../../hooks/useIsMounted";

import { TextContainer } from "./styles";
import { routes, useContext } from "../ConnectWSC";

import { AnimatePresence, Variants, motion } from "framer-motion";
import ThemedButton, { ThemeContainer } from "../Common/ThemedButton";
import { ResetContainer } from "../../styles";
import { useTransactionConfigWSC } from "../TransactionConfigWSC";
import { useModal } from "../../hooks/useModal";
import { truncateEthAddress } from "../../utils";

const contentVariants: Variants = {
  initial: {
    zIndex: 2,
    opacity: 0,
    x: "-100%",
  },
  animate: {
    opacity: 1,
    x: 0.1,
    transition: {
      duration: 0.4,
      ease: [0.25, 1, 0.5, 1],
    },
  },
  exit: {
    zIndex: 1,
    opacity: 0,
    x: "-100%",
    pointerEvents: "none",
    position: "absolute",
    transition: {
      duration: 0.4,
      ease: [0.25, 1, 0.5, 1],
    },
  },
};

const defaultLabel = "Connect WSC";

type ConnectButtonRendererProps = {
  children?: (renderProps: {
    show?: () => void;
    hide?: () => void;
    chain?: Chain & {
      unsupported?: boolean;
    };
    unsupported: boolean;
    isConnected: boolean;
    isConnecting: boolean;
    address?: `0x${string}`;
    truncatedAddress?: string;
  }) => React.ReactNode;
};
const ConnectButtonRenderer: React.FC<ConnectButtonRendererProps> = ({ children }) => {
  const isMounted = useIsMounted();
  const context = useContext();
  const { open, setOpen } = useModal();

  const { chain } = useNetwork();
  const { address, isConnected } = useAccount();

  function hide() {
    setOpen(false);
  }

  function show() {
    context.setOpen(true);
    if (!isConnected) {
      context.setRoute(routes.CONNECTORS);
      return;
    }
    context.setRoute(routes.STEPPER);
  }

  if (!children) return null;
  if (!isMounted) return null;

  return (
    <>
      {children({
        show,
        hide,
        chain: chain,
        unsupported: !!chain?.unsupported,
        isConnected: !!address,
        isConnecting: open, // Using `open` to determine if connecting as wagmi isConnecting only is set to true when an active connector is awaiting connection
        address: address,
        truncatedAddress: address ? truncateEthAddress(address) : undefined,
      })}
    </>
  );
};

ConnectButtonRenderer.displayName = "ConnectWSCButton.Custom";

type ConnectKitButtonProps = {
  // Options
  label?: string;
  disabled?: boolean;

  // Events
  onClick?: (open: () => void) => void;
};

export function ConnectWSCButton({ label, onClick, disabled = false }: ConnectKitButtonProps) {
  const isMounted = useIsMounted();
  const context = useContext();
  const { options } = useTransactionConfigWSC();
  const { isConnected, address } = useAccount();

  function show() {
    context.setOpen(true);
    if (!isConnected) {
      context.setRoute(routes.CONNECTORS);
      return;
    }
    context.setRoute(routes.STEPPER);
  }

  if (!isMounted) return null;

  return (
    <ResetContainer $customTheme={context.customTheme}>
      <ThemeContainer
        onClick={() => {
          if (onClick) {
            onClick(show);
          } else {
            show();
          }
        }}
        disabled={disabled}
      >
        <AnimatePresence initial={false}>
          {address ? (
            <motion.div
              key={"balance"}
              initial={{
                opacity: 0,
                x: "100%",
                width: 0,
                marginRight: 0,
              }}
              animate={{
                opacity: 1,
                x: 0,
                width: "100%",
                marginRight: -24,
                transition: {
                  duration: 0.4,
                  ease: [0.25, 1, 0.5, 1],
                },
              }}
              exit={{
                opacity: 0,
                x: "100%",
                width: 0,
                marginRight: 0,
                transition: {
                  duration: 0.4,
                  ease: [0.25, 1, 0.5, 1],
                },
              }}
            >
              <ThemedButton variant="primary" style={{ overflow: "hidden" }}>
                <motion.div style={{ paddingRight: 24 }}>
                  {options.titleModal ?? "Interact with WSC"}
                </motion.div>
              </ThemedButton>
            </motion.div>
          ) : (
            <ThemedButton variant="primary">
              <TextContainer
                key="connectWalletText"
                initial={"initial"}
                animate={"animate"}
                exit={"exit"}
                variants={contentVariants}
                style={{
                  height: 40,
                }}
              >
                {label ? label : defaultLabel}
              </TextContainer>
            </ThemedButton>
          )}
        </AnimatePresence>
      </ThemeContainer>
    </ResetContainer>
  );
}

ConnectWSCButton.Custom = ConnectButtonRenderer;
