import type { CosmicBlueprint, Profile, PlanetName, ZodiacElement, ElementBalance, ChineseZodiacAnimal, ChineseElement } from "@/types/cosmic";
import { getSunSign } from "./sunSign";
import { getMoonSign } from "./moonSign";
import { getRisingSign } from "./risingSign";
import { getChineseZodiacFromDate } from "./chineseZodiac";
import { calculateNumerology } from "./numerology";
import { calculateEnergyScore } from "./forecast";
import { getBirthMoonPhase } from "./lunarPhase";
import { getZodiacElement } from "./sunSign";

// ============================================================
// BIRTHSTONES
// ============================================================

const BIRTHSTONES: Record<number, string> = {
  1: "Garnet", 2: "Amethyst", 3: "Aquamarine", 4: "Diamond",
  5: "Emerald", 6: "Pearl", 7: "Ruby", 8: "Peridot",
  9: "Sapphire", 10: "Opal", 11: "Citrine", 12: "Turquoise",
};

// ============================================================
// DOMINANT PLANET — Based on sun sign + birth hour
// ============================================================

const PLANET_BY_SIGN: Record<string, PlanetName> = {
  aries: "mars", taurus: "venus", gemini: "mercury",
  cancer: "moon", leo: "sun", virgo: "mercury",
  libra: "venus", scorpio: "pluto", sagittarius: "jupiter",
  capricorn: "saturn", aquarius: "uranus", pisces: "neptune",
};

const PLANET_BY_HOUR: Record<number, PlanetName> = {
  0: "saturn", 1: "jupiter", 2: "mars", 3: "sun",
  4: "venus", 5: "mercury", 6: "moon", 7: "saturn",
  8: "jupiter", 9: "mars", 10: "sun", 11: "venus",
  12: "mercury", 13: "moon", 14: "saturn", 15: "jupiter",
  16: "mars", 17: "sun", 18: "venus", 19: "mercury",
  20: "moon", 21: "saturn", 22: "jupiter", 23: "mars",
};

function getDominantPlanet(sunSign: string, birthHour: number): PlanetName {
  const signPlanet = PLANET_BY_SIGN[sunSign] ?? "sun";
  const hourPlanet = PLANET_BY_HOUR[birthHour] ?? "sun";
  // If they match, that's clearly dominant
  if (signPlanet === hourPlanet) return signPlanet;
  // Otherwise use sign planet (it's the stronger influence)
  return signPlanet;
}

// ============================================================
// LUCKY ATTRIBUTES — Multi-factor
// ============================================================

const LUCKY_COLORS_BY_SIGN: Record<string, string[]> = {
  aries: ["Red", "Orange", "Scarlet"],
  taurus: ["Green", "Pink", "Earth Tones"],
  gemini: ["Yellow", "Silver", "Light Blue"],
  cancer: ["Silver", "White", "Sea Green"],
  leo: ["Gold", "Orange", "Royal Purple"],
  virgo: ["Navy Blue", "Grey", "Beige"],
  libra: ["Pink", "Lavender", "Light Blue"],
  scorpio: ["Black", "Deep Red", "Burgundy"],
  sagittarius: ["Purple", "Turquoise", "Indigo"],
  capricorn: ["Dark Brown", "Black", "Forest Green"],
  aquarius: ["Electric Blue", "Silver", "Neon Green"],
  pisces: ["Sea Green", "Lavender", "Aqua"],
};

const LUCKY_DAYS_BY_SIGN: Record<string, string> = {
  aries: "Tuesday", taurus: "Friday", gemini: "Wednesday",
  cancer: "Monday", leo: "Sunday", virgo: "Wednesday",
  libra: "Friday", scorpio: "Tuesday", sagittarius: "Thursday",
  capricorn: "Saturday", aquarius: "Saturday", pisces: "Thursday",
};

