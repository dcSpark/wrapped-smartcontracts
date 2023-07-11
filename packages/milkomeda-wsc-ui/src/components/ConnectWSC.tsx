import React, {
  createContext,
  createElement,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { Buffer } from 'buffer';
import {
  CustomTheme,
  Languages,
  Mode,
  Theme,
  CustomAvatarProps,
} from '../types';

import defaultTheme from '../styles/defaultTheme';

import ConnectWSCModal from './ConnectModal';
import { ThemeProvider } from 'styled-components';
import { useThemeFont } from '../hooks/useGoogleFont';

import { useChains } from '../hooks/useChains';
import {
  useConnectCallback,
  useConnectCallbackProps,
} from '../hooks/useConnectCallback';

export const routes = {
  ONBOARDING: 'onboarding',
  CONNECTORS: 'connectors',
  MOBILECONNECTORS: 'mobileConnectors',
  CONNECT: 'connect',
  DOWNLOAD: 'download',
  PROFILE: 'profile',
};

type Connector = any;
type Error = string | React.ReactNode | null;

type ContextValue = {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  mode: Mode;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
  customTheme: CustomTheme | undefined;
  setCustomTheme: React.Dispatch<React.SetStateAction<CustomTheme | undefined>>;
  lang: Languages;
  setLang: React.Dispatch<React.SetStateAction<Languages>>;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  route: string;
  setRoute: React.Dispatch<React.SetStateAction<string>>;
  connector: string;
  setConnector: React.Dispatch<React.SetStateAction<Connector>>;
  errorMessage: Error;
  options?: ConnectWSCOptions;
  debugMode?: boolean;
  log: (...props: any) => void;
  displayError: (message: string | React.ReactNode | null, code?: any) => void;
} & useConnectCallbackProps;

export const Context = createContext<ContextValue | null>(null);

export type ConnectWSCOptions = {
  language?: Languages;
  hideBalance?: boolean;
  hideTooltips?: boolean;
  hideRecentBadge?: boolean;
  walletConnectCTA?: 'link' | 'modal' | 'both';
  avoidLayoutShift?: boolean; // Avoids layout shift when the ConnectKit modal is open by adding padding to the body
  embedGoogleFonts?: boolean; // Automatically embeds Google Font of the current theme. Does not work with custom themes
  reducedMotion?: boolean;
  disclaimer?: ReactNode | string;
  bufferPolyfill?: boolean;
  customAvatar?: React.FC<CustomAvatarProps>;
  initialChainId?: number;
  enforceSupportedChains?: boolean;
  ethereumOnboardingUrl?: string;
  overlayBlur?: number; // Blur the background when the modal is open
};

type ConnectKitProviderProps = {
  children?: React.ReactNode;
  theme?: Theme;
  mode?: Mode;
  customTheme?: CustomTheme;
  options?: ConnectWSCOptions;
  debugMode?: boolean;
} & useConnectCallbackProps;

export const ConnectWSCProvider: React.FC<ConnectKitProviderProps> = ({
  children,
  theme = 'auto',
  mode = 'auto',
  customTheme,
  options,
  onConnect,
  onDisconnect,
  debugMode = false,
}) => {
  // Only allow for mounting ConnectKitProvider once, so we avoid weird global
  // state collisions.
  if (React.useContext(Context)) {
    throw new Error(
      'Multiple, nested usages of ConnectWSCProvider detected. Please use only one.'
    );
  }

  useConnectCallback({
    onConnect,
    onDisconnect,
  });

  const chains = useChains();

  // Default config options
  const defaultOptions: ConnectWSCOptions = {
    language: 'en-US',
    hideBalance: false,
    hideTooltips: false,
    walletConnectCTA: 'link',
    hideRecentBadge: false,
    avoidLayoutShift: true,
    embedGoogleFonts: false,
    reducedMotion: false,
    disclaimer: null,
    bufferPolyfill: true,
    customAvatar: undefined,
    initialChainId: chains?.[0]?.id,
    enforceSupportedChains: true,
    ethereumOnboardingUrl: undefined,
  };

  const opts: ConnectWSCOptions = Object.assign({}, defaultOptions, options);

  if (typeof window !== 'undefined') {
    // Buffer Polyfill, needed for bundlers that don't provide Node polyfills (e.g CRA, Vite, etc.)
    if (opts.bufferPolyfill) window.Buffer = window.Buffer ?? Buffer;

    // Some bundlers may need `global` and `process.env` polyfills as well
    // Not implemented here to avoid unexpected behaviors, but leaving example here for future reference
    /*
     * window.global = window.global ?? window;
     * window.process = window.process ?? { env: {} };
     */
  }

  const [ckTheme, setTheme] = useState<Theme>(theme);
  const [ckMode, setMode] = useState<Mode>(mode);
  const [ckCustomTheme, setCustomTheme] = useState<CustomTheme | undefined>(
    customTheme ?? {}
  );
  const [ckLang, setLang] = useState<Languages>('en-US');
  const [open, setOpen] = useState<boolean>(false);
  const [connector, setConnector] = useState<string>('');
  const [route, setRoute] = useState<string>(routes.CONNECTORS);
  const [errorMessage, setErrorMessage] = useState<Error>('');

  // Include Google Font that is needed for a themes
  if (opts.embedGoogleFonts) useThemeFont(theme);

  // Other Configuration
  useEffect(() => setTheme(theme), [theme]);
  useEffect(() => setLang(opts.language || 'en-US'), [opts.language]);
  useEffect(() => setErrorMessage(null), [route, open]);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const log = debugMode ? console.log : () => {};

  const value = {
    theme: ckTheme,
    setTheme,
    mode: ckMode,
    setMode,
    customTheme,
    setCustomTheme,
    lang: ckLang,
    setLang,
    open,
    setOpen,
    route,
    setRoute,
    connector,
    setConnector,
    onConnect,
    // Other configuration
    options: opts,
    errorMessage,
    debugMode,
    log,
    displayError: (message: string | React.ReactNode | null, code?: any) => {
      setErrorMessage(message);
      console.log('---------CONNECTWSC DEBUG---------');
      console.log(message);
      if (code) console.table(code);
      console.log('---------/CONNECTWSC DEBUG---------');
    },
  };

  return createElement(
    Context.Provider,
    { value },
    <>
      <ThemeProvider theme={defaultTheme}>
        {children}
        <ConnectWSCModal
          lang={ckLang}
          theme={ckTheme}
          mode={mode}
          customTheme={ckCustomTheme}
        />
      </ThemeProvider>
    </>
  );
};

export const useContext = () => {
  const context = React.useContext(Context);
  if (!context) throw Error('ConnectWSC Hook must be inside a Provider.');
  return context;
};
