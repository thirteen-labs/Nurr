import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { TAROT_CARDS } from '@/constants/cosmic/tarot';
import { useProfileStore } from '@/stores/profile-store';
import * as DB from '@/services/database';
import type { TarotCard, TarotSpread } from '@/types/cosmic';

const SPREADS: { key: TarotSpread; label: string; positions: string[] }[] = [
  { key: 'single', label: 'Single Card', positions: ['Guidance'] },
  { key: 'three', label: 'Three Card', positions: ['Past', 'Present', 'Future'] },
  { key: 'five', label: 'Five Card', positions: ['Self', 'Challenge', 'Past', 'Future', 'Outcome'] },
  { key: 'seven', label: 'Seven Card', positions: ['Situation', 'Obstacle', 'Past', 'Future', 'Above', 'Below', 'Advice'] },
  { key: 'celtic-cross', label: 'Celtic Cross', positions: ['Present', 'Challenge', 'Past', 'Future', 'Above', 'Below', 'Self', 'Environment', 'Hopes', 'Outcome'] },
  { key: 'relationship', label: 'Relationship', positions: ['You', 'Partner', 'Connection', 'Strengths', 'Challenges', 'Outcome'] },
  { key: 'career', label: 'Career', positions: ['Current State', 'Goal', 'Strengths', 'Obstacles', 'Advice', 'Outcome'] },
  { key: 'year-ahead', label: 'Year Ahead', positions: ['Q1', 'Q2', 'Q3', 'Q4', 'Theme', 'Lesson', 'Growth', 'Outcome'] },
];

const CARD_BACK = '✦';

export default function TarotScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const activeProfile = useProfileStore((s) => s.activeProfile);
  const [spread, setSpread] = useState<TarotSpread>('single');
  const [reading, setReading] = useState<{ cards: TarotCard[]; spread: TarotSpread; positions: string[] } | null>(null);
  const [flipped, setFlipped] = useState<boolean[]>([]);
  const [savedId, setSavedId] = useState<string | null>(null);

  const spreadConfig = useMemo(() => SPREADS.find((s) => s.key === spread) ?? SPREADS[0], [spread]);

  const drawCards = () => {
    const count = spreadConfig.positions.length;
    const shuffled = [...TAROT_CARDS].sort(() => Math.random() - 0.5);
    const cards = shuffled.slice(0, count);
    setReading({ cards, spread, positions: spreadConfig.positions });
    setFlipped(new Array(count).fill(false));
    setSavedId(null);
  };

  const flipCard = (index: number) => {
    setFlipped((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
  };

  const flipAll = () => {
    if (!reading) return;
    setFlipped(new Array(reading.cards.length).fill(true));
  };

  const saveReading = async () => {
    if (!reading || !activeProfile) return;
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    await DB.addTarotReading({
      id,
      profileId: activeProfile.id,
      spread: reading.spread,
      cards: JSON.stringify(reading.cards),
      positions: JSON.stringify(reading.positions),
      date: new Date().toISOString(),
      notes: null,
    });
    setSavedId(id);
  };

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.six }}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Tarot</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Draw cards and explore their meanings</Text>

        <View style={styles.spreadRow}>
          {SPREADS.map((s) => (
            <Pressable key={s.key} onPress={() => { setSpread(s.key); setReading(null); }}
              style={[styles.spreadBtn, { backgroundColor: spread === s.key ? theme.accent : theme.surface, borderColor: spread === s.key ? theme.accent : theme.border }]}>
              <Text style={[styles.spreadText, { color: spread === s.key ? '#fff' : theme.text, fontWeight: spread === s.key ? '700' : '500' }]}>{s.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.actionRow}>
          <Pressable onPress={drawCards} style={({ pressed }) => [styles.drawBtn, { backgroundColor: theme.accent, opacity: pressed ? 0.8 : 1 }]}>
            <Text style={styles.drawText}>Draw Cards</Text>
          </Pressable>
          {reading && !flipped.every(Boolean) && (
            <Pressable onPress={flipAll} style={({ pressed }) => [styles.flipAllBtn, { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.8 : 1 }]}>
              <Text style={[styles.flipAllText, { color: theme.text }]}>Flip All</Text>
            </Pressable>
          )}
        </View>

        {reading && (
          <View style={styles.cardsSection}>
            {reading.cards.map((card, i) => {
              const isCardFlipped = flipped[i] ?? false;
              return (
                <Pressable key={card.id + '-' + i} onPress={() => flipCard(i)}>
                  <View style={[styles.card, { backgroundColor: theme.card, borderColor: isCardFlipped ? theme.accent + '40' : theme.cardBorder }]}>
                    {isCardFlipped ? (
                      <>
                        <Text style={[styles.cardPosition, { color: theme.textSecondary }]}>{reading.positions[i]}</Text>
                        <Text style={[styles.cardName, { color: theme.accent }]}>{card.name}</Text>
                        <Text style={[styles.cardSub, { color: theme.textTertiary }]}>
                          {card.arcana === 'major' ? 'Major Arcana' : `${capitalize(card.suit ?? '')} · ${numberLabel(card.number)}`}
                        </Text>
                        <View style={[styles.divider, { backgroundColor: theme.border }]} />
                        <Text style={[styles.cardMeaning, { color: theme.text }]}>{card.meaning}</Text>
                        {card.keywords.length > 0 && (
                          <Text style={[styles.keywords, { color: theme.textSecondary }]}>Keywords: {card.keywords.join(' · ')}</Text>
                        )}
                        <Text style={[styles.advice, { color: theme.accentGreen, fontStyle: 'italic' }]}>{card.advice}</Text>
                      </>
                    ) : (
                      <View style={styles.cardBack}>
                        <Text style={[styles.cardBackIcon, { color: theme.accent }]}>{CARD_BACK}</Text>
                        <Text style={[styles.tapToReveal, { color: theme.textSecondary }]}>Tap to reveal</Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}

            {activeProfile && (
              <Pressable onPress={saveReading} style={({ pressed }) => [styles.saveBtn, { backgroundColor: theme.accentGreen, opacity: pressed ? 0.8 : 1 }]}>
                <Text style={styles.saveText}>{savedId ? '✓ Reading Saved' : 'Save Reading'}</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function capitalize(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }

function numberLabel(n?: number): string {
  if (!n) return '';
  const labels = ['', 'Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King'];
  return labels[n] ?? String(n);
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.three },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 15, marginBottom: 8 },
  spreadRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  spreadBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1 },
  spreadText: { fontSize: 12 },
  actionRow: { flexDirection: 'row', gap: 8 },
  drawBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  drawText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  flipAllBtn: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  flipAllText: { fontSize: 14, fontWeight: '600' },
  cardsSection: { gap: 10 },
  card: { borderRadius: 14, borderWidth: 1, padding: Spacing.four, gap: 8 },
  cardBack: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20, gap: 8 },
  cardBackIcon: { fontSize: 40 },
  tapToReveal: { fontSize: 13 },
  cardPosition: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardName: { fontSize: 22, fontWeight: '800' },
  cardSub: { fontSize: 13 },
  divider: { height: 1, marginVertical: 4 },
  cardMeaning: { fontSize: 15, lineHeight: 22 },
  keywords: { fontSize: 12, fontStyle: 'italic', lineHeight: 18 },
  advice: { fontSize: 14, lineHeight: 20, marginTop: 4 },
  saveBtn: { paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  saveText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
