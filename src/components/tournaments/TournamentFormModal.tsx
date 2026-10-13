import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Tournament, GameType, TournamentStatus } from '../../models/types';
import { ModalContainer } from '../common/ModalContainer';
import { FormField } from '../common/FormField';
import { SCORING_PRESETS } from '../../scoring/scoringEngine';
import { Ionicons } from '@expo/vector-icons';

interface TournamentFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Tournament, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Tournament | null;
}

const GAME_OPTIONS: { game: GameType; icon: any; desc: string }[] = [
  { game: 'BGMI', icon: 'shield-checkmark', desc: 'Battlegrounds Mobile India' },
  { game: 'PUBG Mobile', icon: 'globe-outline', desc: 'Global Esports Circuit' },
  { game: 'Free Fire', icon: 'flame', desc: 'Garena Free Fire MAX' },
  { game: 'Other', icon: 'game-controller-outline', desc: 'Custom Title / Scrims' },
];

const STATUS_OPTIONS: TournamentStatus[] = ['Upcoming', 'Live', 'Completed'];

const PRESET_OPTIONS = [
  { name: 'BGMI Official (10-Pt)', label: '10-Point (BGMI/BGIS)', tag: 'WWCD: 10 pts' },
  { name: 'PUBG Mobile Classic (15-Pt)', label: '15-Point (PMGC Classic)', tag: 'WWCD: 15 pts' },
  { name: 'Free Fire Standard (12-Pt)', label: '12-Point (FFWS Standard)', tag: 'WWCD: 12 pts' },
];

