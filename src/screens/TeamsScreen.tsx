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
import { TeamCard } from '../components/teams/TeamCard';
import { TeamFormModal } from '../components/teams/TeamFormModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { Team } from '../models/types';

export const TeamsScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const { teams, tournaments, createTeam, updateTeam, deleteTeam } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'players' | 'tournaments'>('name');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);

  // Compute how many tournaments each team is in
  const teamTournCountMap = useMemo(() => {
    const map = new Map<string, number>();
    teams.forEach((t) => map.set(t.id, 0));
    tournaments.forEach((tourn) => {
      tourn.teamIds.forEach((tId) => {
        map.set(tId, (map.get(tId) || 0) + 1);
      });
    });
    return map;
  }, [teams, tournaments]);

  const filteredTeams = useMemo(() => {
    return teams
      .filter((t) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const matchName = t.name.toLowerCase().includes(q);
        const matchTag = t.tag.toLowerCase().includes(q);
        const matchPlayer = t.players.some((p) => p.ign.toLowerCase().includes(q));
        return matchName || matchTag || matchPlayer;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'players') return b.players.length - a.players.length;
        if (sortBy === 'tournaments') {
          return (teamTournCountMap.get(b.id) || 0) - (teamTournCountMap.get(a.id) || 0);
        }
        return 0;
      });
  }, [teams, searchQuery, sortBy, teamTournCountMap]);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Squad Directory"
        subtitle="Manage competitive rosters and team organizations"
        isMobile={isMobile}
        rightAction={
          <PrimaryButton
            label="+ Create Squad"
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
        {/* Search & Sort Toolbar */}
        <View style={styles.toolbarCard}>
          <SearchInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search squad name, team tag, or player IGN..."
            style={styles.searchInput}
          />

          <View style={styles.toolBottomRow}>
            <Text style={styles.countText}>
              Showing <Text style={styles.countHighlight}>{filteredTeams.length}</Text> of{' '}
              {teams.length} squads
            </Text>

            <View style={styles.sortGroup}>
              <Text style={styles.sortLabel}>SORT BY:</Text>
              {(
                [
                  { label: 'Name', value: 'name' },
                  { label: 'Roster Size', value: 'players' },
                  { label: 'Tourneys', value: 'tournaments' },
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
        </View>

        {/* Team Cards Grid */}
        {filteredTeams.length === 0 ? (
          <EmptyState
            title="No squads match your search"
            description="Try searching with a different term or register a new team."
            iconName="shield-outline"
            actionLabel="+ Register Squad"
            onAction={() => setCreateModalVisible(true)}
          />
        ) : (
          <View style={styles.cardGrid}>
            {filteredTeams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                tournamentsCount={teamTournCountMap.get(team.id) || 0}
                onEdit={() => setEditingTeam(team)}
                onDelete={() => setDeletingTeamId(team.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Create / Edit Squad Modal */}
      <TeamFormModal
        visible={createModalVisible || !!editingTeam}
        initialData={editingTeam}
        onClose={() => {
          setCreateModalVisible(false);
          setEditingTeam(null);
        }}
        onSubmit={(data) => {
          if (editingTeam) {
            updateTeam(editingTeam.id, data);
            setEditingTeam(null);
          } else {
            createTeam(data);
          }
        }}
      />

      {/* Delete Squad Confirmation */}
      <ConfirmDialog
        visible={!!deletingTeamId}
        title="Delete Squad Organization?"
        message="Are you sure you want to delete this squad from your workspace? It will also be removed from any active tournament rosters."
        confirmLabel="Delete Squad"
        isDestructive
        onCancel={() => setDeletingTeamId(null)}
        onConfirm={() => {
          if (deletingTeamId) {
            deleteTeam(deletingTeamId);
            setDeletingTeamId(null);
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
  toolBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  countText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  countHighlight: {
    color: colors.primaryAccent,
    fontWeight: '700',
  },
  sortGroup: {
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
  cardGrid: {
    gap: spacing.sm,
  },
});
