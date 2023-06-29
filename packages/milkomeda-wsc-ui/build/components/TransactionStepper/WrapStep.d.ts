import { TxPendingStatus } from "milkomeda-wsc";
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
declare const WrapStep: ({ defaultAmountEth, defaultTokenUnit, nextStep }: {
    defaultAmountEth?: string | undefined;
    defaultTokenUnit?: string | undefined;
    nextStep: any;
}) => import("react/jsx-runtime").JSX.Element;
export default WrapStep;
export declare const LabelWithBalance: ({ label, amount, assetName }: {
    label: any;
    amount: any;
    assetName: any;
}) => import("react/jsx-runtime").JSX.Element;
