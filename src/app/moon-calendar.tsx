import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { MOON_PHASES } from '@/constants/cosmic/moonPhases';
import { getMoonPhase } from '@/utils/calculations/lunarPhase';
import type { MoonPhase } from '@/types/cosmic';

const PHASE_SYMBOLS: Record<MoonPhase, string> = {
  'new-moon': '🌑', 'waxing-crescent': '🌒', 'first-quarter': '🌓', 'waxing-gibbous': '🌔',
  'full-moon': '🌕', 'waning-gibbous': '🌖', 'last-quarter': '🌗', 'waning-crescent': '🌘',
};

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_RANGE = Array.from({ length: 61 }, (_, i) => CURRENT_YEAR - 30 + i);

export default function MoonCalendarScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());
  const [showYearPicker, setShowYearPicker] = useState(false);

  const today = useMemo(() => {
    const d = new Date();
    const phase = getMoonPhase(d);
    return { phase, data: MOON_PHASES[phase] };
  }, []);

  const monthDays = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const days: { day: number; phase: MoonPhase; data: typeof MOON_PHASES['new-moon'] }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const phase = getMoonPhase(new Date(selectedYear, selectedMonth, d));
      days.push({ day: d, phase, data: MOON_PHASES[phase] });
    }
    return days;
  }, [selectedYear, selectedMonth]);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const phaseCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    monthDays.forEach((d) => { counts[d.phase] = (counts[d.phase] ?? 0) + 1; });
    return counts;
  }, [monthDays]);

  const firstDayOfMonth = useMemo(() => new Date(selectedYear, selectedMonth, 1).getDay(), [selectedYear, selectedMonth]);

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.six }}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Moon Calendar</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Lunar phases across decades</Text>

        <View style={[styles.todayCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.todayLabel, { color: theme.textSecondary }]}>Today&apos;s Moon</Text>
          <Text style={styles.todayEmoji}>{PHASE_SYMBOLS[today.phase]}</Text>
          <Text style={[styles.todayPhase, { color: theme.accent }]}>{today.data.title}</Text>
          <Text style={[styles.todayEnergy, { color: theme.textSecondary }]}>{today.data.energy}</Text>
          <Text style={[styles.todayDesc, { color: theme.text }]}>{today.data.interpretation}</Text>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <Text style={[styles.activityLabel, { color: theme.textSecondary }]}>Best Activities</Text>
          {today.data.bestActivities.map((a, i) => (
            <Text key={i} style={[styles.activityItem, { color: theme.text }]}>✦ {a}</Text>
          ))}
        </View>

        <Pressable onPress={() => setShowYearPicker(!showYearPicker)}
          style={[styles.yearBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.yearText, { color: theme.accent }]}>{selectedYear}</Text>
          <Text style={[styles.yearArrow, { color: theme.textSecondary }]}>{showYearPicker ? '▲' : '▼'}</Text>
        </Pressable>

        {showYearPicker && (
          <ScrollView horizontal style={styles.yearPicker} showsHorizontalScrollIndicator={false}>
            {YEAR_RANGE.map((y) => (
              <Pressable key={y} onPress={() => { setSelectedYear(y); setShowYearPicker(false); }}
                style={[styles.yearOption, { backgroundColor: selectedYear === y ? theme.accent : theme.surface, borderColor: selectedYear === y ? theme.accent : theme.border }]}>
                <Text style={[styles.yearOptionText, { color: selectedYear === y ? '#fff' : theme.text, fontWeight: selectedYear === y ? '700' : '500' }]}>{y}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        <View style={styles.monthRow}>
          {months.map((m, i) => (
            <Pressable key={m} onPress={() => setSelectedMonth(i)}
              style={[styles.monthBtn, { backgroundColor: selectedMonth === i ? theme.accent : theme.surface, borderColor: selectedMonth === i ? theme.accent : theme.border }]}>
              <Text style={[styles.monthText, { color: selectedMonth === i ? '#fff' : theme.text, fontWeight: selectedMonth === i ? '700' : '500' }]}>{m}</Text>
            </Pressable>
          ))}
        </View>

        <View style={[styles.calendarCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.calTitle, { color: theme.text }]}>{months[selectedMonth]} {selectedYear}</Text>
          <Text style={[styles.calSub, { color: theme.textSecondary }]}>Week: Sun Mon Tue Wed Thu Fri Sat</Text>
          <View style={styles.calGrid}>
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <View key={`empty-${i}`} style={styles.calDay} />
            ))}
            {monthDays.map((d) => {
              const isToday = d.day === new Date().getDate() && selectedMonth === new Date().getMonth() && selectedYear === CURRENT_YEAR;
              return (
                <View key={d.day} style={[styles.calDay, isToday && { backgroundColor: theme.accent + '20', borderRadius: 8 }]}>
                  <Text style={[styles.calDayNum, { color: isToday ? theme.accent : theme.text, fontWeight: isToday ? '800' : '500' }]}>{d.day}</Text>
                  <Text style={styles.calEmoji}>{PHASE_SYMBOLS[d.phase]}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Phase Summary — {months[selectedMonth]} {selectedYear}</Text>
          {Object.entries(phaseCounts).map(([phase, count]) => (
            <View key={phase} style={styles.phaseRow}>
              <Text style={styles.phaseEmoji}>{PHASE_SYMBOLS[phase as MoonPhase]}</Text>
              <Text style={[styles.phaseName, { color: theme.text }]}>{MOON_PHASES[phase as MoonPhase].title}</Text>
              <Text style={[styles.phaseCount, { color: theme.textSecondary }]}>{count} days</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>All Moon Phases</Text>
        {Object.values(MOON_PHASES).map((p) => (
          <View key={p.phase} style={[styles.phaseCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={styles.phaseSymbol}>{p.symbol}</Text>
            <Text style={[styles.phaseTitle, { color: theme.accent }]}>{p.title}</Text>
            <Text style={[styles.phaseDesc, { color: theme.text }]}>{p.interpretation}</Text>
            <Text style={[styles.phaseEnergy, { color: theme.textSecondary, fontStyle: 'italic' }]}>{p.energy}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.three },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 15, marginBottom: 8 },
  todayCard: { borderRadius: 16, borderWidth: 1, padding: Spacing.four, alignItems: 'center', gap: 6 },
  todayLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  todayEmoji: { fontSize: 64 },
  todayPhase: { fontSize: 22, fontWeight: '800' },
  todayEnergy: { fontSize: 13, fontStyle: 'italic' },
  todayDesc: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  divider: { height: 1, width: '100%', marginVertical: 4 },
  activityLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  activityItem: { fontSize: 13, lineHeight: 20 },
  yearBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  yearText: { fontSize: 18, fontWeight: '700' },
  yearArrow: { fontSize: 10 },
  yearPicker: { maxHeight: 44 },
  yearOption: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, marginRight: 6 },
  yearOptionText: { fontSize: 13 },
  monthRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  monthBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1 },
  monthText: { fontSize: 11 },
  calendarCard: { borderRadius: 14, borderWidth: 1, padding: Spacing.three, gap: 8 },
  calTitle: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
  calSub: { fontSize: 10, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.3 },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calDay: { width: '14.28%', alignItems: 'center', paddingVertical: 4, gap: 2 },
  calDayNum: { fontSize: 12 },
  calEmoji: { fontSize: 14 },
  card: { borderRadius: 14, borderWidth: 1, padding: Spacing.three, gap: 6 },
  cardLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  phaseRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  phaseEmoji: { fontSize: 20 },
  phaseName: { fontSize: 14, fontWeight: '600', flex: 1 },
  phaseCount: { fontSize: 13 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 8 },
  phaseCard: { borderRadius: 14, borderWidth: 1, padding: Spacing.three, gap: 6 },
  phaseSymbol: { fontSize: 36, textAlign: 'center' },
  phaseTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  phaseDesc: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  phaseEnergy: { fontSize: 13, textAlign: 'center' },
});
