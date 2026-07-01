import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Image } from 'react-native';
import colors from '../theme/colors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';

const CategoryItem = ({ category, isSelected, onPress }) => {
  const name = category.name || '';
  const imageUrl = category.image;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.iconContainer,
          isSelected && styles.selectedIconContainer
        ]}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <Text style={styles.emojiText}>🍰</Text>
        )}
      </View>
      <Text style={[styles.name, isSelected && styles.selectedName]} numberOfLines={1}>
        {name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: 16,
    width: 72,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#FFF0F2', // Soft pink placeholder background
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#2B2D42',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  selectedIconContainer: {
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.15,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  emojiText: {
    fontSize: 26,
  },
  name: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.dark,
    textAlign: 'center',
  },
  selectedName: {
    fontWeight: '700',
    color: colors.primary,
  },
});

export default CategoryItem;
