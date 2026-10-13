export type GameType = 'BGMI' | 'PUBG Mobile' | 'Free Fire' | 'Other';

export type TournamentStatus = 'Upcoming' | 'Live' | 'Completed';

export type MatchStatus = 'Scheduled' | 'In Progress' | 'Completed';

export type TieBreakRule = 'PlacementPointsFirst' | 'EliminationsFirst' | 'MostWinsFirst';

export interface ScoringRule {
  pointsPerElimination: number;
  placementPoints: Record<number, number>; // rank 1 -> 10, rank 2 -> 6, etc.
  tieBreakPriority: TieBreakRule;
  allTeamsRequired: boolean;
}

export interface Player {
  id: string;
  name: string;
  ign: string; // In-Game Name
  role?: string;
}

export interface Team {
  id: string;
  name: string;
  tag: string;
  logoColor?: string;
  players: Player[];
  createdAt: string;
}

export interface MatchResultRow {
  teamId: string;
  placement: number;
  eliminations: number;
}

export interface Match {
  id: string;
  tournamentId: string;
  matchNumber: number;
  scheduledDate?: string;
  status: MatchStatus;
  participatingTeamIds: string[];
  results: MatchResultRow[];
  resultsEntered: boolean;
  updatedAt: string;
}

export interface Tournament {
  id: string;
  name: string;
  game: GameType;
  status: TournamentStatus;
  description?: string;
  startDate?: string;
  organizerName?: string;
  expectedTeamsCount?: number;
  plannedMatchesCount?: number;
  teamIds: string[];
  scoringRule: ScoringRule;
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  teamId: string;
  teamName: string;
  teamTag: string;
  logoColor?: string;
  matchesPlayed: number;
  placementPoints: number;
  eliminations: number;
  eliminationPoints: number;
  totalPoints: number;
  wins: number;
}

export interface ActivityLogItem {
  id: string;
  type:
    | 'tournament_created'
    | 'tournament_updated'
    | 'tournament_deleted'
    | 'match_created'
    | 'results_saved'
    | 'team_created'
    | 'team_added'
    | 'rules_updated';
  title: string;
  description: string;
  timestamp: string;
}

export interface UserSettings {
  defaultGame: GameType;
  tableDensity: 'compact' | 'comfortable';
  confirmDestructive: boolean;
  theme: 'dark' | 'midnight';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  organization: string;
  role: string;
  avatarColor: string;
  isLoggedIn: boolean;
}

export type NavigationScreen =
  | 'Dashboard'
  | 'Tournaments'
  | 'TournamentDetails'
  | 'Teams'
  | 'Matches'
  | 'Leaderboards'
  | 'Calculator'
  | 'Settings'
  | 'Profile'
  | 'Login'
  | 'Signup';
