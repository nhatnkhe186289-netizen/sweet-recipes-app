import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';
import FavoriteButton from './FavoriteButton';

const { width } = Dimensions.get('window');
const cardWidth = Platform.OS === 'web' ? Math.min((width - 44) / 2, 240) : (width - 44) / 2; // Limit width on Web

const RecipeCard = ({ recipe }) => {
  const navigation = useNavigation();

  // Generate deterministic mock rating based on recipe title
  const titleLen = recipe.title ? recipe.title.length : 10;
  const mockRating = (4.0 + (titleLen % 10) * 0.1).toFixed(1);
  const mockReviews = 45 + (titleLen * 7) % 300;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('RecipeDetail', { recipeId: recipe._id })}
      activeOpacity={0.9}
    >
      {/* Recipe Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: recipe.image }} style={styles.image} />
        
        {/* Category Pill over image */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>
            {(recipe.category && recipe.category.name) || 'Bánh'}
          </Text>
        </View>

        {/* Favorite Button top-right */}
        <View style={styles.favoriteBadge}>
          <FavoriteButton recipeId={recipe._id} />
        </View>
      </View>
      
      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {recipe.title}
        </Text>
        
        {/* Rating Row */}
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color="#FFD166" />
          <Text style={styles.ratingText}>
            {mockRating} <Text style={styles.reviewsText}>({mockReviews})</Text>
          </Text>
        </View>

        {/* Info Footer */}
        <View style={styles.footer}>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={13} color={colors.grey} />
            <Text style={styles.infoText}>{recipe.cookingTime} min</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="flame-outline" size={13} color={colors.grey} />
            <Text style={styles.infoText}>{recipe.calories} cal</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    width: '48.5%',
    marginBottom: 16,
    shadowColor: '#2B2D42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 125,
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(255, 100, 128, 0.95)', // Solid colors.primary with slight opacity
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  categoryText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: 'bold',
  },
  favoriteBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.white,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.dark,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.dark,
    marginLeft: 4,
  },
  reviewsText: {
    color: colors.grey,
    fontWeight: '400',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 10,
    color: colors.grey,
    marginLeft: 3,
  },
});

export default RecipeCard;
