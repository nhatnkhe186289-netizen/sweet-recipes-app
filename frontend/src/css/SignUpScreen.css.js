import { StyleSheet, Dimensions } from 'react-native';
import colors from '../theme/colors';
import spacing from '../theme/spacing';

const { height } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FFF0F2', // Soft pastel pink background
  },
  headerImage: {
    height: height * 0.3,
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 50,
  },
  badgeContainer: {
    backgroundColor: 'rgba(255, 100, 128, 0.9)', // Pink badge
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxWidth: '90%',
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  formContainer: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    marginTop: -30,
    paddingHorizontal: 28,
    paddingTop: 35,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.dark,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.grey,
    marginBottom: 28,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.dark,
    marginBottom: 8,
    letterSpacing: 1,
  },
  textInput: {
    backgroundColor: "#FFF5F6", // Soft pink input background
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.dark,
    borderWidth: 1,
    borderColor: '#FFE3E8', // Light pink border
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F6", // Soft pink password input wrapper
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFE3E8',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.dark,
  },
  eyeIcon: {
    paddingHorizontal: 16,
  },
  signUpButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 15,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 15,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
  },
  footerText: {
    color: colors.grey,
    fontSize: 13,
  },
  link: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 13,
  },
});
