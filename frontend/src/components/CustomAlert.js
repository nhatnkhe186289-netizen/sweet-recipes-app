import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import alertService from '../services/alertService';
import colors from '../theme/colors';
import typography from '../theme/typography';

const CustomAlert = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState(null);
  const scaleAnim = useState(new Animated.Value(0.8))[0];
  const opacityAnim = useState(new Animated.Value(0))[0];

  useImperativeHandle(ref, () => ({
    show: (config) => {
      setAlertConfig(config);
      setVisible(true);
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    },
    hide: () => {
      handleClose();
    }
  }));

  useEffect(() => {
    alertService.setRef(ref.current);
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 150,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setAlertConfig(null);
    });
  };

  if (!visible || !alertConfig) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
      <Animated.View style={[styles.alertBox, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.title}>{alertConfig.title}</Text>
        <Text style={styles.message}>{alertConfig.message}</Text>
        
        <View style={styles.buttonRow}>
          {alertConfig.type === 'confirm' && (
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                if (alertConfig.onCancel) alertConfig.onCancel();
                handleClose();
              }}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                {alertConfig.cancelText || 'Hủy'}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.button, styles.confirmButton]}
            onPress={() => {
              if (alertConfig.onConfirm) alertConfig.onConfirm();
              handleClose();
            }}
          >
            <Text style={[styles.buttonText, styles.confirmButtonText]}>
              {alertConfig.type === 'confirm' ? (alertConfig.confirmText || 'Đồng ý') : 'OK'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  alertBox: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.dark,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.sizes.md,
    color: colors.grey,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  cancelButtonText: {
    color: colors.dark,
  },
  confirmButtonText: {
    color: colors.white,
  },
});

export default CustomAlert;
