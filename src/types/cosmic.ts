// ============================================================
// COSMIC ORACLE — Core Type Definitions
// ============================================================

// --- Profile ---
export interface Profile {
  id: string;
  name: string;
  birthDate: string; // ISO date YYYY-MM-DD
  birthTime?: string; // HH:mm (optional)
  birthLocation?: string;
  notes?: string;
  avatar?: string; // emoji or image uri
  type: ProfileType;
  createdAt: string;
}

export type ProfileType =
  | "self"
  | "partner"
  | "friend"
  | "child"
  | "family"
  | "client";

// --- Western Zodiac ---
export type ZodiacSign =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";

export type ZodiacElement = "fire" | "earth" | "air" | "water";
export type ZodiacQuality = "cardinal" | "fixed" | "mutable";

export interface ZodiacData {
  sign: ZodiacSign;
  symbol: string;
  dateRange: string;
  element: ZodiacElement;
  quality: ZodiacQuality;
  rulingPlanet: string;
  personality: string[];
  strengths: string[];
  weaknesses: string[];
  loveStyle: string;
  careerStyle: string;
  financialHabits: string;
  spiritualTraits: string[];
  luckyNumbers: number[];
  luckyColors: string[];
  luckyCrystals: string[];
  luckyDays: string[];
}

// --- Moon Sign ---
export interface MoonSignData {
  sign: ZodiacSign;
  emotionalNature: string;
  hiddenFears: string;
  relationshipPatterns: string;
  emotionalStrengths: string[];
  intuition: string;
  subconscious: string;
}

// --- Rising Sign ---
export interface RisingSignData {
  sign: ZodiacSign;
  firstImpressions: string;
  socialBehavior: string;
  appearanceTraits: string[];
  publicPersona: string;
}

// --- Chinese Zodiac ---
export type ChineseZodiacAnimal =
  | "rat"
  | "ox"
  | "tiger"
  | "rabbit"
  | "dragon"
  | "snake"
  | "horse"
  | "goat"
  | "monkey"
  | "rooster"
  | "dog"
  | "pig";

export type ChineseElement = "wood" | "fire" | "earth" | "metal" | "water";

export interface ChineseZodiacData {
  animal: ChineseZodiacAnimal;
  years: number[];
  element: ChineseElement;
  personality: string[];
  compatibility: ChineseZodiacAnimal[];
  enemy: ChineseZodiacAnimal[];
  friends: ChineseZodiacAnimal[];
  luckyNumbers: number[];
  luckyColors: string[];
  luckyDirections: string[];
  careerPaths: string[];
  traits: string;
  bestYears: number[];
  challengingYears: number[];
  clothingBrands: string[];
  carBrands: string[];
  luxuryBrands: string[];
  accessoryBrands: string[];
  watchBrands: string[];
  shoeBrands: string[];
  techBrands: string[];
  fragranceBrands: string[];
}

// --- Numerology ---
export type NumerologyNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 11 | 22 | 33;

export interface PlanesOfExpression {
  physical: number;
  emotional: number;
  mental: number;
  spiritual: number;
}

export interface NumerologyResult {
  lifePath: number;
  destiny: number;
  soulUrge: number;
  personality: number;
  birthday: number;
  maturity: number;
  challengeNumbers: number[];
  karmicDebt: number | null;
  pinnacleCycles: number[];
  personalYear: number;
  personalMonth: number;
  personalDay: number;
  balanceNumber: number;
  hiddenPassion: number;
  subconsciousConfidence: number;
  rationalThought: number;
  planesOfExpression: PlanesOfExpression;
}

export interface NumerologyInterpretation {
  number: number;
  title: string;
  strengths: string[];
  weaknesses: string[];
  love: string;
  career: string;
  finances: string;
  spiritualLessons: string[];
  growthAreas: string[];
}

// --- Tarot ---
export type TarotSuit = "wands" | "cups" | "swords" | "pentacles";
export type TarotArcana = "major" | "minor";

export interface TarotCard {
  id: number;
  name: string;
  arcana: TarotArcana;
  suit?: TarotSuit;
  number?: number;
  meaning: string;
  reversedMeaning: string;
  keywords: string[];
  advice: string;
  interpretation: string;
}

