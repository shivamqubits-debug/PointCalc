import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Pressable,
  TextInput,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing, radii } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useApp } from '../state/AppContext';
import { AppHeader } from '../components/navigation/AppHeader';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { SecondaryButton } from '../components/common/SecondaryButton';
import { StatusBadge } from '../components/common/StatusBadge';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { StatCard } from '../components/common/StatCard';
import { TeamCard } from '../components/teams/TeamCard';
import { MatchCard } from '../components/matches/MatchCard';
import { MatchFormModal } from '../components/matches/MatchFormModal';
import { MatchResultModal } from '../components/matches/MatchResultModal';
import { TournamentFormModal } from '../components/tournaments/TournamentFormModal';
import { TeamFormModal } from '../components/teams/TeamFormModal';
import { LeaderboardTable } from '../components/leaderboards/LeaderboardTable';
import { EmptyState } from '../components/common/EmptyState';
import { ModalContainer } from '../components/common/ModalContainer';
import {
  computeTournamentLeaderboard,
  SCORING_PRESETS,
} from '../scoring/scoringEngine';
import { Match, ScoringRule, TieBreakRule } from '../models/types';
import { Ionicons } from '@expo/vector-icons';

type TabKey = 'Overview' | 'Teams' | 'Matches' | 'Point Table' | 'Scoring Rules';

