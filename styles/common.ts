import { StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import { Spacing } from "@/constants/Spacing";

export const CommonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.app.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xxxl,
  },
  contentWithTopPadding: {
    flex: 1,
    paddingHorizontal: Spacing.xxxl,
    paddingTop: Spacing.massive,
  },
  title: {
    ...Typography.title,
    color: Colors.app.text,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  subtitle: {
    ...Typography.subtitle,
    color: Colors.app.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.huge,
  },
  errorContainer: {
    backgroundColor: Colors.app.errorBackground,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.xl,
    borderLeftWidth: 3,
    borderLeftColor: Colors.app.errorBorder,
  },
  errorText: {
    ...Typography.body,
    color: Colors.app.errorText,
  },
  disclaimer: {
    ...Typography.caption,
    color: Colors.app.textSecondary,
    textAlign: "center",
    marginTop: Spacing.xl,
  },
});
