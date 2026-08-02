import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { useProfileStore } from '@/stores/profile-store';
import { Spacing } from '@/constants/theme';
import { calculateSunSign, getMoonSign, calculateLifePath, calculateChineseZodiac, calculateCompatibility, getRisingSign, getBondTypeDescription, getElementHarmonyDescriptionForSigns } from '@/utils/calculations';
import { CosmicIcon, type CosmicIconName } from '@/components/cosmic-icon';
import type { Profile, CompatibilityScore, CosmicBondType } from '@/types/cosmic';

const SCORE_LABELS: { key: keyof CompatibilityScore; label: string; icon: CosmicIconName }[] = [
  { key: 'love', label: 'Love', icon: 'Heart' },
  { key: 'marriage', label: 'Marriage', icon: 'Crown1' },
  { key: 'friendship', label: 'Friendship', icon: 'Profile2User' },
  { key: 'business', label: 'Business', icon: 'Briefcase' },
  { key: 'communication', label: 'Communication', icon: 'MessageText1' },
  { key: 'spiritual', label: 'Spiritual', icon: 'MagicStar' },
  { key: 'family', label: 'Family', icon: 'Home2' },
  { key: 'risingSign', label: 'Rising Sign', icon: 'Sun1' },
  { key: 'elementHarmony', label: 'Element Harmony', icon: 'MagicStar' },
];

const BOND_TYPE_LABELS: Record<CosmicBondType, { label: string; color: string }> = {
  soulmate: { label: 'Soulmate Bond', color: '#FF69B4' },
  karmic: { label: 'Karmic Bond', color: '#9B59B6' },
  companion: { label: 'Companion Bond', color: '#3498DB' },
  mentor: { label: 'Mentor Bond', color: '#2ECC71' },
  catalyst: { label: 'Catalyst Bond', color: '#E67E22' },
};

function getAdvice(scores: CompatibilityScore): string[] {
  const advice: string[] = [];
  const avg = Object.values(scores).reduce((s, c) => s + c, 0) / Object.values(scores).length;
  if (avg >= 80) advice.push('You share a rare cosmic harmony — nurture this connection with intention and gratitude.');
  else if (avg >= 65) advice.push('Strong foundation exists — focus on your growth areas to deepen the bond.');
  else if (avg >= 50) advice.push('Balance of harmony and challenge — communicate openly to bridge differences.');
  else advice.push('Opposing energies create tension — with awareness and effort, differences can become strengths.');
  if (scores.communication < 65) advice.push('Prioritize honest dialogue. Different communication styles need patience and practice.');
  if (scores.love < scores.friendship) advice.push('Build on your natural friendship — romantic depth often follows genuine connection.');
  if (scores.spiritual < 60) advice.push('Explore shared spiritual practices to align your deeper values.');
  if (scores.family < 65) advice.push('Discuss family values and expectations early to build alignment.');
  if (scores.elementHarmony < 60) advice.push('Your elemental natures differ — find activities that honor both your energies.');
  return advice;
}

function getGrowthAreas(scores: CompatibilityScore): string[] {
  const areas: string[] = [];
  const entries = Object.entries(scores) as [keyof CompatibilityScore, number][];
  const sorted = entries.sort(([, a], [, b]) => a - b);
  const lowest = sorted.slice(0, 3);
  for (const [key] of lowest) {
    const map: Record<string, string> = {
      love: 'Cultivate romantic connection through quality time and shared experiences.',
      marriage: 'Strengthen long-term alignment through shared goals and values.',
      friendship: 'Invest in mutual interests and genuine enjoyment of each other.',
      business: 'Define clear roles and complementary responsibilities.',
      communication: 'Practice active listening and non-defensive expression.',
      spiritual: 'Explore shared spiritual or philosophical practices.',
      family: 'Align on family traditions, boundaries, and future visions.',
      risingSign: 'First impressions differ — appreciate each other\'s unique social personas.',
      elementHarmony: 'Your elemental mix invites growth — find balanced activities together.',
    };
    areas.push(map[key] ?? 'Conscious effort in this area will bring balance.');
  }
  return areas;
}

