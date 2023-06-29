import * as React from "react";
/********** StepperProvider **********/
interface StepperContextValue extends StepperProps {
    isClickable?: boolean;
    isError?: boolean;
    isLoading?: boolean;
    isVertical?: boolean;
    isLabelVertical?: boolean;
    stepCount?: number;
}
export declare const useStepperContext: () => StepperContextValue;
export declare const StepperProvider: React.FC<{
    value: StepperContextValue;
    children: React.ReactNode;
}>;
/********** Stepper **********/
export interface StepperProps {
    activeStep: number;
    orientation?: "vertical" | "horizontal";
    state?: "loading" | "error";
    responsive?: boolean;
    onClickStep?: (step: number) => void;
    successIcon?: React.ReactElement;
    errorIcon?: React.ReactElement;
    labelOrientation?: "vertical" | "horizontal";
    children?: React.ReactNode;
    variant?: "default" | "ghost" | "outline" | "secondary";
}
export declare const Stepper: React.ForwardRefExoticComponent<StepperProps & React.RefAttributes<HTMLDivElement>>;
/********** StepperStep **********/
export interface StepperConfig extends StepperStepLabelProps {
    icon?: React.ReactElement;
}
export interface StepperStepProps extends React.HTMLAttributes<HTMLDivElement>, StepperConfig {
    isCompletedStep?: boolean;
}
interface StepperStepStatus {
    index: number;
    isCompletedStep?: boolean;
    isCurrentStep?: boolean;
    isLastStep?: boolean;
}
interface StepperStepAndStatusProps extends StepperStepProps, StepperStepStatus {
}
export declare const StepperStep: React.ForwardRefExoticComponent<StepperStepAndStatusProps & React.RefAttributes<HTMLDivElement>>;
/********** StepperStepLabel **********/
interface StepperStepLabelProps {
    label: string | React.ReactNode;
    description?: string | React.ReactNode;
    optional?: boolean;
    optionalLabel?: string | React.ReactNode;
}
export {};
