import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { BRANDS, BRANDS_BY_CATEGORY, BRAND_CATEGORIES, searchBrands } from '@/constants/cosmic/brands';
import { CosmicIcon, type CosmicIconName } from '@/components/cosmic-icon';
import type { Brand, BrandCategory } from '@/types/cosmic';

const CATEGORY_ICONS: Record<BrandCategory, CosmicIconName> = {
  technology: 'Monitor',
  automotive: 'TrendUp',
  fashion: 'Crown1',
  'food-beverage': 'HambergerMenu',
  beauty: 'MagicStar',
  luxury: 'Star1',
  entertainment: 'VolumeHigh',
  sports: 'Flash',
  finance: 'Card',
  'travel-hospitality': 'Global',
  retail: 'Box',
  'health-fitness': 'Heart',
};

export default function BrandsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<BrandCategory | null>(null);

  const results = useMemo(() => {
    if (query.trim()) return searchBrands(query);
    return null;
  }, [query]);

  const displayedBrands = useMemo(() => {
    if (results) return results;
    if (selectedCat) return BRANDS_BY_CATEGORY[selectedCat] ?? [];
    return null;
  }, [results, selectedCat]);

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: theme.background }]}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.six }}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Brands</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Discover the numerology and astrology of thousands of global brands
        </Text>

        <TextInput
          style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
          placeholder="Search any brand..."
          placeholderTextColor={theme.placeholder}
          value={query}
          onChangeText={(t) => { setQuery(t); setSelectedCat(null); }}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          <View style={styles.catRow}>
            {BRAND_CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => { setSelectedCat(selectedCat === cat ? null : cat); setQuery(''); }}
                style={[
                  styles.catChip,
                  { backgroundColor: selectedCat === cat ? theme.accent : theme.surface, borderColor: selectedCat === cat ? theme.accent : theme.border },
                ]}
              >
                <CosmicIcon name={CATEGORY_ICONS[cat]} size={14} color={selectedCat === cat ? '#fff' : theme.textSecondary} />
                <Text style={[styles.catLabel, { color: selectedCat === cat ? '#fff' : theme.text }]}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {!query && !selectedCat && (
          <View style={styles.grid}>
            {BRANDS.slice(0, 100).map((brand) => (
              <BrandCard key={brand.id} brand={brand} theme={theme} compact />
            ))}
          </View>
        )}

        {displayedBrands && displayedBrands.length > 0 && (
          <View style={{ gap: 10 }}>
            {selectedCat && (
              <Text style={[styles.catHeader, { color: theme.accent }]}>
                {selectedCat.charAt(0).toUpperCase() + selectedCat.slice(1).replace('-', ' ')}
                {' '}({displayedBrands.length})
              </Text>
            )}
            {displayedBrands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} theme={theme} />
            ))}
          </View>
        )}

        {displayedBrands && displayedBrands.length === 0 && (
          <Text style={[styles.emptyText, { color: theme.textTertiary }]}>No brands found</Text>
        )}
      </View>
    </ScrollView>
  );
}

function BrandLogo({ brand }: { brand: Brand }) {
  return (
    <View style={styles.logoWrap}>
      <Text style={styles.logoText}>{brand.logo}</Text>
    </View>
  );
}

function BrandCard({ brand, theme, compact }: { brand: Brand; theme: any; compact?: boolean }) {
  return (
    <Pressable
      onPress={() => router.push(`/brand/${brand.slug}` as any)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: pressed ? theme.surface : theme.card, borderColor: theme.cardBorder },
        pressed && { opacity: 0.9 },
      ]}
    >
      <View style={styles.cardRow}>
        <BrandLogo brand={brand} />
        <View style={styles.cardInfo}>
          <Text style={[styles.cardName, { color: theme.text }]}>{brand.name}</Text>
          <Text style={[styles.cardTagline, { color: theme.textSecondary }]} numberOfLines={1}>
            {brand.tagline}
          </Text>
          {!compact && (
            <View style={styles.cardMeta}>
              <Text style={[styles.metaBadge, { backgroundColor: theme.accent + '20', color: theme.accent }]}>
                #{brand.numerology.brandNumber}
              </Text>
              <Text style={[styles.metaBadge, { backgroundColor: theme.accentOrange + '20', color: theme.accentOrange }]}>
                {brand.astrology.zodiacSign}
              </Text>
              <Text style={[styles.metaBadge, { backgroundColor: theme.accentGreen + '20', color: theme.accentGreen }]}>
                {brand.astrology.element}
              </Text>
            </View>
          )}
        </View>
        <Text style={{ color: theme.textTertiary, fontSize: 16 }}>›</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.three },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 14, lineHeight: 20 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16 },
  catScroll: { marginBottom: 4 },
  catRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  catLabel: { fontSize: 13, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-start' },
  catHeader: { fontSize: 18, fontWeight: '700', marginTop: 8 },
  card: { borderRadius: 14, borderWidth: 1, padding: Spacing.three },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 28 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: '700' },
  cardTagline: { fontSize: 13, marginTop: 2 },
  cardMeta: { flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' },
  metaBadge: { fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, overflow: 'hidden' },
  emptyText: { fontSize: 14, textAlign: 'center', marginTop: Spacing.four },
});