export default function CompatibilityScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const profiles = useProfileStore((s) => s.profiles);
  const [profileA, setProfileA] = useState<string | null>(null);
  const [profileB, setProfileB] = useState<string | null>(null);

  const result = useMemo(() => {
    if (!profileA || !profileB || profileA === profileB) return null;
    const a = profiles.find((p) => p.id === profileA);
    const b = profiles.find((p) => p.id === profileB);
    if (!a || !b) return null;

    const [ay, am, ad] = a.birthDate.split('-').map(Number);
    const [by, bm, bd] = b.birthDate.split('-').map(Number);
    const zodiacA = calculateSunSign(am, ad);
    const zodiacB = calculateSunSign(bm, bd);
    const moonA = getMoonSign(a.birthDate, a.birthTime);
    const moonB = getMoonSign(b.birthDate, b.birthTime);
    const lifePathA = calculateLifePath(a.birthDate);
    const lifePathB = calculateLifePath(b.birthDate);
    const chineseA = calculateChineseZodiac(ay);
    const chineseB = calculateChineseZodiac(by);

    // Rising signs
    const risingA = getRisingSign(zodiacA, a.birthTime);
    const risingB = getRisingSign(zodiacB, b.birthTime);

    const scores = calculateCompatibility({
      zodiacA, zodiacB,
      moonSignA: moonA, moonSignB: moonB,
      lifePathA, lifePathB,
      chineseAnimalA: chineseA, chineseAnimalB: chineseB,
      risingSignA: risingA, risingSignB: risingB,
    });

    const avg = Math.round(Object.values(scores).reduce((s, c) => s + c, 0) / Object.values(scores).length);

    // Determine cosmic bond type from scores
    const spiritualScore = scores.spiritual;
    const loveScore = scores.love;
    const friendshipScore = scores.friendship;
    const communicationScore = scores.communication;
    const businessScore = scores.business;

    let cosmicBondType: CosmicBondType = 'companion';
    if (spiritualScore >= 80 && loveScore >= 75) cosmicBondType = 'soulmate';
    else if (spiritualScore >= 70 && avg < 65) cosmicBondType = 'karmic';
    else if (friendshipScore >= 75 && loveScore < friendshipScore) cosmicBondType = 'companion';
    else if (communicationScore >= 70 && spiritualScore >= 60) cosmicBondType = 'mentor';
    else if (businessScore >= 75 && avg < 70) cosmicBondType = 'catalyst';
    else if (avg >= 75) cosmicBondType = 'soulmate';
    else if (avg >= 60) cosmicBondType = 'companion';
    else cosmicBondType = 'catalyst';

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const highScores = Object.entries(scores).filter(([, v]) => v >= 75).map(([k]) => k);
    const lowScores = Object.entries(scores).filter(([, v]) => v < 50).map(([k]) => k);
    if (highScores.length > 0) strengths.push(`Strong compatibility in: ${highScores.map(capitalize).join(', ')}`);
    if (lowScores.length > 0) weaknesses.push(`Areas for growth in: ${lowScores.map(capitalize).join(', ')}`);
    if (scores.love >= 80) strengths.push('Deep romantic potential — signs align harmoniously');
    if (scores.friendship >= 80) strengths.push('Natural friendship — you understand each other');
    if (scores.business >= 80) strengths.push('Strong business synergy — complementary skills');
    if (scores.communication < 60) weaknesses.push('Communication styles differ — practice patience');
    if (scores.spiritual < 60) weaknesses.push('Spiritual values may not fully align');

    // Specific sign pair advice
    const elementHarmonyDesc = getElementHarmonyDescriptionForSigns(zodiacA, zodiacB);
    const bondDesc = getBondTypeDescription(cosmicBondType);

    const advice = getAdvice(scores);
    const growthAreas = getGrowthAreas(scores);

    return {
      scores, strengths, weaknesses, advice, growthAreas,
      average: avg, profileA: a, profileB: b,
      cosmicBondType, bondDesc, elementHarmonyDesc,
      risingA, risingB,
    };
  }, [profileA, profileB, profiles]);

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.six }}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Compatibility</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Compare two profiles across all systems</Text>

        {profiles.length < 2 ? (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Need Two Profiles</Text>
            <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>Create at least two profiles to compare compatibility.</Text>
          </View>
        ) : (
          <>
            <View style={styles.pickerRow}>
              <ProfilePicker label="Profile A" profiles={profiles} selected={profileA} onSelect={setProfileA} theme={theme} />
              <ProfilePicker label="Profile B" profiles={profiles} selected={profileB} onSelect={setProfileB} theme={theme} />
            </View>

            {result && (
              <View style={{ gap: 14 }}>
                <View style={[styles.overallCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                  <Text style={[styles.overallLabel, { color: theme.textSecondary }]}>Overall Compatibility</Text>
                  <Text style={[styles.overallScore, {
                    color: result.average >= 75 ? theme.accentGreen : result.average >= 55 ? theme.accentOrange : theme.accent,
                  }]}>{result.average}%</Text>
                  <View style={styles.overallBarWrap}>
                    <View style={[styles.overallBar, {
                      backgroundColor: (result.average >= 75 ? theme.accentGreen : result.average >= 55 ? theme.accentOrange : theme.accent) + '20',
                    }]}>
                      <View style={[styles.overallBarFill, {
                        backgroundColor: result.average >= 75 ? theme.accentGreen : result.average >= 55 ? theme.accentOrange : theme.accent,
                        width: `${result.average}%` as any,
                      }]} />
                    </View>
                  </View>
                </View>

                {/* Cosmic Bond Type */}
                <View style={[styles.bondCard, { backgroundColor: theme.card, borderColor: BOND_TYPE_LABELS[result.cosmicBondType].color + '60' }]}>
                  <View style={[styles.bondBadge, { backgroundColor: BOND_TYPE_LABELS[result.cosmicBondType].color + '20' }]}>
                    <Text style={[styles.bondType, { color: BOND_TYPE_LABELS[result.cosmicBondType].color }]}>
                      {BOND_TYPE_LABELS[result.cosmicBondType].label}
                    </Text>
                  </View>
                  <Text style={[styles.bondDesc, { color: theme.text }]}>{result.bondDesc}</Text>
                  <Text style={[styles.elementDesc, { color: theme.textSecondary }]}>{result.elementHarmonyDesc}</Text>
                </View>

                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Category Scores</Text>
                  {SCORE_LABELS.map(({ key, label, icon }) => {
                    const score = result.scores[key];
                    const sc = score >= 75 ? theme.accentGreen : score >= 55 ? theme.accentOrange : theme.accent;
                    return (
                      <View key={key} style={styles.scoreRow}>
                        <View style={styles.scoreLabelRow}>
                          <CosmicIcon name={icon} size={16} color={theme.accent} />
                          <Text style={[styles.scoreLabel, { color: theme.text }]}>{label}</Text>
                          <Text style={[styles.scoreValue, { color: sc }]}>{score}%</Text>
                        </View>
                        <View style={styles.scoreBarWrap}>
                          <View style={[styles.scoreBar, { backgroundColor: sc + '20' }]}>
                            <View style={[styles.scoreBarFill, { backgroundColor: sc, width: `${score}%` as any }]} />
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>

                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Advice</Text>
                  {result.advice.map((a, i) => (
                    <Text key={i} style={[styles.bulletText, { color: theme.text }]}>✦ {a}</Text>
                  ))}
                </View>

                {result.growthAreas.length > 0 && (
                  <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Growth Areas</Text>
                    {result.growthAreas.map((g, i) => (
                      <Text key={i} style={[styles.bulletText, { color: theme.accentOrange }]}>○ {g}</Text>
                    ))}
                  </View>
                )}

                {result.strengths.length > 0 && (
                  <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <Text style={[styles.statLabel, { color: theme.accentGreen }]}>Strengths</Text>
                    {result.strengths.map((s, i) => (
                      <Text key={i} style={[styles.bulletText, { color: theme.text }]}>✦ {s}</Text>
                    ))}
                  </View>
                )}

                {result.weaknesses.length > 0 && (
                  <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <Text style={[styles.statLabel, { color: theme.accentOrange }]}>Challenges</Text>
                    {result.weaknesses.map((w, i) => (
                      <Text key={i} style={[styles.bulletText, { color: theme.text }]}>✦ {w}</Text>
                    ))}
                  </View>
                )}
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

function ProfilePicker({ label, profiles, selected, onSelect, theme }: { label: string; profiles: Profile[]; selected: string | null; onSelect: (id: string) => void; theme: any }) {
  return (
    <View style={{ flex: 1, gap: 8 }}>
      <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 140 }}>
        <View style={{ gap: 6 }}>
          {profiles.map((p) => (
            <Pressable key={p.id} onPress={() => onSelect(p.id)}
              style={[styles.profileBtn, { backgroundColor: selected === p.id ? theme.accent + '20' : theme.surface, borderColor: selected === p.id ? theme.accent : theme.border }]}>
              <Text style={[styles.profileText, { color: selected === p.id ? theme.accent : theme.text, fontWeight: selected === p.id ? '700' : '500' }]}>{p.name}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function capitalize(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.three },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 15, marginBottom: 8 },
  card: { borderRadius: 14, borderWidth: 1, padding: Spacing.four, gap: 10 },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  cardDesc: { fontSize: 14, textAlign: 'center' },
  pickerRow: { flexDirection: 'row', gap: 12 },
  fieldLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  profileBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1 },
  profileText: { fontSize: 13 },
  overallCard: { borderRadius: 20, borderWidth: 1, padding: Spacing.four, alignItems: 'center', gap: 8 },
  overallLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  overallScore: { fontSize: 56, fontWeight: '900' },
  overallBarWrap: { width: '100%', height: 32 },
  overallBar: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  overallBarFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 8,
  },
  statLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  scoreLabel: { fontSize: 13, fontWeight: '600' },
  scoreRow: { gap: 4 },
  scoreLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scoreBarWrap: { height: 28 },
  scoreBar: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  scoreBarFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 8,
  },
  scoreValue: { fontSize: 13, fontWeight: '700' },
  bulletText: { fontSize: 14, lineHeight: 22 },
  bondCard: { borderRadius: 16, borderWidth: 1, padding: Spacing.four, gap: 8 },
  bondBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  bondType: { fontSize: 14, fontWeight: '800' },
  bondDesc: { fontSize: 14, lineHeight: 20 },
  elementDesc: { fontSize: 13, lineHeight: 18, fontStyle: 'italic' },
});
