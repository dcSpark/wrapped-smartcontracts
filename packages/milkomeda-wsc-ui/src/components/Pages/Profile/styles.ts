import { keyframes } from "styled-components";
import styled from "../../../styles/styled";
import { motion } from "framer-motion";

export const StepperTransactionContainer = styled(motion.div)`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 16px;
  padding-top: 20px;
  padding-right: 20px;
  padding-left: 20px;
  --ck-primary-button-background: rgb(55, 55, 55);
  --ck-primary-button-color: #ffffff;
  --ck-primary-button-border-radius: 16px;
  --ck-primary-button-font-weight: 600;
  --ck-primary-button-hover-background: #404040;
`;

export const StepperTransactionInner = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
`;
export const StepperTransactionContent = styled(motion.div)<{ $step: number }>`
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: space-between;
  padding: 16px;
  ${({ $step }) => ($step === 0 || $step === 3 ? `min-height: 500px;` : `min-height: 300px;`)}
`;

export const BalanceContainer = styled(motion.div)`
  position: relative;
`;
export const Balance = styled(motion.div)`
  position: relative;
  min-width: 150px;
  text-align: left;
  display: flex;
  gap: 9px;
  svg {
    width: 18px;
    height: 18px;
    color: rgb(153 153 153);
  }
  span {
    color: rgb(55 55 55);
    font-size: 1.125rem;
  }
`;
const PlaceholderKeyframes = keyframes`
  0%{ background-position: 100% 0; }
  100%{ background-position: -100% 0; }
`;
export const LoadingBalance = styled(motion.div)`
  min-width: 150px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  background: var(--ck-body-background-secondary);
  inset: 0;
  &:before {
    z-index: 4;
    content: "";
    position: absolute;
    inset: 0;
    background-image: linear-gradient(
      90deg,
      var(--ck-body-background-transparent) 50%,
      var(--ck-body-background),
      var(--ck-body-background-transparent)
    );
    opacity: 0.75;
    background-size: 200% 100%;
    animation: ${PlaceholderKeyframes} 1000ms linear infinite both;
  }
`;
