import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { useProfileStore } from '@/stores/profile-store';
import { CosmicIcon } from '@/components/cosmic-icon';
import * as DB from '@/services/database';
import type { FavoriteRow } from '@/services/database';

import type { CosmicIconName } from '@/components/cosmic-icon';

const TYPE_ICONS: Record<string, CosmicIconName> = {
  'angel-number': 'Star1',
  'tarot-card': 'Card',
  'dream-symbol': 'Moon',
  'spirit-animal': 'Pet',
  'chakra': 'OmegaCircle',
  'zodiac-sign': 'Sun1',
  'moon-phase': 'Moon',
  'planet': 'Global',
  'numerology': 'Hashtag',
  'crystal': 'MagicStar',
};

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const activeProfile = useProfileStore((s) => s.activeProfile);
  const [favorites, setFavorites] = useState<FavoriteRow[]>([]);

  useEffect(() => {
    if (!activeProfile) return;
    DB.getFavorites(activeProfile.id).then(setFavorites);
  }, [activeProfile]);

  const removeFav = async (item: FavoriteRow) => {
    await DB.removeFavorite(item.profileId, item.itemType, item.itemId);
    setFavorites((prev) => prev.filter((f) => f.id !== item.id));
  };

  if (!activeProfile) {
    return (
      <ScrollView style={[styles.scroll, { backgroundColor: theme.background }]}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.six }}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>Favorites</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Your saved items</Text>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>No Profile</Text>
            <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>Create a profile to save favorites.</Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.six }}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Favorites</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Your saved items ({favorites.length})</Text>

        {favorites.length === 0 && (
          <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <CosmicIcon name="Heart" size={40} color={theme.textTertiary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No favorites yet. Star items across the app to save them here.
            </Text>
          </View>
        )}

        {favorites.map((fav) => (
          <View key={fav.id} style={[styles.favCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.favRow}>
              <View style={styles.favIcon}>
                <CosmicIcon name={TYPE_ICONS[fav.itemType] || 'Star1'} size={20} color={theme.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.favLabel, { color: theme.text }]}>{fav.label || fav.itemId}</Text>
                <Text style={[styles.favType, { color: theme.textTertiary }]}>{fav.itemType}</Text>
              </View>
              <Pressable onPress={() => removeFav(fav)} hitSlop={8}
                style={[styles.removeBtn, { backgroundColor: theme.surface }]}>
                <Text style={[styles.removeText, { color: theme.error }]}>✕</Text>
              </Pressable>
            </View>
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
  subtitle: { fontSize: 15, marginBottom: 4 },
  card: { borderRadius: 14, borderWidth: 1, padding: Spacing.four, alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  cardDesc: { fontSize: 14, textAlign: 'center' },
  emptyCard: { borderRadius: 14, borderWidth: 1, padding: Spacing.six, alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  favCard: { borderRadius: 12, borderWidth: 1, padding: Spacing.three },
  favRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  favIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(59,130,246,0.1)' },
  favLabel: { fontSize: 15, fontWeight: '600' },
  favType: { fontSize: 11, marginTop: 2, textTransform: 'capitalize' },
  removeBtn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  removeText: { fontSize: 14, fontWeight: '700' },
});