export type TarotSpread =
  | "single"
  | "three"
  | "five"
  | "seven"
  | "celtic-cross"
  | "relationship"
  | "career"
  | "year-ahead";

export interface TarotReading {
  id: string;
  profileId: string;
  spread: TarotSpread;
  cards: TarotCard[];
  positions: string[];
  date: string;
  notes?: string;
}

// --- Angel Numbers ---
export interface AngelNumber {
  number: string;
  meaning: string;
  message: string;
  affirmation: string;
  manifestationAdvice: string;
  warnings: string[];
}

// --- Dream Symbols ---
export type DreamCategory =
  | "animals"
  | "nature"
  | "water"
  | "death"
  | "birth"
  | "flying"
  | "objects"
  | "places"
  | "people"
  | "body"
  | "food"
  | "clothing"
  | "vehicles"
  | "buildings";

export interface DreamSymbol {
  symbol: string;
  category: DreamCategory;
  traditionalMeaning: string;
  spiritualMeaning: string;
  psychologicalMeaning: string;
  advice: string;
}

// --- Chakras ---
export type ChakraName =
  | "root"
  | "sacral"
  | "solar-plexus"
  | "heart"
  | "throat"
  | "third-eye"
  | "crown";

export interface ChakraData {
  name: ChakraName;
  title: string;
  color: string;
  element: string;
  location: string;
  strengths: string[];
  weaknesses: string[];
  balanceSuggestions: string[];
  meditationAdvice: string;
  crystals: string[];
  affirmation: string;
}

// --- Spirit Animals ---
export interface SpiritAnimal {
  animal: string;
  traits: string[];
  lifeGuidance: string;
  strengths: string[];
  spiritualMessage: string;
  element: string;
  direction: string;
}

// --- Moon Phases ---
export type MoonPhase =
  | "new-moon"
  | "waxing-crescent"
  | "first-quarter"
  | "waxing-gibbous"
  | "full-moon"
  | "waning-gibbous"
  | "last-quarter"
  | "waning-crescent";

export interface MoonPhaseData {
  phase: MoonPhase;
  title: string;
  symbol: string;
  interpretation: string;
  bestActivities: string[];
  energy: string;
}

// --- Planets ---
export type PlanetName =
  | "sun"
  | "moon"
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "pluto";

export interface PlanetData {
  planet: PlanetName;
  title: string;
  rules: string;
  influence: string;
  strengths: string[];
  weaknesses: string[];
  color: string;
  day: string;
}

// --- Elements (Western) ---
export interface ElementData {
  element: ZodiacElement;
  traits: string[];
  dominant: string[];
  weak: string[];
  balanceSuggestions: string[];
  signs: ZodiacSign[];
}

// --- Birthstones ---
export interface BirthstoneData {
  month: number;
  stone: string;
  meaning: string;
  properties: string[];
}

// --- Compatibility ---
export interface CompatibilityScore {
  love: number;
  marriage: number;
  friendship: number;
  business: number;
  communication: number;
  spiritual: number;
  family: number;
  risingSign: number;
  elementHarmony: number;
}

export type CosmicBondType = "soulmate" | "karmic" | "companion" | "mentor" | "catalyst";

export interface CompatibilityResult {
  profileA: string;
  profileB: string;
  scores: CompatibilityScore;
  strengths: string[];
  weaknesses: string[];
  advice: string[];
  growthAreas: string[];
  cosmicBondType: CosmicBondType;
  specificAdvice: string[];
}

// --- Forecast ---
export type ForecastPeriod = "daily" | "weekly" | "monthly" | "yearly";

export interface Forecast {
  period: ForecastPeriod;
  date: string;
  love: string;
  career: string;
  health: string;
  finance: string;
  energy: number;
  spiritual: string;
  travel: string;
  education: string;
}

// --- Daily Message ---
export interface DailyMessage {
  date: string;
  energyScore: number;
  affirmation: string;
  guidance: string;
  theme: string;
  focus: string;
  mantra: string;
}

