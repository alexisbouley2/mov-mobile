import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 120,
    paddingBottom: 120,
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 75,
  },
  textContainer: {
    flex: 1,
    paddingTop: 60,
    alignItems: "center",
    marginBottom: 80,
    gap: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: "#888",
    textAlign: "center",
    lineHeight: 26,
  },
  getStartedButton: {
    backgroundColor: "#fff",
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContainer: {
    paddingHorizontal: 24,
  },
  getStartedButtonText: {
    color: "#000",
    fontSize: 17,
    fontWeight: "600",
  },
  phoneContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  phoneContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 120,
  },
  phoneTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  phoneSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  errorContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 14,
    textAlign: "center",
  },
  phoneButtonContainer: {
    paddingHorizontal: 48,
    paddingBottom: 48,
  },
  continueButton: {
    backgroundColor: "#fff",
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButtonDisabled: {
    backgroundColor: "#333",
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: "#000",
    fontSize: 17,
    fontWeight: "600",
  },
  continueButtonTextDisabled: {
    color: "#666",
  },
});
