type UseStepper = {
    initialStep: number;
};
type UseStepperReturn = {
    nextStep: () => void;
    prevStep: () => void;
    resetSteps: () => void;
    setStep: (step: number) => void;
    activeStep: number;
    isDisabledStep: boolean;
};
export declare function useStepper({ initialStep }: UseStepper): UseStepperReturn;
interface UseMediaQueryOptions {
    getInitialValueInEffect: boolean;
}
export declare function useMediaQuery(query: string, initialValue?: boolean, { getInitialValueInEffect }?: UseMediaQueryOptions): boolean;
export {};
