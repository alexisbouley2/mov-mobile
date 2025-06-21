// utils/debugLifecycle.ts
import { useRef, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import log from "@/utils/logger";

interface DebugLifecycleOptions {
  logRenders?: boolean;
  logMountUnmount?: boolean;
  logFocusBlur?: boolean;
  logStateChanges?: boolean;
}

export const useDebugLifecycle = (
  componentName: string,
  options: DebugLifecycleOptions = {}
) => {
  const {
    logRenders = true,
    logMountUnmount = true,
    logFocusBlur = true,
    logStateChanges = true,
  } = options;

  const renderCount = useRef(0);

  // Track renders
  if (logRenders) {
    renderCount.current += 1;
    log.debug(`🔄 ${componentName} RENDER #${renderCount.current}`);
  }

  // Track mount/unmount
  useEffect(() => {
    if (logMountUnmount) {
      log.debug(`🟢 ${componentName} MOUNTED`);
      return () => log.debug(`🔴 ${componentName} UNMOUNTED`);
    }
  }, [componentName, logMountUnmount]);

  // Track focus/blur (only for screens with navigation)
  useFocusEffect(
    useCallback(() => {
      if (logFocusBlur) {
        log.debug(`👀 ${componentName} FOCUSED`);
        return () => log.debug(`😴 ${componentName} BLURRED`);
      }
    }, [componentName, logFocusBlur])
  );

  // Helper function to log state changes
  const logStateChange = useCallback(
    (stateName: string, value: any) => {
      if (logStateChanges) {
        log.debug(`📱 ${componentName} - ${stateName} changed:`, value);
      }
    },
    [componentName, logStateChanges]
  );

  // Helper function to log props changes
  const logPropsChange = useCallback(
    (props: Record<string, any>) => {
      if (logStateChanges) {
        log.debug(`📝 ${componentName} - Props changed:`, props);
      }
    },
    [componentName, logStateChanges]
  );

  return {
    renderCount: renderCount.current,
    logStateChange,
    logPropsChange,
  };
};

// Alternative hook for components that don't use navigation (no useFocusEffect)
export const useDebugLifecycleSimple = (
  componentName: string,
  options: Omit<DebugLifecycleOptions, "logFocusBlur"> = {}
) => {
  const {
    logRenders = true,
    logMountUnmount = true,
    logStateChanges = true,
  } = options;

  const renderCount = useRef(0);

  // Track renders
  if (logRenders) {
    renderCount.current += 1;
    log.debug(`🔄 ${componentName} RENDER #${renderCount.current}`);
  }

  // Track mount/unmount
  useEffect(() => {
    if (logMountUnmount) {
      log.debug(`🟢 ${componentName} MOUNTED`);
      return () => log.debug(`🔴 ${componentName} UNMOUNTED`);
    }
  }, [componentName, logMountUnmount]);

  // Helper function to log state changes
  const logStateChange = useCallback(
    (stateName: string, value: any) => {
      if (logStateChanges) {
        log.debug(`📱 ${componentName} - ${stateName} changed:`, value);
      }
    },
    [componentName, logStateChanges]
  );

  // Helper function to log props changes
  const logPropsChange = useCallback(
    (props: Record<string, any>) => {
      if (logStateChanges) {
        log.debug(`📝 ${componentName} - Props changed:`, props);
      }
    },
    [componentName, logStateChanges]
  );

  return {
    renderCount: renderCount.current,
    logStateChange,
    logPropsChange,
  };
};

// Type definitions for better TypeScript support
export type DebugLifecycleReturn = ReturnType<typeof useDebugLifecycle>;
export type DebugLifecycleSimpleReturn = ReturnType<
  typeof useDebugLifecycleSimple
>;
