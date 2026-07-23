import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { CosmicIcon } from '@/components/cosmic-icon';
import * as DB from '@/services/database';

export default function BackupScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [importJson, setImportJson] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      setStatus('Exporting...');
      const data = await DB.exportDatabase();
      const FileSystem = require('expo-file-system');
      const Sharing = require('expo-sharing');
      const file = new FileSystem.File(FileSystem.Paths.cache, 'cosmic-oracle-backup-' + Date.now() + '.json');
      await file.write(data);
      if (Sharing?.isAvailableAsync && await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, { mimeType: 'application/json' });
      }
      setStatus('Export complete');
    } catch (e: any) {
      setStatus('Export failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!importJson.trim()) {
      Alert.alert('Error', 'Paste valid JSON backup data first.');
      return;
    }
    try {
      setLoading(true);
      setStatus('Importing...');
      JSON.parse(importJson);
      await DB.importDatabase(importJson);
      setStatus('Import complete. Data restored.');
      setImportJson('');
    } catch (e: any) {
      setStatus('Import failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePickFile = async () => {
    try {
      const DocumentPicker = require('expo-document-picker');
      const FileSystem = require('expo-file-system');
      if (!DocumentPicker?.getDocumentAsync) { setStatus('File picker not available'); return; }
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.[0]) {
        const file = new FileSystem.File(result.assets[0].uri);
        const content = await file.text();
        setImportJson(content);
        setStatus('File loaded, ready to import.');
      }
    } catch (e: any) {
      setStatus('File pick: ' + e.message);
    }
  };

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.six }}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Backup & Restore</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Export or import all your data</Text>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <CosmicIcon name="Send2" size={28} color={theme.accent} />
          <Text style={[styles.cardTitle, { color: theme.text }]}>Export Data</Text>
          <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
            Download all profiles, journal entries, tarot readings, and favorites as a JSON file.
          </Text>
          <Pressable onPress={handleExport} disabled={loading}
            style={[styles.actionBtn, { backgroundColor: theme.accent, opacity: loading ? 0.5 : 1 }]}>
            <Text style={styles.actionText}>{loading ? 'Exporting...' : 'Export to File'}</Text>
          </Pressable>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <CosmicIcon name="Cloud" size={28} color={theme.accent} />
          <Text style={[styles.cardTitle, { color: theme.text }]}>Import Data</Text>
          <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
            Paste backup JSON below or pick a file to restore your data. This will replace existing data.
          </Text>

          <Pressable onPress={handlePickFile} style={[styles.pickBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.pickText, { color: theme.accent }]}>Pick File</Text>
          </Pressable>

          <TextInput
            style={[styles.jsonInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
            placeholder="Paste JSON here..."
            placeholderTextColor={theme.textTertiary}
            multiline
            numberOfLines={6}
            value={importJson}
            onChangeText={setImportJson}
          />

          <Pressable onPress={handleImport} disabled={loading || !importJson.trim()}
            style={[styles.actionBtn, { backgroundColor: theme.accentGreen, opacity: loading || !importJson.trim() ? 0.5 : 1 }]}>
            <Text style={styles.actionText}>{loading ? 'Importing...' : 'Import Data'}</Text>
          </Pressable>
        </View>

        {status && (
          <View style={[styles.statusCard, { backgroundColor: theme.accent + '15', borderColor: theme.accent + '30' }]}>
            <Text style={[styles.statusText, { color: theme.accent }]}>{status}</Text>
          </View>
        )}

        <View style={[styles.warningCard, { backgroundColor: theme.error + '15', borderColor: theme.error + '30' }]}>
          <Text style={[styles.warningTitle, { color: theme.error }]}>⚠ Caution</Text>
          <Text style={[styles.warningText, { color: theme.textSecondary }]}>
            Data is stored locally on your device. Keep backups in a safe place. Importing will overwrite existing data.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.three },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 15, marginBottom: 4 },
  card: { borderRadius: 14, borderWidth: 1, padding: Spacing.four, alignItems: 'center', gap: 10 },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  cardDesc: { fontSize: 13, lineHeight: 18, textAlign: 'center' },
  actionBtn: { paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12, width: '100%', alignItems: 'center' },
  actionText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  pickBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, borderWidth: 1, width: '100%', alignItems: 'center' },
  pickText: { fontSize: 14, fontWeight: '600' },
  jsonInput: { width: '100%', borderRadius: 10, borderWidth: 1, padding: 12, fontSize: 12, fontFamily: 'monospace', minHeight: 120, textAlignVertical: 'top' },
  statusCard: { borderRadius: 12, borderWidth: 1, padding: Spacing.three, alignItems: 'center' },
  statusText: { fontSize: 14, fontWeight: '600' },
  warningCard: { borderRadius: 12, borderWidth: 1, padding: Spacing.three, gap: 4 },
  warningTitle: { fontSize: 14, fontWeight: '800' },
  warningText: { fontSize: 13, lineHeight: 18 },
});
