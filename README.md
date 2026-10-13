# PointCalc — Esports Tournament Operations Manager (Phase 1)

A responsive mobile and tablet-first esports tournament management application built with **React Native**, **TypeScript**, and **Expo SDK 57**. 

Engineered specifically for competitive battle royale tournament organizers running matches in **BGMI (Battlegrounds Mobile India)**, **PUBG Mobile**, and **Free Fire**.

---

## 🎮 Product Identity & Design Direction

PointCalc features a dark, technical esports operations aesthetic tailored for high-contrast scanning during live tournament broadcasts:

- **Primary Canvas**: `#0B0F17` (Deep Midnight Esports Black)
- **Sidebar & Rails**: `#0E1420` (Dark Charcoal Slate)
- **Surfaces**: `#131A26` (Primary) & `#192333` (Elevated Panels)
- **Brand Accent**: `#B8F34A` (Electric Neon Lime)
- **Secondary Accent**: `#55D8F2` (Cyan Esports Blue)
- **Status Accents**: `#FF707A` (Live), `#FFB454` (Upcoming), `#64D991` (Completed)
- **Rank Highlights**: Subtle Gold (`#FFD700`), Silver (`#C0C0C0`), and Bronze (`#CD7F32`)

---

## 📱 Supported Targets & Responsiveness

- **Android Mobile & Tablets**
- **iOS Mobile & Tablets**
- **Web Preview & Testing** (via React Native Web & Metro bundler)
- **Dynamic Responsive Layout**:
  - **Tablets & Desktop (width >= 768px)**: Fixed side navigation rail with collapsible mode, multi-column tournament & stat grids, and expansive leaderboard tables.
  - **Phones (width < 768px)**: Bottom tab navigation (`Hub`, `Tourneys`, `Matches`, `Points`, `More`), compact headers, and swipeable leaderboard tables with sticky rank indicators.

---

## 🏗️ Architecture & Component Directory

```text
PointCalc/
├── src/
│   ├── theme/
│   │   ├── colors.ts            # Centralized design tokens
│   │   ├── spacing.ts           # 4px incremental spacing, radii, layout scales
│   │   └── typography.ts        # Platform system typography hierarchy
│   ├── models/
│   │   └── types.ts             # Domain models (Tournaments, Teams, Matches, Rules)
│   ├── data/
│   │   └── seedData.ts          # Realistic seed data (BGMI, PUBG Mobile, Free Fire)
│   ├── scoring/
│   │   └── scoringEngine.ts     # Pure, testable scoring calculations & tie-breakers
│   ├── state/
│   │   └── AppContext.tsx       # Unified in-memory state management & navigation
│   ├── components/
│   │   ├── common/
│   │   │   ├── AppHeader.tsx
│   │   │   ├── PrimaryButton.tsx
│   │   │   ├── SecondaryButton.tsx
│   │   │   ├── SearchInput.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── FormField.tsx
│   │   │   ├── ModalContainer.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   └── SegmentedControl.tsx
│   │   ├── navigation/
│   │   │   ├── NavigationShell.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── BottomTabBar.tsx
│   │   ├── tournaments/
│   │   │   ├── TournamentCard.tsx
│   │   │   └── TournamentFormModal.tsx
│   │   ├── teams/
│   │   │   ├── TeamCard.tsx
│   │   │   └── TeamFormModal.tsx
│   │   ├── matches/
│   │   │   ├── MatchCard.tsx
│   │   │   ├── MatchFormModal.tsx
│   │   │   └── MatchResultModal.tsx
│   │   └── leaderboards/
│   │       └── LeaderboardTable.tsx
│   ├── screens/
│   │   ├── DashboardScreen.tsx
│   │   ├── TournamentsScreen.tsx
│   │   ├── TournamentDetailsScreen.tsx
│   │   ├── TeamsScreen.tsx
│   │   ├── MatchesScreen.tsx
│   │   ├── LeaderboardsScreen.tsx
│   │   ├── CalculatorScreen.tsx
│   │   └── SettingsScreen.tsx
│   └── __tests__/
│       ├── scoringEngine.test.ts
│       └── tournamentState.test.ts
├── App.tsx                      # Root component & SafeAreaProvider
├── jest.config.js               # Jest & ts-jest test runner config
├── package.json
└── tsconfig.json
```

