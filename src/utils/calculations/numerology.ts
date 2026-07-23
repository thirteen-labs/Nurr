import type { NumerologyResult, PlanesOfExpression } from '@/types/cosmic';

const PYTHAGOREAN: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
};

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

function reduceToRoot(n: number): number {
  if (n === 11 || n === 22 || n === 33) return n;
  while (n > 9) n = String(n).split('').reduce((s, d) => s + Number(d), 0);
  return n;
}

function reduceNonMaster(n: number): number {
  while (n > 9) n = String(n).split('').reduce((s, d) => s + Number(d), 0);
  return n;
}

function letterValue(c: string): number {
  return PYTHAGOREAN[c] ?? 0;
}

function cleanName(name: string): string {
  return name.toLowerCase().replace(/[^a-z]/g, '');
}

// ============================================================
// CORE NUMEROLOGY CALCULATIONS
// ============================================================

export function calculateLifePath(birthDate: string): number {
  const [y, m, d] = birthDate.split('-').map(Number);
  const sum = reduceNonMaster(y) + reduceNonMaster(m) + reduceNonMaster(d);
  return reduceToRoot(sum);
}

export function calculateDestinyNumber(name: string): number {
  const total = cleanName(name).split('').reduce((s, c) => s + letterValue(c), 0);
  return reduceToRoot(total);
}

export function calculateSoulUrge(name: string): number {
  const total = cleanName(name)
    .split('')
    .filter((c) => VOWELS.has(c))
    .reduce((s, c) => s + letterValue(c), 0);
  return reduceToRoot(total);
}

export function calculatePersonalityNumber(name: string): number {
  const total = cleanName(name)
    .split('')
    .filter((c) => !VOWELS.has(c))
    .reduce((s, c) => s + letterValue(c), 0);
  return reduceToRoot(total);
}

export function calculateBirthdayNumber(birthDate: string): number {
  const day = parseInt(birthDate.split('-')[2], 10);
  return reduceToRoot(day);
}

export function calculateMaturityNumber(lifePath: number, destiny: number): number {
  return reduceToRoot(lifePath + destiny);
}

// ============================================================
// PERSONAL CYCLES
// ============================================================

export function calculatePersonalYear(birthDate: string): number {
  const [, m, d] = birthDate.split('-').map(Number);
  const currentYear = new Date().getFullYear();
  const sum = reduceNonMaster(m) + reduceNonMaster(d) + reduceNonMaster(currentYear);
  return reduceToRoot(sum);
}

export function calculatePersonalMonth(birthDate: string): number {
  const personalYear = calculatePersonalYear(birthDate);
  const currentMonth = new Date().getMonth() + 1;
  return reduceToRoot(personalYear + currentMonth);
}

export function calculatePersonalDay(birthDate: string): number {
  const personalMonth = calculatePersonalMonth(birthDate);
  const currentDay = new Date().getDate();
  return reduceToRoot(personalMonth + currentDay);
}

// ============================================================
// CHALLENGE NUMBERS — Standard 4-Challenge Method
// ============================================================

export function calculateChallengeNumbers(birthDate: string): number[] {
  const [y, m, d] = birthDate.split('-').map(Number);
  const rm = reduceNonMaster(m);
  const rd = reduceNonMaster(d);
  const ry = reduceNonMaster(y);

  const first = Math.abs(rm - rd);
  const second = Math.abs(rd - ry);
  const third = Math.abs(first - second);
  const fourth = Math.abs(rm - ry);

  return [first, second, third, fourth];
}

// ============================================================
// KARMIC DEBT — Checks each life path component individually
// ============================================================

const KARMIC_NUMBERS = [13, 14, 16, 19];

function hasKarmicDebtInNumber(n: number): boolean {
  if (KARMIC_NUMBERS.includes(n)) return true;
  const digits = String(n).split('').map(Number);
  for (let i = 0; i < digits.length - 1; i++) {
    const pair = digits[i] * 10 + digits[i + 1];
    if (KARMIC_NUMBERS.includes(pair)) return true;
  }
  return false;
}

export function calculateKarmicDebt(birthDate: string, name: string): number | null {
  const [y, m, d] = birthDate.split('-').map(Number);
  const reducedMonth = reduceNonMaster(m);
  const reducedDay = reduceNonMaster(d);
  const reducedYear = reduceNonMaster(y);

  const lifePathComponents = [reducedMonth, reducedDay, reducedYear];
  for (const comp of lifePathComponents) {
    if (KARMIC_NUMBERS.includes(comp)) return comp;
  }

  const lifePath = calculateLifePath(birthDate);
  if (KARMIC_NUMBERS.includes(lifePath)) return lifePath;

  const destiny = calculateDestinyNumber(name);
  if (KARMIC_NUMBERS.includes(destiny)) return destiny;

  const soulUrge = calculateSoulUrge(name);
  if (KARMIC_NUMBERS.includes(soulUrge)) return soulUrge;

  const personality = calculatePersonalityNumber(name);
  if (KARMIC_NUMBERS.includes(personality)) return personality;

  if (hasKarmicDebtInNumber(lifePath)) return lifePath;
  if (hasKarmicDebtInNumber(destiny)) return destiny;

  return null;
}

