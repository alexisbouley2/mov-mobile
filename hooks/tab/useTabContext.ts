import { useContext } from "react";
import { TabContext } from "@/components/tab/SwipableTabs";

export const useTabContext = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error(
      "useTabContext must be used within a SwipableTabs component"
    );
  }
  return context;
};
