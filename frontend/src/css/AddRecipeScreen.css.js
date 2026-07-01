import { StyleSheet } from "react-native";
import colors from "../theme/colors";
import spacing from "../theme/spacing";
import typography from "../theme/typography";

export default StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.white,
    flexGrow: 1,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.dark,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.dark,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  categoriesRow: {
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  categoryBtn: {
    marginRight: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  difficultyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  diffBtn: {
    flex: 1,
    marginHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
  },
  submitBtn: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  imageSection: {
    marginVertical: spacing.sm,
  },
  imagePickerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  pickImageBtn: {
    backgroundColor: "#FFF0F2",
    borderColor: "#FFE3E8",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  pickImageBtnText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 13,
  },
  orText: {
    marginHorizontal: spacing.sm,
    color: colors.grey,
    fontSize: 13,
  },
  clearImageBtn: {
    marginTop: 4,
    alignSelf: "flex-start",
  },
  clearImageBtnText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
