import { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { useProfileStore } from '@/stores/profile-store';
import { Spacing } from '@/constants/theme';
import { ZODIAC_SIGNS } from '@/constants/cosmic/zodiac';
import { MOON_PHASES } from '@/constants/cosmic/moonPhases';
import { getDailyMessage, calculateEnergyScore, generateForecast } from '@/utils/calculations';
import { getSunSign, getZodiacElement, getZodiacQuality } from '@/utils/calculations/sunSign';
import { getMoonSign } from '@/utils/calculations/moonSign';
import { getRisingSign } from '@/utils/calculations/risingSign';
import { getChineseZodiacFromDate } from '@/utils/calculations/chineseZodiac';
import { getMoonPhase, getMoonIllumination } from '@/utils/calculations/lunarPhase';
import { CosmicIcon } from '@/components/cosmic-icon';

const SCREEN_WIDTH = Dimensions.get('window').width;

const SIGN_SYMBOLS: Record<string, string> = {
  aries: '\u2648', taurus: '\u2649', gemini: '\u264A',
  cancer: '\u264B', leo: '\u264C', virgo: '\u264D',
  libra: '\u264E', scorpio: '\u264F', sagittarius: '\u2650',
  capricorn: '\u2651', aquarius: '\u2652', pisces: '\u2653',
};

const ELEMENT_COLORS: Record<string, string> = {
  fire: '#f97316', earth: '#65a30d', air: '#0ea5e9', water: '#3b82f6',
};

const PHASE_EMOJIS: Record<string, string> = {
  'new-moon': '\uD83C\uDF11', 'waxing-crescent': '\uD83C\uDF12', 'first-quarter': '\uD83C\uDF13',
  'waxing-gibbous': '\uD83C\uDF14', 'full-moon': '\uD83C\uDF15', 'waning-gibbous': '\uD83C\uDF16',
  'last-quarter': '\uD83C\uDF17', 'waning-crescent': '\uD83C\uDF18',
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const profiles = useProfileStore((s) => s.profiles);
  const activeProfile = useProfileStore((s) => s.activeProfile);
  const setActiveProfile = useProfileStore((s) => s.setActiveProfile);

  useEffect(() => {
    if (profiles.length > 0 && !activeProfile) {
      setActiveProfile(profiles[0].id);
    }
  }, [profiles, activeProfile, setActiveProfile]);

  const today = useMemo(() => {
    const d = new Date();
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    return { dayName, dateStr, hour: d.getHours() };
  }, []);

  const greeting = useMemo(() => {
    const h = today.hour;
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, [today.hour]);

  const dailyMessage = useMemo(() => {
    if (!activeProfile) return null;
    try { return getDailyMessage(activeProfile.birthDate, activeProfile.name); }
    catch { return null; }
  }, [activeProfile]);

  const energy = useMemo(() => {
    if (!activeProfile) return null;
    try { return calculateEnergyScore(activeProfile.birthDate); }
    catch { return null; }
  }, [activeProfile]);

  const profileData = useMemo(() => {
    if (!activeProfile) return null;
    try {
      const sunSign = getSunSign(activeProfile.birthDate);
      const moonSign = getMoonSign(activeProfile.birthDate, activeProfile.birthTime);
      const risingSign = getRisingSign(sunSign, activeProfile.birthTime);
      const chinese = getChineseZodiacFromDate(activeProfile.birthDate);
      const element = getZodiacElement(sunSign);
      const quality = getZodiacQuality(sunSign);
      const moonPhase = getMoonPhase(new Date());
      const illumination = getMoonIllumination(new Date());
      const forecast = generateForecast(activeProfile.birthDate, 'daily');
      return {
        sunSign: ZODIAC_SIGNS[sunSign],
        moonSign: ZODIAC_SIGNS[moonSign],
        risingSign: ZODIAC_SIGNS[risingSign],
        chineseAnimal: chinese.animal,
        chineseElement: chinese.element,
        sunElement: element,
        quality,
        moonPhase,
        illumination,
        forecast,
        sunSignKey: sunSign,
        moonSignKey: moonSign,
        risingSignKey: risingSign,
      };
    } catch { return null; }
  }, [activeProfile]);

  function levelValue(l: 'high' | 'moderate' | 'low'): number {
    return l === 'high' ? 0.85 : l === 'moderate' ? 0.55 : 0.25;
  }

  function levelColor(l: 'high' | 'moderate' | 'low'): string {
    return l === 'high' ? theme.accentGreen : l === 'moderate' ? theme.accentOrange : theme.accent;
  }

  if (!activeProfile) {
    return (
      <ScrollView style={[styles.scroll, { backgroundColor: theme.background }]}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.six }}>
        <View style={styles.content}>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>Welcome to</Text>
          <Text style={[styles.appName, { color: theme.accent }]}>Cosmic Oracle</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Your all-in-one offline spiritual intelligence platform
          </Text>
          <Pressable onPress={() => router.navigate('/profile-create')}
            style={[styles.createBtn, { backgroundColor: theme.accent }]}>
            <Text style={styles.createBtnText}>Create Your Profile</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.five }}
      showsVerticalScrollIndicator={false}
    >
      {/* === HEADER === */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>
            {greeting}, {activeProfile.name}
          </Text>
          <Text style={[styles.date, { color: theme.textTertiary }]}>
            {today.dayName}, {today.dateStr}
          </Text>
        </View>
        <Pressable onPress={() => router.navigate('/blueprint')}
          style={[styles.profileBadge, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {profileData && (
            <Text style={[styles.profileSymbol, { color: theme.accent }]}>
              {SIGN_SYMBOLS[profileData.sunSignKey] || '\u2605'}
            </Text>
          )}
        </Pressable>
      </View>

      {/* === ENERGY SCORE — Central Focus === */}
      {energy && (
        <View style={[styles.energyHero, { backgroundColor: theme.card, borderColor: theme.accent + '50' }]}>
          <View style={styles.energyGlow}>
            <Text style={[styles.energyScore, { color: energy.overall >= 66 ? theme.accentGreen : energy.overall >= 33 ? theme.accentOrange : theme.accent }]}>
              {energy.overall}
            </Text>
            <Text style={[styles.energyMax, { color: theme.textTertiary }]}>/100</Text>
          </View>
          <Text style={[styles.energyLabel, { color: energy.overall >= 66 ? theme.accentGreen : energy.overall >= 33 ? theme.accentOrange : theme.textSecondary }]}>
            {energy.overall >= 66 ? 'HIGH ENERGY' : energy.overall >= 33 ? 'MODERATE ENERGY' : 'LOW ENERGY'}
          </Text>
          {dailyMessage && (
            <Text style={[styles.energyTheme, { color: theme.text }]}>
              Today&apos;s Theme: <Text style={{ color: theme.accent, fontWeight: '800' }}>{dailyMessage.theme}</Text>
            </Text>
          )}
          <Text style={[styles.energyDesc, { color: theme.textSecondary }]}>
            {energy.lunarInfluence}
          </Text>

          {/* Domain Bars */}
          <View style={styles.domainGrid}>
            {(['career', 'love', 'finance', 'health', 'spiritual'] as const).map((cat) => {
              const lvl = energy[cat];
              const color = levelColor(lvl);
              const pct = levelValue(lvl) * 100;
              return (
                <View key={cat} style={styles.domainItem}>
                  <View style={styles.domainLabelRow}>
                    <Text style={[styles.domainLabel, { color: theme.textSecondary }]}>{capitalize(cat)}</Text>
                    <Text style={[styles.domainVal, { color }]}>{lvl === 'high' ? '\u25B2' : lvl === 'moderate' ? '\u25B6' : '\u25BC'}</Text>
                  </View>
                  <View style={[styles.domainBarBg, { backgroundColor: color + '20' }]}>
                    <View style={[styles.domainBarFill, { backgroundColor: color, width: `${pct}%` as any }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* === PLANETARY RULER === */}
      {energy && (
        <View style={[styles.rulerCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <CosmicIcon name="Global" size={16} color={theme.accent} />
          <Text style={[styles.rulerText, { color: theme.textSecondary }]}>
            {energy.planetaryRuler}
          </Text>
        </View>
      )}

      {/* === AFFIRMATION & MANTRAS === */}
      {dailyMessage && (
        <View style={[styles.affirmationCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.quoteMark, { color: theme.accent + '30' }]}>{'"'}</Text>
          <Text style={[styles.affirmation, { color: theme.text }]}>
            {dailyMessage.affirmation}
          </Text>
          <Text style={[styles.mantra, { color: theme.accent }]}>
            ~ {dailyMessage.mantra}
          </Text>
          <View style={[styles.focusRow, { backgroundColor: theme.accent + '10', borderColor: theme.accent + '20' }]}>
            <Text style={[styles.focusLabel, { color: theme.textSecondary }]}>Focus</Text>
            <Text style={[styles.focusText, { color: theme.text }]}>{dailyMessage.focus}</Text>
          </View>
        </View>
      )}

      {/* === GUIDANCE === */}
      {dailyMessage && (
        <View style={[styles.guidanceCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.guidanceLabel, { color: theme.textSecondary }]}>Daily Guidance</Text>
          <Text style={[styles.guidanceText, { color: theme.text }]}>{dailyMessage.guidance}</Text>
        </View>
      )}

      {/* === ASTROLOGICAL OVERVIEW === */}
      {profileData && (
        <View style={[styles.astroGrid, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Cosmic Profile</Text>
          <View style={styles.astroRow}>
            <AstroMiniCard
              label="Sun"
              value={capitalize(profileData.sunSignKey)}
              symbol={SIGN_SYMBOLS[profileData.sunSignKey] || '\u2605'}
              color={ELEMENT_COLORS[profileData.sunElement] || theme.accent}
              theme={theme}
            />
            <AstroMiniCard
              label="Moon"
              value={capitalize(profileData.moonSignKey)}
              symbol={SIGN_SYMBOLS[profileData.moonSignKey] || '\u2605'}
              color={ELEMENT_COLORS[getZodiacElement(profileData.moonSignKey)] || theme.accent}
              theme={theme}
            />
            <AstroMiniCard
              label="Rising"
              value={capitalize(profileData.risingSignKey)}
              symbol={SIGN_SYMBOLS[profileData.risingSignKey] || '\u2605'}
              color={ELEMENT_COLORS[getZodiacElement(profileData.risingSignKey)] || theme.accent}
              theme={theme}
            />
          </View>
          <View style={[styles.chipRow]}>
            <View style={[styles.chip, { backgroundColor: ELEMENT_COLORS[profileData.sunElement] + '20', borderColor: ELEMENT_COLORS[profileData.sunElement] + '40' }]}>
              <Text style={[styles.chipText, { color: ELEMENT_COLORS[profileData.sunElement] }]}>{capitalize(profileData.sunElement)}</Text>
            </View>
            <View style={[styles.chip, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.chipText, { color: theme.text }]}>{capitalize(profileData.quality)}</Text>
            </View>
            <View style={[styles.chip, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.chipText, { color: theme.text }]}>{capitalize(profileData.chineseAnimal)}</Text>
            </View>
            <View style={[styles.chip, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.chipText, { color: theme.text }]}>{capitalize(profileData.chineseElement)}</Text>
            </View>
          </View>
        </View>
      )}

      {/* === MOON PHASE === */}
      {profileData && (
        <View style={[styles.moonCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Lunar Phase</Text>
          <View style={styles.moonBody}>
            <Text style={styles.moonEmoji}>{PHASE_EMOJIS[profileData.moonPhase] || '\uD83C\uDF19'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.moonPhaseTitle, { color: theme.accent }]}>
                {MOON_PHASES[profileData.moonPhase]?.title || capitalize(profileData.moonPhase.replace(/-/g, ' '))}
              </Text>
              <Text style={[styles.moonIllum, { color: theme.textSecondary }]}>
                Illumination: {profileData.illumination}%
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* === DAILY FORECAST SNAPSHOT === */}
      {profileData?.forecast && (
        <View style={[styles.forecastCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Today&apos;s Forecast</Text>
          {([
            { key: 'love' as const, icon: 'Heart', label: 'Love' },
            { key: 'career' as const, icon: 'Briefcase', label: 'Career' },
            { key: 'health' as const, icon: 'Heart', label: 'Health' },
            { key: 'finance' as const, icon: 'Hashtag', label: 'Finance' },
            { key: 'spiritual' as const, icon: 'MagicStar', label: 'Spiritual' },
          ]).map((item) => (
            <View key={item.key} style={[styles.forecastItem, { borderBottomColor: theme.border }]}>
              <Text style={[styles.forecastLabel, { color: theme.textSecondary }]}>{item.label}</Text>
              <Text style={[styles.forecastText, { color: theme.text }]}>
                {profileData.forecast[item.key]}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* === QUICK NAV === */}
      <View style={styles.navGrid}>
        {[
          { label: 'Cosmic Blueprint', icon: 'MagicStar' as const, route: '/blueprint' },
          { label: 'Numerology', icon: 'Hashtag' as const, route: '/numerology' },
          { label: 'Compatibility', icon: 'Heart' as const, route: '/compatibility' },
          { label: 'Forecast', icon: 'TrendUp' as const, route: '/forecast' },
          { label: 'Tarot', icon: 'Card' as const, route: '/tarot' },
          { label: 'Analytics', icon: 'Chart2' as const, route: '/analytics' },
        ].map((action) => (
          <Pressable key={action.route} onPress={() => router.navigate(action.route)}
            style={({ pressed }) => [styles.navItem, { backgroundColor: theme.card, borderColor: theme.cardBorder, opacity: pressed ? 0.8 : 1 }]}>
            <CosmicIcon name={action.icon} size={20} color={theme.accent} />
            <Text style={[styles.navItemLabel, { color: theme.text }]}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

function AstroMiniCard({ label, value, symbol, color, theme }: {
  label: string; value: string; symbol: string; color: string; theme: any;
}) {
  return (
    <View style={[styles.astroMini, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.astroSymbol, { color }]}>{symbol}</Text>
      <Text style={[styles.astroValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.astroLabel, { color: theme.textTertiary }]}>{label}</Text>
    </View>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.four },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.four, paddingTop: Spacing.three, paddingBottom: Spacing.two,
  },
  greeting: { fontSize: 15, fontWeight: '500' },
  appName: { fontSize: 32, fontWeight: '800', marginTop: 4 },
  date: { fontSize: 13, marginTop: 2 },
  subtitle: { fontSize: 15, lineHeight: 22, marginTop: 8 },
  profileBadge: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  profileSymbol: { fontSize: 24 },

  // Energy Hero
  energyHero: {
    marginHorizontal: Spacing.four, borderRadius: 20, borderWidth: 1,
    padding: Spacing.four, alignItems: 'center', gap: 8, marginBottom: 8,
  },
  energyGlow: { flexDirection: 'row', alignItems: 'baseline' },
  energyScore: { fontSize: 72, fontWeight: '900', letterSpacing: -2 },
  energyMax: { fontSize: 24, fontWeight: '600', marginLeft: 4 },
  energyLabel: { fontSize: 13, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
  energyTheme: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  energyDesc: { fontSize: 13, lineHeight: 18, textAlign: 'center', fontStyle: 'italic' },
  domainGrid: { width: '100%', gap: 8, marginTop: 8 },
  domainItem: { gap: 3 },
  domainLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  domainLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  domainVal: { fontSize: 11 },
  domainBarBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  domainBarFill: { height: '100%', borderRadius: 3 },

  // Planetary Ruler
  rulerCard: {
    marginHorizontal: Spacing.four, flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8,
  },
  rulerText: { fontSize: 13, fontWeight: '500', flex: 1 },

  // Affirmation
  affirmationCard: {
    marginHorizontal: Spacing.four, borderRadius: 16, borderWidth: 1,
    padding: Spacing.four, gap: 8, marginBottom: 8,
  },
  quoteMark: { fontSize: 48, fontWeight: '800', lineHeight: 40, marginBottom: -8 },
  affirmation: { fontSize: 17, fontWeight: '600', lineHeight: 24, fontStyle: 'italic' },
  mantra: { fontSize: 14, fontWeight: '700', textAlign: 'center', paddingVertical: 4 },
  focusRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 10, borderWidth: 1, padding: 12, marginTop: 4 },
  focusLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  focusText: { fontSize: 13, fontWeight: '500', lineHeight: 18, flex: 1 },

  // Guidance
  guidanceCard: {
    marginHorizontal: Spacing.four, borderRadius: 16, borderWidth: 1,
    padding: Spacing.four, gap: 8, marginBottom: 8,
  },
  guidanceLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  guidanceText: { fontSize: 14, lineHeight: 20, fontWeight: '500' },

  // Astro Grid
  astroGrid: {
    marginHorizontal: Spacing.four, borderRadius: 16, borderWidth: 1,
    padding: Spacing.four, gap: 12, marginBottom: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  astroRow: { flexDirection: 'row', gap: 8 },
  astroMini: { flex: 1, alignItems: 'center', gap: 4, borderRadius: 12, borderWidth: 1, paddingVertical: 12 },
  astroSymbol: { fontSize: 28, fontWeight: '700' },
  astroValue: { fontSize: 13, fontWeight: '700' },
  astroLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  chipText: { fontSize: 11, fontWeight: '700' },

  // Moon Card
  moonCard: {
    marginHorizontal: Spacing.four, borderRadius: 16, borderWidth: 1,
    padding: Spacing.four, gap: 8, marginBottom: 8,
  },
  moonBody: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  moonEmoji: { fontSize: 44 },
  moonPhaseTitle: { fontSize: 17, fontWeight: '700' },
  moonIllum: { fontSize: 13, marginTop: 2 },

  // Forecast
  forecastCard: {
    marginHorizontal: Spacing.four, borderRadius: 16, borderWidth: 1,
    padding: Spacing.four, gap: 10, marginBottom: 8,
  },
  forecastItem: { gap: 4, paddingBottom: 8, borderBottomWidth: 0.5 },
  forecastLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  forecastText: { fontSize: 13, lineHeight: 18 },

  // Nav Grid
  navGrid: {
    marginHorizontal: Spacing.four, flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    marginTop: 4,
  },
  navItem: {
    width: (SCREEN_WIDTH - Spacing.four * 2 - 8) / 3 - 4,
    borderRadius: 12, borderWidth: 1, padding: 12, alignItems: 'center', gap: 8,
  },
  navItemLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },

  // Create Profile
  createBtn: { marginTop: Spacing.four, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginHorizontal: Spacing.four },
  createBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});
