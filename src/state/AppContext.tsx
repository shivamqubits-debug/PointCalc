import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import {
  Tournament,
  Team,
  Match,
  ActivityLogItem,
  UserSettings,
  NavigationScreen,
  ScoringRule,
  MatchResultRow,
  UserProfile,
} from '../models/types';
import {
  INITIAL_TOURNAMENTS,
  INITIAL_TEAMS,
  INITIAL_MATCHES,
  INITIAL_ACTIVITY,
  INITIAL_SETTINGS,
} from '../data/seedData';

export const INITIAL_USER: UserProfile = {
  id: 'usr-default',
  name: 'Alex Mercer',
  email: 'alex.mercer@krafton-ops.gg',
  organization: 'Krafton Tournament Operations',
  role: 'Head Tournament Director',
  avatarColor: '#B8F34A',
  isLoggedIn: true,
};

interface NavigationHistoryItem {
  screen: NavigationScreen;
  params?: {
    tournamentId?: string;
    matchId?: string;
    teamId?: string;
  };
}

interface AppContextValue {
  // Navigation State
  currentScreen: NavigationScreen;
  selectedTournamentId: string | null;
  selectedMatchId: string | null;
  selectedTeamId: string | null;
  canGoBack: boolean;
  navigateTo: (
    screen: NavigationScreen,
    params?: { tournamentId?: string; matchId?: string; teamId?: string }
  ) => void;
  goBack: () => void;

  // Domain State
  tournaments: Tournament[];
  teams: Team[];
  matches: Match[];
  activity: ActivityLogItem[];
  settings: UserSettings;

  // Derived Statistics
  totalTournaments: number;
  totalTeams: number;
  totalMatches: number;
  liveTournamentsCount: number;

  // Helpers
  getTournament: (id: string) => Tournament | undefined;
  getTeam: (id: string) => Team | undefined;
  getMatch: (id: string) => Match | undefined;
  getTournamentMatches: (tournamentId: string) => Match[];
  getTournamentTeams: (tournamentId: string) => Team[];

  // Mutations
  createTournament: (
    data: Omit<Tournament, 'id' | 'createdAt' | 'updatedAt'>
  ) => Tournament;
  updateTournament: (id: string, data: Partial<Tournament>) => void;
  duplicateTournament: (id: string) => Tournament;
  deleteTournament: (id: string) => void;
  addTeamToTournament: (tournamentId: string, teamId: string) => void;
  removeTeamFromTournament: (tournamentId: string, teamId: string) => void;

  createTeam: (data: Omit<Team, 'id' | 'createdAt'>) => Team;
  updateTeam: (id: string, data: Partial<Team>) => void;
  deleteTeam: (id: string) => void;

  createMatch: (
    data: Omit<Match, 'id' | 'results' | 'resultsEntered' | 'updatedAt'>
  ) => Match;
  updateMatch: (id: string, data: Partial<Match>) => void;
  saveMatchResults: (matchId: string, results: MatchResultRow[]) => void;
  deleteMatch: (matchId: string) => void;

  // User & Authentication State
  user: UserProfile;
  login: (email: string, name?: string, organization?: string) => void;
  signup: (email: string, name: string, organization: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;

  updateScoringRule: (tournamentId: string, rule: ScoringRule) => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>(INITIAL_TOURNAMENTS);
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [activity, setActivity] = useState<ActivityLogItem[]>(INITIAL_ACTIVITY);
  const [settings, setSettings] = useState<UserSettings>(INITIAL_SETTINGS);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);

  const login = (email: string, name?: string, organization?: string) => {
    setUser({
      id: `usr-${Date.now()}`,
      name: name || (email.split('@')[0] ? email.split('@')[0].toUpperCase() : 'Admin'),
      email,
      organization: organization || 'Krafton Tournament Operations',
      role: 'Tournament Director',
      avatarColor: '#B8F34A',
      isLoggedIn: true,
    });
    addActivity('rules_updated', 'Organizer Signed In', `Authenticated as ${email}.`);
  };

  const signup = (email: string, name: string, organization: string) => {
    setUser({
      id: `usr-${Date.now()}`,
      name,
      email,
      organization,
      role: 'Head Tournament Organizer',
      avatarColor: '#55D8F2',
      isLoggedIn: true,
    });
    addActivity('rules_updated', 'Account Created', `Registered new organizer account for ${name}.`);
  };

