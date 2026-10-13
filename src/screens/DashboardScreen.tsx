import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Pressable,
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing, radii } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useApp } from '../state/AppContext';
import { AppHeader } from '../components/navigation/AppHeader';
import { StatCard } from '../components/common/StatCard';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { TournamentCard } from '../components/tournaments/TournamentCard';
import { TournamentFormModal } from '../components/tournaments/TournamentFormModal';
import { EmptyState } from '../components/common/EmptyState';
import { Ionicons } from '@expo/vector-icons';

export const DashboardScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const {
    tournaments,
    totalTournaments,
    totalTeams,
    totalMatches,
    liveTournamentsCount,
    activity,
    navigateTo,
    createTournament,
    duplicateTournament,
    deleteTournament,
  } = useApp();

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const recentTournaments = tournaments.slice(0, 4);

  const handleDeleteTournament = (id: string, name: string) => {
    Alert.alert(
      'Delete Tournament',
      `Are you sure you want to permanently delete "${name}"? All associated matches and scoring data will be removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteTournament(id),
        },
      ]
    );
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'tournament_created':
        return 'trophy-outline';
      case 'results_saved':
        return 'calculator-outline';
      case 'team_created':
      case 'team_added':
        return 'shield-outline';
      case 'rules_updated':
        return 'settings-outline';
      default:
        return 'flash-outline';
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Dashboard"
        subtitle="Esports Operations Hub"
        isMobile={isMobile}
        rightAction={
          <PrimaryButton
            label="+ Create Tournament"
            onPress={() => setCreateModalVisible(true)}
            size="sm"
          />
        }
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Hero Banner */}
        <View style={styles.heroCard}>
          <View style={styles.heroContent}>
            <View style={styles.eyebrowBadge}>
              <Ionicons name="flash" size={12} color={colors.primaryAccent} />
              <Text style={styles.eyebrowText}>YOUR TOURNAMENT HUB</Text>
            </View>
            <Text style={styles.heroHeadline}>Every match. Every point.</Text>
            <Text style={styles.heroDescription}>
              Manage tournaments, track results, and build your leaderboard from one
              workspace.
            </Text>
            <View style={styles.heroActions}>
              <PrimaryButton
                label="+ Create tournament"
                iconName="add"
                onPress={() => setCreateModalVisible(true)}
                size="md"
              />
              <Pressable
                onPress={() => navigateTo('Calculator')}
                style={styles.simulatorLink}
              >
                <Ionicons name="calculator-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.simulatorLinkText}>Open Points Simulator</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.heroGraphic}>
            <View style={styles.graphicHexagon}>
              <Ionicons name="trophy" size={48} color={colors.primaryAccent} />
            </View>
          </View>
        </View>

        {/* Overview Statistics Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>WORKSPACE OVERVIEW</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            label="Tournaments"
            value={totalTournaments}
            caption="Active competitions"
            iconName="trophy-outline"
            accentColor={colors.primaryAccent}
          />
          <StatCard
            label="Live Now"
            value={liveTournamentsCount}
            caption="Ongoing matches"
            iconName="radio-outline"
            accentColor={colors.error}
          />
          <StatCard
            label="Registered Teams"
            value={totalTeams}
            caption="Roster squads"
            iconName="shield-outline"
            accentColor={colors.secondaryAccent}
          />
          <StatCard
            label="Total Matches"
            value={totalMatches}
            caption="Lobbies recorded"
            iconName="game-controller-outline"
            accentColor={colors.warning}
          />
        </View>

        {/* Two Column Layout on Desktop, Stacked on Mobile */}
        <View style={[styles.mainSplit, isMobile && styles.mainSplitMobile]}>
          {/* Left: Recent Tournaments */}
          <View style={styles.leftColumn}>
            <View style={styles.subSectionHeader}>
              <View>
                <Text style={styles.subTitle}>Recent tournaments</Text>
                <Text style={styles.subCaption}>Manage your latest competitions</Text>
              </View>
              <Pressable
                onPress={() => navigateTo('Tournaments')}
                style={styles.viewAllBtn}
              >
                <Text style={styles.viewAllText}>View all</Text>
                <Ionicons name="arrow-forward" size={14} color={colors.primaryAccent} />
              </Pressable>
            </View>

            {recentTournaments.length === 0 ? (
              <EmptyState
                title="No Tournaments Yet"
                description="Get started by creating your first competitive tournament for BGMI, PUBG Mobile, or Free Fire."
                actionLabel="Create your first tournament"
                onAction={() => setCreateModalVisible(true)}
              />
            ) : (
              recentTournaments.map((tourn) => (
                <TournamentCard
                  key={tourn.id}
                  tournament={tourn}
                  onPress={() => navigateTo('TournamentDetails', { tournamentId: tourn.id })}
                  onDuplicate={() => duplicateTournament(tourn.id)}
                  onDelete={() => handleDeleteTournament(tourn.id, tourn.name)}
                />
              ))
            )}
          </View>

          {/* Right: Recent Activity Log */}
          <View style={styles.rightColumn}>
            <View style={styles.subSectionHeader}>
              <View>
                <Text style={styles.subTitle}>Recent activity</Text>
                <Text style={styles.subCaption}>Workspace operations log</Text>
              </View>
            </View>

            {activity.length === 0 ? (
              <View style={styles.activityEmptyCard}>
                <Ionicons name="time-outline" size={28} color={colors.textMuted} />
                <Text style={styles.activityEmptyTitle}>No Recent Operations</Text>
                <Text style={styles.activityEmptyDesc}>
                  Tournament actions, match results, and scoring updates will appear here in chronological order.
                </Text>
              </View>
            ) : (
              <View style={styles.activityCard}>
                {activity.slice(0, 6).map((act, index) => (
                  <View
                    key={act.id}
                    style={[
                      styles.activityItem,
                      index === 0 && styles.activityItemFirst,
                    ]}
                  >
                    <View style={styles.activityIconBox}>
                      <Ionicons
                        name={getActivityIcon(act.type) as any}
                        size={16}
                        color={colors.primaryAccent}
                      />
                    </View>
                    <View style={styles.activityTextWrap}>
                      <View style={styles.activityTitleRow}>
                        <Text style={styles.activityTitle}>{act.title}</Text>
                        <Text style={styles.activityTime}>{act.timestamp}</Text>
                      </View>
                      <Text style={styles.activityDesc}>{act.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Tournament Creation Modal */}
      <TournamentFormModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSubmit={(data) => {
          const created = createTournament(data);
          navigateTo('TournamentDetails', { tournamentId: created.id });
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
  heroCard: {
    backgroundColor: colors.surfacePrimary,
    borderWidth: 1,
    borderColor: 'rgba(184, 243, 74, 0.25)',
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  heroContent: {
    flex: 1,
    maxWidth: 580,
  },
  eyebrowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryAccentMuted,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: spacing.sm,
  },
  eyebrowText: {
    ...typography.captionBold,
    color: colors.primaryAccent,
    fontSize: 10,
    letterSpacing: 1,
  },
  heroHeadline: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  heroDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  simulatorLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  simulatorLinkText: {
    ...typography.bodyBold,
    color: colors.textSecondary,
    fontSize: 13,
  },
  heroGraphic: {
    marginLeft: spacing.lg,
    display: 'flex',
  },
  graphicHexagon: {
    width: 88,
    height: 88,
    borderRadius: radii.xl,
    backgroundColor: 'rgba(184, 243, 74, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(184, 243, 74, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  mainSplit: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  mainSplitMobile: {
    flexDirection: 'column',
  },
  leftColumn: {
    flex: 3,
  },
  rightColumn: {
    flex: 2,
  },
  subSectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  subTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  subCaption: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  viewAllText: {
    ...typography.captionBold,
    color: colors.primaryAccent,
    fontSize: 12,
  },
  activityCard: {
    backgroundColor: colors.surfacePrimary,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  activityItemFirst: {
    borderTopWidth: 0,
    paddingTop: spacing.xs,
  },
  activityIconBox: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    backgroundColor: colors.primaryAccentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  activityTextWrap: {
    flex: 1,
  },
  activityTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  activityTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 13,
  },
  activityTime: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  activityDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  activityEmptyCard: {
    backgroundColor: colors.surfacePrimary,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityEmptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.sm,
    marginBottom: 4,
  },
  activityEmptyDesc: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
