import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { useProfileStore } from '@/stores/profile-store';
import { Spacing } from '@/constants/theme';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system/legacy';
import {
  calculateSunSign, calculateMoonSign, calculateRisingSign,
  calculateAllNumerology, calculateChineseZodiac, calculateChineseElement,
  generateCosmicBlueprint, calculateEnergyScore, generateForecast,
} from '@/utils/calculations';
import { ZODIAC_SIGNS } from '@/constants/cosmic/zodiac';
import { CHINESE_ZODIAC, ELEMENT_MEANINGS } from '@/constants/cosmic/chineseZodiac';
import { findBirthstone } from '@/constants/cosmic/birthstones';

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const activeProfile = useProfileStore((s) => s.activeProfile);
  const [exporting, setExporting] = useState(false);

  const reportData = useMemo(() => {
    if (!activeProfile) return null;
    const [y, m, d] = activeProfile.birthDate.split('-').map(Number);
    const sunSign = calculateSunSign(m, d);
    const moonSign = calculateMoonSign(sunSign, y);
    const hour = activeProfile.birthTime ? parseInt(activeProfile.birthTime.split(':')[0]) : 12;
    const risingSign = calculateRisingSign(sunSign, hour);
    const sunData = ZODIAC_SIGNS[sunSign];
    const chineseAnimal = calculateChineseZodiac(y);
    const chineseElement = calculateChineseElement(y);
    const chineseData = CHINESE_ZODIAC[chineseAnimal];
    const elementData = ELEMENT_MEANINGS[chineseElement];
    const numerology = calculateAllNumerology(activeProfile.birthDate, activeProfile.name);
    const birthstone = findBirthstone(m);
    const energy = calculateEnergyScore(activeProfile.birthDate);
    const blueprint = generateCosmicBlueprint(activeProfile);
    const forecast = generateForecast(activeProfile.birthDate, 'daily');

    return {
      name: activeProfile.name,
      birthDate: activeProfile.birthDate,
      birthTime: activeProfile.birthTime ?? 'Not specified',
      sunSign, moonSign, risingSign, sunData,
      chineseAnimal, chineseElement, elementData, chineseData,
      numerology, birthstone, energy, blueprint, forecast,
    };
  }, [activeProfile]);

  async function exportPdf() {
    if (!reportData) return;
    setExporting(true);
    try {
      const n = reportData.numerology;
      const bp = reportData.blueprint;
      const eb = bp?.elementBalance;

      const html = `
        <html>
          <head>
            <style>
              body { font-family: 'Georgia', serif; color: #1a1a2e; padding: 40px; max-width: 800px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 32px; border-bottom: 3px solid #7c3aed; padding-bottom: 20px; }
              h1 { color: #7c3aed; font-size: 32px; margin-bottom: 4px; }
              h2 { color: #5b21b6; font-size: 20px; margin-top: 28px; border-left: 4px solid #7c3aed; padding-left: 12px; }
              h3 { color: #6d28d9; font-size: 16px; margin-top: 16px; }
              .subtitle { color: #6b7280; font-size: 14px; }
              .section { margin: 16px 0; padding: 16px; background: #f5f3ff; border-radius: 10px; border: 1px solid #e9e5f5; }
              .section-alt { background: #f0fdf4; border-color: #dcfce7; }
              .section-blue { background: #eff6ff; border-color: #dbeafe; }
              .section-orange { background: #fff7ed; border-color: #fed7aa; }
              .section-pink { background: #fdf2f8; border-color: #fbcfe8; }
              .row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid rgba(0,0,0,0.05); }
              .label { font-weight: 600; color: #6b7280; font-size: 13px; }
              .value { font-weight: 700; color: #1a1a2e; font-size: 13px; }
              .grid { display: flex; flex-wrap: wrap; gap: 12px; margin: 12px 0; }
              .grid-item { flex: 1; min-width: 120px; text-align: center; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e5e7eb; }
              .grid-number { font-size: 28px; font-weight: 800; color: #7c3aed; }
              .grid-label { font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
              .bar-container { margin: 4px 0; }
              .bar-name { font-size: 11px; color: #6b7280; margin-bottom: 2px; }
              .bar-track { height: 14px; background: #e5e7eb; border-radius: 7px; overflow: hidden; }
              .bar-fill { height: 100%; border-radius: 7px; }
              .advice { margin: 8px 0; padding: 10px; background: white; border-radius: 6px; border-left: 3px solid #7c3aed; }
              .advice-text { font-size: 13px; line-height: 1.5; }
              .footer { text-align: center; margin-top: 40px; padding-top: 16px; border-top: 2px solid #e5e7eb; color: #9ca3af; font-size: 11px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>✦ Cosmic Blueprint Report ✦</h1>
              <p class="subtitle">Generated for ${reportData.name} • ${reportData.birthDate}</p>
            </div>

            <h2>☀ Western Astrology</h2>
            <div class="section">
              <div class="row"><span class="label">Sun Sign</span><span class="value">${reportData.sunData.symbol} ${cap(reportData.sunSign)}</span></div>
              <div class="row"><span class="label">Moon Sign</span><span class="value">${cap(reportData.moonSign)}</span></div>
              <div class="row"><span class="label">Rising Sign</span><span class="value">${cap(reportData.risingSign)}</span></div>
              <div class="row"><span class="label">Ruling Planet</span><span class="value">${reportData.sunData.rulingPlanet}</span></div>
              <div class="row"><span class="label">Element</span><span class="value">${cap(reportData.sunData.element)}</span></div>
              <div class="row"><span class="label">Quality</span><span class="value">${cap(reportData.sunData.quality)}</span></div>
            </div>

            <h2>🐉 Chinese Zodiac</h2>
            <div class="section section-alt">
              <div class="row"><span class="label">Animal</span><span class="value">${cap(reportData.chineseAnimal)}</span></div>
              <div class="row"><span class="label">Element</span><span class="value">${reportData.elementData.name}</span></div>
              <div class="row"><span class="label">Direction</span><span class="value">${reportData.elementData.direction}</span></div>
              <div class="row"><span class="label">Traits</span><span class="value">${reportData.chineseData.traits}</span></div>
            </div>

            <h2>🔢 Numerology</h2>
            <div class="section section-blue">
              <div class="grid">
                <div class="grid-item"><div class="grid-number">${n?.lifePath ?? '—'}</div><div class="grid-label">Life Path</div></div>
                <div class="grid-item"><div class="grid-number">${n?.destiny ?? '—'}</div><div class="grid-label">Destiny</div></div>
                <div class="grid-item"><div class="grid-number">${n?.soulUrge ?? '—'}</div><div class="grid-label">Soul Urge</div></div>
                <div class="grid-item"><div class="grid-number">${n?.personality ?? '—'}</div><div class="grid-label">Personality</div></div>
                <div class="grid-item"><div class="grid-number">${n?.birthday ?? '—'}</div><div class="grid-label">Birthday</div></div>
                <div class="grid-item"><div class="grid-number">${n?.maturity ?? '—'}</div><div class="grid-label">Maturity</div></div>
              </div>
              ${n ? `
              <div class="row"><span class="label">Personal Year</span><span class="value">${n.personalYear}</span></div>
              <div class="row"><span class="label">Personal Month</span><span class="value">${n.personalMonth}</span></div>
              <div class="row"><span class="label">Personal Day</span><span class="value">${n.personalDay}</span></div>
              <div class="row"><span class="label">Balance Number</span><span class="value">${n.balanceNumber}</span></div>
              <div class="row"><span class="label">Hidden Passion</span><span class="value">${n.hiddenPassion}</span></div>
              <div class="row"><span class="label">Subconscious Confidence</span><span class="value">${n.subconsciousConfidence}</span></div>
              ${n.karmicDebt ? `<div class="row"><span class="label">Karmic Debt</span><span class="value">${n.karmicDebt}</span></div>` : ''}
              ` : ''}
            </div>

            <h2>💎 Birthstone</h2>
            <div class="section section-orange">
              <div class="row"><span class="label">Stone</span><span class="value">${reportData.birthstone.stone}</span></div>
              <div class="row"><span class="label">Meaning</span><span class="value">${reportData.birthstone.meaning}</span></div>
            </div>

            <h2>⚡ Energy Score</h2>
            <div class="section section-pink">
              <div class="grid">
                <div class="grid-item"><div class="grid-number">${reportData.energy?.overall ?? '—'}</div><div class="grid-label">Overall Energy</div></div>
              </div>
              ${reportData.energy ? `
              <div class="bar-container">
                <div class="bar-name">Career: ${cap(reportData.energy.career)}</div>
                <div class="bar-track"><div class="bar-fill" style="width:${reportData.energy.career === 'high' ? 85 : reportData.energy.career === 'moderate' ? 55 : 25}%;background:${reportData.energy.career === 'high' ? '#22c55e' : reportData.energy.career === 'moderate' ? '#f97316' : '#ef4444'};"></div></div>
              </div>
              <div class="bar-container">
                <div class="bar-name">Love: ${cap(reportData.energy.love)}</div>
                <div class="bar-track"><div class="bar-fill" style="width:${reportData.energy.love === 'high' ? 85 : reportData.energy.love === 'moderate' ? 55 : 25}%;background:${reportData.energy.love === 'high' ? '#22c55e' : reportData.energy.love === 'moderate' ? '#f97316' : '#ef4444'};"></div></div>
              </div>
              <div class="bar-container">
                <div class="bar-name">Finance: ${cap(reportData.energy.finance)}</div>
                <div class="bar-track"><div class="bar-fill" style="width:${reportData.energy.finance === 'high' ? 85 : reportData.energy.finance === 'moderate' ? 55 : 25}%;background:${reportData.energy.finance === 'high' ? '#22c55e' : reportData.energy.finance === 'moderate' ? '#f97316' : '#ef4444'};"></div></div>
              </div>
              <div class="bar-container">
                <div class="bar-name">Health: ${cap(reportData.energy.health)}</div>
                <div class="bar-track"><div class="bar-fill" style="width:${reportData.energy.health === 'high' ? 85 : reportData.energy.health === 'moderate' ? 55 : 25}%;background:${reportData.energy.health === 'high' ? '#22c55e' : reportData.energy.health === 'moderate' ? '#f97316' : '#ef4444'};"></div></div>
              </div>
              <div class="bar-container">
                <div class="bar-name">Spiritual: ${cap(reportData.energy.spiritual)}</div>
                <div class="bar-track"><div class="bar-fill" style="width:${reportData.energy.spiritual === 'high' ? 85 : reportData.energy.spiritual === 'moderate' ? 55 : 25}%;background:${reportData.energy.spiritual === 'high' ? '#22c55e' : reportData.energy.spiritual === 'moderate' ? '#f97316' : '#ef4444'};"></div></div>
              </div>
              <div class="advice"><span class="advice-text"><strong>Lunar Influence:</strong> ${reportData.energy.lunarInfluence}</span></div>
              <div class="advice"><span class="advice-text"><strong>Planetary Ruler:</strong> ${reportData.energy.planetaryRuler}</span></div>
              ` : ''}
            </div>

            ${reportData.forecast ? `
            <h2>🔮 Daily Forecast</h2>
            <div class="section">
              <div class="row"><span class="label">Love</span><span class="value">${reportData.forecast.love}</span></div>
              <div class="row"><span class="label">Career</span><span class="value">${reportData.forecast.career}</span></div>
              <div class="row"><span class="label">Health</span><span class="value">${reportData.forecast.health}</span></div>
              <div class="row"><span class="label">Finance</span><span class="value">${reportData.forecast.finance}</span></div>
              <div class="row"><span class="label">Spiritual</span><span class="value">${reportData.forecast.spiritual}</span></div>
            </div>
            ` : ''}

            ${eb ? `
            <h2>🌊 Element Balance</h2>
            <div class="section section-blue">
              <div class="bar-container"><div class="bar-name">Fire: ${eb.fire}</div><div class="bar-track"><div class="bar-fill" style="width:${eb.fire * 25}%;background:#ef4444;"></div></div></div>
              <div class="bar-container"><div class="bar-name">Earth: ${eb.earth}</div><div class="bar-track"><div class="bar-fill" style="width:${eb.earth * 25}%;background:#22c55e;"></div></div></div>
              <div class="bar-container"><div class="bar-name">Air: ${eb.air}</div><div class="bar-track"><div class="bar-fill" style="width:${eb.air * 25}%;background:#3b82f6;"></div></div></div>
              <div class="bar-container"><div class="bar-name">Water: ${eb.water}</div><div class="bar-track"><div class="bar-fill" style="width:${eb.water * 25}%;background:#6366f1;"></div></div></div>
            </div>
            ` : ''}

            <div class="footer">
              ✦ Asterion — Offline Spiritual Intelligence Platform ✦<br/>
              Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });

      if (Platform.OS === 'web') {
        const blob = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        const link = document.createElement('a');
        link.href = `data:application/pdf;base64,${blob}`;
        link.download = `Asterion_${reportData.name}_FullReport.pdf`;
        link.click();
      } else {
        const pdfName = `Asterion_${reportData.name}_FullReport.pdf`;
        const dest = `${FileSystem.documentDirectory}${pdfName}`;
        await FileSystem.moveAsync({ from: uri, to: dest });
        Alert.alert('PDF Saved', `Full report saved to:\n${dest}`);
      }
    } catch {
      Alert.alert('Export Failed', 'Unable to generate PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.six }}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Reports</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Generate & export comprehensive cosmic reports</Text>

        {!activeProfile ? (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>No Profile</Text>
            <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>Create a profile to generate reports.</Text>
          </View>
        ) : reportData ? (
          <>
            <View style={[styles.reportCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Text style={[styles.reportTitle, { color: theme.accent }]}>Full Cosmic Blueprint</Text>
              <Text style={[styles.reportSub, { color: theme.textSecondary }]}>For {reportData.name} — {reportData.birthDate}</Text>
              <View style={styles.divider} />
              <ReportRow label="Sun" value={`${reportData.sunData.symbol} ${cap(reportData.sunSign)}`} theme={theme} />
              <ReportRow label="Moon" value={cap(reportData.moonSign)} theme={theme} />
              <ReportRow label="Rising" value={cap(reportData.risingSign)} theme={theme} />
              <ReportRow label="Chinese" value={`${cap(reportData.chineseAnimal)} · ${reportData.elementData.name}`} theme={theme} />
              <ReportRow label="Life Path" value={String(reportData.numerology?.lifePath ?? '—')} theme={theme} />
              <ReportRow label="Destiny" value={String(reportData.numerology?.destiny ?? '—')} theme={theme} />
              <ReportRow label="Soul Urge" value={String(reportData.numerology?.soulUrge ?? '—')} theme={theme} />
              <ReportRow label="Balance" value={String(reportData.numerology?.balanceNumber ?? '—')} theme={theme} />
              <ReportRow label="Hidden Passion" value={String(reportData.numerology?.hiddenPassion ?? '—')} theme={theme} />
              <ReportRow label="Energy" value={`${reportData.energy?.overall ?? '—'}/100`} theme={theme} />
              <ReportRow label="Birthstone" value={reportData.birthstone.stone} theme={theme} />
            </View>

            <Pressable
              style={[styles.exportBtn, { backgroundColor: theme.accent, opacity: exporting ? 0.6 : 1 }]}
              onPress={exportPdf}
              disabled={exporting}
            >
              <Text style={styles.exportBtnText}>
                {exporting ? 'Generating PDF...' : '📄 Export Full Report as PDF'}
              </Text>
            </Pressable>
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

function ReportRow({ label, value, theme }: { label: string; value: string; theme: any }) {
  return (
    <View style={styles.reportRow}>
      <Text style={[styles.rLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.rValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

function cap(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.three },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 15, marginBottom: 8 },
  card: { borderRadius: 14, borderWidth: 1, padding: Spacing.four, alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  cardDesc: { fontSize: 14, textAlign: 'center' },
  reportCard: { borderRadius: 14, borderWidth: 1, padding: Spacing.four, gap: 6 },
  reportTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  reportSub: { fontSize: 13, marginBottom: 4 },
  divider: { height: 1, backgroundColor: 'transparent', marginVertical: 4 },
  reportRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.04)' },
  rLabel: { fontSize: 13, fontWeight: '600', flex: 1 },
  rValue: { fontSize: 14, fontWeight: '700', textAlign: 'right', flex: 1 },
  exportBtn: { paddingVertical: 18, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  exportBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
