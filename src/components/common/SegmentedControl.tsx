import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface Option<T> {
  label: string;
  value: T;
  badge?: number | string;
}

interface SegmentedControlProps<T> {
  options: Option<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
  scrollable?: boolean;
}

export function SegmentedControl<T extends string>({
  options,
  selectedValue,
  onSelect,
  scrollable = false,
}: SegmentedControlProps<T>) {
  const content = options.map((opt) => {
    const isSelected = opt.value === selectedValue;
    return (
      <Pressable
        key={opt.value}
        onPress={() => onSelect(opt.value)}
        style={[
          styles.item,
          isSelected && styles.itemSelected,
          scrollable && styles.itemScrollable,
        ]}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
      >
        <Text
          style={[
            styles.label,
            isSelected && styles.labelSelected,
          ]}
        >
          {opt.label}
        </Text>
        {opt.badge !== undefined && (
          <View
            style={[
              styles.badge,
              isSelected && styles.badgeSelected,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                isSelected && styles.badgeTextSelected,
              ]}
            >
              {opt.badge}
            </Text>
          </View>
        )}
      </Pressable>
    );
  });

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.container}>{content}</View>
      </ScrollView>
    );
  }

  return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: spacing.xs,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  item: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs + 3,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
  },
  itemScrollable: {
    flex: 0,
    minWidth: 80,
  },
  itemSelected: {
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  label: {
    ...typography.captionBold,
    color: colors.textSecondary,
    fontSize: 12,
  },
  labelSelected: {
    color: colors.primaryAccent,
    fontWeight: '700',
  },
  badge: {
    marginLeft: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radii.full,
    backgroundColor: colors.surfacePrimary,
  },
  badgeSelected: {
    backgroundColor: colors.primaryAccentMuted,
  },
  badgeText: {
    ...typography.captionBold,
    fontSize: 10,
    color: colors.textMuted,
  },
  badgeTextSelected: {
    color: colors.primaryAccent,
  },
});
