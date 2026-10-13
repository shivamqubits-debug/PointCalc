import React from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Tournament } from '../../models/types';
import { StatusBadge } from '../common/StatusBadge';
import { Ionicons } from '@expo/vector-icons';

interface TournamentCardProps {
  tournament: Tournament;
  onPress: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

export const TournamentCard: React.FC<TournamentCardProps> = ({
  tournament,
  onPress,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  const top1Points = tournament.scoringRule?.placementPoints?.[1] || 10;
  const isLive = tournament.status === 'Live';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isLive && styles.cardLive,
        {
          borderColor: pressed ? colors.primaryAccent : isLive ? 'rgba(255, 112, 122, 0.4)' : colors.border,
          backgroundColor: pressed ? colors.surfaceElevated : colors.surfacePrimary,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Open ${tournament.name}`}
    >
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <View style={styles.gameAndStatus}>
          <StatusBadge game={tournament.game} />
          <StatusBadge status={tournament.status} />
          <View style={styles.ruleBadge}>
            <Text style={styles.ruleBadgeText}>{top1Points}-Pt WWCD</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionButtons}>
          {onEdit && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation?.();
                onEdit();
              }}
              style={styles.iconAction}
              accessibilityLabel="Edit tournament"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="pencil-outline" size={15} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
          {onDuplicate && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation?.();
                onDuplicate();
              }}
              style={styles.iconAction}
              accessibilityLabel="Duplicate tournament"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="copy-outline" size={15} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation?.();
                onDelete();
              }}
              style={styles.iconActionDelete}
              accessibilityLabel="Delete tournament"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="trash-outline" size={15} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Title & Description */}
      <View style={styles.titleArea}>
        <Text style={styles.title} numberOfLines={1}>
          {tournament.name}
        </Text>
        {tournament.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {tournament.description}
          </Text>
        ) : null}
      </View>

      {/* Bottom Metadata & Stats */}
      <View style={styles.footerRow}>
        <View style={styles.statChipsGroup}>
          <View style={styles.statChip}>
            <Ionicons name="people-outline" size={14} color={colors.secondaryAccent} />
            <Text style={styles.statText}>
              {tournament.teamIds.length} Teams
            </Text>
          </View>
          <View style={styles.statChip}>
            <Ionicons name="game-controller-outline" size={14} color={colors.warning} />
            <Text style={styles.statText}>
              {tournament.plannedMatchesCount ?? 0} Matches
            </Text>
          </View>
          {tournament.startDate && (
            <View style={styles.statChip}>
              <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
              <Text style={styles.statText}>{tournament.startDate}</Text>
            </View>
          )}
        </View>

        <View style={styles.openCta}>
          <Text style={styles.openCtaText}>Manage</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primaryAccent} />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardLive: {
    backgroundColor: 'rgba(255, 112, 122, 0.03)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  gameAndStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    flexWrap: 'wrap',
  },
  ruleBadge: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ruleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconAction: {
    padding: 6,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconActionDelete: {
    padding: 6,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(255, 112, 122, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 112, 122, 0.25)',
  },
  titleArea: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  statChipsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  openCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  openCtaText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryAccent,
  },
});
