import { StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import { Spacing } from "@/constants/Spacing";

export const ButtonStyles = StyleSheet.create({
  primary: {
    backgroundColor: Colors.app.button,
    paddingVertical: Spacing.lg,
    borderRadius: 25,
    alignItems: "center",
  },
  primaryDisabled: {
    backgroundColor: Colors.app.buttonDisabled,
  },
  primaryText: {
    ...Typography.button,
    color: Colors.app.buttonText,
  },
  primaryTextDisabled: {
    color: Colors.app.buttonTextDisabled,
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.app.button,
    paddingVertical: Spacing.lg,
    borderRadius: 25,
    alignItems: "center",
  },
  secondaryText: {
    ...Typography.button,
    color: Colors.app.button,
  },
});
