import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Match, Tournament, Team, MatchResultRow } from '../../models/types';
import { ModalContainer } from '../common/ModalContainer';
import { PrimaryButton } from '../common/PrimaryButton';
import { SecondaryButton } from '../common/SecondaryButton';
import {
  validateMatchResults,
  calculateMatchRowPoints,
} from '../../scoring/scoringEngine';
import { Ionicons } from '@expo/vector-icons';

interface MatchResultModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (results: MatchResultRow[]) => void;
  match: Match;
  tournament: Tournament;
  teams: Team[];
}

interface RowState {
  teamId: string;
  placement: string;
  eliminations: string;
}

export const MatchResultModal: React.FC<MatchResultModalProps> = ({
  visible,
  onClose,
  onSubmit,
  match,
  tournament,
  teams,
}) => {
  const [rows, setRows] = useState<RowState[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Filter participating teams
  const participatingTeams = teams.filter((t) =>
    match.participatingTeamIds.includes(t.id)
  );

  useEffect(() => {
    if (visible) {
      if (match.results && match.results.length > 0) {
        // Initialize from existing results
        const existingRows: RowState[] = match.results.map((r) => ({
          teamId: r.teamId,
          placement: String(r.placement),
          eliminations: String(r.eliminations),
        }));
        setRows(existingRows);
      } else {
        // Initialize default empty rows for all participating teams
        const defaultRows: RowState[] = participatingTeams.map((t, idx) => ({
          teamId: t.id,
          placement: String(idx + 1),
          eliminations: '0',
        }));
        setRows(defaultRows);
      }
      setValidationErrors([]);
    }
  }, [visible, match]);

  const updateRow = (index: number, field: 'placement' | 'eliminations', val: string) => {
    setRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
    setValidationErrors([]);
  };

  const fillQuickSequential = () => {
    setRows((prev) =>
      prev.map((r, i) => ({
        ...r,
        placement: String(i + 1),
      }))
    );
    setValidationErrors([]);
  };

  const handleSave = () => {
    // Parse into MatchResultRow
    const parsedResults: MatchResultRow[] = rows.map((r) => ({
      teamId: r.teamId,
      placement: parseInt(r.placement, 10) || 0,
      eliminations: parseInt(r.eliminations, 10) || 0,
    }));

    const validation = validateMatchResults(
      parsedResults,
      match.participatingTeamIds,
      tournament.scoringRule.allTeamsRequired
    );

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    onSubmit(parsedResults);
    onClose();
  };

  return (
    <ModalContainer
      visible={visible}
      onClose={onClose}
      title={`Match #${match.matchNumber} Results Entry`}
      subtitle={`${tournament.name} • Point calculation will update leaderboards immediately`}
      maxWidth={680}
    >
      {/* Quick Helper Bar */}
      <View style={styles.topToolbar}>
        <View style={styles.ruleBadge}>
          <Ionicons name="information-circle-outline" size={16} color={colors.secondaryAccent} />
          <Text style={styles.ruleBadgeText}>
            Kill pts: {tournament.scoringRule.pointsPerElimination}pt • 1st: {tournament.scoringRule.placementPoints[1] || 10}pts
          </Text>
        </View>

        <Pressable onPress={fillQuickSequential} style={styles.autoFillBtn}>
          <Text style={styles.autoFillText}>Auto-Rank 1..N</Text>
        </Pressable>
      </View>

      {/* Validation Errors Notice */}
      {validationErrors.length > 0 && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={18} color={colors.error} />
          <View style={{ flex: 1 }}>
            {validationErrors.map((err, i) => (
              <Text key={i} style={styles.errorItem}>
                • {err}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Results Entry Table */}
      <View style={styles.tableHeader}>
        <Text style={[styles.th, styles.colTeam]}>SQUAD</Text>
        <Text style={[styles.th, styles.colPlace]}>RANK #</Text>
        <Text style={[styles.th, styles.colElims]}>KILLS</Text>
        <Text style={[styles.th, styles.colPts]}>EST. PTS</Text>
      </View>

      <ScrollView style={styles.tableBody} showsVerticalScrollIndicator={false}>
        {rows.map((row, index) => {
          const team = teams.find((t) => t.id === row.teamId);
          const placementNum = parseInt(row.placement, 10) || 0;
          const elimsNum = parseInt(row.eliminations, 10) || 0;
          const points = calculateMatchRowPoints(
            { teamId: row.teamId, placement: placementNum, eliminations: elimsNum },
            tournament.scoringRule
          );

          const isTop3 = placementNum >= 1 && placementNum <= 3;

          return (
            <View
              key={row.teamId}
              style={[
                styles.tableRow,
                isTop3 && styles.tableRowTop,
                index % 2 === 1 && styles.tableRowAlt,
              ]}
            >
              {/* Team Name & Tag */}
              <View style={[styles.cell, styles.colTeam]}>
                <View
                  style={[
                    styles.tagIndicator,
                    { backgroundColor: team?.logoColor || colors.primaryAccent },
                  ]}
                />
                <View style={styles.teamTextWrap}>
                  <Text style={styles.teamName} numberOfLines={1}>
                    {team?.name || row.teamId}
                  </Text>
                  <Text style={styles.teamTag}>{team?.tag || 'TEAM'}</Text>
                </View>
              </View>

              {/* Placement Input */}
              <View style={[styles.cell, styles.colPlace]}>
                <TextInput
                  value={row.placement}
                  onChangeText={(val) => updateRow(index, 'placement', val)}
                  keyboardType="numeric"
                  placeholder="Rank"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.numInput, placementNum === 1 && styles.winnerInput]}
                />
              </View>

              {/* Eliminations Input */}
              <View style={[styles.cell, styles.colElims]}>
                <TextInput
                  value={row.eliminations}
                  onChangeText={(val) => updateRow(index, 'eliminations', val)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  style={styles.numInput}
                />
              </View>

              {/* Calculated Total Points Preview */}
              <View style={[styles.cell, styles.colPts]}>
                <Text
                  style={[
                    styles.pointsTotal,
                    placementNum === 1 && styles.winnerPoints,
                  ]}
                >
                  {points.totalPoints}{' '}
                  <Text style={styles.ptsBreakdown}>
                    ({points.placementPoints}p + {points.eliminationPoints}k)
                  </Text>
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <SecondaryButton label="Cancel" onPress={onClose} style={styles.cancelBtn} />
        <PrimaryButton
          label="Save & Recalculate"
          onPress={handleSave}
          style={styles.saveBtn}
        />
      </View>
    </ModalContainer>
  );
};

const styles = StyleSheet.create({
  topToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  ruleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ruleBadgeText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  autoFillBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.xs,
    backgroundColor: colors.surfaceHighlight,
  },
  autoFillText: {
    ...typography.captionBold,
    color: colors.primaryAccent,
    fontSize: 10,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.errorMuted,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  errorItem: {
    ...typography.caption,
    color: colors.error,
    fontSize: 11,
    lineHeight: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    paddingVertical: spacing.xs + 3,
    paddingHorizontal: spacing.sm,
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  th: {
    ...typography.label,
    color: colors.textSecondary,
    fontSize: 10,
  },
  tableBody: {
    maxHeight: 380,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableRowAlt: {
    backgroundColor: 'rgba(25, 35, 51, 0.4)',
  },
  tableRowTop: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primaryAccent,
  },
  cell: {
    justifyContent: 'center',
  },
  colTeam: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  colPlace: {
    flex: 1.5,
    alignItems: 'center',
  },
  colElims: {
    flex: 1.5,
    alignItems: 'center',
  },
  colPts: {
    flex: 2.2,
    alignItems: 'flex-end',
    paddingRight: spacing.xs,
  },
  tagIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
    marginRight: spacing.sm,
  },
  teamTextWrap: {
    flex: 1,
  },
  teamName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 12,
  },
  teamTag: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
  },
  numInput: {
    width: 52,
    height: 36,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    color: colors.textPrimary,
    textAlign: 'center',
    ...typography.tabularNum,
    fontSize: 13,
  },
  winnerInput: {
    borderColor: colors.rankGold,
    color: colors.rankGold,
    fontWeight: '800',
  },
  pointsTotal: {
    ...typography.tabularNum,
    color: colors.primaryAccent,
    fontSize: 13,
    fontWeight: '700',
  },
  winnerPoints: {
    color: colors.rankGold,
    fontWeight: '800',
  },
  ptsBreakdown: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  cancelBtn: {
    minWidth: 90,
  },
  saveBtn: {
    minWidth: 160,
  },
});