// --- Energy Score ---
export interface EnergyScore {
  overall: number;
  career: "high" | "moderate" | "low";
  love: "high" | "moderate" | "low";
  finance: "high" | "moderate" | "low";
  health: "high" | "moderate" | "low";
  spiritual: "high" | "moderate" | "low";
  lunarInfluence: string;
  planetaryRuler: string;
}

// --- Cosmic Blueprint ---
export interface ElementBalance {
  fire: number;
  earth: number;
  air: number;
  water: number;
}

export interface CosmicBlueprint {
  profileId: string;
  sunSign: ZodiacSign;
  moonSign: ZodiacSign;
  risingSign: ZodiacSign;
  chineseZodiac: ChineseZodiacAnimal;
  chineseElement: ChineseElement;
  lifePathNumber: number;
  destinyNumber: number;
  soulNumber: number;
  personalityNumber: number;
  birthstone: string;
  spiritAnimal: string;
  dominantPlanet: PlanetName;
  luckyNumber: number;
  luckyColor: string;
  luckyDay: string;
  luckyDirection: string;
  energyScore: EnergyScore;
  birthMoonPhase: MoonPhase;
  elementBalance: ElementBalance;
  birthDaySignificance: string;
  chineseElementModifier: string;
}

// --- Journal ---
export type JournalCategory =
  | "dream"
  | "manifestation"
  | "goal"
  | "meditation"
  | "tarot"
  | "life-event"
  | "general";

export interface JournalEntry {
  id: string;
  profileId: string;
  title: string;
  content: string;
  category: JournalCategory;
  tags: string[];
  date: string;
  mood?: string;
}

// --- Sacred Geometry ---
export interface SacredGeometry {
  name: string;
  description: string;
  meaning: string;
  meditationUse: string;
}

// --- Life Cycles ---
export interface LifeCycle {
  currentCycle: string;
  currentDescription: string;
  growthCycle: string;
  growthDescription: string;
  destinyCycle: string;
  destinyDescription: string;
  forecasts: {
    love: string;
    wealth: string;
    health: string;
    opportunities: string;
  };
}

// --- Brands ---
export type BrandCategory =
  | "technology"
  | "automotive"
  | "fashion"
  | "food-beverage"
  | "beauty"
  | "luxury"
  | "entertainment"
  | "sports"
  | "finance"
  | "travel-hospitality"
  | "retail"
  | "health-fitness";

export interface BrandNumerology {
  brandNumber: number;
  expression: string;
  strengths: string[];
  challenges: string[];
}

