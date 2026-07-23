import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { useSpeech } from '@/hooks/use-speech';
import { useProfileStore } from '@/stores/profile-store';
import { Spacing } from '@/constants/theme';
import { ZODIAC_SIGNS } from '@/constants/cosmic/zodiac';
import { ELEMENT_MEANINGS } from '@/constants/cosmic/chineseZodiac';
import { MOON_SIGNS } from '@/constants/cosmic/moonSigns';
import { RISING_SIGNS } from '@/constants/cosmic/risingSigns';
import { findBirthstone } from '@/constants/cosmic/birthstones';
import { calculateSunSign, calculateRisingSign, calculateLifePath, calculateDestinyNumber, calculateChineseZodiac, calculateChineseElement, getBirthMoonPhase, getMoonSign } from '@/utils/calculations';
import { getZodiacElement } from '@/utils/calculations';

interface BlueprintEntry {
  label: string;
  value: string;
  sub?: string;
}

export default function BlueprintScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const activeProfile = useProfileStore((s) => s.activeProfile);
  const { speak, isSpeaking } = useSpeech();

  const blueprint = useMemo(() => {
    if (!activeProfile) return null;
    const [y, m, d] = activeProfile.birthDate.split('-').map(Number);
    const birthHour = activeProfile.birthTime ? parseInt(activeProfile.birthTime.split(':')[0], 10) : 12;
    const sunSign = calculateSunSign(m, d);
    const moonSign = getMoonSign(activeProfile.birthDate, activeProfile.birthTime);
    const risingSign = calculateRisingSign(sunSign, birthHour);
    const sunData = ZODIAC_SIGNS[sunSign];
    const chineseAnimal = calculateChineseZodiac(y);
    const chineseElement = calculateChineseElement(y);
    const elementData = ELEMENT_MEANINGS[chineseElement];
    const lifePath = calculateLifePath(activeProfile.birthDate);
    const destinyNum = calculateDestinyNumber(activeProfile.name);

    // Spirit animal (multi-factor)
    const spiritAnimalIdx = (lifePath + destinyNum + y + d) % 16;
    const spiritAnimals = [
      "Wolf", "Bear", "Fox", "Owl", "Lion", "Eagle", "Raven", "Panther",
      "Horse", "Snake", "Dragon", "Dolphin", "Deer", "Hawk", "Bear", "Salmon"
    ];
    const spiritAnimal = spiritAnimals[spiritAnimalIdx >= 0 ? spiritAnimalIdx : 0];

    const birthstone = findBirthstone(m);
    const moonPhase = getBirthMoonPhase(activeProfile.birthDate);
    const moonData = MOON_SIGNS[moonSign];
    const risingData = RISING_SIGNS[risingSign];

    // Element balance
    const sunEl = getZodiacElement(sunSign);
    const moonEl = getZodiacElement(moonSign);
    const risingEl = getZodiacElement(risingSign);
    const elementBalance = { fire: 0, earth: 0, air: 0, water: 0 };
    elementBalance[sunEl] += 2;
    elementBalance[moonEl] += 1.5;
    elementBalance[risingEl] += 1;
    const chineseMap: Record<string, keyof typeof elementBalance> = {
      fire: 'fire', wood: 'earth', earth: 'earth', metal: 'air', water: 'water',
    };
    elementBalance[chineseMap[chineseElement]] += 1;

    // Birth day significance
    const birthDay = new Date(y, m - 1, d);
    const dayOfWeek = birthDay.getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayRulers = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    const daySignificance = `Born on ${dayNames[dayOfWeek]} — ruled by ${dayRulers[dayOfWeek]}`;

    // Chinese element modifier
    const animalCap = chineseAnimal.charAt(0).toUpperCase() + chineseAnimal.slice(1);
    const elemCap = chineseElement.charAt(0).toUpperCase() + chineseElement.slice(1);
    const chineseModifier = `${elemCap} ${animalCap}`;

    // Lucky attributes (multi-factor)
    const luckyNumber = (lifePath + d) % 9 + 1;
    const signColors = sunData.luckyColors ?? ['Gold'];
    const luckyColor = signColors[(m - 1) % signColors.length];
    const luckyDay = sunData.luckyDays?.[0] ?? 'Sunday';

    const entries: BlueprintEntry[] = [
      { label: "Sun Sign", value: `${sunData.symbol} ${capitalize(sunSign)}`, sub: sunData.dateRange },
      { label: "Moon Sign", value: `♋ ${capitalize(moonSign)}` },
      { label: "Rising Sign", value: `⬆ ${capitalize(risingSign)}` },
      { label: "Life Path", value: String(lifePath) },
      { label: "Destiny Number", value: String(destinyNum) },
      { label: "Chinese Zodiac", value: chineseModifier, sub: elementData.direction },
      { label: "Element", value: elementData.name, sub: elementData.description.slice(0, 80) + '...' },
      { label: "Spirit Animal", value: spiritAnimal },
      { label: "Dominant Planet", value: sunData.rulingPlanet },
      { label: "Birthstone", value: birthstone.stone },
      { label: "Birth Moon Phase", value: capitalize(moonPhase.replace(/-/g, ' ')) },
      { label: "Lucky Number", value: String(luckyNumber) },
      { label: "Lucky Color", value: luckyColor },
      { label: "Lucky Day", value: luckyDay },
      { label: "Birth Day", value: daySignificance },
    ];

    return {
      entries, sunSign, moonSign, risingSign, sunData, moonData, risingData,
      chineseAnimal, chineseElement, lifePath, destinyNum, spiritAnimal,
      birthstone, moonPhase, elementData, elementBalance,
    };
  }, [activeProfile]);

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.six }}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.text }]}>Cosmic Blueprint</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {activeProfile?.name ?? 'Create a profile to see your cosmic blueprint'}
            </Text>
          </View>
          {activeProfile && blueprint && (
            <Pressable
              onPress={() => {
                const text = `Cosmic Blueprint for ${activeProfile.name}. Sun Sign ${blueprint.sunData.symbol} ${capitalize(blueprint.sunSign)}. Moon Sign ${capitalize(blueprint.moonSign)}. Rising Sign ${capitalize(blueprint.risingSign)}. Life Path ${blueprint.lifePath}. Destiny Number ${blueprint.destinyNum}. Chinese Zodiac ${capitalize(blueprint.chineseAnimal)}. Birthstone ${blueprint.birthstone.stone}. Spirit Animal ${blueprint.spiritAnimal}.`;
                speak(text);
              }}
              style={({ pressed }) => [styles.speakBtn, { backgroundColor: isSpeaking ? theme.accent + '30' : theme.card, borderColor: theme.cardBorder, opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={[styles.speakIcon, { color: theme.accent }]}>{isSpeaking ? '⏹' : '🔊'}</Text>
            </Pressable>
          )}
        </View>

        {!activeProfile ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No profile selected. Go to Profiles to create one.</Text>
          </View>
        ) : blueprint ? (
          <>
            <View style={styles.astroCard}>
              <Text style={[styles.astroTitle, { color: theme.text }]}>
                {blueprint.sunData.symbol} {capitalize(blueprint.sunSign)} ☽ {blueprint.moonSign !== blueprint.sunSign ? capitalize(blueprint.moonSign) : ''} ⬆ {capitalize(blueprint.risingSign)}
              </Text>
              <Text style={[styles.astroSub, { color: theme.textSecondary }]}>Sun · Moon · Rising</Text>
            </View>

            {/* Element Balance */}
            <View style={[styles.balanceCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Text style={[styles.balanceLabel, { color: theme.textSecondary }]}>Element Balance</Text>
              {(['fire', 'earth', 'air', 'water'] as const).map((el) => {
                const value = blueprint.elementBalance[el];
                const maxVal = Math.max(blueprint.elementBalance.fire, blueprint.elementBalance.earth, blueprint.elementBalance.air, blueprint.elementBalance.water, 1);
                const pct = (value / maxVal) * 100;
                const colors: Record<string, string> = { fire: '#FF6B35', earth: '#8B7355', air: '#87CEEB', water: '#4169E1' };
                return (
                  <View key={el} style={styles.balanceRow}>
                    <Text style={[styles.balanceElement, { color: theme.text }]}>{capitalize(el)}</Text>
                    <View style={styles.balanceBarWrap}>
                      <View style={[styles.balanceBar, { backgroundColor: colors[el] + '20' }]}>
                        <View style={[styles.balanceBarFill, { backgroundColor: colors[el], width: `${pct}%` as any }]} />
                      </View>
                    </View>
                    <Text style={[styles.balanceValue, { color: theme.textSecondary }]}>{value.toFixed(1)}</Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.grid}>
              {blueprint.entries.map((entry) => (
                <View key={entry.label} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                  <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>{entry.label}</Text>
                  <Text style={[styles.cardValue, { color: theme.text }]}>{entry.value}</Text>
                  {entry.sub && <Text style={[styles.cardSub, { color: theme.textTertiary }]}>{entry.sub}</Text>}
                </View>
              ))}
            </View>
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.three },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 15, marginBottom: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  speakBtn: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  speakIcon: { fontSize: 20 },
  emptyCard: { borderRadius: 14, borderWidth: 1, padding: Spacing.five, alignItems: 'center' },
  emptyText: { fontSize: 15, textAlign: 'center' },
  astroCard: { borderRadius: 14, borderWidth: 1, padding: Spacing.four, alignItems: 'center', gap: 4 },
  astroTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
  astroSub: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  balanceCard: { borderRadius: 14, borderWidth: 1, padding: Spacing.four, gap: 8 },
  balanceLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  balanceElement: { width: 50, fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
  balanceBarWrap: { flex: 1, height: 16 },
  balanceBar: { flex: 1, borderRadius: 8, overflow: 'hidden' },
  balanceBarFill: { position: 'absolute', top: 0, left: 0, bottom: 0, borderRadius: 8 },
  balanceValue: { width: 30, fontSize: 12, fontWeight: '600', textAlign: 'right' },
  grid: { gap: 10 },
  card: { borderRadius: 12, borderWidth: 1, padding: Spacing.three, gap: 2 },
  cardLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  cardValue: { fontSize: 18, fontWeight: '700' },
  cardSub: { fontSize: 13, marginTop: 2 },
});
