/// <reference types="node" />
import React from "react";
declare const truncateEthAddress: (address?: string, separator?: string) => string;
declare const truncateENSAddress: (ensName: string, maxLength: number) => string;
declare const nFormatter: (num: number, digits?: number) => string;
declare const detectBrowser: () => "" | import("detect-browser").Browser | "bot" | "node" | "react-native";
declare const detectOS: () => "" | import("detect-browser").OperatingSystem | NodeJS.Platform;
declare const isAndroid: () => boolean;
declare const isMobile: () => boolean;
declare const getWalletDownloadUri: (connectorId: string) => string;
declare const isFlint: () => boolean | undefined;
declare const isEternl: () => boolean | undefined;
type ReactChildArray = ReturnType<typeof React.Children.toArray>;
declare function flattenChildren(children: React.ReactNode): ReactChildArray;
export { nFormatter, truncateEthAddress, truncateENSAddress, isMobile, isAndroid, detectBrowser, detectOS, getWalletDownloadUri, isFlint, isEternl, flattenChildren, };
