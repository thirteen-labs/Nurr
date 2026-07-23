import { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { useProfileStore } from '@/stores/profile-store';
import { Spacing } from '@/constants/theme';
import { getMoonPhase } from '@/utils/calculations/lunarPhase';
import { calculateAllNumerology } from '@/utils/calculations';
import { CosmicIcon } from '@/components/cosmic-icon';
import * as DB from '@/services/database';
import type { NotificationType, MoonPhase } from '@/types/cosmic';

interface NotifPref {
  type: NotificationType;
  label: string;
  icon: string;
  description: string;
  enabled: boolean;
  time: string;
  dbId: string;
}

const PHASE_EMOJIS: Record<MoonPhase, string> = {
  'new-moon': '🌑', 'waxing-crescent': '🌒', 'first-quarter': '🌓', 'waxing-gibbous': '🌔',
  'full-moon': '🌕', 'waning-gibbous': '🌖', 'last-quarter': '🌗', 'waning-crescent': '🌘',
};

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const activeProfile = useProfileStore((s) => s.activeProfile);

  const [preferences, setPreferences] = useState<NotifPref[]>([
    { type: 'daily-energy', label: 'Daily Energy Alert', icon: 'Flash', description: 'Morning notification with today\'s energy score, affirmation, and theme.', enabled: true, time: '08:00', dbId: '' },
    { type: 'moon-phase', label: 'Moon Phase Alerts', icon: 'Moon', description: 'Notifications for new moon, full moon, and quarter moons with interpretations.', enabled: true, time: '09:00', dbId: '' },
    { type: 'personal-cycle', label: 'Personal Cycle Alerts', icon: 'Refresh', description: 'Personal year/month change notifications with guidance.', enabled: false, time: '08:00', dbId: '' },
    { type: 'transit-alert', label: 'Transit Alerts', icon: 'Global', description: 'Significant planetary transits and their interpretations.', enabled: false, time: '07:00', dbId: '' },
    { type: 'manifestation-window', label: 'Manifestation Windows', icon: 'MagicStar', description: 'Optimal times for manifestation based on moon phase and personal year.', enabled: true, time: '06:00', dbId: '' },
    { type: 'birthday', label: 'Birthday Reminders', icon: 'Star1', description: 'Reminders for profile birthdays with cosmic insights.', enabled: false, time: '08:00', dbId: '' },
  ]);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!activeProfile) return;
    loadPrefs();
    loadHistory();
  }, [activeProfile]);

  async function loadPrefs() {
    if (!activeProfile) return;
    const rows = await DB.getNotificationPreferences(activeProfile.id);
    if (rows.length > 0) {
      setPreferences((prev) => prev.map((p) => {
        const row = rows.find((r: any) => r.type === p.type);
        return row ? { ...p, enabled: row.enabled === 1, time: row.time, dbId: row.id } : p;
      }));
    }
  }

  async function loadHistory() {
    if (!activeProfile) return;
    const rows = await DB.getNotificationHistory(activeProfile.id);
    setHistory(rows);
  }

  async function togglePreference(type: NotificationType) {
    const pref = preferences.find((p) => p.type === type);
    if (!pref) return;
    const newEnabled = !pref.enabled;
    setPreferences((prev) => prev.map((p) => p.type === type ? { ...p, enabled: newEnabled } : p));

    if (!activeProfile) return;
    const id = pref.dbId || Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    await DB.upsertNotificationPreference({
      id,
      profileId: activeProfile.id,
      type,
      enabled: newEnabled ? 1 : 0,
      time: pref.time,
      days: JSON.stringify([0, 1, 2, 3, 4, 5, 6]),
    });

    if (!pref.dbId) {
      setPreferences((prev) => prev.map((p) => p.type === type ? { ...p, dbId: id } : p));
    }

    if (newEnabled) {
      scheduleNotification(type, pref);
    } else {
      cancelNotification(type);
    }
  }

  function scheduleNotification(type: NotificationType, pref: NotifPref) {
    try {
      const Notifications = require('expo-notifications');
      Notifications.scheduleNotificationAsync({
        content: {
          title: getNotifTitle(type),
          body: getNotifBody(type),
          data: { type },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 86400,
          repeats: true,
        },
      }).catch(() => {});
    } catch {}
  }

  function cancelNotification(type: NotificationType) {
    try {
      const Notifications = require('expo-notifications');
      Notifications.cancelScheduledNotificationAsync(type).catch(() => {});
    } catch {}
  }

  const moonPhase = useMemo(() => getMoonPhase(new Date()), []);
  const numerology = useMemo(() => {
    if (!activeProfile) return null;
    return calculateAllNumerology(activeProfile.birthDate, activeProfile.name);
  }, [activeProfile]);

  const nextMoonEvent = useMemo(() => {
    const events: Record<MoonPhase, string> = {
      'new-moon': 'New Moon — Plant seeds of intention. Set goals for the lunar cycle ahead.',
      'waxing-crescent': 'Waxing Crescent — Nurture your intentions. Take first steps toward your goals.',
      'first-quarter': 'First Quarter — Take action. Face challenges with courage and determination.',
      'waxing-gibbous': 'Waxing Gibbous — Refine and adjust. Trust the process as your plans take shape.',
      'full-moon': 'Full Moon — Celebrate and release. Harvest the fruits of your intentions and let go.',
      'waning-gibbous': 'Waning Gibbous — Share wisdom and gratitude. Teach what you have learned.',
      'last-quarter': 'Last Quarter — Reflect and forgive. Release old patterns and beliefs.',
      'waning-crescent': 'Waning Crescent — Surrender and rest. Allow space for the next cycle to begin.',
    };
    return events[moonPhase];
  }, [moonPhase]);

  if (!activeProfile) {
    return (
      <ScrollView style={[styles.scroll, { backgroundColor: theme.background }]}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.six }}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>Notifications</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Smart cosmic alerts</Text>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>No Profile</Text>
            <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>Create a profile to set up smart notifications.</Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.six }}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Notifications</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Smart cosmic alerts for {activeProfile.name}</Text>

        <View style={[styles.moonCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.moonHeader}>
            <Text style={styles.moonEmoji}>{PHASE_EMOJIS[moonPhase]}</Text>
            <View>
              <Text style={[styles.moonLabel, { color: theme.textSecondary }]}>Current Moon Phase</Text>
              <Text style={[styles.moonValue, { color: theme.text }]}>{nextMoonEvent?.split('—')[0]?.trim()}</Text>
            </View>
          </View>
          <Text style={[styles.moonInterp, { color: theme.textSecondary }]}>{nextMoonEvent?.split('—')[1]?.trim()}</Text>
        </View>

        {numerology && (
          <View style={[styles.cycleCard, { backgroundColor: theme.card, borderColor: theme.accent + '40' }]}>
            <Text style={[styles.cycleLabel, { color: theme.textSecondary }]}>Current Cycle</Text>
            <View style={styles.cycleRow}>
              <View style={styles.cycleItem}>
                <Text style={[styles.cycleValue, { color: theme.accent }]}>{numerology.personalYear}</Text>
                <Text style={[styles.cycleName, { color: theme.textSecondary }]}>Year</Text>
              </View>
              <View style={styles.cycleItem}>
                <Text style={[styles.cycleValue, { color: theme.accent }]}>{numerology.personalMonth}</Text>
                <Text style={[styles.cycleName, { color: theme.textSecondary }]}>Month</Text>
              </View>
              <View style={styles.cycleItem}>
                <Text style={[styles.cycleValue, { color: theme.accent }]}>{numerology.personalDay}</Text>
                <Text style={[styles.cycleName, { color: theme.textSecondary }]}>Day</Text>
              </View>
            </View>
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Notification Preferences</Text>

        {preferences.map((pref) => (
          <View key={pref.type} style={[styles.prefCard, { backgroundColor: theme.card, borderColor: pref.enabled ? theme.accent + '40' : theme.cardBorder }]}>
            <View style={styles.prefHeader}>
              <View style={styles.prefIcon}>
                <CosmicIcon name={pref.icon as any} size={20} color={pref.enabled ? theme.accent : theme.textTertiary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.prefLabel, { color: pref.enabled ? theme.text : theme.textSecondary }]}>{pref.label}</Text>
                <Text style={[styles.prefTime, { color: theme.textTertiary }]}>Schedule: {pref.time}</Text>
              </View>
              <Switch
                value={pref.enabled}
                onValueChange={() => togglePreference(pref.type)}
                trackColor={{ false: theme.border, true: theme.accent + '60' }}
                thumbColor={pref.enabled ? theme.accent : theme.textTertiary}
              />
            </View>
            <Text style={[styles.prefDesc, { color: theme.textSecondary }]}>{pref.description}</Text>
          </View>
        ))}

        <Pressable onPress={() => setShowHistory(!showHistory)}
          style={[styles.historyToggle, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.historyToggleText, { color: theme.text }]}>
            {showHistory ? 'Hide' : 'Show'} Notification History ({history.length})
          </Text>
        </Pressable>

        {showHistory && history.length === 0 && (
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No notifications sent yet.</Text>
        )}

        {showHistory && history.map((h: any) => (
          <View key={h.id} style={[styles.historyCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.historyTitle, { color: theme.text }]}>{h.title}</Text>
            <Text style={[styles.historyBody, { color: theme.textSecondary }]}>{h.body}</Text>
            <Text style={[styles.historyDate, { color: theme.textTertiary }]}>{new Date(h.scheduledDate).toLocaleDateString()}</Text>
          </View>
        ))}

        <View style={[styles.infoCard, { backgroundColor: theme.accent + '10', borderColor: theme.accent + '30' }]}>
          <Text style={[styles.infoTitle, { color: theme.accent }]}>✦ About Smart Notifications</Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            All notifications are generated locally on your device. No data is sent to any server.
            Notifications are scheduled using your device's local notification system and work offline.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function getNotifTitle(type: NotificationType): string {
  const titles: Record<NotificationType, string> = {
    'daily-energy': '✨ Daily Energy Update',
    'moon-phase': '🌙 Moon Phase Alert',
    'personal-cycle': '🔄 Personal Cycle Update',
    'transit-alert': '🪐 Transit Alert',
    'manifestation-window': '🌟 Manifestation Window',
    'birthday': '🎂 Birthday Reminder',
  };
  return titles[type];
}

function getNotifBody(type: NotificationType): string {
  const bodies: Record<NotificationType, string> = {
    'daily-energy': 'Check your energy score, affirmation, and theme for today.',
    'moon-phase': 'A new moon phase has arrived. Check its meaning and energy.',
    'personal-cycle': 'Your personal year or month has shifted. New energies are emerging.',
    'transit-alert': 'A significant planetary transit is active. See how it affects you.',
    'manifestation-window': 'The cosmos aligns for manifestation. Now is your time.',
    'birthday': 'A profile birthday is coming up. Check their cosmic insights.',
  };
  return bodies[type];
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.three },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 15, marginBottom: 4 },
  card: { borderRadius: 14, borderWidth: 1, padding: Spacing.four, alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  cardDesc: { fontSize: 14, textAlign: 'center' },
  moonCard: { borderRadius: 16, borderWidth: 1, padding: Spacing.four, gap: 10 },
  moonHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  moonEmoji: { fontSize: 36 },
  moonLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  moonValue: { fontSize: 18, fontWeight: '700' },
  moonInterp: { fontSize: 13, lineHeight: 18 },
  cycleCard: { borderRadius: 14, borderWidth: 1, padding: Spacing.three, gap: 8 },
  cycleLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  cycleRow: { flexDirection: 'row', justifyContent: 'space-around' },
  cycleItem: { alignItems: 'center' },
  cycleValue: { fontSize: 28, fontWeight: '800' },
  cycleName: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 4 },
  prefCard: { borderRadius: 14, borderWidth: 1, padding: Spacing.three, gap: 8 },
  prefHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  prefIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(59,130,246,0.1)' },
  prefLabel: { fontSize: 15, fontWeight: '700' },
  prefTime: { fontSize: 11, marginTop: 2 },
  prefDesc: { fontSize: 12, lineHeight: 16 },
  historyToggle: { paddingVertical: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  historyToggleText: { fontSize: 14, fontWeight: '600' },
  emptyText: { textAlign: 'center', fontSize: 14, paddingVertical: 20 },
  historyCard: { borderRadius: 12, borderWidth: 1, padding: Spacing.three, gap: 4 },
  historyTitle: { fontSize: 14, fontWeight: '700' },
  historyBody: { fontSize: 13, lineHeight: 18 },
  historyDate: { fontSize: 11 },
  infoCard: { borderRadius: 14, borderWidth: 1, padding: Spacing.four, gap: 6 },
  infoTitle: { fontSize: 14, fontWeight: '800' },
  infoText: { fontSize: 13, lineHeight: 18 },
});