export const TournamentDetailsScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const {
    selectedTournamentId,
    getTournament,
    getTournamentMatches,
    getTournamentTeams,
    teams: allWorkspaceTeams,
    tournaments,
    goBack,
    updateTournament,
    addTeamToTournament,
    removeTeamFromTournament,
    createTeam,
    createMatch,
    updateMatch,
    deleteMatch,
    saveMatchResults,
    updateScoringRule,
    settings,
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabKey>('Overview');

  // Modals state
  const [editTournModal, setEditTournModal] = useState(false);
  const [createMatchModal, setCreateMatchModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [resultsMatch, setResultsMatch] = useState<Match | null>(null);
  const [createTeamModal, setCreateTeamModal] = useState(false);
  const [addExistingTeamModal, setAddExistingTeamModal] = useState(false);

  const tournament = selectedTournamentId ? getTournament(selectedTournamentId) : undefined;
  const matches = tournament ? getTournamentMatches(tournament.id) : [];
  const tournamentTeams = tournament ? getTournamentTeams(tournament.id) : [];

  // Local state for editable scoring rules
  const [customPointsPerKill, setCustomPointsPerKill] = useState('1');
  const [customPlacementPoints, setCustomPlacementPoints] = useState<Record<number, string>>({});
  const [customTieBreak, setCustomTieBreak] = useState<TieBreakRule>('PlacementPointsFirst');

  // Sync scoring rule state when tournament changes
  React.useEffect(() => {
    if (tournament) {
      setCustomPointsPerKill(String(tournament.scoringRule.pointsPerElimination));
      setCustomTieBreak(tournament.scoringRule.tieBreakPriority);
      const strMap: Record<number, string> = {};
      Object.entries(tournament.scoringRule.placementPoints).forEach(([rank, pts]) => {
        strMap[Number(rank)] = String(pts);
      });
      setCustomPlacementPoints(strMap);
    }
  }, [tournament?.id, tournament?.scoringRule]);

  // Derived Leaderboard
  const leaderboardEntries = useMemo(() => {
    if (!tournament) return [];
    return computeTournamentLeaderboard(tournament, allWorkspaceTeams, matches);
  }, [tournament, allWorkspaceTeams, matches]);

  if (!tournament) {
    return (
      <View style={styles.container}>
        <AppHeader title="Tournament Not Found" canGoBack onGoBack={goBack} />
        <View style={styles.notFoundCenter}>
          <EmptyState
            title="Tournament Not Found"
            description="The requested tournament may have been deleted or the link is invalid."
            actionLabel="Return to Tournaments"
            onAction={goBack}
          />
        </View>
      </View>
    );
  }

  const completedMatches = matches.filter((m) => m.resultsEntered).length;
  const plannedMatches = tournament.plannedMatchesCount || matches.length;

  // Teams eligible to add (workspace teams not yet in tournament)
  const availableToAddTeams = allWorkspaceTeams.filter(
    (t) => !tournament.teamIds.includes(t.id)
  );

  const handleApplyPreset = (presetName: string) => {
    const preset = SCORING_PRESETS[presetName];
    if (preset) {
      updateScoringRule(tournament.id, preset);
    }
  };

  const handleSaveCustomRules = () => {
    const numKill = parseInt(customPointsPerKill, 10) || 1;
    const numPlacement: Record<number, number> = {};
    Object.entries(customPlacementPoints).forEach(([rank, val]) => {
      numPlacement[Number(rank)] = parseInt(val, 10) || 0;
    });

    const newRule: ScoringRule = {
      pointsPerElimination: numKill,
      placementPoints: numPlacement,
      tieBreakPriority: customTieBreak,
      allTeamsRequired: tournament.scoringRule.allTeamsRequired,
    };

    updateScoringRule(tournament.id, newRule);
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title={tournament.name}
        subtitle={`${tournament.game} • Organized by ${tournament.organizerName || 'Local Admin'}`}
        canGoBack
        onGoBack={goBack}
        isMobile={isMobile}
        rightAction={
          <SecondaryButton
            label="Edit Details"
            iconName="pencil-outline"
            onPress={() => setEditTournModal(true)}
            size="sm"
          />
        }
      />

      {/* Tabs Bar */}
      <View style={styles.tabsHeader}>
        <SegmentedControl
          options={[
            { label: 'Overview', value: 'Overview' },
            { label: 'Teams', value: 'Teams', badge: tournamentTeams.length },
            { label: 'Matches', value: 'Matches', badge: matches.length },
            { label: 'Point Table', value: 'Point Table' },
            { label: 'Scoring Rules', value: 'Scoring Rules' },
          ]}
          selectedValue={activeTab}
          onSelect={setActiveTab}
          scrollable
        />
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'Overview' && (
          <View>
            {/* Quick Stats Grid */}
            <View style={styles.statsRow}>
              <StatCard
                label="Registered Squads"
                value={`${tournamentTeams.length}/${tournament.expectedTeamsCount || 16}`}
                caption="Participating teams"
                iconName="shield-outline"
                accentColor={colors.primaryAccent}
              />
              <StatCard
                label="Matches Played"
                value={`${completedMatches}/${plannedMatches}`}
                caption="Rounds completed"
                iconName="game-controller-outline"
                accentColor={colors.secondaryAccent}
              />
              <StatCard
                label="Status"
                value={tournament.status}
                caption={tournament.startDate ? `Starts: ${tournament.startDate}` : 'Competition state'}
                iconName="radio-outline"
                accentColor={
                  tournament.status === 'Live'
                    ? colors.error
                    : tournament.status === 'Completed'
                    ? colors.success
                    : colors.warning
                }
              />
            </View>

            {/* Quick Action Bar */}
            <View style={styles.quickBar}>
              <Text style={styles.quickBarTitle}>STAGE SHORTCUTS</Text>
              <View style={styles.quickButtons}>
                <PrimaryButton
                  label="+ Create Match"
                  iconName="add"
                  onPress={() => setCreateMatchModal(true)}
                  size="sm"
                />
                <SecondaryButton
                  label="+ Add Existing Squad"
                  iconName="person-add-outline"
                  onPress={() => setAddExistingTeamModal(true)}
                  size="sm"
                />
                <SecondaryButton
                  label="View Full Points"
                  iconName="podium-outline"
                  onPress={() => setActiveTab('Point Table')}
                  size="sm"
                />
              </View>
            </View>

            {/* Leaderboard Preview (Top 5) */}
            <View style={styles.sectionCard}>
              <View style={styles.cardHeaderRow}>
                <View>
                  <Text style={styles.cardTitle}>Current Leaderboard Standings</Text>
                  <Text style={styles.cardSubtitle}>
                    Live standings based on {completedMatches} completed matches
                  </Text>
                </View>
                <Pressable onPress={() => setActiveTab('Point Table')}>
                  <Text style={styles.linkText}>View All Ranks →</Text>
                </Pressable>
              </View>

              {leaderboardEntries.length === 0 ? (
                <EmptyState
                  title="No teams registered"
                  description="Add squads to this tournament to generate the initial leaderboard."
                  actionLabel="+ Add Squads"
                  onAction={() => setActiveTab('Teams')}
                />
              ) : (
                <LeaderboardTable
                  entries={leaderboardEntries.slice(0, 5)}
                  density={settings.tableDensity}
                />
              )}
            </View>

            {/* Recent Match Schedule Preview */}
            <View style={styles.sectionCard}>
              <View style={styles.cardHeaderRow}>
                <View>
                  <Text style={styles.cardTitle}>Recent Tournament Matches</Text>
                  <Text style={styles.cardSubtitle}>
                    {matches.length} total matches configured for this competition
                  </Text>
                </View>
                <Pressable onPress={() => setActiveTab('Matches')}>
                  <Text style={styles.linkText}>All Matches →</Text>
                </Pressable>
              </View>

              {matches.length === 0 ? (
                <EmptyState
                  title="No matches scheduled"
                  description="Schedule match rounds to begin recording squad placements and kill scores."
                  actionLabel="+ Schedule Match"
                  onAction={() => setCreateMatchModal(true)}
                />
              ) : (
                matches.slice(0, 2).map((m) => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    tournament={tournament}
                    teams={allWorkspaceTeams}
                    onEnterResults={() => setResultsMatch(m)}
                    onEdit={() => setEditingMatch(m)}
                    onDelete={() => deleteMatch(m.id)}
                  />
                ))
              )}
            </View>
          </View>
        )}

        {/* TAB 2: TEAMS */}
        {activeTab === 'Teams' && (
          <View>
            <View style={styles.tabActionRow}>
              <View>
                <Text style={styles.tabSectionTitle}>
                  Tournament Squads ({tournamentTeams.length})
                </Text>
                <Text style={styles.tabSectionDesc}>
                  Manage participating rosters registered in this tournament
                </Text>
              </View>
              <View style={styles.tabActionButtons}>
                <SecondaryButton
                  label="Add Existing Squad"
                  iconName="search-outline"
                  onPress={() => setAddExistingTeamModal(true)}
                  size="sm"
                />
                <PrimaryButton
                  label="+ Create New Squad"
                  iconName="add"
                  onPress={() => setCreateTeamModal(true)}
                  size="sm"
                />
              </View>
            </View>

            {tournamentTeams.length === 0 ? (
              <EmptyState
                title="No squads in this tournament"
                description="Register squads from the workspace directory or create a new squad directly."
                iconName="shield-outline"
                actionLabel="+ Add Existing Squad"
                onAction={() => setAddExistingTeamModal(true)}
              />
            ) : (
              <View style={styles.teamGrid}>
                {tournamentTeams.map((t) => (
                  <TeamCard
                    key={t.id}
                    team={t}
                    onRemoveFromTournament={() => removeTeamFromTournament(tournament.id, t.id)}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* TAB 3: MATCHES */}
        {activeTab === 'Matches' && (
          <View>
            <View style={styles.tabActionRow}>
              <View>
                <Text style={styles.tabSectionTitle}>
                  Match Schedule & Rounds ({matches.length})
                </Text>
                <Text style={styles.tabSectionDesc}>
                  Record kill tallies and final squad placements
                </Text>
              </View>
              <PrimaryButton
                label="+ Create Match"
                iconName="add"
                onPress={() => setCreateMatchModal(true)}
                size="sm"
              />
            </View>

            {matches.length === 0 ? (
              <EmptyState
                title="No matches scheduled"
                description="Schedule match rounds to start tracking match results."
                iconName="game-controller-outline"
                actionLabel="+ Schedule First Match"
                onAction={() => setCreateMatchModal(true)}
              />
            ) : (
              matches.map((m) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  tournament={tournament}
                  teams={allWorkspaceTeams}
                  onEnterResults={() => setResultsMatch(m)}
                  onEdit={() => setEditingMatch(m)}
                  onDelete={() => deleteMatch(m.id)}
                />
              ))
            )}
          </View>
        )}

        {/* TAB 4: POINT TABLE */}
        {activeTab === 'Point Table' && (
          <View>
            <View style={styles.tabActionRow}>
              <View>
                <Text style={styles.tabSectionTitle}>
                  Official Tournament Leaderboard
                </Text>
                <Text style={styles.tabSectionDesc}>
                  Calculated automatically using {tournament.scoringRule.tieBreakPriority} tie-breaker
                </Text>
              </View>
            </View>

            {leaderboardEntries.length === 0 ? (
              <EmptyState
                title="No leaderboard data"
                description="Add squads and enter match results to generate the tournament points table."
                actionLabel="Go to Matches"
                onAction={() => setActiveTab('Matches')}
              />
            ) : (
              <LeaderboardTable
                entries={leaderboardEntries}
                density={settings.tableDensity}
              />
            )}
          </View>
        )}

        {/* TAB 5: SCORING RULES */}
        {activeTab === 'Scoring Rules' && (
          <View style={styles.rulesCard}>
            <Text style={styles.tabSectionTitle}>Configurable Scoring Rules</Text>
            <Text style={styles.tabSectionDesc}>
              Modify points per elimination and rank placement payouts. Changes update leaderboards in real time.
            </Text>

            {/* Scoring Presets */}
            <View style={styles.ruleGroup}>
              <Text style={styles.ruleGroupLabel}>QUICK PRESETS</Text>
              <View style={styles.presetRow}>
                {Object.keys(SCORING_PRESETS).map((presetName) => (
                  <Pressable
                    key={presetName}
                    onPress={() => handleApplyPreset(presetName)}
                    style={styles.presetBtn}
                  >
                    <Ionicons name="flash-outline" size={14} color={colors.primaryAccent} />
                    <Text style={styles.presetBtnText}>{presetName}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Points per Elimination */}
            <View style={styles.ruleGroup}>
              <Text style={styles.ruleGroupLabel}>POINTS PER ELIMINATION (KILL)</Text>
              <TextInput
                value={customPointsPerKill}
                onChangeText={setCustomPointsPerKill}
                keyboardType="numeric"
                style={styles.ruleInput}
                placeholder="1"
              />
            </View>

            {/* Tie-Break Priority */}
            <View style={styles.ruleGroup}>
              <Text style={styles.ruleGroupLabel}>TIE-BREAK PRIORITY</Text>
              <View style={styles.tieBreakRow}>
                {(
                  [
                    { label: 'Placement First', value: 'PlacementPointsFirst' },
                    { label: 'Kills First', value: 'EliminationsFirst' },
                    { label: 'Wins (WWCD) First', value: 'MostWinsFirst' },
                  ] as const
                ).map((tb) => {
                  const isSelected = customTieBreak === tb.value;
                  return (
                    <Pressable
                      key={tb.value}
                      onPress={() => setCustomTieBreak(tb.value)}
                      style={[styles.tieBreakBtn, isSelected && styles.tieBreakBtnSelected]}
                    >
                      <Text
                        style={[
                          styles.tieBreakText,
                          isSelected && styles.tieBreakTextSelected,
                        ]}
                      >
                        {tb.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Placement-to-Points Mapping */}
            <View style={styles.ruleGroup}>
              <Text style={styles.ruleGroupLabel}>PLACEMENT POINTS MAPPING (RANKS 1..16)</Text>
              <View style={styles.ranksGrid}>
                {Array.from({ length: 16 }, (_, i) => i + 1).map((rank) => (
                  <View key={rank} style={styles.rankCell}>
                    <Text style={styles.rankCellLabel}>#{rank}</Text>
                    <TextInput
                      value={customPlacementPoints[rank] || '0'}
                      onChangeText={(val) =>
                        setCustomPlacementPoints((prev) => ({ ...prev, [rank]: val }))
                      }
                      keyboardType="numeric"
                      style={styles.rankInput}
                    />
                  </View>
                ))}
              </View>
            </View>

            <PrimaryButton
              label="Save Scoring Rules"
              onPress={handleSaveCustomRules}
              style={{ alignSelf: 'flex-start', marginTop: spacing.md }}
            />
          </View>
        )}
      </ScrollView>

      {/* Edit Tournament Modal */}
      <TournamentFormModal
        visible={editTournModal}
        initialData={tournament}
        onClose={() => setEditTournModal(false)}
        onSubmit={(data) => {
          updateTournament(tournament.id, data);
          setEditTournModal(false);
        }}
      />

      {/* Create / Edit Match Modal */}
      <MatchFormModal
        visible={createMatchModal || !!editingMatch}
        tournaments={tournaments}
        allTeams={allWorkspaceTeams}
        presetTournamentId={tournament.id}
        initialData={editingMatch}
        onClose={() => {
          setCreateMatchModal(false);
          setEditingMatch(null);
        }}
        onSubmit={(data) => {
          if (editingMatch) {
            updateMatch(editingMatch.id, data);
            setEditingMatch(null);
          } else {
            createMatch(data);
          }
        }}
      />

      {/* Enter Match Results Modal */}
      {resultsMatch && (
        <MatchResultModal
          visible={!!resultsMatch}
          match={resultsMatch}
          tournament={tournament}
          teams={allWorkspaceTeams}
          onClose={() => setResultsMatch(null)}
          onSubmit={(results) => {
            saveMatchResults(resultsMatch.id, results);
            setResultsMatch(null);
          }}
        />
      )}

      {/* Create New Team Modal */}
      <TeamFormModal
        visible={createTeamModal}
        onClose={() => setCreateTeamModal(false)}
        onSubmit={(data) => {
          const newTeam = createTeam(data);
          addTeamToTournament(tournament.id, newTeam.id);
        }}
      />

      {/* Add Existing Workspace Team Modal */}
      <ModalContainer
        visible={addExistingTeamModal}
        onClose={() => setAddExistingTeamModal(false)}
        title="Add Existing Squads"
        subtitle="Select squads from the workspace directory to join this competition"
      >
        {availableToAddTeams.length === 0 ? (
          <EmptyState
            title="All workspace squads registered"
            description="All squads in your directory are already registered in this tournament."
            actionLabel="+ Create New Squad"
            onAction={() => {
              setAddExistingTeamModal(false);
              setCreateTeamModal(true);
            }}
          />
        ) : (
          <View style={styles.existingTeamList}>
            {availableToAddTeams.map((t) => (
              <View key={t.id} style={styles.existingTeamRow}>
                <View style={styles.existingTeamInfo}>
                  <Text style={styles.existingTeamName}>{t.name}</Text>
                  <Text style={styles.existingTeamTag}>[{t.tag}] • {t.players.length} players</Text>
                </View>
                <PrimaryButton
                  label="Add to Tourney"
                  onPress={() => {
                    addTeamToTournament(tournament.id, t.id);
                    setAddExistingTeamModal(false);
                  }}
                  size="sm"
                />
              </View>
            ))}
          </View>
        )}
      </ModalContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  notFoundCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  tabsHeader: {
    backgroundColor: colors.surfacePrimary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  quickBar: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  quickBarTitle: {
    ...typography.label,
    color: colors.textMuted,
    fontSize: 10,
    marginBottom: spacing.xs,
  },
  quickButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sectionCard: {
    backgroundColor: colors.surfacePrimary,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  linkText: {
    ...typography.captionBold,
    color: colors.primaryAccent,
    fontSize: 12,
  },
  tabActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  tabSectionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    fontSize: 18,
  },
  tabSectionDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  tabActionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  teamGrid: {
    gap: spacing.sm,
  },
  rulesCard: {
    backgroundColor: colors.surfacePrimary,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  ruleGroup: {
    marginTop: spacing.md,
  },
  ruleGroupLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  presetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    gap: 6,
  },
  presetBtnText: {
    ...typography.captionBold,
    color: colors.textPrimary,
    fontSize: 11,
  },
  ruleInput: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    color: colors.textPrimary,
    height: 40,
    width: 120,
    paddingHorizontal: spacing.md,
    ...typography.tabularNum,
  },
  tieBreakRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tieBreakBtn: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
  },
  tieBreakBtnSelected: {
    borderColor: colors.primaryAccent,
    backgroundColor: colors.surfaceHighlight,
  },
  tieBreakText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  tieBreakTextSelected: {
    color: colors.primaryAccent,
    fontWeight: '700',
  },
  ranksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
  },
  rankCell: {
    width: 60,
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.sm,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rankCellLabel: {
    ...typography.captionBold,
    color: colors.textMuted,
    fontSize: 10,
    marginBottom: 2,
  },
  rankInput: {
    width: 44,
    height: 30,
    backgroundColor: colors.surfacePrimary,
    borderRadius: radii.xs,
    color: colors.textPrimary,
    textAlign: 'center',
    ...typography.tabularNum,
    fontSize: 12,
  },
  existingTeamList: {
    gap: spacing.sm,
  },
  existingTeamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  existingTeamInfo: {
    flex: 1,
  },
  existingTeamName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  existingTeamTag: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
});
