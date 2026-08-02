import type {
  BirthChart, PlanetaryPosition, ChartAspect, HouseCusp,
  PlanetName, ZodiacSign, ZodiacElement, ZodiacQuality,
} from '@/types/cosmic';
import { getHouseForSign } from '@/constants/cosmic/houses';
import { ASPECT_TYPES, getAspectInterpretation } from '@/constants/cosmic/aspects';

const SIGNS: ZodiacSign[] = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
];

const SIGN_ELEMENTS: Record<ZodiacSign, ZodiacElement> = {
  aries: 'fire', leo: 'fire', sagittarius: 'fire',
  taurus: 'earth', virgo: 'earth', capricorn: 'earth',
  gemini: 'air', libra: 'air', aquarius: 'air',
  cancer: 'water', scorpio: 'water', pisces: 'water',
};

const SIGN_MODALITY: Record<ZodiacSign, ZodiacQuality> = {
  aries: 'cardinal', cancer: 'cardinal', libra: 'cardinal', capricorn: 'cardinal',
  taurus: 'fixed', leo: 'fixed', scorpio: 'fixed', aquarius: 'fixed',
  gemini: 'mutable', virgo: 'mutable', sagittarius: 'mutable', pisces: 'mutable',
};

const SIGN_DEGREES: Record<ZodiacSign, number> = {
  aries: 0, taurus: 30, gemini: 60, cancer: 90, leo: 120, virgo: 150,
  libra: 180, scorpio: 210, sagittarius: 240, capricorn: 270, aquarius: 300, pisces: 330,
};

const SIGN_RULERS: Record<ZodiacSign, PlanetName> = {
  aries: 'mars', taurus: 'venus', gemini: 'mercury', cancer: 'moon',
  leo: 'sun', virgo: 'mercury', libra: 'venus', scorpio: 'pluto',
  sagittarius: 'jupiter', capricorn: 'saturn', aquarius: 'uranus', pisces: 'neptune',
};

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

function getSunDegreeInSign(birthDate: string): number {
  const [, month, day] = birthDate.split('-').map(Number);
  const signStarts: [number, number][] = [
    [1, 20], [2, 19], [3, 21], [4, 20], [5, 21], [6, 21],
    [7, 23], [8, 23], [9, 23], [10, 23], [11, 22], [12, 22],
  ];
  const signIndex = month - 1;
  const startDate = signStarts[signIndex];
  const daysSinceStart = day - startDate[1];
  const daysInSign = 30;
  return Math.max(0, Math.min(29, (daysSinceStart / daysInSign) * 30));
}

function isMercuryRetrograde(dateStr: string): boolean {
  const hash = dateHash(dateStr);
  return hash % 5 === 0;
}

function isVenusRetrograde(dateStr: string): boolean {
  const hash = dateHash(dateStr);
  return hash % 14 === 0;
}

function isMarsRetrograde(year: number): boolean {
  return (year % 2) === 1;
}

function isJupiterRetrograde(dateStr: string, month: number): boolean {
  const retrogradeMonths = [4, 5, 8, 9];
  return retrogradeMonths.includes(month);
}

function isSaturnRetrograde(year: number, month: number): boolean {
  const cyclePos = (year * 12 + month) % 15;
  return cyclePos >= 4 && cyclePos <= 8;
}

function isOuterRetrograde(year: number, month: number, cycleLength: number): boolean {
  const pos = ((year % cycleLength) * 12 + month) % (cycleLength * 12);
  const retroStart = Math.floor(cycleLength * 12 * 0.6);
  return pos >= retroStart && pos < retroStart + Math.floor(cycleLength * 12 * 0.33);
}

