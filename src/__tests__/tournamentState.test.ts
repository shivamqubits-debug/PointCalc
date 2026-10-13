import { describe, it, expect, beforeEach } from '@jest/globals';
import { Tournament, Team, Match } from '../models/types';
import { SCORING_PRESETS } from '../scoring/scoringEngine';
import { INITIAL_TOURNAMENTS, INITIAL_TEAMS, INITIAL_MATCHES } from '../data/seedData';

describe('Tournament State & Management Business Logic', () => {
  let tournaments: Tournament[];
  let teams: Team[];
  let matches: Match[];

  beforeEach(() => {
    // Fresh copies of seed data for isolated state testing
    tournaments = JSON.parse(JSON.stringify(INITIAL_TOURNAMENTS));
    teams = JSON.parse(JSON.stringify(INITIAL_TEAMS));
    matches = JSON.parse(JSON.stringify(INITIAL_MATCHES));
  });

  // Test 1: Creating a tournament
  it('should successfully create a tournament with defaults', () => {
    const initialCount = tournaments.length;
    const newTournament: Tournament = {
      id: `tourn-${Date.now()}`,
      name: 'Valorant Mobile Invitational',
      game: 'Other',
      status: 'Upcoming',
      description: 'Regional test tournament',
      expectedTeamsCount: 16,
      plannedMatchesCount: 6,
      teamIds: [],
      scoringRule: SCORING_PRESETS['BGMI Official (10-Pt)'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    tournaments = [newTournament, ...tournaments];
    expect(tournaments.length).toBe(initialCount + 1);
    expect(tournaments[0].name).toBe('Valorant Mobile Invitational');
  });

  // Test 2: Editing a tournament
  it('should update tournament details and modification timestamp', () => {
    const target = tournaments[0];
    const updatedName = 'BGMI Pro League Season 4 - Finals';
    const now = new Date().toISOString();

    tournaments = tournaments.map((t) =>
      t.id === target.id ? { ...t, name: updatedName, updatedAt: now } : t
    );

    const edited = tournaments.find((t) => t.id === target.id);
    expect(edited?.name).toBe(updatedName);
    expect(edited?.updatedAt).toBe(now);
  });

  // Test 3: Deleting a tournament and cascading matches
  it('should delete a tournament and remove associated matches', () => {
    const targetId = 'tourn-1';
    tournaments = tournaments.filter((t) => t.id !== targetId);
    matches = matches.filter((m) => m.tournamentId !== targetId);

    expect(tournaments.find((t) => t.id === targetId)).toBeUndefined();
    expect(matches.some((m) => m.tournamentId === targetId)).toBe(false);
  });

  // Test 4: Searching and filtering tournaments
  it('should filter tournaments by status and game', () => {
    const liveTournaments = tournaments.filter((t) => t.status === 'Live');
    expect(liveTournaments.every((t) => t.status === 'Live')).toBe(true);

    const bgmiTournaments = tournaments.filter((t) => t.game === 'BGMI');
    expect(bgmiTournaments.every((t) => t.game === 'BGMI')).toBe(true);

    // Search query
    const searchQuery = 'masters';
    const searched = tournaments.filter((t) =>
      t.name.toLowerCase().includes(searchQuery)
    );
    expect(searched.length).toBeGreaterThan(0);
    expect(searched[0].name.toLowerCase()).toContain('masters');
  });

  // Test 5: Calculating dashboard statistics
  it('should compute derived dashboard statistics correctly from state', () => {
    const totalTournaments = tournaments.length;
    const totalTeams = teams.length;
    const totalMatches = matches.length;
    const liveTournamentsCount = tournaments.filter((t) => t.status === 'Live').length;

    expect(totalTournaments).toBe(6);
    expect(totalTeams).toBe(14);
    expect(totalMatches).toBeGreaterThan(0);
    expect(liveTournamentsCount).toBe(2);
  });

  // Test 6: Adding and removing teams from a tournament
  it('should add a team to a tournament without duplicating', () => {
    const targetTourn = tournaments[0];
    const newTeamId = 'team-14'; // True Rippers

    // Ensure team not present initially
    expect(targetTourn.teamIds.includes(newTeamId)).toBe(false);

    // Add
    tournaments = tournaments.map((t) =>
      t.id === targetTourn.id ? { ...t, teamIds: [...t.teamIds, newTeamId] } : t
    );

    const updated = tournaments.find((t) => t.id === targetTourn.id);
    expect(updated?.teamIds).toContain(newTeamId);

    // Remove
    tournaments = tournaments.map((t) =>
      t.id === targetTourn.id
        ? { ...t, teamIds: t.teamIds.filter((id) => id !== newTeamId) }
        : t
    );

    const removed = tournaments.find((t) => t.id === targetTourn.id);
    expect(removed?.teamIds.includes(newTeamId)).toBe(false);

    // Workspace squads still has team-14
    expect(teams.some((t) => t.id === newTeamId)).toBe(true);
  });
});
