import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Ionicons } from '@expo/vector-icons';

interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  iconName?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'sm' | 'md';
  variant?: 'outline' | 'ghost';
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  label,
  onPress,
  iconName,
  disabled = false,
  style,
  textStyle,
  size = 'md',
  variant = 'outline',
}) => {
  const isOutline = variant === 'outline';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        size === 'sm' ? styles.btnSm : styles.btnMd,
        isOutline ? styles.outline : styles.ghost,
        {
          opacity: disabled ? 0.4 : pressed ? 0.75 : 1,
          backgroundColor: isOutline
            ? pressed
              ? colors.surfaceElevated
              : colors.surfacePrimary
            : 'transparent',
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.content}>
        {iconName && (
          <Ionicons
            name={iconName}
            size={size === 'sm' ? 14 : 16}
            color={colors.textPrimary}
            style={styles.icon}
          />
        )}
        <Text
          style={[
            styles.text,
            size === 'sm' && styles.textSm,
            { color: colors.textPrimary },
            textStyle,
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outline: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    borderWidth: 0,
  },
  btnSm: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    minHeight: 34,
  },
  btnMd: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    minHeight: 44,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: spacing.xs + 2,
  },
  text: {
    ...typography.bodyBold,
    fontWeight: '600',
  },
  textSm: {
    fontSize: 12,
  },
});
