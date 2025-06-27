import { StyleSheet } from "react-native";

export default StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 20,
  },
  eventFormSection: {
    marginTop: 24,
  },
  eventFormSectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 8,
    marginBottom: 8,
  },
  eventFormTextInput: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#333",
  },
});
