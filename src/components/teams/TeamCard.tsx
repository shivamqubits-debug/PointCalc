import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Team } from '../../models/types';
import { Ionicons } from '@expo/vector-icons';

interface TeamCardProps {
  team: Team;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onRemoveFromTournament?: () => void;
  tournamentsCount?: number;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  onPress,
  onEdit,
  onDelete,
  onRemoveFromTournament,
  tournamentsCount,
}) => {
  const accent = team.logoColor || colors.primaryAccent;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          borderColor: pressed ? accent : colors.border,
          backgroundColor: pressed ? colors.surfaceElevated : colors.surfacePrimary,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Team ${team.name}`}
    >
      <View style={styles.header}>
        {/* Initials Avatar */}
        <View style={[styles.avatar, { borderColor: accent, backgroundColor: `${accent}20` }]}>
          <Text style={[styles.avatarText, { color: accent }]}>
            {team.tag.slice(0, 3)}
          </Text>
        </View>

        <View style={styles.titleInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {team.name}
            </Text>
            <View style={[styles.tagBadge, { backgroundColor: `${accent}1A` }]}>
              <Text style={[styles.tagText, { color: accent }]}>
                {team.tag}
              </Text>
            </View>
          </View>
          <Text style={styles.rosterCount}>
            {team.players.length} Active Players
            {tournamentsCount !== undefined && ` • ${tournamentsCount} Tournaments`}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionButtons}>
          {onEdit && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              style={styles.iconBtn}
              accessibilityLabel="Edit squad"
            >
              <Ionicons name="pencil-outline" size={15} color={colors.textSecondary} />
            </Pressable>
          )}
          {onRemoveFromTournament && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onRemoveFromTournament();
              }}
              style={styles.iconBtn}
              accessibilityLabel="Remove squad from tournament"
            >
              <Ionicons name="close-circle-outline" size={16} color={colors.warning} />
            </Pressable>
          )}
          {onDelete && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              style={styles.iconBtn}
              accessibilityLabel="Delete squad"
            >
              <Ionicons name="trash-outline" size={15} color={colors.error} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Roster Chips */}
      {team.players.length > 0 && (
        <View style={styles.rosterContainer}>
          {team.players.slice(0, 4).map((p) => (
            <View key={p.id} style={styles.playerChip}>
              <Text style={styles.playerIgn} numberOfLines={1}>
                {p.ign}
              </Text>
              {p.role && <Text style={styles.playerRole}>{p.role}</Text>}
            </View>
          ))}
          {team.players.length > 4 && (
            <View style={styles.playerChipMore}>
              <Text style={styles.playerMoreText}>+{team.players.length - 4}</Text>
            </View>
          )}
        </View>
      )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.tabularNum,
    fontWeight: '800',
    fontSize: 14,
  },
  titleInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    marginBottom: 2,
  },
  name: {
    ...typography.h3,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  tagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.xs,
  },
  tagText: {
    ...typography.captionBold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  rosterCount: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconBtn: {
    padding: 6,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceElevated,
  },
  rosterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm + 2,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  playerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.xs,
    gap: 4,
  },
  playerIgn: {
    ...typography.captionBold,
    color: colors.textSecondary,
    fontSize: 11,
  },
  playerRole: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 9,
  },
  playerChipMore: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 3,
    borderRadius: radii.xs,
  },
  playerMoreText: {
    ...typography.captionBold,
    color: colors.primaryAccent,
    fontSize: 10,
  },
});
