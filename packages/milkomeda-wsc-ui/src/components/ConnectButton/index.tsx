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

function ConnectWSCButtonInner({
  label,
  showAvatar,
  separator,
}: {
  label?: string;
  showAvatar?: boolean;
  separator?: string;
}) {
  const context = useContext();

  const { address } = useAccount();

  const { chain } = useNetwork();
  const defaultLabel = "Connect WSC";

  return (
    <AnimatePresence initial={false}>
      {address ? (
        <TextContainer
          key="connectedText"
          initial={"initial"}
          animate={"animate"}
          exit={"exit"}
          variants={addressVariants}
          style={{
            height: 40,
            //padding: !showAvatar ? '0 5px' : undefined,
          }}
        >
          <div
            style={{
              position: "relative",
              paddingRight: showAvatar ? 1 : 0,
            }}
          >
            <AnimatePresence initial={false}>
              <Balance />
              {/*<TextContainer*/}
              {/*  key="ckTruncatedAddress"*/}
              {/*  initial={"initial"}*/}
              {/*  animate={"animate"}*/}
              {/*  exit={"exit"}*/}
              {/*  variants={textVariants}*/}
              {/*  style={{*/}
              {/*    position: "relative",*/}
              {/*  }}*/}
              {/*>*/}
              {/*  {truncateEthAddress(address, separator)}{" "}*/}
              {/*</TextContainer>*/}
            </AnimatePresence>
          </div>
        </TextContainer>
      ) : (
        <TextContainer
          key="connectWalletText"
          initial={"initial"}
          animate={"animate"}
          exit={"exit"}
          variants={contentVariants}
          style={{
            height: 40,
            //padding: '0 5px',
          }}
        >
          {label ? label : defaultLabel}
        </TextContainer>
      )}
    </AnimatePresence>
  );
}

type ConnectKitButtonProps = {
  // Options

  // Events
  onClick?: (open: () => void) => void;
};

export function ConnectWSCButton({ onClick }: ConnectKitButtonProps) {
  const isMounted = useIsMounted();

  const context = useContext();

  const { isConnected, address } = useAccount();
  const { chain } = useNetwork();

  function show() {
    context.setOpen(true);
    context.setRoute(isConnected ? routes.PROFILE : routes.CONNECTORS);
  }

  const separator = ["web95", "rounded", "minimal"].includes("") ? "...." : undefined;

  if (!isMounted) return null;

  const shouldShowBalance = !chain?.unsupported;
  const willShowBalance = address && shouldShowBalance;

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
      >
        {shouldShowBalance && (
          <AnimatePresence initial={false}>
            {willShowBalance && (
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
                  width: "auto",
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
                    {context.titleModalTx || "Start your WSC journey"}
                  </motion.div>
                </ThemedButton>
              </motion.div>
            )}
          </AnimatePresence>
        )}
        <ThemedButton
          style={
            shouldShowBalance && address
              ? {
                  /** Special fix for the retro theme... not happy about this one */
                  boxShadow: "var(--ck-connectbutton-balance-connectbutton-box-shadow)",
                  borderRadius: "var(--ck-connectbutton-balance-connectbutton-border-radius)",
                  overflow: "hidden",
                }
              : {
                  overflow: "hidden",
                }
          }
        >
          <ConnectWSCButtonInner separator={separator} />
        </ThemedButton>
      </ThemeContainer>
    </ResetContainer>
  );
}
