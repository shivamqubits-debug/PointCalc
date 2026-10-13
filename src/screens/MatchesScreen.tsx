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
import { PrimaryButton } from '../components/common/PrimaryButton';
import { SearchInput } from '../components/common/SearchInput';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { MatchCard } from '../components/matches/MatchCard';
import { MatchFormModal } from '../components/matches/MatchFormModal';
import { MatchResultModal } from '../components/matches/MatchResultModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { Match, MatchStatus } from '../models/types';

export const MatchesScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const {
    matches,
    tournaments,
    teams,
    createMatch,
    updateMatch,
    deleteMatch,
    saveMatchResults,
    getTournament,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTournamentFilter, setSelectedTournamentFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | MatchStatus>('All');

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [resultsMatch, setResultsMatch] = useState<Match | null>(null);
  const [deletingMatchId, setDeletingMatchId] = useState<string | null>(null);

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      // Tournament filter
      if (selectedTournamentFilter !== 'All' && m.tournamentId !== selectedTournamentFilter) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'All' && m.status !== statusFilter) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const tourn = getTournament(m.tournamentId);
        const matchTourn = tourn?.name.toLowerCase().includes(q);
        const matchNum = `match ${m.matchNumber}`.includes(q) || `#${m.matchNumber}`.includes(q);
        if (!matchTourn && !matchNum) return false;
      }
      return true;
    });
  }, [matches, selectedTournamentFilter, statusFilter, searchQuery, getTournament]);

  const activeTournForResults = resultsMatch ? getTournament(resultsMatch.tournamentId) : null;

  return (
    <View style={styles.container}>
      <AppHeader
        title="Matches"
        subtitle="Manage match rounds, schedules, and enter official results"
        isMobile={isMobile}
        rightAction={
          <PrimaryButton
            label="+ Create Match"
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
        {/* Filter Toolbar */}
        <View style={styles.toolbarCard}>
          <SearchInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by match # or tournament title..."
            style={styles.searchInput}
          />

          {/* Tournament Filter Pills */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>TOURNAMENT:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterChips}
            >
              <Pressable
                onPress={() => setSelectedTournamentFilter('All')}
                style={[
                  styles.filterChip,
                  selectedTournamentFilter === 'All' && styles.filterChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedTournamentFilter === 'All' && styles.filterChipTextSelected,
                  ]}
                >
                  All Competitions
                </Text>
              </Pressable>
              {tournaments.map((t) => {
                const isSelected = selectedTournamentFilter === t.id;
                return (
                  <Pressable
                    key={t.id}
                    onPress={() => setSelectedTournamentFilter(t.id)}
                    style={[styles.filterChip, isSelected && styles.filterChipSelected]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        isSelected && styles.filterChipTextSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {t.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Status Filter */}
          <View style={styles.statusRow}>
            <Text style={styles.filterLabel}>STATUS:</Text>
            <SegmentedControl
              options={[
                { label: 'All', value: 'All' },
                { label: 'Scheduled', value: 'Scheduled' },
                { label: 'In Progress', value: 'In Progress' },
                { label: 'Completed', value: 'Completed' },
              ]}
              selectedValue={statusFilter}
              onSelect={setStatusFilter}
            />
          </View>
        </View>

        {/* Match List */}
        {filteredMatches.length === 0 ? (
          <EmptyState
            title="No matches found"
            description="No matches match the selected criteria or tournament filters."
            iconName="game-controller-outline"
            actionLabel="+ Create Match"
            onAction={() => setCreateModalVisible(true)}
          />
        ) : (
          <View style={styles.matchGrid}>
            {filteredMatches.map((m) => {
              const tourn = getTournament(m.tournamentId);
              return (
                <MatchCard
                  key={m.id}
                  match={m}
                  tournament={tourn}
                  teams={teams}
                  onEnterResults={() => setResultsMatch(m)}
                  onEdit={() => setEditingMatch(m)}
                  onDelete={() => setDeletingMatchId(m.id)}
                />
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Match Form Modal */}
      <MatchFormModal
        visible={createModalVisible || !!editingMatch}
        tournaments={tournaments}
        allTeams={teams}
        initialData={editingMatch}
        onClose={() => {
          setCreateModalVisible(false);
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

      {/* Match Results Entry Modal */}
      {resultsMatch && activeTournForResults && (
        <MatchResultModal
          visible={!!resultsMatch}
          match={resultsMatch}
          tournament={activeTournForResults}
          teams={teams}
          onClose={() => setResultsMatch(null)}
          onSubmit={(results) => {
            saveMatchResults(resultsMatch.id, results);
            setResultsMatch(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        visible={!!deletingMatchId}
        title="Delete Match Round?"
        message="Are you sure you want to delete this match? Any recorded scores will be subtracted from leaderboards."
        confirmLabel="Delete Match"
        isDestructive
        onCancel={() => setDeletingMatchId(null)}
        onConfirm={() => {
          if (deletingMatchId) {
            deleteMatch(deletingMatchId);
            setDeletingMatchId(null);
          }
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
  toolbarCard: {
    backgroundColor: colors.surfacePrimary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  searchInput: {
    marginBottom: spacing.md,
  },
  filterSection: {
    marginBottom: spacing.md,
  },
  filterLabel: {
    ...typography.captionBold,
    color: colors.textMuted,
    fontSize: 10,
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  filterChips: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipSelected: {
    backgroundColor: colors.primaryAccentMuted,
    borderColor: colors.primaryAccent,
  },
  filterChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  filterChipTextSelected: {
    color: colors.primaryAccent,
    fontWeight: '700',
  },
  statusRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  matchGrid: {
    gap: spacing.sm,
  },
});
