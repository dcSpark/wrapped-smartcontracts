import styled from "../../styles/styled";

export const StepLargeHeight = styled.div`
  min-height: 300px;
`;
export const StepNormalHeight = styled.div`
  min-height: 300px;
`;
export const StepTitle = styled.h1`
  font-size: 1.125rem;
  text-align: center;
  color: var(--wsc-body-color);
  text-wrap: balance;
  margin-bottom: 10px;
`;
export const StepDescription = styled.p`
  font-size: 0.875rem;
  text-align: center;
  color: var(--wsc-body-color-muted);
  margin-top: 0;
  margin-bottom: 30px;
  line-height: 1.5;
  text-wrap: balance;
`;
export const OverviewDescription = styled.p`
  font-size: 1rem;
  text-align: center;
  color: var(--wsc-body-color-muted);
  margin-bottom: 40px;
  line-height: 1.5;
`;

export const BalancesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 30px;
`;
export const LabelWithBalanceContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  align-items: center;
  gap: 20px;
  justify-content: center;
`;
export const LabelText = styled.div`
  text-align: right;
  font-size: 0.875rem;
`;
export const ErrorMessage = styled.div`
  color: rgb(239, 68, 68);
  margin-bottom: 18px;
`;
export const SpinnerWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px 0;
  svg {
    color: #f07d00;
  }
`;
export const SuccessWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 12px;
  padding: 20px 0 40px;
  color: var(--wsc-body-color);
  p {
    margin: 0;
  }
  svg {
    color: rgb(14, 117, 55);
  }
`;
export const SuccessWrapperMessage = styled.div`
  text-align: left;
  a {
    display: inline-flex;
  }
`;
export const WrapperButtons = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 40px;
`;
export const TransactionCompleteContainer = styled.div`
  position: relative;
  padding: 30px 0;
  color: var(--wsc-body-color);
  h1 {
    font-size: 1.25rem;
  }
  h3 {
    color: inherit;
  }
  p {
    font-size: 1rem;
  }
  svg {
    width: 50px;
    height: 50px;
    color: rgb(14, 117, 55);
  }
`;

export const TransactionExternalLink = styled.a`
  color: inherit;
  text-decoration: underline;
  display: flex;
  align-items: center;
  gap: 8px;
  svg {
    color: var(--wsc-body-color);
  }
`;
