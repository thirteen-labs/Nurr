import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { useProfileStore } from '@/stores/profile-store';
import { Spacing } from '@/constants/theme';
import {
  calculateAllNumerology, calculateSunSign, calculateMoonSign, calculateRisingSign,
  calculateChineseZodiac, calculateChineseElement, generateInsights,
} from '@/utils/calculations';
import { CosmicIcon } from '@/components/cosmic-icon';
import type { InsightCategory } from '@/types/cosmic';

const CATEGORY_ICONS: Record<InsightCategory, string> = {
  pattern: '🔮',
  karmic: '☸️',
  growth: '🌱',
  predictive: '🔭',
  relationship: '💕',
  elemental: '🌊',
};

const CATEGORY_COLORS: Record<InsightCategory, string> = {
  pattern: '#a855f7',
  karmic: '#f97316',
  growth: '#22c55e',
  predictive: '#3b82f6',
  relationship: '#ec4899',
  elemental: '#14b8a6',
};

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const activeProfile = useProfileStore((s) => s.activeProfile);
  const [selectedCategory, setSelectedCategory] = useState<InsightCategory | 'all'>('all');
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  const report = useMemo(() => {
    if (!activeProfile) return null;
    const [y, m, d] = activeProfile.birthDate.split('-').map(Number);
    const sunSign = calculateSunSign(m, d);
    const moonSign = calculateMoonSign(sunSign, y);
    const hour = activeProfile.birthTime ? parseInt(activeProfile.birthTime.split(':')[0]) : 12;
    const risingSign = calculateRisingSign(sunSign, hour);
    const chineseAnimal = calculateChineseZodiac(y);
    const chineseElement = calculateChineseElement(y);
    const numerology = calculateAllNumerology(activeProfile.birthDate, activeProfile.name);
    if (!numerology) return null;
    return generateInsights(activeProfile, numerology, sunSign, moonSign, risingSign, chineseAnimal, chineseElement);
  }, [activeProfile]);

  if (!activeProfile || !report) {
    return (
      <ScrollView style={[styles.scroll, { backgroundColor: theme.background }]}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.six }}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>Insights</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>AI-powered cosmic intelligence</Text>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>No Profile</Text>
            <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>Create a profile to generate personalized insights.</Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  const filteredInsights = selectedCategory === 'all'
    ? report.insights
    : report.insights.filter((i) => i.category === selectedCategory);

  const categories: (InsightCategory | 'all')[] = ['all', 'pattern', 'karmic', 'growth', 'predictive', 'relationship', 'elemental'];

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.six }}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Insights</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Cross-module cosmic intelligence for {activeProfile.name}</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={({ pressed }) => [
                  styles.filterChip,
                  { backgroundColor: isActive ? theme.accent : theme.card, borderColor: isActive ? theme.accent : theme.cardBorder, opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <Text style={[styles.filterText, { color: isActive ? '#fff' : theme.text }]}>
                  {cat === 'all' ? 'All' : `${CATEGORY_ICONS[cat]} ${capitalize(cat)}`}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {filteredInsights.map((insight) => {
          const isExpanded = expandedInsight === insight.id;
          const color = CATEGORY_COLORS[insight.category];
          return (
            <Pressable
              key={insight.id}
              onPress={() => setExpandedInsight(isExpanded ? null : insight.id)}
              style={[styles.insightCard, { backgroundColor: theme.card, borderColor: color + '40' }]}
            >
              <View style={styles.insightHeader}>
                <Text style={styles.insightIcon}>{CATEGORY_ICONS[insight.category]}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.insightTitle, { color: theme.text }]}>{insight.title}</Text>
                  <View style={styles.insightMeta}>
                    <View style={[styles.categoryTag, { backgroundColor: color + '20' }]}>
                      <Text style={[styles.categoryText, { color }]}>{capitalize(insight.category)}</Text>
                    </View>
                    <Text style={[styles.confidenceText, { color: theme.textSecondary }]}>
                      {Math.round(insight.confidence * 100)}% confidence
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={[styles.insightSummary, { color: theme.textSecondary }]}>{insight.summary}</Text>
              {isExpanded && (
                <View style={styles.expandedContent}>
                  <Text style={[styles.insightDetail, { color: theme.text }]}>{insight.detail}</Text>
                  {insight.actionable && insight.action && (
                    <View style={[styles.actionBox, { backgroundColor: color + '10', borderColor: color + '30' }]}>
                      <Text style={[styles.actionLabel, { color }]}>✦ Action Step</Text>
                      <Text style={[styles.actionText, { color: theme.text }]}>{insight.action}</Text>
                    </View>
                  )}
                  <View style={styles.moduleRow}>
                    <Text style={[styles.moduleLabel, { color: theme.textTertiary }]}>Related modules:</Text>
                    {insight.relatedModules.map((mod) => (
                      <View key={mod} style={[styles.moduleTag, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.moduleTagText, { color: theme.textSecondary }]}>{mod}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </Pressable>
          );
        })}

        {report.elementalAdvice.length > 0 && (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: '#14b8a6' + '40' }]}>
            <Text style={[styles.sectionTitle, { color: '#14b8a6' }]}>🌊 Elemental Balance Advice</Text>
            {report.elementalAdvice.map((advice, i) => (
              <View key={i} style={styles.adviceRow}>
                <Text style={[styles.adviceBullet, { color: '#14b8a6' }]}>•</Text>
                <Text style={[styles.adviceText, { color: theme.text }]}>{advice}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: theme.accent }]}>🔭 Predictive Outlook</Text>
          <Text style={[styles.outlookText, { color: theme.text }]}>{report.predictiveOutlook}</Text>
        </View>

        {report.relationshipPatterns.length > 0 && (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: '#ec4899' + '40' }]}>
            <Text style={[styles.sectionTitle, { color: '#ec4899' }]}>💕 Relationship Patterns</Text>
            {report.relationshipPatterns.map((pattern, i) => (
              <Text key={i} style={[styles.patternText, { color: theme.text }]}>{pattern}</Text>
            ))}
          </View>
        )}

        {report.growthRecommendations.length > 0 && (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: '#22c55e' + '40' }]}>
            <Text style={[styles.sectionTitle, { color: '#22c55e' }]}>🌱 Growth Recommendations</Text>
            {report.growthRecommendations.map((rec, i) => (
              <Text key={i} style={[styles.patternText, { color: theme.text }]}>{rec}</Text>
            ))}
          </View>
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
  filterRow: { gap: 8, paddingVertical: 4 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 13, fontWeight: '600' },
  insightCard: { borderRadius: 14, borderWidth: 1, padding: Spacing.three, gap: 8 },
  insightHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  insightIcon: { fontSize: 24 },
  insightTitle: { fontSize: 15, fontWeight: '700' },
  insightMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  categoryTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  categoryText: { fontSize: 11, fontWeight: '700' },
  confidenceText: { fontSize: 11, fontWeight: '500' },
  insightSummary: { fontSize: 13, lineHeight: 18 },
  expandedContent: { gap: 10, marginTop: 4 },
  insightDetail: { fontSize: 14, lineHeight: 20 },
  actionBox: { borderRadius: 10, borderWidth: 1, padding: Spacing.three, gap: 4 },
  actionLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  actionText: { fontSize: 13, lineHeight: 18 },
  moduleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 4 },
  moduleLabel: { fontSize: 11, fontWeight: '500' },
  moduleTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  moduleTagText: { fontSize: 10, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  adviceRow: { flexDirection: 'row', gap: 8, marginVertical: 2 },
  adviceBullet: { fontSize: 16, fontWeight: '700' },
  adviceText: { fontSize: 13, lineHeight: 18, flex: 1 },
  outlookText: { fontSize: 14, lineHeight: 20 },
  patternText: { fontSize: 13, lineHeight: 18, marginVertical: 4 },
});
