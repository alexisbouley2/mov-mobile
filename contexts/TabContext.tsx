import React, { createContext, useContext } from "react";

interface TabContextType {
  currentTabIndex: number;
  isTabActive: (_index: number) => boolean;
}

const TabContext = createContext<TabContextType>({
  currentTabIndex: 0,
  isTabActive: () => false,
});

export const useTab = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error("useTab must be used within a TabProvider");
  }
  return context;
};

export const TabProvider: React.FC<{
  children: React.ReactNode;
  value: TabContextType;
}> = ({ children, value }) => {
  return <TabContext.Provider value={value}>{children}</TabContext.Provider>;
};
