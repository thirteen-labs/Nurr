import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { useProfileStore } from '@/stores/profile-store';
import { Spacing } from '@/constants/theme';
import { calculateAllNumerology } from '@/utils/calculations';

const NUMBER_MEANINGS: Record<number, string> = {
  1: 'Leader, independent, pioneer. Natural innovator who blazes their own trail.',
  2: 'Peacemaker, intuitive, cooperative. Thrives in partnership and harmony.',
  3: 'Creative, expressive, optimistic. Natural communicator with artistic gifts.',
  4: 'Builder, practical, disciplined. Creates lasting foundations through hard work.',
  5: 'Adventurer, versatile, freedom-loving. Thrives on change and new experiences.',
  6: 'Nurturer, responsible, loving. Devoted to family, community, and service.',
  7: 'Seeker, analytical, spiritual. Deep thinker drawn to wisdom and truth.',
  8: 'Ambitious, powerful, abundant. Natural executive manifestation ability.',
  9: 'Humanitarian, wise, selfless. Compassionate soul with global vision.',
  11: 'Intuitive, enlightened, visionary. Spiritual teacher with heightened awareness.',
  22: 'Master builder, visionary, practical. Turns grand dreams into reality.',
  33: 'Master teacher, compassionate, inspiring. Heals and uplifts humanity.',
};

const KARMIC_MEANINGS: Record<number, string> = {
  13: 'Past life karma around work ethic and persistence. You must learn diligence and transformation.',
  14: 'Past life karma around freedom and discipline. Balance liberty with responsibility.',
  16: 'Past life karma around humility and ego. Learn to rebuild after destruction with grace.',
  19: 'Past life karma around independence and power. Learn to lead with integrity and compassion.',
};

const BALANCE_MEANINGS: Record<number, string> = {
  1: 'Balanced through independent action and self-leadership',
  2: 'Balanced through cooperation and sensitivity to others',
  3: 'Balanced through creative self-expression and joy',
  4: 'Balanced through practical effort and structured approach',
  5: 'Balanced through adaptability and embracing change',
  6: 'Balanced through responsibility and nurturing others',
  7: 'Balanced through introspection and spiritual seeking',
  8: 'Balanced through material achievement and inner authority',
  9: 'Balanced through compassion and humanitarian service',
  11: 'Balanced through spiritual illumination and intuitive leadership',
  22: 'Balanced through master building and manifesting visions',
  33: 'Balanced through unconditional love and teaching',
};

const HIDDEN_PASSION_MEANINGS: Record<number, string> = {
  1: 'Hidden passion for leadership and independence — you secretly crave to be first',
  2: 'Hidden passion for harmony and connection — you deeply desire peaceful relationships',
  3: 'Hidden passion for creative expression — your soul yearns to create and communicate',
  4: 'Hidden passion for stability and order — you secretly crave structure and security',
  5: 'Hidden passion for freedom and adventure — your soul yearns for variety and change',
  6: 'Hidden passion for love and family — you deeply desire to nurture and be needed',
  7: 'Hidden passion for knowledge and truth — your soul secretly seeks wisdom and depth',
  8: 'Hidden passion for achievement and power — you secretly crave success and influence',
  9: 'Hidden passion for service and compassion — your soul yearns to make a difference',
};

const PLANE_LABELS: Record<string, string> = {
  physical: 'Physical Plane',
  emotional: 'Emotional Plane',
  mental: 'Mental Plane',
  spiritual: 'Spiritual Plane',
};

const PLANE_MEANINGS: Record<number, string> = {
  1: 'Strong drive and independent expression',
  2: 'Sensitive and cooperative nature',
  3: 'Creative and communicative energy',
  4: 'Practical and grounded approach',
  5: 'Versatile and dynamic expression',
  6: 'Nurturing and responsible energy',
  7: 'Analytical and spiritual depth',
  8: 'Powerful and ambitious drive',
  9: 'Compassionate and humanitarian energy',
  11: 'Heightened intuitive and spiritual expression',
  22: 'Master building and manifestation energy',
  33: 'Unconditional love and healing expression',
};

type Tab = 'core' | 'cycles' | 'personal' | 'advanced';

