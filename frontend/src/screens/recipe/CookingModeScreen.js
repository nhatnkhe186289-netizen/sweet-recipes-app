import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  Alert,
  Dimensions,
  Platform,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import typography from '../../theme/typography';
import spacing from '../../theme/spacing';

const rawWidth = Dimensions.get('window').width;
const width = Platform.OS === 'web' ? Math.min(rawWidth, 600) : rawWidth;

// Helper to auto-parse cooking time from step text (e.g., "30-40 phút" -> 35 mins, "15 phút" -> 15 mins)
const detectTimerSeconds = (stepText) => {
  if (!stepText) return 0;
  
  // Look for patterns like "35-40 phút", "15 phút", "15-20 phút", "30 phút"
  const rangeRegex = /(\d+)\s*(?:-|đến)\s*(\d+)\s*phút/i;
  const singleRegex = /(\d+)\s*phút/i;
  
  const rangeMatch = stepText.match(rangeRegex);
  if (rangeMatch) {
    const minTime = parseInt(rangeMatch[1]);
    const maxTime = parseInt(rangeMatch[2]);
    return Math.round((minTime + maxTime) / 2) * 60; // Use average time
  }
  
  const singleMatch = stepText.match(singleRegex);
  if (singleMatch) {
    return parseInt(singleMatch[1]) * 60;
  }
  
  return 0;
};

const formatTime = (seconds) => {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
};

