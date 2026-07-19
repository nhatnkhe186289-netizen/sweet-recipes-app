import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import recipeService from '../../services/recipe.service';
import { fetchRecipes } from '../../store/recipeSlice';
import { addItems } from '../../store/shoppingListSlice';
import FavoriteButton from '../../components/FavoriteButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import colors from '../../theme/colors';
import typography from '../../theme/typography';
import spacing from '../../theme/spacing';
import { confirmAction } from '../../utils/alert';

const RecipeDetailScreen = ({ route, navigation }) => {
  const { recipeId } = route.params;
  const dispatch = useDispatch();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const loadRecipeDetails = async () => {
      try {
        const data = await recipeService.getRecipeById(recipeId);
        setRecipe(data);
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể tải chi tiết công thức bánh.');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    loadRecipeDetails();
  }, [recipeId]);

  const handleDelete = () => {
    confirmAction(
      'Xóa công thức',
      'Bạn có chắc chắn muốn xóa vĩnh viễn công thức bánh này không?',
      async () => {
        try {
          await recipeService.deleteRecipe(recipeId);
          Alert.alert('Thành công', 'Đã xóa công thức bánh thành công.');
          dispatch(fetchRecipes());
          navigation.goBack();
        } catch (error) {
          Alert.alert('Lỗi', error.message || 'Không thể xóa công thức bánh.');
        }
      }
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this delicious recipe: ${recipe.title}\n\n${recipe.description}`,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleAuthorPress = () => {
    if (recipe.author) {
      Alert.alert(
        `Giới thiệu về ${recipe.author.username}`,
        recipe.author.bio || 'Passionate home baker 🍰 Sharing sweet moments, one recipe at a time ✨'
      );
    }
  };

  if (!recipe) {
    return (
      <View style={styles.errorContainer}>
        <Text>Recipe not found</Text>
      </View>
    );
  }

  const isAuthor = user && recipe.author && user._id === recipe.author._id;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: recipe.image }} style={styles.image} />
        
        {/* Favorite Icon Overlay container */}
        <View style={styles.actionRow}>
          <Text style={styles.category}>{(recipe.category && recipe.category.name) || 'Sweet Dessert'}</Text>
          <View style={styles.rightActions}>
            <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
              <Ionicons name="share-social-outline" size={24} color={colors.dark} />
            </TouchableOpacity>
            <FavoriteButton recipeId={recipe._id} />
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{recipe.title}</Text>
          {/* Author Info */}
          <TouchableOpacity 
            style={styles.authorRow}
            onPress={() => navigation.navigate('AuthorProfile', { authorId: recipe.author._id })}
          >
            <Image
              source={{ uri: (recipe.author && recipe.author.avatar) || 'https://res.cloudinary.com/demo/image/upload/v1622523942/sample.jpg' }}
              style={styles.avatar}
            />
            <Text style={styles.authorName}>By {recipe.author ? recipe.author.username : 'Anonymous'}</Text>
          </TouchableOpacity>

          {/* Quick Info Grid */}
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.infoValue}>{recipe.cookingTime} phút</Text>
              <Text style={styles.gridLbl}>phút</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.infoValue}>{recipe.calories} kcal</Text>
              <Text style={styles.gridLbl}>kcal</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.infoValue}>{recipe.difficulty === 'Easy' ? 'Dễ' : recipe.difficulty === 'Medium' ? 'Trung bình' : recipe.difficulty === 'Hard' ? 'Khó' : recipe.difficulty}</Text>
              <Text style={styles.gridLbl}>Độ khó</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.description}>{recipe.description}</Text>

          {/* Ingredients */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
            <Text style={styles.sectionTitle}>Nguyên liệu</Text>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#FFF0F0',
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 12,
              }}
              onPress={() => {
                if (recipe.ingredients && recipe.ingredients.length > 0) {
                  dispatch(addItems({ items: recipe.ingredients, recipeTitle: recipe.title }));
                  navigation.navigate('ShoppingList');
                }
              }}
            >
              <Ionicons name="cart-outline" size={16} color={colors.primary} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary, marginLeft: 4 }}>
                + Thêm vào Đi chợ
              </Text>
            </TouchableOpacity>
          </View>
          {recipe.ingredients.map((ing, idx) => (
            <Text key={idx} style={styles.listItem}>• {ing}</Text>
          ))}

          {/* Instructions */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
            <Text style={styles.sectionTitle}>Hướng dẫn thực hiện</Text>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#F0F7FF',
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 12,
              }}
              onPress={() => navigation.navigate('BakingTimer')}
            >
              <Ionicons name="timer-outline" size={16} color="#007AFF" />
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#007AFF', marginLeft: 4 }}>
                ⏱️ Clock Timer
              </Text>
            </TouchableOpacity>
          </View>
          {recipe.instructions.map((inst, idx) => (
            <Text key={idx} style={styles.listItem}>{idx + 1}. {inst}</Text>
          ))}

          {/* Buttons */}
          <Button
            title="💬 Xem bình luận"
            variant="outline"
            onPress={() => navigation.navigate('Comments', { recipeId })}
            style={styles.commentBtn}
          />

          {isAuthor && (
            <View style={styles.authorButtons}>
              <Button
                title="✏️ Edit Recipe"
                variant="secondary"
                onPress={() => navigation.navigate('EditRecipe', { recipeId })}
                style={styles.editBtn}
              />
              <Button
                title="🗑️ Delete Recipe"
                onPress={handleDelete}
                style={styles.deleteBtn}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  image: {
    width: '100%',
    height: 250,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  category: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareBtn: {
    marginRight: spacing.md,
  },
  body: {
    paddingHorizontal: spacing.md,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.dark,
    marginVertical: spacing.sm,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: spacing.sm,
  },
  authorName: {
    fontSize: typography.sizes.sm,
    color: colors.grey,
  },
  grid: {
    flexDirection: 'row',
    backgroundColor: colors.light,
    borderRadius: 16,
    padding: spacing.md,
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  gridItem: {
    alignItems: 'center',
  },
  gridVal: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.dark,
  },
  gridLbl: {
    fontSize: typography.sizes.xs,
    color: colors.grey,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.dark,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.sizes.md,
    color: colors.dark,
    lineHeight: 22,
  },
  listItem: {
    fontSize: typography.sizes.md,
    color: colors.dark,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  commentBtn: {
    marginTop: spacing.xl,
  },
  authorButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  editBtn: {
    flex: 1,
    marginRight: spacing.sm,
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: colors.error,
    marginLeft: spacing.sm,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RecipeDetailScreen;
