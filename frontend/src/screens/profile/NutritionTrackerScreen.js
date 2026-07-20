import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import typography from '../../theme/typography';
import spacing from '../../theme/spacing';
import nutritionService from '../../services/nutrition.service';

const { width } = Dimensions.get('window');
const containerWidth = Platform.OS === 'web' ? Math.min(width, 428) : width;

const NutritionTrackerScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(2000);
  const [weeklyData, setWeeklyData] = useState([]);

  // Modal State for custom log
  const [modalVisible, setModalVisible] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customMealType, setCustomMealType] = useState('Ăn vặt');

  // State for editing calorie goal
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newGoalText, setNewGoalText] = useState('2000');

  // Convert Date object to YYYY-MM-DD local timezone string
  const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDisplayDateText = (date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const dateStr = getLocalDateString(date);
    const todayStr = getLocalDateString(today);
    const yesterdayStr = getLocalDateString(yesterday);

    if (dateStr === todayStr) {
      return 'Hôm nay';
    } else if (dateStr === yesterdayStr) {
      return 'Hôm qua';
    } else {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }
  };

  const loadDailyData = async () => {
    try {
      setLoading(true);
      const dateStr = getLocalDateString(selectedDate);
      const data = await nutritionService.getDailyNutrition(dateStr);
      setLogs(data.logs || []);
      setTotalCalories(data.totalCalories || 0);
      setDailyCalorieGoal(data.dailyCalorieGoal || 2000);
      setNewGoalText(String(data.dailyCalorieGoal || 2000));
    } catch (error) {
      console.error('Error loading daily nutrition data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu dinh dưỡng ngày.');
    } finally {
      setLoading(false);
    }
  };

  const loadWeeklyData = async () => {
    try {
      const todayStr = getLocalDateString(new Date());
      const data = await nutritionService.getWeeklyNutrition(todayStr);
      setWeeklyData(data || []);
    } catch (error) {
      console.error('Error loading weekly nutrition data:', error);
    }
  };

  useEffect(() => {
    loadDailyData();
  }, [selectedDate]);

  useEffect(() => {
    loadWeeklyData();
  }, [totalCalories]); // Reload weekly summary if logs are updated

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleAddCustomLog = async () => {
    if (!customTitle.trim() || !customCalories.trim()) {
      Alert.alert('Chú ý', 'Vui lòng nhập tên món ăn và số calo.');
      return;
    }

    const calorieVal = Number(customCalories);
    if (isNaN(calorieVal) || calorieVal <= 0) {
      Alert.alert('Chú ý', 'Lượng calo phải là số hợp lệ.');
      return;
    }

    try {
      const dateStr = getLocalDateString(selectedDate);
      await nutritionService.logNutrition({
        recipeTitle: customTitle.trim(),
        calories: calorieVal,
        mealType: customMealType,
        date: selectedDate,
        dayString: dateStr,
      });

      setModalVisible(false);
      setCustomTitle('');
      setCustomCalories('');
      setCustomMealType('Ăn vặt');
      loadDailyData();
    } catch (error) {
      console.error('Error adding log:', error);
      Alert.alert('Lỗi', 'Không thể lưu nhật ký ăn uống.');
    }
  };

  const handleDeleteLog = (logId) => {
    Alert.alert(
      'Xóa nhật ký',
      'Bạn có chắc chắn muốn xóa món này khỏi nhật ký hôm nay?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await nutritionService.deleteLog(logId);
              loadDailyData();
            } catch (error) {
              console.error('Error deleting log:', error);
              Alert.alert('Lỗi', 'Không thể xóa nhật ký.');
            }
          },
        },
      ]
    );
  };

  const handleSaveCalorieGoal = async () => {
    const goalVal = Number(newGoalText);
    if (isNaN(goalVal) || goalVal <= 0) {
      Alert.alert('Chú ý', 'Mục tiêu calo phải là số hợp lệ.');
      return;
    }

    try {
      await nutritionService.updateGoal(goalVal);
      setDailyCalorieGoal(goalVal);
      setIsEditingGoal(false);
      Alert.alert('Thành công', 'Đã cập nhật mục tiêu calo hàng ngày.');
    } catch (error) {
      console.error('Error updating goal:', error);
      Alert.alert('Lỗi', 'Không thể lưu mục tiêu mới.');
    }
  };

  // Group logs by meal type
  const mealTypes = ['Sáng', 'Trưa', 'Tối', 'Ăn vặt'];
  const groupedLogs = mealTypes.reduce((acc, type) => {
    acc[type] = logs.filter((log) => log.mealType === type);
    return acc;
  }, {});

  // Calculations for rings / progress bar
  const caloriesRemaining = dailyCalorieGoal - totalCalories;
  const progressRatio = dailyCalorieGoal > 0 ? totalCalories / dailyCalorieGoal : 0;
  const progressPercent = Math.min(Math.round(progressRatio * 100), 100);

  const getProgressBarColor = () => {
    if (progressRatio > 1.0) return colors.error;
    if (progressRatio > 0.85) return colors.accent;
    return colors.primary;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Theo dõi calo & dinh dưỡng</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Date Navigation */}
      <View style={styles.dateNav}>
        <TouchableOpacity onPress={handlePrevDay} style={styles.arrowBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.dark} />
        </TouchableOpacity>
        <Text style={styles.dateText}>{getDisplayDateText(selectedDate)}</Text>
        <TouchableOpacity onPress={handleNextDay} style={styles.arrowBtn}>
          <Ionicons name="chevron-forward" size={22} color={colors.dark} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Calorie Overview Card */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Tổng quan calo ngày</Text>
            
            <View style={styles.calorieRow}>
              <View style={styles.calorieItem}>
                <Text style={styles.calorieVal}>{totalCalories}</Text>
                <Text style={styles.calorieLabel}>Đã nạp (kcal)</Text>
              </View>
              <View style={styles.summaryDivider} />
              
              <View style={styles.calorieItem}>
                <Text style={[styles.calorieVal, { color: caloriesRemaining < 0 ? colors.error : '#2E7D32' }]}>
                  {Math.abs(caloriesRemaining)}
                </Text>
                <Text style={styles.calorieLabel}>
                  {caloriesRemaining < 0 ? 'Vượt quá (kcal)' : 'Còn lại (kcal)'}
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBg}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { 
                      width: `${progressPercent}%`,
                      backgroundColor: getProgressBarColor(),
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {progressPercent}% mục tiêu của bạn ({dailyCalorieGoal} kcal)
              </Text>
            </View>
          </View>

          {/* Weekly Report Chart */}
          {weeklyData.length > 0 && (
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Thống kê 7 ngày gần nhất</Text>
              <View style={styles.chartBarsContainer}>
                {weeklyData.map((day, idx) => {
                  const dayDate = new Date(day.dayString);
                  const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
                  const label = daysOfWeek[dayDate.getDay()];
                  
                  // Calculate height ratio based on goal
                  const ratio = dailyCalorieGoal > 0 ? day.totalCalories / dailyCalorieGoal : 0;
                  const barHeight = Math.min(Math.max(ratio * 80, 5), 80); // Height between 5px and 80px

                  const isOverGoal = day.totalCalories > dailyCalorieGoal;

                  return (
                    <View key={idx} style={styles.chartBarCol}>
                      <Text style={styles.barValText}>{day.totalCalories > 0 ? day.totalCalories : ''}</Text>
                      <View style={styles.barWrapper}>
                        <View 
                          style={[
                            styles.barFill, 
                            { 
                              height: barHeight, 
                              backgroundColor: isOverGoal ? colors.error : colors.secondary 
                            }
                          ]} 
                        />
                      </View>
                      <Text style={styles.barLabelText}>{label}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Calorie Goal Setting Card */}
          <View style={styles.goalCard}>
            <View style={styles.goalRow}>
              <View>
                <Text style={styles.goalTitle}>Mục tiêu calo ngày</Text>
                <Text style={styles.goalSubtitle}>Mục tiêu tối đa khuyến nghị: 2000 kcal</Text>
              </View>
              {isEditingGoal ? (
                <View style={styles.goalEditRow}>
                  <TextInput
                    style={styles.goalInput}
                    value={newGoalText}
                    onChangeText={setNewGoalText}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                  <TouchableOpacity onPress={handleSaveCalorieGoal} style={styles.goalSaveBtn}>
                    <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setIsEditingGoal(false)} style={styles.goalSaveBtn}>
                    <Ionicons name="close-circle" size={24} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={() => setIsEditingGoal(true)} style={styles.goalEditBtn}>
                  <Text style={styles.goalValTextDisplay}>{dailyCalorieGoal} kcal</Text>
                  <Ionicons name="create-outline" size={16} color={colors.primary} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Add Custom Log Button */}
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={20} color={colors.white} />
            <Text style={styles.addBtnText}>Ghi nhận món ăn tự chọn</Text>
          </TouchableOpacity>

          {/* Food Log Lists */}
          <Text style={styles.sectionHeader}>Nhật ký ăn uống</Text>
          
          {logs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="restaurant-outline" size={48} color={colors.grey} />
              <Text style={styles.emptyText}>Chưa có ghi chép ăn uống nào cho ngày này.</Text>
            </View>
          ) : (
            mealTypes.map((type) => {
              const mealLogs = groupedLogs[type];
              if (mealLogs.length === 0) return null;
              
              let mealIcon = 'cafe-outline';
              let iconColor = colors.primary;
              if (type === 'Sáng') {
                mealIcon = 'sunny-outline';
                iconColor = '#FFB703';
              } else if (type === 'Trưa') {
                mealIcon = 'restaurant-outline';
                iconColor = '#219EBC';
              } else if (type === 'Tối') {
                mealIcon = 'moon-outline';
                iconColor = '#023E8A';
              }

              return (
                <View key={type} style={styles.mealSection}>
                  <View style={styles.mealHeader}>
                    <Ionicons name={mealIcon} size={18} color={iconColor} style={{ marginRight: 6 }} />
                    <Text style={styles.mealHeaderText}>{type}</Text>
                    <Text style={styles.mealHeaderCalories}>
                      {mealLogs.reduce((s, i) => s + i.calories, 0)} kcal
                    </Text>
                  </View>
                  
                  {mealLogs.map((log) => (
                    <View key={log._id} style={styles.logItem}>
                      <View style={styles.logLeft}>
                        <Text style={styles.logTitle}>{log.recipeTitle}</Text>
                        <Text style={styles.logTime}>
                          {new Date(log.date).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                      
                      <View style={styles.logRight}>
                        <Text style={styles.logCalories}>{log.calories} kcal</Text>
                        <TouchableOpacity onPress={() => handleDeleteLog(log._id)} style={styles.deleteBtn}>
                          <Ionicons name="trash-outline" size={18} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Add Custom Log Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTextTitle}>Ghi nhận calo tự chọn</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.dark} />
              </TouchableOpacity>
            </View>

            {/* Input Name */}
            <Text style={styles.inputLabel}>Tên món ăn/thức uống</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Ví dụ: Bánh Mousse Dâu Tây"
              value={customTitle}
              onChangeText={setCustomTitle}
              placeholderTextColor="#A0AABF"
            />

            {/* Input Calories */}
            <Text style={styles.inputLabel}>Lượng calo (kcal)</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Ví dụ: 350"
              value={customCalories}
              onChangeText={setCustomCalories}
              keyboardType="numeric"
              placeholderTextColor="#A0AABF"
            />

            {/* Select Meal Type */}
            <Text style={styles.inputLabel}>Bữa ăn</Text>
            <View style={styles.mealTypeOptions}>
              {mealTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.mealOptionBtn,
                    customMealType === type && styles.mealOptionBtnActive,
                  ]}
                  onPress={() => setCustomMealType(type)}
                >
                  <Text
                    style={[
                      styles.mealOptionText,
                      customMealType === type && styles.mealOptionTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Save Buttons */}
            <TouchableOpacity style={styles.modalSaveBtn} onPress={handleAddCustomLog}>
              <Text style={styles.modalSaveBtnText}>Lưu vào nhật ký</Text>
            </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.dark,
    flex: 1,
    textAlign: 'center',
  },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: colors.white,
  },
  arrowBtn: {
    padding: 8,
    marginHorizontal: 16,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.dark,
    minWidth: 100,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#2B2D42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.dark,
    marginBottom: 16,
  },
  calorieRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  calorieItem: {
    alignItems: 'center',
    flex: 1,
  },
  calorieVal: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.dark,
  },
  calorieLabel: {
    fontSize: 11,
    color: colors.grey,
    fontWeight: '600',
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
  },
  progressContainer: {
    width: '100%',
  },
  progressBarBg: {
    height: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 11,
    color: colors.grey,
    fontWeight: '600',
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#2B2D42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.dark,
    marginBottom: 20,
  },
  chartBarsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 130,
    paddingHorizontal: 8,
  },
  chartBarCol: {
    alignItems: 'center',
    flex: 1,
  },
  barValText: {
    fontSize: 8,
    color: colors.grey,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  barWrapper: {
    height: 80,
    width: 12,
    backgroundColor: '#FAF5F5',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  barLabelText: {
    fontSize: 10,
    color: colors.grey,
    fontWeight: '700',
    marginTop: 6,
  },
  goalCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#2B2D42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.dark,
  },
  goalSubtitle: {
    fontSize: 10,
    color: colors.grey,
    fontWeight: '500',
    marginTop: 2,
  },
  goalEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  goalValTextDisplay: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  goalEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalInput: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 60,
    fontSize: 13,
    fontWeight: '700',
    color: colors.dark,
    textAlign: 'center',
  },
  goalSaveBtn: {
    marginLeft: 6,
    padding: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    marginLeft: 6,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.dark,
    marginBottom: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    backgroundColor: colors.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  emptyText: {
    fontSize: 13,
    color: colors.grey,
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  mealSection: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#2B2D42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
    paddingBottom: 10,
    marginBottom: 10,
  },
  mealHeaderText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.dark,
    flex: 1,
  },
  mealHeaderCalories: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.grey,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  logLeft: {
    flex: 1,
  },
  logTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.dark,
  },
  logTime: {
    fontSize: 10,
    color: colors.grey,
    marginTop: 2,
  },
  logRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logCalories: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.dark,
    marginRight: 12,
  },
  deleteBtn: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: containerWidth - 40,
    backgroundColor: colors.white,
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalHeaderTextTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.dark,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.grey,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  inputField: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.dark,
    marginBottom: 16,
    fontWeight: '600',
  },
  mealTypeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  mealOptionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mealOptionBtnActive: {
    backgroundColor: '#FFF0F3',
    borderColor: colors.primary,
  },
  mealOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.grey,
  },
  mealOptionTextActive: {
    color: colors.primary,
  },
  modalSaveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  modalSaveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
});

export default NutritionTrackerScreen;
