import React from "react";
import { Variants } from "framer-motion";
export declare const contentVariants: Variants;
type ModalProps = {
    open?: boolean;
    pages: any;
    pageId: string;
    positionInside?: boolean;
    inline?: boolean;
    onClose?: () => void;
    onBack?: () => void;
    onInfo?: () => void;
};
declare const Modal: React.FC<ModalProps>;
export declare const OrDivider: ({ children }: {
    children?: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element;
export default Modal;
