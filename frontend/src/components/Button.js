import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';

const Button = ({ title, onPress, loading, style, textStyle, variant = 'primary', icon, ...props }) => {
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';

  const buttonStyle = [
    styles.button,
    isSecondary && styles.secondaryButton,
    isOutline && styles.outlineButton,
    style,
  ];

  const titleStyle = [
    styles.text,
    isSecondary && styles.secondaryText,
    isOutline && styles.outlineText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? colors.primary : colors.white} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color={StyleSheet.flatten(titleStyle).color}
              style={{ marginRight: title ? spacing.xs : 0 }}
            />
          )}
          {title ? <Text style={titleStyle} numberOfLines={1} adjustsFontSizeToFit>{title}</Text> : null}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
    shadowColor: colors.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    color: colors.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  secondaryText: {
    color: colors.dark,
  },
  outlineText: {
    color: colors.primary,
  },
});

export default Button;
