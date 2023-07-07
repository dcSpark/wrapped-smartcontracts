import React from "react";
import { Chain, useAccount, useNetwork } from "wagmi";
import useIsMounted from "../../hooks/useIsMounted";

import { TextContainer } from "./styles";
import { routes, useContext } from "../ConnectWSC";

import { AnimatePresence, Variants, motion } from "framer-motion";
import { Balance } from "../BalanceButton";
import ThemedButton, { ThemeContainer } from "../Common/ThemedButton";
import { ResetContainer } from "../../styles";

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

const addressVariants: Variants = {
  initial: {
    zIndex: 2,
    opacity: 0,
    x: "100%",
  },
  animate: {
    x: 0.2,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 1, 0.5, 1],
    },
  },
  exit: {
    zIndex: 1,
    x: "100%",
    opacity: 0,
    pointerEvents: "none",
    position: "absolute",
    transition: {
      duration: 0.4,
      ease: [0.25, 1, 0.5, 1],
    },
  },
};

const textVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 1, 0.5, 1],
    },
  },
  exit: {
    position: "absolute",
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 1, 0.5, 1],
    },
  },
};

const defaultLabel = "Connect WSC";

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
  const { isConnected, address } = useAccount();

  function show() {
    context.setOpen(true);
    if (!isConnected) {
      context.setRoute(routes.CONNECTORS);
      return;
    }
    context.setRoute(context.acceptedWSC ? routes.STEPPER : routes.OVERVIEW);
  }

  if (!isMounted) return null;

  return (
    <ResetContainer>
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
              <ThemedButton variant={"secondary"} style={{ overflow: "hidden" }}>
                <motion.div style={{ paddingRight: 24 }}>
                  {context.titleModalTx || "Interact with WSC"}
                </motion.div>
              </ThemedButton>
            </motion.div>
          ) : (
            <ThemedButton variant={"secondary"}>
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
