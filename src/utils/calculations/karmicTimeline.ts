import type { KarmicLesson, NumerologyResult, ZodiacSign, ChineseZodiacAnimal } from '@/types/cosmic';

interface KarmicDebtInfo {
  number: number;
  title: string;
  description: string;
  pastLifeTheme: string;
  currentLifeTask: string;
  resolution: string;
}

const KARMIC_DEBTS: Record<number, KarmicDebtInfo> = {
  13: {
    number: 13,
    title: 'Karmic Lesson of Transformation',
    description: 'The vibration of 13 carries the weight of past-life abuse of power and resistance to change. This karmic debt demands that you learn the art of transformation through disciplined effort rather than through destruction.',
    pastLifeTheme: 'In a previous life, you misused your power to control or dominate others, resisting natural cycles of change. You clung to positions of authority long past their time.',
    currentLifeTask: 'In this life, you must learn to embrace change with grace, work diligently toward goals without becoming rigid, and transform through conscious effort rather than crisis.',
    resolution: 'Accept change as natural. Channel your energy into constructive, disciplined work. Trust that endings lead to better beginnings. Serve something greater than yourself.',
  },
  14: {
    number: 14,
    title: 'Karmic Lesson of Freedom and Bondage',
    description: 'The vibration of 14 indicates past-life misuse of freedom and sensual excess. This karmic debt requires learning the balance between freedom and responsibility.',
    pastLifeTheme: 'You previously exploited your freedom at the expense of others — perhaps through addiction, sensual excess, or refusing to honor commitments and boundaries.',
    currentLifeTask: 'This life demands that you learn flexibility within structure, honor your commitments while maintaining personal freedom, and develop self-discipline without becoming rigid.',
    resolution: 'Practice moderation. Honor commitments without feeling trapped. Use your freedom to serve and uplift rather than exploit. Develop healthy relationships with pleasure and material comforts.',
  },
  16: {
    number: 16,
    title: 'Karmic Lesson of Rebirth',
    description: 'The vibration of 16 carries the heaviest karmic weight — the fall of the ego. This debt stems from past-life arrogance, spiritual pride, and the misuse of spiritual gifts.',
    pastLifeTheme: 'You occupied a position of spiritual or intellectual authority and became corrupted by ego and superiority. You may have used spiritual knowledge for personal gain or to manipulate.',
    currentLifeTask: 'This life requires a fundamental restructuring of the ego. You will face experiences that humble you, strip away false identities, and force spiritual awakening through apparent destruction of what you thought was important.',
    resolution: 'Embrace humility as strength. Let go of the need to control outcomes. When plans fall apart, trust that the universe is rebuilding on a more authentic foundation. Practice genuine service without seeking recognition.',
  },
  19: {
    number: 19,
    title: 'Karmic Lesson of Independence and Sensitivity',
    description: 'The vibration of 19 points to past-life abuse of independence and a refusal to consider the needs of others. This debt demands learning to balance self-reliance with genuine sensitivity.',
    pastLifeTheme: 'You were excessively self-focused, refusing help from others while simultaneously demanding that others serve your needs. There was a pattern of rejecting intimacy and emotional connection.',
    currentLifeTask: 'This life teaches you that true strength includes vulnerability, that accepting help is not weakness, and that your independence must be balanced with genuine care for others.',
    resolution: 'Open your heart to others. Accept help gracefully. Learn to give without losing yourself and receive without feeling indebted. Develop genuine emotional intimacy.',
  },
};

const LIFE_PATH_PURPOSE: Record<number, { title: string; description: string; karmicTask: string }> = {
  1: {
    title: 'The Soul of Leadership',
    description: 'You incarnated to develop independent thinking, pioneering spirit, and the courage to stand alone. Your soul chose to master the art of individual expression.',
    karmicTask: 'Learning to lead without dominating, to be independent without being selfish, and to pioneer new paths while honoring those who came before.',
  },
  2: {
    title: 'The Soul of Partnership',
    description: 'You came to master cooperation, sensitivity, and the art of building bridges between opposing forces. Your soul chose the path of the diplomat and peacemaker.',
    karmicTask: 'Developing patience without passivity, sensitivity without weakness, and the ability to hold space for others while maintaining your own center.',
  },
  3: {
    title: 'The Soul of Expression',
    description: 'Your soul chose this lifetime to master creative expression, communication, and the art of bringing joy to others through authentic self-expression.',
    karmicTask: 'Finding your unique voice and using it authentically, overcoming fear of judgment, and learning that creativity is a spiritual practice.',
  },
  4: {
    title: 'The Soul of Service',
    description: 'You incarnated to build something lasting through discipline, hard work, and practical service. Your soul chose the path of the master builder.',
    karmicTask: 'Learning to create stability without rigidity, to serve without losing yourself, and to find sacred meaning in ordinary daily work.',
  },
  5: {
    title: 'The Soul of Freedom',
    description: 'Your soul chose this lifetime to break free from all limitations — mental, physical, and spiritual. You are here to experience the full spectrum of human existence.',
    karmicTask: 'Finding freedom without chaos, variety without superficiality, and learning that true liberation comes from within rather than from external change.',
  },
  6: {
    title: 'The Soul of Love',
    description: 'You incarnated to master the lessons of love, responsibility, and healing. Your soul chose the path of the nurturer and harmonizer.',
    karmicTask: 'Learning to love without enabling, to serve without sacrificing yourself, and to create beauty and harmony in your home and community.',
  },
  7: {
    title: 'The Soul of Wisdom',
    description: 'Your soul chose this lifetime for deep inner work — study, spiritual development, and the pursuit of hidden truth. You are the seeker and the mystic.',
    karmicTask: 'Finding wisdom without isolation, spiritual depth without escapism, and learning to trust your inner knowing while staying grounded in reality.',
  },
  8: {
    title: 'The Soul of Power',
    description: 'You incarnated to master the material world — financial abundance, executive ability, and the responsible use of power and authority.',
    karmicTask: 'Learning to wield power with integrity, to achieve material success without losing your soul, and to use abundance for the greater good.',
  },
  9: {
    title: 'The Soul of Compassion',
    description: 'Your soul chose this lifetime to complete a great cycle of learning and to serve humanity through compassion, wisdom, and selfless giving.',
    karmicTask: 'Learning to let go with grace, to give without depletion, and to find completion through service to something greater than yourself.',
  },
  11: {
    title: 'The Master Soul of Illumination',
    description: 'As a Master Number 11, your soul chose the most challenging and rewarding path — to be a channel for spiritual light and higher consciousness.',
    karmicTask: 'Managing extraordinary sensitivity and psychic awareness without being overwhelmed. Learning to trust your intuitive gifts and share them with the world.',
  },
  22: {
    title: 'The Master Soul of Manifestation',
    description: 'As a Master Number 22, your soul has the rarest mission — to build something of lasting significance that serves humanity on a massive scale.',
    karmicTask: 'Managing the pressure of a great vision while maintaining humility and practical focus. Learning to manifest your dreams into tangible reality.',
  },
  33: {
    title: 'The Master Soul of Healing',
    description: 'As a Master Number 33, your soul carries the highest vibration of service — spiritual teaching, healing, and the unconditional love of the Christ/Buddha consciousness.',
    karmicTask: 'Balancing immense spiritual gifts with human limitations. Learning to serve without martyrdom and to teach through example rather than words.',
  },
};

const CHINESE_ZODIAC_KARMA: Record<ChineseZodiacAnimal, { lesson: string; growth: string }> = {
  rat: { lesson: 'Learning to share resources and trust that abundance is not zero-sum.', growth: 'Generosity transforms cunning into wisdom.' },
  ox: { lesson: 'Learning to bend without breaking and accept that not everything requires force.', growth: 'Flexibility transforms stubbornness into resilience.' },
  tiger: { lesson: 'Learning to channel fierce independence into inspiring leadership rather than reckless action.', growth: 'Patience transforms impulsivity into courage.' },
  rabbit: { lesson: 'Learning to confront conflict rather than retreat, finding strength in vulnerability.', growth: 'Courage transforms avoidance into diplomacy.' },
  dragon: { lesson: 'Learning that true power comes from service, not from dominance or recognition.', growth: 'Humility transforms arrogance into true leadership.' },
  snake: { lesson: 'Learning to trust others and share your inner world rather than hoarding knowledge.', growth: 'Openness transforms suspicion into wisdom.' },
  horse: { lesson: 'Learning that commitment is not captivity and that roots can nourish rather than restrict.', growth: 'Devotion transforms restlessness into purpose.' },
  goat: { lesson: 'Learning to develop inner security rather than depending on external beauty or approval.', growth: 'Self-reliance transforms dependency into creative power.' },
  monkey: { lesson: 'Learning that cleverness without conscience creates chaos, and that wit must serve truth.', growth: 'Integrity transforms trickster energy into innovation.' },
  rooster: { lesson: 'Learning that perfectionism is an illusion and that acceptance is the highest form of honesty.', growth: 'Compassion transforms criticism into constructive guidance.' },
  dog: { lesson: 'Learning that loyalty to self is as important as loyalty to others, and that anxiety can become wisdom.', growth: 'Trust transforms worry into protective intuition.' },
  pig: { lesson: 'Learning that generosity does not require naivety, and that innocence can coexist with discernment.', growth: 'Discernment transforms naivety into abundant wisdom.' },
};

export function generateKarmicTimeline(
  numerologyResult: NumerologyResult,
  sunSign: ZodiacSign,
  chineseAnimal: ChineseZodiacAnimal,
): KarmicLesson[] {
  const lessons: KarmicLesson[] = [];

  const { lifePath, soulUrge, destiny, karmicDebt } = numerologyResult;
  const coreNumbers = [lifePath, soulUrge, destiny];

  if (karmicDebt && KARMIC_DEBTS[karmicDebt]) {
    lessons.push(KARMIC_DEBTS[karmicDebt]);
  }

  for (const num of coreNumbers) {
    if (KARMIC_DEBTS[num] && !lessons.find((l) => l.number === num)) {
      lessons.push(KARMIC_DEBTS[num]);
    }
  }

  const purpose = LIFE_PATH_PURPOSE[lifePath] ?? LIFE_PATH_PURPOSE[lifePath > 9 ? lifePath - 9 : lifePath];
  if (purpose) {
    lessons.push({
      number: lifePath,
      title: purpose.title,
      description: purpose.description,
      pastLifeTheme: `Your soul chose Life Path ${lifePath} to continue the journey of mastering ${purpose.description.split('master')[1] ?? 'your unique path'}.`,
      currentLifeTask: purpose.karmicTask,
      resolution: `Through embracing your Life Path ${lifePath} mission, you complete this chapter of your soul's evolution and advance toward your highest potential.`,
    });
  }

  const chineseKarma = CHINESE_ZODIAC_KARMA[chineseAnimal];
  if (chineseKarma) {
    lessons.push({
      number: 0,
      title: `${capitalize(chineseAnimal)} Spirit Lesson`,
      description: `Your Chinese zodiac ${chineseAnimal} carries its own karmic lesson that weaves through your Western astrology.`,
      pastLifeTheme: `The ${chineseAnimal} spirit has traveled many lifetimes developing its particular wisdom.`,
      currentLifeTask: chineseKarma.lesson,
      resolution: chineseKarma.growth,
    });
  }

  return lessons;
}

function capitalize(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }
