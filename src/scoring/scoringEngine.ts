import {
  ScoringRule,
  MatchResultRow,
  LeaderboardEntry,
  Team,
  Match,
  Tournament,
} from '../models/types';

export const SCORING_PRESETS: Record<string, ScoringRule> = {
  'BGMI Official (10-Pt)': {
    pointsPerElimination: 1,
    placementPoints: {
      1: 10,
      2: 6,
      3: 5,
      4: 4,
      5: 3,
      6: 2,
      7: 1,
      8: 1,
      9: 0,
      10: 0,
      11: 0,
      12: 0,
      13: 0,
      14: 0,
      15: 0,
      16: 0,
    },
    tieBreakPriority: 'PlacementPointsFirst',
    allTeamsRequired: false,
  },
  'PUBG Mobile Classic (15-Pt)': {
    pointsPerElimination: 1,
    placementPoints: {
      1: 15,
      2: 12,
      3: 10,
      4: 8,
      5: 6,
      6: 4,
      7: 2,
      8: 1,
      9: 1,
      10: 1,
      11: 1,
      12: 0,
      13: 0,
      14: 0,
      15: 0,
      16: 0,
    },
    tieBreakPriority: 'PlacementPointsFirst',
    allTeamsRequired: false,
  },
  'Free Fire Standard (12-Pt)': {
    pointsPerElimination: 1,
    placementPoints: {
      1: 12,
      2: 9,
      3: 8,
      4: 7,
      5: 6,
      6: 5,
      7: 4,
      8: 3,
      9: 2,
      10: 1,
      11: 0,
      12: 0,
    },
    tieBreakPriority: 'EliminationsFirst',
    allTeamsRequired: false,
  },
};

/**
 * Calculates placement points, elimination points, and total points for a single team row.
 */
export function calculateMatchRowPoints(
  row: MatchResultRow,
  rule: ScoringRule
): { placementPoints: number; eliminationPoints: number; totalPoints: number } {
  const placementPoints = rule.placementPoints[row.placement] ?? 0;
  const eliminationPoints = Math.max(0, row.eliminations) * rule.pointsPerElimination;
  const totalPoints = placementPoints + eliminationPoints;
  return { placementPoints, eliminationPoints, totalPoints };
}

/**
 * Validates a match results submission against rules and participants.
 */
export function validateMatchResults(
  results: MatchResultRow[],
  participatingTeamIds: string[],
  allTeamsRequired: boolean = false
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!results || results.length === 0) {
    errors.push('At least one team result must be provided.');
    return { isValid: false, errors };
  }

  const seenPlacements = new Set<number>();
  const seenTeams = new Set<string>();
  const validParticipantSet = new Set(participatingTeamIds);

  for (const row of results) {
    if (!row.teamId) {
      errors.push('Team selection is required for every row.');
    } else if (seenTeams.has(row.teamId)) {
      errors.push(`Duplicate team entry detected for team.`);
    } else {
      seenTeams.add(row.teamId);
    }

    if (validParticipantSet.size > 0 && !validParticipantSet.has(row.teamId)) {
      errors.push(`Team is not registered as a participant for this match.`);
    }

    if (typeof row.placement !== 'number' || row.placement < 1) {
      errors.push('Placement must be a positive integer (1 or higher).');
    } else if (seenPlacements.has(row.placement)) {
      errors.push(`Duplicate placement #${row.placement} is not allowed.`);
    } else {
      seenPlacements.add(row.placement);
    }

    if (typeof row.eliminations !== 'number' || row.eliminations < 0) {
      errors.push('Eliminations cannot be negative.');
    }
  }

  if (allTeamsRequired && validParticipantSet.size > 0) {
    if (seenTeams.size < validParticipantSet.size) {
      errors.push(
        `All ${validParticipantSet.size} participating teams must have results entered before completion.`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Deterministically sorts leaderboard entries based on the rule tie-breaking priority.
 */
export function sortLeaderboardEntries(
  entries: LeaderboardEntry[],
  rule: ScoringRule
): LeaderboardEntry[] {
  return [...entries].sort((a, b) => {
    // 1. Total points primary sort
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }

    // 2. Tie break priority
    if (rule.tieBreakPriority === 'PlacementPointsFirst') {
      if (b.placementPoints !== a.placementPoints) {
        return b.placementPoints - a.placementPoints;
      }
      if (b.eliminations !== a.eliminations) {
        return b.eliminations - a.eliminations;
      }
      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }
    } else if (rule.tieBreakPriority === 'EliminationsFirst') {
      if (b.eliminations !== a.eliminations) {
        return b.eliminations - a.eliminations;
      }
      if (b.placementPoints !== a.placementPoints) {
        return b.placementPoints - a.placementPoints;
      }
      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }
    } else if (rule.tieBreakPriority === 'MostWinsFirst') {
      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }
      if (b.placementPoints !== a.placementPoints) {
        return b.placementPoints - a.placementPoints;
      }
      if (b.eliminations !== a.eliminations) {
        return b.eliminations - a.eliminations;
      }
    }

    // 3. Fallback alphabetical for deterministic consistency
    return a.teamName.localeCompare(b.teamName);
  });
}

