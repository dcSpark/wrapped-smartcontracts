import { keyframes } from "styled-components";
import styled from "../../../styles/styled";
import { motion } from "framer-motion";

export const StepperTransactionContainer = styled(motion.div)`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 16px;
  padding-top: 10px;
  padding-right: 20px;
  padding-left: 20px;
  --wsc-primary-button-background: rgb(55, 55, 55);
  --wsc-primary-button-color: #ffffff;
  --wsc-primary-button-border-radius: 16px;
  --wsc-primary-button-font-weight: 600;
  --wsc-primary-button-hover-background: #404040;
`;

export const StepperTransactionInner = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
`;
export const StepperTransactionContent = styled(motion.div)`
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: space-between;
  padding: 0 16px;
`;
export const StepperTransactionSuccess = styled(motion.div)`
  padding: 16px;
  h1 {
    font-size: 1.25rem;
    color: var(--wsc-body-color);
  }
`;

export const BalanceContainer = styled(motion.div)`
  position: relative;
`;
export const Balance = styled(motion.div)`
  position: relative;
  text-align: left;
  display: flex;
  gap: 9px;
  svg {
    width: 18px;
    height: 18px;
    color: var(--wsc-body-color-muted);
  }
  span {
    color: var(--wsc-body-color);
    font-size: 1.125rem;
  }
`;
const PlaceholderKeyframes = keyframes`
  0%{ background-position: 100% 0; }
  100%{ background-position: -100% 0; }
`;
export const LoadingBalance = styled(motion.div)`
  max-width: 150px;
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  background: var(--wsc-body-background-secondary);
  inset: 0;
  &:before {
    z-index: 4;
    content: "";
    position: absolute;
    inset: 0;
    background-image: linear-gradient(
      90deg,
      var(--wsc-body-background-transparent) 50%,
      var(--wsc-body-background),
      var(--wsc-body-background-transparent)
    );
    opacity: 0.75;
    background-size: 200% 100%;
    animation: ${PlaceholderKeyframes} 1000ms linear infinite both;
  }
`;