const LUCKY_DIRECTIONS_BY_ANIMAL: Record<string, string> = {
  rat: "East", ox: "North", tiger: "East", rabbit: "East",
  dragon: "East", snake: "South", horse: "South", goat: "South",
  monkey: "North", rooster: "South", dog: "East", pig: "South",
};

function getLuckyNumber(lifePath: number, birthday: number, sunSignNumbers: number[]): number {
  // Combine life path, birthday, and sun sign lucky numbers
  // Pick the one that appears most frequently or is closest to life path
  const allCandidates = [lifePath, birthday, ...sunSignNumbers];
  const freq: Record<number, number> = {};
  for (const n of allCandidates) {
    const reduced = n > 9 ? n % 9 + 1 : n;
    freq[reduced] = (freq[reduced] || 0) + 1;
  }
  let best = lifePath;
  let bestFreq = 0;
  for (const [num, count] of Object.entries(freq)) {
    if (count > bestFreq) {
      bestFreq = count;
      best = Number(num);
    }
  }
  return best || lifePath;
}

function getLuckyColor(sign: string, chineseElement: ChineseElement, birthMonth: number): string {
  const signColors = LUCKY_COLORS_BY_SIGN[sign] ?? ["Gold"];
  // Use birth month to pick from sign's color palette
  return signColors[(birthMonth - 1) % signColors.length];
}

function getLuckyDay(sign: string, chineseAnimal: ChineseZodiacAnimal): string {
  return LUCKY_DAYS_BY_SIGN[sign] ?? "Sunday";
}

// ============================================================
// SPIRIT ANIMAL — Multi-factor calculation
// ============================================================

const SPIRIT_ANIMAL_LIST = [
  { animal: "Wolf", element: "Fire", traits: ["Loyalty", "Instinct", "Community"] },
  { animal: "Bear", element: "Earth", traits: ["Strength", "Introspection", "Healing"] },
  { animal: "Fox", element: "Air", traits: ["Cleverness", "Adaptability", "Playfulness"] },
  { animal: "Owl", element: "Air", traits: ["Wisdom", "Intuition", "Mystery"] },
  { animal: "Lion", element: "Fire", traits: ["Courage", "Leadership", "Generosity"] },
  { animal: "Eagle", element: "Air", traits: ["Vision", "Freedom", "Spiritual Sight"] },
  { animal: "Raven", element: "Air", traits: ["Transformation", "Magic", "Communication"] },
  { animal: "Panther", element: "Water", traits: ["Power", "Grace", "Shadow Work"] },
  { animal: "Horse", element: "Fire", traits: ["Freedom", "Endurance", "Adventure"] },
  { animal: "Snake", element: "Earth", traits: ["Wisdom", "Renewal", "Healing"] },
  { animal: "Dragon", element: "Fire", traits: ["Power", "Mysticism", "Abundance"] },
  { animal: "Dolphin", element: "Water", traits: ["Joy", "Intelligence", "Harmony"] },
  { animal: "Deer", element: "Earth", traits: ["Gentleness", "Grace", "Sensitivity"] },
  { animal: "Hawk", element: "Air", traits: ["Focus", "Perspective", "Alertness"] },
  { animal: "Bear", element: "Water", traits: ["Protection", "Courage", "Grounding"] },
  { animal: "Salmon", element: "Water", traits: ["Determination", "Intuition", "Flow"] },
];

function calculateSpiritAnimal(
  sunSign: string,
  lifePath: number,
  chineseAnimal: ChineseZodiacAnimal,
  birthDay: number,
): { animal: string; element: string; traits: string[] } {
  const animalIndex = (lifePath + birthDay) % SPIRIT_ANIMAL_LIST.length;
  return SPIRIT_ANIMAL_LIST[animalIndex >= 0 ? animalIndex : 0];
}

// ============================================================
// BIRTH DAY SIGNIFICANCE
// ============================================================

