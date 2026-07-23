import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { useSpeech } from '@/hooks/use-speech';
import { useProfileStore } from '@/stores/profile-store';
import { Spacing } from '@/constants/theme';
import { generateForecast, calculateEnergyScore, calculateLifePath, calculatePersonalYear, calculateChineseZodiac, calculateSunSign, getDailyMessage } from '@/utils/calculations';
import type { ForecastPeriod } from '@/types/cosmic';

const PERIODS: { key: ForecastPeriod; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
];

const CATEGORY_ICONS: Record<string, string> = {
  love: '❤',
  career: '💼',
  health: '💪',
  finance: '💰',
  spiritual: '🌌',
  travel: '✈',
  education: '📚',
};

function getLevelColor(level: 'high' | 'moderate' | 'low', theme: any): string {
  switch (level) {
    case 'high': return theme.accentGreen;
    case 'moderate': return theme.accentOrange;
    case 'low': return theme.accent;
  }
}

function getLevelValue(level: 'high' | 'moderate' | 'low'): number {
  switch (level) {
    case 'high': return 0.85;
    case 'moderate': return 0.55;
    case 'low': return 0.25;
  }
}

export default function ForecastScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const activeProfile = useProfileStore((s) => s.activeProfile);
  const { speak, isSpeaking } = useSpeech();
  const [period, setPeriod] = useState<ForecastPeriod>('daily');

  const data = useMemo(() => {
    if (!activeProfile) return null;
    const forecast = generateForecast(activeProfile.birthDate, period);
    const energy = calculateEnergyScore(activeProfile.birthDate);
    const dailyMsg = getDailyMessage(activeProfile.birthDate, activeProfile.name);
    const [y, m, d] = activeProfile.birthDate.split('-').map(Number);
    return {
      forecast,
      energy,
      dailyMsg,
      sunSign: capitalize(calculateSunSign(m, d)),
      lifePath: calculateLifePath(activeProfile.birthDate),
      personalYear: calculatePersonalYear(activeProfile.birthDate),
      chineseAnimal: capitalize(calculateChineseZodiac(y)),
    };
  }, [activeProfile, period]);

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.six }}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.text }]}>Forecast</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Daily, weekly, monthly & yearly predictions</Text>
          </View>
          {data && (
            <Pressable
              onPress={() => {
                const txt = `Forecast for ${activeProfile?.name}. ${data.forecast.love}. ${data.forecast.career}. ${data.forecast.health}. ${data.forecast.finance}. Energy score ${data.energy.overall} out of 100. ${data.energy.planetaryRuler}. ${data.energy.lunarInfluence}`;
                speak(txt);
              }}
              style={({ pressed }) => [styles.speakBtn, { backgroundColor: isSpeaking ? theme.accent + '30' : theme.card, borderColor: theme.cardBorder, opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={[styles.speakIcon, { color: theme.accent }]}>{isSpeaking ? '⏹' : '🔊'}</Text>
            </Pressable>
          )}
        </View>

        {!activeProfile ? (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>No Profile</Text>
            <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>Create a profile to see your forecast.</Text>
          </View>
        ) : data ? (
          <>
            <View style={styles.periodRow}>
              {PERIODS.map(({ key, label }) => (
                <Pressable key={key} onPress={() => setPeriod(key)}
                  style={[styles.periodBtn, { backgroundColor: period === key ? theme.accent : theme.surface, borderColor: period === key ? theme.accent : theme.border }]}>
                  <Text style={[styles.periodText, { color: period === key ? '#fff' : theme.text, fontWeight: period === key ? '700' : '500' }]}>{label}</Text>
                </Pressable>
              ))}
            </View>

            <View style={[styles.energyCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Text style={[styles.energyLabel, { color: theme.textSecondary }]}>Today&apos;s Energy</Text>
              <View style={styles.energyRow}>
                <Text style={[styles.energyScore, { color: theme.accent }]}>{data.energy.overall}</Text>
                <Text style={[styles.energyMax, { color: theme.textSecondary }]}>/100</Text>
              </View>

              <View style={[styles.influenceCard, { backgroundColor: theme.surface }]}>
                <Text style={[styles.influenceLabel, { color: theme.accent }]}>Planetary Ruler</Text>
                <Text style={[styles.influenceText, { color: theme.text }]}>{data.energy.planetaryRuler}</Text>
              </View>
              <View style={[styles.influenceCard, { backgroundColor: theme.surface }]}>
                <Text style={[styles.influenceLabel, { color: theme.accent }]}>Lunar Influence</Text>
                <Text style={[styles.influenceText, { color: theme.text }]}>{data.energy.lunarInfluence}</Text>
              </View>

              <View style={styles.energyBars}>
                {(['career', 'love', 'finance', 'health', 'spiritual'] as const).map((cat) => {
                  const color = getLevelColor(data.energy[cat], theme);
                  const pct = getLevelValue(data.energy[cat]) * 100;
                  return (
                    <View key={cat} style={styles.energyBarWrap}>
                      <View style={[styles.energyBar, { backgroundColor: color + '20' }]}>
                        <View style={[styles.energyBarFill, { backgroundColor: color, width: `${pct}%` as any }]} />
                        <Text style={styles.energyBarLabel}>{capitalize(cat)}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={[styles.messageCard, { backgroundColor: theme.card, borderColor: theme.accent + '60' }]}>
              <View style={styles.messageHeader}>
                <Text style={[styles.messageLabel, { color: theme.textSecondary }]}>Today&apos;s Theme</Text>
                <View style={[styles.themeBadge, { backgroundColor: theme.accent + '20' }]}>
                  <Text style={[styles.themeText, { color: theme.accent }]}>{data.dailyMsg.theme}</Text>
                </View>
              </View>
              <Text style={[styles.affirmation, { color: theme.text }]}>This is your affirmation: {data.dailyMsg.affirmation}</Text>
              <Text style={[styles.mantra, { color: theme.accent }]}>✦ {data.dailyMsg.mantra}</Text>
              <Text style={[styles.focus, { color: theme.textSecondary }]}>🎯 {data.dailyMsg.focus}</Text>
            </View>

            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Profile Info</Text>
              <Text style={[styles.statRow, { color: theme.text }]}>☀ Sun Sign: {data.sunSign}</Text>
              <Text style={[styles.statRow, { color: theme.text }]}>🔢 Life Path: {data.lifePath}</Text>
              <Text style={[styles.statRow, { color: theme.text }]}>📅 Personal Year: {data.personalYear}</Text>
              <Text style={[styles.statRow, { color: theme.text }]}>🐉 Chinese Zodiac: {data.chineseAnimal}</Text>
            </View>

            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{period.charAt(0).toUpperCase() + period.slice(1)} Reading</Text>
              {(['love', 'career', 'health', 'finance'] as const).map((cat) => (
                <View key={cat} style={styles.readingRow}>
                  <Text style={styles.readingIcon}>{CATEGORY_ICONS[cat]}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.readingLabel, { color: theme.accent }]}>{capitalize(cat)}</Text>
                    <Text style={[styles.readingText, { color: theme.text }]}>{data.forecast[cat]}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Additional Insights</Text>
              {(['spiritual', 'travel', 'education'] as const).map((cat) => (
                <View key={cat} style={styles.readingRow}>
                  <Text style={styles.readingIcon}>{CATEGORY_ICONS[cat]}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.readingLabel, { color: theme.accent }]}>{capitalize(cat)}</Text>
                    <Text style={[styles.readingText, { color: theme.text }]}>{data.forecast[cat]}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

function capitalize(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.three },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 15, marginBottom: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  speakBtn: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  speakIcon: { fontSize: 20 },
  card: { borderRadius: 14, borderWidth: 1, padding: Spacing.four, gap: 10 },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  cardDesc: { fontSize: 14, textAlign: 'center' },
  periodRow: { flexDirection: 'row', gap: 8 },
  periodBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  periodText: { fontSize: 12 },
  messageCard: { borderRadius: 16, borderWidth: 1, padding: Spacing.four, gap: 10 },
  messageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  messageLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  themeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  themeText: { fontSize: 13, fontWeight: '700' },
  affirmation: { fontSize: 17, fontWeight: '600', lineHeight: 24, fontStyle: 'italic' },
  mantra: { fontSize: 14, fontWeight: '700', textAlign: 'center', paddingVertical: 6 },
  focus: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
  energyCard: { borderRadius: 20, borderWidth: 1, padding: Spacing.four, gap: 6 },
  energyLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  energyRow: { flexDirection: 'row', alignItems: 'baseline' },
  energyScore: { fontSize: 56, fontWeight: '900' },
  energyMax: { fontSize: 20, fontWeight: '600', marginLeft: 4 },
  influenceCard: { borderRadius: 10, padding: Spacing.three, gap: 2 },
  influenceLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  influenceText: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
  energyBars: { gap: 10, marginTop: 4 },
  energyBarWrap: { height: 32 },
  energyBar: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  energyBarFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 8,
  },
  energyBarLabel: {
    paddingHorizontal: 14,
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    zIndex: 1,
  },
  statLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  statRow: { fontSize: 15, fontWeight: '500' },
  readingRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  readingIcon: { fontSize: 18, marginTop: 2 },
  readingLabel: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  readingText: { fontSize: 14, lineHeight: 20 },
});