export interface BrandAstrology {
  zodiacSign: ZodiacSign;
  rulingPlanet: PlanetName;
  element: ZodiacElement;
  compatibleSigns: ZodiacSign[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  category: BrandCategory;
  description: string;
  tagline: string;
  logo: string;
  foundedYear: number;
  founder: string;
  numerology: BrandNumerology;
  astrology: BrandAstrology;
  keywords: string[];
  luckyColors: string[];
  luckyNumbers: number[];
  energy: string;
}

// --- Birth Chart ---
export type AspectType = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
export type HouseSystem = 'placidus' | 'whole-sign';

export interface PlanetaryPosition {
  planet: PlanetName;
  sign: ZodiacSign;
  degree: number;
  house: number;
  retrograde: boolean;
}

export interface ChartAspect {
  planet1: PlanetName;
  planet2: PlanetName;
  type: AspectType;
  degree: number;
  orb: number;
  applying: boolean;
}

export interface HouseCusp {
  house: number;
  sign: ZodiacSign;
  degree: number;
}

export interface BirthChart {
  profileId: string;
  planetaryPositions: PlanetaryPosition[];
  aspects: ChartAspect[];
  houses: HouseCusp[];
  ascendant: ZodiacSign;
  midheaven: ZodiacSign;
  elementDistribution: Record<ZodiacElement, number>;
  modalityDistribution: Record<ZodiacQuality, number>;
  dominantPlanet: PlanetName;
  chartRuler: PlanetName;
}

// --- Transits ---
export interface TransitEntry {
  planet: PlanetName;
  currentSign: ZodiacSign;
  currentDegree: number;
  retrograde: boolean;
  natalSign: ZodiacSign;
  natalHouse: number;
  transitHouse: number;
  aspectToNatal: AspectType | null;
  interpretation: string;
}

export interface TransitReport {
  profileId: string;
  date: string;
  transits: TransitEntry[];
  significantTransits: TransitEntry[];
  overallTheme: string;
  advice: string[];
}

// --- Offline AI Insights ---
export type InsightCategory = 'pattern' | 'karmic' | 'growth' | 'predictive' | 'relationship' | 'elemental';

export interface LifePattern {
  type: string;
  title: string;
  description: string;
  ageRange: string;
  recurring: boolean;
  guidance: string;
}

export interface KarmicLesson {
  number: number;
  title: string;
  description: string;
  pastLifeTheme: string;
  currentLifeTask: string;
  resolution: string;
}

export interface CosmicInsight {
  id: string;
  category: InsightCategory;
  title: string;
  summary: string;
  detail: string;
  confidence: number;
  relatedModules: string[];
  actionable: boolean;
  action?: string;
}

export interface CosmicInsightReport {
  profileId: string;
  generatedAt: string;
  patterns: LifePattern[];
  karmicLessons: KarmicLesson[];
  insights: CosmicInsight[];
  elementalAdvice: string[];
  predictiveOutlook: string;
  relationshipPatterns: string[];
  growthRecommendations: string[];
}

// --- Notifications ---
export type NotificationType =
  | 'daily-energy'
  | 'moon-phase'
  | 'personal-cycle'
  | 'transit-alert'
  | 'manifestation-window'
  | 'birthday';

export interface NotificationPreference {
  id: string;
  profileId: string;
  type: NotificationType;
  enabled: boolean;
  time: string;
  days: number[];
}

export interface NotificationContent {
  id: string;
  profileId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, string>;
  scheduledDate: string;
  read: boolean;
  createdAt: string;
}

// --- Widgets ---
export type WidgetType =
  | 'energy'
  | 'moon'
  | 'forecast'
  | 'angel'
  | 'numerology'
  | 'chinese-zodiac'
  | 'daily-message'
  | 'transit';

export interface WidgetConfig {
  type: WidgetType;
  enabled: boolean;
  order: number;
}

export interface WidgetData {
  type: WidgetType;
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  color: string;
  data?: Record<string, string>;
}

// --- Sharing ---
export type ShareCardType = 'blueprint' | 'forecast' | 'numerology' | 'compatibility' | 'daily';

export interface ShareCardConfig {
  type: ShareCardType;
  profileId: string;
  secondProfileId?: string;
  template: 'cosmic' | 'minimal' | 'mystic';
}

// --- App Settings ---
export interface AppSettings {
  theme: CosmicTheme;
  defaultProfileId: string | null;
  notifications: boolean;
  haptics: boolean;
  soundEffects: boolean;
  onboardingComplete: boolean;
}

export type CosmicTheme =
  | "midnight"
  | "galaxy"
  | "nebula"
  | "solar"
  | "golden-mystic"
  | "emerald"
  | "cosmic-purple"
  | "rose-gold"
  | "arctic"
  | "sunset"
  | "ocean"
  | "crimson"
  | "lavender"
  | "obsidian"
  | "aurora";

// --- Navigation ---
export type CosmicModule =
  | "home"
  | "blueprint"
  | "numerology"
  | "astrology"
  | "compatibility"
  | "tarot"
  | "angel-numbers"
  | "dreams"
  | "chakras"
  | "spirit-animals"
  | "forecast"
  | "letterology"
  | "moon-calendar"
  | "journal"
  | "profile"
  | "settings"
  | "search"
  | "onboarding"
  | "enemy-years"
  | "planet-influence"
  | "element-balance"
  | "life-cycles"
  | "sacred-geometry"
  | "reports"

  | "widgets"
  | "analytics"
  | "brands"
  | "birth-chart"
  | "transits"
  | "share"
  | "insights"
  | "notifications"
  | "favorites"
  | "backup";
