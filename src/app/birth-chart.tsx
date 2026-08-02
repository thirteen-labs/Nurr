import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { useProfileStore } from '@/stores/profile-store';
import { Spacing } from '@/constants/theme';
import { calculateBirthChart, calculateSunSign, calculateMoonSign, calculateRisingSign } from '@/utils/calculations';
import { HOUSES } from '@/constants/cosmic/houses';
import { CosmicIcon } from '@/components/cosmic-icon';
import type { BirthChart, ZodiacSign, AspectType } from '@/types/cosmic';

const SIGN_EMOJIS: Record<ZodiacSign, string> = {
  aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋',
  leo: '♌', virgo: '♍', libra: '♎', scorpio: '♏',
  sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓',
};

const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
  jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
};

const ASPECT_COLORS: Record<AspectType, string> = {
  conjunction: '#3b82f6',
  sextile: '#22c55e',
  square: '#ef4444',
  trine: '#a855f7',
  opposition: '#f97316',
};

const ASPECT_SYMBOLS: Record<AspectType, string> = {
  conjunction: '☌', sextile: '⚹', square: '□', trine: '△', opposition: '☍',
};

export default function BirthChartScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const activeProfile = useProfileStore((s) => s.activeProfile);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'planets' | 'aspects' | 'houses'>('overview');

  const chart = useMemo<BirthChart | null>(() => {
    if (!activeProfile) return null;
    const [y, m, d] = activeProfile.birthDate.split('-').map(Number);
    const sunSign = calculateSunSign(m, d);
    const moonSign = calculateMoonSign(sunSign, y);
    const hour = activeProfile.birthTime ? parseInt(activeProfile.birthTime.split(':')[0]) : 12;
    const risingSign = calculateRisingSign(sunSign, hour);
    return calculateBirthChart(activeProfile.id, activeProfile.birthDate, activeProfile.birthTime, sunSign, moonSign, risingSign);
  }, [activeProfile]);

  if (!activeProfile || !chart) {
    return (
      <ScrollView style={[styles.scroll, { backgroundColor: theme.background }]}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.six }}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>Birth Chart</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Your complete natal chart analysis</Text>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>No Profile</Text>
            <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>Create a profile with birth time to generate your birth chart.</Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  const tabs = [
    { key: 'overview' as const, label: 'Overview', icon: 'MagicStar' as const },
    { key: 'planets' as const, label: 'Planets', icon: 'Global' as const },
    { key: 'aspects' as const, label: 'Aspects', icon: 'Star1' as const },
    { key: 'houses' as const, label: 'Houses', icon: 'Home2' as const },
  ];

  const planetPositions = chart.planetaryPositions;

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.six }}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Birth Chart</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Your natal chart wheel</Text>

        <View style={styles.tabRow}>
          {tabs.map((tab) => {
            const isActive = selectedTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setSelectedTab(tab.key)}
                style={({ pressed }) => [
                  styles.tab,
                  { backgroundColor: isActive ? theme.accent : theme.card, borderColor: isActive ? theme.accent : theme.cardBorder, opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <CosmicIcon name={tab.icon} size={16} color={isActive ? '#fff' : theme.textSecondary} />
                <Text style={[styles.tabLabel, { color: isActive ? '#fff' : theme.text }]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {selectedTab === 'overview' && (
          <View style={{ gap: Spacing.three }}>
            <View style={[styles.heroCard, { backgroundColor: theme.card, borderColor: theme.accent + '40' }]}>
              <Text style={[styles.heroTitle, { color: theme.accent }]}>Your Cosmic Identity</Text>
              <View style={styles.identityGrid}>
                <View style={styles.identityItem}>
                  <Text style={styles.identityEmoji}>{SIGN_EMOJIS[chart.ascendant]}</Text>
                  <Text style={[styles.identityLabel, { color: theme.textSecondary }]}>Ascendant</Text>
                  <Text style={[styles.identityValue, { color: theme.text }]}>{capitalize(chart.ascendant)}</Text>
                </View>
                <View style={styles.identityItem}>
                  <Text style={styles.identityEmoji}>{SIGN_EMOJIS[chart.midheaven]}</Text>
                  <Text style={[styles.identityLabel, { color: theme.textSecondary }]}>Midheaven</Text>
                  <Text style={[styles.identityValue, { color: theme.text }]}>{capitalize(chart.midheaven)}</Text>
                </View>
                <View style={styles.identityItem}>
                  <Text style={styles.identityEmoji}>{PLANET_SYMBOLS[chart.dominantPlanet] ?? '★'}</Text>
                  <Text style={[styles.identityLabel, { color: theme.textSecondary }]}>Dominant</Text>
                  <Text style={[styles.identityValue, { color: theme.text }]}>{capitalize(chart.dominantPlanet)}</Text>
                </View>
                <View style={styles.identityItem}>
                  <Text style={styles.identityEmoji}>{PLANET_SYMBOLS[chart.chartRuler] ?? '★'}</Text>
                  <Text style={[styles.identityLabel, { color: theme.textSecondary }]}>Chart Ruler</Text>
                  <Text style={[styles.identityValue, { color: theme.text }]}>{capitalize(chart.chartRuler)}</Text>
                </View>
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Element Distribution</Text>
              {(['fire', 'earth', 'air', 'water'] as const).map((el) => {
                const count = chart.elementDistribution[el];
                const colors: Record<string, string> = { fire: '#ef4444', earth: '#22c55e', air: '#3b82f6', water: '#6366f1' };
                const pct = Math.round((count / 10) * 100);
                return (
                  <View key={el} style={styles.barRow}>
                    <Text style={[styles.barLabel, { color: theme.text }]}>{capitalize(el)}</Text>
                    <View style={[styles.barTrack, { backgroundColor: colors[el] + '20' }]}>
                      <View style={[styles.barFill, { backgroundColor: colors[el], width: `${Math.min(100, pct)}%` as any }]} />
                    </View>
                    <Text style={[styles.barCount, { color: theme.textSecondary }]}>{count}</Text>
                  </View>
                );
              })}
            </View>

            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Modality Distribution</Text>
              {(['cardinal', 'fixed', 'mutable'] as const).map((mod) => {
                const count = chart.modalityDistribution[mod];
                const pct = Math.round((count / 10) * 100);
                return (
                  <View key={mod} style={styles.barRow}>
                    <Text style={[styles.barLabel, { color: theme.text }]}>{capitalize(mod)}</Text>
                    <View style={[styles.barTrack, { backgroundColor: theme.accent + '20' }]}>
                      <View style={[styles.barFill, { backgroundColor: theme.accent, width: `${Math.min(100, pct)}%` as any }]} />
                    </View>
                    <Text style={[styles.barCount, { color: theme.textSecondary }]}>{count}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {selectedTab === 'planets' && (
          <View style={{ gap: 8 }}>
            {planetPositions.map((pos) => (
              <View key={pos.planet} style={[styles.planetRow, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <View style={styles.planetLeft}>
                  <Text style={styles.planetSymbol}>{PLANET_SYMBOLS[pos.planet] ?? '★'}</Text>
                  <View>
                    <Text style={[styles.planetName, { color: theme.text }]}>{capitalize(pos.planet)}</Text>
                    <Text style={[styles.planetSign, { color: theme.textSecondary }]}>
                      {SIGN_EMOJIS[pos.sign]} {capitalize(pos.sign)} {pos.degree.toFixed(1)}°
                    </Text>
                  </View>
                </View>
                <View style={styles.planetRight}>
                  <Text style={[styles.houseTag, { color: theme.accent, backgroundColor: theme.accent + '15' }]}>
                    House {pos.house}
                  </Text>
                  {pos.retrograde && (
                    <Text style={[styles.retroTag, { color: '#ef4444' }]}>Rx</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {selectedTab === 'aspects' && (
          <View style={{ gap: 8 }}>
            {chart.aspects.length === 0 ? (
              <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>No significant aspects detected in your chart.</Text>
              </View>
            ) : (
              chart.aspects.map((asp, i) => (
                <View key={i} style={[styles.aspectRow, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                  <View style={styles.aspectLeft}>
                    <Text style={[styles.aspectPlanets, { color: theme.text }]}>
                      {PLANET_SYMBOLS[asp.planet1]} {capitalize(asp.planet1)}
                    </Text>
                    <Text style={[styles.aspectType, { color: ASPECT_COLORS[asp.type] }]}>
                      {ASPECT_SYMBOLS[asp.type]} {capitalize(asp.type)}
                    </Text>
                    <Text style={[styles.aspectPlanets, { color: theme.text }]}>
                      {PLANET_SYMBOLS[asp.planet2]} {capitalize(asp.planet2)}
                    </Text>
                  </View>
                  <Text style={[styles.aspectOrb, { color: theme.textSecondary }]}>{asp.orb.toFixed(1)}° orb</Text>
                </View>
              ))
            )}
          </View>
        )}

        {selectedTab === 'houses' && (
          <View style={{ gap: 8 }}>
            {HOUSES.map((house) => {
              const cusp = chart.houses.find((h) => h.house === house.number);
              return (
                <View key={house.number} style={[styles.houseCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                  <View style={styles.houseHeader}>
                    <Text style={[styles.houseNumber, { color: theme.accent }]}>House {house.number}</Text>
                    {cusp && (
                      <Text style={[styles.houseCusp, { color: theme.textSecondary }]}>
                        {SIGN_EMOJIS[cusp.sign]} {capitalize(cusp.sign)}
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.houseTitle, { color: theme.text }]}>{house.title}</Text>
                  <Text style={[styles.houseInterp, { color: theme.textSecondary }]} numberOfLines={3}>{house.interpretation}</Text>
                  <View style={styles.tagRow}>
                    {house.keywords.slice(0, 4).map((kw) => (
                      <View key={kw} style={[styles.keywordTag, { backgroundColor: theme.accent + '15' }]}>
                        <Text style={[styles.keywordText, { color: theme.accent }]}>{kw}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
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
  card: { borderRadius: 14, borderWidth: 1, padding: Spacing.four, gap: 8 },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  cardDesc: { fontSize: 14, textAlign: 'center' },
  tabRow: { flexDirection: 'row', gap: 8 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, borderWidth: 1, gap: 6 },
  tabLabel: { fontSize: 13, fontWeight: '600' },
  heroCard: { borderRadius: 16, borderWidth: 1, padding: Spacing.four, gap: 12 },
  heroTitle: { fontSize: 16, fontWeight: '800', textAlign: 'center' },
  identityGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  identityItem: { alignItems: 'center', gap: 4 },
  identityEmoji: { fontSize: 28 },
  identityLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  identityValue: { fontSize: 14, fontWeight: '700' },
  sectionLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 },
  barLabel: { fontSize: 13, fontWeight: '600', width: 60 },
  barTrack: { flex: 1, height: 20, borderRadius: 10, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 10 },
  barCount: { fontSize: 13, fontWeight: '700', width: 20, textAlign: 'right' },
  planetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 12, borderWidth: 1, padding: Spacing.three },
  planetLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  planetSymbol: { fontSize: 24, width: 30, textAlign: 'center' },
  planetName: { fontSize: 15, fontWeight: '700' },
  planetSign: { fontSize: 13, marginTop: 2 },
  planetRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  houseTag: { fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  retroTag: { fontSize: 13, fontWeight: '800' },
  aspectRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 12, borderWidth: 1, padding: Spacing.three },
  aspectLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aspectPlanets: { fontSize: 14, fontWeight: '600' },
  aspectType: { fontSize: 14, fontWeight: '800' },
  aspectOrb: { fontSize: 12, fontWeight: '500' },
  houseCard: { borderRadius: 14, borderWidth: 1, padding: Spacing.three, gap: 6 },
  houseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  houseNumber: { fontSize: 14, fontWeight: '800' },
  houseCusp: { fontSize: 13, fontWeight: '600' },
  houseTitle: { fontSize: 16, fontWeight: '700' },
  houseInterp: { fontSize: 13, lineHeight: 18 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  keywordTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  keywordText: { fontSize: 11, fontWeight: '600' },
});
