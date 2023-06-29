import { useConnectCallbackProps } from "./useConnectCallback";
type UseModalProps = NonNullable<unknown> & useConnectCallbackProps;
export declare const useModal: ({ onConnect, onDisconnect }?: UseModalProps) => {
    open: boolean;
    setOpen: (show: boolean) => void;
    openOnboarding: () => void;
    openProfile: () => void;
};
export {};
