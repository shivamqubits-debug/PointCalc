import { describe, it, expect } from '@jest/globals';
import {
  calculateMatchRowPoints,
  validateMatchResults,
  sortLeaderboardEntries,
  computeTournamentLeaderboard,
  SCORING_PRESETS,
} from '../scoring/scoringEngine';
import {
  ScoringRule,
  MatchResultRow,
  LeaderboardEntry,
  Tournament,
  Team,
  Match,
} from '../models/types';

describe('Scoring Engine Unit Tests', () => {
  const bgmiRule: ScoringRule = SCORING_PRESETS['BGMI Official (10-Pt)'];

  // Test 7: Validating match results
  describe('Match Results Validation', () => {
    const participatingTeams = ['team-1', 'team-2', 'team-3'];

    it('should approve valid placements and kills', () => {
      const results: MatchResultRow[] = [
        { teamId: 'team-1', placement: 1, eliminations: 5 },
        { teamId: 'team-2', placement: 2, eliminations: 3 },
        { teamId: 'team-3', placement: 3, eliminations: 1 },
      ];
      const validation = validateMatchResults(results, participatingTeams, false);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject negative eliminations', () => {
      const results: MatchResultRow[] = [
        { teamId: 'team-1', placement: 1, eliminations: -2 },
      ];
      const validation = validateMatchResults(results, participatingTeams, false);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Eliminations cannot be negative.');
    });

    it('should reject duplicate placements', () => {
      const results: MatchResultRow[] = [
        { teamId: 'team-1', placement: 1, eliminations: 4 },
        { teamId: 'team-2', placement: 1, eliminations: 2 },
      ];
      const validation = validateMatchResults(results, participatingTeams, false);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some((e) => e.includes('Duplicate placement #1'))).toBe(true);
    });

    it('should reject non-participating teams', () => {
      const results: MatchResultRow[] = [
        { teamId: 'team-99', placement: 1, eliminations: 4 },
      ];
      const validation = validateMatchResults(results, participatingTeams, false);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some((e) => e.includes('not registered as a participant'))).toBe(
        true
      );
    });
  });

  // Test 8: Calculating placement and elimination points
  describe('Point Calculation', () => {
    it('should accurately calculate points for 1st place with 7 kills', () => {
      const row: MatchResultRow = { teamId: 'team-1', placement: 1, eliminations: 7 };
      const calculated = calculateMatchRowPoints(row, bgmiRule);

      expect(calculated.placementPoints).toBe(10); // 1st place in BGMI 10-pt system
      expect(calculated.eliminationPoints).toBe(7); // 7 * 1
      expect(calculated.totalPoints).toBe(17);
    });

    it('should calculate points for 2nd place with 0 kills', () => {
      const row: MatchResultRow = { teamId: 'team-2', placement: 2, eliminations: 0 };
      const calculated = calculateMatchRowPoints(row, bgmiRule);

      expect(calculated.placementPoints).toBe(6); // 2nd place
      expect(calculated.eliminationPoints).toBe(0);
      expect(calculated.totalPoints).toBe(6);
    });

    it('should award 0 placement points for ranks 9 through 16 in 10-pt system', () => {
      const row: MatchResultRow = { teamId: 'team-10', placement: 10, eliminations: 3 };
      const calculated = calculateMatchRowPoints(row, bgmiRule);

      expect(calculated.placementPoints).toBe(0);
      expect(calculated.eliminationPoints).toBe(3);
      expect(calculated.totalPoints).toBe(3);
    });
  });

  // Test 9 & 10: Ranking teams with equal scores and deterministic tie-breaks
  describe('Tie-Breaking Determinism', () => {
    const tiedEntries: LeaderboardEntry[] = [
      {
        rank: 0,
        teamId: 't-b',
        teamName: 'Beta Esports',
        teamTag: 'BETA',
        matchesPlayed: 1,
        placementPoints: 6,
        eliminations: 4,
        eliminationPoints: 4,
        totalPoints: 10,
        wins: 0,
      },
      {
        rank: 0,
        teamId: 't-a',
        teamName: 'Alpha Esports',
        teamTag: 'ALPH',
        matchesPlayed: 1,
        placementPoints: 10,
        eliminations: 0,
        eliminationPoints: 0,
        totalPoints: 10,
        wins: 1,
      },
    ];

    it('should break ties using Placement Points first when configured', () => {
      const placementFirstRule: ScoringRule = {
        ...bgmiRule,
        tieBreakPriority: 'PlacementPointsFirst',
      };
      const sorted = sortLeaderboardEntries(tiedEntries, placementFirstRule);

      // Alpha has 10 placement points, Beta has 6 -> Alpha wins tie
      expect(sorted[0].teamName).toBe('Alpha Esports');
      expect(sorted[1].teamName).toBe('Beta Esports');
    });

    it('should break ties using Eliminations (Kills) first when configured', () => {
      const elimsFirstRule: ScoringRule = {
        ...bgmiRule,
        tieBreakPriority: 'EliminationsFirst',
      };
      const sorted = sortLeaderboardEntries(tiedEntries, elimsFirstRule);

      // Beta has 4 kills, Alpha has 0 kills -> Beta wins tie
      expect(sorted[0].teamName).toBe('Beta Esports');
      expect(sorted[1].teamName).toBe('Alpha Esports');
    });

    it('should break ties using Most Wins (WWCD) first when configured', () => {
      const winsFirstRule: ScoringRule = {
        ...bgmiRule,
        tieBreakPriority: 'MostWinsFirst',
      };
      const sorted = sortLeaderboardEntries(tiedEntries, winsFirstRule);

      // Alpha has 1 win, Beta has 0 wins -> Alpha wins tie
      expect(sorted[0].teamName).toBe('Alpha Esports');
      expect(sorted[1].teamName).toBe('Beta Esports');
    });
  });

  // Test 11: Updating the leaderboard after result edits
  describe('Leaderboard Computation with Multiple Rounds', () => {
    const dummyTournament: Tournament = {
      id: 'tourn-test',
      name: 'Test Cup',
      game: 'BGMI',
      status: 'Live',
      teamIds: ['team-1', 'team-2'],
      scoringRule: bgmiRule,
      createdAt: '2026-10-10T00:00:00Z',
      updatedAt: '2026-10-10T00:00:00Z',
    };

    const dummyTeams: Team[] = [
      { id: 'team-1', name: 'Team Soul', tag: 'SOUL', players: [], createdAt: '' },
      { id: 'team-2', name: 'GodLike Esports', tag: 'GODL', players: [], createdAt: '' },
    ];

    it('should update leaderboard cumulative scores when new match results are recorded', () => {
      const match1: Match = {
        id: 'm-1',
        tournamentId: 'tourn-test',
        matchNumber: 1,
        status: 'Completed',
        participatingTeamIds: ['team-1', 'team-2'],
        resultsEntered: true,
        updatedAt: '',
        results: [
          { teamId: 'team-1', placement: 1, eliminations: 5 }, // Soul: 10 + 5 = 15
          { teamId: 'team-2', placement: 2, eliminations: 2 }, // GodL: 6 + 2 = 8
        ],
      };

      const match2: Match = {
        id: 'm-2',
        tournamentId: 'tourn-test',
        matchNumber: 2,
        status: 'Completed',
        participatingTeamIds: ['team-1', 'team-2'],
        resultsEntered: true,
        updatedAt: '',
        results: [
          { teamId: 'team-2', placement: 1, eliminations: 10 }, // GodL: 10 + 10 = 20
          { teamId: 'team-1', placement: 2, eliminations: 1 },  // Soul: 6 + 1 = 7
        ],
      };

      const leaderboard = computeTournamentLeaderboard(dummyTournament, dummyTeams, [
        match1,
        match2,
      ]);

      // GodL: 8 + 20 = 28 pts (Rank 1)
      // Soul: 15 + 7 = 22 pts (Rank 2)
      expect(leaderboard[0].teamName).toBe('GodLike Esports');
      expect(leaderboard[0].totalPoints).toBe(28);
      expect(leaderboard[0].rank).toBe(1);
      expect(leaderboard[0].matchesPlayed).toBe(2);

      expect(leaderboard[1].teamName).toBe('Team Soul');
      expect(leaderboard[1].totalPoints).toBe(22);
      expect(leaderboard[1].rank).toBe(2);
      expect(leaderboard[1].matchesPlayed).toBe(2);
    });
  });
});