// ============================================================
// PINNACLE CYCLES
// ============================================================

export function calculatePinnacleCycles(birthDate: string): number[] {
  const [y, m, d] = birthDate.split('-').map(Number);
  const month = reduceNonMaster(m);
  const day = reduceNonMaster(d);
  const year = reduceNonMaster(y);
  const first = reduceToRoot(month + day);
  const second = reduceToRoot(day + year);
  const third = reduceToRoot(first + second);
  const fourth = reduceToRoot(month + year);
  return [first, second, third, fourth];
}

// ============================================================
// BALANCE NUMBER — From first initials of full name
// ============================================================

export function calculateBalanceNumber(name: string): number {
  const parts = name.trim().split(/\s+/);
  const initials = parts.map((p) => p.charAt(0).toLowerCase()).filter((c) => PYTHAGOREAN[c]);
  const total = initials.reduce((s, c) => s + letterValue(c), 0);
  return reduceToRoot(total);
}

// ============================================================
// HIDDEN PASSION — Most frequently occurring digit 1-9 in name
// ============================================================

export function calculateHiddenPassion(name: string): number {
  const counts: Record<number, number> = {};
  for (let i = 1; i <= 9; i++) counts[i] = 0;

  const cleaned = cleanName(name);
  for (const c of cleaned) {
    const v = letterValue(c);
    if (v >= 1 && v <= 9) counts[v]++;
  }

  let maxCount = 0;
  let maxDigit = 1;
  for (let i = 1; i <= 9; i++) {
    if (counts[i] > maxCount) {
      maxCount = counts[i];
      maxDigit = i;
    }
  }

  return maxDigit;
}

// ============================================================
// SUBCONSCIOUS CONFIDENCE — Sum of all name letter values → reduce
// ============================================================

export function calculateSubconsciousConfidence(name: string): number {
  const total = cleanName(name).split('').reduce((s, c) => s + letterValue(c), 0);
  return reduceToRoot(total);
}

// ============================================================
// RATIONAL THOUGHT — From first name letters only
// ============================================================

export function calculateRationalThought(name: string): number {
  const firstName = name.trim().split(/\s+/)[0] ?? '';
  const total = cleanName(firstName).split('').reduce((s, c) => s + letterValue(c), 0);
  return reduceToRoot(total);
}

// ============================================================
// PLANES OF EXPRESSION — Physical, Emotional, Mental, Spiritual
// ============================================================

export function calculatePlanesOfExpression(name: string): PlanesOfExpression {
  const parts = name.trim().split(/\s+/);
  const firstName = cleanName(parts[0] ?? '');
  const lastName = cleanName(parts[parts.length - 1] ?? '');

  const physical = firstName.split('').filter((c) => !VOWELS.has(c)).reduce((s, c) => s + letterValue(c), 0);
  const emotional = firstName.split('').filter((c) => VOWELS.has(c)).reduce((s, c) => s + letterValue(c), 0);
  const mental = lastName.split('').filter((c) => !VOWELS.has(c)).reduce((s, c) => s + letterValue(c), 0);
  const spiritual = lastName.split('').filter((c) => VOWELS.has(c)).reduce((s, c) => s + letterValue(c), 0);

  return {
    physical: reduceToRoot(physical),
    emotional: reduceToRoot(emotional),
    mental: reduceToRoot(mental),
    spiritual: reduceToRoot(spiritual),
  };
}

// ============================================================
// AGGREGATE CALCULATION
// ============================================================

export function calculateNumerology(birthDate: string, name: string): NumerologyResult {
  return calculateAllNumerology(birthDate, name);
}

export function calculateAllNumerology(birthDate: string, name: string): NumerologyResult {
  const lifePath = calculateLifePath(birthDate);
  const destiny = calculateDestinyNumber(name);
  const soulUrge = calculateSoulUrge(name);
  const personality = calculatePersonalityNumber(name);
  const birthday = calculateBirthdayNumber(birthDate);
  const maturity = calculateMaturityNumber(lifePath, destiny);
  const challengeNumbers = calculateChallengeNumbers(birthDate);
  const karmicDebt = calculateKarmicDebt(birthDate, name);
  const pinnacleCycles = calculatePinnacleCycles(birthDate);
  const personalYear = calculatePersonalYear(birthDate);
  const personalMonth = calculatePersonalMonth(birthDate);
  const personalDay = calculatePersonalDay(birthDate);
  const balanceNumber = calculateBalanceNumber(name);
  const hiddenPassion = calculateHiddenPassion(name);
  const subconsciousConfidence = calculateSubconsciousConfidence(name);
  const rationalThought = calculateRationalThought(name);
  const planesOfExpression = calculatePlanesOfExpression(name);

  return {
    lifePath, destiny, soulUrge, personality, birthday, maturity,
    challengeNumbers, karmicDebt, pinnacleCycles, personalYear, personalMonth, personalDay,
    balanceNumber, hiddenPassion, subconsciousConfidence, rationalThought, planesOfExpression,
  };
}