export const TournamentFormModal: React.FC<TournamentFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [game, setGame] = useState<GameType>('BGMI');
  const [selectedPreset, setSelectedPreset] = useState('BGMI Official (10-Pt)');
  const [status, setStatus] = useState<TournamentStatus>('Upcoming');
  const [description, setDescription] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [expectedTeams, setExpectedTeams] = useState('16');
  const [plannedMatches, setPlannedMatches] = useState('6');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setGame(initialData.game);
      setStatus(initialData.status);
      setDescription(initialData.description || '');
      setOrganizerName(initialData.organizerName || '');
      setStartDate(initialData.startDate || '');
      setExpectedTeams(String(initialData.expectedTeamsCount || 16));
      setPlannedMatches(String(initialData.plannedMatchesCount || 6));
      // Determine preset
      const top1 = initialData.scoringRule?.placementPoints?.[1];
      if (top1 === 15) setSelectedPreset('PUBG Mobile Classic (15-Pt)');
      else if (top1 === 12) setSelectedPreset('Free Fire Standard (12-Pt)');
      else setSelectedPreset('BGMI Official (10-Pt)');
    } else {
      setName('');
      setGame('BGMI');
      setSelectedPreset('BGMI Official (10-Pt)');
      setStatus('Upcoming');
      setDescription('');
      setOrganizerName('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setExpectedTeams('16');
      setPlannedMatches('6');
    }
    setErrors({});
    setIsSubmitting(false);
  }, [initialData, visible]);

  const handleGameSelect = (g: GameType) => {
    setGame(g);
    if (g === 'BGMI') setSelectedPreset('BGMI Official (10-Pt)');
    else if (g === 'PUBG Mobile') setSelectedPreset('PUBG Mobile Classic (15-Pt)');
    else if (g === 'Free Fire') setSelectedPreset('Free Fire Standard (12-Pt)');
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = 'Tournament name is required.';
    } else if (name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (isSubmitting) return;
    if (!validate()) return;

    setIsSubmitting(true);

    const scoringRule =
      SCORING_PRESETS[selectedPreset] || SCORING_PRESETS['BGMI Official (10-Pt)'];

    // Prevent duplicate accidental click
    setTimeout(() => {
      onSubmit({
        name: name.trim(),
        game,
        status,
        description: description.trim() || undefined,
        organizerName: organizerName.trim() || undefined,
        startDate: startDate.trim() || undefined,
        expectedTeamsCount: parseInt(expectedTeams, 10) || 16,
        plannedMatchesCount: parseInt(plannedMatches, 10) || 6,
        teamIds: initialData ? initialData.teamIds : [],
        scoringRule,
      });
      setIsSubmitting(false);
      onClose();
    }, 150);
  };

  return (
    <ModalContainer
      visible={visible}
      onClose={onClose}
      title={initialData ? 'Edit Tournament' : 'Create Tournament'}
      subtitle={
        initialData
          ? 'Update tournament settings, schedule, and scoring rule'
          : 'Setup a new competitive esports tournament'
      }
      maxWidth={580}
    >
      {/* SECTION 1: Identity & Game */}
      <View style={styles.formSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>1. GENERAL DETAILS</Text>
          <View style={styles.requiredPill}>
            <Text style={styles.requiredText}>Required</Text>
          </View>
        </View>

        {/* Tournament Name */}
        <FormField
          label="Tournament Name"
          required
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
          }}
          placeholder="e.g. BGMI Pro Championship Season 4"
          error={errors.name}
        />

        {/* Game Title Selector */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Game Title *</Text>
          <View style={styles.gameGrid}>
            {GAME_OPTIONS.map((item) => {
              const isSelected = game === item.game;
              return (
                <Pressable
                  key={item.game}
                  onPress={() => handleGameSelect(item.game)}
                  style={[styles.gameCard, isSelected && styles.gameCardSelected]}
                >
                  <View style={styles.gameCardTop}>
                    <Ionicons
                      name={item.icon}
                      size={16}
                      color={isSelected ? colors.primaryAccent : colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.gameCardTitle,
                        isSelected && styles.gameCardTitleSelected,
                      ]}
                    >
                      {item.game}
                    </Text>
                  </View>
                  <Text style={styles.gameCardDesc}>{item.desc}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* SECTION 2: Rules & Scoring Preset */}
      <View style={styles.formSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>2. FORMAT & SCORING RULES</Text>
          <View style={styles.presetActivePill}>
            <Text style={styles.presetActiveText}>
              {selectedPreset === 'BGMI Official (10-Pt)'
                ? '10-Pt'
                : selectedPreset === 'PUBG Mobile Classic (15-Pt)'
                ? '15-Pt'
                : '12-Pt'}
            </Text>
          </View>
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Official Scoring Formula</Text>
          <View style={styles.presetList}>
            {PRESET_OPTIONS.map((opt) => {
              const isSelected = selectedPreset === opt.name;
              return (
                <TouchableOpacity
                  key={opt.name}
                  onPress={() => setSelectedPreset(opt.name)}
                  style={[styles.presetRow, isSelected && styles.presetRowSelected]}
                  activeOpacity={0.8}
                >
                  <View style={styles.presetRowLeft}>
                    <View
                      style={[
                        styles.radioCircle,
                        isSelected && styles.radioCircleActive,
                      ]}
                    >
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                    <Text
                      style={[
                        styles.presetRowName,
                        isSelected && styles.presetRowNameActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </View>
                  <View style={styles.presetTagBadge}>
                    <Text style={styles.presetTagText}>{opt.tag}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Status Selector */}
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Tournament Status</Text>
          <View style={styles.chipRow}>
            {STATUS_OPTIONS.map((st) => {
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
      </View>

      {/* SECTION 3: Scale & Schedule */}
      <View style={styles.formSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>3. SCALE & SCHEDULE</Text>
        </View>

        <View style={styles.splitRow}>
          <FormField
            label="Expected Teams"
            value={expectedTeams}
            onChangeText={setExpectedTeams}
            placeholder="16"
            keyboardType="numeric"
            containerStyle={styles.halfField}
          />
          <FormField
            label="Planned Matches"
            value={plannedMatches}
            onChangeText={setPlannedMatches}
            placeholder="6"
            keyboardType="numeric"
            containerStyle={styles.halfField}
          />
        </View>

        <View style={styles.splitRow}>
          <FormField
            label="Organizer / Host"
            value={organizerName}
            onChangeText={setOrganizerName}
            placeholder="e.g. Krafton Ops / Nodwin"
            containerStyle={styles.halfField}
          />
          <FormField
            label="Start Date"
            value={startDate}
            onChangeText={setStartDate}
            placeholder="YYYY-MM-DD"
            containerStyle={styles.halfField}
          />
        </View>

        <FormField
          label="Rules & Overview (Optional)"
          value={description}
          onChangeText={setDescription}
          placeholder="Enter tournament format, prize pool, or lobby instructions..."
          multiline
        />
      </View>

      {/* Form Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onClose}
          disabled={isSubmitting}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#070B14" />
          ) : (
            <Text style={styles.saveButtonText}>
              {initialData ? 'Save Changes' : 'Create Tournament'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ModalContainer>
  );
};

const styles = StyleSheet.create({
  formSection: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.8,
  },
  requiredPill: {
    backgroundColor: colors.primaryAccentMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  requiredText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primaryAccent,
  },
  presetActivePill: {
    backgroundColor: 'rgba(85, 216, 242, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  presetActiveText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.secondaryAccent,
  },
  fieldBlock: {
    marginBottom: spacing.sm + 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs + 2,
  },
  gameGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 4,
  },
  gameCard: {
    flex: 1,
    minWidth: 120,
    backgroundColor: colors.surfacePrimary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.sm + 2,
  },
  gameCardSelected: {
    borderColor: colors.primaryAccent,
    backgroundColor: colors.surfaceHighlight,
  },
  gameCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  gameCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  gameCardTitleSelected: {
    color: colors.primaryAccent,
  },
  gameCardDesc: {
    fontSize: 10,
    color: colors.textMuted,
  },
  presetList: {
    gap: spacing.xs + 2,
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfacePrimary,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  presetRowSelected: {
    borderColor: colors.secondaryAccent,
    backgroundColor: 'rgba(85, 216, 242, 0.08)',
  },
  presetRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: colors.secondaryAccent,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondaryAccent,
  },
  presetRowName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  presetRowNameActive: {
    color: colors.secondaryAccent,
    fontWeight: '700',
  },
  presetTagBadge: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  presetTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
  },
  chip: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfacePrimary,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.surfaceHighlight,
    borderColor: colors.primaryAccent,
  },
  chipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: colors.primaryAccent,
    fontWeight: '700',
  },
  splitRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfField: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  saveButton: {
    backgroundColor: colors.primaryAccent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#070B14',
    fontWeight: '700',
    fontSize: 13,
  },
});
