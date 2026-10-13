import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { TournamentStatus, MatchStatus, GameType } from '../../models/types';

interface StatusBadgeProps {
  status?: TournamentStatus | MatchStatus | string;
  game?: GameType | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, game, size = 'sm' }) => {
  if (game) {
    let color = colors.secondaryAccent;
    let bg = colors.secondaryAccentMuted;
    if (game === 'BGMI') {
      color = colors.primaryAccent;
      bg = colors.primaryAccentMuted;
    } else if (game === 'Free Fire') {
      color = colors.warning;
      bg = colors.warningMuted;
    }

    return (
      <View
        style={[
          styles.badge,
          size === 'md' ? styles.badgeMd : styles.badgeSm,
          { backgroundColor: bg, borderColor: color },
        ]}
      >
        <Text
          style={[
            size === 'md' ? styles.textMd : styles.textSm,
            { color },
          ]}
        >
          {game}
        </Text>
      </View>
    );
  }

  let badgeBg = colors.surfaceElevated;
  let badgeColor = colors.textSecondary;
  let hasDot = false;

  switch (status) {
    case 'Live':
    case 'In Progress':
      badgeBg = colors.errorMuted;
      badgeColor = colors.error;
      hasDot = true;
      break;
    case 'Upcoming':
    case 'Scheduled':
      badgeBg = colors.warningMuted;
      badgeColor = colors.warning;
      break;
    case 'Completed':
      badgeBg = colors.successMuted;
      badgeColor = colors.success;
      break;
    default:
      break;
  }

  return (
    <View
      style={[
        styles.badge,
        size === 'md' ? styles.badgeMd : styles.badgeSm,
        { backgroundColor: badgeBg, borderColor: badgeColor },
      ]}
    >
      {hasDot && <View style={[styles.dot, { backgroundColor: badgeColor }]} />}
      <Text
        style={[
          size === 'md' ? styles.textMd : styles.textSm,
          { color: badgeColor },
        ]}
      >
        {status?.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeMd: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  textSm: {
    ...typography.captionBold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  textMd: {
    ...typography.captionBold,
    fontSize: 11,
    letterSpacing: 0.6,
  },
});
