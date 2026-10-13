import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Match, Tournament, Team } from '../../models/types';
import { StatusBadge } from '../common/StatusBadge';
import { Ionicons } from '@expo/vector-icons';

interface MatchCardProps {
  match: Match;
  tournament?: Tournament;
  teams?: Team[];
  onPress?: () => void;
  onEnterResults: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  tournament,
  teams = [],
  onPress,
  onEnterResults,
  onEdit,
  onDelete,
}) => {
  // Find winner if match has results
  const winnerRow = match.results.find((r) => r.placement === 1);
  const winnerTeam = winnerRow ? teams.find((t) => t.id === winnerRow.teamId) : null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          borderColor: pressed ? colors.primaryAccent : colors.border,
          backgroundColor: pressed ? colors.surfaceElevated : colors.surfacePrimary,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Match ${match.matchNumber}`}
    >
      <View style={styles.topRow}>
        <View style={styles.leftMeta}>
          <View style={styles.matchBadge}>
            <Text style={styles.matchBadgeText}>MATCH #{match.matchNumber}</Text>
          </View>
          <StatusBadge status={match.status} />
        </View>

        {/* Action icons */}
        <View style={styles.actionGroup}>
          {onEdit && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              style={styles.iconBtn}
              accessibilityLabel="Edit match"
            >
              <Ionicons name="pencil-outline" size={15} color={colors.textSecondary} />
            </Pressable>
          )}
          {onDelete && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              style={styles.iconBtn}
              accessibilityLabel="Delete match"
            >
              <Ionicons name="trash-outline" size={15} color={colors.error} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Tournament Title if available */}
      {tournament && (
        <Text style={styles.tournamentTitle} numberOfLines={1}>
          {tournament.name} • {tournament.game}
        </Text>
      )}

      {/* Center Details */}
      <View style={styles.centerRow}>
        <View style={styles.metaChip}>
          <Ionicons name="shield-outline" size={14} color={colors.textMuted} />
          <Text style={styles.metaText}>
            {match.participatingTeamIds.length} Squads
          </Text>
        </View>

        {match.scheduledDate && (
          <View style={styles.metaChip}>
            <Ionicons name="time-outline" size={14} color={colors.textMuted} />
            <Text style={styles.metaText}>{match.scheduledDate}</Text>
          </View>
        )}
      </View>

      {/* Winner Highlight banner if results entered */}
      {winnerTeam && (
        <View style={styles.winnerBanner}>
          <Ionicons name="trophy" size={15} color={colors.rankGold} />
          <Text style={styles.winnerText}>
            WWCD Winner: <Text style={styles.winnerName}>{winnerTeam.name} [{winnerTeam.tag}]</Text> ({winnerRow?.eliminations} Kills)
          </Text>
        </View>
      )}

      {/* Bottom Button Row */}
      <View style={styles.bottomRow}>
        <View style={styles.statusWrap}>
          <View
            style={[
              styles.statusCircle,
              {
                backgroundColor: match.resultsEntered
                  ? colors.success
                  : colors.warning,
              },
            ]}
          />
          <Text style={styles.resultStatusText}>
            {match.resultsEntered ? 'Results Recorded' : 'Results Pending'}
          </Text>
        </View>

        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onEnterResults();
          }}
          style={({ pressed }) => [
            styles.enterBtn,
            match.resultsEntered ? styles.enterBtnOutline : styles.enterBtnPrimary,
            { opacity: pressed ? 0.8 : 1 },
          ]}
          accessibilityRole="button"
        >
          <Ionicons
            name={match.resultsEntered ? 'pencil-outline' : 'add-circle-outline'}
            size={14}
            color={match.resultsEntered ? colors.textPrimary : colors.textInverse}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.enterBtnText,
              match.resultsEntered ? styles.enterBtnTextOutline : styles.enterBtnTextPrimary,
            ]}
          >
            {match.resultsEntered ? 'Edit Results' : 'Enter Results'}
          </Text>
        </Pressable>
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  leftMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  matchBadge: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  matchBadgeText: {
    ...typography.captionBold,
    color: colors.primaryAccent,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconBtn: {
    padding: 6,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceElevated,
  },
  tournamentTitle: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.xs + 2,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 12,
  },
  winnerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    marginVertical: spacing.xs + 2,
    gap: 6,
  },
  winnerText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontSize: 11,
  },
  winnerName: {
    color: colors.rankGold,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  statusWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusCircle: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  resultStatusText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  enterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.sm,
  },
  enterBtnPrimary: {
    backgroundColor: colors.primaryAccent,
  },
  enterBtnOutline: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  enterBtnText: {
    ...typography.captionBold,
    fontSize: 11,
  },
  enterBtnTextPrimary: {
    color: colors.textInverse,
  },
  enterBtnTextOutline: {
    color: colors.textPrimary,
  },
});
