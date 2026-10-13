import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Match, Tournament, Team, MatchStatus } from '../../models/types';
import { ModalContainer } from '../common/ModalContainer';
import { FormField } from '../common/FormField';
import { PrimaryButton } from '../common/PrimaryButton';
import { SecondaryButton } from '../common/SecondaryButton';
import { Ionicons } from '@expo/vector-icons';

interface MatchFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Match, 'id' | 'results' | 'resultsEntered' | 'updatedAt'>) => void;
  tournaments: Tournament[];
  allTeams: Team[];
  presetTournamentId?: string;
  initialData?: Match | null;
}

const STATUS_LIST: MatchStatus[] = ['Scheduled', 'In Progress', 'Completed'];

export const MatchFormModal: React.FC<MatchFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  tournaments,
  allTeams,
  presetTournamentId,
  initialData,
}) => {
  const [tournamentId, setTournamentId] = useState(presetTournamentId || tournaments[0]?.id || '');
  const [matchNumber, setMatchNumber] = useState('1');
  const [scheduledDate, setScheduledDate] = useState('');
  const [status, setStatus] = useState<MatchStatus>('Scheduled');
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentTournament = tournaments.find((t) => t.id === tournamentId);
  const eligibleTeams = allTeams.filter((tm) =>
    currentTournament ? currentTournament.teamIds.includes(tm.id) : true
  );

  useEffect(() => {
    if (initialData) {
      setTournamentId(initialData.tournamentId);
      setMatchNumber(String(initialData.matchNumber));
      setScheduledDate(initialData.scheduledDate || '');
      setStatus(initialData.status);
      setSelectedTeamIds(initialData.participatingTeamIds);
    } else {
      const activeTournId = presetTournamentId || tournaments[0]?.id || '';
      setTournamentId(activeTournId);
      const activeTourn = tournaments.find((t) => t.id === activeTournId);
      setMatchNumber('1');
      setScheduledDate(new Date().toISOString().slice(0, 16).replace('T', ' '));
      setStatus('Scheduled');
      setSelectedTeamIds(activeTourn ? activeTourn.teamIds : []);
    }
    setErrors({});
  }, [initialData, visible, presetTournamentId]);

  const toggleTeam = (teamId: string) => {
    setSelectedTeamIds((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    );
  };

  const selectAllEligible = () => {
    setSelectedTeamIds(eligibleTeams.map((t) => t.id));
  };

  const deselectAll = () => {
    setSelectedTeamIds([]);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!tournamentId) newErrors.tournamentId = 'Tournament selection is required.';
    const num = parseInt(matchNumber, 10);
    if (isNaN(num) || num < 1) newErrors.matchNumber = 'Valid positive match number is required.';
    if (selectedTeamIds.length < 2) {
      newErrors.teams = 'Select at least 2 participating squads for the match.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSubmit({
      tournamentId,
      matchNumber: parseInt(matchNumber, 10),
      scheduledDate: scheduledDate.trim() || undefined,
      status,
      participatingTeamIds: selectedTeamIds,
    });
    onClose();
  };

  return (
    <ModalContainer
      visible={visible}
      onClose={onClose}
      title={initialData ? 'Edit Match' : 'Create Match'}
      subtitle="Schedule match round and select participating lobby squads"
    >
      {/* Tournament Selector (if not locked by preset) */}
      {!presetTournamentId && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Tournament *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {tournaments.map((t) => {
              const isSelected = tournamentId === t.id;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => {
                    setTournamentId(t.id);
                    setSelectedTeamIds(t.teamIds);
                  }}
                  style={[styles.tournChip, isSelected && styles.tournChipSelected]}
                >
                  <Text style={[styles.tournChipText, isSelected && styles.tournChipTextSelected]}>
                    {t.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          {errors.tournamentId && <Text style={styles.errorText}>{errors.tournamentId}</Text>}
        </View>
      )}

      {/* Match Number & Scheduled Date */}
      <View style={styles.splitRow}>
        <FormField
          label="Match Number"
          required
          value={matchNumber}
          onChangeText={(val) => {
            setMatchNumber(val);
            if (errors.matchNumber) setErrors((prev) => ({ ...prev, matchNumber: '' }));
          }}
          placeholder="1"
          keyboardType="numeric"
          containerStyle={styles.halfField}
          error={errors.matchNumber}
        />
        <FormField
          label="Scheduled Date / Time"
          value={scheduledDate}
          onChangeText={setScheduledDate}
          placeholder="YYYY-MM-DD HH:MM"
          containerStyle={styles.halfField}
        />
      </View>

      {/* Match Status */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Match Status</Text>
        <View style={styles.chipRow}>
          {STATUS_LIST.map((st) => {
            const isSelected = status === st;
            return (
              <Pressable
                key={st}
                onPress={() => setStatus(st)}
                style={[styles.chip, isSelected && styles.chipSelected]}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {st}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Participating Squads Picker */}
      <View style={styles.section}>
        <View style={styles.teamsHeader}>
          <Text style={styles.sectionLabel}>
            Participating Squads ({selectedTeamIds.length} Selected) *
          </Text>
          <View style={styles.quickSelectRow}>
            <Pressable onPress={selectAllEligible}>
              <Text style={styles.quickSelectText}>Select All</Text>
            </Pressable>
            <Text style={styles.dotSeparator}>•</Text>
            <Pressable onPress={deselectAll}>
              <Text style={styles.quickSelectText}>Clear</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.teamGrid}>
          {eligibleTeams.map((tm) => {
            const isChecked = selectedTeamIds.includes(tm.id);
            return (
              <Pressable
                key={tm.id}
                onPress={() => toggleTeam(tm.id)}
                style={[styles.teamSelectChip, isChecked && styles.teamSelectChipChecked]}
              >
                <Ionicons
                  name={isChecked ? 'checkbox' : 'square-outline'}
                  size={16}
                  color={isChecked ? colors.primaryAccent : colors.textMuted}
                />
                <Text
                  style={[
                    styles.teamSelectText,
                    isChecked && styles.teamSelectTextChecked,
                  ]}
                  numberOfLines={1}
                >
                  {tm.name} [{tm.tag}]
                </Text>
              </Pressable>
            );
          })}
        </View>
        {errors.teams && <Text style={styles.errorText}>{errors.teams}</Text>}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <SecondaryButton label="Cancel" onPress={onClose} style={styles.cancelBtn} />
        <PrimaryButton
          label={initialData ? 'Save Changes' : 'Create Match'}
          onPress={handleSave}
          style={styles.saveBtn}
        />
      </View>
    </ModalContainer>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  splitRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfField: {
    flex: 1,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
  },
  chip: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.surfaceHighlight,
    borderColor: colors.primaryAccent,
  },
  chipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: colors.primaryAccent,
    fontWeight: '700',
  },
  tournChip: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.xs,
  },
  tournChipSelected: {
    backgroundColor: colors.surfaceHighlight,
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
  teamsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  quickSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  quickSelectText: {
    ...typography.captionBold,
    color: colors.primaryAccent,
    fontSize: 11,
  },
  dotSeparator: {
    color: colors.textMuted,
  },
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
    maxHeight: 180,
  },
  teamSelectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.sm,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
    minWidth: '47%',
    flex: 1,
  },
  teamSelectChipChecked: {
    borderColor: colors.primaryAccent,
    backgroundColor: colors.surfaceHighlight,
  },
  teamSelectText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    flexShrink: 1,
  },
  teamSelectTextChecked: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: 4,
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
    minWidth: 130,
  },
});
