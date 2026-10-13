import {
  Tournament,
  Team,
  Match,
  ActivityLogItem,
  UserSettings,
} from '../models/types';
import { SCORING_PRESETS } from '../scoring/scoringEngine';

export const INITIAL_SETTINGS: UserSettings = {
  defaultGame: 'BGMI',
  tableDensity: 'comfortable',
  confirmDestructive: true,
  theme: 'dark',
};

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-1',
    name: 'Team Soul',
    tag: 'SOUL',
    logoColor: '#64D991',
    players: [
      { id: 'p1', name: 'Manya', ign: 'SOULxManya', role: 'IGL' },
      { id: 'p2', name: 'Nakul', ign: 'SOULxNakul', role: 'Assaulter' },
      { id: 'p3', name: 'Rony', ign: 'SOULxRony', role: 'Support' },
      { id: 'p4', name: 'Spower', ign: 'SOULxSpower', role: 'Fragger' },
    ],
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'team-2',
    name: 'GodLike Esports',
    tag: 'GODL',
    logoColor: '#FFB454',
    players: [
      { id: 'p5', name: 'Jonathan', ign: 'GODLxJONATHAN', role: 'Fragger' },
      { id: 'p6', name: 'Neyoo', ign: 'GODLxNEYOO', role: 'Support' },
      { id: 'p7', name: 'Zgod', ign: 'GODLxZGOD', role: 'Healer' },
      { id: 'p8', name: 'Punkk', ign: 'GODLxPUNKK', role: 'IGL' },
    ],
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'team-3',
    name: 'Blind Esports',
    tag: 'BLIND',
    logoColor: '#55D8F2',
    players: [
      { id: 'p9', name: 'Spower', ign: 'BLINDxSpower', role: 'Fragger' },
      { id: 'p10', name: 'Manya', ign: 'BLINDxManya', role: 'IGL' },
      { id: 'p11', name: 'Saransh', ign: 'BLINDxSaransh', role: 'Assaulter' },
      { id: 'p12', name: 'Joker', ign: 'BLINDxJoker', role: 'Support' },
    ],
    createdAt: '2026-09-02T11:00:00Z',
  },
  {
    id: 'team-4',
    name: 'Orangutan Esports',
    tag: 'OG',
    logoColor: '#FF707A',
    players: [
      { id: 'p13', name: 'Ash', ign: 'OGxAsh', role: 'IGL' },
      { id: 'p14', name: 'AKop', ign: 'OGxAKop', role: 'Assaulter' },
      { id: 'p15', name: 'WizzGG', ign: 'OGxWizz', role: 'Fragger' },
      { id: 'p16', name: 'Driger', ign: 'OGxDriger', role: 'Support' },
    ],
    createdAt: '2026-09-02T11:30:00Z',
  },
  {
    id: 'team-5',
    name: 'Entity Gaming',
    tag: 'ENT',
    logoColor: '#B8F34A',
    players: [
      { id: 'p17', name: 'Saumraj', ign: 'ENTxSaumraj', role: 'IGL' },
      { id: 'p18', name: 'GamlaBoy', ign: 'ENTxGamlaBoy', role: 'Fragger' },
      { id: 'p19', name: 'Troghn', ign: 'ENTxTroghn', role: 'Assaulter' },
      { id: 'p20', name: 'Secret', ign: 'ENTxSecret', role: 'Support' },
    ],
    createdAt: '2026-09-03T09:00:00Z',
  },
  {
    id: 'team-6',
    name: 'Revenant Esports',
    tag: 'RVT',
    logoColor: '#B8A4F3',
    players: [
      { id: 'p21', name: 'Sensei', ign: 'RVTxSensei', role: 'IGL' },
      { id: 'p22', name: 'Fierce', ign: 'RVTxFierce', role: 'Fragger' },
      { id: 'p23', name: 'Apollo', ign: 'RVTxApollo', role: 'Assaulter' },
      { id: 'p24', name: 'Aquanox', ign: 'RVTxAquanox', role: 'Support' },
    ],
    createdAt: '2026-09-03T12:00:00Z',
  },
  {
    id: 'team-7',
    name: 'Team XSpark',
    tag: 'TX',
    logoColor: '#F38A4A',
    players: [
      { id: 'p25', name: 'Shadow', ign: 'TXxShadow', role: 'IGL' },
      { id: 'p26', name: 'Sarang', ign: 'TXxSarang', role: 'Fragger' },
      { id: 'p27', name: 'NinjaBoi', ign: 'TXxNinja', role: 'Assaulter' },
      { id: 'p28', name: 'SprayGod', ign: 'TXxSprayGod', role: 'Support' },
    ],
    createdAt: '2026-09-04T10:00:00Z',
  },
  {
    id: 'team-8',
    name: 'Gladiators Esports',
    tag: 'GLAD',
    logoColor: '#F255B8',
    players: [
      { id: 'p29', name: 'Destro', ign: 'GLADxDestro', role: 'IGL' },
      { id: 'p30', name: 'Justin', ign: 'GLADxJustin', role: 'Fragger' },
      { id: 'p31', name: 'DeltaPG', ign: 'GLADxDeltaPG', role: 'Assaulter' },
      { id: 'p32', name: 'Shogun', ign: 'GLADxShogun', role: 'Support' },
    ],
    createdAt: '2026-09-04T14:00:00Z',
  },
  {
    id: 'team-9',
    name: 'Carnival Gaming',
    tag: 'CG',
    logoColor: '#55F2A8',
    players: [
      { id: 'p33', name: 'Omega', ign: 'CGxOmega', role: 'IGL' },
      { id: 'p34', name: 'Goblin', ign: 'CGxGoblin', role: 'Fragger' },
      { id: 'p35', name: 'Akshat', ign: 'CGxAkshat', role: 'Assaulter' },
      { id: 'p36', name: 'Hector', ign: 'CGxHector', role: 'Support' },
    ],
    createdAt: '2026-09-05T08:00:00Z',
  },
  {
    id: 'team-10',
    name: 'Medal Esports',
    tag: 'MEDAL',
    logoColor: '#F2D355',
    players: [
      { id: 'p37', name: 'Paradox', ign: 'MEDALxParadox', role: 'IGL' },
      { id: 'p38', name: 'TopDawg', ign: 'MEDALxTopDawg', role: 'Fragger' },
      { id: 'p39', name: 'Sayyam', ign: 'MEDALxSayyam', role: 'Assaulter' },
      { id: 'p40', name: 'Kyoya', ign: 'MEDALxKyoya', role: 'Support' },
    ],
    createdAt: '2026-09-05T13:00:00Z',
  },
  {
    id: 'team-11',
    name: 'Global Esports',
    tag: 'GE',
    logoColor: '#5597F2',
    players: [
      { id: 'p41', name: 'Mavi', ign: 'GExMavi', role: 'IGL' },
      { id: 'p42', name: 'Slug', ign: 'GExSlug', role: 'Fragger' },
      { id: 'p43', name: 'Beast', ign: 'GExBeast', role: 'Assaulter' },
      { id: 'p44', name: 'Ninjaboi', ign: 'GExNinja', role: 'Support' },
    ],
    createdAt: '2026-09-06T11:00:00Z',
  },
  {
    id: 'team-12',
    name: 'Total Gaming Esports',
    tag: 'TG',
    logoColor: '#FF6347',
    players: [
      { id: 'p45', name: 'FozyAjay', ign: 'TGxFozy', role: 'IGL' },
      { id: 'p46', name: 'Mafia', ign: 'TGxMafia', role: 'Fragger' },
      { id: 'p47', name: 'Bala', ign: 'TGxBala', role: 'Sniper' },
      { id: 'p48', name: 'Golden', ign: 'TGxGolden', role: 'Support' },
    ],
    createdAt: '2026-09-06T15:00:00Z',
  },
  {
    id: 'team-13',
    name: 'Reckoning Esports',
    tag: 'RCK',
    logoColor: '#8CE03E',
    players: [
      { id: 'p49', name: 'Vipul', ign: 'RCKxVipul', role: 'IGL' },
      { id: 'p50', name: 'Immortal', ign: 'RCxImmortal', role: 'Fragger' },
    ],
    createdAt: '2026-09-07T09:00:00Z',
  },
  {
    id: 'team-14',
    name: 'True Rippers',
    tag: 'TR',
    logoColor: '#C055F2',
    players: [
      { id: 'p51', name: 'Nasty', ign: 'TRxNasty', role: 'IGL' },
      { id: 'p52', name: 'Hellboy', ign: 'TRxHellboy', role: 'Assaulter' },
    ],
    createdAt: '2026-09-07T12:00:00Z',
  },
];

