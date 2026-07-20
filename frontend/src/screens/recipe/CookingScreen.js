import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import typography from '../../theme/typography';
import spacing from '../../theme/spacing';
import nutritionService from '../../services/nutrition.service';
import alertService from '../../services/alertService';

const { width } = Dimensions.get('window');

const CookingScreen = ({ route, navigation }) => {
  const { recipeId, recipeTitle, instructions, ingredients, calories } = route.params;
  const [currentStep, setCurrentStep] = useState(0);
  const [showIngredients, setShowIngredients] = useState(false);

  // Timer States
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [hasTimer, setHasTimer] = useState(false);
  const [initialTime, setInitialTime] = useState(0);
  
  const timerRef = useRef(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Extract time from instruction string (e.g., "30 phút", "10 phút", "1 tiếng")
  useEffect(() => {
    // Reset timer on step change
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setTimerRunning(false);
    
    const stepText = instructions[currentStep] || '';
    let seconds = 0;
    let found = false;

    // Look for hours (tiếng/giờ)
    const hourRegex = /(\d+)\s*(?:tiếng|tieng|giờ|gio|hour|hr)/i;
    const hourMatch = stepText.match(hourRegex);
    if (hourMatch) {
      seconds += parseInt(hourMatch[1]) * 3600;
      found = true;
    }

    // Look for minutes (phút)
    const minuteRegex = /(\d+)\s*(?:phút|phut|minute|min)/i;
    const minuteMatch = stepText.match(minuteRegex);
    if (minuteMatch) {
      seconds += parseInt(minuteMatch[1]) * 60;
      found = true;
    }

    // Look for seconds (giây) if any
    const secondRegex = /(\d+)\s*(?:giây|giay|second|sec)/i;
    const secondMatch = stepText.match(secondRegex);
    if (secondMatch) {
      seconds += parseInt(secondMatch[1]);
      found = true;
    }

    if (found && seconds > 0) {
      setTimeLeft(seconds);
      setInitialTime(seconds);
      setHasTimer(true);
    } else {
      setTimeLeft(0);
      setInitialTime(0);
      setHasTimer(false);
    }

    // Update step progress animation
    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / instructions.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep, instructions]);

  // Timer Tick Logic
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            clearInterval(timerRef.current);
            Alert.alert(
              '⏱️ Hết giờ!',
              `Thời gian cho Bước ${currentStep + 1} của công thức "${recipeTitle}" đã kết thúc.`,
              [{ text: 'Đồng ý', style: 'default' }]
            );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerRunning, currentStep]);

  const handleTimerToggle = () => {
    setTimerRunning(!timerRunning);
  };

  const handleTimerReset = () => {
    setTimerRunning(false);
    setTimeLeft(initialTime);
  };

  const formatTime = (secs) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const remainingSecs = secs % 60;

    const pad = (n) => (n < 10 ? `0${n}` : n);

    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(remainingSecs)}`;
    }
    return `${pad(mins)}:${pad(remainingSecs)}`;
  };

  const handleNext = () => {
    if (currentStep < instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Completed last step
      const title = '🎉 Hoàn thành xuất sắc!';
      const message = `Chúc mừng bạn đã hoàn thành món bánh tuyệt vời này! Bạn có muốn ghi nhận lượng calo của món bánh này vào nhật ký ăn uống hôm nay không?`;
      
      const saveCalories = async () => {
        try {
          await nutritionService.logNutrition({
            recipeId,
            recipeTitle,
            calories: calories || 0,
            mealType: 'Ăn vặt',
            date: new Date(),
            dayString: new Date().toISOString().split('T')[0],
          });
          if (Platform.OS === 'web') {
            window.alert('Thành công\n\nĐã lưu lượng calo vào nhật ký hôm nay!');
            navigation.goBack();
          } else {
            Alert.alert('Thành công', 'Đã lưu lượng calo vào nhật ký hôm nay!', [
              { text: 'Đồng ý', onPress: () => navigation.goBack() }
            ]);
          }
        } catch (error) {
          console.error(error);
          if (Platform.OS === 'web') {
            window.alert('Lỗi\n\nKhông thể lưu nhật ký calo.');
          } else {
            Alert.alert('Lỗi', 'Không thể lưu nhật ký calo.');
          }
          navigation.goBack();
        }
      };

      alertService.confirm(
        title,
        message,
        saveCalories,
        () => navigation.goBack(),
        `Ăn ngay & Lưu ${calories || 0} kcal`,
        'Chỉ hoàn thành'
      );
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={26} color={colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {recipeTitle}
        </Text>
        <TouchableOpacity 
          style={styles.listBtn} 
          onPress={() => setShowIngredients(!showIngredients)}
        >
          <Ionicons 
            name={showIngredients ? "list" : "list-outline"} 
            size={24} 
            color={showIngredients ? colors.primary : colors.dark} 
          />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarBg}>
        <Animated.View 
          style={[
            styles.progressBarFill, 
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              })
            }
          ]} 
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Cooking Step Card */}
        <View style={styles.stepCard}>
          <Text style={styles.stepTitle}>Bước {currentStep + 1} / {instructions.length}</Text>
          <Text style={styles.instructionText}>
            {instructions[currentStep]}
          </Text>
        </View>

        {/* Dynamic Timer Section */}
        {hasTimer && (
          <View style={styles.timerCard}>
            <View style={styles.timerIconRow}>
              <Ionicons name="time-outline" size={24} color={colors.primary} />
              <Text style={styles.timerHeader}>Bộ Hẹn Giờ</Text>
            </View>
            
            <Text style={styles.timeDisplay}>{formatTime(timeLeft)}</Text>
            
            <View style={styles.timerControls}>
              <TouchableOpacity style={styles.controlBtn} onPress={handleTimerReset}>
                <Ionicons name="refresh-outline" size={22} color={colors.grey} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.playPauseBtn, timerRunning && styles.pauseActiveBtn]} 
                onPress={handleTimerToggle}
              >
                <Ionicons 
                  name={timerRunning ? "pause" : "play"} 
                  size={26} 
                  color={colors.white} 
                />
              </TouchableOpacity>
              
              <View style={styles.controlBtnPlaceholder} />
            </View>
          </View>
        )}

        {/* Quick Ingredients Reference Sheet */}
        {showIngredients && (
          <View style={styles.ingredientsDrawer}>
            <Text style={styles.drawerTitle}>📋 Danh sách nguyên liệu</Text>
            {ingredients.map((ing, idx) => (
              <Text key={idx} style={styles.drawerItem}>• {ing}</Text>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.navBtn, styles.prevBtn, currentStep === 0 && styles.disabledBtn]} 
          onPress={handlePrev}
          disabled={currentStep === 0}
        >
          <Ionicons 
            name="arrow-back" 
            size={20} 
            color={currentStep === 0 ? colors.grey : colors.dark} 
          />
          <Text style={[styles.navBtnText, currentStep === 0 && styles.disabledText]}>
            Quay lại
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navBtn, styles.nextBtn]} 
          onPress={handleNext}
        >
          <Text style={[styles.navBtnText, styles.nextBtnText]}>
            {currentStep === instructions.length - 1 ? 'Hoàn thành' : 'Tiếp theo'}
          </Text>
          <Ionicons 
            name={currentStep === instructions.length - 1 ? "checkmark-done" : "arrow-forward"} 
            size={20} 
            color={colors.white} 
          />
        </TouchableOpacity>
      </View>
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
  },
  closeBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.dark,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  listBtn: {
    padding: 4,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#F1F5F9',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  scrollContent: {
    padding: 20,
  },
  stepCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#2B2D42',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.dark,
    lineHeight: 28,
  },
  timerCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#2B2D42',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 20,
  },
  timerIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  timerHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.grey,
    marginLeft: 6,
    textTransform: 'uppercase',
  },
  timeDisplay: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.dark,
    fontVariant: ['tabular-nums'],
    marginVertical: 10,
  },
  timerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 5,
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlBtnPlaceholder: {
    width: 44,
  },
  playPauseBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  pauseActiveBtn: {
    backgroundColor: colors.dark,
    shadowColor: colors.dark,
  },
  ingredientsDrawer: {
    backgroundColor: '#FFF0F3',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFEBF0',
    marginBottom: 20,
  },
  drawerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 10,
  },
  drawerItem: {
    fontSize: 14,
    color: colors.dark,
    marginBottom: 6,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    height: 52,
  },
  prevBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    marginRight: 10,
  },
  nextBtn: {
    flex: 1.5,
    backgroundColor: colors.primary,
    marginLeft: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  navBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.dark,
    marginHorizontal: 6,
  },
  nextBtnText: {
    color: colors.white,
  },
  disabledBtn: {
    backgroundColor: '#E2E8F0',
  },
  disabledText: {
    color: colors.grey,
  },
});

export default CookingScreen;