export function calculateBirthChart(
  profileId: string,
  birthDate: string,
  birthTime: string | undefined,
  sunSign: ZodiacSign,
  moonSign: ZodiacSign,
  risingSign: ZodiacSign,
): BirthChart {
  const [year, month] = birthDate.split('-').map(Number);
  const hash = dateHash(birthDate);

  const sunDegree = getSunDegreeInSign(birthDate);

  const sunSignIndex = SIGNS.indexOf(sunSign);
  const mercurySignIndex = (sunSignIndex + (hash % 3 === 0 ? 1 : 0)) % 12;
  const mercurySign = SIGNS[mercurySignIndex];
  const mercuryDegree = seededRandom(hash + 1) * 30;

  const venusSignIndex = (sunSignIndex + (hash % 5 < 2 ? 0 : hash % 5 < 4 ? 1 : -1) + 12) % 12;
  const venusSign = SIGNS[venusSignIndex];
  const venusDegree = seededRandom(hash + 2) * 30;

  const marsCycleSign = Math.floor(((year % 2) * 6 + month * 0.5) % 12);
  const marsSign = SIGNS[marsCycleSign];
  const marsDegree = seededRandom(hash + 3) * 30;

  const jupiterCycle = ((year % 12) * 2.5 + month * 0.25) % 12;
  const jupiterSign = SIGNS[Math.floor(jupiterCycle) % 12];
  const jupiterDegree = seededRandom(hash + 4) * 30;

  const saturnCycle = ((year % 29) * 1.24 + month * 0.1) % 12;
  const saturnSign = SIGNS[Math.floor(saturnCycle) % 12];
  const saturnDegree = seededRandom(hash + 5) * 30;

  const uranusCycle = ((year % 84) * 0.43 + month * 0.036) % 12;
  const uranusSign = SIGNS[Math.floor(uranusCycle) % 12];
  const uranusDegree = seededRandom(hash + 6) * 30;

  const neptuneCycle = ((year % 165) * 0.22 + month * 0.018) % 12;
  const neptuneSign = SIGNS[Math.floor(neptuneCycle) % 12];
  const neptuneDegree = seededRandom(hash + 7) * 30;

  const plutoCycle = ((year % 248) * 0.145 + month * 0.012) % 12;
  const plutoSign = SIGNS[Math.floor(plutoCycle) % 12];
  const plutoDegree = seededRandom(hash + 8) * 30;

  const mcSignIndex = (sunSignIndex + 9) % 12;
  const mcSign = SIGNS[mcSignIndex];

  const planets: { planet: PlanetName; sign: ZodiacSign; degree: number; retrograde: boolean }[] = [
    { planet: 'sun', sign: sunSign, degree: sunDegree, retrograde: false },
    { planet: 'moon', sign: moonSign, degree: seededRandom(hash + 20) * 30, retrograde: false },
    { planet: 'mercury', sign: mercurySign, degree: mercuryDegree, retrograde: isMercuryRetrograde(birthDate) },
    { planet: 'venus', sign: venusSign, degree: venusDegree, retrograde: isVenusRetrograde(birthDate) },
    { planet: 'mars', sign: marsSign, degree: marsDegree, retrograde: isMarsRetrograde(year) },
    { planet: 'jupiter', sign: jupiterSign, degree: jupiterDegree, retrograde: isJupiterRetrograde(birthDate, month) },
    { planet: 'saturn', sign: saturnSign, degree: saturnDegree, retrograde: isSaturnRetrograde(year, month) },
    { planet: 'uranus', sign: uranusSign, degree: uranusDegree, retrograde: isOuterRetrograde(year, month, 84) },
    { planet: 'neptune', sign: neptuneSign, degree: neptuneDegree, retrograde: isOuterRetrograde(year, month, 165) },
    { planet: 'pluto', sign: plutoSign, degree: plutoDegree, retrograde: isOuterRetrograde(year, month, 248) },
  ];

  const planetaryPositions: PlanetaryPosition[] = planets.map((p) => ({
    planet: p.planet,
    sign: p.sign,
    degree: Math.round(p.degree * 10) / 10,
    house: getHouseForSign(risingSign, p.sign),
    retrograde: p.retrograde,
  }));

  const houses: HouseCusp[] = [];
  for (let i = 0; i < 12; i++) {
    const cuspSignIndex = (SIGNS.indexOf(risingSign) + i) % 12;
    houses.push({
      house: i + 1,
      sign: SIGNS[cuspSignIndex],
      degree: (SIGN_DEGREES[SIGNS[cuspSignIndex]] + seededRandom(hash + 50 + i) * 10) % 360,
    });
  }

  const aspects: ChartAspect[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i];
      const p2 = planets[j];
      const sign1Deg = SIGN_DEGREES[p1.sign] + p1.degree;
      const sign2Deg = SIGN_DEGREES[p2.sign] + p2.degree;
      let diff = Math.abs(sign1Deg - sign2Deg);
      if (diff > 180) diff = 360 - diff;

      for (const aspectType of ASPECT_TYPES) {
        const aspectDeg = aspectType.type === 'conjunction' ? 0 : aspectType.angle;
        const orb = Math.abs(diff - aspectDeg);
        if (orb <= aspectType.orb) {
          aspects.push({
            planet1: p1.planet,
            planet2: p2.planet,
            type: aspectType.type,
            degree: Math.round(diff * 10) / 10,
            orb: Math.round(orb * 10) / 10,
            applying: diff < aspectDeg,
          });
          break;
        }
      }
    }
  }

  const elementDistribution: Record<ZodiacElement, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  const modalityDistribution: Record<ZodiacQuality, number> = { cardinal: 0, fixed: 0, mutable: 0 };
  for (const p of planetaryPositions) {
    elementDistribution[SIGN_ELEMENTS[p.sign]]++;
    modalityDistribution[SIGN_MODALITY[p.sign]]++;
  }

  let dominantPlanet: PlanetName = 'sun';
  let maxAspects = 0;
  const planetCounts: Record<string, number> = {};
  for (const a of aspects) {
    planetCounts[a.planet1] = (planetCounts[a.planet1] || 0) + 1;
    planetCounts[a.planet2] = (planetCounts[a.planet2] || 0) + 1;
  }
  for (const [planet, count] of Object.entries(planetCounts)) {
    if (count > maxAspects) {
      maxAspects = count;
      dominantPlanet = planet as PlanetName;
    }
  }

  const chartRuler = SIGN_RULERS[risingSign];

  return {
    profileId,
    planetaryPositions,
    aspects,
    houses,
    ascendant: risingSign,
    midheaven: mcSign,
    elementDistribution,
    modalityDistribution,
    dominantPlanet,
    chartRuler,
  };
}

export function getTransitInterpretationForPlanet(planet: PlanetName, sign: ZodiacSign): string {
  return `Transiting ${planet} in ${sign} influences themes of ${SIGN_ELEMENTS[sign]} energy, bringing its qualities to your chart.`;
}

export { SIGN_ELEMENTS, SIGN_MODALITY, SIGN_DEGREES, SIGN_RULERS, SIGNS, getAspectInterpretation };
