import React, { useState, useMemo } from 'react';
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
import { SearchInput } from '../components/common/SearchInput';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { LeaderboardTable } from '../components/leaderboards/LeaderboardTable';
import { EmptyState } from '../components/common/EmptyState';
import {
  computeTournamentLeaderboard,
  computeMatchLeaderboard,
} from '../scoring/scoringEngine';
import { Ionicons } from '@expo/vector-icons';

export const LeaderboardsScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const {
    tournaments,
    teams,
    matches,
    navigateTo,
    settings,
  } = useApp();

  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(
    tournaments[0]?.id || ''
  );
  const [scope, setScope] = useState<'Overall' | 'SingleMatch'>('Overall');
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');
  const [searchTeam, setSearchTeam] = useState('');

  const activeTournament = tournaments.find((t) => t.id === selectedTournamentId);
  const tournamentMatches = matches.filter(
    (m) => m.tournamentId === selectedTournamentId
  );
  const completedMatches = tournamentMatches.filter((m) => m.resultsEntered);

  // Set default single match if not selected
  React.useEffect(() => {
    if (completedMatches.length > 0 && !selectedMatchId) {
      setSelectedMatchId(completedMatches[0].id);
    }
  }, [completedMatches, selectedMatchId]);

  // Compute entries
  const rawEntries = useMemo(() => {
    if (!activeTournament) return [];

    if (scope === 'Overall') {
      return computeTournamentLeaderboard(activeTournament, teams, matches);
    } else {
      const match = tournamentMatches.find((m) => m.id === selectedMatchId);
      if (!match || !match.resultsEntered) return [];
      return computeMatchLeaderboard(match, activeTournament, teams);
    }
  }, [activeTournament, scope, selectedMatchId, teams, matches, tournamentMatches]);

  const filteredEntries = useMemo(() => {
    if (!searchTeam.trim()) return rawEntries;
    const q = searchTeam.toLowerCase();
    return rawEntries.filter(
      (e) =>
        e.teamName.toLowerCase().includes(q) ||
        e.teamTag.toLowerCase().includes(q)
    );
  }, [rawEntries, searchTeam]);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Leaderboards"
        subtitle="Live points tables and match standings"
        isMobile={isMobile}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tournament Selector Bar */}
        <View style={styles.selectorCard}>
          <Text style={styles.label}>SELECT TOURNAMENT:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {tournaments.map((t) => {
              const isSelected = selectedTournamentId === t.id;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => {
                    setSelectedTournamentId(t.id);
                    setSelectedMatchId('');
                  }}
                  style={[styles.tournChip, isSelected && styles.tournChipSelected]}
                >
                  <Text
                    style={[
                      styles.tournChipText,
                      isSelected && styles.tournChipTextSelected,
                    ]}
                  >
                    {t.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Scope Selector: Overall vs Single Match */}
          <View style={styles.scopeRow}>
            <View style={styles.scopeSegment}>
              <Text style={styles.label}>STANDINGS SCOPE:</Text>
              <SegmentedControl
                options={[
                  { label: 'Overall Standings', value: 'Overall' },
                  {
                    label: 'Individual Round',
                    value: 'SingleMatch',
                    badge: completedMatches.length,
                  },
                ]}
                selectedValue={scope}
                onSelect={setScope}
              />
            </View>

            {/* Single Match Selector if scope is SingleMatch */}
            {scope === 'SingleMatch' && completedMatches.length > 0 && (
              <View style={styles.matchPicker}>
                <Text style={styles.label}>SELECT ROUND:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {completedMatches.map((m) => {
                    const isSelected = selectedMatchId === m.id;
                    return (
                      <Pressable
                        key={m.id}
                        onPress={() => setSelectedMatchId(m.id)}
                        style={[styles.matchChip, isSelected && styles.matchChipSelected]}
                      >
                        <Text
                          style={[
                            styles.matchChipText,
                            isSelected && styles.matchChipTextSelected,
                          ]}
                        >
                          Match #{m.matchNumber}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Team Search & Tournament Link */}
          <View style={styles.searchRow}>
            <SearchInput
              value={searchTeam}
              onChangeText={setSearchTeam}
              placeholder="Filter by team or tag in points table..."
              style={styles.searchInput}
            />

            {activeTournament && (
              <Pressable
                onPress={() =>
                  navigateTo('TournamentDetails', { tournamentId: activeTournament.id })
                }
                style={styles.tournLink}
              >
                <Text style={styles.tournLinkText}>Open Tournament Workspace →</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Leaderboard Table Display */}
        {filteredEntries.length === 0 ? (
          <EmptyState
            title="No points recorded yet"
            description={
              scope === 'SingleMatch' && completedMatches.length === 0
                ? 'No matches have recorded results for this competition yet.'
                : 'Enter placements and kill points in the tournament workspace to generate the leaderboard.'
            }
            iconName="podium-outline"
            actionLabel="Go to Matches"
            onAction={() =>
              activeTournament
                ? navigateTo('TournamentDetails', { tournamentId: activeTournament.id })
                : navigateTo('Matches')
            }
          />
        ) : (
          <LeaderboardTable
            entries={filteredEntries}
            density={settings.tableDensity}
          />
        )}
      </ScrollView>
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
  selectorCard: {
    backgroundColor: colors.surfacePrimary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.captionBold,
    color: colors.textMuted,
    fontSize: 10,
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
    marginBottom: spacing.md,
  },
  tournChip: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tournChipSelected: {
    backgroundColor: colors.primaryAccentMuted,
    borderColor: colors.primaryAccent,
  },
  tournChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  tournChipTextSelected: {
    color: colors.primaryAccent,
    fontWeight: '700',
  },
  scopeRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  scopeSegment: {
    marginBottom: spacing.sm,
  },
  matchPicker: {
    marginTop: spacing.xs,
  },
  matchChip: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.xs,
  },
  matchChipSelected: {
    borderColor: colors.primaryAccent,
    backgroundColor: colors.surfaceHighlight,
  },
  matchChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  matchChipTextSelected: {
    color: colors.primaryAccent,
    fontWeight: '700',
  },
  searchRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  searchInput: {
    flex: 1,
    minWidth: 260,
  },
  tournLink: {
    paddingVertical: spacing.xs,
  },
  tournLinkText: {
    ...typography.captionBold,
    color: colors.primaryAccent,
    fontSize: 12,
  },
});
