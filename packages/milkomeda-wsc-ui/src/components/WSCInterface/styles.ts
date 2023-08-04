import styled from "../../styles/styled";
import * as Tabs from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import { PlaceholderKeyframes } from "../Common/CustomQRCode/styles";

export const Container = styled.div`
  padding: 29px 24px 24px;
  border-radius: var(--ck-border-radius, 20px);
  background: var(--ck-body-background);
  box-shadow: var(--ck-modal-box-shadow);
  color: var(--ck-body-color);
  margin: auto;
  min-width: 580px;
  max-width: 580px;
  min-height: 700px;
  max-height: 700px;
  width: 100%;
  height: 100%;
  overflow: auto;
`;
export const TabsRoot = styled(Tabs.Root)`
  width: 100%;
  padding: 35px 0 30px;
  display: flex;
  flex-direction: column;
`;
export const TabsList = styled(Tabs.List)`
  flex-shrink: 0;
  display: flex;
`;
export const TabsTrigger = styled(Tabs.Trigger)`
  padding: 0 20px;
  background: transparent;
  height: 45px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  line-height: 1;
  color: var(--ck-body-color-muted);
  &:hover {
    color: var(--ck-body-color);
  }
  &[data-state="active"] > span {
    color: var(--ck-body-color);
    box-shadow: inset 0 -1px 0 0 currentColor, 0 1px 0 0 currentColor;
    padding-bottom: 6px;
    padding-left: 1px;
    padding-right: 1px;
  }
`;
export const TabsContent = styled(Tabs.Content)`
  flex-grow: 1;
  padding: 20px;
  outline: none;
  .about-content {
    display: flex;
    flex-direction: column;
  }

  .about-link {
    color: var(--ck-body-disclaimer-link-color);
    margin-bottom: 10px;
    align-self: flex-end;
    font-size: 0.875rem;
  }

  .about-items {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-size: 0.875rem;
    li {
      padding: 4px 6px;
      border-radius: 4px;
      border: 1px solid var(--ck-body-color-muted);
    }
  }
`;

export const Title = styled.h2`
  color: var(--ck-body-color);
  text-align: center;
  margin-top: 0;
  margin-bottom: 14px;
  font-size: 1.125rem;
  text-wrap: balance;
  line-height: 1.4;
`;
export const Text = styled.p`
  font-size: 0.875rem;
  line-height: 1.4;
  margin-top: 0;
`;

export const List = styled.ul`
  padding: 0;
  list-style: none;
  font-size: 0.875rem;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
export const ListItem = styled.li`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 6px;
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  svg {
    width: 16px;
    height: 16px;
    color: var(--ck-body-color-muted);
  }
`;
export const Label = styled.span`
  color: var(--ck-body-color-muted);
`;
export const Value = styled.span`
  color: var(--ck-body-color);
  font-weight: 500;
`;

export const AmountInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  label {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`;
export const InputContainer = styled.div`
  width: 100%;
  position: relative;
  height: 48px;
  padding: 4px 16px;
  border: 1px solid var(--ck-body-color-muted);
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  &:focus-within {
    border-color: var(--ck-focus-color);
  }
  input {
    width: 100%;
    height: 100%;
    min-width: 200px;
    outline: none;
    background: transparent;
    font-size: 0.875rem;
    color: var(--ck-body-color);
  }

  button {
    position: absolute;
    padding: 8px;
    border-radius: 0.375rem;
    background: var(--ck-body-background-secondary);
    color: var(--ck-body-color);
    right: 3px;
    align-self: center;
    font-size: 0.875rem;
    cursor: pointer;
  }
`;

export const PendingItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;
export const Skeleton = styled(motion.div)`
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  background: var(--ck-body-background-secondary);
  inset: 0;
  &:before {
    z-index: 4;
    content: "";
    position: absolute;
    inset: 0;
    background-image: linear-gradient(
      90deg,
      var(--ck-body-background-transparent) 50%,
      var(--ck-body-background),
      var(--ck-body-background-transparent)
    );
    opacity: 0.75;
    background-size: 200% 100%;
    animation: ${PlaceholderKeyframes} 1000ms linear infinite both;
  }
`;