export default function NumerologyScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const activeProfile = useProfileStore((s) => s.activeProfile);
  const [tab, setTab] = useState<Tab>('core');

  const result = useMemo(() => {
    if (!activeProfile) return null;
    return calculateAllNumerology(activeProfile.birthDate, activeProfile.name);
  }, [activeProfile]);

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.six }}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Numerology</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {activeProfile ? `Calculations for ${activeProfile.name}` : 'Create a profile to start'}
        </Text>

        {!activeProfile || !result ? (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>No Profile</Text>
            <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>Create a profile to see your numerology.</Text>
          </View>
        ) : (
          <>
            <View style={styles.tabs}>
              {(['core', 'cycles', 'personal', 'advanced'] as Tab[]).map((t) => (
                <Pressable key={t} onPress={() => setTab(t)}
                  style={[styles.tab, { backgroundColor: tab === t ? theme.accent : theme.surface, borderColor: tab === t ? theme.accent : theme.border }]}>
                  <Text style={[styles.tabText, { color: tab === t ? '#fff' : theme.text, fontWeight: tab === t ? '700' : '500' }]}>
                    {capitalize(t)}
                  </Text>
                </Pressable>
              ))}
            </View>

            {tab === 'core' && (
              <View style={styles.section}>
                <NumberCard label="Life Path" value={result.lifePath} desc={NUMBER_MEANINGS[result.lifePath] ?? ''} theme={theme} />
                <NumberCard label="Destiny" value={result.destiny} desc={NUMBER_MEANINGS[result.destiny] ?? ''} theme={theme} />
                <NumberCard label="Soul Urge" value={result.soulUrge} desc={NUMBER_MEANINGS[result.soulUrge] ?? ''} theme={theme} />
                <NumberCard label="Personality" value={result.personality} desc={NUMBER_MEANINGS[result.personality] ?? ''} theme={theme} />
                <NumberCard label="Birthday" value={result.birthday} desc={NUMBER_MEANINGS[result.birthday] ?? ''} theme={theme} />
                <NumberCard label="Maturity" value={result.maturity} desc={NUMBER_MEANINGS[result.maturity] ?? ''} theme={theme} />
                {result.karmicDebt && (
                  <NumberCard label="Karmic Debt" value={result.karmicDebt} desc={KARMIC_MEANINGS[result.karmicDebt] ?? 'Karmic lesson to learn in this lifetime.'} theme={theme} accent />
                )}
              </View>
            )}

            {tab === 'cycles' && (
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Pinnacle Cycles</Text>
                {result.pinnacleCycles.map((n, i) => (
                  <NumberCard key={i} label={`Cycle ${i + 1}`} value={n} desc={NUMBER_MEANINGS[n] ?? ''} theme={theme} />
                ))}
                <Text style={[styles.sectionLabel, { color: theme.textSecondary, marginTop: Spacing.three }]}>Challenge Numbers</Text>
                {result.challengeNumbers.map((n, i) => (
                  <NumberCard key={i} label={`Challenge ${i + 1}`} value={n} desc={n === 0 ? 'No challenge in this position — natural ease' : (NUMBER_MEANINGS[n] ?? `Challenge of ${n}`)} theme={theme} />
                ))}
              </View>
            )}

            {tab === 'personal' && (
              <View style={styles.section}>
                <NumberCard label="Personal Year" value={result.personalYear} desc={NUMBER_MEANINGS[result.personalYear] ?? ''} theme={theme} />
                <NumberCard label="Personal Month" value={result.personalMonth} desc={NUMBER_MEANINGS[result.personalMonth] ?? ''} theme={theme} />
                <NumberCard label="Personal Day" value={result.personalDay} desc={NUMBER_MEANINGS[result.personalDay] ?? ''} theme={theme} />
              </View>
            )}

            {tab === 'advanced' && (
              <View style={styles.section}>
                <NumberCard label="Balance Number" value={result.balanceNumber} desc={BALANCE_MEANINGS[result.balanceNumber] ?? ''} theme={theme} />
                <NumberCard label="Hidden Passion" value={result.hiddenPassion} desc={HIDDEN_PASSION_MEANINGS[result.hiddenPassion] ?? ''} theme={theme} />
                <NumberCard label="Subconscious Confidence" value={result.subconsciousConfidence} desc={`Your subconscious self-image resonates with the energy of ${result.subconsciousConfidence}. This reflects how deeply you trust your own inner wisdom.`} theme={theme} />
                <NumberCard label="Rational Thought" value={result.rationalThought} desc={`Your thinking style resonates with the energy of ${result.rationalThought}. This shapes how your mind processes information and solves problems.`} theme={theme} />

                <Text style={[styles.sectionLabel, { color: theme.textSecondary, marginTop: Spacing.three }]}>Planes of Expression</Text>
                {Object.entries(result.planesOfExpression).map(([plane, value]) => (
                  <View key={plane} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <View style={styles.planeRow}>
                      <Text style={[styles.planeLabel, { color: theme.accent }]}>{PLANE_LABELS[plane] ?? plane}</Text>
                      <Text style={[styles.planeValue, { color: theme.text }]}>{value}</Text>
                    </View>
                    <View style={styles.planeBarWrap}>
                      <View style={[styles.planeBar, { backgroundColor: theme.accent + '20' }]}>
                        <View style={[styles.planeBarFill, { backgroundColor: theme.accent, width: `${(value / 9) * 100}%` as any }]} />
                      </View>
                    </View>
                    <Text style={[styles.planeDesc, { color: theme.textSecondary }]}>{PLANE_MEANINGS[value] ?? ''}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

function NumberCard({ label, value, desc, theme, accent }: { label: string; value: number; desc: string; theme: any; accent?: boolean }) {
  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.statValue, { color: accent ? theme.accentOrange : theme.accent }]}>{value}</Text>
      <Text style={[styles.statDesc, { color: theme.text }]}>{desc}</Text>
    </View>
  );
}

function capitalize(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.three },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 15, marginBottom: 8 },
  card: { borderRadius: 14, borderWidth: 1, padding: Spacing.four, alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  cardDesc: { fontSize: 14, textAlign: 'center' },
  section: { gap: 12 },
  sectionLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  tabs: { flexDirection: 'row', gap: 6 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  tabText: { fontSize: 12 },
  statLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { fontSize: 40, fontWeight: '900' },
  statDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  planeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  planeLabel: { fontSize: 13, fontWeight: '700' },
  planeValue: { fontSize: 20, fontWeight: '900' },
  planeBarWrap: { width: '100%', height: 8 },
  planeBar: { flex: 1, borderRadius: 4, overflow: 'hidden' },
  planeBarFill: { position: 'absolute', top: 0, left: 0, bottom: 0, borderRadius: 4 },
  planeDesc: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
});
