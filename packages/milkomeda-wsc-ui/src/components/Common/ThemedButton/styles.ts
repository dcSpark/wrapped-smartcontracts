import { motion } from "framer-motion";
import styled from "../../../styles/styled";

export const Container = styled(motion.div)<{
  $variant?: string;
}>`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  height: 40px;
  width: 100%;
  padding: 0;
  line-height: 0;
  letter-spacing: -0.2px;
  font-size: var(--wsc-connectbutton-font-size, 16px);
  font-weight: var(--wsc-connectbutton-font-weight, 500);
  text-align: center;
  transition: 100ms ease;
  transition-property: color, background, box-shadow, border-radius;

  color: var(--color);
  background: var(--background);
  box-shadow: var(--box-shadow);
  border-radius: var(--border-radius);

  &.primary {
    --color: var(--wsc-connectbutton-color);
    --background: var(--wsc-connectbutton-background);
    --box-shadow: var(--wsc-connectbutton-box-shadow);
    --border-radius: var(--wsc-connectbutton-border-radius, 12px);

    --hover-color: var(--wsc-connectbutton-hover-color, var(--color));
    --hover-background: var(--wsc-connectbutton-hover-background, var(--background));
    --hover-box-shadow: var(--wsc-connectbutton-hover-box-shadow, var(--box-shadow));
    --hover-border-radius: var(--wsc-connectbutton-hover-border-radius, var(--border-radius));

    --active-color: var(--wsc-connectbutton-active-color, var(--hover-color));
    --active-background: var(--wsc-connectbutton-active-background, var(--hover-background));
    --active-box-shadow: var(--wsc-connectbutton-active-box-shadow, var(--hover-box-shadow));
    --active-border-radius: var(
      --wsc-connectbutton-active-border-radius,
      var(--hover-border-radius)
    );
  }
  &.secondary {
    --color: var(--wsc-connectbutton-secondary-color);
    --background: var(--wsc-connectbutton-secondary-background);
    --box-shadow: var(--wsc-connectbutton-secondary-box-shadow);
    --border-radius: var(
      --wsc-connectbutton-secondary-border-radius,
      var(--wsc-connectbutton-border-radius, 12px)
    );

    --hover-color: var(--wsc-connectbutton-secondary-hover-color, var(--color));
    --hover-background: var(--wsc-connectbutton-secondary-hover-background, var(--background));
    --hover-box-shadow: var(--wsc-connectbutton-secondary-hover-box-shadow, var(--box-shadow));
    --hover-border-radius: var(
      --wsc-connectbutton-secondary-hover-border-radius,
      var(--border-radius)
    );

    --active-color: var(--wsc-connectbutton-secondary-active-color, var(--hover-color));
    --active-background: var(
      --wsc-connectbutton-secondary-active-background,
      var(--hover-background)
    );
    --active-box-shadow: var(
      --wsc-connectbutton-secondary-active-box-shadow,
      var(--hover-box-shadow)
    );
    --active-border-radius: var(
      --wsc-connectbutton-secondary-active-border-radius,
      var(--hover-border-radius)
    );
  }
`;

export const ThemeContainer = styled.button`
  all: initial;
  appearance: none;
  user-select: none;
  position: relative;
  padding: 0;
  margin: 0;
  background: none;
  border-radius: var(--wsc-border-radius);

  width: 100%;

  &:disabled {
    pointer-events: none;
    opacity: 0.3;
  }

  display: flex;
  flex-wrap: nowrap;
  cursor: pointer;
  * {
    cursor: pointer;
  }
  &:hover {
    ${Container} {
      color: var(--hover-color, var(--color));
      background: var(--hover-background, var(--background));
      box-shadow: var(--hover-box-shadow, var(--box-shadow));
      border-radius: var(--hover-border-radius, var(--border-radius));
    }
  }
  &:active {
    ${Container} {
      color: var(--active-color, var(--hover-color, var(--color)));
      background: var(--active-background, var(--hover-background, var(--background)));
      box-shadow: var(--active-box-shadow, var(--hover-box-shadow, var(--box-shadow)));
      border-radius: var(--active-border-radius, var(--hover-border-radius, var(--border-radius)));
    }
  }
  &:focus-visible {
    outline: 2px solid var(--wsc-family-brand);
  }
`;
