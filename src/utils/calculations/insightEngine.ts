import type {
  CosmicInsightReport, CosmicInsight, InsightCategory,
  NumerologyResult, ZodiacSign, ChineseZodiacAnimal, ChineseElement,
  ZodiacElement,
} from '@/types/cosmic';
import { analyzeLifePatterns } from './lifePatterns';
import { generateKarmicTimeline } from './karmicTimeline';

const SIGN_ELEMENTS: Record<ZodiacSign, ZodiacElement> = {
  aries: 'fire', leo: 'fire', sagittarius: 'fire',
  taurus: 'earth', virgo: 'earth', capricorn: 'earth',
  gemini: 'air', libra: 'air', aquarius: 'air',
  cancer: 'water', scorpio: 'water', pisces: 'water',
};

const CHINESE_ELEMENT_MAP: Record<ChineseElement, ZodiacElement> = {
  wood: 'earth',
  fire: 'fire',
  earth: 'earth',
  metal: 'air',
  water: 'water',
};

const ELEMENT_BALANCE_ADVICE: Record<ZodiacElement, string[]> = {
  fire: [
    'Practice grounding meditation with red or orange crystals (carnelian, sunstone).',
    'Channel fiery energy into physical activities: running, martial arts, dance.',
    'Incorporate warm colors (red, orange, gold) into your environment and wardrobe.',
    'Light a candle during morning intention-setting to honor your fire element.',
    'Add stimulating foods: ginger, cinnamon, chili peppers, and sun-dried tomatoes.',
  ],
  earth: [
    'Spend time in nature — walk barefoot on grass, tend a garden, or sit under trees.',
    'Use earthy crystals: moss agate, jade, smoky quartz, and bloodstone.',
    'Wear green and brown tones to strengthen your earth connection.',
    'Practice grounding exercises: visualize roots extending from your feet into the earth.',
    'Incorporate nourishing, whole foods: root vegetables, grains, and herbal teas.',
  ],
  air: [
    'Engage your mind through reading, writing, puzzles, and philosophical discussions.',
    'Use air crystals: clear quartz, amethyst, celestite, and blue lace agate.',
    'Wear light, pastel colors: sky blue, lavender, white, and silver.',
    'Practice breathwork: pranayama, box breathing, or simply conscious deep breathing.',
    'Spend time outdoors in breezy places — mountaintops, open fields, or by the ocean.',
  ],
  water: [
    'Connect with water: swim, take baths, listen to rain, or sit by a river.',
    'Use water crystals: moonstone, aquamarine, pearl, and lapis lazuli.',
    'Wear deep blues, teals, and silvers to strengthen your water element.',
    'Practice emotional journaling: write down feelings daily without judgment.',
    'Incorporate hydrating foods: watermelon, cucumber, fish, and herbal infusions.',
  ],
};

let insightIdCounter = 0;
function nextInsightId(): string {
  insightIdCounter++;
  return `insight-${Date.now()}-${insightIdCounter}`;
}

function buildInsight(
  category: InsightCategory,
  title: string,
  summary: string,
  detail: string,
  confidence: number,
  modules: string[],
  actionable: boolean,
  action?: string,
): CosmicInsight {
  return {
    id: nextInsightId(),
    category,
    title,
    summary,
    detail,
    confidence,
    relatedModules: modules,
    actionable,
    action,
  };
}

