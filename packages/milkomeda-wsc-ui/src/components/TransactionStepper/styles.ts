import { keyframes } from "styled-components";
import { motion } from "framer-motion";
import styled from "../../styles/styled";

export const StepTitle = styled.h1`
  font-size: 1.25rem;
  text-align: center;
  color: rgb(55 55 55);
  margin-bottom: 10px;
`;
export const StepDescription = styled.p`
  font-size: 1rem;
  text-align: center;
  color: rgb(153 153 153);
  margin-bottom: 40px;
  line-height: 1.5;
`;

export const BalancesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;
export const LabelWithBalanceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  justify-content: center;
`;
export const LabelText = styled.div`
  min-width: 150px;
  text-align: right;
`;
export const ErrorMessage = styled.div`
  color: rgb(239, 68, 68);
`;
