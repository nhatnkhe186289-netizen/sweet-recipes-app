import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Image,
  ImageBackground,
  Dimensions,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { fetchRecipes, fetchCategories } from '../../store/recipeSlice';
import { fetchFavorites } from '../../store/favoriteSlice';
import { fetchMealPlans } from '../../store/mealPlanSlice';
import RecipeCard from '../../components/RecipeCard';
import CategoryItem from '../../components/CategoryItem';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../theme/colors';


const rawWidth = Dimensions.get('window').width;
const width = Platform.OS === 'web' ? Math.min(rawWidth, 600) : rawWidth;

const formatDateString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const scrollViewRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const { recipes, categories, isLoading } = useSelector((state) => state.recipe);
  const { user } = useSelector((state) => state.auth);
  const { plans = [] } = useSelector((state) => state.mealPlan || {});

  useEffect(() => {
    dispatch(fetchRecipes());
    dispatch(fetchCategories());
    dispatch(fetchFavorites());
    dispatch(fetchMealPlans());
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchRecipes(selectedCategory ? { category: selectedCategory } : {})),
      dispatch(fetchCategories()),
      dispatch(fetchFavorites()),
      dispatch(fetchMealPlans()),
    ]);
    setRefreshing(false);
  };

  const handleSelectCategory = (categoryId) => {
    const newCategory = selectedCategory === categoryId ? null : categoryId;
    setSelectedCategory(newCategory);
    dispatch(fetchRecipes(newCategory ? { category: newCategory } : {}));
  };

  const displayedCategories = categories;

  // Split recipes for Popular and Featured sections
  const popularRecipes = recipes.slice(0, 4);
  const featuredRecipes = recipes.slice(4, 8);

  const trendingRecipesList = recipes.slice(0, 3);
  const trendingRecipe = recipes[0] || {
    _id: 'default_trending',
    title: 'Strawberry Dream Cake',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800',
    cookingTime: 45,
    calories: 350,
  };

  const slidesData = trendingRecipesList.length > 0 ? trendingRecipesList : [trendingRecipe];
  const totalSlides = slidesData.length;

  // Auto-play / Auto-slide effect
  useEffect(() => {
    if (totalSlides <= 1) return;
    
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % totalSlides;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * (width - 32),
        animated: true,
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [activeIndex, totalSlides]);

  const handleSearchSubmit = () => {
    navigation.navigate('Search', { query: searchQuery });
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
            <Text style={styles.greeting}>Good morning 👋</Text>
            <Text style={styles.username}>{user ? user.username : 'Emma Rose'}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconCircle}>
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
            placeholder="Search cakes, cookies, donuts..."
            placeholderTextColor={colors.grey}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
          />
          <TouchableOpacity style={styles.filterButton} onPress={handleSearchSubmit}>
            <Text style={styles.filterButtonText}>Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Plan Widget */}
        {(() => {
          const todayStr = formatDateString(new Date());
          const todayPlans = plans.filter((p) => p.date === todayStr);
          
          if (todayPlans.length > 0) {
            const firstPlan = todayPlans[0];
            const recipe = firstPlan.recipe;
            if (!recipe) return null;

            return (
              <View style={styles.todayPlanCard}>
                <View style={styles.todayPlanHeader}>
                  <Text style={styles.todayPlanLabel}>📅 Kế hoạch hôm nay</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('MealPlanner')}>
                    <Text style={styles.todayPlanSeeAll}>Xem lịch ({todayPlans.length})</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.todayPlanBody}>
                  <Image source={{ uri: recipe.image }} style={styles.todayPlanImg} />
                  <View style={styles.todayPlanInfo}>
                    <Text style={styles.todayPlanTitle} numberOfLines={1}>{recipe.title}</Text>
                    <Text style={styles.todayPlanMeta}>
                      ⏱️ {recipe.cookingTime} phút | 🔥 {recipe.calories} kcal
                    </Text>
                    <TouchableOpacity
                      style={styles.todayPlanBtn}
                      onPress={() => navigation.navigate('CookingMode', { recipe })}
                    >
                      <Ionicons name="play" size={14} color={colors.white} />
                      <Text style={styles.todayPlanBtnText}>Bắt đầu nấu</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          } else {
            return (
              <TouchableOpacity
                style={styles.todayPlanEmptyCard}
                onPress={() => navigation.navigate('MealPlanner')}
                activeOpacity={0.9}
              >
                <View style={styles.todayPlanEmptyLeft}>
                  <Text style={styles.todayPlanEmptyTitle}>🍰 Hôm nay nấu món gì?</Text>
                  <Text style={styles.todayPlanEmptySub}>
                    Bạn chưa lên lịch nấu hôm nay. Lên kế hoạch ngọt ngào ngay nhé!
                  </Text>
                </View>
                <View style={styles.todayPlanEmptyRight}>
                  <Ionicons name="calendar-outline" size={24} color={colors.primary} />
                </View>
              </TouchableOpacity>
            );
          }
        })()}

        {/* Swipable Trending Banner Carousel */}
        <View style={styles.carouselContainer}>
          <ScrollView
            ref={scrollViewRef}
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
            {slidesData.map((item) => (
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

          {/* Left/Right Arrow Buttons (especially useful on Web) */}
          {totalSlides > 1 && (
            <>
              <TouchableOpacity
                style={[styles.arrowButton, styles.leftArrow]}
                onPress={() => {
                  const nextIndex = (activeIndex - 1 + totalSlides) % totalSlides;
                  scrollViewRef.current?.scrollTo({
                    x: nextIndex * (width - 32),
                    animated: true,
                  });
                }}
              >
                <Ionicons name="chevron-back" size={20} color={colors.dark} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.arrowButton, styles.rightArrow]}
                onPress={() => {
                  const nextIndex = (activeIndex + 1) % totalSlides;
                  scrollViewRef.current?.scrollTo({
                    x: nextIndex * (width - 32),
                    animated: true,
                  });
                }}
              >
                <Ionicons name="chevron-forward" size={20} color={colors.dark} />
              </TouchableOpacity>
            </>
          )}

          {/* Dots Indicator */}
          <View style={styles.cardDots}>
            {slidesData.map((_, idx) => (
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
          <Text style={styles.sectionTitle}>Categories</Text>
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
          <Text style={styles.sectionTitle}>Popular Recipes</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <Text style={styles.seeAllText}>See all <Ionicons name="chevron-forward" size={12} /></Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <LoadingSpinner />
        ) : popularRecipes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No popular recipes found.</Text>
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
              <Text style={styles.sectionTitle}>Featured Recipes</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                <Text style={styles.seeAllText}>See all <Ionicons name="chevron-forward" size={12} /></Text>
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
  arrowButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  leftArrow: {
    left: 10,
  },
  rightArrow: {
    right: 10,
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
  todayPlanCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  todayPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 10,
    marginBottom: 10,
  },
  todayPlanLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.dark,
  },
  todayPlanSeeAll: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  todayPlanBody: {
    flexDirection: 'row',
  },
  todayPlanImg: {
    width: 70,
    height: 70,
    borderRadius: 14,
  },
  todayPlanInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  todayPlanTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.dark,
  },
  todayPlanMeta: {
    fontSize: 11,
    color: colors.grey,
  },
  todayPlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  todayPlanBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
    marginLeft: 4,
  },
  todayPlanEmptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFEBF0',
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFD1DC',
  },
  todayPlanEmptyLeft: {
    flex: 1,
    marginRight: 10,
  },
  todayPlanEmptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  todayPlanEmptySub: {
    fontSize: 11,
    color: colors.grey,
    lineHeight: 15,
  },
  todayPlanEmptyRight: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
