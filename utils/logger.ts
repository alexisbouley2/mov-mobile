import { logger, consoleTransport } from "react-native-logs";

const defaultConfig = {
  severity: __DEV__ ? "debug" : "error",
  transport: consoleTransport,
  transportOptions: {
    colors: {
      info: "blueBright",
      warn: "yellowBright",
      error: "redBright",
    },
  },
  dateFormat: "time",
  printLevel: true,
  printDate: true,
  enabled: true,
} as const;

const log = logger.createLogger(defaultConfig);

export default log;
