import BigNumber from "bignumber.js";
import { TxPendingStatus } from "milkomeda-wsc";
export type WrapToken = {
    assetName: string;
    bridgeAllowed: boolean;
    decimals: number;
    fingerprint: string;
    has_nft_onchain_metadata: boolean;
    quantity: BigNumber;
    unit: string;
};
export declare const WrapStatus: {
    Idle: "Idle";
    Init: "Init";
    Pending: "Pending";
    Error: "Error";
    WaitingL1Confirmation: TxPendingStatus.WaitingL1Confirmation;
    WaitingBridgeConfirmation: TxPendingStatus.WaitingBridgeConfirmation;
    WaitingL2Confirmation: TxPendingStatus.WaitingL2Confirmation;
    Confirmed: TxPendingStatus.Confirmed;
};
declare const WrapStep: ({ nextStep }: {
    nextStep: any;
}) => import("react/jsx-runtime").JSX.Element;
export default WrapStep;
export declare const LabelWithBalance: ({ label, amount, assetName }: {
    label: any;
    amount: any;
    assetName: any;
}) => import("react/jsx-runtime").JSX.Element;
