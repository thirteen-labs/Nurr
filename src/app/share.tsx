import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { useProfileStore } from '@/stores/profile-store';
import { Spacing } from '@/constants/theme';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system/legacy';
import {
  calculateAllNumerology, calculateSunSign, calculateMoonSign, calculateRisingSign,
  calculateChineseZodiac, calculateChineseElement, calculateEnergyScore, getDailyMessage,
  generateForecast,
} from '@/utils/calculations';
import { getMoonPhase } from '@/utils/calculations/lunarPhase';
import { MOON_PHASES } from '@/constants/cosmic/moonPhases';
import { ZODIAC_SIGNS } from '@/constants/cosmic/zodiac';
import { CHINESE_ZODIAC } from '@/constants/cosmic/chineseZodiac';
import type { MoonPhase, ZodiacSign } from '@/types/cosmic';

const PHASE_EMOJIS: Record<MoonPhase, string> = {
  'new-moon': '🌑', 'waxing-crescent': '🌒', 'first-quarter': '🌓', 'waxing-gibbous': '🌔',
  'full-moon': '🌕', 'waning-gibbous': '🌖', 'last-quarter': '🌗', 'waning-crescent': '🌘',
};

const SIGN_EMOJIS: Record<ZodiacSign, string> = {
  aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋',
  leo: '♌', virgo: '♍', libra: '♎', scorpio: '♏',
  sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓',
};

type CardTemplate = 'cosmic' | 'minimal' | 'mystic';

