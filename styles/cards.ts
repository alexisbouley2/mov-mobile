import { StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";

export const CardStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors.app.card,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  eventCard: {
    backgroundColor: Colors.app.card,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
  },
  // Add more card variants as needed
});
