import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { LeaderboardEntry } from '../../models/types';
import { Ionicons } from '@expo/vector-icons';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  density?: 'compact' | 'comfortable';
  onSelectTeam?: (teamId: string) => void;
}

type SortField = 'rank' | 'totalPoints' | 'eliminations' | 'placementPoints' | 'wins';

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  entries,
  density = 'comfortable',
  onSelectTeam,
}) => {
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const isCompact = density === 'compact';

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'rank');
    }
  };

  const sortedEntries = [...entries].sort((a, b) => {
    let diff = 0;
    if (sortField === 'rank') diff = a.rank - b.rank;
    else if (sortField === 'totalPoints') diff = b.totalPoints - a.totalPoints;
    else if (sortField === 'eliminations') diff = b.eliminations - a.eliminations;
    else if (sortField === 'placementPoints') diff = b.placementPoints - a.placementPoints;
    else if (sortField === 'wins') diff = b.wins - a.wins;

    return sortAsc ? diff : -diff;
  });

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.table}>
        {/* Table Header */}
        <View style={[styles.row, styles.headerRow, isCompact && styles.headerRowCompact]}>
          <Pressable onPress={() => handleSort('rank')} style={[styles.cell, styles.colRank]}>
            <Text style={styles.th}>#</Text>
            {sortField === 'rank' && (
              <Ionicons
                name={sortAsc ? 'chevron-up' : 'chevron-down'}
                size={12}
                color={colors.primaryAccent}
              />
            )}
          </Pressable>

          <View style={[styles.cell, styles.colTeam]}>
            <Text style={styles.th}>SQUAD / TEAM</Text>
          </View>

          <View style={[styles.cell, styles.colMatches]}>
            <Text style={styles.th}>MATCHES</Text>
          </View>

          <Pressable
            onPress={() => handleSort('wins')}
            style={[styles.cell, styles.colWins]}
          >
            <Text style={styles.th}>WWCD</Text>
            {sortField === 'wins' && (
              <Ionicons
                name={sortAsc ? 'chevron-up' : 'chevron-down'}
                size={12}
                color={colors.primaryAccent}
              />
            )}
          </Pressable>

          <Pressable
            onPress={() => handleSort('placementPoints')}
            style={[styles.cell, styles.colPlacePts]}
          >
            <Text style={styles.th}>PLACE PTS</Text>
            {sortField === 'placementPoints' && (
              <Ionicons
                name={sortAsc ? 'chevron-up' : 'chevron-down'}
                size={12}
                color={colors.primaryAccent}
              />
            )}
          </Pressable>

          <Pressable
            onPress={() => handleSort('eliminations')}
            style={[styles.cell, styles.colElims]}
          >
            <Text style={styles.th}>KILLS</Text>
            {sortField === 'eliminations' && (
              <Ionicons
                name={sortAsc ? 'chevron-up' : 'chevron-down'}
                size={12}
                color={colors.primaryAccent}
              />
            )}
          </Pressable>

          <Pressable
            onPress={() => handleSort('totalPoints')}
            style={[styles.cell, styles.colTotalPts]}
          >
            <Text style={[styles.th, styles.thHighlight]}>TOTAL PTS</Text>
            {sortField === 'totalPoints' && (
              <Ionicons
                name={sortAsc ? 'chevron-up' : 'chevron-down'}
                size={12}
                color={colors.primaryAccent}
              />
            )}
          </Pressable>
        </View>

        {/* Table Body */}
        {sortedEntries.map((entry, index) => {
          const isRank1 = entry.rank === 1;
          const isRank2 = entry.rank === 2;
          const isRank3 = entry.rank === 3;

          let rankBadgeBg = colors.surfaceElevated;
          let rankColor = colors.textSecondary;
          if (isRank1) {
            rankBadgeBg = 'rgba(255, 215, 0, 0.18)';
            rankColor = colors.rankGold;
          } else if (isRank2) {
            rankBadgeBg = 'rgba(192, 192, 192, 0.18)';
            rankColor = colors.rankSilver;
          } else if (isRank3) {
            rankBadgeBg = 'rgba(205, 127, 50, 0.18)';
            rankColor = colors.rankBronze;
          }

          return (
            <Pressable
              key={entry.teamId}
              onPress={() => onSelectTeam && onSelectTeam(entry.teamId)}
              style={({ pressed }) => [
                styles.row,
                isCompact ? styles.rowCompact : styles.rowComfortable,
                index % 2 === 1 && styles.rowAlt,
                isRank1 && styles.rowRank1,
                pressed && { backgroundColor: colors.surfaceHighlight },
              ]}
            >
              {/* Rank Column */}
              <View style={[styles.cell, styles.colRank]}>
                <View style={[styles.rankBadge, { backgroundColor: rankBadgeBg }]}>
                  <Text style={[styles.rankText, { color: rankColor }]}>
                    {entry.rank}
                  </Text>
                </View>
              </View>

              {/* Squad Name & Tag */}
              <View style={[styles.cell, styles.colTeam]}>
                <View
                  style={[
                    styles.teamColorBar,
                    { backgroundColor: entry.logoColor || colors.primaryAccent },
                  ]}
                />
                <View>
                  <Text style={styles.teamName} numberOfLines={1}>
                    {entry.teamName}
                  </Text>
                  <Text style={styles.teamTag}>{entry.teamTag}</Text>
                </View>
              </View>

              {/* Matches Played */}
              <View style={[styles.cell, styles.colMatches]}>
                <Text style={styles.tdNum}>{entry.matchesPlayed}</Text>
              </View>

              {/* WWCD Wins */}
              <View style={[styles.cell, styles.colWins]}>
                <Text style={[styles.tdNum, entry.wins > 0 && styles.winText]}>
                  {entry.wins}
                </Text>
              </View>

              {/* Placement Points */}
              <View style={[styles.cell, styles.colPlacePts]}>
                <Text style={styles.tdNum}>{entry.placementPoints}</Text>
              </View>

              {/* Eliminations */}
              <View style={[styles.cell, styles.colElims]}>
                <Text style={styles.tdNum}>{entry.eliminations}</Text>
              </View>

              {/* Total Points */}
              <View style={[styles.cell, styles.colTotalPts]}>
                <Text
                  style={[
                    styles.totalPtsText,
                    isRank1 && { color: colors.rankGold },
                  ]}
                >
                  {entry.totalPoints}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  table: {
    minWidth: 720,
    backgroundColor: colors.surfacePrimary,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerRow: {
    backgroundColor: colors.surfaceElevated,
    paddingVertical: spacing.sm + 2,
    borderBottomColor: colors.borderLight,
  },
  headerRowCompact: {
    paddingVertical: spacing.xs + 2,
  },
  rowComfortable: {
    paddingVertical: spacing.sm + 2,
  },
  rowCompact: {
    paddingVertical: spacing.xs + 2,
  },
  rowAlt: {
    backgroundColor: 'rgba(25, 35, 51, 0.4)',
  },
  rowRank1: {
    borderLeftWidth: 3,
    borderLeftColor: colors.rankGold,
  },
  cell: {
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  colRank: {
    width: 60,
    justifyContent: 'center',
  },
  colTeam: {
    width: 200,
  },
  colMatches: {
    width: 80,
    justifyContent: 'center',
  },
  colWins: {
    width: 80,
    justifyContent: 'center',
  },
  colPlacePts: {
    width: 90,
    justifyContent: 'center',
  },
  colElims: {
    width: 80,
    justifyContent: 'center',
  },
  colTotalPts: {
    width: 100,
    justifyContent: 'flex-end',
    paddingRight: spacing.md,
  },
  th: {
    ...typography.label,
    color: colors.textSecondary,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  thHighlight: {
    color: colors.primaryAccent,
  },
  rankBadge: {
    width: 26,
    height: 26,
    borderRadius: radii.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    ...typography.tabularNum,
    fontSize: 12,
  },
  teamColorBar: {
    width: 3,
    height: 24,
    borderRadius: 2,
    marginRight: spacing.sm,
  },
  teamName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 13,
  },
  teamTag: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
  },
  tdNum: {
    ...typography.tabularNum,
    color: colors.textPrimary,
    fontSize: 13,
    textAlign: 'center',
  },
  winText: {
    color: colors.warning,
    fontWeight: '800',
  },
  totalPtsText: {
    ...typography.tabularNum,
    color: colors.primaryAccent,
    fontSize: 15,
    fontWeight: '800',
  },
});
