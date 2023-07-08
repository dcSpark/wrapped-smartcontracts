import { motion } from "framer-motion";
import styled from "../../../styles/styled";
import { css } from "styled-components";
import * as Separator from "@radix-ui/react-separator";

export const StepperStepLabelContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: ${({ $isLabelVertical }) => ($isLabelVertical ? "center" : "flex-start")};
  text-align: ${({ $isLabelVertical }) => ($isLabelVertical ? "center" : "left")};
  &[aria-current="step"] {
    color: var(--ck-body-color);
  }
`;
export const StepperStepOptionalLabel = styled(motion.span)`
  font-size: 0.875rem;
  color: rgb(113, 113, 122);
  margin-left: 4px;
`;
export const StepperSteLabelDescription = styled(motion.span)`
  font-size: 0.875rem;
  color: rgb(113, 113, 122);
`;
export const StepperStepConnectorContainer = styled(motion.div)`
  margin-left: 24px;
  display: flex;
  margin-top: 0.25rem;
  height: auto;
  min-height: 2rem;
  flex: 1 1 0;
  align-self: stretch;
  border-left: 2px solid;
  ${({ $isLastStep }) =>
    $isLastStep &&
    css`
      min-height: 0;
      border-color: transparent;
    `}
  ${({ $isCompletedStep }) =>
    $isCompletedStep &&
    css`
      border-color: rgb(14, 117, 55);
    `}
`;

export const StepperStepConnectorLast = styled(motion.div)`
  display: block;
  margin-top: 1rem;
  margin-bottom: 1rem;
  width: 100%;
  height: auto;
`;

export const StepperStepContainer = styled(motion.div)`
  display: flex;
  flex-direction: row;
  position: relative;
  gap: 8px;

  ${({ $isLastStep }) =>
    $isLastStep
      ? css`
          justify-content: flex-end;
          flex: 0 0 auto;
        `
      : css`
          justify-content: flex-start;
          flex: 1 0 auto;
        `}
  ${({ $isVertical }) =>
    $isVertical
      ? css`
          flex-direction: column;
        `
      : css`
          align-items: center;
        `}
  ${({ $isClickable }) =>
    $isClickable &&
    css`
      cursor: pointer;
    `}
  ${({ $isVertical, $isLastStep }) =>
    $isVertical &&
    $isLastStep &&
    css`
      flex-direction: column;
      align-items: flex-start;
      flex: 1 0 auto;
      justify-content: flex-start;
      width: 100%;
    `}
`;

export const StepperContainer = styled(motion.div)<{ $isVertical?: boolean }>`
  display: flex;
  flex: 1 1 0%;
  width: 100%;
  justify-content: space-between;
  gap: 16px;
  text-align: center;
  flex-direction: ${({ $isVertical }) => ($isVertical ? "column" : "row")};
`;
export const StepperStepRow = styled(motion.div)<{ $isLabelVertical?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 100px;

  ${({ $isLabelVertical }) =>
    $isLabelVertical &&
    css`
      flex-direction: column;
    `}
`;
export const StepperStepButton = styled(motion.button)<{ $isCompletedStep?: boolean }>`
  height: 48px;
  width: 48px;
  border-radius: 9999px;
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  background: var(--ck-stepper-background-circle);
  font-weight: 500;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 0.15s;

  &[data-highlighted="true"] {
    background-color: rgb(14, 117, 55);
    color: white;
  }

  &[aria-current="step"] {
    background: var(--ck-stepper-current-background-circle);
  }

  &:hover {
    background-color: rgba(24, 24, 27, 0.9);
  }

  ${({ $isCompletedStep }) =>
    $isCompletedStep &&
    css`
      padding: 8px 12px;
    `}
  ${({ $variant }) =>
    $variant === "destructive" &&
    css`
      background: rgb(239, 68, 68);
    `}
`;

export const StepperSeparator = styled(Separator.Root)`
  flex: 1 1 auto;
  height: 2px;
  min-height: auto;
  align-self: auto;
  background-color: rgb(228, 228, 231);
  &[data-highlighted="true"] {
    background-color: rgb(14, 117, 55);
  }
`;
