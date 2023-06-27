import { motion } from "framer-motion";
import styled from "../../../styles/styled";
import { css } from "styled-components";

export const StepperStepLabelContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: ${({ isLabelVertical }) => (isLabelVertical ? "center" : "flex-start")}
  text-align: ${({ isLabelVertical }) => (isLabelVertical ? "center" : "left")}

`;
export const StepperStepOptionalLabel = styled(motion.span)`
  font-size: 0.875rem;
  color: gray;
  margin-left: 4px;
`;
export const StepperSteLabelDescription = styled(motion.span)`
  font-size: 0.875rem;
  color: gray;
`;
export const StepperStepConnectorContainer = styled(motion.div)`
  margin-left: 24px;
  display: flex;
  margin-top: 0.25rem;
  height: auto;
  min-height: 2rem;
  flex: 1 1 0;
  align-self: stretch;
  border-left-width: 2px;
  ${({ isLastStep }) =>
    isLastStep &&
    css`
      min-height: 0;
      border-color: transparent;
    `}
  ${({ isCompletedStep }) =>
    isCompletedStep &&
    css`
      border-color: green;
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

  ${({ isLastStep }) =>
    isLastStep
      ? css`
          justify-content: flex-end;
          flex: 0 0 auto;
        `
      : css`
          justify-content: flex-start;
          flex: 1 0 auto;
        `}
  ${({ isVertical }) =>
    isVertical
      ? css`
          flex-direction: column;
        `
      : css`
          align-items: center;
        `}
  ${({ isClickable }) =>
    isClickable &&
    css`
      cursor: pointer;
    `}
  ${({ isVertical, isLastStep }) =>
    isVertical &&
    isLastStep &&
    css`
      flex-direction: column;
      align-items: flex-start;
      flex: 1 0 auto;
      justify-content: flex-start;
      width: 100%;
    `}
`;

export const StepperContainer = styled(motion.div)`
  display: flex;
  flex: 1 1 auto;
  width: 100%;
  justify-content: space-between;
  gap: 16px;
  text-align: center;
  flex-direction: ${({ isVertical }) => (isVertical ? "column" : "row")};
`;
export const StepperStepRow = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 8px;
  ${({ isLabelVertical }) =>
    isLabelVertical &&
    css`
      flex-direction: column;
    `}
`;
export const StepperStepButton = styled(motion.div)`
  height: 48px;
  width: 48px;
  border-radius: 9999px;

  data-[highlighted="true"] {
    background-color: green;
    color: white;
  }

  ${({ isCompletedStep }) =>
    isCompletedStep &&
    css`
      padding: 8px 12px;
    `}
`;