const DAY_OF_WEEK_MEANINGS: Record<number, { ruler: string; meaning: string }> = {
  0: { ruler: "Sun", meaning: "Born on Sunday — ruled by the Sun, you carry natural leadership, warmth, and creative vitality. Your life path illuminates others." },
  1: { ruler: "Moon", meaning: "Born on Monday — ruled by the Moon, you are deeply intuitive, emotionally rich, and nurturing. Your inner world is your greatest source of wisdom." },
  2: { ruler: "Mars", meaning: "Born on Tuesday — ruled by Mars, you possess fierce courage, physical vitality, and a pioneering spirit. Action is your native language." },
  3: { ruler: "Mercury", meaning: "Born on Wednesday — ruled by Mercury, your mind is quick, versatile, and brilliant. Communication, learning, and connection are your gifts." },
  4: { ruler: "Jupiter", meaning: "Born on Thursday — ruled by Jupiter, you carry expansive energy, philosophical wisdom, and natural abundance. Growth is your birthright." },
  5: { ruler: "Venus", meaning: "Born on Friday — ruled by Venus, you are blessed with charm, artistic sensitivity, and a deep capacity for love and beauty." },
  6: { ruler: "Saturn", meaning: "Born on Saturday — ruled by Saturn, you carry discipline, responsibility, and the potential for mastery through patience and perseverance." },
};

const BIRTH_DAY_NUMBER_MEANINGS: Record<number, string> = {
  1: "A born leader with independent spirit and pioneering energy",
  2: "A sensitive diplomat with deep intuition and cooperative grace",
  3: "A creative communicator with artistic gifts and joyful expression",
  4: "A steady builder with practical wisdom and reliable foundations",
  5: "An adventurous spirit with versatile talents and love of freedom",
  6: "A nurturing soul with deep devotion to family and community",
  7: "A seekers truth with analytical mind and spiritual depth",
  8: "A natural executive with material mastery and business acumen",
  9: "A compassionate humanitarian with global vision and selfless service",
  10: "A independent leader with innovative vision and original thinking",
  11: "A master intuitive with heightened spiritual awareness and psychic gifts",
  12: "A creative harmonizer with diplomatic grace and artistic talent",
  13: "A transformative worker with karmic lessons of persistence and rebirth",
  14: "A freedom-loving communicator with lessons of balance between liberty and responsibility",
  15: "A charismatic creative with magnetic charm and artistic expression",
  16: "A spiritual seeker undergoing destruction and renewal for higher purpose",
  17: "A visionary leader with strong willpower and spiritual illumination",
  18: "A humanitarian with compassionate service and global consciousness",
  19: "An independent power-house with lessons of ego and leadership",
  20: "A sensitive cooper with deep intuition and gentle diplomacy",
  21: "A social connector with creative energy and magnetic charm",
  22: "A master builder with the rare ability to manifest grand visions into reality",
  23: "A versatile communicator with quick wit and expansive social gifts",
  24: "A nurturing partner with deep loyalty and harmonious nature",
  25: "An analytical thinker with intuitive depth and spiritual insight",
  26: "A practical leader with business sense and material manifestation ability",
  27: "A compassionate visionary with humanitarian instincts and creative depth",
  28: "An ambitious builder with leadership potential and collaborative spirit",
  29: "A sensitive spiritual seeker with psychic gifts and emotional depth",
  30: "A creative communicator with artistic expression and joyful social energy",
  31: "An ambitious pioneer with strong willpower and practical determination",
};

// ============================================================
// CHINESE ELEMENT MODIFIER
// ============================================================

const CHINESE_ELEMENT_MODIFIERS: Record<ChineseElement, Record<ChineseZodiacAnimal, string>> = {
  wood: {
    rat: "Wood Rat — Visionary and adaptable, combines cleverness with growth-oriented thinking. Natural planner who seeds ideas for future harvest.",
    ox: "Wood Ox — Determined and generous, combines steadfastness with expansive vision. Builds lasting legacies through patient cultivation.",
    tiger: "Wood Tiger — Natural-born leader with explosive creative energy. Bold, idealistic, and constantly seeking new frontiers to conquer.",
    rabbit: "Wood Rabbit — Gracious and diplomatic with a rich inner world. Artistic sensitivity combined with strategic social intelligence.",
    dragon: "Wood Dragon — Charismatic visionary with boundless creative energy. Natural magnetism combined with philosophical depth and growth mindset.",
    snake: "Wood Snake — Wise and intuitive with a gift for healing and transformation. Combines natural cunning with spiritual growth.",
    horse: "Wood Horse — Adventurous free spirit with intellectual depth. Combines physical vitality with philosophical exploration and teaching gifts.",
    goat: "Wood Goat — Creative and compassionate with artistic vision. Combines gentle nature with ambitious growth and inspired creativity.",
    monkey: "Wood Monkey — Inventive and adaptable with generous spirit. Combines cleverness with visionary thinking and humanitarian ideals.",
    rooster: "Wood Rooster — Organized and ambitious with creative flair. Combines attention to detail with expansive vision and growth.",
    dog: "Wood Dog — Loyal and principled with humanitarian drive. Combines devotion to others with idealistic vision for a better world.",
    pig: "Wood Pig — Generous and optimistic with philosophical depth. Combines abundance mindset with growth-oriented generosity.",
  },
  fire: {
    rat: "Fire Rat — Dynamic and charismatic with sharp instincts. Combines resourcefulness with passionate energy and bold initiative.",
    ox: "Fire Ox — Powerful and determined with magnetic presence. Combines unwavering will with passionate drive and creative fire.",
    tiger: "Fire Tiger — Extraordinary courage and explosive charisma. The most dynamic combination — natural-born leader with irresistible magnetism.",
    rabbit: "Fire Rabbit — Charming and passionate with unexpected boldness. Combines diplomatic grace with warm, radiating confidence.",
    dragon: "Fire Dragon — supremely powerful and charismatic. The ultimate power combination — unstoppable ambition, magnetic leadership, and creative fire.",
    snake: "Fire Snake — Magnetic and transformative with passionate wisdom. Combines deep intuition with charismatic presence and spiritual fire.",
    horse: "Fire Horse — The most energetic combination — boundless enthusiasm, passionate independence, and infectious optimism.",
    goat: "Fire Goat — Creative and passionate with warm generosity. Combines artistic vision with charismatic warmth and emotional depth.",
    monkey: "Fire Monkey — Irresistibly charming and wildly inventive. Combines cleverness with passionate energy and magnetic confidence.",
    rooster: "Fire Rooster — Bold and charismatic with disciplined fire. Combines attention to detail with passionate drive and commanding presence.",
    dog: "Fire Dog — Passionate and loyal with fierce integrity. Combines devotion with courageous heart and charismatic warmth.",
    pig: "Fire Pig — Generous and enthusiastic with warm charisma. Combines abundance mindset with passionate generosity and joyful spirit.",
  },
  earth: {
    rat: "Earth Rat — Practical and resourceful with grounded wisdom. Combines cleverness with patient strategy and material stability.",
    ox: "Earth Ox — The most grounded combination — unshakeable determination, practical mastery, and enduring reliability.",
    tiger: "Earth Tiger — Courageous and stable with grounded ambition. Combines bold action with practical wisdom and measured courage.",
    rabbit: "Earth Rabbit — Gentle and reliable with practical grace. Combines diplomatic nature with grounded stability and quiet strength.",
    dragon: "Earth Dragon — Powerful and grounded with practical vision. Combines charismatic authority with stable foundations and material mastery.",
    snake: "Earth Snake — Wise and grounded with practical mysticism. Combines deep intuition with patient strategy and material abundance.",
    horse: "Earth Horse — Adventurous yet grounded with practical independence. Combines free spirit with stable foundations and reliable energy.",
    goat: "Earth Goat — Creative and practical with grounded artistry. Combines gentle nature with stable foundations and material security.",
    monkey: "Earth Monkey — Clever and grounded with practical ingenuity. Combines adaptability with patient strategy and material success.",
    rooster: "Earth Rooster — Disciplined and grounded with practical excellence. The most materially successful combination — builds lasting empires.",
    dog: "Earth Dog — Loyal and grounded with practical integrity. Combines devotion with stable foundations and reliable service.",
    pig: "Earth Pig — Generous and grounded with practical abundance. Combines generosity with material wisdom and stable prosperity.",
  },
  metal: {
    rat: "Metal Rat — Sharp and determined with unyielding resourcefulness. Combines cleverness with disciplined willpower and material strength.",
    ox: "Metal Ox — Incredibly resilient and disciplined with iron determination. Combines steadfastness with unwavering resolve and structural mastery.",
    tiger: "Metal Tiger — Fierce and disciplined with controlled power. Combines courage with strategic precision and unbreakable will.",
    rabbit: "Metal Rabbit — Elegant and disciplined with refined sensibilities. Combines grace with unwavering principles and structured beauty.",
    dragon: "Metal Dragon — Authoritative and disciplined with commanding power. Combines charisma with unyielding determination and structural vision.",
    snake: "Metal Snake — Strategic and disciplined with penetrating wisdom. Combines intuition with razor-sharp analysis and determined focus.",
    horse: "Metal Horse — Determined and independent with disciplined drive. Combines freedom-loving nature with structured ambition and iron will.",
    goat: "Metal Goat — Creative and disciplined with refined artistry. Combines gentle nature with strong principles and structured creativity.",
    monkey: "Metal Monkey — Sharp and disciplined with strategic brilliance. Combines cleverness with analytical precision and determined innovation.",
    rooster: "Metal Rooster — The most disciplined combination — unwavering precision, sharp integrity, and unbreakable principles.",
    dog: "Metal Dog — Fiercely loyal and disciplined with unyielding integrity. Combines devotion with principled strength and protective courage.",
    pig: "Metal Pig — Generous and disciplined with principled abundance. Combines generosity with structured wealth-building and moral clarity.",
  },
  water: {
    rat: "Water Rat — Intuitive and adaptable with flowing wisdom. Combines resourcefulness with deep emotional intelligence and spiritual sensitivity.",
    ox: "Water Ox — Patient and intuitive with emotional depth. Combines steadfastness with flowing adaptability and nurturing strength.",
    tiger: "Water Tiger — Courageous and intuitive with emotional depth. Combines boldness with flowing adaptability and spiritual power.",
    rabbit: "Water Rabbit — Deeply sensitive and diplomatic with intuitive grace. The most emotionally intelligent combination — profound empathy and healing.",
    dragon: "Water Dragon — Charismatic and intuitive with emotional depth. Combines visionary power with spiritual sensitivity and flowing wisdom.",
    snake: "Water Snake — Profoundly intuitive with spiritual depth. The most mystical combination — deep wisdom, psychic sensitivity, and transformative power.",
    horse: "Water Horse — Free-spirited and intuitive with emotional depth. Combines independence with spiritual sensitivity and flowing adventure.",
    goat: "Water Goat — Creative and deeply intuitive with emotional artistry. Combines gentle nature with profound sensitivity and spiritual creativity.",
    monkey: "Water Monkey — Adaptable and intuitive with emotional intelligence. Combines cleverness with spiritual sensitivity and flowing ingenuity.",
    rooster: "Water Rooster — Disciplined and intuitive with emotional depth. Combines precision with spiritual sensitivity and principled flow.",
    dog: "Water Dog — Loyal and deeply intuitive with emotional devotion. Combines fidelity with spiritual sensitivity and nurturing protection.",
    pig: "Water Pig — The most emotionally generous combination — profound compassion, intuitive abundance, and spiritual generosity.",
  },
};

