import type { ZodiacSign } from '@/types/cosmic';

export interface HouseData {
  number: number;
  title: string;
  keywords: string[];
  interpretation: string;
  themes: string[];
}

export const HOUSES: HouseData[] = [
  {
    number: 1,
    title: 'House of Self',
    keywords: ['identity', 'physical body', 'first impressions', 'appearance', 'vitality'],
    interpretation: 'The first house represents your core identity, physical appearance, and how you present yourself to the world. It governs your instincts, temperament, and the way you initiate action. This is the house of new beginnings and self-expression.',
    themes: ['personality', 'appearance', 'health', 'outlook'],
  },
  {
    number: 2,
    title: 'House of Values',
    keywords: ['money', 'possessions', 'self-worth', 'values', 'resources'],
    interpretation: 'The second house governs your material world — finances, possessions, and tangible assets. More importantly, it reflects your self-worth and what you value most deeply. It shows how you earn, spend, and relate to material security.',
    themes: ['wealth', 'self-esteem', 'material comfort', 'sustainability'],
  },
  {
    number: 3,
    title: 'House of Communication',
    keywords: ['communication', 'siblings', 'short trips', 'learning', 'mind'],
    interpretation: 'The third house governs how you think, communicate, and process information. It relates to siblings, neighbors, short journeys, and your immediate environment. This house shapes your curiosity, learning style, and daily interactions.',
    themes: ['expression', 'connections', 'intellect', 'daily life'],
  },
  {
    number: 4,
    title: 'House of Home',
    keywords: ['home', 'family', 'roots', 'mother', 'foundations', 'property'],
    interpretation: 'The fourth house represents your deepest emotional foundations — your home, family of origin, and inner world. It governs your sense of belonging, ancestral heritage, and the private self you retreat to. This is the root of your emotional security.',
    themes: ['belonging', 'heritage', 'emotional safety', 'inner peace'],
  },
  {
    number: 5,
    title: 'House of Creativity',
    keywords: ['creativity', 'children', 'romance', 'pleasure', 'self-expression'],
    interpretation: 'The fifth house is the realm of joy, creative self-expression, romance, and children. It governs what makes you feel alive and playful — hobbies, artistic pursuits, romantic affairs, and the legacy you create through offspring or creative works.',
    themes: ['joy', 'art', 'romance', 'legacy'],
  },
  {
    number: 6,
    title: 'House of Service',
    keywords: ['health', 'work', 'service', 'daily routines', 'pets', 'wellness'],
    interpretation: 'The sixth house governs your daily work, health habits, and service to others. It reflects how you organize your life, maintain your body, and contribute through practical effort. This house reveals your work ethic and approach to self-improvement.',
    themes: ['wellness', 'productivity', 'discipline', 'care'],
  },
  {
    number: 7,
    title: 'House of Partnership',
    keywords: ['marriage', 'partnerships', 'open enemies', 'contracts', 'balance'],
    interpretation: 'The seventh house governs all one-to-one relationships — marriage, business partnerships, and even open rivals. It reveals what you seek in others and how you balance your needs with those of a partner. This house teaches through relationship mirrors.',
    themes: ['union', 'cooperation', 'balance', 'commitment'],
  },
  {
    number: 8,
    title: 'House of Transformation',
    keywords: ['transformation', 'death', 'shared resources', 'intimacy', 'mystery'],
    interpretation: 'The eighth house is the realm of deep transformation, psychological depth, and shared resources. It governs inheritance, taxes, debt, sexuality, and the cycles of death and rebirth. This house confronts you with life\'s deepest mysteries.',
    themes: ['rebirth', 'depth', 'intimacy', 'power'],
  },
  {
    number: 9,
    title: 'House of Philosophy',
    keywords: ['higher education', 'philosophy', 'travel', 'spirituality', 'wisdom'],
    interpretation: 'The ninth house governs your quest for meaning through higher education, long-distance travel, philosophy, and spiritual exploration. It represents your worldview, beliefs, and the adventures that expand your consciousness.',
    themes: ['wisdom', 'exploration', 'beliefs', 'growth'],
  },
  {
    number: 10,
    title: 'House of Career',
    keywords: ['career', 'public image', 'status', 'authority', 'father', 'legacy'],
    interpretation: 'The tenth house represents your public persona, career ambitions, and lasting reputation. It governs your relationship with authority, your father figure, and the mark you leave on the world. This is your highest visible point in the chart.',
    themes: ['ambition', 'reputation', 'leadership', 'purpose'],
  },
  {
    number: 11,
    title: 'House of Community',
    keywords: ['friends', 'groups', 'hopes', 'wishes', 'community', 'belonging'],
    interpretation: 'The eleventh house governs your friendships, social groups, and aspirations for the future. It reflects your hopes, dreams, and the communities you belong to. This house reveals how you contribute to the collective and find your tribe.',
    themes: ['friendship', 'vision', 'belonging', 'contribution'],
  },
  {
    number: 12,
    title: 'House of the Subconscious',
    keywords: ['subconscious', 'secrets', 'isolation', 'karma', 'spirituality', 'healing'],
    interpretation: 'The twelfth house is the realm of the unconscious mind, hidden truths, and spiritual transcendence. It governs secrets, solitude, karma, and self-undoing. This house invites surrender, healing, and connection to the divine.',
    themes: ['mystery', 'release', 'transcendence', 'inner healing'],
  },
];

export function getHouseInterpretation(house: number): HouseData | undefined {
  return HOUSES.find((h) => h.number === house);
}

export function getHouseThemes(house: number): string[] {
  return HOUSES.find((h) => h.number === house)?.themes ?? [];
}

const SIGN_TOHOUSE: Record<ZodiacSign, number> = {
  aries: 1, taurus: 2, gemini: 3, cancer: 4,
  leo: 5, virgo: 6, libra: 7, scorpio: 8,
  sagittarius: 9, capricorn: 10, aquarius: 11, pisces: 12,
};

export function getHouseForSign(ascendantSign: ZodiacSign, targetSign: ZodiacSign): number {
  const ascNum = SIGN_TOHOUSE[ascendantSign];
  const targetNum = SIGN_TOHOUSE[targetSign];
  return ((targetNum - ascNum + 12) % 12) + 1;
}