  const logout = () => {
    setUser({
      id: 'guest',
      name: 'Guest Organizer',
      email: 'guest@pointcalc.local',
      organization: 'Local Workspace',
      role: 'Guest Organizer',
      avatarColor: '#8995AA',
      isLoggedIn: false,
    });
    addActivity('rules_updated', 'Organizer Signed Out', 'Switched to guest session mode.');
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...data }));
  };

  // Navigation Stack
  const [history, setHistory] = useState<NavigationHistoryItem[]>([
    { screen: 'Dashboard' },
  ]);
  const currentNav = history[history.length - 1];

  const navigateTo = (
    screen: NavigationScreen,
    params?: { tournamentId?: string; matchId?: string; teamId?: string }
  ) => {
    setHistory((prev) => [...prev, { screen, params }]);
  };

  const goBack = () => {
    setHistory((prev) => {
      if (prev.length <= 1) {
        return [{ screen: 'Dashboard' }];
      }
      return prev.slice(0, prev.length - 1);
    });
  };

  const addActivity = (type: ActivityLogItem['type'], title: string, description: string) => {
    const item: ActivityLogItem = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      title,
      description,
      timestamp: 'Just now',
    };
    setActivity((prev) => [item, ...prev.slice(0, 19)]); // keep recent 20
  };

  // Tournament Operations
  const createTournament = (
    data: Omit<Tournament, 'id' | 'createdAt' | 'updatedAt'>
  ): Tournament => {
    const now = new Date().toISOString();
    const newTournament: Tournament = {
      ...data,
      id: `tourn-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setTournaments((prev) => [newTournament, ...prev]);
    addActivity(
      'tournament_created',
      'Tournament Created',
      `Created "${newTournament.name}" for ${newTournament.game}.`
    );
    return newTournament;
  };

  const updateTournament = (id: string, data: Partial<Tournament>) => {
    setTournaments((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
      )
    );
    addActivity(
      'tournament_updated',
      'Tournament Updated',
      `Modified details for tournament ${id}.`
    );
  };

  const duplicateTournament = (id: string): Tournament => {
    const existing = tournaments.find((t) => t.id === id);
    if (!existing) throw new Error('Tournament not found');

    const now = new Date().toISOString();
    const duplicated: Tournament = {
      ...existing,
      id: `tourn-${Date.now()}`,
      name: `${existing.name} (Copy)`,
      status: 'Upcoming',
      createdAt: now,
      updatedAt: now,
    };
    setTournaments((prev) => [duplicated, ...prev]);
    addActivity(
      'tournament_created',
      'Tournament Duplicated',
      `Duplicated "${existing.name}" as "${duplicated.name}".`
    );
    return duplicated;
  };

  const deleteTournament = (id: string) => {
    const existing = tournaments.find((t) => t.id === id);
    setTournaments((prev) => prev.filter((t) => t.id !== id));
    // Also remove any matches linked to this tournament
    setMatches((prev) => prev.filter((m) => m.tournamentId !== id));

    if (existing) {
      addActivity(
        'tournament_deleted',
        'Tournament Removed',
        `Deleted tournament "${existing.name}".`
      );
    }
  };

  const addTeamToTournament = (tournamentId: string, teamId: string) => {
    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id === tournamentId && !t.teamIds.includes(teamId)) {
          return {
            ...t,
            teamIds: [...t.teamIds, teamId],
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );
    const team = teams.find((tm) => tm.id === teamId);
    if (team) {
      addActivity(
        'team_added',
        'Squad Added to Tournament',
        `Registered ${team.name} [${team.tag}] into tournament.`
      );
    }
  };

  const removeTeamFromTournament = (tournamentId: string, teamId: string) => {
    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id === tournamentId) {
          return {
            ...t,
            teamIds: t.teamIds.filter((id) => id !== teamId),
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );
  };

  // Team Operations
  const createTeam = (data: Omit<Team, 'id' | 'createdAt'>): Team => {
    const newTeam: Team = {
      ...data,
      id: `team-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTeams((prev) => [newTeam, ...prev]);
    addActivity(
      'team_created',
      'Squad Registered',
      `Created squad "${newTeam.name}" [${newTeam.tag}].`
    );
    return newTeam;
  };

  const updateTeam = (id: string, data: Partial<Team>) => {
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
  };

  const deleteTeam = (id: string) => {
    setTeams((prev) => prev.filter((t) => t.id !== id));
    // Also remove team from tournament team lists
    setTournaments((prev) =>
      prev.map((tourn) => ({
        ...tourn,
        teamIds: tourn.teamIds.filter((tId) => tId !== id),
      }))
    );
  };

  // Match Operations
  const createMatch = (
    data: Omit<Match, 'id' | 'results' | 'resultsEntered' | 'updatedAt'>
  ): Match => {
    const newMatch: Match = {
      ...data,
      id: `m-${Date.now()}`,
      results: [],
      resultsEntered: false,
      updatedAt: new Date().toISOString(),
    };
    setMatches((prev) => [...prev, newMatch]);
    addActivity(
      'match_created',
      'Match Scheduled',
      `Added Match #${newMatch.matchNumber} for tournament.`
    );
    return newMatch;
  };

  const updateMatch = (id: string, data: Partial<Match>) => {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, ...data, updatedAt: new Date().toISOString() } : m
      )
    );
  };

  const saveMatchResults = (matchId: string, results: MatchResultRow[]) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id === matchId) {
          return {
            ...m,
            results,
            resultsEntered: true,
            status: 'Completed',
            updatedAt: new Date().toISOString(),
          };
        }
        return m;
      })
    );
    addActivity(
      'results_saved',
      'Match Results Saved',
      `Recorded results and placements for match.`
    );
  };

  const deleteMatch = (matchId: string) => {
    setMatches((prev) => prev.filter((m) => m.id !== matchId));
  };

  // Scoring Rules
  const updateScoringRule = (tournamentId: string, rule: ScoringRule) => {
    setTournaments((prev) =>
      prev.map((t) =>
        t.id === tournamentId
          ? { ...t, scoringRule: rule, updatedAt: new Date().toISOString() }
          : t
      )
    );
    addActivity(
      'rules_updated',
      'Rules Updated',
      `Updated point table rules for tournament.`
    );
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetToDefaults = () => {
    setTournaments(INITIAL_TOURNAMENTS);
    setTeams(INITIAL_TEAMS);
    setMatches(INITIAL_MATCHES);
    setActivity(INITIAL_ACTIVITY);
    setSettings(INITIAL_SETTINGS);
    setHistory([{ screen: 'Dashboard' }]);
  };

  // Derived Stats
  const totalTournaments = tournaments.length;
  const totalTeams = teams.length;
  const totalMatches = matches.length;
  const liveTournamentsCount = tournaments.filter((t) => t.status === 'Live').length;

  const getTournament = (id: string) => tournaments.find((t) => t.id === id);
  const getTeam = (id: string) => teams.find((t) => t.id === id);
  const getMatch = (id: string) => matches.find((m) => m.id === id);
  const getTournamentMatches = (tournamentId: string) =>
    matches.filter((m) => m.tournamentId === tournamentId);
  const getTournamentTeams = (tournamentId: string) => {
    const tournament = tournaments.find((t) => t.id === tournamentId);
    if (!tournament) return [];
    return teams.filter((tm) => tournament.teamIds.includes(tm.id));
  };

  const value: AppContextValue = {
    currentScreen: currentNav?.screen || 'Dashboard',
    selectedTournamentId: currentNav?.params?.tournamentId || null,
    selectedMatchId: currentNav?.params?.matchId || null,
    selectedTeamId: currentNav?.params?.teamId || null,
    canGoBack: currentNav?.screen !== 'Dashboard' || history.length > 1,
    navigateTo,
    goBack,

    tournaments,
    teams,
    matches,
    activity,
    settings,
    user,
    login,
    signup,
    logout,
    updateProfile,

    totalTournaments,
    totalTeams,
    totalMatches,
    liveTournamentsCount,

    getTournament,
    getTeam,
    getMatch,
    getTournamentMatches,
    getTournamentTeams,

    createTournament,
    updateTournament,
    duplicateTournament,
    deleteTournament,
    addTeamToTournament,
    removeTeamFromTournament,

    createTeam,
    updateTeam,
    deleteTeam,

    createMatch,
    updateMatch,
    saveMatchResults,
    deleteMatch,

    updateScoringRule,
    updateSettings,
    resetToDefaults,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
