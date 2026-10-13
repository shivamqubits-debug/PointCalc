import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useApp } from '../state/AppContext';
import { colors } from '../theme/colors';
import { spacing, radii } from '../theme/spacing';
import { typography } from '../theme/typography';
import { AppHeader } from '../components/navigation/AppHeader';
import { Ionicons } from '@expo/vector-icons';

export const ProfileScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const { user, tournaments, teams, matches, logout, updateProfile, navigateTo, goBack } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [organization, setOrganization] = useState(user.organization);
  const [role, setRole] = useState(user.role);

  const handleSaveProfile = () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Organizer name cannot be empty.');
      return;
    }
    updateProfile({
      name: name.trim(),
      organization: organization.trim() || 'Independent Esports',
      role: role.trim() || 'Tournament Organizer',
    });
    setIsEditing(false);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to end your active organizer session and switch to Guest Mode?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            logout();
          },
        },
      ]
    );
  };

  const initials = user.name
    ? user.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'OP';

  return (
    <View style={styles.container}>
      <AppHeader
        title="Organizer Profile"
        subtitle="Manage session, credentials & workspace scope"
        canGoBack
        onGoBack={goBack}
        isMobile={isMobile}
      />
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Card */}
        <View style={styles.headerCard}>
        <View style={styles.avatarRow}>
          <View style={[styles.avatar, { backgroundColor: user.avatarColor || colors.primaryAccent }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.userInfo}>
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.statusBadge,
                  user.isLoggedIn ? styles.statusBadgeOnline : styles.statusBadgeGuest,
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    user.isLoggedIn ? styles.dotOnline : styles.dotGuest,
                  ]}
                />
                <Text
                  style={[
                    styles.statusBadgeText,
                    user.isLoggedIn ? styles.statusTextOnline : styles.statusTextGuest,
                  ]}
                >
                  {user.isLoggedIn ? 'Authenticated Organizer' : 'Guest Session'}
                </Text>
              </View>
            </View>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userOrg}>{user.organization}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        </View>

        {isEditing ? (
          <View style={styles.editForm}>
            <Text style={styles.editSectionTitle}>Edit Organizer Profile</Text>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Display Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Full Name"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Organization / Clan</Text>
              <TextInput
                style={styles.input}
                value={organization}
                onChangeText={setOrganization}
                placeholder="e.g. Krafton Ops / Team Soul"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Role</Text>
              <TextInput
                style={styles.input}
                value={role}
                onChangeText={setRole}
                placeholder="e.g. Head Tournament Admin"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={styles.formButtonRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setName(user.name);
                  setOrganization(user.organization);
                  setRole(user.role);
                  setIsEditing(false);
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
                <Text style={styles.saveBtnText}>Save Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.headerActionRow}>
            <TouchableOpacity
              style={styles.editProfileBtn}
              onPress={() => setIsEditing(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.editProfileBtnText}>Edit Details</Text>
            </TouchableOpacity>

            {user.isLoggedIn ? (
              <TouchableOpacity
                style={styles.signOutBtn}
                onPress={handleSignOut}
                activeOpacity={0.8}
              >
                <Text style={styles.signOutBtnText}>Sign Out</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.signInBtn}
                onPress={() => navigateTo('Login')}
                activeOpacity={0.8}
              >
                <Text style={styles.signInBtnText}>Sign In / Register</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Summary Statistics */}
      <Text style={styles.sectionHeader}>ORGANIZER SCOPE</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{tournaments.length}</Text>
          <Text style={styles.statLabel}>Tournaments</Text>
          <Text style={styles.statSub}>Managed events</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{teams.length}</Text>
          <Text style={styles.statLabel}>Squads</Text>
          <Text style={styles.statSub}>Active directory</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{matches.length}</Text>
          <Text style={styles.statLabel}>Matches</Text>
          <Text style={styles.statSub}>Officiated games</Text>
        </View>
      </View>

      {/* Quick Operations Menu */}
      <Text style={styles.sectionHeader}>QUICK OPERATIONS</Text>
      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigateTo('Tournaments')}
          activeOpacity={0.7}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name="trophy-outline" size={20} color={colors.primaryAccent} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Tournament Hub</Text>
            <Text style={styles.menuDescription}>Create, edit & track competitive events</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.menuDivider} />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigateTo('Teams')}
          activeOpacity={0.7}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name="people-outline" size={20} color={colors.secondaryAccent} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Squad Rosters</Text>
            <Text style={styles.menuDescription}>Manage 16-24 team directories & player IGNs</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.menuDivider} />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigateTo('Calculator')}
          activeOpacity={0.7}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name="calculator-outline" size={20} color={colors.warning} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Instant Scoring Calculator</Text>
            <Text style={styles.menuDescription}>Fast match tally with official placement points</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.menuDivider} />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigateTo('Settings')}
          activeOpacity={0.7}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>App Preferences & Rules</Text>
            <Text style={styles.menuDescription}>Scoring presets, tie-break rules & theme settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* About Section */}
      <Text style={styles.sectionHeader}>ABOUT POINTCALC</Text>
      <View style={styles.aboutCard}>
        <View style={styles.aboutHeaderRow}>
          <Text style={styles.aboutTitle}>PointCalc Esports Engine</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionBadgeText}>v1.2.0 Mobile</Text>
          </View>
        </View>
        <Text style={styles.aboutBody}>
          Built for tournament directors running BGMI, PUBG Mobile, and Free Fire scrims & LAN tournaments.
          Operates 100% offline with zero cloud latency to ensure zero disruption during live esports matches.
        </Text>
        <View style={styles.aboutFeatureRow}>
          <View style={styles.aboutFeatureItem}>
            <Ionicons name="checkmark-circle" size={15} color={colors.primaryAccent} />
            <Text style={styles.featureText}>Offline sandbox data security</Text>
          </View>
          <View style={styles.aboutFeatureItem}>
            <Ionicons name="checkmark-circle" size={15} color={colors.primaryAccent} />
            <Text style={styles.featureText}>Instant real-time leaderboard math</Text>
          </View>
          <View style={styles.aboutFeatureItem}>
            <Ionicons name="checkmark-circle" size={15} color={colors.primaryAccent} />
            <Text style={styles.featureText}>Official 10-point, 12-point & 15-point formulas</Text>
          </View>
        </View>
      </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollArea: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: 90,
    maxWidth: 1000,
    width: '100%',
    alignSelf: 'center',
  },
  headerCard: {
    backgroundColor: colors.surfacePrimary,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#070B14',
    letterSpacing: 1,
  },
  userInfo: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
    gap: 6,
  },
  statusBadgeOnline: {
    backgroundColor: colors.primaryAccentMuted,
    borderColor: colors.primaryAccent,
    borderWidth: 1,
  },
  statusBadgeGuest: {
    backgroundColor: 'rgba(137, 149, 170, 0.15)',
    borderColor: colors.border,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotOnline: {
    backgroundColor: colors.primaryAccent,
  },
  dotGuest: {
    backgroundColor: colors.textMuted,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusTextOnline: {
    color: colors.primaryAccent,
  },
  statusTextGuest: {
    color: colors.textMuted,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  userOrg: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.secondaryAccent,
    marginTop: 1,
  },
  userEmail: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  headerActionRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  editProfileBtn: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  editProfileBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  signOutBtn: {
    flex: 1,
    backgroundColor: colors.errorMuted,
    borderWidth: 1,
    borderColor: colors.error,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  signOutBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.error,
  },
  signInBtn: {
    flex: 1,
    backgroundColor: colors.primaryAccent,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  signInBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#070B14',
  },
  editForm: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  editSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  fieldGroup: {
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '700',
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 13,
    color: colors.textPrimary,
  },
  formButtonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: colors.primaryAccent,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#070B14',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: spacing.sm,
    letterSpacing: 0.8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfacePrimary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primaryAccent,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 2,
  },
  statSub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  menuContainer: {
    backgroundColor: colors.surfacePrimary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  menuDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 60,
  },
  aboutCard: {
    backgroundColor: colors.surfacePrimary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  aboutHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  aboutTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  versionBadge: {
    backgroundColor: colors.secondaryAccentMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.secondaryAccent,
  },
  versionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.secondaryAccent,
  },
  aboutBody: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 6,
    marginBottom: spacing.md,
  },
  aboutFeatureRow: {
    gap: 8,
  },
  aboutFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});