const CookingModeScreen = ({ route, navigation }) => {
  const { recipe } = route.params;
  const instructions = recipe.instructions || [];

  const [stepIndex, setStepIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [initialSeconds, setInitialSeconds] = useState(0);
  const [flashActive, setFlashActive] = useState(false);
  
  const timerIntervalRef = useRef(null);
  const flashAnim = useRef(new Animated.Value(0)).current;

  const currentStepText = instructions[stepIndex] || '';

  // Auto detect timer whenever step changes
  useEffect(() => {
    // Reset timer state
    stopTimer();
    const seconds = detectTimerSeconds(currentStepText);
    setInitialSeconds(seconds);
    setTimeLeft(seconds);
  }, [stepIndex]);

  // Timer Tick handler
  useEffect(() => {
    if (timerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            triggerAlarm();
            stopTimer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }

    return () => clearInterval(timerIntervalRef.current);
  }, [timerRunning]);

  // Handle flash animation for screen alert
  useEffect(() => {
    if (flashActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(flashAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
          }),
          Animated.timing(flashAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      flashAnim.setValue(0);
    }
  }, [flashActive]);

  const startTimer = () => setTimerRunning(true);
  const pauseTimer = () => setTimerRunning(false);
  
  const stopTimer = () => {
    setTimerRunning(false);
    clearInterval(timerIntervalRef.current);
  };

  const resetTimer = () => {
    stopTimer();
    setTimeLeft(initialSeconds);
    setFlashActive(false);
  };

  const adjustTime = (amount) => {
    setTimeLeft((prev) => Math.max(0, prev + amount));
  };

  const triggerAlarm = () => {
    setFlashActive(true);
    // Vibrate: pattern of [delay, vibrate, delay, vibrate]
    Vibration.vibrate([0, 500, 200, 500, 200, 500]);

    Alert.alert(
      '⏰ Hết giờ!',
      `Bước nấu ăn "${recipe.title}" của bạn đã hoàn tất thời gian đếm ngược.`,
      [{ text: 'Tắt báo thức', onPress: () => setFlashActive(false) }]
    );
  };

  const handleNext = () => {
    if (stepIndex < instructions.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      // Completed last step!
      Vibration.vibrate(200);
      Alert.alert(
        '🎉 Hoàn thành!',
        'Chúc mừng bạn đã hoàn thành tất cả các bước chế biến món bánh ngọt ngào này! 🍰',
        [{ text: 'Về trang chủ', onPress: () => navigation.popToTop() }]
      );
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  const flashBgColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.white, '#FFEBEB'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.mainWrapper, { backgroundColor: flashBgColor }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
            <Ionicons name="close" size={24} color={colors.dark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {recipe.title}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Step Indicator Progress Bar */}
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${((stepIndex + 1) / instructions.length) * 100}%` },
            ]}
          />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Step Title */}
          <Text style={styles.stepIndicatorText}>
            Bước {stepIndex + 1} / {instructions.length}
          </Text>

          {/* Large instruction text */}
          <View style={styles.instructionCard}>
            <Text style={styles.instructionText}>{currentStepText}</Text>
          </View>

          {/* Timer Widget */}
          {initialSeconds > 0 && (
            <View style={styles.timerCard}>
              <Text style={styles.timerTitle}>⏱️ Bộ Hẹn Giờ Nhà Bếp</Text>
              
              <Text style={[styles.timerCountdown, flashActive && styles.timerFlashText]}>
                {formatTime(timeLeft)}
              </Text>

              <View style={styles.timerAdjustRow}>
                <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustTime(-60)}>
                  <Text style={styles.adjustBtnText}>-1 ph</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustTime(60)}>
                  <Text style={styles.adjustBtnText}>+1 ph</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.timerControlsRow}>
                {timerRunning ? (
                  <TouchableOpacity style={[styles.timerBtn, styles.pauseBtn]} onPress={pauseTimer}>
                    <Ionicons name="pause" size={16} color={colors.white} />
                    <Text style={styles.timerBtnText}>Tạm dừng</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={[styles.timerBtn, styles.startBtn]} onPress={startTimer}>
                    <Ionicons name="play" size={16} color={colors.white} />
                    <Text style={styles.timerBtnText}>Bắt đầu</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={[styles.timerBtn, styles.resetBtn]} onPress={resetTimer}>
                  <Ionicons name="refresh" size={16} color={colors.dark} />
                  <Text style={[styles.timerBtnText, { color: colors.dark }]}>Đặt lại</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Step Navigation Controls */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, stepIndex === 0 && styles.disabledNavBtn]}
            onPress={handleBack}
            disabled={stepIndex === 0}
          >
            <Ionicons name="chevron-back" size={24} color={stepIndex === 0 ? colors.grey : colors.primary} />
            <Text style={[styles.navBtnText, { color: stepIndex === 0 ? colors.grey : colors.primary }]}>Quay lại</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.navBtn, styles.nextNavBtn]} onPress={handleNext}>
            <Text style={styles.nextNavBtnText}>
              {stepIndex === instructions.length - 1 ? 'Hoàn thành' : 'Tiếp theo'}
            </Text>
            <Ionicons
              name={stepIndex === instructions.length - 1 ? 'checkmark-circle' : 'chevron-forward'}
              size={24}
              color={colors.white}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  mainWrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerIcon: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.dark,
    flex: 1,
    textAlign: 'center',
  },
  progressContainer: {
    height: 6,
    backgroundColor: '#F3F4F6',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  scrollContent: {
    padding: 24,
    alignItems: 'center',
  },
  stepIndicatorText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  instructionCard: {
    backgroundColor: '#FFF4F6',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    minHeight: 180,
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: '#FFE0E5',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  instructionText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.dark,
    lineHeight: 32,
    textAlign: 'center',
  },
  timerCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.dark,
    marginBottom: 14,
  },
  timerCountdown: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.dark,
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  timerFlashText: {
    color: colors.error,
  },
  timerAdjustRow: {
    flexDirection: 'row',
    marginVertical: 12,
  },
  adjustBtn: {
    backgroundColor: colors.light,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginHorizontal: 8,
  },
  adjustBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.dark,
  },
  timerControlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
  },
  timerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginHorizontal: 6,
    minWidth: 110,
  },
  startBtn: {
    backgroundColor: colors.success,
  },
  pauseBtn: {
    backgroundColor: colors.primary,
  },
  resetBtn: {
    backgroundColor: colors.light,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timerBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
    marginLeft: 6,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: colors.white,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingHorizontal: 20,
    flex: 0.45,
  },
  disabledNavBtn: {
    borderColor: colors.border,
  },
  navBtnText: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 6,
  },
  nextNavBtn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    flex: 0.5,
  },
  nextNavBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
    marginRight: 6,
  },
});

export default CookingModeScreen;
