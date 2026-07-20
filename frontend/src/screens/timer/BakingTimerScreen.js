import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  Vibration,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import alertService from '../../services/alertService';

const DEFAULT_PRESETS = [
  { id: '1', title: 'Ủ bột bánh mì', minutes: 45, icon: 'time-outline', isCustom: false },
  { id: '2', title: 'Nướng bánh Gato', minutes: 30, icon: 'flame-outline', isCustom: false },
  { id: '3', title: 'Nướng Cupcake', minutes: 20, icon: 'cafe-outline', isCustom: false },
  { id: '4', title: 'Hấp Caramen', minutes: 15, icon: 'water-outline', isCustom: false },
  { id: '5', title: 'Luộc trứng mềm', minutes: 8, icon: 'egg-outline', isCustom: false },
  { id: '6', title: 'Đánh bông kem tươi', minutes: 5, icon: 'color-wand-outline', isCustom: false },
];

const showAlert = (title, msg) => {
  alertService.alert(title, msg);
};

const BakingTimerScreen = ({ navigation }) => {
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [initialSeconds, setInitialSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [activePreset, setActivePreset] = useState(null);
  const [presets, setPresets] = useState(DEFAULT_PRESETS);
  const [newPresetTitle, setNewPresetTitle] = useState('');
  const [showAddPreset, setShowAddPreset] = useState(false);

  const intervalRef = useRef(null);

  // Load custom presets on mount
  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      const saved = await AsyncStorage.getItem('custom_clock_timer_presets');
      if (saved) {
        const parsed = JSON.parse(saved);
        setPresets([...DEFAULT_PRESETS, ...parsed]);
      }
    } catch (e) {
      console.log('Error loading presets', e);
    }
  };

  const saveCustomPresetsToStorage = async (customItems) => {
    try {
      await AsyncStorage.setItem('custom_clock_timer_presets', JSON.stringify(customItems));
    } catch (e) {
      console.log('Error saving presets', e);
    }
  };

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTotalSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setTimeout(() => {
              setIsActive(false);
              onTimerComplete();
            }, 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive]);

  const onTimerComplete = () => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate([500, 500, 500, 500]);
    }
    showAlert('⏰ Clock Timer', 'HẾT GIỜ! Bánh của bạn đã hoàn thành hoặc hết thời gian ủ!');
  };

  const handleSelectPreset = (preset) => {
    setIsActive(false);
    setActivePreset(preset.id);
    const secs = preset.minutes * 60;
    setTotalSeconds(secs);
    setInitialSeconds(secs);
  };

  const handleAddCustomPreset = async () => {
    if (!newPresetTitle.trim()) {
      showAlert('Thông báo', 'Vui lòng nhập tên Preset (ví dụ: Nướng Bánh Mousse)');
      return;
    }
    const mins = Math.max(1, Math.round((totalSeconds || initialSeconds) / 60));
    const newPreset = {
      id: Date.now().toString(),
      title: newPresetTitle.trim(),
      minutes: mins,
      icon: 'bookmark-outline',
      isCustom: true,
    };

    const currentCustom = presets.filter((p) => p.isCustom);
    const updatedCustom = [...currentCustom, newPreset];
    setPresets([...DEFAULT_PRESETS, ...updatedCustom]);
    await saveCustomPresetsToStorage(updatedCustom);

    setNewPresetTitle('');
    setShowAddPreset(false);
    handleSelectPreset(newPreset);
    showAlert('Thành công', `Đã lưu Preset "${newPreset.title}" (${mins} phút)!`);
  };

  const handleDeleteCustomPreset = async (id, title) => {
    const currentCustom = presets.filter((p) => p.isCustom && p.id !== id);
    setPresets([...DEFAULT_PRESETS, ...currentCustom]);
    await saveCustomPresetsToStorage(currentCustom);
    if (activePreset === id) {
      handleSelectPreset(DEFAULT_PRESETS[0]);
    }
  };

  const toggleTimer = () => {
    if (totalSeconds <= 0) return;
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setInitialSeconds(0);
    setTotalSeconds(0);
    setActivePreset(null);
  };

  const adjustTime = (minutesToAdd) => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setTotalSeconds((prev) => {
      const next = Math.max(0, prev + minutesToAdd * 60);
      setInitialSeconds(next);
      return next;
    });
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainSecs = secs % 60;
    const pad = (n) => (n < 10 ? `0${n}` : n);
    return `${pad(mins)}:${pad(remainSecs)}`;
  };

  const currentMinutes = Math.max(1, Math.round(initialSeconds / 60));

  return (
    <ScrollView contentContainerStyle={styles.container} bounces={false}>
      {/* Header Banner */}
      <View style={styles.headerCard}>
        <Ionicons name="stopwatch" size={32} color={colors.primary} />
        <Text style={styles.headerTitle}>⏱️ Clock Timer</Text>
      </View>

      {/* Main Timer Display Circle */}
      <View style={styles.timerDisplayCard}>
        <View style={styles.circleContainer}>
          <Text style={styles.timerText}>{formatTime(totalSeconds)}</Text>
          <Text style={styles.timerStatusText}>
            {isActive ? '🔥 Đang đếm ngược...' : totalSeconds === 0 ? 'Sẵn sàng (00:00)' : 'Sẵn sàng'}
          </Text>

          {/* Quick Adjustment Buttons */}
          <View style={styles.adjustRow}>
            <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustTime(-5)}>
              <Text style={styles.adjustBtnText}>-5p</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustTime(-1)}>
              <Text style={styles.adjustBtnText}>-1p</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustTime(1)}>
              <Text style={styles.adjustBtnText}>+1p</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustTime(5)}>
              <Text style={styles.adjustBtnText}>+5p</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Controls */}
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={[styles.actionBtn, isActive ? styles.pauseBtn : styles.startBtn]}
            onPress={toggleTimer}
            activeOpacity={0.8}
          >
            <Ionicons name={isActive ? 'pause' : 'play'} size={20} color={colors.white} />
            <Text style={styles.actionBtnText}>{isActive ? 'Tạm dừng' : 'Bắt đầu'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetBtn} onPress={resetTimer} activeOpacity={0.8}>
            <Ionicons name="refresh" size={18} color={colors.dark} />
            <Text style={styles.resetBtnText}>Đặt lại</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.savePresetBtn, showAddPreset && styles.savePresetBtnActive]}
            onPress={() => setShowAddPreset(!showAddPreset)}
            activeOpacity={0.8}
          >
            <Ionicons name="bookmark-outline" size={18} color={showAddPreset ? colors.white : colors.primary} />
            <Text style={[styles.savePresetBtnText, showAddPreset && styles.savePresetBtnTextActive]}>
              Lưu Preset
            </Text>
          </TouchableOpacity>
        </View>

        {/* Add Preset Form Box */}
        {showAddPreset && (
          <View style={styles.addPresetBox}>
            <Text style={styles.addPresetLabel}>
              Lưu thời gian hiện tại ({(totalSeconds > 0 ? Math.max(1, Math.round(totalSeconds / 60)) : Math.max(1, Math.round(initialSeconds / 60)))} phút) thành Preset:
            </Text>
            <View style={styles.addPresetRow}>
              <TextInput
                style={styles.addPresetInput}
                placeholder="Nhập tên Preset (VD: Nướng Bánh Tart)..."
                placeholderTextColor={colors.grey}
                value={newPresetTitle}
                onChangeText={setNewPresetTitle}
              />
              <TouchableOpacity style={styles.addPresetSaveBtn} onPress={handleAddCustomPreset}>
                <Text style={styles.addPresetSaveBtnText}>Lưu ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Presets List */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Danh sách Presets ({presets.length})</Text>
      </View>

      <View style={styles.presetGrid}>
        {presets.map((preset) => {
          const isSelected = activePreset === preset.id;
          return (
            <TouchableOpacity
              key={preset.id}
              style={[styles.presetCard, isSelected && styles.presetCardSelected]}
              onPress={() => handleSelectPreset(preset)}
              activeOpacity={0.8}
            >
              {preset.isCustom && (
                <TouchableOpacity
                  style={styles.deletePresetBtn}
                  onPress={() => handleDeleteCustomPreset(preset.id, preset.title)}
                >
                  <Ionicons name="close-circle" size={20} color={isSelected ? colors.white : '#FF4D4D'} />
                </TouchableOpacity>
              )}

              <View style={[styles.presetIconBox, isSelected && styles.presetIconBoxSelected]}>
                <Ionicons
                  name={preset.icon}
                  size={24}
                  color={isSelected ? colors.white : colors.primary}
                />
              </View>

              <Text style={[styles.presetTitle, isSelected && styles.presetTitleSelected]} numberOfLines={1}>
                {preset.title}
              </Text>
              <Text style={[styles.presetTime, isSelected && styles.presetTimeSelected]}>
                {preset.minutes} phút {preset.isCustom ? ' (Tự lưu)' : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: '#FAF5F5',
    flexGrow: 1,
  },
  headerCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 20,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.dark,
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.grey,
    textAlign: 'center',
    marginTop: 4,
  },
  timerDisplayCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  circleContainer: {
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 6,
    borderColor: colors.primary,
    backgroundColor: '#FFF8F8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  timerText: {
    fontSize: 42,
    fontWeight: '900',
    color: colors.dark,
    letterSpacing: 2,
  },
  timerStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 4,
  },
  adjustRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  adjustBtn: {
    backgroundColor: '#FFF0F0',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginHorizontal: 3,
  },
  adjustBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  controlRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  startBtn: {
    backgroundColor: colors.primary,
  },
  pauseBtn: {
    backgroundColor: '#FF9500',
  },
  actionBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
    marginLeft: 6,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0E8E8',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 16,
    marginLeft: 12,
  },
  resetBtnText: {
    color: colors.dark,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
  savePresetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  savePresetBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  savePresetBtnText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  savePresetBtnTextActive: {
    color: colors.white,
  },
  savePresetTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: '#FFF0F0',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  savePresetTriggerText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 6,
  },
  addPresetBox: {
    width: '100%',
    backgroundColor: '#FAF5F5',
    padding: 12,
    borderRadius: 14,
    marginTop: 12,
  },
  addPresetLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.dark,
    marginBottom: 6,
  },
  addPresetRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addPresetInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.dark,
  },
  addPresetSaveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginLeft: 8,
  },
  addPresetSaveBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.dark,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  presetCard: {
    width: '48%',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    position: 'relative',
  },
  presetCardSelected: {
    backgroundColor: colors.primary,
  },
  deletePresetBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  presetIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  presetIconBoxSelected: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  presetTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.dark,
  },
  presetTitleSelected: {
    color: colors.white,
  },
  presetTime: {
    fontSize: 11,
    color: colors.grey,
    marginTop: 2,
    fontWeight: '500',
  },
  presetTimeSelected: {
    color: '#FFE5E5',
  },
});

export default BakingTimerScreen;
