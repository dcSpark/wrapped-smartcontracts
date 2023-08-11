import styled from "../../../styles/styled";
import { motion } from "framer-motion";
import defaultTheme from "../../../constants/defaultTheme";

export const AlertContainer = styled(motion.div)`
  display: flex;
  gap: 8px;
  position: relative;
  border-radius: 9px;
  margin: 0 auto;
  padding: 10px;
  text-align: left;
  font-size: 14px;
  line-height: 17px;
  font-weight: 400;
  max-width: 260px;
  min-width: 100%;

  border-radius: var(--wsc-alert-border-radius, 12px);
  color: var(--wsc-alert-color, var(--wsc-body-color-muted));
  background: var(--wsc-alert-background, var(--wsc-body-background-secondary));
  box-shadow: var(--wsc-alert-box-shadow, var(--wsc-body-box-shadow));

  @media only screen and (max-width: ${defaultTheme.mobileWidth}px) {
    padding: 16px;
    font-size: 16px;
    line-height: 21px;
    border-radius: 24px;
    text-align: center;
  }
`;

export const IconContainer = styled(motion.div)`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  svg {
    display: block;
    width: 100%;
    height: auto;
  }
`;
