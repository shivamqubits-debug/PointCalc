import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing, radii } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useApp } from '../state/AppContext';
import { AppHeader } from '../components/navigation/AppHeader';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { GameType } from '../models/types';
import { Ionicons } from '@expo/vector-icons';

export const SettingsScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const { settings, updateSettings, resetToDefaults } = useApp();

  const [confirmResetVisible, setConfirmResetVisible] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const GAME_LIST: GameType[] = ['BGMI', 'PUBG Mobile', 'Free Fire', 'Other'];

  return (
    <View style={styles.container}>
      <AppHeader
        title="Settings"
        subtitle="Workspace preferences, table layout, and defaults"
        isMobile={isMobile}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Feedback Banner */}
        {feedbackMsg && (
          <View style={styles.feedbackBanner}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.feedbackText}>{feedbackMsg}</Text>
          </View>
        )}

        {/* Section 1: Table & Layout Density */}
        <View style={styles.settingCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="apps-outline" size={20} color={colors.primaryAccent} />
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Table Layout Density</Text>
              <Text style={styles.cardDesc}>
                Controls row padding and data density across tournament leaderboards
              </Text>
            </View>
          </View>

          <View style={styles.optionRow}>
            {(
              [
                { label: 'Comfortable', value: 'comfortable', desc: 'Relaxed spacing with more breathing room' },
                { label: 'Compact', value: 'compact', desc: 'Maximum information density for live streams' },
              ] as const
            ).map((d) => {
              const isSelected = settings.tableDensity === d.value;
              return (
                <Pressable
                  key={d.value}
                  onPress={() => {
                    updateSettings({ tableDensity: d.value });
                    showFeedback(`Table density set to ${d.label}`);
                  }}
                  style={[styles.densityChoice, isSelected && styles.densityChoiceSelected]}
                >
                  <View style={styles.choiceHeader}>
                    <Text
                      style={[
                        styles.choiceLabel,
                        isSelected && styles.choiceLabelSelected,
                      ]}
                    >
                      {d.label}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={18} color={colors.primaryAccent} />
                    )}
                  </View>
                  <Text style={styles.choiceDesc}>{d.desc}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Section 2: Default Esports Game Title */}
        <View style={styles.settingCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="game-controller-outline" size={20} color={colors.secondaryAccent} />
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Default Game Title</Text>
              <Text style={styles.cardDesc}>
                Pre-selected game title when creating new tournaments and lobby matches
              </Text>
            </View>
          </View>

          <View style={styles.gameChoices}>
            {GAME_LIST.map((g) => {
              const isSelected = settings.defaultGame === g;
              return (
                <Pressable
                  key={g}
                  onPress={() => {
                    updateSettings({ defaultGame: g });
                    showFeedback(`Default game updated to ${g}`);
                  }}
                  style={[styles.gameChip, isSelected && styles.gameChipSelected]}
                >
                  <Text style={[styles.gameChipText, isSelected && styles.gameChipTextSelected]}>
                    {g}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Section 3: Safety & Confirmations */}
        <View style={styles.settingCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.warning} />
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Confirmation Dialogs</Text>
              <Text style={styles.cardDesc}>
                Require explicit confirmation before deleting tournaments or removing squads
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => {
              const nextVal = !settings.confirmDestructive;
              updateSettings({ confirmDestructive: nextVal });
              showFeedback(`Destructive confirmations ${nextVal ? 'enabled' : 'disabled'}`);
            }}
            style={styles.toggleRow}
          >
            <Text style={styles.toggleText}>Confirm before deleting records</Text>
            <View
              style={[
                styles.toggleTrack,
                settings.confirmDestructive && styles.toggleTrackActive,
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  settings.confirmDestructive && styles.toggleThumbActive,
                ]}
              />
            </View>
          </Pressable>
        </View>

        {/* Section 4: Demo Data Reset */}
        <View style={styles.settingCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="refresh-circle-outline" size={20} color={colors.error} />
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Reset In-Memory Data</Text>
              <Text style={styles.cardDesc}>
                Restore original seed tournaments, squads, and matches back to pristine demo state
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => setConfirmResetVisible(true)}
            style={styles.resetBtn}
            accessibilityRole="button"
          >
            <Ionicons name="trash-outline" size={16} color={colors.error} />
            <Text style={styles.resetBtnText}>Reset Workspace to Demo Defaults</Text>
          </Pressable>
        </View>

        {/* Section 5: About & Architecture */}
        <View style={styles.aboutCard}>
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <Ionicons name="flash" size={16} color={colors.textInverse} />
            </View>
            <View>
              <Text style={styles.aboutBrand}>PointCalc Esports Manager</Text>
              <Text style={styles.aboutVersion}>Phase 1 UI Prototype • Version 1.0.0</Text>
            </View>
          </View>

          <Text style={styles.aboutDesc}>
            Built with React Native & TypeScript for tournament organizers managing BGMI,
            PUBG Mobile, and Free Fire competitions. Operating purely in local in-memory
            state with deterministic scoring calculations.
          </Text>

          <View style={styles.metaBadgeRow}>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>Offline In-Memory</Text>
            </View>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>Mobile & Tablet Optimized</Text>
            </View>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>SDK 57</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Confirm Reset Dialog */}
      <ConfirmDialog
        visible={confirmResetVisible}
        title="Reset All Workspace Data?"
        message="This will reset all tournaments, rosters, matches, and logs back to the default seed data."
        confirmLabel="Reset Everything"
        isDestructive
        onCancel={() => setConfirmResetVisible(false)}
        onConfirm={() => {
          resetToDefaults();
          setConfirmResetVisible(false);
          showFeedback('Workspace reset to default seed data successfully!');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 90,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successMuted,
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: radii.md,
    padding: spacing.sm + 2,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  feedbackText: {
    ...typography.captionBold,
    color: colors.success,
    fontSize: 12,
  },
  settingCard: {
    backgroundColor: colors.surfacePrimary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md + 2,
    marginBottom: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  cardDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  optionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  densityChoice: {
    flex: 1,
    minWidth: 200,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  densityChoiceSelected: {
    borderColor: colors.primaryAccent,
    backgroundColor: colors.surfaceHighlight,
  },
  choiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  choiceLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  choiceLabelSelected: {
    color: colors.primaryAccent,
  },
  choiceDesc: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  gameChoices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gameChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gameChipSelected: {
    backgroundColor: colors.primaryAccentMuted,
    borderColor: colors.primaryAccent,
  },
  gameChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  gameChipTextSelected: {
    color: colors.primaryAccent,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    borderRadius: radii.md,
  },
  toggleText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleTrackActive: {
    backgroundColor: colors.primaryAccent,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.textPrimary,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
    backgroundColor: colors.textInverse,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.errorMuted,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radii.md,
    paddingVertical: spacing.sm + 2,
    gap: 8,
  },
  resetBtnText: {
    ...typography.bodyBold,
    color: colors.error,
    fontSize: 13,
  },
  aboutCard: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md + 2,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  brandIcon: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    backgroundColor: colors.primaryAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutBrand: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 14,
  },
  aboutVersion: {
    ...typography.caption,
    color: colors.primaryAccent,
    fontSize: 11,
  },
  aboutDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  metaBadgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  metaBadge: {
    backgroundColor: colors.surfacePrimary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaBadgeText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
  },
});
