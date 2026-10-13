import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  useWindowDimensions,
  Modal,
  Text,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Sidebar } from './Sidebar';
import { BottomTabBar } from './BottomTabBar';
import { useApp } from '../../state/AppContext';
import { NavigationScreen } from '../../models/types';
import { Ionicons } from '@expo/vector-icons';

interface NavigationShellProps {
  children: React.ReactNode;
}

export const NavigationShell: React.FC<NavigationShellProps> = ({ children }) => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isTabletOrDesktop = width >= 768;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { currentScreen, navigateTo } = useApp();

  const handleMobileNav = (screen: NavigationScreen) => {
    navigateTo(screen);
    setMobileMenuOpen(false);
  };

  const moreItems: { screen: NavigationScreen; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { screen: 'Teams', label: 'Squad Directory', icon: 'shield-outline' },
    { screen: 'Calculator', label: 'Points Simulator', icon: 'calculator-outline' },
    { screen: 'Leaderboards', label: 'Global Leaderboards', icon: 'podium-outline' },
    { screen: 'Settings', label: 'Preferences & Settings', icon: 'settings-outline' },
  ];

  return (
    <View
      style={[
        styles.safeAreaContainer,
        {
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      <View
        style={[
          styles.container,
          { flexDirection: isTabletOrDesktop ? 'row' : 'column' },
        ]}
      >
        {/* Tablet / Desktop Sidebar */}
        {isTabletOrDesktop && (
          <Sidebar
            currentScreen={currentScreen}
            onNavigate={(screen) => navigateTo(screen)}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        )}

        {/* Main Workspace Region */}
        <View style={styles.contentRegion}>{children}</View>

        {/* Mobile Bottom Tab Bar */}
        {!isTabletOrDesktop && (
          <BottomTabBar
            currentScreen={currentScreen}
            onNavigate={(screen) => navigateTo(screen)}
            onOpenMore={() => setMobileMenuOpen(true)}
          />
        )}

        {/* Mobile "More" Menu Modal */}
        {!isTabletOrDesktop && (
          <Modal
            visible={mobileMenuOpen}
            transparent
            animationType="slide"
            onRequestClose={() => setMobileMenuOpen(false)}
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setMobileMenuOpen(false)}
            >
              <View
                style={[
                  styles.sheetContainer,
                  {
                    paddingBottom: Math.max(insets.bottom + spacing.md, spacing.xxl),
                  },
                ]}
              >
                <View style={styles.sheetHandle} />
                <Text style={styles.sheetTitle}>WORKSPACE EXTENSIONS</Text>
                {moreItems.map((item) => (
                  <Pressable
                    key={item.screen}
                    onPress={() => handleMobileNav(item.screen)}
                    style={[
                      styles.sheetItem,
                      currentScreen === item.screen && styles.sheetItemSelected,
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={
                        currentScreen === item.screen
                          ? colors.primaryAccent
                          : colors.textSecondary
                      }
                      style={styles.sheetIcon}
                    />
                    <Text
                      style={[
                        styles.sheetItemText,
                        currentScreen === item.screen && styles.sheetItemTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Pressable>
          </Modal>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.background,
  },
  contentRegion: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 13, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.sidebar,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.lg,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.borderLight,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  sheetTitle: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  sheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.xs,
  },
  sheetItemSelected: {
    backgroundColor: colors.surfaceHighlight,
    borderLeftWidth: 3,
    borderLeftColor: colors.primaryAccent,
  },
  sheetIcon: {
    marginRight: spacing.md,
  },
  sheetItemText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  sheetItemTextSelected: {
    color: colors.primaryAccent,
    fontWeight: '700',
  },
});
