import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Vibration,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

const rawWidth = Dimensions.get('window').width;
const width = Platform.OS === 'web' ? Math.min(rawWidth, 600) : rawWidth;

const AlarmOverlayModal = ({ visible, recipeTitle, onConfirm, onDismiss }) => {
  const [secondsLeft, setSecondsLeft] = useState(60);
  const flashAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setSecondsLeft(60);
      
      // Start looping vibration
      Vibration.vibrate([500, 500, 500, 500], true);

      // Flashing Background Animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(flashAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: false,
          }),
          Animated.timing(flashAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: false,
          }),
        ])
      ).start();

      // Shaking Bell Animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Start 60s countdown timer
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Dismiss alarm if ignored for 60 seconds
            handleDismiss();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      cleanup();
    }

    return () => cleanup();
  }, [visible]);

  const cleanup = () => {
    Vibration.cancel();
    clearInterval(timerRef.current);
    flashAnim.setValue(0);
    shakeAnim.setValue(0);
  };

  const handleConfirm = () => {
    cleanup();
    onConfirm();
  };

  const handleDismiss = () => {
    cleanup();
    onDismiss();
  };

  const flashBg = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FFF0F2', '#FFD1DC'],
  });

  const bellRotate = shakeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-15deg', '15deg'],
  });

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      statusBarTranslucent={true}
    >
      <Animated.View style={[styles.overlay, { backgroundColor: flashBg }]}>
        <View style={styles.content}>
          
          {/* Vibrating/Shaking Bell Icon */}
          <Animated.View style={{ transform: [{ rotate: bellRotate }] }}>
            <View style={styles.bellCircle}>
              <Ionicons name="alarm" size={80} color={colors.primary} />
            </View>
          </Animated.View>

          <Text style={styles.title}>⏰ BÁO THỨC LÀM BÁNH!</Text>
          <Text style={styles.subtitle}>Đã đến giờ chuẩn bị nguyên liệu và nướng chiếc bánh ngọt ngào của bạn rồi:</Text>
          
          <View style={styles.recipeCard}>
            <Text style={styles.recipeTitle}>{recipeTitle}</Text>
          </View>

          <Text style={styles.timerText}>Báo thức sẽ tắt sau {secondsLeft} giây...</Text>

          {/* Glowing confirmation button */}
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={handleConfirm}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-circle" size={24} color={colors.white} style={styles.confirmIcon} />
            <Text style={styles.confirmBtnText}>XÁC NHẬN</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.snoozeBtn}
            onPress={handleDismiss}
            activeOpacity={0.7}
          >
            <Text style={styles.snoozeBtnText}>Để sau (Báo lại trong 15 phút)</Text>
          </TouchableOpacity>

        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: width - 48,
    backgroundColor: colors.white,
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#FF6480',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 2,
    borderColor: '#FFE0E5',
  },
  bellCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#FFEBF0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 13,
    color: colors.grey,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  recipeCard: {
    backgroundColor: '#FAF5F5',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFE0E5',
    marginBottom: 16,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.dark,
    textAlign: 'center',
  },
  timerText: {
    fontSize: 11,
    color: colors.grey,
    fontStyle: 'italic',
    marginBottom: 25,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    width: '100%',
    height: 56,
    borderRadius: 20,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 16,
  },
  confirmIcon: {
    marginRight: 8,
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.white,
  },
  snoozeBtn: {
    paddingVertical: 8,
  },
  snoozeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.grey,
    textDecorationLine: 'underline',
  },
});

export default AlarmOverlayModal;
