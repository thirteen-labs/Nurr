import type { AspectType, PlanetName } from '@/types/cosmic';

export interface AspectTypeData {
  type: AspectType;
  angle: number;
  orb: number;
  nature: 'harmonious' | 'challenging' | 'neutral';
  meaning: string;
  keywords: string[];
}

export const ASPECT_TYPES: AspectTypeData[] = [
  {
    type: 'conjunction',
    angle: 0,
    orb: 8,
    nature: 'neutral',
    meaning: 'Fusion of energies — two celestial bodies merge their influence, creating a powerful concentrated force. This aspect intensifies whatever it touches, blending themes into a new unified expression.',
    keywords: ['fusion', 'intensity', 'new beginnings', 'amplification'],
  },
  {
    type: 'sextile',
    angle: 60,
    orb: 5,
    nature: 'harmonious',
    meaning: 'A gentle flow of creative opportunity — these planets cooperate naturally, offering talents that require conscious effort to activate. The gifts are there but must be developed through initiative.',
    keywords: ['opportunity', 'talent', 'cooperation', 'ease'],
  },
  {
    type: 'square',
    angle: 90,
    orb: 7,
    nature: 'challenging',
    meaning: 'Dynamic tension that demands growth — these planets create friction and obstacles that force development. Though uncomfortable, squares are the primary engines of strength and achievement.',
    keywords: ['tension', 'challenge', 'drive', 'resilience'],
  },
  {
    type: 'trine',
    angle: 120,
    orb: 8,
    nature: 'harmonious',
    meaning: 'Natural grace and flow — these energies work together effortlessly, revealing innate gifts and areas of ease. Trines show where life feels smooth, but may also indicate areas where growth is neglected.',
    keywords: ['harmony', 'gifts', 'flow', 'comfort'],
  },
  {
    type: 'opposition',
    angle: 180,
    orb: 7,
    nature: 'challenging',
    meaning: 'A polarized awareness that seeks balance — these planets pull in opposite directions, creating a see-saw dynamic. Oppositions teach through relationships and the integration of seemingly contradictory energies.',
    keywords: ['polarity', 'awareness', 'balance', 'projection'],
  },
];

export function getAspectData(type: AspectType): AspectTypeData | undefined {
  return ASPECT_TYPES.find((a) => a.type === type);
}

type AspectKey = `${PlanetName}-${PlanetName}-${AspectType}`;

export const ASPECT_INTERPRETATIONS: Record<string, string> = {
  'sun-moon-conjunction': 'Your core identity and emotions are deeply fused — you are who you feel. This creates tremendous inner consistency but can limit perspective.',
  'sun-moon-square': 'Tension between your conscious will and emotional needs creates inner conflict. Learning to honor both halves of yourself is a major life theme.',
  'sun-moon-trine': 'Your identity and emotions flow naturally together, creating genuine confidence and emotional security. Others sense your authenticity.',
  'sun-moon-opposition': 'A dynamic interplay between self and other, conscious and unconscious. Full Moon babies often feel pulled between independence and intimacy.',
  'sun-moon-sextile': 'Creative cooperation between your identity and feelings offers easy emotional expression and warmth in relationships.',

  'sun-mercury-conjunction': 'Your thinking and identity are tightly linked — you think like yourself and communicate with personal conviction.',
  'sun-venus-conjunction': 'Warmth and charm radiate naturally — you attract love and beauty through your authentic self-expression.',
  'sun-mars-conjunction': 'Powerful drive and assertive energy — you pursue your identity with fearless determination and physical vitality.',
  'sun-jupiter-conjunction': 'Expansive optimism and natural confidence — you attract luck through your generous, abundant spirit.',
  'sun-saturn-conjunction': 'Serious self-discipline and mature identity — early restrictions shape a strong, responsible character.',
  'sun-uranus-conjunction': 'Electrifying individuality and revolutionary spirit — you are here to break molds and pioneer new ways of being.',
  'sun-neptune-conjunction': 'A mystical, sensitive identity — you dissolve boundaries between self and spirit, sometimes losing yourself in idealism.',
  'sun-pluto-conjunction': 'Profound personal power and transformative identity — your life journey involves dying to old selves and being reborn.',

  'moon-venus-conjunction': 'Deep emotional harmony in love — you naturally nurture and create beauty in intimate relationships.',
  'moon-mars-conjunction': 'Fiery emotional responses and passionate nurturing — you defend what you love with fierce intensity.',
  'moon-jupiter-conjunction': 'Overflowing emotional generosity and optimism — your feelings expand to embrace everyone around you.',
  'moon-saturn-conjunction': 'Emotional reserve and disciplined feelings — learning to express vulnerability is a lifelong journey.',

  'venus-mars-conjunction': 'Magnetic romantic and creative energy — desire and affection merge into powerful personal charm.',
  'venus-mars-square': 'Passionate but turbulent relationships — the dance between desire and affection creates exciting friction.',
  'venus-mars-trine': 'Graceful expression of desire — you attract what you want with natural ease and sensual confidence.',

  'mars-saturn-conjunction': 'Controlled power and disciplined action — you build through persistent, structured effort.',
  'mars-saturn-square': 'Frustrated ambition and blocked energy — learning patience and strategic action transforms obstacles into foundations.',

  'jupiter-saturn-conjunction': 'Expansion meets structure — this rare aspect marks generational shifts between growth and consolidation.',
  'jupiter-pluto-conjunction': 'Transformative power and expansive vision — the drive to remake the world through concentrated will.',

  'saturn-uranus-conjunction': 'Revolution meets discipline — this rare aspect shakes foundations to build new structures for the future.',
  'saturn-neptune-conjunction': 'Dreams meet reality — learning to manifest spiritual visions through practical structure.',
  'saturn-pluto-conjunction': 'Deep transformation through discipline — the power to demolish and rebuild at the most fundamental levels.',

  'uranus-neptune-conjunction': 'A generational aspect of spiritual awakening and collective consciousness transformation.',
  'uranus-pluto-conjunction': 'Revolutionary transformation — a generational catalyst for radical societal and personal change.',
  'neptune-pluto-conjunction': 'The slowest generational aspect — spiritual evolution of entire civilizations across centuries.',
};

export function getAspectInterpretation(planet1: PlanetName, planet2: PlanetName, type: AspectType): string {
  const key1 = `${planet1}-${planet2}-${type}`;
  const key2 = `${planet2}-${planet1}-${type}`;
  return ASPECT_INTERPRETATIONS[key1] ?? ASPECT_INTERPRETATIONS[key2] ?? `${capitalize(type)} between ${planet1} and ${planet2} creates ${getAspectData(type)?.nature ?? 'mixed'} energy in your chart.`;
}

function capitalize(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }
