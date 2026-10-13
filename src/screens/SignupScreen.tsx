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
import { Ionicons } from '@expo/vector-icons';

export const SignupScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const { signup, navigateTo, goBack } = useApp();

  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Full name is required.';
    if (!organization.trim()) errs.organization = 'Organization name is required.';
    if (!email.trim() || !email.includes('@')) errs.email = 'Valid email is required.';
    if (!password.trim() || password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }
    if (!termsAccepted) {
      errs.terms = 'Please accept tournament organizer guidelines.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignup = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      signup(email.trim(), name.trim(), organization.trim());
      setLoading(false);
      navigateTo('Profile');
    }, 300);
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Register Organizer"
        subtitle="Create your local tournament management account"
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
          {/* Header */}
          <View style={styles.brandBadge}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark" size={24} color={colors.textInverse} />
            </View>
            <Text style={styles.brandTitle}>POINTCALC</Text>
            <Text style={styles.brandSubtitle}>NEW ORGANIZER REGISTRATION</Text>
          </View>

          <Text style={styles.heading}>Create Organizer Profile</Text>
          <Text style={styles.subheading}>
            Set up your organization credentials to manage regional lobbies and official standings.
          </Text>

          {/* Form */}
          <FormField
            label="Full Name"
            required
            value={name}
            onChangeText={(t) => {
              setName(t);
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
            }}
            placeholder="e.g. Marcus Vance"
            error={errors.name}
          />

          <FormField
            label="Organization / Esports League"
            required
            value={organization}
            onChangeText={(t) => {
              setOrganization(t);
              if (errors.organization) setErrors((prev) => ({ ...prev, organization: '' }));
            }}
            placeholder="e.g. Apex Battleground Series"
            error={errors.organization}
          />

          <FormField
            label="Email Address"
            required
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
            }}
            placeholder="marcus@apexseries.gg"
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
              placeholder="At least 6 characters"
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

          <FormField
            label="Confirm Password"
            required
            value={confirmPassword}
            onChangeText={(t) => {
              setConfirmPassword(t);
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
            }}
            placeholder="Re-enter password"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            error={errors.confirmPassword}
          />

          {/* Terms checkbox */}
          <Pressable
            onPress={() => setTermsAccepted(!termsAccepted)}
            style={styles.termsRow}
          >
            <Ionicons
              name={termsAccepted ? 'checkbox' : 'square-outline'}
              size={18}
              color={termsAccepted ? colors.primaryAccent : colors.textMuted}
            />
            <Text style={styles.termsText}>
              I accept fair play tournament management rules and local guidelines.
            </Text>
          </Pressable>
          {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

          {/* Submit */}
          <PrimaryButton
            label="Create Organizer Account"
            iconName="checkmark-circle-outline"
            onPress={handleSignup}
            loading={loading}
            size="lg"
            style={styles.submitBtn}
          />

          {/* Switch to Login */}
          <View style={styles.switchRow}>
            <Text style={styles.switchPrompt}>Already registered?</Text>
            <Pressable onPress={() => navigateTo('Login')}>
              <Text style={styles.switchLink}> Sign In Instead</Text>
            </Pressable>
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
    maxWidth: 480,
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
    backgroundColor: colors.secondaryAccent,
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
    color: colors.secondaryAccent,
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
    marginBottom: spacing.lg,
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
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    marginTop: spacing.xs,
  },
  termsText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginBottom: spacing.md,
  },
  submitBtn: {
    marginBottom: spacing.lg,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
});