export function generateInsights(
  profile: { birthDate: string; name: string },
  numerology: NumerologyResult,
  sunSign: ZodiacSign,
  moonSign: ZodiacSign,
  risingSign: ZodiacSign,
  chineseAnimal: ChineseZodiacAnimal,
  chineseElement: ChineseElement,
): CosmicInsightReport {
  const patterns = analyzeLifePatterns(profile.birthDate, numerology);
  const karmicLessons = generateKarmicTimeline(numerology, sunSign, chineseAnimal);

  const insights: CosmicInsight[] = [];

  const sunElement = SIGN_ELEMENTS[sunSign];
  const moonElement = SIGN_ELEMENTS[moonSign];
  const risingElement = SIGN_ELEMENTS[risingSign];
  const chineseWestElement = CHINESE_ELEMENT_MAP[chineseElement];

  const elementCounts: Record<ZodiacElement, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  elementCounts[sunElement]++;
  elementCounts[moonElement]++;
  elementCounts[risingElement]++;
  elementCounts[chineseWestElement]++;

  const dominantElement = (Object.entries(elementCounts) as [ZodiacElement, number][])
    .sort((a, b) => b[1] - a[1])[0][0];
  const weakElement = (Object.entries(elementCounts) as [ZodiacElement, number][])
    .sort((a, b) => a[1] - b[1])[0][0];

  const lifePathNumber = numerology.lifePath;
  const isEarthPath = [4, 8].includes(lifePathNumber);

  if (sunElement === 'fire' && isEarthPath) {
    insights.push(buildInsight(
      'pattern',
      'Fire Spirit, Earth Purpose',
      `Your ${sunSign} fire energy combined with Life Path ${lifePathNumber} creates a unique tension between passion and practicality.`,
      `You are a natural visionary (fire sun) who chose a lifetime of building tangible structures (Life Path ${lifePathNumber}). This combination means you must learn to channel your fiery enthusiasm into disciplined, practical work. When you succeed, you become unstoppable — a passionate builder who creates things that last.`,
      0.85,
      ['blueprint', 'numerology', 'astrology'],
      true,
      'Channel your fire into one practical project at a time. Let your passion fuel your discipline.',
    ));
  }

  if (moonElement !== sunElement) {
    const moonLabel = `${moonSign} (${moonElement})`;
    const sunLabel = `${sunSign} (${sunElement})`;
    insights.push(buildInsight(
      'pattern',
      'Inner vs Outer Element',
      `Your inner emotional world (${moonLabel}) differs from your outer identity (${sunLabel}).`,
      `Emotionally you crave ${moonElement} experiences, but the world sees your ${sunElement} nature. This creates a rich inner life but can cause confusion about what you truly need. Your emotional self may feel misunderstood by those who only see your sun sign expression.`,
      0.8,
      ['blueprint', 'astrology'],
      true,
      `Honor both elements: express your ${sunElement} energy publicly while creating private spaces for your ${moonElement} emotional needs.`,
    ));
  }

  if (risingElement !== sunElement) {
    insights.push(buildInsight(
      'pattern',
      'Persona vs Identity',
      `Your rising sign ${risingSign} (${risingElement}) masks your ${sunSign} (${sunElement}) core.`,
      `People initially perceive you through ${risingElement} qualities, but your true self is ${sunElement}. This gap between first impression and deep identity means people often discover surprising depth when they get to know you. It also means you may sometimes feel like an imposter — but you're actually more complex than any single impression.`,
      0.75,
      ['blueprint', 'astrology'],
      false,
    ));
  }

  const chineseWesternMatch = sunElement === chineseWestElement;
  if (chineseWesternMatch) {
    insights.push(buildInsight(
      'pattern',
      'Elemental Reinforcement',
      `Your Western ${sunSign} (${sunElement}) and Chinese ${chineseAnimal} (${chineseElement}) align on the ${sunElement} element.`,
      `This double-${sunElement} alignment amplifies ${sunElement} traits in your personality. Your ${sunElement} qualities are exceptionally strong, giving you clear focus but potentially creating excess. Consciously cultivate the opposing element for balance.`,
      0.9,
      ['blueprint', 'astrology', 'enemy-years'],
      true,
      `Strengthen your ${weakElement} element through daily practices to balance your amplified ${sunElement} energy.`,
    ));
  } else {
    insights.push(buildInsight(
      'pattern',
      'Dual Element Wisdom',
      `Your Western ${sunSign} (${sunElement}) and Chinese ${chineseAnimal} (${chineseElement}) bring different elemental influences.`,
      `Having ${sunElement} as your Western element and ${chineseElement} as your Chinese element gives you remarkable versatility. You can access both ${sunElement} and ${chineseElement} qualities depending on what the situation demands. This is a gift of adaptability that few possess.`,
      0.85,
      ['blueprint', 'astrology', 'enemy-years'],
      true,
      `Learn to consciously switch between your ${sunElement} and ${chineseElement} modes based on what each situation requires.`,
    ));
  }

  if (numerology.karmicDebt) {
    insights.push(buildInsight(
      'karmic',
      'Karmic Debt Active',
      `Your karmic debt number ${numerology.karmicDebt} indicates significant past-life lessons requiring attention this lifetime.`,
      `Karmic debt numbers create specific life challenges that cannot be avoided — only worked through. Your number ${numerology.karmicDebt} brings particular lessons about ${numerology.karmicDebt === 13 ? 'transformation and discipline' : numerology.karmicDebt === 14 ? 'freedom and responsibility' : numerology.karmicDebt === 16 ? 'ego and humility' : 'independence and sensitivity'}. These lessons will repeat until consciously addressed.`,
      0.95,
      ['numerology', 'blueprint'],
      true,
      'Review your karmic lesson in the Numerology section and commit to daily practices that address it.',
    ));
  }

  if (numerology.hiddenPassion !== numerology.balanceNumber && numerology.hiddenPassion > 0) {
    insights.push(buildInsight(
      'growth',
      'Hidden Passion vs Balance',
      `Your hidden passion number ${numerology.hiddenPassion} differs from your balance number ${numerology.balanceNumber}, indicating inner tension between desire and expression.`,
      `Hidden passion reveals your deepest subconscious desire — the energy that drives you most powerfully. Your balance number shows how you present yourself. The gap between these numbers suggests you may not always get what you most deeply want because your outward approach doesn't match your inner drive.`,
      0.7,
      ['numerology'],
      true,
      `Consciously bring the energy of number ${numerology.hiddenPassion} into your outward expression and decision-making.`,
    ));
  }

  const growthRecommendations: string[] = [];

  if (elementCounts[weakElement] === 0) {
    growthRecommendations.push(`Your chart has no ${weakElement} element representation. Actively seek ${weakElement} experiences to create balance.`);
  }

  if (numerology.challengeNumbers.includes(0)) {
    growthRecommendations.push('Your zero challenge indicates that self-reliance is both your greatest strength and your most subtle challenge. Learn to accept help without feeling diminished.');
  }

  if (numerology.maturity > 8) {
    growthRecommendations.push(`With a maturity number of ${numerology.maturity}, your later years will bring significant growth in ${numerology.maturity >= 9 ? 'humanitarian service and wisdom' : 'material mastery and power'}.`);
  }

  if (numerology.personalYear === 1) {
    growthRecommendations.push(`Personal Year ${numerology.personalYear}: This is YOUR year for fresh starts. Every initiative you launch now has amplified potential for the next 9 years.`);
  } else if (numerology.personalYear === 9) {
    growthRecommendations.push(`Personal Year ${numerology.personalYear}: Completion energy dominates. Release, forgive, and prepare for a major new cycle beginning next year.`);
  } else if (numerology.personalYear >= 4 && numerology.personalYear <= 6) {
    growthRecommendations.push(`Personal Year ${numerology.personalYear}: Focus on ${numerology.personalYear === 4 ? 'building foundations through hard work' : numerology.personalYear === 5 ? 'embracing change and new experiences' : 'nurturing relationships and responsibilities'}.`);
  }

  const elementalAdvice: string[] = [];
  const weakAdvice = ELEMENT_BALANCE_ADVICE[weakElement];
  if (weakAdvice) {
    elementalAdvice.push(...weakAdvice.slice(0, 3));
  }
  const dominantAdvice = ELEMENT_BALANCE_ADVICE[dominantElement];
  if (dominantAdvice) {
    elementalAdvice.push(`To balance your dominant ${dominantElement}: ${dominantAdvice[0]}`);
  }

  const yearTheme = getYearTheme(numerology.personalYear);
  const monthTheme = getMonthTheme(numerology.personalMonth);
  const predictiveOutlook = `Personal Year ${numerology.personalYear}: ${yearTheme}. Personal Month ${numerology.personalMonth}: ${monthTheme}`;

  const relationshipPatterns: string[] = [];
  if (numerology.soulUrge === 6 || numerology.soulUrge === 2 || moonElement === 'water') {
    relationshipPatterns.push('Your soul craves deep emotional connection. Surface-level relationships leave you feeling empty. Seek partners who offer vulnerability and authenticity.');
  }
  if (numerology.soulUrge === 1 || numerology.soulUrge === 5 || sunElement === 'fire') {
    relationshipPatterns.push('Independence is essential in your partnerships. You need a lover who celebrates your freedom rather than constraining it.');
  }
  if (numerology.soulUrge === 7 || risingSign === 'scorpio' || risingSign === 'capricorn') {
    relationshipPatterns.push('Trust is your primary relationship challenge. You test partners deeply before allowing true intimacy. Learning to lower your walls is your relationship growth edge.');
  }
  if (relationshipPatterns.length === 0) {
    relationshipPatterns.push('Your relationship style is uniquely your own. Focus on clear communication and emotional honesty to attract partners who truly match your frequency.');
  }

  return {
    profileId: '',
    generatedAt: new Date().toISOString(),
    patterns,
    karmicLessons,
    insights,
    elementalAdvice,
    predictiveOutlook,
    relationshipPatterns,
    growthRecommendations,
  };
}

function getYearTheme(personalYear: number): string {
  const themes: Record<number, string> = {
    1: 'New beginnings, independence, and bold action. Plant seeds for the next 9-year cycle.',
    2: 'Patience, partnership, and cooperation. Build alliances and nurture emerging projects.',
    3: 'Creativity, expression, and social expansion. Your voice carries influence now.',
    4: 'Foundation building, hard work, and practical progress. Disciplined effort pays off.',
    5: 'Change, freedom, and adventure. Unexpected opportunities reshape your path.',
    6: 'Responsibility, family, and harmony. Home and relationships take center stage.',
    7: 'Introspection, study, and spiritual growth. Turn inward for your greatest insights.',
    8: 'Power, achievement, and material success. Harvest the rewards of past efforts.',
    9: 'Completion, wisdom, and release. Let go to make space for a powerful new chapter.',
  };
  return themes[personalYear] ?? themes[((personalYear - 1) % 9) + 1];
}

function getMonthTheme(personalMonth: number): string {
  const themes: Record<number, string> = {
    1: 'Fresh monthly energy — initiate projects with confidence.',
    2: 'Cooperative month — collaboration yields better results than solo effort.',
    3: 'Expressive month — creativity and communication flourish.',
    4: 'Productive month — focus on details and practical tasks.',
    5: 'Dynamic month — expect changes and adapt quickly.',
    6: 'Nurturing month — attend to home, family, and relationships.',
    7: 'Reflective month — study, meditate, and process recent events.',
    8: 'Accomplishment month — complete projects and gather rewards.',
    9: 'Closing month — finish what needs ending and prepare for renewal.',
  };
  return themes[personalMonth] ?? themes[((personalMonth - 1) % 9) + 1];
}
