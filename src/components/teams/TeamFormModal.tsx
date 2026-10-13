import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Team, Player } from '../../models/types';
import { ModalContainer } from '../common/ModalContainer';
import { FormField } from '../common/FormField';
import { PrimaryButton } from '../common/PrimaryButton';
import { SecondaryButton } from '../common/SecondaryButton';
import { Ionicons } from '@expo/vector-icons';

interface TeamFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Team, 'id' | 'createdAt'>) => void;
  initialData?: Team | null;
}

const COLOR_OPTIONS = [
  '#B8F34A', // Neon Lime
  '#55D8F2', // Cyan
  '#FFB454', // Orange
  '#FF707A', // Coral Red
  '#64D991', // Mint Green
  '#B8A4F3', // Purple
  '#F255B8', // Pink
  '#5597F2', // Royal Blue
];

export const TeamFormModal: React.FC<TeamFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [players, setPlayers] = useState<Player[]>([]);

  // New Player draft input
  const [newPlayerIgn, setNewPlayerIgn] = useState('');
  const [newPlayerRole, setNewPlayerRole] = useState('Fragger');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setTag(initialData.tag);
      setSelectedColor(initialData.logoColor || COLOR_OPTIONS[0]);
      setPlayers(initialData.players || []);
    } else {
      setName('');
      setTag('');
      setSelectedColor(COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)]);
      setPlayers([
        { id: `p-${Date.now()}-1`, name: 'Player 1', ign: 'Player1', role: 'IGL' },
        { id: `p-${Date.now()}-2`, name: 'Player 2', ign: 'Player2', role: 'Assaulter' },
        { id: `p-${Date.now()}-3`, name: 'Player 3', ign: 'Player3', role: 'Fragger' },
        { id: `p-${Date.now()}-4`, name: 'Player 4', ign: 'Player4', role: 'Support' },
      ]);
    }
    setErrors({});
  }, [initialData, visible]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Team name is required.';
    if (!tag.trim()) newErrors.tag = 'Team tag is required (e.g. SOUL).';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddPlayer = () => {
    if (!newPlayerIgn.trim()) return;
    const newPlayer: Player = {
      id: `p-${Date.now()}`,
      name: newPlayerIgn.trim(),
      ign: newPlayerIgn.trim(),
      role: newPlayerRole.trim(),
    };
    setPlayers((prev) => [...prev, newPlayer]);
    setNewPlayerIgn('');
  };

  const handleRemovePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSave = () => {
    if (!validate()) return;
    onSubmit({
      name: name.trim(),
      tag: tag.trim().toUpperCase(),
      logoColor: selectedColor,
      players,
    });
    onClose();
  };

  return (
    <ModalContainer
      visible={visible}
      onClose={onClose}
      title={initialData ? 'Edit Squad' : 'Register New Squad'}
      subtitle="Configure organization name, team abbreviation, and roster"
    >
      <FormField
        label="Squad Name"
        required
        value={name}
        onChangeText={(text) => {
          setName(text);
          if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
        }}
        placeholder="e.g. GodLike Esports"
        error={errors.name}
      />

      <FormField
        label="Team Tag / Acronym"
        required
        value={tag}
        onChangeText={(text) => {
          setTag(text.toUpperCase());
          if (errors.tag) setErrors((prev) => ({ ...prev, tag: '' }));
        }}
        placeholder="e.g. GODL"
        maxLength={6}
        error={errors.tag}
      />

      {/* Color Accent Picker */}
      <View style={styles.colorSection}>
        <Text style={styles.sectionLabel}>Team Color Accent</Text>
        <View style={styles.colorRow}>
          {COLOR_OPTIONS.map((c) => {
            const isSelected = selectedColor === c;
            return (
              <Pressable
                key={c}
                onPress={() => setSelectedColor(c)}
                style={[
                  styles.colorCircle,
                  { backgroundColor: c },
                  isSelected && styles.colorCircleSelected,
                ]}
              >
                {isSelected && (
                  <Ionicons name="checkmark" size={14} color="#0B0F17" />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Roster Section */}
      <View style={styles.rosterSection}>
        <Text style={styles.sectionLabel}>Active Squad Roster ({players.length})</Text>

        {/* List of current players */}
        <View style={styles.playerList}>
          {players.map((player) => (
            <View key={player.id} style={styles.playerRow}>
              <View style={styles.playerInfo}>
                <Text style={styles.playerIgn}>{player.ign}</Text>
                {player.role && <Text style={styles.playerRole}>{player.role}</Text>}
              </View>
              <Pressable
                onPress={() => handleRemovePlayer(player.id)}
                style={styles.removeBtn}
                accessibilityLabel="Remove player"
              >
                <Ionicons name="trash-outline" size={14} color={colors.error} />
              </Pressable>
            </View>
          ))}
        </View>

        {/* Add Player Input Row */}
        <View style={styles.addPlayerRow}>
          <FormField
            label="Player IGN"
            value={newPlayerIgn}
            onChangeText={setNewPlayerIgn}
            placeholder="e.g. Jonathan"
            containerStyle={styles.addPlayerInput}
          />
          <SecondaryButton
            label="Add Player"
            iconName="add"
            onPress={handleAddPlayer}
            size="sm"
            style={styles.addBtn}
          />
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <SecondaryButton label="Cancel" onPress={onClose} style={styles.cancelBtn} />
        <PrimaryButton
          label={initialData ? 'Save Changes' : 'Register Squad'}
          onPress={handleSave}
          style={styles.saveBtn}
        />
      </View>
    </ModalContainer>
  );
};

const styles = StyleSheet.create({
  colorSection: {
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
  colorRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: 4,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircleSelected: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  rosterSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  playerList: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xs,
    marginBottom: spacing.sm,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  playerIgn: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 13,
  },
  playerRole: {
    ...typography.caption,
    color: colors.textMuted,
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.xs,
  },
  removeBtn: {
    padding: 4,
  },
  addPlayerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  addPlayerInput: {
    flex: 1,
    marginBottom: 0,
  },
  addBtn: {
    marginBottom: 0,
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
    minWidth: 140,
  },
});
