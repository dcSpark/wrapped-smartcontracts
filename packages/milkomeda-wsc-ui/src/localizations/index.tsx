export type Languages = 'en-US' | 'es-ES' | 'ja-JP';

import { default as enUS } from './locales/en-US';
import { default as esES } from './locales/es-ES';
import { default as jaJP } from './locales/ja-JP';

export const getLocale = (lang: Languages) => {
  switch (lang) {
    case 'es-ES':
      return esES;
    case 'ja-JP':
      return jaJP;
    default:
      return enUS;
  }
};

/*
// Could be useful for locale files to use these keys rather than hard-coded into the objects
export const keys = {
  connectorName: '{{ CONNECTORNAME }}',
  connectorShortName: '{{ CONNECTORSHORTNAME }}',
  suggestedExtensionBrowser: '{{ SUGGESTEDEXTENSIONBROWSER }}',
  walletConnectLogo: '{{ WALLETCONNECTLOGO }}',
};
*/
