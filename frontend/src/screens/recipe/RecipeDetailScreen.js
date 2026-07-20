import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, FlatList, Platform, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import recipeService from '../../services/recipe.service';
import { fetchRecipes } from '../../store/recipeSlice';
import { addItems } from '../../store/shoppingListSlice';
import { addMealPlan, fetchMealPlans } from '../../store/mealPlanSlice';
import FavoriteButton from '../../components/FavoriteButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import colors from '../../theme/colors';
import typography from '../../theme/typography';
import spacing from '../../theme/spacing';
import alertService from '../../services/alertService';
import { confirmAction } from '../../utils/alert';

const formatDateString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getNextDays = (count) => {
  const list = [];
  const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    list.push({
      dateString: formatDateString(d),
      dayLabel: d.getDate(),
      weekday: weekdays[d.getDay()],
      isToday: i === 0,
      fullDate: d,
    });
  }
  return list;
};

const RecipeDetailScreen = ({ route, navigation }) => {
  const { recipeId } = route.params;
  const dispatch = useDispatch();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkedIngredients, setCheckedIngredients] = useState([]);

  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [selectedPlanDate, setSelectedPlanDate] = useState(formatDateString(new Date()));
  const [selectedHour, setSelectedHour] = useState(() => {
    const hr = new Date().getHours() + 1;
    return String(hr % 24).padStart(2, '0');
  });
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const { plans = [] } = useSelector((state) => state.mealPlan || {});

  const toggleIngredient = (idx) => {
    if (checkedIngredients.includes(idx)) {
      setCheckedIngredients(checkedIngredients.filter((i) => i !== idx));
    } else {
      setCheckedIngredients([...checkedIngredients, idx]);
    }
  };

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
    dispatch(fetchMealPlans());
  }, [recipeId, dispatch]);

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

  const handleSavePlan = async () => {
    if (!selectedPlanDate) {
      Alert.alert('Thông báo', 'Vui lòng chọn ngày nấu ăn.');
      return;
    }

    // Validate real-time constraints for today
    const now = new Date();
    const todayStr = formatDateString(now);
    if (selectedPlanDate === todayStr) {
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      const selHourInt = parseInt(selectedHour);
      const selMinInt = parseInt(selectedMinute);

      if (selHourInt < currentHour || (selHourInt === currentHour && selMinInt <= currentMin)) {
        Alert.alert('Thời gian không hợp lệ', 'Bạn không thể lên kế hoạch nấu ăn vào thời gian đã qua trong ngày hôm nay. Vui lòng chọn giờ trong tương lai!');
        return;
      }
    }
    
    const timeStr = `${selectedHour}:${selectedMinute}`;

    console.log('=== DEBUG DUPLICATE CHECK ===');
    console.log('recipeId:', recipeId);
    console.log('selectedPlanDate:', selectedPlanDate);
    console.log('plans length:', plans.length);
    plans.forEach((p, idx) => {
      const pRecipeId = p.recipe && typeof p.recipe === 'object' ? p.recipe._id : p.recipe;
      console.log(`Plan #${idx}: date=${p.date}, recipeId=${pRecipeId}, matchDate=${p.date === selectedPlanDate}, matchRecipe=${String(pRecipeId) === String(recipeId)}`);
    });

    // Check if duplicate plan for this recipe on this date exists
    const alreadyPlanned = plans.some((p) => {
      const pRecipeId = p.recipe && typeof p.recipe === 'object' ? p.recipe._id : p.recipe;
      return p.date === selectedPlanDate && String(pRecipeId) === String(recipeId);
    });

    const executeSave = async () => {
      setIsSavingPlan(true);
      try {
        await dispatch(
          addMealPlan({
            recipeId: recipe._id,
            date: selectedPlanDate,
            time: timeStr,
          })
        ).unwrap();
        
        setShowDatePickerModal(false);
        Alert.alert('Thành công', 'Đã thêm món bánh này vào kế hoạch nấu ăn! 📅');
        navigation.navigate('App', { screen: 'Home' });
      } catch (err) {
        Alert.alert('Lỗi', err || 'Không thể lên kế hoạch nấu ăn.');
      } finally {
        setIsSavingPlan(false);
      }
    };

    if (alreadyPlanned) {
      alertService.confirm(
        'Lập kế hoạch trùng lặp',
        'Bạn đã lập kế hoạch cho loại bánh này hôm nay. Bạn có chắc chắn muốn lập kế hoạch với loại bánh này nữa không?',
        executeSave,
        () => {
          setShowDatePickerModal(false);
          navigation.goBack();
        },
        'Xác nhận',
        'Hủy'
      );
    } else {
      executeSave();
    }
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
              <Text style={styles.gridVal}>{recipe.cookingTime} phút</Text>
              <Text style={styles.gridLbl}>phút</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridVal}>{recipe.calories} kcal</Text>
              <Text style={styles.gridLbl}>kcal</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridVal}>{recipe.difficulty === 'Easy' ? 'Dễ' : recipe.difficulty === 'Medium' ? 'Trung bình' : recipe.difficulty === 'Hard' ? 'Khó' : recipe.difficulty}</Text>
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
          {recipe.ingredients.map((ing, idx) => {
            const isChecked = checkedIngredients.includes(idx);
            return (
              <TouchableOpacity
                key={idx}
                style={styles.ingredientRow}
                onPress={() => toggleIngredient(idx)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isChecked ? "checkbox" : "square-outline"}
                  size={20}
                  color={isChecked ? colors.primary : colors.grey}
                  style={styles.checkbox}
                />
                <Text style={[styles.listItem, { marginBottom: 0 }, isChecked && styles.checkedListItem]}>
                  {ing}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Instructions */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, rowGap: 10 }}>
            <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Hướng dẫn thực hiện</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
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
                  ⏱️ Hẹn giờ
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.primary,
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                }}
                onPress={() => navigation.navigate('Cooking', {
                  recipeId: recipe._id,
                  recipeTitle: recipe.title,
                  instructions: recipe.instructions,
                  ingredients: recipe.ingredients,
                  calories: recipe.calories,
                })}
              >
                <Ionicons name="play-circle" size={18} color={colors.white} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.white, marginLeft: 4 }}>Bắt đầu nấu</Text>
              </TouchableOpacity>
            </View>
          </View>
          {recipe.instructions.map((inst, idx) => (
            <Text key={idx} style={styles.listItem}>{idx + 1}. {inst}</Text>
          ))}

          {/* Buttons */}
          <Button
            title="📅 Lập kế hoạch nấu"
            onPress={() => setShowDatePickerModal(true)}
            style={styles.planBtn}
          />

          <Button
            title="💬 Xem bình luận"
            variant="outline"
            onPress={() => navigation.navigate('Comments', { recipeId })}
            style={styles.commentBtn}
          />

          {isAuthor && (
            <View style={styles.authorButtons}>
              <Button
                title="Edit"
                icon="pencil-outline"
                variant="secondary"
                onPress={() => navigation.navigate('EditRecipe', { recipeId })}
                style={styles.editBtn}
              />
              <Button
                title="Delete"
                icon="trash-outline"
                onPress={handleDelete}
                style={styles.deleteBtn}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePickerModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDatePickerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lập kế hoạch nấu ăn</Text>
              <TouchableOpacity onPress={() => setShowDatePickerModal(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={colors.dark} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSectionLabel}>1. Chọn ngày (14 ngày tới):</Text>
            <View style={styles.daysScrollContainer}>
              <FlatList
                data={getNextDays(14)}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.dateString}
                renderItem={({ item }) => {
                  const isSelected = item.dateString === selectedPlanDate;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.dateScrollCard,
                        isSelected && styles.selectedDateScrollCard,
                      ]}
                      onPress={() => {
                        setSelectedPlanDate(item.dateString);
                        const now = new Date();
                        const todayStr = formatDateString(now);
                        if (item.dateString === todayStr) {
                          const curHour = now.getHours();
                          const selHourInt = parseInt(selectedHour);
                          const selMinInt = parseInt(selectedMinute);
                          if (selHourInt < curHour || (selHourInt === curHour && selMinInt <= now.getMinutes())) {
                            const nextHour = String((curHour + 1) % 24).padStart(2, '0');
                            setSelectedHour(nextHour);
                            setSelectedMinute('00');
                          }
                        }
                      }}
                    >
                      <Text style={[styles.dateScrollWeekday, isSelected && styles.selectedDateScrollText]}>
                        {item.weekday}
                      </Text>
                      <Text style={[styles.dateScrollDay, isSelected && styles.selectedDateScrollText]}>
                        {item.dayLabel}
                      </Text>
                      {item.isToday && (
                        <Text style={[styles.dateScrollToday, isSelected && styles.selectedDateScrollText]}>
                          H.Nay
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                }}
                contentContainerStyle={styles.daysScrollList}
              />
            </View>

            <Text style={styles.modalSectionLabel}>2. Chọn thời gian làm bánh:</Text>
            <View style={styles.timePickerContainer}>
              {/* Hour selector */}
              <View style={styles.timePickerColumn}>
                <Text style={styles.timePickerLabel}>Giờ</Text>
                <ScrollView style={styles.timePickerScroll} nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 24 }).map((_, h) => {
                    const hrStr = String(h).padStart(2, '0');
                    const isSelected = selectedHour === hrStr;
                    
                    const now = new Date();
                    const isToday = selectedPlanDate === formatDateString(now);
                    const isPastHour = isToday && (h < now.getHours() || (h === now.getHours() && now.getMinutes() >= 55));

                    return (
                      <TouchableOpacity
                        key={hrStr}
                        disabled={isPastHour}
                        style={[
                          styles.timeItem,
                          isSelected && !isPastHour && styles.selectedTimeItem,
                          isPastHour && styles.pastTimeItem,
                        ]}
                        onPress={() => setSelectedHour(hrStr)}
                      >
                        <Text style={[
                          styles.timeItemText,
                          isSelected && !isPastHour && styles.selectedTimeItemText,
                          isPastHour && styles.pastTimeItemText,
                        ]}>
                          {hrStr}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <Text style={styles.timePickerColon}>:</Text>

              {/* Minute selector */}
              <View style={styles.timePickerColumn}>
                <Text style={styles.timePickerLabel}>Phút</Text>
                <ScrollView style={styles.timePickerScroll} nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 12 }).map((_, m) => {
                    const minVal = m * 5;
                    const minStr = String(minVal).padStart(2, '0');
                    const isSelected = selectedMinute === minStr;

                    const now = new Date();
                    const isToday = selectedPlanDate === formatDateString(now);
                    const isCurrentHour = selectedHour === String(now.getHours()).padStart(2, '0');
                    const isPastMin = isToday && isCurrentHour && minVal <= now.getMinutes();

                    return (
                      <TouchableOpacity
                        key={minStr}
                        disabled={isPastMin}
                        style={[
                          styles.timeItem,
                          isSelected && !isPastMin && styles.selectedTimeItem,
                          isPastMin && styles.pastTimeItem,
                        ]}
                        onPress={() => setSelectedMinute(minStr)}
                      >
                        <Text style={[
                          styles.timeItemText,
                          isSelected && !isPastMin && styles.selectedTimeItemText,
                          isPastMin && styles.pastTimeItemText,
                        ]}>
                          {minStr}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            <Button
              title={isSavingPlan ? "Đang lưu..." : "Lưu kế hoạch"}
              loading={isSavingPlan}
              onPress={handleSavePlan}
              style={styles.savePlanBtn}
            />
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: spacing.sm, // Reduce horizontal padding
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: colors.error,
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm, // Reduce horizontal padding
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planBtn: {
    marginTop: spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.dark,
  },
  closeBtn: {
    padding: 4,
  },
  modalSectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.grey,
    marginVertical: 10,
  },
  daysScrollContainer: {
    height: 90,
  },
  daysScrollList: {
    paddingVertical: 5,
  },
  dateScrollCard: {
    width: 60,
    height: 70,
    backgroundColor: colors.light,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedDateScrollCard: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  dateScrollWeekday: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.grey,
  },
  dateScrollDay: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.dark,
    marginVertical: 2,
  },
  dateScrollToday: {
    fontSize: 8,
    fontWeight: '700',
    color: colors.primary,
  },
  selectedDateScrollText: {
    color: colors.white,
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.light,
    borderRadius: 20,
    padding: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timePickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  timePickerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.grey,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  timePickerScroll: {
    height: 100,
    width: '100%',
  },
  timeItem: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedTimeItem: {
    backgroundColor: colors.primary,
  },
  timeItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark,
  },
  selectedTimeItemText: {
    color: colors.white,
    fontWeight: '800',
  },
  pastTimeItem: {
    opacity: 0.35,
  },
  pastTimeItemText: {
    color: colors.grey,
  },
  timePickerColon: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    marginHorizontal: 15,
    paddingBottom: 25,
  },
  savePlanBtn: {
    marginTop: 20,
    backgroundColor: colors.success,
    shadowColor: colors.success,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  checkbox: {
    marginRight: 10,
  },
  checkedListItem: {
    textDecorationLine: 'line-through',
    color: colors.grey,
  },
  instructionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitleInline: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.dark,
  },
  startCookingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  startCookingText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 6,
  },
});

export default RecipeDetailScreen;
