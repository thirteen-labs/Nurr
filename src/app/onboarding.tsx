import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { useAppStore } from '@/stores/app-store';
import { CosmicIcon, type CosmicIconName } from '@/components/cosmic-icon';

interface Step {
  title: string;
  subtitle: string;
  icon: CosmicIconName;
  description: string;
  features?: string[];
}

const STEPS: Step[] = [
  {
title: 'Welcome to Asterion',
    subtitle: 'Your Personal Spiritual Intelligence Platform',
    icon: 'MagicStar',
    description: 'Discover the cosmos within you. Asterion is a fully offline, privacy-first spiritual platform that combines numerology, astrology, tarot, and more — all generated locally on your device.',
    features: ['No internet required', '100% private — no data leaves your device', 'Unlimited profiles for family & friends'],
  },
  {
    title: 'Create Your Profile',
    subtitle: 'Your cosmic journey begins here',
    icon: 'Profile',
    description: 'Start by creating a profile with your birth details. You can create multiple profiles for yourself, partners, family members, or friends — all stored securely on your device.',
    features: ['Enter name, birth date, time & location', 'Multiple profile types: Self, Partner, Friend, Child, Family, Client', 'Switch between profiles instantly'],
  },
  {
    title: 'Explore Your Cosmos',
    subtitle: 'Everything at your fingertips',
    icon: 'Star1',
    description: 'Dive into your Cosmic Blueprint — a complete spiritual profile that includes your Sun Sign, Moon Sign, Rising Sign, Chinese Zodiac, Life Path Number, and more.',
    features: ['Western & Chinese Astrology', 'Numerology, Tarot & Angel Numbers', 'Dream Interpretation & Spirit Animals', 'Compatibility Analysis & Forecasts'],
  },
  {
    title: 'Ready to Begin',
    subtitle: 'The universe is waiting',
    icon: 'Send2',
    description: 'You now have everything you need to explore your cosmic self. Start by creating your first profile, then discover your complete spiritual blueprint.',
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [step, setStep] = useState(0);

  const updateSettings = useAppStore((s) => s.updateSettings);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleNext = async () => {
    if (isLast) {
      await updateSettings({ onboardingComplete: true });
      router.navigate('/profile-create');
    } else {
      setStep(step + 1);
    }
  };

  const handleSkip = async () => {
    await updateSettings({ onboardingComplete: true });
    router.navigate('/');
  };

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.six }}>
      <View style={styles.content}>
        <Pressable onPress={handleSkip} style={styles.skipBtn}>
          <Text style={[styles.skipText, { color: theme.textSecondary }]}>Skip</Text>
        </Pressable>

        <View style={styles.stepIndicator}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: i === step ? theme.accent : theme.border }]} />
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <CosmicIcon name={current.icon} size={72} color={theme.accent} />
          <Text style={[styles.title, { color: theme.text }]}>{current.title}</Text>
          <Text style={[styles.subtitle, { color: theme.accent }]}>{current.subtitle}</Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>{current.description}</Text>

          {current.features && (
            <View style={styles.featureList}>
              {current.features.map((f, i) => (
                <View key={i} style={styles.featureRow}>
                  <Text style={[styles.featureBullet, { color: theme.accent }]}>✦</Text>
                  <Text style={[styles.featureText, { color: theme.text }]}>{f}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <Pressable onPress={handleNext} style={[styles.nextBtn, { backgroundColor: theme.accent }]}>
          <Text style={styles.nextBtnText}>{isLast ? 'Create Profile' : 'Continue'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.four },
  skipBtn: { alignSelf: 'flex-end', paddingVertical: 8, paddingHorizontal: 12 },
  skipText: { fontSize: 15, fontWeight: '600' },
  stepIndicator: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  card: { borderRadius: 20, borderWidth: 1, padding: Spacing.four, alignItems: 'center', gap: 12 },

  title: { fontSize: 24, fontWeight: '900', textAlign: 'center' },
  subtitle: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
  description: { fontSize: 15, lineHeight: 22, textAlign: 'center' },
  featureList: { width: '100%', gap: 8, marginTop: 8 },
  featureRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  featureBullet: { fontSize: 14, marginTop: 2 },
  featureText: { fontSize: 14, flex: 1, lineHeight: 20 },
  nextBtn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