/**
 * Computes the overall leaderboard for a tournament.
 */
export function computeTournamentLeaderboard(
  tournament: Tournament,
  allTeams: Team[],
  matches: Match[]
): LeaderboardEntry[] {
  const teamMap = new Map<string, Team>();
  allTeams.forEach((t) => teamMap.set(t.id, t));

  // Initialize entries for all registered tournament teams
  const statsMap = new Map<
    string,
    {
      matchesPlayed: number;
      placementPoints: number;
      eliminations: number;
      eliminationPoints: number;
      totalPoints: number;
      wins: number;
    }
  >();

  tournament.teamIds.forEach((tId) => {
    statsMap.set(tId, {
      matchesPlayed: 0,
      placementPoints: 0,
      eliminations: 0,
      eliminationPoints: 0,
      totalPoints: 0,
      wins: 0,
    });
  });

  const tournamentMatches = matches.filter(
    (m) => m.tournamentId === tournament.id && m.resultsEntered
  );

  tournamentMatches.forEach((match) => {
    match.results.forEach((row) => {
      let teamStat = statsMap.get(row.teamId);
      if (!teamStat) {
        // In case team was added directly to match
        teamStat = {
          matchesPlayed: 0,
          placementPoints: 0,
          eliminations: 0,
          eliminationPoints: 0,
          totalPoints: 0,
          wins: 0,
        };
        statsMap.set(row.teamId, teamStat);
      }

      const { placementPoints, eliminationPoints, totalPoints } = calculateMatchRowPoints(
        row,
        tournament.scoringRule
      );

      teamStat.matchesPlayed += 1;
      teamStat.placementPoints += placementPoints;
      teamStat.eliminations += row.eliminations;
      teamStat.eliminationPoints += eliminationPoints;
      teamStat.totalPoints += totalPoints;
      if (row.placement === 1) {
        teamStat.wins += 1;
      }
    });
  });

  const entries: LeaderboardEntry[] = [];
  statsMap.forEach((stat, teamId) => {
    const team = teamMap.get(teamId);
    entries.push({
      rank: 1,
      teamId,
      teamName: team ? team.name : `Team ${teamId}`,
      teamTag: team ? team.tag : 'TEAM',
      logoColor: team?.logoColor,
      matchesPlayed: stat.matchesPlayed,
      placementPoints: stat.placementPoints,
      eliminations: stat.eliminations,
      eliminationPoints: stat.eliminationPoints,
      totalPoints: stat.totalPoints,
      wins: stat.wins,
    });
  });

  const sorted = sortLeaderboardEntries(entries, tournament.scoringRule);

  // Assign sequential ranks
  return sorted.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

/**
 * Computes single match points table
 */
export function computeMatchLeaderboard(
  match: Match,
  tournament: Tournament,
  allTeams: Team[]
): LeaderboardEntry[] {
  const teamMap = new Map<string, Team>();
  allTeams.forEach((t) => teamMap.set(t.id, t));

  const entries: LeaderboardEntry[] = match.results.map((row) => {
    const team = teamMap.get(row.teamId);
    const { placementPoints, eliminationPoints, totalPoints } = calculateMatchRowPoints(
      row,
      tournament.scoringRule
    );

    return {
      rank: row.placement,
      teamId: row.teamId,
      teamName: team ? team.name : `Team ${row.teamId}`,
      teamTag: team ? team.tag : 'TEAM',
      logoColor: team?.logoColor,
      matchesPlayed: 1,
      placementPoints,
      eliminations: row.eliminations,
      eliminationPoints,
      totalPoints,
      wins: row.placement === 1 ? 1 : 0,
    };
  });

  const sorted = sortLeaderboardEntries(entries, tournament.scoringRule);
  return sorted.map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
  }));
}
