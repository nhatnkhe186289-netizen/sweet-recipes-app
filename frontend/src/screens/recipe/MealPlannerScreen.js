import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  Dimensions,
  Alert,
  FlatList,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { fetchMealPlans, addMealPlan, removeMealPlan } from '../../store/mealPlanSlice';
import { fetchRecipes } from '../../store/recipeSlice';
import colors from '../../theme/colors';
import typography from '../../theme/typography';
import spacing from '../../theme/spacing';

const rawWidth = Dimensions.get('window').width;
const width = Platform.OS === 'web' ? Math.min(rawWidth, 600) : rawWidth;

const formatDateString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getMonthName = (monthIndex) => {
  const months = [
    'Tháng Một', 'Tháng Hai', 'Tháng Ba', 'Tháng Tư', 'Tháng Năm', 'Tháng Sáu',
    'Tháng Bảy', 'Tháng Tám', 'Tháng Chín', 'Tháng Mười', 'Tháng Mười Một', 'Tháng Mười Hai'
  ];
  return months[monthIndex];
};

const MEAL_TYPES = [
  { key: 'Breakfast', label: '🍳 Bữa sáng' },
  { key: 'Lunch', label: '🥗 Bữa trưa' },
  { key: 'Dinner', label: '🍲 Bữa tối' },
  { key: 'General', label: '🍰 Món ngọt / Ăn vặt' },
];

const MealPlannerScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { plans = [], isLoading = false } = useSelector((state) => state.mealPlan || {});
  const { recipes } = useSelector((state) => state.recipe);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(formatDateString(new Date()));
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedHour, setSelectedHour] = useState(() => {
    const hr = new Date().getHours() + 1;
    return String(hr % 24).padStart(2, '0');
  });
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedRecipeIds, setSelectedRecipeIds] = useState([]);
  const [isSavingBatch, setIsSavingBatch] = useState(false);

  useEffect(() => {
    dispatch(fetchMealPlans());
    dispatch(fetchRecipes());
  }, [dispatch]);

  // Calendar Helper Logic
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday, 1 is Monday
  // Convert to T2 (Mon) = 0, T3 = 1... CN (Sun) = 6
  const startOffset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const daysGrid = [];

  // Add days from previous month
  for (let i = startOffset - 1; i >= 0; i--) {
    const prevDate = new Date(year, month - 1, prevMonthDays - i);
    daysGrid.push({
      dayNum: prevMonthDays - i,
      isCurrentMonth: false,
      dateString: formatDateString(prevDate),
    });
  }

  // Add current month days
  for (let i = 1; i <= totalDays; i++) {
    const currDate = new Date(year, month, i);
    daysGrid.push({
      dayNum: i,
      isCurrentMonth: true,
      dateString: formatDateString(currDate),
    });
  }

  // Add days from next month to make rows complete (42 items total)
  const remainingCells = 42 - daysGrid.length;
  for (let i = 1; i <= remainingCells; i++) {
    const nextDate = new Date(year, month + 1, i);
    daysGrid.push({
      dayNum: i,
      isCurrentMonth: false,
      dateString: formatDateString(nextDate),
    });
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  // Plans filtering for selected day
  const selectedDayPlans = plans.filter((plan) => plan.date === selectedDate);

  const handleToggleSelectRecipe = (recipeId) => {
    setSelectedRecipeIds((prev) =>
      prev.includes(recipeId) ? prev.filter((id) => id !== recipeId) : [...prev, recipeId]
    );
  };

  const handleSaveBatchPlans = async () => {
    if (selectedRecipeIds.length === 0) return;

    const timeStr = `${selectedHour}:${selectedMinute}`;

    // 1. Validate real-time constraints for today
    const now = new Date();
    const todayStr = formatDateString(now);
    if (selectedDate === todayStr) {
      const currentHourVal = now.getHours();
      const currentMinVal = now.getMinutes();
      const selHourInt = parseInt(selectedHour);
      const selMinInt = parseInt(selectedMinute);

      if (selHourInt < currentHourVal || (selHourInt === currentHourVal && selMinInt <= currentMinVal)) {
        Alert.alert('Thời gian không hợp lệ', 'Bạn không thể lên kế hoạch nấu ăn vào thời gian đã qua trong ngày hôm nay. Vui lòng chọn giờ trong tương lai!');
        return;
      }
    }

    // 2. Check each selected recipe for duplication
    let approvedIds = [...selectedRecipeIds];
    let cancelledSome = false;

    for (const id of selectedRecipeIds) {
      const rec = recipes.find((r) => r._id === id);
      if (!rec) continue;

      const alreadyPlanned = plans.some((p) => {
        const pRecipeId = p.recipe && typeof p.recipe === 'object' ? p.recipe._id : p.recipe;
        return p.date === selectedDate && String(pRecipeId) === String(id);
      });

      if (alreadyPlanned) {
        const msg = `Bạn đã lập kế hoạch cho bánh "${rec.title}" hôm nay. Bạn có chắc chắn muốn lập kế hoạch thêm không?`;
        
        let proceed = false;
        if (Platform.OS === 'web') {
          proceed = window.confirm(msg);
        } else {
          proceed = await new Promise((resolve) => {
            Alert.alert(
              'Lập kế hoạch trùng lặp',
              msg,
              [
                { text: 'Hủy', style: 'cancel', onPress: () => resolve(false) },
                { text: 'Xác nhận', onPress: () => resolve(true) },
              ]
            );
          });
        }

        if (!proceed) {
          // Unselect this recipe
          setSelectedRecipeIds((prev) => prev.filter((item) => item !== id));
          approvedIds = approvedIds.filter((item) => item !== id);
          cancelledSome = true;
        }
      }
    }

    // If some duplicates were cancelled, keep the modal open and let the user continue selection
    if (cancelledSome) {
      return;
    }

    // Proceed to save approved plans
    if (approvedIds.length === 0) return;

    setIsSavingBatch(true);
    try {
      await Promise.all(
        approvedIds.map((recipeId) =>
          dispatch(
            addMealPlan({
              recipeId,
              date: selectedDate,
              time: timeStr,
            })
          ).unwrap()
        )
      );
      setShowAddModal(false);
      setSelectedRecipeIds([]);
      Alert.alert('Thành công', 'Đã lưu kế hoạch cho các món bánh được chọn! 📅');
      navigation.navigate('App', { screen: 'Home' });
    } catch (err) {
      Alert.alert('Lỗi', err || 'Không thể lên kế hoạch nấu ăn.');
    } finally {
      setIsSavingBatch(false);
    }
  };

  const handleDeletePlan = (planId) => {
    const performDelete = () => {
      dispatch(removeMealPlan(planId))
        .unwrap()
        .then(() => {
          Alert.alert('Thành công', 'Đã xóa kế hoạch nấu ăn.');
        })
        .catch((err) => {
          Alert.alert('Lỗi', err || 'Không thể xóa kế hoạch.');
        });
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Bạn có muốn xóa món ăn này khỏi lịch nấu không?')) {
        performDelete();
      }
    } else {
      Alert.alert('Xóa kế hoạch', 'Bạn có muốn xóa món ăn này khỏi lịch nấu không?', [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: performDelete },
      ]);
    }
  };

  const renderRecipeItem = ({ item }) => {
    const isSelected = selectedRecipeIds.includes(item._id);
    return (
      <TouchableOpacity
        style={[
          styles.recipeSelectCard,
          isSelected && styles.selectedRecipeSelectCard,
        ]}
        onPress={() => handleToggleSelectRecipe(item._id)}
      >
        <Image source={{ uri: item.image }} style={styles.recipeSelectImg} />
        <View style={styles.recipeSelectInfo}>
          <Text style={styles.recipeSelectTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.recipeSelectDesc} numberOfLines={1}>
            ⏱️ {item.cookingTime} phút | 🔥 {item.calories} kcal
          </Text>
        </View>
        <Ionicons
          name={isSelected ? "checkmark-circle" : "add-circle-outline"}
          size={26}
          color={isSelected ? colors.success : colors.grey}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch Nấu Ăn</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Calendar Card */}
        <View style={styles.calendarCard}>
          {/* Calendar Header */}
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={prevMonth} style={styles.navArrow}>
              <Ionicons name="chevron-back" size={20} color={colors.dark} />
            </TouchableOpacity>
            <Text style={styles.calendarMonthYear}>
              {getMonthName(month)} {year}
            </Text>
            <TouchableOpacity onPress={nextMonth} style={styles.navArrow}>
              <Ionicons name="chevron-forward" size={20} color={colors.dark} />
            </TouchableOpacity>
          </View>

          {/* Weekdays Row */}
          <View style={styles.weekdaysRow}>
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
              <Text key={day} style={styles.weekdayText}>
                {day}
              </Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.daysGrid}>
            {daysGrid.map((day, idx) => {
              const isSelected = day.dateString === selectedDate;
              const hasPlans = plans.some((p) => p.date === day.dateString);
              const dayPlans = plans.filter((p) => p.date === day.dateString);

              const todayStr = formatDateString(new Date());
              const isPastDay = day.dateString < todayStr;

              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.dayCell,
                    isSelected && styles.selectedDayCell,
                    !day.isCurrentMonth && styles.otherMonthDayCell,
                    isPastDay && styles.pastDayCell,
                  ]}
                  onPress={() => setSelectedDate(day.dateString)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isSelected && styles.selectedDayText,
                      !day.isCurrentMonth && styles.otherMonthDayText,
                      isPastDay && styles.pastDayText,
                    ]}
                  >
                    {day.dayNum}
                  </Text>
                  {/* Indicators for planned meals */}
                  <View style={styles.indicatorsRow}>
                    {hasPlans &&
                      dayPlans.slice(0, 3).map((_, pIdx) => (
                        <View
                          key={pIdx}
                          style={[
                            styles.dotIndicator,
                            isSelected && styles.selectedDotIndicator,
                          ]}
                        />
                      ))}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selected Date Summary & Recipes */}
        <View style={styles.plansSection}>
          <View style={styles.plansHeaderRow}>
            <Text style={styles.plansSectionTitle}>
              {selectedDate === formatDateString(new Date())
                ? 'Kế hoạch Hôm nay'
                : `Kế hoạch ${selectedDate.split('-').reverse().join('/')}`}
            </Text>
            <TouchableOpacity
              style={styles.addPlanBtn}
              onPress={() => {
                const todayStr = formatDateString(new Date());
                if (selectedDate < todayStr) {
                  Alert.alert('Không hợp lệ', 'Bạn không thể lập kế hoạch nấu ăn cho một ngày đã qua!');
                  return;
                }
                const hr = new Date().getHours() + 1;
                setSelectedHour(String(hr % 24).padStart(2, '0'));
                setSelectedMinute('00');
                setShowAddModal(true);
              }}
            >
              <Ionicons name="add" size={16} color={colors.white} />
              <Text style={styles.addPlanBtnText}>Thêm món</Text>
            </TouchableOpacity>
          </View>

          {selectedDayPlans.length === 0 ? (
            <View style={styles.emptyPlansCard}>
              <Text style={styles.emptyPlansEmoji}>🧁</Text>
              <Text style={styles.emptyPlansText}>Chưa có món bánh nào được lên lịch.</Text>
              <Text style={styles.emptyPlansSub}>
                Hãy nhấn nút "Thêm món" để chuẩn bị cho bữa tiệc ngọt ngào của bạn nhé!
              </Text>
            </View>
          ) : (
            // Render plans timeline sorted chronologically
            [...selectedDayPlans]
              .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
              .map((plan) => {
                const rec = plan.recipe;
                if (!rec) return null;

                return (
                  <View key={plan._id} style={styles.planCard}>
                    <Image source={{ uri: rec.image }} style={styles.planImg} />
                    <View style={styles.planInfo}>
                      <View style={styles.planHeaderRow}>
                        <Text style={styles.planTitle} numberOfLines={1}>{rec.title}</Text>
                        <Text style={styles.planTimeText}>⏰ {plan.time}</Text>
                      </View>
                      <Text style={styles.planMeta}>
                        ⏱️ {rec.cookingTime} phút | 🔥 {rec.calories} kcal
                      </Text>
                      <View style={styles.planActions}>
                        <TouchableOpacity
                          style={styles.startCookBtn}
                          onPress={() =>
                            navigation.navigate('CookingMode', { recipe: rec })
                          }
                        >
                          <Ionicons name="play" size={14} color={colors.white} />
                          <Text style={styles.startCookText}>Bắt đầu nấu</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deletePlanBtn}
                          onPress={() => handleDeletePlan(plan._id)}
                        >
                          <Ionicons name="trash-outline" size={16} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })
          )}
        </View>
      </ScrollView>

      {/* Footer Navigation Buttons */}
      <View style={styles.footerRow}>
        <TouchableOpacity
          style={[styles.footerBtn, { backgroundColor: '#FFEBF0' }]}
          onPress={() => navigation.navigate('ShoppingList')}
        >
          <Ionicons name="cart" size={20} color={colors.primary} />
          <Text style={[styles.footerBtnText, { color: colors.primary }]}>Đi chợ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.footerBtn, { backgroundColor: '#FFF6E3' }]}
          onPress={() =>
            navigation.navigate('IngredientChecklist', { dateString: selectedDate })
          }
        >
          <Ionicons name="checkbox" size={20} color="#FFD166" />
          <Text style={[styles.footerBtnText, { color: colors.dark }]}>Chuẩn bị</Text>
        </TouchableOpacity>
      </View>

      {/* Add Recipe Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn món bánh</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={colors.dark} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSectionLabel}>Chọn thời gian làm bánh:</Text>
            <View style={styles.timePickerContainer}>
              {/* Hour selector */}
              <View style={styles.timePickerColumn}>
                <Text style={styles.timePickerLabel}>Giờ</Text>
                <ScrollView style={styles.timePickerScroll} nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 24 }).map((_, h) => {
                    const hrStr = String(h).padStart(2, '0');
                    const isSelected = selectedHour === hrStr;
                    
                    const now = new Date();
                    const isToday = selectedDate === formatDateString(now);
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
                    const isToday = selectedDate === formatDateString(now);
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

            {recipes.length === 0 ? (
              <Text style={styles.noRecipesModal}>Không có công thức bánh nào khả dụng.</Text>
            ) : (
              <>
                <FlatList
                  data={recipes}
                  keyExtractor={(item) => item._id}
                  renderItem={renderRecipeItem}
                  contentContainerStyle={styles.modalList}
                />
                {selectedRecipeIds.length > 0 && (
                  <TouchableOpacity
                    style={styles.modalSaveBtn}
                    onPress={handleSaveBatchPlans}
                    disabled={isSavingBatch}
                  >
                    <Text style={styles.modalSaveBtnText}>
                      {isSavingBatch ? "Đang lưu..." : `Lưu lịch nấu đã chọn (${selectedRecipeIds.length})`}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  calendarCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navArrow: {
    padding: 8,
    backgroundColor: colors.light,
    borderRadius: 12,
  },
  calendarMonthYear: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.dark,
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekdayText: {
    width: (width - 64) / 7,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: colors.grey,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayCell: {
    width: (width - 64) / 7,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
    borderRadius: 14,
  },
  selectedDayCell: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  otherMonthDayCell: {
    opacity: 0.35,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.dark,
  },
  selectedDayText: {
    color: colors.white,
    fontWeight: '800',
  },
  otherMonthDayText: {
    color: colors.grey,
  },
  indicatorsRow: {
    flexDirection: 'row',
    height: 4,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginHorizontal: 1,
  },
  selectedDotIndicator: {
    backgroundColor: colors.white,
  },
  plansSection: {
    marginBottom: 20,
  },
  plansHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  plansSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.dark,
  },
  addPlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  addPlanBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
    marginLeft: 4,
  },
  emptyPlansCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyPlansEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyPlansText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.dark,
    marginBottom: 6,
  },
  emptyPlansSub: {
    fontSize: 11,
    color: colors.grey,
    textAlign: 'center',
    lineHeight: 16,
  },
  mealGroup: {
    marginBottom: 16,
  },
  mealGroupLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.grey,
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  planCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  planImg: {
    width: 80,
    height: 80,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  planInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  planTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.dark,
  },
  planMeta: {
    fontSize: 12,
    color: colors.grey,
    marginVertical: 4,
  },
  planActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  startCookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  startCookText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
    marginLeft: 4,
  },
  deletePlanBtn: {
    padding: 4,
  },
  footerRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: colors.white,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  footerBtn: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    marginHorizontal: 6,
  },
  footerBtnText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
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
    maxHeight: '80%',
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
    marginBottom: 8,
  },
  planHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  planTimeText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
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
  pastDayCell: {
    opacity: 0.35,
  },
  pastDayText: {
    color: colors.grey,
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
  modalList: {
    paddingBottom: 20,
  },
  recipeSelectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5F5',
    borderRadius: 16,
    padding: 10,
    marginBottom: 10,
  },
  recipeSelectImg: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  recipeSelectInfo: {
    flex: 1,
    marginLeft: 12,
  },
  recipeSelectTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.dark,
  },
  recipeSelectDesc: {
    fontSize: 11,
    color: colors.grey,
    marginTop: 2,
  },
  selectedRecipeSelectCard: {
    backgroundColor: '#FFF0F2',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  modalSaveBtn: {
    backgroundColor: colors.success,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 5,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  modalSaveBtnText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 16,
  },
  noRecipesModal: {
    textAlign: 'center',
    color: colors.grey,
    paddingVertical: 30,
  },
});

export default MealPlannerScreen;
