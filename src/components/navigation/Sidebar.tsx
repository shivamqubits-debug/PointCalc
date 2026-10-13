import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavigationScreen } from '../../models/types';
import { Ionicons } from '@expo/vector-icons';

interface NavItem {
  id: NavigationScreen;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const WORKSPACE_NAV: NavItem[] = [
  { id: 'Dashboard', label: 'Overview', icon: 'grid-outline' },
  { id: 'Tournaments', label: 'Tournaments', icon: 'trophy-outline' },
  { id: 'Teams', label: 'Teams', icon: 'shield-outline' },
  { id: 'Matches', label: 'Matches', icon: 'game-controller-outline' },
  { id: 'Leaderboards', label: 'Leaderboards', icon: 'podium-outline' },
];

const TOOLS_NAV: NavItem[] = [
  { id: 'Calculator', label: 'Point Calculator', icon: 'calculator-outline' },
  { id: 'Profile', label: 'Organizer Profile', icon: 'person-outline' },
  { id: 'Settings', label: 'Settings', icon: 'settings-outline' },
];

interface SidebarProps {
  currentScreen: NavigationScreen;
  onNavigate: (screen: NavigationScreen) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onNavigate,
  collapsed = false,
  onToggleCollapse,
}) => {
  const insets = useSafeAreaInsets();

  const renderItem = (item: NavItem) => {
    const isSelected = currentScreen === item.id;
    return (
      <Pressable
        key={item.id}
        onPress={() => onNavigate(item.id)}
        style={({ pressed }) => [
          styles.navItem,
          isSelected && styles.navItemSelected,
          pressed && styles.navItemPressed,
          collapsed && styles.navItemCollapsed,
        ]}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
        accessibilityLabel={item.label}
      >
        <Ionicons
          name={item.icon}
          size={19}
          color={isSelected ? colors.primaryAccent : colors.textSecondary}
          style={styles.navIcon}
        />
        {!collapsed && (
          <Text
            style={[
              styles.navLabel,
              isSelected && styles.navLabelSelected,
            ]}
          >
            {item.label}
          </Text>
        )}
      </Pressable>
    );
  };

  return (
    <View
      style={[
        styles.container,
        collapsed && styles.containerCollapsed,
        {
          paddingTop: Math.max(insets.top, spacing.lg),
          paddingBottom: Math.max(insets.bottom, spacing.lg),
          paddingLeft: Math.max(insets.left, spacing.md),
        },
      ]}
    >
      {/* Brand Header */}
      <View style={[styles.brandHeader, collapsed && styles.brandHeaderCollapsed]}>
        <View style={styles.brandIconWrap}>
          <Ionicons name="flash" size={18} color={colors.textInverse} />
        </View>
        {!collapsed && (
          <View style={styles.brandInfo}>
            <Text style={styles.brandTitle}>POINTCALC</Text>
            <Text style={styles.brandSubtitle}>ESPORTS MANAGER</Text>
          </View>
        )}
      </View>

      {/* Nav List */}
      <ScrollView style={styles.navScroll} showsVerticalScrollIndicator={false}>
        {!collapsed && <Text style={styles.sectionHeading}>WORKSPACE</Text>}
        {WORKSPACE_NAV.map(renderItem)}

        <View style={styles.divider} />

        {!collapsed && <Text style={styles.sectionHeading}>TOOLS</Text>}
        {TOOLS_NAV.map(renderItem)}
      </ScrollView>

      {/* Bottom Status */}
      <View style={[styles.bottomBar, collapsed && styles.bottomBarCollapsed]}>
        {!collapsed && (
          <View style={styles.statusIndicator}>
            <View style={styles.statusDot} />
            <View>
              <Text style={styles.statusText}>Local Storage</Text>
              <Text style={styles.versionText}>v1.0.0 (Phase 1)</Text>
            </View>
          </View>
        )}
        {onToggleCollapse && (
          <Pressable
            onPress={onToggleCollapse}
            style={styles.collapseBtn}
            accessibilityLabel="Toggle sidebar collapse"
            accessibilityRole="button"
          >
            <Ionicons
              name={collapsed ? 'chevron-forward' : 'chevron-back'}
              size={18}
              color={colors.textSecondary}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 240,
    backgroundColor: colors.sidebar,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingHorizontal: spacing.md,
    justifyContent: 'space-between',
  },
  containerCollapsed: {
    width: 68,
    paddingHorizontal: spacing.sm,
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.md,
  },
  brandHeaderCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  brandIconWrap: {
    width: 34,
    height: 34,
    borderRadius: radii.md,
    backgroundColor: colors.primaryAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandInfo: {
    marginLeft: spacing.sm + 2,
  },
  brandTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.textPrimary,
    letterSpacing: 0.8,
  },
  brandSubtitle: {
    ...typography.captionBold,
    color: colors.primaryAccent,
    fontSize: 9,
    letterSpacing: 1,
  },
  navScroll: {
    flex: 1,
  },
  sectionHeading: {
    ...typography.label,
    color: colors.textMuted,
    fontSize: 10,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radii.md,
    marginVertical: 2,
  },
  navItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  navItemSelected: {
    backgroundColor: colors.surfaceHighlight,
    borderLeftWidth: 3,
    borderLeftColor: colors.primaryAccent,
  },
  navItemPressed: {
    opacity: 0.8,
  },
  navIcon: {
    marginRight: spacing.sm + 2,
  },
  navLabel: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 13,
  },
  navLabelSelected: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomBarCollapsed: {
    justifyContent: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: spacing.sm,
  },
  statusText: {
    ...typography.captionBold,
    color: colors.textSecondary,
    fontSize: 11,
  },
  versionText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
  },
  collapseBtn: {
    padding: spacing.xs,
    borderRadius: radii.sm,
  },
});
