import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { toggleFavorite } from '../store/favoriteSlice';
import colors from '../theme/colors';

const FavoriteButton = ({ recipeId }) => {
  const dispatch = useDispatch();
  const favoriteIds = useSelector((state) => state.favorite.favoriteIds);
  const isFavorite = favoriteIds.includes(recipeId);

  const handlePress = () => {
    dispatch(toggleFavorite(recipeId));
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress} activeOpacity={0.7}>
      <Text style={styles.icon}>{isFavorite ? '❤️' : '🤍'}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  icon: {
    fontSize: 20,
  },
});

export default FavoriteButton;
