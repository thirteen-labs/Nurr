import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { useProfileStore } from '@/stores/profile-store';
import { Spacing } from '@/constants/theme';
import { calculateTransits, calculateSunSign, calculateMoonSign, calculateRisingSign } from '@/utils/calculations';
import type { PlanetName, ZodiacSign } from '@/types/cosmic';

const PLANET_SYMBOLS: Record<PlanetName, string> = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
  jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
};

const SIGN_EMOJIS: Record<ZodiacSign, string> = {
  aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋',
  leo: '♌', virgo: '♍', libra: '♎', scorpio: '♏',
  sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓',
};

const ASPECT_COLORS: Record<string, string> = {
  conjunction: '#3b82f6', sextile: '#22c55e', square: '#ef4444', trine: '#a855f7', opposition: '#f97316',
};

export default function TransitsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const activeProfile = useProfileStore((s) => s.activeProfile);
  const [showAll, setShowAll] = useState(false);

  const report = useMemo(() => {
    if (!activeProfile) return null;
    const [y, m, d] = activeProfile.birthDate.split('-').map(Number);
    const sunSign = calculateSunSign(m, d);
    const moonSign = calculateMoonSign(sunSign, y);
    const hour = activeProfile.birthTime ? parseInt(activeProfile.birthTime.split(':')[0]) : 12;
    const risingSign = calculateRisingSign(sunSign, hour);
    return calculateTransits(
      activeProfile.id, activeProfile.birthDate, activeProfile.birthTime,
      sunSign, moonSign, risingSign,
    );
  }, [activeProfile]);

  if (!activeProfile || !report) {
    return (
      <ScrollView style={[styles.scroll, { backgroundColor: theme.background }]}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.six }}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>Transits</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Current planetary movements through your chart</Text>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>No Profile</Text>
            <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>Create a profile to see transit analysis.</Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  const displayedTransits = showAll ? report.transits : report.significantTransits;

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.six }}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Transits</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Planetary positions for {report.date}</Text>

        <View style={[styles.themeCard, { backgroundColor: theme.card, borderColor: theme.accent + '40' }]}>
          <Text style={[styles.themeLabel, { color: theme.textSecondary }]}>Overall Theme</Text>
          <Text style={[styles.themeText, { color: theme.text }]}>{report.overallTheme}</Text>
        </View>

        {report.advice.length > 0 && (
          <View style={[styles.adviceCard, { backgroundColor: theme.accent + '10', borderColor: theme.accent + '30' }]}>
            <Text style={[styles.adviceTitle, { color: theme.accent }]}>✦ Guidance</Text>
            {report.advice.map((adv, i) => (
              <Text key={i} style={[styles.adviceItem, { color: theme.text }]}>{adv}</Text>
            ))}
          </View>
        )}

        <View style={styles.toggleRow}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {showAll ? 'All Transits' : 'Significant Transits'}
          </Text>
          <Pressable
            onPress={() => setShowAll(!showAll)}
            style={({ pressed }) => [styles.toggleBtn, { backgroundColor: theme.card, borderColor: theme.cardBorder, opacity: pressed ? 0.8 : 1 }]}
          >
            <Text style={[styles.toggleText, { color: theme.accent }]}>{showAll ? 'Show Key' : 'Show All'}</Text>
          </Pressable>
        </View>

        {displayedTransits.map((transit) => {
           const hasAspect = transit.aspectToNatal !== null;
          return (
            <View
              key={transit.planet}
              style={[
                styles.transitCard,
                {
                  backgroundColor: theme.card,
                  borderColor: hasAspect ? (ASPECT_COLORS[transit.aspectToNatal!] ?? theme.cardBorder) + '60' : theme.cardBorder,
                },
              ]}
            >
              <View style={styles.transitHeader}>
                <Text style={styles.planetSymbol}>{PLANET_SYMBOLS[transit.planet]}</Text>
                <View style={{ flex: 1 }}>
                  <View style={styles.transitTitleRow}>
                    <Text style={[styles.planetName, { color: theme.text }]}>{capitalize(transit.planet)}</Text>
                    {transit.retrograde && <Text style={styles.retroBadge}>Rx</Text>}
                  </View>
                  <Text style={[styles.transitPosition, { color: theme.textSecondary }]}>
                    {SIGN_EMOJIS[transit.currentSign]} {capitalize(transit.currentSign)} {transit.currentDegree.toFixed(1)}°
                    {' → '}House {transit.transitHouse}
                  </Text>
                </View>
                {hasAspect && (
                  <View style={[styles.aspectBadge, { backgroundColor: (ASPECT_COLORS[transit.aspectToNatal!] ?? '#666') + '20' }]}>
                    <Text style={[styles.aspectBadgeText, { color: ASPECT_COLORS[transit.aspectToNatal!] ?? '#666' }]}>
                      {capitalize(transit.aspectToNatal!)}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.natalRow}>
                <Text style={[styles.natalLabel, { color: theme.textTertiary }]}>Natal:</Text>
                <Text style={[styles.natalValue, { color: theme.textSecondary }]}>
                  {SIGN_EMOJIS[transit.natalSign]} {capitalize(transit.natalSign)} (House {transit.natalHouse})
                </Text>
              </View>

              <Text style={[styles.transitInterp, { color: theme.textSecondary }]} numberOfLines={showAll ? undefined : 3}>
                {transit.interpretation}
              </Text>
            </View>
          );
        })}

        {!showAll && report.transits.length > report.significantTransits.length && (
          <Pressable
            onPress={() => setShowAll(true)}
            style={({ pressed }) => [styles.showMoreBtn, { backgroundColor: theme.card, borderColor: theme.cardBorder, opacity: pressed ? 0.8 : 1 }]}
          >
            <Text style={[styles.showMoreText, { color: theme.accent }]}>
              View all {report.transits.length} transits →
            </Text>
          </Pressable>
        )}
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
  card: { borderRadius: 14, borderWidth: 1, padding: Spacing.four, alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  cardDesc: { fontSize: 14, textAlign: 'center' },
  themeCard: { borderRadius: 16, borderWidth: 1, padding: Spacing.four, gap: 6 },
  themeLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  themeText: { fontSize: 14, lineHeight: 20 },
  adviceCard: { borderRadius: 14, borderWidth: 1, padding: Spacing.four, gap: 6 },
  adviceTitle: { fontSize: 14, fontWeight: '800' },
  adviceItem: { fontSize: 13, lineHeight: 18 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  toggleBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  toggleText: { fontSize: 13, fontWeight: '600' },
  transitCard: { borderRadius: 14, borderWidth: 1, padding: Spacing.three, gap: 8 },
  transitHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  planetSymbol: { fontSize: 28, width: 36, textAlign: 'center' },
  planetName: { fontSize: 16, fontWeight: '700' },
  transitTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  retroBadge: { fontSize: 12, fontWeight: '800', color: '#ef4444', backgroundColor: '#ef444420', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  transitPosition: { fontSize: 13, marginTop: 2 },
  aspectBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  aspectBadgeText: { fontSize: 11, fontWeight: '700' },
  natalRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  natalLabel: { fontSize: 11, fontWeight: '600' },
  natalValue: { fontSize: 12, fontWeight: '500' },
  transitInterp: { fontSize: 13, lineHeight: 18 },
  showMoreBtn: { paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  showMoreText: { fontSize: 14, fontWeight: '600' },
});
