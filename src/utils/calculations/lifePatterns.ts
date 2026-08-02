import type { LifePattern, NumerologyResult } from '@/types/cosmic';

const CYCLE_YEAR_THEMES: Record<number, { title: string; theme: string; guidance: string }> = {
  1: {
    title: 'The Seed of New Beginnings',
    theme: 'independence',
    guidance: 'Plant seeds boldly. This is your year to initiate projects, take leadership, and forge your own path. Trust your instincts.',
  },
  2: {
    title: 'The Dance of Cooperation',
    theme: 'patience',
    guidance: 'Collaborate and connect. This year rewards diplomacy, patience, and partnership. Listen more than you speak.',
  },
  3: {
    title: 'The Flower of Expression',
    theme: 'creativity',
    guidance: 'Express yourself fully. Creative pursuits, social connections, and joyful communication bring growth and recognition.',
  },
  4: {
    title: 'The Foundation Builder',
    theme: 'structure',
    guidance: 'Lay solid foundations. Hard work, organization, and practical effort now create structures that support future growth.',
  },
  5: {
    title: 'The Wind of Change',
    theme: 'freedom',
    guidance: 'Embrace transformation. Break free from limitations, explore new territories, and welcome unexpected opportunities.',
  },
  6: {
    title: 'The Hearth of Responsibility',
    theme: 'harmony',
    guidance: 'Nurture what matters. Family, service, and healing relationships take priority. Create beauty in your daily life.',
  },
  7: {
    title: 'The Mirror of Inner Wisdom',
    theme: 'introspection',
    guidance: 'Turn inward. This is a year for study, spiritual growth, and deep self-reflection. Solitude brings clarity.',
  },
  8: {
    title: 'The Scale of Power',
    theme: 'achievement',
    guidance: 'Step into your power. Material success, recognition, and karmic rewards flow to those who act with integrity.',
  },
  9: {
    title: 'The Compass of Completion',
    theme: 'wisdom',
    guidance: 'Complete the cycle. Release what no longer serves, share your wisdom, and prepare for a fresh chapter ahead.',
  },
};

const CHALLENGE_GUIDANCE: Record<number, string> = {
  0: 'Your primary challenge is self-doubt. Learn to trust your own judgment and take initiative without waiting for permission.',
  1: 'Tension between independence and cooperation defines your challenge. Balance personal ambition with the needs of others.',
  2: 'Patience and sensitivity are tested. You may struggle with indecision or conflict avoidance. Assertiveness tempered with diplomacy is the key.',
  3: 'Expression and creativity face obstacles. Fear of judgment or scattered energy may block your voice. Commit to creative practice.',
  4: 'Stability versus freedom creates friction. Building foundations feels restrictive, but structure is the gateway to true liberation.',
  5: 'Responsibility and change collide. You may feel trapped by obligations while craving adventure. Find freedom within commitment.',
  6: 'Introspection clashes with engagement. Too much solitude leads to isolation; too much socializing leads to burnout. Seek mindful balance.',
  7: 'Power and material concerns challenge your growth. Learning to receive, manage resources wisely, and share abundance is essential.',
  8: 'Letting go and completing cycles is your deepest challenge. Fear of endings keeps you stuck. Trust that release creates renewal.',
  9: 'New beginnings are difficult after loss. Learning to start fresh, embrace vulnerability, and trust the unknown shapes your path.',
  11: 'Master number challenge: Managing heightened sensitivity and spiritual pressure without becoming overwhelmed or self-destructive.',
  22: 'Master number challenge: Building great things while managing fear of failure. Your vision is massive — break it into manageable steps.',
  33: 'Master number challenge: Balancing service to others with self-care. Teaching and healing without losing yourself requires firm boundaries.',
};

const PINNACLE_GUIDANCE: Record<number, string> = {
  1: 'Leadership and independence define your peak opportunity. Take charge, pioneer new ventures, and trust your pioneering spirit.',
  2: 'Partnership and diplomacy bring your greatest rewards. Collaborate, negotiate, and build bridges between opposing forces.',
  3: 'Creative expression and social connection are your pathway to success. Share your gifts, communicate, and inspire others.',
  4: 'Hard work and practical achievement define this pinnacle. Build something lasting through discipline, routine, and dedicated effort.',
  5: 'Adventure and change bring your greatest expansion. Travel, teach, and embrace the diversity of human experience.',
  6: 'Love and service are your highest calling. Family, healing, and community involvement bring deep fulfillment.',
  7: 'Spiritual development and inner wisdom are your peak potential. Research, study, and share profound insights with the world.',
  8: 'Material mastery and recognition await. Step into authority, manage large-scale projects, and create financial abundance.',
  9: 'Humanitarian service and completion of a great cycle. Your wisdom gained through experience becomes a beacon for others.',
};

export function analyzeLifePatterns(
  birthDate: string,
  numerologyResult: NumerologyResult,
): LifePattern[] {
  const patterns: LifePattern[] = [];
  const birthYear = new Date(birthDate).getFullYear();
  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - birthYear;

  const { lifePath, challengeNumbers, pinnacleCycles, hiddenPassion, balanceNumber } = numerologyResult;
  const startCycleYear = lifePath <= 9 ? lifePath : lifePath - 9;

  for (let cycle = 0; cycle < 9; cycle++) {
    const cycleStart = startCycleYear + cycle * 9;
    const ageStart = cycleStart;
    const ageEnd = ageStart + 8;

    if (ageEnd < 0) continue;

    const cycleYear = ((cycleStart % 9) + 9) % 9 || 9;
    const theme = CYCLE_YEAR_THEMES[cycleYear];

    patterns.push({
      type: 'life-cycle',
      title: `Ages ${Math.max(0, ageStart)}–${ageEnd}: ${theme.title}`,
      description: `Cycle year ${cycleYear}: ${theme.theme}. ${theme.guidance}`,
      ageRange: `${Math.max(0, ageStart)}–${ageEnd}`,
      recurring: true,
      guidance: theme.guidance,
    });
  }

  if (challengeNumbers.length > 0) {
    const primaryChallenge = challengeNumbers[0];
    patterns.push({
      type: 'challenge',
      title: `Primary Challenge: Number ${primaryChallenge}`,
      description: CHALLENGE_GUIDANCE[primaryChallenge] ?? `Challenge number ${primaryChallenge} shapes your core developmental pressure.`,
      ageRange: `0–${currentAge}`,
      recurring: true,
      guidance: CHALLENGE_GUIDANCE[primaryChallenge] ?? 'Focus on the lessons this challenge presents at each life stage.',
    });

    if (challengeNumbers.length > 1) {
      const secondChallenge = challengeNumbers[1];
      const midAge = Math.floor(currentAge * 0.5);
      patterns.push({
        type: 'challenge',
        title: `Secondary Challenge: Number ${secondChallenge}`,
        description: `Emerging around age ${midAge}, this challenge adds ${CHALLENGE_GUIDANCE[secondChallenge] ? 'new layers to your growth.' : 'additional developmental pressure.'}`,
        ageRange: `${Math.max(0, midAge)}–${midAge + 20}`,
        recurring: false,
        guidance: CHALLENGE_GUIDANCE[secondChallenge] ?? 'Prepare for this emerging challenge through self-awareness.',
      });
    }
  }

  if (pinnacleCycles.length > 0) {
    const pinnacleAges = [0, Math.floor(lifePath), Math.floor(lifePath) + 9, Math.floor(lifePath) + 27];
    pinnacleCycles.forEach((pNum, i) => {
      const startAge = pinnacleAges[i] ?? i * 9;
      const endAge = i < 3 ? (pinnacleAges[i + 1] ?? startAge + 9) : startAge + 9;
      patterns.push({
        type: 'pinnacle',
        title: `Pinnacle ${i + 1}: Number ${pNum} (Ages ${startAge}–${endAge})`,
        description: PINNACLE_GUIDANCE[pNum] ?? `Pinnacle ${pNum} brings peak opportunities during this period.`,
        ageRange: `${startAge}–${endAge}`,
        recurring: false,
        guidance: PINNACLE_GUIDANCE[pNum] ?? 'Maximize this period by aligning with the energy of this pinnacle number.',
      });
    });
  }

  const numbers = [numerologyResult.lifePath, numerologyResult.destiny, numerologyResult.soulUrge, numerologyResult.personality, numerologyResult.birthday];
  const freq: Record<number, number> = {};
  for (const n of numbers) { freq[n] = (freq[n] || 0) + 1; }
  const dominantNumber = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0];

  if (dominantNumber) {
    patterns.push({
      type: 'recurring',
      title: `Recurring Theme: Number ${dominantNumber}`,
      description: `The number ${dominantNumber} appears repeatedly in your core numerology, creating a strong resonance that influences your identity, purpose, and life path.`,
      ageRange: 'Lifelong',
      recurring: true,
      guidance: `Embrace the energy of ${dominantNumber} — it is your soul's primary teaching tool across all areas of life.`,
    });
  }

  if (hiddenPassion !== balanceNumber && hiddenPassion > 0 && balanceNumber > 0) {
    patterns.push({
      type: 'recurring',
      title: `Inner Tension: Passion ${hiddenPassion} vs Balance ${balanceNumber}`,
      description: `Your hidden passion (inner desire) is number ${hiddenPassion}, but your balance number is ${balanceNumber}. This creates a dynamic tension between what drives you privately and how you present yourself.`,
      ageRange: 'Lifelong',
      recurring: true,
      guidance: 'Learning to align your inner desires with your outer expression is a key life lesson.',
    });
  }

  return patterns;
}
