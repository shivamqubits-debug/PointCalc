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
import { TournamentCard } from '../components/tournaments/TournamentCard';
import { TournamentFormModal } from '../components/tournaments/TournamentFormModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { Tournament, GameType, TournamentStatus } from '../models/types';
import { Ionicons } from '@expo/vector-icons';

type SortOption = 'recent' | 'name' | 'teams' | 'matches';

export const TournamentsScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const {
    tournaments,
    createTournament,
    updateTournament,
    duplicateTournament,
    deleteTournament,
    navigateTo,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | TournamentStatus>('All');
  const [gameFilter, setGameFilter] = useState<'All Games' | GameType>('All Games');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [deletingTournamentId, setDeletingTournamentId] = useState<string | null>(null);

  const isFilterActive =
    searchQuery.trim().length > 0 || statusFilter !== 'All' || gameFilter !== 'All Games';

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setGameFilter('All Games');
  };

  const filteredTournaments = useMemo(() => {
    return tournaments
      .filter((t) => {
        // Status filter
        if (statusFilter !== 'All' && t.status !== statusFilter) return false;
        // Game filter
        if (gameFilter !== 'All Games' && t.game !== gameFilter) return false;
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = t.name.toLowerCase().includes(q);
          const matchDesc = t.description?.toLowerCase().includes(q);
          const matchGame = t.game.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchGame) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'recent') {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'teams') {
          return b.teamIds.length - a.teamIds.length;
        }
        if (sortBy === 'matches') {
          return (b.plannedMatchesCount || 0) - (a.plannedMatchesCount || 0);
        }
        return 0;
      });
  }, [tournaments, searchQuery, statusFilter, gameFilter, sortBy]);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Tournaments"
        subtitle="Create, organize, and track your competitions"
        isMobile={isMobile}
        rightAction={
          <PrimaryButton
            label="+ New tournament"
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
        {/* Search & Filter Toolbar */}
        <View style={styles.toolbarCard}>
          <SearchInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by tournament name, rules, or game..."
            style={styles.searchInput}
          />

          {/* Status Filter */}
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>STATUS:</Text>
            <SegmentedControl
              options={[
                { label: 'All', value: 'All' },
                { label: 'Live', value: 'Live' },
                { label: 'Upcoming', value: 'Upcoming' },
                { label: 'Completed', value: 'Completed' },
              ]}
              selectedValue={statusFilter}
              onSelect={setStatusFilter}
            />
          </View>

          {/* Game Filter & Sort Row */}
          <View style={styles.subFilterRow}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.gameChips}
            >
              {(['All Games', 'BGMI', 'PUBG Mobile', 'Free Fire', 'Other'] as const).map(
                (g) => {
                  const isSelected = gameFilter === g;
                  return (
                    <Pressable
                      key={g}
                      onPress={() => setGameFilter(g)}
                      style={[styles.gameChip, isSelected && styles.gameChipSelected]}
                    >
                      <Text
                        style={[styles.gameChipText, isSelected && styles.gameChipTextSelected]}
                      >
                        {g}
                      </Text>
                    </Pressable>
                  );
                }
              )}
            </ScrollView>

            {/* Sort Selector */}
            <View style={styles.sortContainer}>
              <Text style={styles.sortLabel}>SORT:</Text>
              {(
                [
                  { label: 'Recent', value: 'recent' },
                  { label: 'Name', value: 'name' },
                  { label: 'Teams', value: 'teams' },
                ] as const
              ).map((s) => {
                const isSelected = sortBy === s.value;
                return (
                  <Pressable
                    key={s.value}
                    onPress={() => setSortBy(s.value)}
                    style={[styles.sortBtn, isSelected && styles.sortBtnSelected]}
                  >
                    <Text
                      style={[styles.sortBtnText, isSelected && styles.sortBtnTextSelected]}
                    >
                      {s.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Results Summary Bar */}
          <View style={styles.summaryBar}>
            <Text style={styles.summaryText}>
              Showing <Text style={styles.summaryCount}>{filteredTournaments.length}</Text> of{' '}
              {tournaments.length} competitions
            </Text>
            {isFilterActive && (
              <Pressable onPress={clearFilters} style={styles.clearBtn}>
                <Ionicons name="close-circle-outline" size={14} color={colors.primaryAccent} />
                <Text style={styles.clearBtnText}>Reset filters</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Tournament Cards List */}
        {filteredTournaments.length === 0 ? (
          <EmptyState
            title="No matching tournaments found"
            description={
              isFilterActive
                ? 'Try adjusting your search query or removing active status and game filters.'
                : 'No tournaments have been registered in this workspace yet.'
            }
            iconName="search-outline"
            actionLabel={isFilterActive ? 'Clear all filters' : 'Create your first tournament'}
            onAction={isFilterActive ? clearFilters : () => setCreateModalVisible(true)}
          />
        ) : (
          <View style={styles.cardGrid}>
            {filteredTournaments.map((tourn) => (
              <TournamentCard
                key={tourn.id}
                tournament={tourn}
                onPress={() => navigateTo('TournamentDetails', { tournamentId: tourn.id })}
                onEdit={() => setEditingTournament(tourn)}
                onDuplicate={() => duplicateTournament(tourn.id)}
                onDelete={() => setDeletingTournamentId(tourn.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Create / Edit Modal */}
      <TournamentFormModal
        visible={createModalVisible || !!editingTournament}
        initialData={editingTournament}
        onClose={() => {
          setCreateModalVisible(false);
          setEditingTournament(null);
        }}
        onSubmit={(data) => {
          if (editingTournament) {
            updateTournament(editingTournament.id, data);
            setEditingTournament(null);
          } else {
            const created = createTournament(data);
            navigateTo('TournamentDetails', { tournamentId: created.id });
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        visible={!!deletingTournamentId}
        title="Delete Tournament?"
        message="Are you sure you want to delete this tournament? All associated match results will be removed from memory."
        confirmLabel="Delete"
        isDestructive
        onCancel={() => setDeletingTournamentId(null)}
        onConfirm={() => {
          if (deletingTournamentId) {
            deleteTournament(deletingTournamentId);
            setDeletingTournamentId(null);
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
  filterRow: {
    marginBottom: spacing.md,
  },
  filterLabel: {
    ...typography.captionBold,
    color: colors.textMuted,
    fontSize: 10,
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  subFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm + 2,
  },
  gameChips: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
  },
  gameChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
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
    fontSize: 11,
    fontWeight: '600',
  },
  gameChipTextSelected: {
    color: colors.primaryAccent,
    fontWeight: '700',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortLabel: {
    ...typography.captionBold,
    color: colors.textMuted,
    fontSize: 10,
    marginRight: 4,
  },
  sortBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.xs,
    backgroundColor: colors.surfaceElevated,
  },
  sortBtnSelected: {
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sortBtnText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  sortBtnTextSelected: {
    color: colors.primaryAccent,
    fontWeight: '700',
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  summaryText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  summaryCount: {
    color: colors.primaryAccent,
    fontWeight: '700',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearBtnText: {
    ...typography.captionBold,
    color: colors.primaryAccent,
    fontSize: 11,
  },
  cardGrid: {
    gap: spacing.sm,
  },
});
