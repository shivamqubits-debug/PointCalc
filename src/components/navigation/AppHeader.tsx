import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useApp } from '../../state/AppContext';
import { Ionicons } from '@expo/vector-icons';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: string;
  canGoBack?: boolean;
  onGoBack?: () => void;
  onOpenMobileMenu?: () => void;
  isMobile?: boolean;
  rightAction?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  breadcrumb = 'ESPORTS / MANAGEMENT',
  canGoBack,
  onGoBack,
  onOpenMobileMenu,
  isMobile = false,
  rightAction,
}) => {
  const insets = useSafeAreaInsets();
  const { currentScreen, goBack: contextGoBack, navigateTo, user } = useApp();

  const isHome = currentScreen === 'Dashboard';
  // Respect explicit canGoBack if provided; otherwise show back button on all non-Dashboard screens
  const shouldShowBack = canGoBack !== undefined ? canGoBack : !isHome;
  const handleBack = onGoBack || contextGoBack;

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top > 0 ? insets.top + 10 : 36,
          minHeight: 64 + (insets.top > 0 ? insets.top : 24),
        },
      ]}
    >
      <View style={styles.leftRow}>
        {/* Single Predictable Back Button */}
        {shouldShowBack && (
          <Pressable
            onPress={handleBack}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </Pressable>
        )}

        {/* Mobile menu trigger on home screen if needed */}
        {isHome && isMobile && onOpenMobileMenu && (
          <Pressable
            onPress={onOpenMobileMenu}
            style={styles.menuBtn}
            accessibilityRole="button"
            accessibilityLabel="Open menu"
          >
            <Ionicons name="menu-outline" size={24} color={colors.textPrimary} />
          </Pressable>
        )}

        <View style={styles.titleContainer}>
          <Text style={styles.breadcrumb}>{breadcrumb}</Text>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightRow}>
        {rightAction}

        {/* Profile Avatar Entry Point */}
        <Pressable
          onPress={() => navigateTo('Profile')}
          style={({ pressed }) => [
            styles.profileBtn,
            currentScreen === 'Profile' && styles.profileBtnActive,
            pressed && { opacity: 0.8 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Open Organizer Profile"
        >
          <View
            style={[
              styles.avatarCircle,
              { backgroundColor: user?.avatarColor || colors.primaryAccent },
            ]}
          >
            <Text style={styles.avatarInitials}>
              {user?.name
                ? user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : 'AM'}
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.surfacePrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    padding: spacing.xs + 2,
    marginRight: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuBtn: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  breadcrumb: {
    ...typography.label,
    color: colors.primaryAccent,
    fontSize: 9,
    letterSpacing: 1,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    fontSize: 18,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  profileBtn: {
    padding: 2,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  profileBtnActive: {
    borderColor: colors.primaryAccent,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    ...typography.captionBold,
    color: colors.textInverse,
    fontSize: 11,
    fontWeight: '800',
  },
});
