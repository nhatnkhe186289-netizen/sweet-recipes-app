import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import colors from '../theme/colors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';

const categoryEmojiMap = {
  'Bánh Kem': { emoji: '🍰', bg: '#FFEBF0' },
  'Bánh Quy': { emoji: '🍪', bg: '#FFF6E3' },
  'Bánh Donut': { emoji: '🍩', bg: '#F3EFFF' },
  'Cheesecake': { emoji: '🧁', bg: '#E3F2FD' },
  'Chocolate': { emoji: '🍫', bg: '#FFEBF0' },
  'Kẹo Ngọt': { emoji: '🍬', bg: '#FFF0F5' },
  'Bánh Mochi': { emoji: '🍡', bg: '#E8F5E9' },
  'Cupcake': { emoji: '🧁', bg: '#E3F2FD' },
  'Bánh Mousse': { emoji: '🍮', bg: '#FFF8E1' },
  'Bánh Tart': { emoji: '🥧', bg: '#FFF3E0' },
  'Macaron': { emoji: '🍪', bg: '#FFF6E3' },
  'Panna Cotta': { emoji: '🍮', bg: '#FFF8E1' },
  'Brownie': { emoji: '🍞', bg: '#EFEBE9' },
  'Bánh Su Kem': { emoji: '🥯', bg: '#FAF0E6' },
  'Bánh Bông Lan': { emoji: '🍰', bg: '#FFEBF0' }
};

const CategoryItem = ({ category, isSelected, onPress }) => {
  const name = category.name || '';
  const itemConfig = categoryEmojiMap[name] || { emoji: '🍰', bg: '#FFEBF0' };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: itemConfig.bg },
          isSelected && styles.selectedIconContainer
        ]}
      >
        <Text style={styles.emojiText}>{itemConfig.emoji}</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#2B2D42',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  selectedIconContainer: {
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.15,
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