// ============================================================
// MAIN BLUEPRINT GENERATOR
// ============================================================

export function generateCosmicBlueprint(profile: Profile): CosmicBlueprint {
  const [y, m, d] = profile.birthDate.split('-').map(Number);
  const birthHour = profile.birthTime ? parseInt(profile.birthTime.split(':')[0], 10) : 12;

  const sunSign = getSunSign(profile.birthDate);
  const moonSign = getMoonSign(profile.birthDate, profile.birthTime);
  const risingSign = getRisingSign(sunSign, profile.birthTime);
  const chinese = getChineseZodiacFromDate(profile.birthDate);
  const numerology = calculateNumerology(profile.birthDate, profile.name);
  const energyScore = calculateEnergyScore(profile.birthDate);
  const birthMoonPhase = getBirthMoonPhase(profile.birthDate);
  const birthDayOfWeek = new Date(y, m - 1, d).getDay();
  const dayRuler = DAY_OF_WEEK_MEANINGS[birthDayOfWeek];

  // Element balance from sun, moon, rising, and Chinese element
  const elementBalance = calculateElementBalance(sunSign, moonSign, risingSign, chinese.element);

  // Spirit animal
  const spiritAnimal = calculateSpiritAnimal(sunSign, numerology.lifePath, chinese.animal, d);

  // Chinese element modifier
  const chineseElementModifier = CHINESE_ELEMENT_MODIFIERS[chinese.element]?.[chinese.animal] ?? `${capitalize(chinese.element)} ${capitalize(chinese.animal)}`;

  // Birth day significance
  const dayMeaning = BIRTH_DAY_NUMBER_MEANINGS[d] ?? `Born on day ${d} — carrying the energy of numerological significance`;
  const birthDaySignificance = `${dayRuler.meaning} ${dayMeaning}`;

  // Lucky attributes (multi-factor)
  const luckyNumber = getLuckyNumber(numerology.lifePath, numerology.birthday, []);
  const luckyColor = getLuckyColor(sunSign, chinese.element, m);
  const luckyDay = getLuckyDay(sunSign, chinese.animal);
  const luckyDirection = LUCKY_DIRECTIONS_BY_ANIMAL[chinese.animal] ?? "East";

  // Dominant planet (sun sign + birth hour influence)
  const dominantPlanet = getDominantPlanet(sunSign, birthHour);

  // Birthstone
  const birthstone = BIRTHSTONES[m] ?? "Unknown";

  return {
    profileId: profile.id,
    sunSign,
    moonSign,
    risingSign,
    chineseZodiac: chinese.animal,
    chineseElement: chinese.element,
    lifePathNumber: numerology.lifePath,
    destinyNumber: numerology.destiny,
    soulNumber: numerology.soulUrge,
    personalityNumber: numerology.personality,
    birthstone,
    spiritAnimal: spiritAnimal.animal,
    dominantPlanet,
    luckyNumber,
    luckyColor,
    luckyDay,
    luckyDirection,
    energyScore,
    birthMoonPhase,
    elementBalance,
    birthDaySignificance,
    chineseElementModifier,
  };
}

// ============================================================
// ELEMENT BALANCE CALCULATOR
// ============================================================

function calculateElementBalance(
  sunSign: string,
  moonSign: string,
  risingSign: string,
  chineseElement: ChineseElement,
): ElementBalance {
  const balance: ElementBalance = { fire: 0, earth: 0, air: 0, water: 0 };

  // Sun sign element
  const sunEl = getZodiacElement(sunSign as any);
  balance[sunEl] += 2; // Sun is most influential

  // Moon sign element
  const moonEl = getZodiacElement(moonSign as any);
  balance[moonEl] += 1.5;

  // Rising sign element
  const risingEl = getZodiacElement(risingSign as any);
  balance[risingEl] += 1;

  // Chinese element
  const chineseMap: Record<ChineseElement, keyof ElementBalance> = {
    fire: 'fire', wood: 'earth', earth: 'earth', metal: 'air', water: 'water',
  };
  balance[chineseMap[chineseElement]] += 1;

  return {
    fire: Math.round(balance.fire * 10) / 10,
    earth: Math.round(balance.earth * 10) / 10,
    air: Math.round(balance.air * 10) / 10,
    water: Math.round(balance.water * 10) / 10,
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
