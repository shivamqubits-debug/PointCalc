import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/state/AppContext';
import { NavigationShell } from './src/components/navigation/NavigationShell';
import { colors } from './src/theme/colors';

// Screens
import { DashboardScreen } from './src/screens/DashboardScreen';
import { TournamentsScreen } from './src/screens/TournamentsScreen';
import { TournamentDetailsScreen } from './src/screens/TournamentDetailsScreen';
import { TeamsScreen } from './src/screens/TeamsScreen';
import { MatchesScreen } from './src/screens/MatchesScreen';
import { LeaderboardsScreen } from './src/screens/LeaderboardsScreen';
import { CalculatorScreen } from './src/screens/CalculatorScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { SignupScreen } from './src/screens/SignupScreen';

const ScreenRouter: React.FC = () => {
  const { currentScreen } = useApp();

  switch (currentScreen) {
    case 'Dashboard':
      return <DashboardScreen />;
    case 'Tournaments':
      return <TournamentsScreen />;
    case 'TournamentDetails':
      return <TournamentDetailsScreen />;
    case 'Teams':
      return <TeamsScreen />;
    case 'Matches':
      return <MatchesScreen />;
    case 'Leaderboards':
      return <LeaderboardsScreen />;
    case 'Calculator':
      return <CalculatorScreen />;
    case 'Settings':
      return <SettingsScreen />;
    case 'Profile':
      return <ProfileScreen />;
    case 'Login':
      return <LoginScreen />;
    case 'Signup':
      return <SignupScreen />;
    default:
      return <DashboardScreen />;
  }
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="light" />
        <View style={styles.root}>
          <NavigationShell>
            <ScreenRouter />
          </NavigationShell>
        </View>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
