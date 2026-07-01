import { StyleSheet, Dimensions } from 'react-native';
import colors from '../theme/colors';

const { height } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F2', // Soft pastel pink background
  },
  curveHeader: {
    height: height * 0.48,
    backgroundColor: colors.secondary,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    position: 'relative',
    overflow: 'hidden',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 100, 128, 0.15)', // Pink overlay
  },
  logoBadge: {
    position: 'absolute',
    bottom: -20,
    alignSelf: 'center',
    backgroundColor: colors.white,
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
  logoText: {
    fontSize: 34,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 45,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.dark,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: colors.grey,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  activeDot: {
    width: 20,
    backgroundColor: colors.primary,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: '#FFCCD5', // Soft pink inactive dot
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 25,
    alignItems: 'center',
  },
  button: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 15,
  },
  skipButton: {
    marginTop: 14,
    paddingVertical: 6,
  },
  skipText: {
    color: colors.primary, // Pink skip button
    fontSize: 14,
    fontWeight: '600',
  },
});
