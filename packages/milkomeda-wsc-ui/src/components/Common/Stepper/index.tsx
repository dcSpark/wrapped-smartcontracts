import * as React from "react";
import { Check, Loader2, X } from "lucide-react";

import { useMediaQuery } from "./use-stepper";
import {
  StepperContainer,
  StepperSeparator,
  StepperSteLabelDescription,
  StepperStepButton,
  StepperStepConnectorContainer,
  StepperStepConnectorLast,
  StepperStepContainer,
  StepperStepLabelContainer,
  StepperStepOptionalLabel,
  StepperStepRow,
} from "./styles";
import { SpinnerContainer } from "../Spinner/styles";

/********** StepperProvider **********/

interface StepperContextValue extends StepperProps {
  isClickable?: boolean;
  isError?: boolean;
  isLoading?: boolean;
  isVertical?: boolean;
  isLabelVertical?: boolean;
  stepCount?: number;
}

const StepsContext = React.createContext<StepperContextValue>({
  activeStep: 0,
});

export const useStepperContext = () => React.useContext(StepsContext);

export const StepperProvider: React.FC<{
  value: StepperContextValue;
  children: React.ReactNode;
}> = ({ value, children }) => {
  const isError = value.state === "error";
  const isLoading = value.state === "loading";

  const isVertical = value.orientation === "vertical";
  const isLabelVertical =
    value.orientation !== "vertical" && value.labelOrientation === "vertical";

  return (
    <StepsContext.Provider
      value={{
        ...value,
        isError,
        isLoading,
        isVertical,
        isLabelVertical,
      }}
    >
      {children}
    </StepsContext.Provider>
  );
};

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

export const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  (
    {
      activeStep = 0,
      state,
      responsive = true,
      orientation: orientationProp = "horizontal",
      onClickStep,
      labelOrientation = "horizontal",
      children,
      errorIcon,
      successIcon,
      variant = "default",
    },
    ref
  ) => {
    const childArr = React.Children.toArray(children);

    const stepCount = childArr.length;

    const renderHorizontalContent = () => {
      if (activeStep <= childArr.length) {
        return React.Children.map(childArr[activeStep], (node) => {
          if (!React.isValidElement(node)) return;
          return React.Children.map(node.props.children, (childNode) => childNode);
        });
      }
      return null;
    };

    const isClickable = !!onClickStep;

    const isMobile = useMediaQuery("(max-width: 43em)");

    const orientation = isMobile && responsive ? "vertical" : orientationProp;

    return (
      <StepperProvider
        value={{
          activeStep,
          orientation,
          state,
          responsive,
          onClickStep,
          labelOrientation,
          isClickable,
          stepCount,
          errorIcon,
          successIcon,
          variant,
        }}
      >
        <StepperContainer ref={ref} $isVertical={orientation === "vertical"}>
          {React.Children.map(children, (child, i) => {
            const isCompletedStep =
              (React.isValidElement(child) && child.props.isCompletedStep) ?? i < activeStep;
            const isLastStep = i === stepCount - 1;
            const isCurrentStep = i === activeStep;

            const stepProps = {
              index: i,
              isCompletedStep,
              isCurrentStep,
              isLastStep,
            };

            if (React.isValidElement(child)) {
              return React.cloneElement(child, stepProps);
            }

            return null;
          })}
        </StepperContainer>
        {orientation === "horizontal" && renderHorizontalContent()}
      </StepperProvider>
    );
  }
);

Stepper.displayName = "Stepper";

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

interface StepperStepAndStatusProps extends StepperStepProps, StepperStepStatus {}

