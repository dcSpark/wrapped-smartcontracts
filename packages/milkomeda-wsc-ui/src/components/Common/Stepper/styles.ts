import { motion } from "framer-motion";
import styled from "../../../styles/styled";
import { css } from "styled-components";
import * as Separator from "@radix-ui/react-separator";
import defaultTheme from "../../../constants/defaultTheme";

export const StepperStepLabelContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: ${({ $isLabelVertical }) => ($isLabelVertical ? "center" : "flex-start")};
  text-align: ${({ $isLabelVertical }) => ($isLabelVertical ? "center" : "left")};
  position: relative;
  min-height: 80px;
  &[aria-current="step"] {
    color: var(--wsc-body-color);
  }
`;
export const StepperStepOptionalLabel = styled(motion.span)`
  font-size: 0.875rem;
  color: rgb(113, 113, 122);
  margin-left: 4px;
`;
export const StepperSteLabelDescription = styled(motion.span)`
  font-size: 0.875rem;
  color: var(--wsc-body-color-muted);
  position: absolute;
  bottom: 20px;
  white-space: nowrap;
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
    `};

  @media only screen and(max-width: ${defaultTheme.mobileWidth}px) {
    min-height: 10px;
  }
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
  flex: 1 1 0;
  width: 100%;
  justify-content: space-between;
  //gap: 16px;
  text-align: center;
  flex-direction: ${({ $isVertical }) => ($isVertical ? "column" : "row")};
  padding-left: 40px;
  padding-right: 40px;
  @media only screen and (max-width: ${defaultTheme.mobileWidth}px) {
    padding-left: 10px;
    padding-right: 10px;
  }
`;
export const StepperStepRow = styled(motion.div)<{ $isLabelVertical?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 100px;
  position: relative;
  z-index: 1;

  ${({ $isLabelVertical }) =>
    $isLabelVertical &&
    css`
      flex-direction: column;
    `};

  @media only screen and (max-width: ${defaultTheme.mobileWidth}px) {
    max-width: 100%;
  }
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
  background: var(--wsc-stepper-background-circle);
  box-shadow: var(--wsc-stepper-box-shadown-circle, none);
  font-weight: 500;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 0.15s;

  &[aria-current="step"] {
    background: var(--wsc-stepper-current-background-circle);
  }

  &[data-highlighted="true"] {
    background-color: var(--wsc-stepper-highlighted-background-circle, rgb(14, 117, 55));
    color: var(--wsc-stepper-highlighted-text-circle, white);
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
  background-color: var(--wsc-stepper-separator);
  position: absolute;
  width: 100%;
  top: 24px;
  left: 45px;
  &[data-highlighted="true"] {
    background-color: var(--wsc-stepper-highlighted-background-circle, rgb(14, 117, 55));
  }
`;