---

## ⚡ Implemented Features (Phase 1)

### 1. Dashboard / Overview
- **Hero Banner**: `Every match. Every point.` with quick tournament creation CTA.
- **Derived Real-Time Statistics**: Total Tournaments, Live Competitions, Registered Teams, and Total Matches calculated dynamically from current state.
- **Recent Tournaments**: Quick access cards with game identities, team counts, and match progress.
- **Live Activity Stream**: Tracks actions performed in the current session (creations, result entries, squad registrations).

### 2. Tournament Management
- **Search & Filter**: Real-time filtering by tournament name, description, game (`BGMI`, `PUBG Mobile`, `Free Fire`, `Other`), and status (`Live`, `Upcoming`, `Completed`).
- **Sorting**: By Recently Updated, Alphabetical Name, Squad Count, or Match Count.
- **Actions**: Open details, edit tournament, duplicate tournament with a fresh ID, and delete with safety confirmation.

### 3. Create & Edit Tournament Form
- Full modal dialog with input validation (whitespace trimming, required fields).
- Automatic default scoring preset assignment based on game title.
- Expected teams and planned matches configuration.

### 4. Tournament Details Workspace
Deep workspace tabbed interface containing:
- **Overview**: Status metrics, quick action shortcuts, top 5 leaderboard preview, and recent matches.
- **Teams**: Participating squads, roster view, add existing workspace squads, or register new squads.
- **Matches**: Match round schedule with WWCD winner highlights, result entry status badges, and round management.
- **Point Table**: Official cumulative tournament leaderboard calculated live.
- **Scoring Rules**: Configurable kill point multipliers, custom 1..16 placement point mappings, preset loaders, and tie-breaking priorities.

### 5. Squad Management (Teams Directory)
- Workspace-wide team directory with player rosters (IGL, Assaulters, Fraggers, Support).
- Color accents, acronym initials avatars, and tournament participation counts.
- Add/remove players dynamically in team creation/edit modals.

### 6. Match Management & Result Entry
- Multi-tournament match management with status filtering.
- **Match Result Entry Modal**:
  - Validates positive integers, prevents duplicate placements, and flags non-participating teams.
  - Live calculation preview showing placement points + elimination points for every squad before submitting.
  - "Auto-Rank 1..N" helper button for quick organizer drafting.

### 7. Leaderboards
- Dual-scope view: **Overall Tournament Standings** or **Individual Match Rounds**.
- Filter by squad name or tag.
- Deterministic tie-breaking rules:
  - `PlacementPointsFirst`
  - `EliminationsFirst`
  - `MostWinsFirst`

### 8. Standalone Point Calculator Simulator
- Interactive sandbox to test scoring rules without touching tournament records.
- Load official presets (BGMI 10-Pt, PUBG Mobile 15-Pt, Free Fire 12-Pt).
- Dynamic real-time sorting as scores and placements are adjusted.

### 9. Settings
- **Table Density**: Toggle between `Comfortable` and `Compact` (immediately alters table padding across leaderboards).
- **Default Game**: Configure default title for new competitions.
- **Confirmation Preferences**: Toggle safety dialogs for destructive actions.
- **Reset In-Memory Data**: One-click restore to pristine demo seed state with confirmation.

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
```bash
npm install
```

### Run on Mobile (Android / iOS)
```bash
# Start the Expo interactive development server
npm start

# For Android device or emulator:
npm run android

# For iOS Simulator (macOS only):
npm run ios
```

### Run on Web Preview
```bash
# Starts local web dev server
npm run web
```

### Type Checking
```bash
npm run typecheck
```

### Unit Tests
```bash
npm test
```
All 17 tests verify match validation, scoring calculations, tie-breaking rules, and tournament state mutations.

---

## 🔮 Phase 2 Roadmap
- SQLite / AsyncStorage local persistence layer.
- Export leaderboards as high-resolution PNG overlay images for broadcast streams.
- CSV / JSON tournament roster import and export.
- Offline-first cloud sync with multi-organizer collaboration.
