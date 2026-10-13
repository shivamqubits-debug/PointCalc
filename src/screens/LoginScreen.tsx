import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing, radii } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useApp } from '../state/AppContext';
import { AppHeader } from '../components/navigation/AppHeader';
import { FormField } from '../components/common/FormField';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { SecondaryButton } from '../components/common/SecondaryButton';
import { Ionicons } from '@expo/vector-icons';

export const LoginScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const { login, navigateTo, goBack } = useApp();

  const [email, setEmail] = useState('alex.mercer@krafton-ops.gg');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email.trim()) {
      errs.email = 'Email address or organizer ID is required.';
    } else if (!email.includes('@')) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!password.trim()) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      login(email.trim());
      setLoading(false);
      navigateTo('Profile');
    }, 300);
  };

  const handleGuestAccess = () => {
    login('guest.organizer@pointcalc.local', 'Guest Organizer', 'Demo Esports Hub');
    navigateTo('Dashboard');
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Organizer Sign In"
        subtitle="Access your local esports tournaments and squads"
        canGoBack
        onGoBack={goBack}
        isMobile={isMobile}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.authCard}>
          {/* Brand Header */}
          <View style={styles.brandBadge}>
            <View style={styles.iconCircle}>
              <Ionicons name="flash" size={24} color={colors.textInverse} />
            </View>
            <Text style={styles.brandTitle}>POINTCALC</Text>
            <Text style={styles.brandSubtitle}>ESPORTS TOURNAMENT HUB</Text>
          </View>

          <Text style={styles.heading}>Welcome Back, Organizer</Text>
          <Text style={styles.subheading}>
            Sign in to manage competitive lobbies, calculate standings, and verify match results.
          </Text>

          {/* Form Fields */}
          <FormField
            label="Organizer Email / ID"
            required
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
            }}
            placeholder="organizer@tournament.gg"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <View style={styles.passwordWrapper}>
            <FormField
              label="Password"
              required
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
              }}
              placeholder="••••••••••••"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              error={errors.password}
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={colors.textSecondary}
              />
            </Pressable>
          </View>

          {/* Options Row */}
          <View style={styles.optionsRow}>
            <Pressable
              onPress={() => setRememberMe(!rememberMe)}
              style={styles.rememberRow}
            >
              <Ionicons
                name={rememberMe ? 'checkbox' : 'square-outline'}
                size={18}
                color={rememberMe ? colors.primaryAccent : colors.textMuted}
              />
              <Text style={styles.rememberText}>Remember session</Text>
            </Pressable>

            <Pressable onPress={() => alert('Phase 1 operates in local session mode. Password reset will be enabled in Phase 2 cloud sync.')}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>
          </View>

          {/* Primary Submit */}
          <PrimaryButton
            label="Sign In as Organizer"
            iconName="log-in-outline"
            onPress={handleLogin}
            loading={loading}
            size="lg"
            style={styles.submitBtn}
          />

          {/* Quick Demo Fill Shortcut */}
          <SecondaryButton
            label="Continue as Guest Organizer"
            iconName="person-outline"
            onPress={handleGuestAccess}
            size="md"
            style={styles.guestBtn}
          />

          {/* Switch to Signup */}
          <View style={styles.switchRow}>
            <Text style={styles.switchPrompt}>New to PointCalc?</Text>
            <Pressable onPress={() => navigateTo('Signup')}>
              <Text style={styles.switchLink}> Create an Account</Text>
            </Pressable>
          </View>

          {/* Offline Architecture Notice */}
          <View style={styles.noticeBox}>
            <Ionicons name="information-circle-outline" size={16} color={colors.secondaryAccent} />
            <Text style={styles.noticeText}>
              Phase 1 Local Mode: Credentials and session preferences are stored locally in your app session.
            </Text>
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
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authCard: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: colors.surfacePrimary,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
  },
  brandBadge: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.primaryAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  brandTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  brandSubtitle: {
    ...typography.captionBold,
    color: colors.primaryAccent,
    fontSize: 10,
    letterSpacing: 1.2,
  },
  heading: {
    ...typography.h2,
    color: colors.textPrimary,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 4,
  },
  subheading: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.xl,
  },
  passwordWrapper: {
    position: 'relative',
  },
  eyeBtn: {
    position: 'absolute',
    right: spacing.md,
    top: 36,
    padding: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rememberText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  forgotText: {
    ...typography.captionBold,
    color: colors.primaryAccent,
    fontSize: 12,
  },
  submitBtn: {
    marginBottom: spacing.md,
  },
  guestBtn: {
    marginBottom: spacing.lg,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  switchPrompt: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 13,
  },
  switchLink: {
    ...typography.bodyBold,
    color: colors.primaryAccent,
    fontSize: 13,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noticeText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
  },
});
