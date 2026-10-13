import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavigationScreen } from '../../models/types';
import { Ionicons } from '@expo/vector-icons';

interface BottomTabBarProps {
  currentScreen: NavigationScreen;
  onNavigate: (screen: NavigationScreen) => void;
  onOpenMore?: () => void;
}

interface TabConfig {
  id: NavigationScreen;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
}

const PRIMARY_TABS: TabConfig[] = [
  { id: 'Dashboard', label: 'Hub', icon: 'grid-outline', iconActive: 'grid' },
  { id: 'Tournaments', label: 'Tourneys', icon: 'trophy-outline', iconActive: 'trophy' },
  { id: 'Matches', label: 'Matches', icon: 'game-controller-outline', iconActive: 'game-controller' },
  { id: 'Calculator', label: 'Calculator', icon: 'calculator-outline', iconActive: 'calculator' },
  { id: 'Profile', label: 'Profile', icon: 'person-outline', iconActive: 'person' },
];

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  currentScreen,
  onNavigate,
}) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom > 0 ? insets.bottom + 16 : 30;

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: bottomPadding,
        },
      ]}
    >
      {PRIMARY_TABS.map((tab) => {
        const isSelected = currentScreen === tab.id;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onNavigate(tab.id)}
            style={styles.tabItem}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={tab.label}
          >
            <Ionicons
              name={isSelected ? tab.iconActive : tab.icon}
              size={20}
              color={isSelected ? colors.primaryAccent : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabLabel,
                isSelected && styles.tabLabelSelected,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.sidebar,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabLabel: {
    ...typography.caption,
    fontSize: 11,
    marginTop: 4,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabLabelSelected: {
    color: colors.primaryAccent,
    fontWeight: '700',
  },
});
