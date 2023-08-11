import React, { createContext, createElement } from "react";
import { CustomTheme } from "../ConnectWSC";

type ContextValue = {
  customTheme?: CustomTheme;
};

const Context = createContext<ContextValue | null>(null);

type ConnectKitThemeProviderProps = {
  children?: React.ReactNode;
  customTheme?: CustomTheme;
};

export const ConnectKitThemeProvider: React.FC<ConnectKitThemeProviderProps> = ({
  children,
  customTheme,
}) => {
  const value = {
    customTheme,
  };

  return createElement(Context.Provider, { value }, <>{children}</>);
};

export const useThemeContext = () => {
  const context = React.useContext(Context);
  if (!context) throw Error("ConnectKitThemeProvider must be inside a Provider.");
  return context;
};
