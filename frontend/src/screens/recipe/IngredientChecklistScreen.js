import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchMealPlans } from '../../store/mealPlanSlice';
import colors from '../../theme/colors';
import typography from '../../theme/typography';
import spacing from '../../theme/spacing';

const rawWidth = Dimensions.get('window').width;
const width = Platform.OS === 'web' ? Math.min(rawWidth, 600) : rawWidth;

const IngredientChecklistScreen = ({ route, navigation }) => {
  const { dateString } = route.params;
  const dispatch = useDispatch();
  const { plans = [], isLoading = false } = useSelector((state) => state.mealPlan || {});
  const [checkedIngredients, setCheckedIngredients] = useState({});

  useEffect(() => {
    dispatch(fetchMealPlans());
    loadCheckedState();
  }, [dispatch]);

  const loadCheckedState = async () => {
    try {
      const saved = await AsyncStorage.getItem(`checklist_${dateString}`);
      if (saved) {
        setCheckedIngredients(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading checklist state:', error);
    }
  };

  const toggleIngredient = async (recipeId, ingName) => {
    const key = `${recipeId}_${ingName}`;
    const updated = {
      ...checkedIngredients,
      [key]: !checkedIngredients[key],
    };
    setCheckedIngredients(updated);
    try {
      await AsyncStorage.setItem(`checklist_${dateString}`, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving checklist state:', error);
    }
  };

  const clearChecklist = async () => {
    setCheckedIngredients({});
    try {
      await AsyncStorage.removeItem(`checklist_${dateString}`);
    } catch (error) {
      console.error('Error clearing checklist state:', error);
    }
  };

  // Find plans for the selected date
  const dayPlans = plans.filter((plan) => plan.date === dateString);

  const formattedDate = dateString.split('-').reverse().join('/');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chuẩn Bị Nguyên Liệu</Text>
        <TouchableOpacity onPress={clearChecklist} style={styles.clearButton}>
          <Text style={styles.clearText}>Xóa chọn</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.dateBanner}>
          <Text style={styles.dateLabel}>Nguyên liệu ngày {formattedDate}</Text>
          <Text style={styles.dateSub}>Kiểm tra nguyên liệu sẵn có trước khi chế biến</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : dayPlans.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🥣</Text>
            <Text style={styles.emptyText}>Hôm nay bạn không có lịch nấu ăn.</Text>
            <Text style={styles.emptySub}>
              Hãy lên kế hoạch một vài món bánh để hệ thống tạo danh sách chuẩn bị nhé!
            </Text>
          </View>
        ) : (
          dayPlans.map((plan) => {
            const recipe = plan.recipe;
            if (!recipe) return null;

            return (
              <View key={plan._id} style={styles.recipeCard}>
                <View style={styles.recipeHeader}>
                  <Text style={styles.recipeTitle}>{recipe.title}</Text>
                  <TouchableOpacity
                    style={styles.cookNowBtn}
                    onPress={() => navigation.navigate('CookingMode', { recipe })}
                  >
                    <Ionicons name="play" size={12} color={colors.white} />
                    <Text style={styles.cookNowText}>Nấu ngay</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.ingredientsList}>
                  {recipe.ingredients.map((ing, idx) => {
                    const isChecked = !!checkedIngredients[`${recipe._id}_${ing}`];
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.ingRow, isChecked && styles.ingRowChecked]}
                        onPress={() => toggleIngredient(recipe._id, ing)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                          {isChecked && <Ionicons name="checkmark" size={12} color={colors.white} />}
                        </View>
                        <Text style={[styles.ingText, isChecked && styles.ingTextChecked]}>
                          {ing}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.dark,
  },
  clearButton: {
    padding: 8,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  scrollContent: {
    padding: 16,
  },
  dateBanner: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 5,
    borderLeftColor: '#FFD166',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  dateLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.dark,
  },
  dateSub: {
    fontSize: 11,
    color: colors.grey,
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 20,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.dark,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 12,
    color: colors.grey,
    textAlign: 'center',
    lineHeight: 18,
  },
  recipeCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 12,
    marginBottom: 12,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.dark,
    flex: 1,
    marginRight: 10,
  },
  cookNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  cookNowText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
    marginLeft: 4,
  },
  ingredientsList: {
    marginTop: 4,
  },
  ingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FDFBFB',
  },
  ingRowChecked: {
    opacity: 0.5,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.grey,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  ingText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.dark,
    flex: 1,
  },
  ingTextChecked: {
    textDecorationLine: 'line-through',
    color: colors.grey,
  },
});

export default IngredientChecklistScreen;
