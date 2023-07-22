import styled from "../../styles/styled";
import * as Tabs from "@radix-ui/react-tabs";

export const Container = styled.div`
  padding: 29px 24px 24px;
  border-radius: var(--ck-border-radius, 20px);
  background: var(--ck-body-background);
  box-shadow: var(--ck-modal-box-shadow);
  color: var(--ck-body-color);
`;
export const TabsRoot = styled(Tabs.Root)`
  width: 100%;
  padding: 30px 0;
  display: flex;
  flex-direction: column;
`;
export const TabsList = styled(Tabs.List)`
  flex-shrink: 0;
  display: flex;
  border-bottom: 1px solid var(--ck-body-color-muted);
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
  user-select: none;
  color: var(--ck-body-color-muted);
  &:hover {
    color: var(--ck-body-color);
  }
  &[data-state="active"] {
    color: var(--ck-body-color);
    box-shadow: inset 0 -1px 0 0 currentColor, 0 1px 0 0 currentColor;
  }
`;
export const TabsContent = styled(Tabs.Content)`
  flex-grow: 1;
  padding: 20px;
  outline: none;
  .about-content {
    display: flex;
    flex-direction: column;
    font-size: 0.875rem;
    line-height: 1.4;
  }
  .about-title {
    color: var(--ck-body-disclaimer-link-color);
    text-align: center;
    margin-bottom: 0;
    font-size: 1.125rem;
  }
  .about-link {
    color: var(--ck-body-disclaimer-link-color);
    margin-bottom: 10px;
    align-self: flex-end;
  }

  .about-items {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-size: inherit;
    li {
      padding: 4px 6px;
      border-radius: 4px;
      border: 1px solid var(--ck-body-color-muted);
    }
  }
`;
