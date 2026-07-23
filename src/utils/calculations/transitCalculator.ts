import type {
  TransitEntry, TransitReport, PlanetName, ZodiacSign, AspectType,
} from '@/types/cosmic';
import { getTransitSignInterpretation, PLANET_WEIGHTS } from '@/constants/cosmic/transits';

const SIGNS: ZodiacSign[] = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
];

const SIGN_DEGREES: Record<ZodiacSign, number> = {
  aries: 0, taurus: 30, gemini: 60, cancer: 90, leo: 120, virgo: 150,
  libra: 180, scorpio: 210, sagittarius: 240, capricorn: 270, aquarius: 300, pisces: 330,
};

const PLANETS: PlanetName[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

function seededRandom(seed: number): number {
  let x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function dateHash(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function degreesToSign(totalDegrees: number): { sign: ZodiacSign; degree: number } {
  const normalized = ((totalDegrees % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const degree = normalized % 30;
  return { sign: SIGNS[signIndex], degree: Math.round(degree * 10) / 10 };
}

function calculatePlanetPosition(planet: PlanetName, dateStr: string): { sign: ZodiacSign; degree: number; retrograde: boolean } {
  const [, month, day] = dateStr.split('-').map(Number);
  const year = parseInt(dateStr.split('-')[0]);
  const hash = dateHash(dateStr + planet);

  switch (planet) {
    case 'sun': {
      const dayOfYear = Math.floor(
        (new Date(year, month - 1, day).getTime() - new Date(year, 0, 0).getTime()) / 86400000,
      );
      const sunDeg = (dayOfYear / 365.25) * 360;
      return { ...degreesToSign(sunDeg), retrograde: false };
    }
    case 'moon': {
      const moonDeg = (hash * 13.2 + month * 36) % 360;
      return { ...degreesToSign(moonDeg), retrograde: false };
    }
    case 'mercury': {
      const sunDeg = ((month - 1) * 30 + day);
      const offset = (hash % 28) - 14;
      const deg = (sunDeg + offset + 360) % 360;
      const retrograde = hash % 5 === 0;
      return { ...degreesToSign(deg), retrograde };
    }
    case 'venus': {
      const sunDeg = ((month - 1) * 30 + day);
      const offset = (hash % 47) - 23;
      const deg = (sunDeg + offset + 360) % 360;
      const retrograde = hash % 14 === 0;
      return { ...degreesToSign(deg), retrograde };
    }
    case 'mars': {
      const deg = ((year % 2) * 180 + month * 15 + day * 0.5) % 360;
      return { ...degreesToSign(deg), retrograde: (year % 2) === 1 && month >= 10 };
    }
    case 'jupiter': {
      const deg = ((year % 12) * 30 + month * 2.5) % 360;
      const retro = (year % 12) >= 4 && (year % 12) <= 7;
      return { ...degreesToSign(deg), retrograde: retro };
    }
    case 'saturn': {
      const deg = ((year % 29) * 12.4 + month) % 360;
      const retro = ((year % 29) * 12 + month) % 15 >= 4 && ((year % 29) * 12 + month) % 15 <= 8;
      return { ...degreesToSign(deg), retrograde: retro };
    }
    case 'uranus': {
      const deg = ((year % 84) * 4.29 + month * 0.36) % 360;
      return { ...degreesToSign(deg), retrograde: month >= 6 && month <= 10 };
    }
    case 'neptune': {
      const deg = ((year % 165) * 2.18 + month * 0.18) % 360;
      return { ...degreesToSign(deg), retrograde: month >= 5 && month <= 11 };
    }
    case 'pluto': {
      const deg = ((year % 248) * 1.45 + month * 0.12) % 360;
      return { ...degreesToSign(deg), retrograde: month >= 4 && month <= 9 };
    }
  }
}

function determineAspectToNatal(currentDegree: number, natalDegree: number): AspectType | null {
  const diff = Math.abs(currentDegree - natalDegree);
  const adjusted = diff > 180 ? 360 - diff : diff;

  if (adjusted <= 8) return 'conjunction';
  if (Math.abs(adjusted - 60) <= 5) return 'sextile';
  if (Math.abs(adjusted - 90) <= 7) return 'square';
  if (Math.abs(adjusted - 120) <= 8) return 'trine';
  if (Math.abs(adjusted - 180) <= 7) return 'opposition';
  return null;
}

export function calculateCurrentPlanetaryPositions(date: Date): { planet: PlanetName; sign: ZodiacSign; degree: number; retrograde: boolean }[] {
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return PLANETS.map((planet) => {
    const pos = calculatePlanetPosition(planet, dateStr);
    return { planet, ...pos };
  });
}

function getHouseForSign(ascendantSign: ZodiacSign, targetSign: ZodiacSign): number {
  const ascIndex = SIGNS.indexOf(ascendantSign);
  const targetIndex = SIGNS.indexOf(targetSign);
  return ((targetIndex - ascIndex + 12) % 12) + 1;
}

function generateTransitInterpretation(transit: TransitEntry): string {
  const signInterp = getTransitSignInterpretation(transit.planet, transit.currentSign);
  let aspectNote = '';
  if (transit.aspectToNatal) {
    aspectNote = ` This forms a ${transit.aspectToNatal} with your natal ${transit.planet}.`;
  }
  const houseNote = transit.natalHouse === transit.transitHouse
    ? ` This transit activates your natal ${transit.planet} in house ${transit.natalHouse}.`
    : ` Moving through your ${transit.transitHouse}${getOrdinalSuffix(transit.transitHouse)} house.`;
  return `${signInterp}${aspectNote}${houseNote}`;
}

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

export function calculateTransits(
  profileId: string,
  birthDate: string,
  birthTime: string | undefined,
  natalSunSign: ZodiacSign,
  natalMoonSign: ZodiacSign,
  natalRisingSign: ZodiacSign,
  transitDate?: Date,
): TransitReport {
  const now = transitDate ?? new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const natalPositions: Record<PlanetName, ZodiacSign> = {
    sun: natalSunSign,
    moon: natalMoonSign,
    mercury: calculatePlanetPosition('mercury', birthDate).sign,
    venus: calculatePlanetPosition('venus', birthDate).sign,
    mars: calculatePlanetPosition('mars', birthDate).sign,
    jupiter: calculatePlanetPosition('jupiter', birthDate).sign,
    saturn: calculatePlanetPosition('saturn', birthDate).sign,
    uranus: calculatePlanetPosition('uranus', birthDate).sign,
    neptune: calculatePlanetPosition('neptune', birthDate).sign,
    pluto: calculatePlanetPosition('pluto', birthDate).sign,
  };

  const transits: TransitEntry[] = PLANETS.map((planet) => {
    const current = calculatePlanetPosition(planet, dateStr);
    const natalSign = natalPositions[planet];
    const natalSignDeg = SIGN_DEGREES[natalSign] + seededRandom(dateHash(birthDate) + PLANETS.indexOf(planet)) * 30;
    const currentSignDeg = SIGN_DEGREES[current.sign] + current.degree;

    const aspectToNatal = determineAspectToNatal(currentSignDeg, natalSignDeg);

    const transit: TransitEntry = {
      planet,
      currentSign: current.sign,
      currentDegree: current.degree,
      retrograde: current.retrograde,
      natalSign,
      natalHouse: getHouseForSign(natalRisingSign, natalSign),
      transitHouse: getHouseForSign(natalRisingSign, current.sign),
      aspectToNatal,
      interpretation: '',
    };

    transit.interpretation = generateTransitInterpretation(transit);
    return transit;
  });

  const significantTransits = transits.filter((t) => {
    if (t.aspectToNatal && (t.planet === 'sun' || t.planet === 'moon' || t.planet === 'jupiter' || t.planet === 'saturn' || t.planet === 'pluto')) return true;
    if (t.retrograde && (t.planet === 'jupiter' || t.planet === 'saturn' || t.planet === 'pluto')) return true;
    if (t.aspectToNatal === 'conjunction' || t.aspectToNatal === 'opposition') return true;
    return false;
  });

  const overallTheme = generateOverallTheme(transits, significantTransits);
  const advice = generateTransitAdvice(significantTransits);

  return {
    profileId,
    date: dateStr,
    transits,
    significantTransits,
    overallTheme,
    advice,
  };
}

function generateOverallTheme(transits: TransitEntry[], significant: TransitEntry[]): string {
  if (significant.length === 0) {
    return 'A relatively quiet transit period — inner reflection and daily routines are highlighted. Use this time for preparation before more active phases.';
  }

  const outerPlanetTransits = significant.filter((t) =>
    ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto'].includes(t.planet),
  );

  if (outerPlanetTransits.length === 0) {
    return 'Personal planet transits create short-term energy shifts. Be mindful of daily interactions and emotional responses as planets move through your chart.';
  }

  const themes = outerPlanetTransits.map((t) => {
    const weight = PLANET_WEIGHTS[t.planet];
    if (t.aspectToNatal === 'conjunction') return `intense ${t.planet} activation`;
    if (t.aspectToNatal === 'opposition') return `${t.planet} confrontation`;
    if (t.aspectToNatal === 'square') return `${t.planet} challenge`;
    if (t.aspectToNatal === 'trine') return `${t.planet} flow`;
    if (t.aspectToNatal === 'sextile') return `${t.planet} opportunity`;
    return `${t.planet} influence in ${t.currentSign}`;
  });

  return `Significant outer planet activity: ${themes.join(', ')}. This is a period of meaningful energy requiring attention and conscious navigation.`;
}

function generateTransitAdvice(significant: TransitEntry[]): string[] {
  const advice: string[] = [];

  for (const t of significant) {
    if (t.planet === 'saturn' && t.aspectToNatal === 'square') {
      advice.push('Saturn squares demand patience and discipline. Build structures that will endure rather than fighting the current.');
    }
    if (t.planet === 'saturn' && t.aspectToNatal === 'conjunction') {
      advice.push('Saturn conjunction brings maturity through responsibility. Embrace the lessons rather than resisting structure.');
    }
    if (t.planet === 'jupiter' && (t.aspectToNatal === 'trine' || t.aspectToNatal === 'conjunction')) {
      advice.push('Jupiter brings expansion and opportunity. Say yes to growth, even if it requires stepping outside comfort zones.');
    }
    if (t.planet === 'pluto' && t.aspectToNatal) {
      advice.push('Pluto transits transform at the deepest level. Release what no longer serves you and embrace profound change.');
    }
    if (t.planet === 'uranus' && t.aspectToNatal) {
      advice.push('Uranus brings sudden shifts. Stay flexible and open to unexpected opportunities and necessary disruptions.');
    }
    if (t.planet === 'neptune' && t.aspectToNatal) {
      advice.push('Neptune creates spiritual openings but also illusions. Trust intuition but verify important decisions.');
    }
    if (t.retrograde && ['jupiter', 'saturn', 'pluto'].includes(t.planet)) {
      advice.push(`${capitalize(t.planet)} is retrograde — turn energy inward for reflection, revision, and internal growth.`);
    }
  }

  if (advice.length === 0) {
    advice.push('Navigate current energies with awareness. Stay grounded while remaining open to the messages the cosmos is delivering.');
  }

  return advice;
}

function capitalize(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }
