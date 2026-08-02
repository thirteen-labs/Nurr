import type {
  ZodiacSign,
  ChineseZodiacAnimal,
  CompatibilityScore,
  CompatibilityResult,
  CosmicBondType,
  ZodiacElement,
  ZodiacQuality,
} from "@/types/cosmic";
import { CHINESE_ZODIAC } from "@/constants/cosmic/chineseZodiac";
import { getZodiacElement, getZodiacQuality } from "./sunSign";

// ============================================================
// ELEMENT COMPATIBILITY MATRIX
// ============================================================

const ELEMENT_COMPATIBILITY: Record<ZodiacElement, Partial<Record<ZodiacElement, number>>> = {
  fire: { fire: 70, earth: 40, air: 90, water: 50 },
  earth: { fire: 40, earth: 80, air: 50, water: 85 },
  air: { fire: 90, earth: 50, air: 70, water: 45 },
  water: { fire: 50, earth: 85, air: 45, water: 80 },
};

const ELEMENT_HARMONY_LABELS: Record<string, string> = {
  "fire-fire": "Dual fire creates intense passion but may spark power struggles",
  "fire-earth": "Fire warms earth but earth can dampen fire's spontaneity",
  "fire-air": "Air feeds fire brilliantly — one of the most naturally harmonious pairings",
  "fire-water": "Fire steam and water clash — passion meets depth in challenging tension",
  "earth-earth": "Shared groundedness creates unshakeable stability and trust",
  "earth-air": "Earth grounds air's restlessness but can feel restricting",
  "earth-water": "Earth contains water beautifully — nurturing, growth-oriented bond",
  "air-air": "Mental connection is electric but emotional depth may be lacking",
  "air-water": "Air and water struggle — logic and emotion speak different languages",
  "water-water": "Profound emotional depth together — may drown in shared intensity",
};

// ============================================================
// QUALITY COMPATIBILITY MATRIX
// ============================================================

const QUALITY_COMPATIBILITY: Record<ZodiacQuality, Partial<Record<ZodiacQuality, number>>> = {
  cardinal: { cardinal: 50, fixed: 75, mutable: 85 },
  fixed: { cardinal: 75, fixed: 45, mutable: 80 },
  mutable: { cardinal: 85, fixed: 80, mutable: 55 },
};

const SAME_SIGN_SCORE = 65;

// ============================================================
// ZODIAC AFFINITY — Specific sign pair scores
// ============================================================

const ZODIAC_AFFINITY: Partial<Record<ZodiacSign, Partial<Record<ZodiacSign, number>>>> = {
  aries: { leo: 90, sagittarius: 85, gemini: 75, aquarius: 70, libra: 72, scorpio: 55 },
  taurus: { virgo: 85, capricorn: 80, cancer: 75, pisces: 70, scorpio: 68, leo: 65 },
  gemini: { libra: 85, aquarius: 80, aries: 75, leo: 70, sagittarius: 60, pisces: 45 },
  cancer: { scorpio: 90, pisces: 85, taurus: 75, virgo: 70, capricorn: 55, leo: 60 },
  leo: { aries: 90, sagittarius: 85, gemini: 75, libra: 70, scorpio: 60, taurus: 65 },
  virgo: { taurus: 85, capricorn: 80, cancer: 75, scorpio: 70, gemini: 55, sagittarius: 45 },
  libra: { gemini: 85, aquarius: 80, leo: 75, sagittarius: 70, scorpio: 50, virgo: 55 },
  scorpio: { cancer: 90, pisces: 85, virgo: 75, capricorn: 70, leo: 60, libra: 50 },
  sagittarius: { aries: 85, leo: 85, libra: 75, aquarius: 70, gemini: 60, virgo: 45 },
  capricorn: { taurus: 80, virgo: 80, scorpio: 75, pisces: 70, cancer: 55, aries: 50 },
  aquarius: { gemini: 80, libra: 80, aries: 70, sagittarius: 70, scorpio: 55, leo: 50 },
  pisces: { cancer: 85, scorpio: 85, taurus: 70, capricorn: 70, gemini: 45, virgo: 50 },
};

// ============================================================
// LIFE PATH COMPATIBILITY
// ============================================================

const LIFE_PATH_COMPATIBILITY: Record<string, Partial<Record<string, number>>> = {
  "1": { "1": 50, "2": 40, "3": 85, "4": 60, "5": 80, "6": 70, "7": 45, "8": 75, "9": 85 },
  "2": { "1": 40, "2": 50, "3": 75, "4": 85, "5": 45, "6": 90, "7": 80, "8": 40, "9": 75 },
  "3": { "1": 85, "2": 75, "3": 60, "4": 40, "5": 90, "6": 80, "7": 70, "8": 65, "9": 85 },
  "4": { "1": 60, "2": 85, "3": 40, "4": 50, "5": 45, "6": 90, "7": 80, "8": 85, "9": 55 },
  "5": { "1": 80, "2": 45, "3": 90, "4": 45, "5": 50, "6": 60, "7": 70, "8": 75, "9": 85 },
  "6": { "1": 70, "2": 90, "3": 80, "4": 90, "5": 60, "6": 50, "7": 45, "8": 75, "9": 80 },
  "7": { "1": 45, "2": 80, "3": 70, "4": 80, "5": 70, "6": 45, "7": 50, "8": 40, "9": 85 },
  "8": { "1": 75, "2": 40, "3": 65, "4": 85, "5": 75, "6": 75, "7": 40, "8": 50, "9": 60 },
  "9": { "1": 85, "2": 75, "3": 85, "4": 55, "5": 85, "6": 80, "7": 85, "8": 60, "9": 50 },
};

// ============================================================
// SIGN PAIR ADVICE DATABASE
// ============================================================

const SIGN_PAIR_ADVICE: Partial<Record<string, string[]>> = {
  "aries-leo": ["Your dual fire creates extraordinary passion — protect it from burnout by allowing each other space to shine independently", "Lead together but take turns — both of you need to be in charge, so divide your kingdoms wisely"],
  "aries-sagittarius": ["Adventure is your shared love language — travel, explore, and grow together fearlessly", "Your honesty can wound — practice tempering directness with compassion"],
  "aries-gemini": ["Mental stimulation and physical activity keep your bond electric", "Your different paces require patience — Gemini's indecision meets Aries' impulsiveness"],
  "aries-scorpio": ["Intense and transformative — this pairing either destroys or elevates both of you", "Power struggles are inevitable — establish equality early and honor each other's depth"],
  "taurus-virgo": ["Practical devotion and shared values create an unshakeable foundation", "Both of you tend toward routine — consciously introduce novelty to prevent stagnation"],
  "taurus-cancer": ["Home and family form the sacred center of your bond — build your nest with love", "Taurus stubbornness meets Cancer moodiness — develop a signal for when you need space"],
  "taurus-capricorn": ["Ambition meets stability — you build empires together, both materially and emotionally", "Don't let work consume your romance — schedule dedicated pleasure time"],
  "gemini-libra": ["Intellectual fireworks and social brilliance — you are the power couple of ideas", "Depth requires effort — practice going beneath the surface together"],
  "gemini-aquarius": ["Innovation and freedom define your bond — you inspire each other's evolution", "Emotional depth is your growth edge — practice vulnerability without intellectualizing feelings"],
  "cancer-scorpio": ["Profound emotional bond that transcends the ordinary — soulmates in feeling", "Protect each other's vulnerabilities instead of weaponizing them in conflict"],
  "cancer-pisces": ["Spiritual and emotional waters run deep together — this is a healing bond", "Establish boundaries to prevent losing yourselves in each other's emotional tides"],
  "leo-libra": ["Beauty, charm, and social grace — you paint a magnificent picture together", "Leo's need for attention must be balanced with Libra's need for equality"],
  "leo-sagittarius": ["Two fires burning brightly — your combined energy lights up every room", "Competition between you must be channeled into shared goals, not against each other"],
  "virgo-capricorn": ["Disciplined, ambitious, and deeply loyal — you achieve everything together", "Perfectionism can poison your bond — practice accepting 'good enough' sometimes"],
  "virgo-cancer": ["Nurturing practical meets nurturing emotional — you heal each other beautifully", "Overthinking (Virgo) and over-feeling (Cancer) need conscious balance"],
  "libra-aquarius": ["Shared love of freedom, beauty, and justice creates a progressive partnership", "Avoid retreating entirely into the social world — nurture your private connection"],
  "scorpio-pisces": ["Psychic-level understanding — you sense each other's deepest truths without words", "Intensity can become obsessive — maintain individual identities within the union"],
  "sagittarius-aquarius": ["Freedom-loving visionaries who expand each other's horizons endlessly", "Commitment must be redefined on your terms — tradition serves you less than authenticity"],
  "capricorn-pisces": ["Earth contains water beautifully — your differences create a complete ecosystem", "Capricorn's pragmatism must not dismiss Pisces' dreams — both are valuable"],
};

// ============================================================
// SIGN PAIR STRENGTHS
// ============================================================

const SIGN_PAIR_STRENGTHS: Partial<Record<string, string[]>> = {
  "aries-leo": ["Unstoppable combined courage and charisma", "Mutual admiration and loyalty", "Shared passion for life and adventure"],
  "aries-sagittarius": ["Infectious enthusiasm and optimism together", "Freedom-based relationship built on trust", "Shared philosophical exploration"],
  "taurus-virgo": ["Deep practical understanding and trust", "Shared work ethic and reliability", "Grounded stability that weathers any storm"],
  "taurus-cancer": ["Emotional security and physical comfort combined", "Devotion to home and family", "Patient, nurturing approach to love"],
  "gemini-libra": ["Effortless communication and intellectual spark", "Social grace and charm as a couple", "Shared love of beauty, art, and ideas"],
  "cancer-scorpio": ["Profound emotional depth and loyalty", "Intuitive understanding without words", "Transformative healing through vulnerability"],
  "leo-sagittarius": ["Radiant combined energy that inspires others", "Shared generosity and warmth", "Adventurous spirit and mutual support"],
  "virgo-capricorn": ["Unmatched practical teamwork", "Shared ambition and dedication", "Quiet, deep loyalty expressed through actions"],
  "libra-aquarius": ["Progressive shared values and vision", "Intellectual equality and mutual respect", "Social impact and humanitarian alignment"],
  "scorpio-pisces": ["Soul-level emotional connection", "Shared spiritual and intuitive depth", "Transformative power of combined vulnerability"],
  "sagittarius-aquarius": ["Mutual freedom and intellectual expansion", "Shared humanitarian and philosophical vision", "Inspiring each other's growth without limits"],
  "capricorn-pisces": ["Earth-water balance creates completeness", "Practical support for spiritual dreams", "Groundedness meets transcendence"],
};

// ============================================================
// ZODIAC COMPATIBILITY CALCULATOR
// ============================================================

function zodiacCompatibility(signA: ZodiacSign, signB: ZodiacSign): number {
  if (signA === signB) return SAME_SIGN_SCORE;

  const direct = ZODIAC_AFFINITY[signA]?.[signB];
  if (direct) return direct;

  const reverse = ZODIAC_AFFINITY[signB]?.[signA];
  if (reverse) return reverse;

  const elA = getZodiacElement(signA);
  const elB = getZodiacElement(signB);
  const elementScore = ELEMENT_COMPATIBILITY[elA]?.[elB] ?? 50;

  const qualA = getZodiacQuality(signA);
  const qualB = getZodiacQuality(signB);
  const qualityScore = QUALITY_COMPATIBILITY[qualA]?.[qualB] ?? 50;

  return Math.round((elementScore + qualityScore) / 2);
}

// ============================================================
// ELEMENT HARMONY SCORE
// ============================================================

function elementHarmonyScore(
  sunA: ZodiacSign, moonA: ZodiacSign, risingA: ZodiacSign,
  sunB: ZodiacSign, moonB: ZodiacSign, risingB: ZodiacSign,
): number {
  const elementsA: ZodiacElement[] = [
    getZodiacElement(sunA), getZodiacElement(moonA), getZodiacElement(risingA),
  ];
  const elementsB: ZodiacElement[] = [
    getZodiacElement(sunB), getZodiacElement(moonB), getZodiacElement(risingB),
  ];

  let totalScore = 0;
  let pairs = 0;

  for (const elA of elementsA) {
    for (const elB of elementsB) {
      const score = ELEMENT_COMPATIBILITY[elA]?.[elB] ?? 50;
      totalScore += score;
      pairs++;
    }
  }

  return Math.round(totalScore / pairs);
}

// ============================================================
// ELEMENT HARMONY DESCRIPTION
// ============================================================

function getElementHarmonyDescription(
  sunA: ZodiacSign, sunB: ZodiacSign,
): string {
  const elA = getZodiacElement(sunA);
  const elB = getZodiacElement(sunB);
  const key = `${elA}-${elB}`;
  const reverseKey = `${elB}-${elA}`;
  return ELEMENT_HARMONY_LABELS[key] ?? ELEMENT_HARMONY_LABELS[reverseKey] ?? "Your elements create a unique dynamic that invites conscious exploration.";
}

// ============================================================
// CHINESE ZODIAC COMPATIBILITY
// ============================================================

function chineseZodiacCompatibility(
  animalA: ChineseZodiacAnimal,
  animalB: ChineseZodiacAnimal,
): number {
  if (animalA === animalB) return 60;

  const dataA = CHINESE_ZODIAC[animalA];
  if (dataA.compatibility.includes(animalB)) return 90;
  if (dataA.enemy.includes(animalB)) return 20;
  if (dataA.friends.includes(animalB)) return 80;

  return 50;
}

// ============================================================
// NUMEROLOGY COMPATIBILITY
// ============================================================

function numerologyCompatibility(lifePathA: number, lifePathB: number): number {
  const keyA = String(lifePathA);
  const keyB = String(lifePathB);
  return LIFE_PATH_COMPATIBILITY[keyA]?.[keyB] ?? 50;
}

// ============================================================
// COSMIC BOND TYPE DETERMINATION
// ============================================================

function determineCosmicBondType(scores: CompatibilityScore): CosmicBondType {
  const avg = Object.values(scores).reduce((s, c) => s + c, 0) / Object.values(scores).length;

  if (scores.spiritual >= 80 && scores.love >= 75) return "soulmate";
  if (scores.spiritual >= 70 && avg < 65) return "karmic";
  if (scores.friendship >= 75 && scores.love < scores.friendship) return "companion";
  if (scores.communication >= 70 && scores.spiritual >= 60) return "mentor";
  if (scores.business >= 75 && avg < 70) return "catalyst";
  if (avg >= 75) return "soulmate";
  if (avg >= 60) return "companion";
  return "catalyst";
}

const BOND_TYPE_DESCRIPTIONS: Record<CosmicBondType, string> = {
  soulmate: "A deep soul recognition — you are drawn together by an ancient, unspoken knowing. This bond transcends the ordinary and invites profound growth.",
  karmic: "A karmic bond that carries lessons from past lives. The intensity serves a purpose — together you heal old patterns and evolve.",
  companion: "A warm, steadying companionship built on genuine friendship. This bond provides stability, trust, and deep comfort.",
  mentor: "A connection where wisdom flows both ways — you teach each other essential life lessons through intellectual and spiritual exchange.",
  catalyst: "A catalytic bond that triggers transformation in both of you. The friction and challenge are exactly what propels your growth.",
};

// ============================================================
// SPECIFIC SIGN PAIR ADVICE GENERATOR
// ============================================================

function getSpecificAdvice(
  sunA: ZodiacSign, sunB: ZodiacSign,
  moonA: ZodiacSign, moonB: ZodiacSign,
  scores: CompatibilityScore,
): string[] {
  const advice: string[] = [];
  const keyAB = `${sunA}-${sunB}`;
  const keyBA = `${sunB}-${sunA}`;
  const pairAdvice = SIGN_PAIR_ADVICE[keyAB] ?? SIGN_PAIR_ADVICE[keyBA];
  if (pairAdvice) advice.push(...pairAdvice);

  if (scores.communication < 60) {
    advice.push(`As a ${capitalize(sunA)} and ${capitalize(sunB)}, your communication styles differ fundamentally — practice translating between your native emotional languages.`);
  }
  if (scores.spiritual < 60) {
    advice.push("Explore shared spiritual practices — meditation, nature walks, or philosophical discussions can bridge your spiritual differences.");
  }
  if (scores.love < 60) {
    advice.push("Romantic chemistry needs nurturing — schedule dedicated quality time free from distractions to reconnect.");
  }
  if (scores.business >= 75) {
    advice.push("Your business synergy is exceptional — consider collaborating on a shared project or venture.");
  }

  const elA = getZodiacElement(sunA);
  const elB = getZodiacElement(sunB);
  if (elA === elB) {
    advice.push(`Same-element partnerships (${capitalize(elA)}) share a natural understanding but must watch for echo chambers — invite outside perspectives.`);
  }

  return advice;
}

// ============================================================
// SPECIFIC SIGN PAIR STRENGTHS GENERATOR
// ============================================================

function getSpecificStrengths(
  sunA: ZodiacSign, sunB: ZodiacSign,
  scores: CompatibilityScore,
): string[] {
  const strengths: string[] = [];
  const keyAB = `${sunA}-${sunB}`;
  const keyBA = `${sunB}-${sunA}`;
  const pairStrengths = SIGN_PAIR_STRENGTHS[keyAB] ?? SIGN_PAIR_STRENGTHS[keyBA];
  if (pairStrengths) strengths.push(...pairStrengths);

  if (scores.communication >= 80) {
    strengths.push("Exceptional communication — you understand each other with rare clarity");
  }
  if (scores.spiritual >= 80) {
    strengths.push("Profound spiritual alignment — your souls resonate on the same frequency");
  }
  if (scores.love >= 80) {
    strengths.push("Deep romantic chemistry — the spark between you is magnetic and enduring");
  }
  if (scores.friendship >= 80) {
    strengths.push("Genuine friendship forms the bedrock of your bond — you genuinely enjoy each other");
  }

  return strengths;
}

// ============================================================
// MAIN COMPATIBILITY CALCULATOR
// ============================================================

export function calculateCompatibility(input: {
  zodiacA: ZodiacSign;
  zodiacB: ZodiacSign;
  chineseAnimalA: ChineseZodiacAnimal;
  chineseAnimalB: ChineseZodiacAnimal;
  lifePathA: number;
  lifePathB: number;
  moonSignA: ZodiacSign;
  moonSignB: ZodiacSign;
  risingSignA?: ZodiacSign;
  risingSignB?: ZodiacSign;
}): CompatibilityScore {
  const zodiac = zodiacCompatibility(input.zodiacA, input.zodiacB);
  const moon = zodiacCompatibility(input.moonSignA, input.moonSignB);
  const chinese = chineseZodiacCompatibility(
    input.chineseAnimalA,
    input.chineseAnimalB,
  );
  const numerology = numerologyCompatibility(input.lifePathA, input.lifePathB);

  // Rising sign compatibility
  const risingA = input.risingSignA ?? input.zodiacA;
  const risingB = input.risingSignB ?? input.zodiacB;
  const risingSign = zodiacCompatibility(risingA, risingB);

  // Element harmony across all three axes
  const elementHarmony = elementHarmonyScore(
    input.zodiacA, input.moonSignA, risingA,
    input.zodiacB, input.moonSignB, risingB,
  );

  // Weighted scores for each dimension
  const love = Math.round(zodiac * 0.30 + moon * 0.25 + chinese * 0.15 + numerology * 0.15 + risingSign * 0.15);
  const marriage = Math.round(zodiac * 0.20 + moon * 0.15 + chinese * 0.20 + numerology * 0.25 + risingSign * 0.10 + elementHarmony * 0.10);
  const friendship = Math.round(zodiac * 0.15 + moon * 0.10 + chinese * 0.25 + numerology * 0.25 + risingSign * 0.10 + elementHarmony * 0.15);
  const business = Math.round(zodiac * 0.15 + moon * 0.10 + chinese * 0.25 + numerology * 0.30 + risingSign * 0.10 + elementHarmony * 0.10);
  const communication = Math.round(zodiac * 0.25 + moon * 0.25 + numerology * 0.20 + risingSign * 0.15 + elementHarmony * 0.15);
  const spiritual = Math.round(moon * 0.30 + elementHarmony * 0.25 + zodiac * 0.15 + numerology * 0.15 + risingSign * 0.15);
  const family = Math.round(chinese * 0.30 + zodiac * 0.15 + moon * 0.20 + numerology * 0.15 + risingSign * 0.10 + elementHarmony * 0.10);

  const clamp = (n: number) => Math.min(100, Math.max(0, n));

  return {
    love: clamp(love),
    marriage: clamp(marriage),
    friendship: clamp(friendship),
    business: clamp(business),
    communication: clamp(communication),
    spiritual: clamp(spiritual),
    family: clamp(family),
    risingSign: clamp(risingSign),
    elementHarmony: clamp(elementHarmony),
  };
}

// ============================================================
// FULL COMPATIBILITY RESULT (with all enrichments)
// ============================================================

export function calculateFullCompatibility(input: {
  zodiacA: ZodiacSign;
  zodiacB: ZodiacSign;
  chineseAnimalA: ChineseZodiacAnimal;
  chineseAnimalB: ChineseZodiacAnimal;
  lifePathA: number;
  lifePathB: number;
  moonSignA: ZodiacSign;
  moonSignB: ZodiacSign;
  risingSignA?: ZodiacSign;
  risingSignB?: ZodiacSign;
}): CompatibilityResult {
  const scores = calculateCompatibility(input);
  const avg = Math.round(Object.values(scores).reduce((s, c) => s + c, 0) / Object.values(scores).length);

  const cosmicBondType = determineCosmicBondType(scores);

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  const highScores = Object.entries(scores).filter(([, v]) => v >= 75).map(([k]) => k);
  const lowScores = Object.entries(scores).filter(([, v]) => v < 50).map(([k]) => k);

  if (highScores.length > 0) strengths.push(`Strong compatibility in: ${highScores.map(capitalize).join(', ')}`);
  if (lowScores.length > 0) weaknesses.push(`Areas for growth: ${lowScores.map(capitalize).join(', ')}`);

  const specificStrengths = getSpecificStrengths(input.zodiacA, input.zodiacB, scores);
  strengths.push(...specificStrengths);

  // Generic advice based on scores
  const advice: string[] = [];
  if (avg >= 80) advice.push('You share a rare cosmic harmony — nurture this connection with intention and gratitude.');
  else if (avg >= 65) advice.push('Strong foundation exists — focus on your growth areas to deepen the bond.');
  else if (avg >= 50) advice.push('Balance of harmony and challenge — communicate openly to bridge differences.');
  else advice.push('Opposing energies create tension — with awareness and effort, differences become strengths.');

  // Specific sign-pair advice
  const specificAdvice = getSpecificAdvice(
    input.zodiacA, input.zodiacB,
    input.moonSignA, input.moonSignB,
    scores,
  );

  // Growth areas
  const growthAreas: string[] = [];
  const entries = Object.entries(scores) as [keyof CompatibilityScore, number][];
  const sorted = entries.sort(([, a], [, b]) => a - b);
  const lowest = sorted.slice(0, 3);
  for (const [key] of lowest) {
    const map: Record<string, string> = {
      love: 'Cultivate romantic connection through quality time and shared experiences.',
      marriage: 'Strengthen long-term alignment through shared goals and values.',
      friendship: 'Invest in mutual interests and genuine enjoyment of each other.',
      business: 'Define clear roles and complementary responsibilities.',
      communication: 'Practice active listening and non-defensive expression.',
      spiritual: 'Explore shared spiritual or philosophical practices.',
      family: 'Align on family traditions, boundaries, and future visions.',
      risingSign: 'First impressions and social personas differ — appreciate each other\'s unique social gifts.',
      elementHarmony: 'Your elemental mix creates tension — find activities that balance both your natures.',
    };
    growthAreas.push(map[key] ?? 'Conscious effort in this area will bring balance.');
  }

  return {
    profileA: '',
    profileB: '',
    scores,
    strengths,
    weaknesses,
    advice,
    growthAreas,
    cosmicBondType,
    specificAdvice,
  };
}

// ============================================================
// EXPORTS FOR UI
// ============================================================

export function getBondTypeDescription(type: CosmicBondType): string {
  return BOND_TYPE_DESCRIPTIONS[type];
}

export function getElementHarmonyDescriptionForSigns(
  sunA: ZodiacSign, sunB: ZodiacSign,
): string {
  return getElementHarmonyDescription(sunA, sunB);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