const PRO_LEAGUE_TEAMS = [
  'team-1',
  'team-2',
  'team-3',
  'team-4',
  'team-5',
  'team-6',
  'team-7',
  'team-8',
  'team-9',
  'team-10',
];

const PUBG_MASTERS_TEAMS = [
  'team-1',
  'team-2',
  'team-5',
  'team-6',
  'team-7',
  'team-8',
  'team-11',
  'team-14',
];

const FREE_FIRE_CHAMP_TEAMS = [
  'team-4',
  'team-8',
  'team-9',
  'team-12',
  'team-13',
  'team-14',
];

export const INITIAL_TOURNAMENTS: Tournament[] = [
  {
    id: 'tourn-1',
    name: 'BGMI Pro League Season 4',
    game: 'BGMI',
    status: 'Live',
    description: 'Premier regional championship featuring the top 10 invited franchises battling in Sanhok and Erangel.',
    startDate: '2026-10-10',
    organizerName: 'Krafton Esports Hub',
    expectedTeamsCount: 10,
    plannedMatchesCount: 6,
    teamIds: PRO_LEAGUE_TEAMS,
    scoringRule: SCORING_PRESETS['BGMI Official (10-Pt)'],
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-12T18:30:00Z',
  },
  {
    id: 'tourn-2',
    name: 'PUBG Mobile Masters Series',
    game: 'PUBG Mobile',
    status: 'Live',
    description: 'Global open qualifiers round-robin stage with high-stakes placement and elimination points.',
    startDate: '2026-10-11',
    organizerName: 'Level Infinite Tournament Ops',
    expectedTeamsCount: 8,
    plannedMatchesCount: 5,
    teamIds: PUBG_MASTERS_TEAMS,
    scoringRule: SCORING_PRESETS['PUBG Mobile Classic (15-Pt)'],
    createdAt: '2026-10-02T10:00:00Z',
    updatedAt: '2026-10-12T19:00:00Z',
  },
  {
    id: 'tourn-3',
    name: 'Free Fire World Series - South Asia',
    game: 'Free Fire',
    status: 'Upcoming',
    description: 'Bermuda and Kalahari championship series with rapid rush point multipliers.',
    startDate: '2026-10-20',
    organizerName: 'Garena Esports Division',
    expectedTeamsCount: 6,
    plannedMatchesCount: 8,
    teamIds: FREE_FIRE_CHAMP_TEAMS,
    scoringRule: SCORING_PRESETS['Free Fire Standard (12-Pt)'],
    createdAt: '2026-10-04T12:00:00Z',
    updatedAt: '2026-10-04T12:00:00Z',
  },
  {
    id: 'tourn-4',
    name: 'BGMI All Stars Invitational',
    game: 'BGMI',
    status: 'Completed',
    description: 'Special invitational weekend showdown between legacy champions and rising tier-2 talents.',
    startDate: '2026-09-25',
    organizerName: 'Nodwin Gaming Arena',
    expectedTeamsCount: 10,
    plannedMatchesCount: 4,
    teamIds: PRO_LEAGUE_TEAMS,
    scoringRule: SCORING_PRESETS['BGMI Official (10-Pt)'],
    createdAt: '2026-09-20T10:00:00Z',
    updatedAt: '2026-09-28T22:00:00Z',
  },
  {
    id: 'tourn-5',
    name: 'PUBG Mobile Battle Royale Clash',
    game: 'PUBG Mobile',
    status: 'Upcoming',
    description: 'Miramar desert skirmish with intense mid-game rotation pressure and sniper shootouts.',
    startDate: '2026-10-28',
    organizerName: 'ESL Challenger Series',
    expectedTeamsCount: 8,
    plannedMatchesCount: 6,
    teamIds: PUBG_MASTERS_TEAMS,
    scoringRule: SCORING_PRESETS['PUBG Mobile Classic (15-Pt)'],
    createdAt: '2026-10-05T09:00:00Z',
    updatedAt: '2026-10-05T09:00:00Z',
  },
  {
    id: 'tourn-6',
    name: 'Free Fire Titans Cup Season 2',
    game: 'Free Fire',
    status: 'Completed',
    description: 'Final showdown of the regional summer split.',
    startDate: '2026-09-15',
    organizerName: 'Total Gaming Operations',
    expectedTeamsCount: 6,
    plannedMatchesCount: 4,
    teamIds: FREE_FIRE_CHAMP_TEAMS,
    scoringRule: SCORING_PRESETS['Free Fire Standard (12-Pt)'],
    createdAt: '2026-09-10T14:00:00Z',
    updatedAt: '2026-09-18T18:00:00Z',
  },
];

export const INITIAL_MATCHES: Match[] = [
  // Tourn 1 Matches (BGMI Pro League)
  {
    id: 'm-1-1',
    tournamentId: 'tourn-1',
    matchNumber: 1,
    scheduledDate: '2026-10-10 14:00',
    status: 'Completed',
    participatingTeamIds: PRO_LEAGUE_TEAMS,
    resultsEntered: true,
    updatedAt: '2026-10-10T14:45:00Z',
    results: [
      { teamId: 'team-1', placement: 1, eliminations: 9 }, // Soul WWCD 10 + 9 = 19
      { teamId: 'team-2', placement: 2, eliminations: 7 }, // GodL 6 + 7 = 13
      { teamId: 'team-3', placement: 3, eliminations: 4 }, // Blind 5 + 4 = 9
      { teamId: 'team-4', placement: 4, eliminations: 5 }, // OG 4 + 5 = 9
      { teamId: 'team-5', placement: 5, eliminations: 2 }, // ENT 3 + 2 = 5
      { teamId: 'team-6', placement: 6, eliminations: 3 }, // RVT 2 + 3 = 5
      { teamId: 'team-7', placement: 7, eliminations: 1 }, // TX 1 + 1 = 2
      { teamId: 'team-8', placement: 8, eliminations: 0 }, // GLAD 1 + 0 = 1
      { teamId: 'team-9', placement: 9, eliminations: 2 }, // CG 0 + 2 = 2
      { teamId: 'team-10', placement: 10, eliminations: 1 }, // MEDAL 0 + 1 = 1
    ],
  },
  {
    id: 'm-1-2',
    tournamentId: 'tourn-1',
    matchNumber: 2,
    scheduledDate: '2026-10-10 15:30',
    status: 'Completed',
    participatingTeamIds: PRO_LEAGUE_TEAMS,
    resultsEntered: true,
    updatedAt: '2026-10-10T16:15:00Z',
    results: [
      { teamId: 'team-2', placement: 1, eliminations: 11 }, // GodL WWCD 10 + 11 = 21
      { teamId: 'team-5', placement: 2, eliminations: 6 },  // ENT 6 + 6 = 12
      { teamId: 'team-1', placement: 3, eliminations: 4 },  // Soul 5 + 4 = 9
      { teamId: 'team-7', placement: 4, eliminations: 5 },  // TX 4 + 5 = 9
      { teamId: 'team-3', placement: 5, eliminations: 3 },  // Blind 3 + 3 = 6
      { teamId: 'team-4', placement: 6, eliminations: 2 },  // OG 2 + 2 = 4
      { teamId: 'team-8', placement: 7, eliminations: 2 },  // GLAD 1 + 2 = 3
      { teamId: 'team-6', placement: 8, eliminations: 1 },  // RVT 1 + 1 = 2
      { teamId: 'team-10', placement: 9, eliminations: 0 }, // MEDAL 0 + 0 = 0
      { teamId: 'team-9', placement: 10, eliminations: 1 }, // CG 0 + 1 = 1
    ],
  },
  {
    id: 'm-1-3',
    tournamentId: 'tourn-1',
    matchNumber: 3,
    scheduledDate: '2026-10-11 14:00',
    status: 'Completed',
    participatingTeamIds: PRO_LEAGUE_TEAMS,
    resultsEntered: true,
    updatedAt: '2026-10-11T14:50:00Z',
    results: [
      { teamId: 'team-7', placement: 1, eliminations: 8 },  // TX WWCD 10 + 8 = 18
      { teamId: 'team-1', placement: 2, eliminations: 6 },  // Soul 6 + 6 = 12
      { teamId: 'team-2', placement: 3, eliminations: 5 },  // GodL 5 + 5 = 10
      { teamId: 'team-6', placement: 4, eliminations: 4 },  // RVT 4 + 4 = 8
      { teamId: 'team-3', placement: 5, eliminations: 2 },  // Blind 3 + 2 = 5
      { teamId: 'team-9', placement: 6, eliminations: 3 },  // CG 2 + 3 = 5
      { teamId: 'team-5', placement: 7, eliminations: 1 },  // ENT 1 + 1 = 2
      { teamId: 'team-4', placement: 8, eliminations: 1 },  // OG 1 + 1 = 2
      { teamId: 'team-8', placement: 9, eliminations: 0 },  // GLAD 0 + 0 = 0
      { teamId: 'team-10', placement: 10, eliminations: 0 }, // MEDAL 0 + 0 = 0
    ],
  },
  {
    id: 'm-1-4',
    tournamentId: 'tourn-1',
    matchNumber: 4,
    scheduledDate: '2026-10-13 16:00',
    status: 'Scheduled',
    participatingTeamIds: PRO_LEAGUE_TEAMS,
    resultsEntered: false,
    updatedAt: '2026-10-11T15:00:00Z',
    results: [],
  },
  // Tourn 2 Matches (PUBG Mobile Masters)
  {
    id: 'm-2-1',
    tournamentId: 'tourn-2',
    matchNumber: 1,
    scheduledDate: '2026-10-11 18:00',
    status: 'Completed',
    participatingTeamIds: PUBG_MASTERS_TEAMS,
    resultsEntered: true,
    updatedAt: '2026-10-11T18:40:00Z',
    results: [
      { teamId: 'team-11', placement: 1, eliminations: 10 },
      { teamId: 'team-1', placement: 2, eliminations: 8 },
      { teamId: 'team-2', placement: 3, eliminations: 5 },
      { teamId: 'team-5', placement: 4, eliminations: 3 },
      { teamId: 'team-6', placement: 5, eliminations: 2 },
      { teamId: 'team-7', placement: 6, eliminations: 1 },
      { teamId: 'team-8', placement: 7, eliminations: 1 },
      { teamId: 'team-14', placement: 8, eliminations: 0 },
    ],
  },
  {
    id: 'm-2-2',
    tournamentId: 'tourn-2',
    matchNumber: 2,
    scheduledDate: '2026-10-12 18:00',
    status: 'Completed',
    participatingTeamIds: PUBG_MASTERS_TEAMS,
    resultsEntered: true,
    updatedAt: '2026-10-12T18:45:00Z',
    results: [
      { teamId: 'team-2', placement: 1, eliminations: 12 },
      { teamId: 'team-11', placement: 2, eliminations: 6 },
      { teamId: 'team-1', placement: 3, eliminations: 4 },
      { teamId: 'team-6', placement: 4, eliminations: 4 },
      { teamId: 'team-5', placement: 5, eliminations: 2 },
      { teamId: 'team-7', placement: 6, eliminations: 1 },
      { teamId: 'team-8', placement: 7, eliminations: 0 },
      { teamId: 'team-14', placement: 8, eliminations: 1 },
    ],
  },
];

export const INITIAL_ACTIVITY: ActivityLogItem[] = [
  {
    id: 'act-1',
    type: 'results_saved',
    title: 'Match 3 Results Recorded',
    description: 'Entered final placements & kill tallies for BGMI Pro League S4 Match 3. Team XSpark claimed WWCD.',
    timestamp: '1 hour ago',
  },
  {
    id: 'act-2',
    type: 'tournament_created',
    title: 'New Tournament Published',
    description: 'Created Free Fire World Series South Asia with 6 registered squads.',
    timestamp: '3 hours ago',
  },
  {
    id: 'act-3',
    type: 'rules_updated',
    title: 'Scoring Rules Configured',
    description: 'Configured BGMI 10-Point official placement system with 1pt per elimination.',
    timestamp: '5 hours ago',
  },
  {
    id: 'act-4',
    type: 'team_created',
    title: 'Squad Registered',
    description: 'Added True Rippers [TR] to workspace teams directory.',
    timestamp: '1 day ago',
  },
];