export const StepperStep = React.forwardRef<HTMLDivElement, StepperStepAndStatusProps>(
  (props, ref) => {
    const {
      children,
      description,
      icon: CustomIcon,
      index,
      isCompletedStep,
      isCurrentStep,
      isLastStep,
      label,
      optional,
      optionalLabel,
    } = props;

    const {
      isVertical,
      isError,
      isLoading,
      successIcon: CustomSuccessIcon,
      errorIcon: CustomErrorIcon,
      isLabelVertical,
      onClickStep,
      isClickable,
      variant,
    } = useStepperContext();

    const hasVisited = isCurrentStep || isCompletedStep;

    const handleClick = (index: number) => {
      if (isClickable && onClickStep) {
        onClickStep(index);
      }
    };

    const Icon = React.useMemo(() => CustomIcon ?? null, [CustomIcon]);

    const Success = React.useMemo(() => CustomSuccessIcon ?? <Check />, [CustomSuccessIcon]);

    const Error = React.useMemo(() => CustomErrorIcon ?? <X />, [CustomErrorIcon]);

    const RenderIcon = React.useMemo(() => {
      if (isCompletedStep) return Success;
      if (isCurrentStep) {
        if (isError) return Error;
        if (isLoading)
          return (
            <SpinnerContainer>
              <Loader2 />
            </SpinnerContainer>
          );
      }
      if (Icon) return Icon;
      return (index || 0) + 1;
    }, [isCompletedStep, Success, isCurrentStep, Icon, index, isError, Error, isLoading]);

    return (
      <StepperStepContainer
        $isLastStep={isLastStep}
        $isVertical={isVertical}
        $isClickable={isClickable && !!onClickStep}
        ref={ref}
        onClick={() => handleClick(index)}
        aria-disabled={!hasVisited}
      >
        <StepperStepRow $isLabelVertical={isLabelVertical}>
          <StepperStepButton
            aria-current={isCurrentStep ? "step" : undefined}
            data-invalid={isCurrentStep && isError}
            data-highlighted={isCompletedStep}
            data-clickable={isClickable}
            disabled={!(hasVisited || isClickable)}
            $isCompletedStep={isCompletedStep || typeof RenderIcon !== "number"}
            $variant={isCurrentStep && isError ? "destructive" : variant}
          >
            {RenderIcon}
          </StepperStepButton>
          <StepperStepLabel
            label={label}
            description={description}
            optional={optional}
            optionalLabel={optionalLabel}
            {...{ isCurrentStep }}
          />
        </StepperStepRow>
        <StepperStepConnector
          index={index}
          isLastStep={isLastStep}
          hasLabel={!!label || !!description}
          isCompletedStep={isCompletedStep || false}
        >
          {(isCurrentStep || isCompletedStep) && children}
        </StepperStepConnector>
      </StepperStepContainer>
    );
  }
);

StepperStep.displayName = "StepperStep";

/********** StepperStepLabel **********/

interface StepperStepLabelProps {
  label: string | React.ReactNode;
  description?: string | React.ReactNode;
  optional?: boolean;
  optionalLabel?: string | React.ReactNode;
}

const StepperStepLabel = ({
  isCurrentStep,
  label,
  description,
  optional,
  optionalLabel,
}: StepperStepLabelProps & {
  isCurrentStep?: boolean;
}) => {
  const { isLabelVertical } = useStepperContext();

  const shouldRender = !!label || !!description;

  const renderOptionalLabel = !!optional && !!optionalLabel;

  return shouldRender ? (
    <StepperStepLabelContainer
      aria-current={isCurrentStep ? "step" : undefined}
      $isLabelVertical={isLabelVertical}
    >
      {!!label && (
        <p>
          {label}
          {renderOptionalLabel && (
            <StepperStepOptionalLabel>({optionalLabel})</StepperStepOptionalLabel>
          )}
        </p>
      )}
      {!!description && <StepperSteLabelDescription>{description}</StepperSteLabelDescription>}
    </StepperStepLabelContainer>
  ) : null;
};

StepperStepLabel.displayName = "StepperStepLabel";

/********** StepperStepConnector **********/

interface StepperStepConnectorProps extends React.HTMLAttributes<HTMLDivElement> {
  isCompletedStep: boolean;
  isLastStep?: boolean | null;
  hasLabel?: boolean;
  index: number;
}

const StepperStepConnector = React.memo(
  ({ isCompletedStep, children, isLastStep }: StepperStepConnectorProps) => {
    const { isVertical, labelOrientation } = useStepperContext();

    if (isVertical) {
      return (
        <StepperStepConnectorContainer
          data-highlighted={isCompletedStep}
          $isLastStep={isLastStep}
          $isCompletedStep={isCompletedStep}
        >
          {!isCompletedStep && <StepperStepConnectorLast>{children}</StepperStepConnectorLast>}
        </StepperStepConnectorContainer>
      );
    }

    if (isLastStep) {
      return null;
    }

    return (
      <StepperSeparator data-highlighted={isCompletedStep} $labelOrientation={labelOrientation} />
    );
  }
);

StepperStepConnector.displayName = "StepperStepConnector";
