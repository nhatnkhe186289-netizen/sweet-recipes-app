import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { fetchRecipes, fetchCategories } from '../../store/recipeSlice';
import RecipeCard from '../../components/RecipeCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../theme/colors';
import typography from '../../theme/typography';
import spacing from '../../theme/spacing';
import { DEFAULT_CATEGORIES } from '../../constants/categories';

const SearchScreen = ({ route }) => {
  const dispatch = useDispatch();
  const [query, setQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');

  const { recipes, categories, isLoading } = useSelector((state) => state.recipe);

  // Check if query was passed from other screens (e.g. Home screen)
  useEffect(() => {
    dispatch(fetchCategories());
    if (route.params?.query) {
      setQuery(route.params.query);
      dispatch(fetchRecipes({ query: route.params.query }));
    } else {
      dispatch(fetchRecipes({}));
    }
  }, [dispatch, route.params]);

  const handleSearch = (text) => {
    setQuery(text);
    dispatch(fetchRecipes({
      query: text,
      category: selectedCategoryId !== 'all' ? selectedCategoryId : undefined
    }));
  };

  const handleSelectCategory = (categoryId) => {
    setSelectedCategoryId(categoryId);
    dispatch(fetchRecipes({
      query,
      category: categoryId !== 'all' ? categoryId : undefined
    }));
  };

  const trendingSearches = [
    'Chocolate cake',
    'Strawberry donut',
    'Cheesecake',
    'Ice cream'
  ];

  const handleTrendingSearchClick = (term) => {
    setQuery(term);
    dispatch(fetchRecipes({
      query: term,
      category: selectedCategoryId !== 'all' ? selectedCategoryId : undefined
    }));
  };

  const displayedCategories = [{ _id: 'all', name: 'All' }, ...categories];

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <Text style={styles.headerTitle}>Tìm kiếm</Text>
        
        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <Ionicons name="search-outline" size={20} color={colors.grey} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm bánh ngọt, bánh quy, donut..."
            placeholderTextColor={colors.grey}
            value={query}
            onChangeText={handleSearch}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')} style={styles.clearIcon}>
              <Ionicons name="close-circle" size={20} color={colors.grey} />
            </TouchableOpacity>
          )}
        </View>

        {/* Trending Searches */}
        <View style={styles.trendingContainer}>
          <View style={styles.trendingHeader}>
            <Ionicons name="flash-outline" size={14} color="#FFD166" />
            <Text style={styles.sectionTitle}>Tìm kiếm phổ biến</Text>
          </View>
          <View style={styles.tagsContainer}>
            {trendingSearches.map((term, index) => (
              <TouchableOpacity
                key={index}
                style={styles.tag}
                onPress={() => handleTrendingSearchClick(term)}
              >
                <Text style={styles.tagText}>{term}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Categories horizontal tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTabs}
        >
          {displayedCategories.map((cat) => {
            const isSelected = selectedCategoryId === cat._id;
            return (
              <TouchableOpacity
                key={cat._id}
                style={[styles.tabButton, isSelected && styles.activeTabButton]}
                onPress={() => handleSelectCategory(cat._id)}
              >
                <Text style={[styles.tabButtonText, isSelected && styles.activeTabButtonText]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Results Title Count */}
      {!isLoading && (
        <Text style={styles.resultsCount}>
          {recipes.length} công thức tìm thấy
        </Text>
      )}

      {/* Recipe Grid */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={({ item }) => <RecipeCard recipe={item} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {query ? `Không tìm thấy công thức nào cho "${query}"` : 'Nhập nội dung để tìm kiếm công thức tráng miệng thơm ngon.'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5F5',
  },
  searchHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: colors.white,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#2B2D42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.dark,
    marginBottom: 16,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5F5',
    borderRadius: 18,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 16,
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
  clearIcon: {
    padding: 4,
  },
  trendingContainer: {
    marginBottom: 16,
  },
  trendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendingTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.dark,
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#FAF0E6', // Light beige tag
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 11,
    color: colors.dark,
    fontWeight: '600',
  },
  categoryTabs: {
    paddingBottom: 16,
    paddingTop: 4,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#FAF5F5',
    marginRight: 8,
  },
  activeTabButton: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.grey,
  },
  activeTabButtonText: {
    color: colors.white,
    fontWeight: '700',
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.grey,
    marginHorizontal: 18,
    marginTop: 16,
    marginBottom: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: colors.grey,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 30,
  },
});

export default SearchScreen;
