import styled from "./styled";
import { css } from "styled-components";
import { motion } from "framer-motion";
import { hexToP3 } from "../utils/p3";

import predefinedThemes from "./themes";

/**
 * Theme variables for the modal
 */
const themeGlobals = {
  default: {
    "--ck-font-family": `-apple-system, Helvetica,
    'Apple Color Emoji', Arial, sans-serif, 'Segoe UI Emoji',
    'Segoe UI Symbol'`,
    "--ck-border-radius": "20px",
    "--ck-secondary-button-border-radius": "16px",
  },
  graphics: {
    light: {},
    dark: {},
  },
  brand: {
    "--ck-family-brand": "rgb(255, 152, 40)",
  },
};
const themeColors = {
  light: predefinedThemes.base.light,
  dark: predefinedThemes.base.dark,
  web95: predefinedThemes.web95,
  retro: predefinedThemes.retro,
  soft: predefinedThemes.soft,
  midnight: predefinedThemes.midnight,
  minimal: predefinedThemes.minimal,
  rounded: predefinedThemes.rounded,
  nouns: predefinedThemes.nouns,
};

/**
 *  Automatically use p3 if available
 */
//  TODO: Don't use :any type
const createCssVars = (scheme: object) => {
  return css`
    ${Object.keys(scheme).map((key) => {
      const value = scheme[key];
      return value && `${key}:${value};`;
    })}
  `;
};
const createCssColors = (scheme: object, override?: boolean) => {
  const important = override ? " !important" : "";
  return css`
    ${Object.keys(scheme).map((key) => {
      const value = scheme[key];
      return value && `${key}:${value}${important};`;
    })};

    @supports (color: color(display-p3 1 1 1)) {
      ${Object.keys(scheme).map((key) => {
        const value = scheme[key];
        return `${key}:${hexToP3(value)}${important};`;
      })}
    }
  `;
};

const themes = {
  default: createCssVars(themeGlobals.default),
  light: createCssColors(themeColors.light),
  dark: createCssColors(themeColors.dark),
  web95: createCssColors(themeColors.web95),
  retro: createCssColors(themeColors.retro),
  soft: createCssColors(themeColors.soft),
  midnight: createCssColors(themeColors.midnight),
  minimal: createCssColors(themeColors.minimal),
  rounded: createCssColors(themeColors.rounded),
  nouns: createCssColors(themeColors.nouns),
};
const globals = {
  brand: createCssVars(themeGlobals.brand),
  graphicsLight: createCssVars(themeGlobals.graphics.light),
  graphicsDark: createCssVars(themeGlobals.graphics.dark),
};

const globalsLight = css`
  ${globals.brand}
  ${globals.graphicsLight}
`;
const globalsDark = css`
  ${globals.brand}
  ${globals.graphicsDark}
`;

/*
 *  Reset stylings to avoid conflicting with the parent websites styling
 * Automatically apply theme based on system theme
 */
// TODO: Think more about how to reset our components as to not be affected by external stylings
// TODO: Merge theme objects instead of overriding

let mode = "auto";
export const ResetContainer = styled(motion.div)`
  ${themes.default}

  ${(props) => {
    switch (props.$useTheme) {
      case "web95":
        mode = "light";
        return themes.web95;
      case "retro":
        mode = "light";
        return themes.retro;
      case "soft":
        mode = "light";
        return themes.soft;
      case "midnight":
        mode = "dark";
        return themes.midnight;
      case "minimal":
        mode = "light";
        return themes.minimal;
      case "rounded":
        mode = "light";
        return themes.rounded;
      case "nouns":
        mode = "light";
        return themes.nouns;
      default:
        if (props.$useMode === "light") {
          mode = "light";
          return themes.light;
        } else if (props.$useMode === "dark") {
          mode = "dark";
          return themes.dark;
        } else {
          return css`
            @media (prefers-color-scheme: light) {
              ${themes.light}
            }
            @media (prefers-color-scheme: dark) {
              ${themes.dark}
            }
          `;
        }
    }
  }}

  ${() => {
    switch (mode) {
      case "light":
        return globalsLight;
      case "dark":
        return globalsDark;
      default:
        return css`
          ${globalsLight};
          @media (prefers-color-scheme: dark) {
            ${globalsDark}
          }
        `;
    }
  }}


  ${(props) => {
    if (
      props.$customTheme &&
      props.$customTheme["--ck-accent-color"] &&
      ["light", "dark", "auto", "", undefined].includes(props.$useTheme)
    ) {
      const accentColor = props.$customTheme["--ck-accent-color"];
      const accentTextColor = props.$customTheme["--ck-accent-text-color"] ?? "#ffffff";
      return {
        "--ck-accent-color": accentColor,
        "--ck-accent-text-color": accentTextColor,
        // '--ck-connectbutton-color': accentTextColor,
        // '--ck-connectbutton-background': accentColor,
        // '--ck-connectbutton-background-hover': accentColor,
        // '--ck-connectbutton-background-active': LightenDarkenColor(
        // accentColor,
        // 20
        // ),
        "--ck-secondary-button-background": accentColor,
        "--ck-secondary-button-hover-background": accentColor,
        "--ck-secondary-button-color": accentTextColor,
        "--ck-button-primary-color": accentTextColor,
        "--ck-focus-color": accentColor,
      };
    }
    if (props.$customTheme) {
      return createCssColors(props.$customTheme, true);
    }
  }}

  all: initial;
  text-align: left;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-text-stroke: 0.001px transparent;
  text-size-adjust: none;
  font-size: 16px;

  button {
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    -webkit-text-stroke: 0.001px transparent;
  }

  &,
  * {
    font-family: var(--ck-font-family);
    box-sizing: border-box;
    outline: none;
    border: none;
  }
  /*
  @media (prefers-reduced-motion) {
    * {
      animation-duration: 60ms !important;
      transition-duration: 60ms !important;
    }
  }
  */
  img,
  svg {
    max-width: 100%;
  }
  strong {
    font-weight: 600;
  }
  a:focus-visible,
  button:focus-visible {
    outline: 2px solid var(--ck-focus-color);
  }
`;
