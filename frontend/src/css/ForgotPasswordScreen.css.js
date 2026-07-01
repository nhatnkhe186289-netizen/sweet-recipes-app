import { StyleSheet } from 'react-native';
import colors from '../theme/colors';

export default StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FFF0F2', // Soft pastel pink background
    paddingTop: 50,
  },
  headerBar: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE3E8',
  },
  contentContainer: {
    paddingHorizontal: 28,
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
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
    fontWeight: '700',
    color: colors.dark,
    marginBottom: 8,
    letterSpacing: 1,
  },
  textInput: {
    backgroundColor: '#FFF5F6',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.dark,
    borderWidth: 1,
    borderColor: '#FFE3E8',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F6',
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
  resetButton: {
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
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  link: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
});
