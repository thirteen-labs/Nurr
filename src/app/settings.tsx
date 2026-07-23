import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/stores/app-store';
import { Spacing } from '@/constants/theme';
import type { CosmicTheme } from '@/types/cosmic';

const THEME_OPTIONS: { key: CosmicTheme; label: string; color: string }[] = [
  { key: 'midnight', label: 'Midnight', color: '#09090b' },
  { key: 'galaxy', label: 'Galaxy', color: '#581c87' },
  { key: 'nebula', label: 'Nebula', color: '#7c3aed' },
  { key: 'solar', label: 'Solar', color: '#ea580c' },
  { key: 'golden-mystic', label: 'Golden Mystic', color: '#b45309' },
  { key: 'emerald', label: 'Emerald', color: '#059669' },
  { key: 'cosmic-purple', label: 'Cosmic Purple', color: '#6d28d9' },
  { key: 'rose-gold', label: 'Rose Gold', color: '#f472b6' },
  { key: 'arctic', label: 'Arctic', color: '#06b6d4' },
  { key: 'sunset', label: 'Sunset', color: '#f97316' },
  { key: 'ocean', label: 'Ocean', color: '#14b8a6' },
  { key: 'crimson', label: 'Crimson', color: '#dc2626' },
  { key: 'lavender', label: 'Lavender', color: '#a78bfa' },
  { key: 'obsidian', label: 'Obsidian', color: '#eab308' },
  { key: 'aurora', label: 'Aurora', color: '#10b981' },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.six }}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

        <View style={[styles.section, { borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Theme</Text>
          <View style={styles.themeGrid}>
            {THEME_OPTIONS.map((opt) => (
              <Pressable
                key={opt.key}
                onPress={() => updateSettings({ theme: opt.key })}
                style={[
                  styles.themeItem,
                  {
                    borderColor: settings.theme === opt.key ? theme.accent : theme.border,
                    backgroundColor: settings.theme === opt.key ? theme.accent + '15' : 'transparent',
                  },
                ]}
              >
                <View style={[styles.themeDot, { backgroundColor: opt.color }]} />
                <Text
                  style={[
                    styles.themeLabel,
                    {
                      color: settings.theme === opt.key ? theme.accent : theme.text,
                      fontWeight: settings.theme === opt.key ? '700' : '500',
                    },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[styles.section, { borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Preferences</Text>

          <SettingRow
            label="Notifications"
            value={settings.notifications}
            onValueChange={(v) => updateSettings({ notifications: v })}
            theme={theme}
          />
          <SettingRow
            label="Haptic Feedback"
            value={settings.haptics}
            onValueChange={(v) => updateSettings({ haptics: v })}
            theme={theme}
          />
          <SettingRow
            label="Sound Effects"
            value={settings.soundEffects}
            onValueChange={(v) => updateSettings({ soundEffects: v })}
            theme={theme}
          />
        </View>

        <View style={[styles.section, { borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>About</Text>
          <View style={styles.aboutRow}>
            <Text style={[styles.aboutLabel, { color: theme.text }]}>Version</Text>
            <Text style={[styles.aboutValue, { color: theme.textSecondary }]}>1.0.0</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={[styles.aboutLabel, { color: theme.text }]}>Platform</Text>
            <Text style={[styles.aboutValue, { color: theme.textSecondary }]}>
              {Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : 'Web'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function SettingRow({
  label,
  value,
  onValueChange,
  theme,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  theme: Record<string, string>;
}) {
  return (
    <View style={[styles.settingRow, { borderBottomColor: theme.borderLight }]}>
      <Text style={[styles.settingLabel, { color: theme.text }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.border, true: theme.accent + '60' }}
        thumbColor={value ? theme.accent : theme.textTertiary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.four },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  section: {
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing.three,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  themeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  themeLabel: {
    fontSize: 14,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  aboutLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  aboutValue: {
    fontSize: 15,
  },
});