export default function ShareScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const activeProfile = useProfileStore((s) => s.activeProfile);
  const [sharing, setSharing] = useState(false);
  const [template, setTemplate] = useState<CardTemplate>('cosmic');

  const shareData = useMemo(() => {
    if (!activeProfile) return null;
    const [y, m, d] = activeProfile.birthDate.split('-').map(Number);
    const sunSign = calculateSunSign(m, d);
    const moonSign = calculateMoonSign(sunSign, y);
    const hour = activeProfile.birthTime ? parseInt(activeProfile.birthTime.split(':')[0]) : 12;
    const risingSign = calculateRisingSign(sunSign, hour);
    const chineseAnimal = calculateChineseZodiac(y);
    const chineseElement = calculateChineseElement(y);
    const numerology = calculateAllNumerology(activeProfile.birthDate, activeProfile.name);
    const energy = calculateEnergyScore(activeProfile.birthDate);
    const daily = getDailyMessage(activeProfile.birthDate, activeProfile.name);
    const forecast = generateForecast(activeProfile.birthDate, 'daily');
    const moonPhase = getMoonPhase(new Date());
    const moonData = MOON_PHASES[moonPhase];
    const sunData = ZODIAC_SIGNS[sunSign];
    const chineseData = CHINESE_ZODIAC[chineseAnimal];

    return {
      name: activeProfile.name,
      sunSign, moonSign, risingSign, sunData,
      chineseAnimal, chineseElement, chineseData,
      numerology, energy, daily, forecast, moonPhase, moonData,
    };
  }, [activeProfile]);

  async function shareBlueprintCard() {
    if (!shareData) return;
    setSharing(true);
    try {
      const gradientBg = template === 'cosmic'
        ? 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)'
        : template === 'mystic'
          ? 'linear-gradient(135deg, #1a0a2e, #3d1a54, #0f0c29)'
          : 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)';

      const accentColor = template === 'cosmic' ? '#a855f7' : template === 'mystic' ? '#f472b6' : '#3b82f6';

      const html = `
        <html>
          <head>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { width: 400px; height: 600px; font-family: Georgia, serif; background: ${gradientBg}; color: white; padding: 32px; display: flex; flex-direction: column; justify-content: space-between; }
              .header { text-align: center; }
              .name { font-size: 32px; font-weight: 800; margin-bottom: 4px; }
              .subtitle { font-size: 12px; opacity: 0.7; text-transform: uppercase; letter-spacing: 3px; }
              .signs { display: flex; justify-content: space-around; margin: 24px 0; }
              .sign-item { text-align: center; }
              .sign-emoji { font-size: 28px; }
              .sign-label { font-size: 10px; opacity: 0.6; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
              .sign-value { font-size: 14px; font-weight: 700; margin-top: 2px; }
              .numbers { display: flex; justify-content: space-around; margin: 16px 0; }
              .number-item { text-align: center; }
              .number-value { font-size: 24px; font-weight: 800; color: ${accentColor}; }
              .number-label { font-size: 9px; opacity: 0.6; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
              .energy { text-align: center; margin: 16px 0; }
              .energy-score { font-size: 48px; font-weight: 800; color: ${accentColor}; }
              .energy-max { font-size: 16px; opacity: 0.5; }
              .energy-label { font-size: 10px; opacity: 0.6; text-transform: uppercase; letter-spacing: 2px; }
              .bars { margin: 12px 0; }
              .bar { display: flex; align-items: center; margin: 4px 0; }
              .bar-name { font-size: 10px; width: 60px; opacity: 0.7; text-transform: uppercase; }
              .bar-track { flex: 1; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; }
              .bar-fill { height: 100%; border-radius: 4px; }
              .affirmation { text-align: center; font-style: italic; font-size: 13px; opacity: 0.85; line-height: 1.4; margin: 12px 0; padding: 0 16px; }
              .footer { text-align: center; font-size: 9px; opacity: 0.4; text-transform: uppercase; letter-spacing: 2px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="name">${shareData.name}</div>
              <div class="subtitle">Asterion Blueprint</div>
            </div>
            <div class="signs">
              <div class="sign-item">
                <div class="sign-emoji">${SIGN_EMOJIS[shareData.sunSign]}</div>
                <div class="sign-label">Sun</div>
                <div class="sign-value">${capitalize(shareData.sunSign)}</div>
              </div>
              <div class="sign-item">
                <div class="sign-emoji">${SIGN_EMOJIS[shareData.moonSign]}</div>
                <div class="sign-label">Moon</div>
                <div class="sign-value">${capitalize(shareData.moonSign)}</div>
              </div>
              <div class="sign-item">
                <div class="sign-emoji">${SIGN_EMOJIS[shareData.risingSign]}</div>
                <div class="sign-label">Rising</div>
                <div class="sign-value">${capitalize(shareData.risingSign)}</div>
              </div>
              <div class="sign-item">
                <div class="sign-emoji">${shareData.chineseData?.traits?.charAt(0) ?? '🐉'}</div>
                <div class="sign-label">Chinese</div>
                <div class="sign-value">${capitalize(shareData.chineseAnimal)}</div>
              </div>
            </div>
            <div class="numbers">
              <div class="number-item"><div class="number-value">${shareData.numerology?.lifePath ?? '—'}</div><div class="number-label">Life Path</div></div>
              <div class="number-item"><div class="number-value">${shareData.numerology?.destiny ?? '—'}</div><div class="number-label">Destiny</div></div>
              <div class="number-item"><div class="number-value">${shareData.numerology?.soulUrge ?? '—'}</div><div class="number-label">Soul</div></div>
              <div class="number-item"><div class="number-value">${shareData.numerology?.personality ?? '—'}</div><div class="number-label">Personality</div></div>
            </div>
            <div class="energy">
              <div class="energy-label">Today's Energy</div>
              <div><span class="energy-score">${shareData.energy?.overall ?? '—'}</span><span class="energy-max">/100</span></div>
            </div>
            <div class="bars">
              ${(['career', 'love', 'finance', 'health', 'spiritual'] as const).map((cat) => {
                const val = shareData.energy?.[cat] ?? 'moderate';
                const pct = val === 'high' ? 85 : val === 'moderate' ? 55 : 25;
                const color = val === 'high' ? '#22c55e' : val === 'moderate' ? '#f97316' : '#ef4444';
                return `<div class="bar"><span class="bar-name">${cat}</span><div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${color};"></div></div></div>`;
              }).join('')}
            </div>
            ${shareData.daily ? `<div class="affirmation">"${shareData.daily.affirmation}"</div>` : ''}
            <div class="footer">${PHASE_EMOJIS[shareData.moonPhase]} ${shareData.moonData.title} • Generated by Asterion</div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });

      if (Platform.OS === 'web') {
        const blob = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        const link = document.createElement('a');
        link.href = `data:application/pdf;base64,${blob}`;
        link.download = `Asterion_${shareData.name}_Card.pdf`;
        link.click();
        Alert.alert('Saved', 'Card downloaded successfully!');
      } else {
        const pdfName = `Asterion_${shareData.name}_Card.pdf`;
        const dest = `${FileSystem.documentDirectory}${pdfName}`;
        await FileSystem.moveAsync({ from: uri, to: dest });
        Alert.alert('Saved', `Card saved to:\n${dest}`);
      }
    } catch {
      Alert.alert('Error', 'Unable to generate share card.');
    } finally {
      setSharing(false);
    }
  }

  const templates: CardTemplate[] = ['cosmic', 'minimal', 'mystic'];

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.six }}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Share</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Create beautiful cosmic profile cards</Text>

        {!activeProfile ? (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>No Profile</Text>
            <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>Create a profile to share your cosmic blueprint.</Text>
          </View>
        ) : (
          <>
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Card Template</Text>
              <View style={styles.templateRow}>
                {templates.map((t) => {
                  const isActive = template === t;
                  const bg = t === 'cosmic' ? '#302b63' : t === 'mystic' ? '#3d1a54' : '#16213e';
                  return (
                    <Pressable
                      key={t}
                      onPress={() => setTemplate(t)}
                      style={({ pressed }) => [
                        styles.templateBtn,
                        { backgroundColor: bg, borderColor: isActive ? '#fff' : 'transparent', opacity: pressed ? 0.8 : 1 },
                      ]}
                    >
                      <Text style={[styles.templateLabel, { color: '#fff' }]}>{capitalize(t)}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {shareData && (
              <View style={[styles.previewCard, { backgroundColor: '#1a1a2e', borderColor: theme.cardBorder }]}>
                <Text style={[styles.previewName, { color: '#fff' }]}>{shareData.name}</Text>
                <Text style={styles.previewSubtitle}>Asterion Blueprint</Text>
                <View style={styles.previewSigns}>
                  <View style={styles.previewSignItem}>
                    <Text style={styles.previewSignEmoji}>{SIGN_EMOJIS[shareData.sunSign]}</Text>
                    <Text style={styles.previewSignLabel}>Sun</Text>
                    <Text style={styles.previewSignValue}>{capitalize(shareData.sunSign)}</Text>
                  </View>
                  <View style={styles.previewSignItem}>
                    <Text style={styles.previewSignEmoji}>{SIGN_EMOJIS[shareData.moonSign]}</Text>
                    <Text style={styles.previewSignLabel}>Moon</Text>
                    <Text style={styles.previewSignValue}>{capitalize(shareData.moonSign)}</Text>
                  </View>
                  <View style={styles.previewSignItem}>
                    <Text style={styles.previewSignEmoji}>{SIGN_EMOJIS[shareData.risingSign]}</Text>
                    <Text style={styles.previewSignLabel}>Rising</Text>
                    <Text style={styles.previewSignValue}>{capitalize(shareData.risingSign)}</Text>
                  </View>
                </View>
                <View style={styles.previewNumbers}>
                  <View style={styles.previewNumItem}>
                    <Text style={[styles.previewNumValue, { color: '#a855f7' }]}>{shareData.numerology?.lifePath ?? '—'}</Text>
                    <Text style={styles.previewNumLabel}>Life Path</Text>
                  </View>
                  <View style={styles.previewNumItem}>
                    <Text style={[styles.previewNumValue, { color: '#a855f7' }]}>{shareData.numerology?.destiny ?? '—'}</Text>
                    <Text style={styles.previewNumLabel}>Destiny</Text>
                  </View>
                  <View style={styles.previewNumItem}>
                    <Text style={[styles.previewNumValue, { color: '#a855f7' }]}>{shareData.numerology?.soulUrge ?? '—'}</Text>
                    <Text style={styles.previewNumLabel}>Soul</Text>
                  </View>
                </View>
                {shareData.daily && (
                  <Text style={styles.previewAffirmation}>{'"'}{shareData.daily.affirmation}{'"'}</Text>
                )}
              </View>
            )}

            <Pressable
              onPress={shareBlueprintCard}
              style={({ pressed }) => [styles.shareBtn, { backgroundColor: theme.accent, opacity: sharing || pressed ? 0.7 : 1 }]}
              disabled={sharing}
            >
              <Text style={styles.shareBtnText}>
                {sharing ? 'Generating...' : '📤 Generate & Share Card'}
              </Text>
            </Pressable>
          </>
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
  sectionLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  templateRow: { flexDirection: 'row', gap: 10 },
  templateBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 2, alignItems: 'center' },
  templateLabel: { fontSize: 14, fontWeight: '700' },
  previewCard: { borderRadius: 16, borderWidth: 1, padding: Spacing.four, alignItems: 'center', gap: 10 },
  previewName: { fontSize: 24, fontWeight: '800' },
  previewSubtitle: { fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 3 },
  previewSigns: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 10 },
  previewSignItem: { alignItems: 'center', gap: 2 },
  previewSignEmoji: { fontSize: 24 },
  previewSignLabel: { fontSize: 9, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' },
  previewSignValue: { fontSize: 13, fontWeight: '700', color: '#fff' },
  previewNumbers: { flexDirection: 'row', justifyContent: 'space-around', width: '80%', marginTop: 8 },
  previewNumItem: { alignItems: 'center' },
  previewNumValue: { fontSize: 22, fontWeight: '800' },
  previewNumLabel: { fontSize: 9, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' },
  previewAffirmation: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', textAlign: 'center', marginTop: 8, lineHeight: 16 },
  shareBtn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  shareBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
