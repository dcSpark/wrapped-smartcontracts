import { DefaultCardanoAsset } from "../components/ConnectWSC";
export declare const useWSCTransactionConfig: ({ defaultCardanoToken, contractAddress, wscActionCallback, }: {
    defaultCardanoToken: DefaultCardanoAsset | null;
    contractAddress: string;
    wscActionCallback: () => Promise<void>;
}) => void;
