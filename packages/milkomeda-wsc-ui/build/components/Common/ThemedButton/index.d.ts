import React from "react";
import { ThemeContainer } from "./styles";
type ThemedButtonProps = {
    children?: React.ReactNode;
    variant?: "primary" | "secondary" | "tertiary";
    autoSize?: boolean;
    duration?: number;
    style?: React.CSSProperties;
    onClick?: () => void;
};
export declare const PlaceholderButton: () => import("react/jsx-runtime").JSX.Element;
declare const ThemedButton: React.FC<ThemedButtonProps>;
export default ThemedButton;
export { ThemeContainer };
