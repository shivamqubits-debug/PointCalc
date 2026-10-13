import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Ionicons } from '@expo/vector-icons';

interface StatCardProps {
  label: string;
  value: number | string;
  caption: string;
  iconName: keyof typeof Ionicons.glyphMap;
  accentColor?: string;
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  caption,
  iconName,
  accentColor = colors.primaryAccent,
  style,
}) => {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.topRow}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.iconBox, { backgroundColor: `${accentColor}1A` }]}>
          <Ionicons name={iconName} size={18} color={accentColor} />
        </View>
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.caption} numberOfLines={1}>
        {caption}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfacePrimary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md + 2,
    flex: 1,
    minWidth: 140,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
    fontSize: 11,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    ...typography.statValue,
    color: colors.textPrimary,
    marginVertical: 2,
  },
  caption: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
