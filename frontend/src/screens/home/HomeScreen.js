import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Image,
  ImageBackground,
  Dimensions,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { fetchRecipes, fetchCategories } from '../../store/recipeSlice';
import { fetchFavorites } from '../../store/favoriteSlice';
import RecipeCard from '../../components/RecipeCard';
import CategoryItem from '../../components/CategoryItem';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../theme/colors';
import typography from '../../theme/typography';
import spacing from '../../theme/spacing';
import { DEFAULT_CATEGORIES } from '../../constants/categories';
import { showToast } from '../../utils/alert';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const { recipes, categories, isLoading } = useSelector((state) => state.recipe);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchRecipes());
    dispatch(fetchCategories());
    dispatch(fetchFavorites());
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchRecipes(selectedCategory ? { category: selectedCategory } : {})),
      dispatch(fetchCategories()),
      dispatch(fetchFavorites()),
    ]);
    setRefreshing(false);
  };

  const handleSelectCategory = (categoryId) => {
    const newCategory = selectedCategory === categoryId ? null : categoryId;
    setSelectedCategory(newCategory);
    dispatch(fetchRecipes(newCategory ? { category: newCategory } : {}));
  };

  const displayedCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  // Split recipes for Popular and Featured sections
  const popularRecipes = recipes.slice(0, 4);
  const featuredRecipes = recipes.slice(4, 8);

  const trendingRecipe = recipes[0] || {
    _id: 'default_trending',
    title: 'Strawberry Dream Cake',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800',
    cookingTime: 45,
    calories: 350,
  };

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập từ khóa tìm kiếm');
      return;
    }
    navigation.navigate('Search', { query: searchQuery.trim() });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Upper Greeting Row */}
        <View style={styles.welcomeRow}>
          <View>
            <Text style={styles.greeting}>Chào bạn 👋</Text>
            <Text style={styles.username}>{user ? user.username : 'Khách'}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.iconCircle}
              onPress={() => showToast('Thông báo', 'Bạn không có thông báo mới nào')}
            >
              <Ionicons name="notifications-outline" size={22} color={colors.dark} />
            </TouchableOpacity>
            <Image
              source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' }}
              style={styles.avatar}
            />
          </View>
        </View>

        {/* Search Input with Filter */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={colors.grey} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm công thức..."
            placeholderTextColor={colors.grey}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
          />
          <TouchableOpacity style={styles.filterButton} onPress={handleSearchSubmit}>
            <Text style={styles.filterButtonText}>Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Tools Shortcuts Row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md, gap: 10 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#FFF0F0',
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: '#FFE0E0',
            }}
            onPress={() => navigation.navigate('ShoppingList')}
          >
            <Ionicons name="cart-outline" size={22} color={colors.primary} />
            <View style={{ marginLeft: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: colors.primary }}>Danh sách Đi chợ</Text>
              <Text style={{ fontSize: 10, color: colors.grey }}>Quản lý nguyên liệu</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#F0F7FF',
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: '#E0EEFF',
            }}
            onPress={() => navigation.navigate('BakingTimer')}
          >
            <Ionicons name="timer-outline" size={22} color="#007AFF" />
            <View style={{ marginLeft: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#007AFF' }}>Timer</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Swipable Trending Banner Carousel */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const slide = Math.round(e.nativeEvent.contentOffset.x / (width - 32));
              if (slide !== activeIndex) {
                setActiveIndex(slide);
              }
            }}
            scrollEventThrottle={16}
          >
            {(recipes.slice(0, 3).length > 0 ? recipes.slice(0, 3) : [trendingRecipe]).map((item) => (
              <TouchableOpacity
                key={item._id}
                activeOpacity={0.95}
                onPress={() => navigation.navigate('RecipeDetail', { recipeId: item._id })}
                style={styles.trendingCardContainer}
              >
                <ImageBackground
                  source={{ uri: item.image }}
                  style={styles.trendingCard}
                  imageStyle={{ borderRadius: 24 }}
                >
                  <View style={styles.trendingTag}>
                    <Text style={styles.trendingTagText}>🔥 Hot Trend</Text>
                  </View>

                  <View style={styles.trendingContent}>
                    <View>
                      <Text style={styles.trendingSubtitle}>Công thức HOT nhất tuần</Text>
                      <Text style={styles.trendingTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                    </View>

                    <View style={styles.viewRecipeButton}>
                      <Text style={styles.viewRecipeText}>Xem ngay</Text>
                    </View>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Dots Indicator */}
          <View style={styles.cardDots}>
            {(recipes.slice(0, 3).length > 0 ? recipes.slice(0, 3) : [trendingRecipe]).map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.cardDot,
                  activeIndex === idx && styles.activeCardDot,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Danh mục</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <Text style={styles.seeAllText}>See all <Ionicons name="chevron-forward" size={12} /></Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {displayedCategories.map((category) => (
            <CategoryItem
              key={category._id || category.id}
              category={category}
              isSelected={selectedCategory === (category._id || category.id)}
              onPress={() => handleSelectCategory(category._id || category.id)}
            />
          ))}
        </ScrollView>

        {/* Popular Recipes Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Phổ biến nhất</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <Text style={styles.seeAllText}>Xem tất cả <Ionicons name="chevron-forward" size={12} /></Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <LoadingSpinner />
        ) : popularRecipes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không tìm thấy công thức phổ biến nào.</Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {popularRecipes.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </View>
        )}

        {/* Featured Recipes Section */}
        {featuredRecipes.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Nổi bật</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                <Text style={styles.seeAllText}>Xem tất cả <Ionicons name="chevron-forward" size={12} /></Text>
              </TouchableOpacity>
            </View>

            <View style={styles.gridContainer}>
              {featuredRecipes.map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5F5',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  greeting: {
    fontSize: 13,
    color: colors.grey,
    fontWeight: '500',
  },
  username: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.dark,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: colors.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingHorizontal: 14,
    height: 52,
    shadowColor: '#2B2D42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 22,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.dark,
    paddingVertical: 10,
  },
  filterButton: {
    backgroundColor: '#FFEBF0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  filterButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  carouselContainer: {
    width: width - 32,
    height: 180,
    marginBottom: 25,
    position: 'relative',
  },
  trendingCardContainer: {
    width: width - 32,
    height: 180,
  },
  trendingCard: {
    height: 180,
    width: '100%',
    padding: 20,
    justifyContent: 'space-between',
    position: 'relative',
  },
  trendingTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  trendingTagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.dark,
  },
  trendingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(43, 45, 66, 0.45)',
    padding: 12,
    borderRadius: 16,
  },
  trendingSubtitle: {
    color: '#FFB8C6',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  trendingTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
    width: width * 0.45,
  },
  viewRecipeButton: {
    backgroundColor: colors.white,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  viewRecipeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  cardDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: -12,
    alignSelf: 'center',
  },
  cardDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 3,
  },
  activeCardDot: {
    backgroundColor: colors.primary,
    width: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.dark,
  },
  seeAllText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  categoryScroll: {
    paddingBottom: 8,
    marginBottom: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    color: colors.grey,
    fontSize: 14,
  },
});

export default HomeScreen;
