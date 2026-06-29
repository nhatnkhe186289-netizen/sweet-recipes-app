import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import colors from '../../theme/colors';
import typography from '../../theme/typography';
import spacing from '../../theme/spacing';
import Button from '../../components/Button';

const { height } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  const [currentPage, setCurrentPage] = useState(0);

  const onboardingData = [
    {
      title: 'Discover Sweet Recipes',
      subtitle: 'Explore 500+ dessert recipes from cakes to ice creams, all curated by passionate bakers.',
      emoji: '🍰',
    },
    {
      title: 'Save Your Favorites',
      subtitle: 'Keep your favorite dessert recipes organized and accessible anytime, anywhere.',
      emoji: '💝',
    },
    {
      title: 'Share With Friends',
      subtitle: 'Publish your own delicious creations and connect with a community of sweet lovers.',
      emoji: '🧁',
    }
  ];

  const handleNext = () => {
    if (currentPage < onboardingData.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      navigation.replace('Auth');
    }
  };

  const current = onboardingData[currentPage];

  return (
    <SafeAreaView style={styles.container}>
      {/* Pink Curved Upper Background */}
      <View style={styles.curveHeader}>
        <Text style={styles.emojiText}>{current.emoji}</Text>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.subtitle}>{current.subtitle}</Text>

        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentPage ? styles.activeDot : styles.inactiveDot
              ]}
            />
          ))}
        </View>
      </View>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <Button
          title={currentPage === onboardingData.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          style={styles.button}
        />
        <TouchableOpacity onPress={() => navigation.replace('Auth')} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  curveHeader: {
    height: height * 0.5,
    backgroundColor: '#FFA6B9', // Beautiful pastel pink
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 100,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 35,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
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
    backgroundColor: '#E2E8F0',
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
    color: colors.grey,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default OnboardingScreen;
