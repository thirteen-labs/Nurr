import type { Forecast, ForecastPeriod, EnergyScore, DailyMessage, ZodiacSign, MoonPhase, ChineseZodiacAnimal } from "@/types/cosmic";
import { calculatePersonalYear, calculatePersonalMonth, calculatePersonalDay } from "./numerology";
import { calculateSunSign } from "./zodiac";
import { calculateChineseZodiac } from "./chineseZodiac";
import { getMoonPhase } from "./lunarPhase";
import { getZodiacElement } from "./sunSign";

// ============================================================
// HELPERS
// ============================================================

function generateDateString(period: ForecastPeriod): string {
  const now = new Date();
  switch (period) {
    case "daily":
      return now.toISOString().split("T")[0];
    case "weekly": {
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return `${now.toISOString().split("T")[0]}_${weekEnd.toISOString().split("T")[0]}`;
    }
    case "monthly":
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    case "yearly":
      return String(now.getFullYear());
  }
}

function pick<T>(arr: T[], seed: number): T {
  return arr[((seed % arr.length) + arr.length) % arr.length];
}

// ============================================================
// PLANETARY DAY RULER
// ============================================================

const PLANETARY_DAYS: { day: number; planet: string; modifier: number; theme: string }[] = [
  { day: 0, planet: "Sun", modifier: 8, theme: "visibility and leadership" },
  { day: 1, planet: "Moon", modifier: 3, theme: "emotions and intuition" },
  { day: 2, planet: "Mars", modifier: 7, theme: "action and courage" },
  { day: 3, planet: "Mercury", modifier: 5, theme: "communication and learning" },
  { day: 4, planet: "Jupiter", modifier: 10, theme: "expansion and abundance" },
  { day: 5, planet: "Venus", modifier: 6, theme: "love and beauty" },
  { day: 6, planet: "Saturn", modifier: -3, theme: "discipline and structure" },
];

function getPlanetaryDayRuler(date: Date = new Date()): { planet: string; modifier: number; theme: string } {
  return PLANETARY_DAYS[date.getDay()];
}

// ============================================================
// LUNAR PHASE INFLUENCE
// ============================================================

const LUNAR_MODIFIERS: Record<MoonPhase, { energyMod: number; theme: string; description: string }> = {
  "new-moon": { energyMod: -10, theme: "New Beginnings", description: "The new moon invites fresh starts and inner reflection. Seeds planted now grow with intention." },
  "waxing-crescent": { energyMod: 3, theme: "Emerging Growth", description: "The crescent moon supports early-stage plans and building momentum toward your goals." },
  "first-quarter": { energyMod: 5, theme: "Decisive Action", description: "The first quarter challenges you to overcome obstacles with determination and clarity." },
  "waxing-gibbous": { energyMod: 8, theme: "Refinement", description: "The gibbous moon favors fine-tuning plans and preparing for the culmination ahead." },
  "full-moon": { energyMod: 15, theme: "Illumination & Culmination", description: "The full moon amplifies everything — emotions run high, revelations surface, and projects reach their peak." },
  "waning-gibbous": { energyMod: 4, theme: "Gratitude & Sharing", description: "The waning gibbous supports sharing wisdom, teaching, and harvesting the rewards of your efforts." },
  "last-quarter": { energyMod: -5, theme: "Release & Forgiveness", description: "The last quarter asks you to let go of what no longer serves and make space for renewal." },
  "waning-crescent": { energyMod: -8, theme: "Surrender & Rest", description: "The dark moon period favors deep rest, surrender, and trusting the cycle before it begins anew." },
};

function getLunarModifier(phase: MoonPhase): { energyMod: number; theme: string; description: string } {
  return LUNAR_MODIFIERS[phase];
}

// ============================================================
// SPIRITUAL, TRAVEL, EDUCATION — Per Sun Sign
// ============================================================

const SPIRITUAL_FORECASTS: Record<ZodiacSign, string[]> = {
  aries: ["Your warrior spirit is called to defend a cause you believe in", "Courageous spiritual leaps bring breakthrough growth"],
  taurus: ["Sacred sensuality connects you to the divine — music, art, nature", "Patience in spiritual practice reveals hidden wisdom"],
  gemini: ["Spiritual communication opens — journal your intuitive downloads", "Teaching or sharing your spiritual insights accelerates your path"],
  cancer: ["Dreams carry spiritual messages — keep a journal by your bed", "Emotional healing rituals bring profound inner peace"],
  leo: ["Creative expression IS your spiritual practice — paint, sing, dance", "Your radiant spirit lifts collective consciousness wherever you go"],
  virgo: ["Service to others is your highest spiritual expression today", "Mindful attention to daily rituals transforms the mundane into sacred"],
  libra: ["Harmony and beauty are your spiritual gateways — visit sacred spaces", "Relationships become mirrors for spiritual growth and self-reflection"],
  scorpio: ["Deep psychological work and shadow integration accelerate your evolution", "Transformation requires releasing who you were to become who you are"],
  sagittarius: ["Philosophical exploration expands your spiritual horizons — read, travel, question", "Teaching wisdom you've gained naturally elevates both you and your students"],
  capricorn: ["Discipline in spiritual practice builds lasting inner authority", "Mentorship — receiving or giving — deepens your understanding of the path"],
  aquarius: ["Innovative spiritual practices suit your progressive nature — experiment", "Group meditation or collective rituals amplify your individual practice"],
  pisces: ["Your natural psychic sensitivity is heightened — trust the visions you receive", "Compassion and service dissolve ego boundaries, connecting you to the divine"],
};

const TRAVEL_FORECASTS: Record<ZodiacSign, string[]> = {
  aries: ["Adventure travel calls — hiking, exploring, and spontaneous road trips energize you", "A bold trip decision made now leads to unforgettable experiences"],
  taurus: ["Luxury travel to scenic destinations nourishes your soul — vineyards, resorts, nature retreats", "Slow, immersive travel experiences bring deeper satisfaction than rushing"],
  gemini: ["City hopping and cultural exploration suit your curious nature — museums, cafés, bookstores", "Travel with a companion who shares your intellectual interests"],
  cancer: ["Nostalgic destinations or family trips create meaningful memories", "Beach or lakeside retreats restore your emotional equilibrium"],
  leo: ["Destinations where you can shine — galas, resorts, cultural events — suit you", "Travel with an audience or group where your charisma naturally emerges"],
  virgo: ["Wellness retreats or nature escapes with structured itineraries satisfy your need for order", "Research your destination thoroughly for the most rewarding experience"],
  libra: ["Romantic or aesthetically beautiful destinations call to you — Paris, gardens, galleries", "Shared travel experiences with a partner deepen your connection"],
  scorpio: ["Mysterious or intense destinations — ancient ruins, deep dives, transformational retreats", "Solitary travel or deep exploration of hidden places feeds your soul"],
  sagittarius: ["International travel and philosophical pilgrimages expand your worldview", "The farther and more exotic, the better — your restless spirit needs horizons"],
  capricorn: ["Strategic travel that combines business and pleasure maximizes your time", "Historical or heritage destinations connect you to enduring legacies"],
  aquarius: ["Unconventional travel — eco-tourism, tech conferences, cultural immersion — excites you", "Group travel with like-minded innovators sparks new ideas"],
  pisces: ["Spiritual pilgrimages or artistic retreats feed your soul deeply", "Water destinations — oceans, rivers, hot springs — restore your energy"],
};

const EDUCATION_FORECASTS: Record<ZodiacSign, string[]> = {
  aries: ["Competitive learning environments bring out your best — debates, challenges, quizzes", "Taking the lead on a group project showcases your natural ability"],
  taurus: ["Hands-on, practical learning sticks best — workshops, labs, field work", "Patience with complex material rewards you with deep, lasting understanding"],
  gemini: ["Diverse subjects and multitasking study approaches keep you engaged", "Writing and communication courses align perfectly with your learning style"],
  cancer: ["Emotional connection to the material enhances retention — study what moves you", "Teaching or mentoring others reinforces your own understanding"],
  leo: ["Performing arts, public speaking, or creative courses ignite your passion", "Recognition for your learning achievements fuels your motivation"],
  virgo: ["Detailed, systematic study methods yield the best results for you", "Health, science, or analytical subjects suit your precise mind"],
  libra: ["Philosophy, law, art history, or design courses appeal to your sense of beauty and justice", "Debate and discussion-based learning activates your sharpest thinking"],
  scorpio: ["Research-intensive or investigative study feeds your need for depth", "Psychology, detective work, or financial analysis suit your penetrating mind"],
  sagittarius: ["International studies, philosophy, or theology expand your already broad worldview", "Online courses or travel-based learning suit your freedom-loving nature"],
  capricorn: ["Strategic, career-focused education investments pay the highest dividends", "Mentorship or apprenticeship learning methods suit your disciplined approach"],
  aquarius: ["Technology, innovation, or humanitarian studies align with your progressive values", "Collaborative or online group learning environments spark your best ideas"],
  pisces: ["Artistic, spiritual, or healing arts education nurtures your soul", "Intuitive and creative learning methods work better than rigid structures"],
};

// ============================================================
// CHINESE ZODIAC YEAR INFLUENCE
// ============================================================

const CHINESE_YEAR_INFLUENCE: Record<ChineseZodiacAnimal, { modifier: number; advice: string }> = {
  rat: { modifier: 3, advice: "The Rat year favors clever strategies and resourcefulness — networking opens unexpected doors" },
  ox: { modifier: 2, advice: "The Ox year rewards patience and hard work — steady progress outlasts flashy starts" },
  tiger: { modifier: 5, advice: "The Tiger year charges with bold energy — courage and risk-taking are rewarded now" },
  rabbit: { modifier: 4, advice: "The Rabbit year favors diplomacy and elegance — gentleness achieves what force cannot" },
  dragon: { modifier: 7, advice: "The Dragon year amplifies ambition and charisma — dream bigger than you think possible" },
  snake: { modifier: 3, advice: "The Snake year rewards wisdom and strategy — careful planning outpaces impulsive action" },
  horse: { modifier: 5, advice: "The Horse year gallops with freedom energy — adventure and independence drive success" },
  goat: { modifier: 2, advice: "The Goat year nurtures creativity and compassion — artistic endeavors flourish" },
  monkey: { modifier: 6, advice: "The Monkey year sparks ingenuity — adaptable thinking and humor solve complex problems" },
  rooster: { modifier: 4, advice: "The Rooster year demands precision and honesty — attention to detail separates the good from great" },
  dog: { modifier: 3, advice: "The Dog year strengthens loyalty and service — community and relationships are your wealth" },
  pig: { modifier: 4, advice: "The Pig year basks in generosity and abundance — sharing wealth multiplies it" },
};

// ============================================================
// SUN SIGN PERSONALITY MODIFIERS
// ============================================================

const SIGN_FORTUNE: Record<ZodiacSign, number> = {
  aries: 5, taurus: 3, gemini: 4, cancer: 3, leo: 6, virgo: 2,
  libra: 4, scorpio: 5, sagittarius: 6, capricorn: 3, aquarius: 5, pisces: 4,
};

// ============================================================
// DETAILED FORECAST MESSAGE POOLS
// ============================================================

const LOVE_FORECASTS: Record<string, string[]> = {
  "1": [
    "New romantic opportunities arise — lead with confidence and authenticity",
    "Passion is high — express your desires openly and boldly",
    "A bold gesture will deepen your connection — take the initiative",
    "Your magnetic energy attracts a powerful new connection",
    "Independence and passion create the most exciting romantic dynamic right now",
  ],
  "2": [
    "Harmony and partnership are favored — listen deeply to your partner",
    "Patience in love brings profound rewards — let things unfold naturally",
    "A peaceful resolution to an old conflict restores balance",
    "Emotional attunement with your partner reaches new depths",
    "Cooperation and gentleness are your greatest romantic strengths now",
  ],
  "3": [
    "Social connections bring unexpected romantic joy — say yes to invitations",
    "Creativity in love expressions will be richly rewarded",
    "Playful energy and humor strengthen your romantic bonds",
    "Express your feelings through words, art, or shared laughter",
    "Joy is your love language right now — share it generously",
  ],
  "4": [
    "Stability in relationships brings deep comfort and security",
    "Building a solid foundation for lasting love is your priority now",
    "Commitment and loyalty create unshakeable bonds",
    "Practical expressions of love — acts of service — mean the most",
    "Home and family become the heart of your romantic world",
  ],
  "5": [
    "Adventure awaits in your love life — say yes to spontaneity",
    "New experiences together will strengthen your bond in surprising ways",
    "Embrace change and freedom within your relationship",
    "Travel or exploration with your partner reignites the flame",
    "A surprising romantic twist brings excitement and renewal",
  ],
  "6": [
    "Family and home take center stage in your love life",
    "Nurturing your relationships with care and devotion deepens trust",
    "Creating beauty and harmony in shared spaces brings romantic fulfillment",
    "Healing family patterns opens new doors for romantic growth",
    "Your devoted heart is your greatest romantic asset",
  ],
  "7": [
    "Deep spiritual connection with your partner grows through shared silence",
    "Time alone clarifies your heart's true desires — trust the inner knowing",
    "Intuition guides your love life — follow what you sense, not what you see",
    "A soulful conversation reveals hidden depths in your relationship",
    "Spiritual practices together create unbreakable romantic bonds",
  ],
  "8": [
    "Passion and power dynamics are highlighted — embrace your intensity",
    "Shared goals and ambitions strengthen your partnership profoundly",
    "Balance ambition with tenderness for the most fulfilling results",
    "Financial collaboration with your partner opens new possibilities",
    "Your natural authority in love inspires deep respect and devotion",
  ],
  "9": [
    "Compassionate love brings healing to you and your partner",
    "Letting go of past hurts creates space for deeper connection",
    "Universal love flows through all your relationships — embrace it",
    "Forgiveness is the key that unlocks your heart's full capacity",
    "Your generous spirit attracts equally generous love",
  ],
};

const CAREER_FORECASTS: Record<string, string[]> = {
  "1": [
    "Step into leadership — your initiative is urgently needed now",
    "New projects launch successfully under your pioneering energy",
    "Your ambition drives extraordinary results — set audacious goals",
    "A bold career move opens a door you've been eyeing for months",
    "Independent work yields the greatest breakthroughs right now",
  ],
  "2": [
    "Collaboration is the key to your biggest success this period",
    "Diplomacy and tact open doors that force cannot",
    "Support from colleagues strengthens your position significantly",
    "A partnership opportunity requires your patient, diplomatic touch",
    "Team achievements bring you greater recognition than solo victories",
  ],
  "3": [
    "Creative ideas bring recognition and advancement — share them boldly",
    "Communication skills shine in presentations and negotiations",
    "Networking leads to transformative career opportunities",
    "Your creative vision inspires others and drives project success",
    "Writing, speaking, or teaching roles bring unexpected advancement",
  ],
  "4": [
    "Hard work pays off with tangible, measurable results",
    "Building systematic processes creates long-term career security",
    "Discipline is your greatest professional asset right now",
    "A methodical approach to a complex problem impresses superiors",
    "Structural improvements you implement now save time for years",
  ],
  "5": [
    "Embrace change — a transformative new direction appears",
    "Adaptability leads to rapid career advancement",
    "Calculated risks are strongly favored — trust your instincts",
    "A career pivot or lateral move opens unexpected vertical opportunities",
    "Versatility becomes your most marketable skill this period",
  ],
  "6": [
    "Service-oriented work elevates your reputation and career trajectory",
    "Team harmony and morale boost your collective productivity",
    "Mentorship roles emerge — guiding others elevates your own standing",
    "Creating harmony in your workplace brings professional recognition",
    "Your reliability and dedication earn you increased responsibility",
  ],
  "7": [
    "Deep, focused work yields breakthrough discoveries",
    "Research and analysis lead to career-defining insights",
    "Your expertise and specialized knowledge are in high demand",
    "Solitary work on complex problems produces your best professional成果",
    "Strategic planning and long-term vision set you apart from competitors",
  ],
  "8": [
    "Financial success and authority expand significantly",
    "Leadership roles multiply your influence and impact",
    "Strategic decisions made now pay dividends for years",
    "Your natural executive abilities earn you a major opportunity",
    "Business partnerships or deals formed now are exceptionally favorable",
  ],
  "9": [
    "Completion of a major career cycle brings clarity and renewal",
    "Humanitarian or service-oriented work enhances your reputation",
    "A new vision emerges from the wisdom of past experience",
    "Mentoring the next generation brings unexpected professional rewards",
    "Letting go of an old role creates space for your highest calling",
  ],
};

const HEALTH_FORECASTS: Record<string, string[]> = {
  "1": [
    "High physical energy — channel it into vigorous exercise",
    "Start new health routines with maximum vigor and enthusiasm",
    "Your vitality is contagious — inspire others with your active choices",
    "A new fitness challenge or sport reignites your passion for movement",
    "Leadership in group fitness or team sports amplifies your motivation",
  ],
  "2": [
    "Gentle movement — yoga, walking, stretching — supports deep well-being",
    "Balance rest and activity for optimal health results",
    "Social connection reduces stress and boosts your immune system",
    "Partner or group exercise brings both accountability and joy",
    "Emotional balance is the foundation of your physical health right now",
  ],
  "3": [
    "Creative movement — dance, martial arts, art therapy — brings joy to fitness",
    "Social activities and laughter boost your mental health profoundly",
    "Expressing emotions through movement prevents stagnation and disease",
    "Variety in your wellness routine keeps motivation high",
    "Play is medicine — make time for activities purely for fun",
  ],
  "4": [
    "Consistent daily routines build lasting, sustainable health",
    "Focus on nutrition, sleep hygiene, and structured self-care",
    "Discipline in health habits pays compounding returns",
    "Meal planning and preparation support your wellness goals",
    "Regular check-ups and preventive care are especially favored now",
  ],
  "5": [
    "Variety in exercise keeps you engaged and prevents boredom",
    "Adventure sports or outdoor activities energize your body and spirit",
    "Travel or new environments boost your physical vitality",
    "Watch for overactivity — balance excitement with adequate recovery",
    "Trying new wellness modalities — cold plunge, sauna, float — refreshes your system",
  ],
  "6": [
    "Nurturing your body with wholesome, homemade food is deeply healing",
    "Family activities that involve movement — walks, games, gardening — restore you",
    "Self-care is not selfish — it is essential for your continued giving",
    "Creating a beautiful, healthy home environment supports all areas of wellness",
    "Caring for others inspires you to model healthy habits",
  ],
  "7": [
    "Rest and recovery are essential — honor your body's need for stillness",
    "Mind-body practices — meditation, breathwork, tai chi — deepen wellness",
    "Quiet reflection restores energy that constant activity depletes",
    "Solitary nature walks or forest bathing heal on every level",
    "Quality of rest matters more than quantity — optimize your sleep environment",
  ],
  "8": [
    "Intense, disciplined workouts build impressive physical strength",
    "Your body responds powerfully to structured fitness programs",
    "Pushing physical boundaries — in a healthy way — reveals hidden potential",
    "Listen to your body's signals — intensity must be balanced with wisdom",
    "Recovery days are when your body actually transforms — respect them",
  ],
  "9": [
    "Holistic health approaches — combining mind, body, and spirit — benefit you most",
    "Releasing old health patterns and beliefs creates space for renewal",
    "Compassion toward your body transforms your relationship with wellness",
    "Energy healing, acupuncture, or reiki complement your physical health routine",
    "Service to others' health needs elevates your own wellness consciousness",
  ],
};

const FINANCE_FORECASTS: Record<string, string[]> = {
  "1": [
    "New income streams open up — your initiative creates financial opportunity",
    "Bold financial moves made with confidence pay off well",
    "Leadership and visibility bring financial rewards and recognition",
    "An entrepreneurial venture or side project shows strong financial promise",
    "Your ability to spot opportunities before others gives you a financial edge",
  ],
  "2": [
    "Partnerships and collaborations strengthen your financial position",
    "Steady, patient growth through collaboration outperforms solo efforts",
    "Shared financial goals with a partner create greater abundance",
    "A cooperative financial venture yields reliable, steady returns",
    "Diplomatic negotiations secure better financial terms",
  ],
  "3": [
    "Creative ventures generate unexpected income and opportunities",
    "Communication skills — writing, speaking, teaching — attract financial abundance",
    "Social connections lead directly to profitable opportunities",
    "Your creative talents are more marketable than you realize — monetize them",
    "Multiple small income streams combine into significant wealth",
  ],
  "4": [
    "Financial stability through disciplined saving and budgeting",
    "Long-term investments grow steadily under your patient stewardship",
    "Creating financial systems and structure brings lasting security",
    "A methodical approach to debt reduction accelerates your freedom",
    "Real estate or tangible assets are especially favored investments now",
  ],
  "5": [
    "Unexpected financial opportunities arise from diverse sources",
    "Smart, calculated risks increase your wealth meaningfully",
    "Diversification protects your assets while opening new growth channels",
    "A financial change — new job, raise, or venture — shifts your trajectory",
    "Flexibility in financial planning allows you to capitalize on surprises",
  ],
  "6": [
    "Financial harmony in your family environment supports abundance",
    "Family investments and shared financial goals pay rich dividends",
    "Generosity and giving attract unexpected financial returns",
    "Home-related financial decisions — renovation, purchase, investment — are favored",
    "Your sense of financial responsibility inspires trust and partnership",
  ],
  "7": [
    "Financial wisdom through research and careful analysis",
    "Intuitive investment decisions perform surprisingly well — trust your insights",
    "A period of financial reflection reveals your true values and priorities",
    "Quiet, strategic financial planning outperforms reactive decision-making",
    "Spiritual or educational investments yield long-term returns beyond money",
  ],
  "8": [
    "Financial power and authority expand dramatically",
    "Major financial transactions are strongly favored — sign, invest, acquire",
    "Strategic investments multiply your wealth at an accelerated rate",
    "Your natural financial acumen earns you a significant opportunity",
    "Business deals and partnerships formed now create lasting financial empire",
  ],
  "9": [
    "Financial cycles complete and renew — endings make space for abundance",
    "Philanthropy and generous giving attract unexpected financial returns",
    "Letting go of scarcity mindset opens the floodgates of prosperity",
    "A financial chapter closes gracefully, preparing you for greater abundance",
    "Using your financial resources to serve others elevates your entire financial picture",
  ],
};

// ============================================================
// AFFIRMATIONS, THEMES, FOCUS, MANTRAS — Enhanced
// ============================================================

const AFFIRMATIONS_BY_SCORE: Record<string, string[]> = {
  high: [
    "The universe amplifies your power today — step boldly into your greatness",
    "Cosmic energies align in your favor — trust the momentum you feel",
    "Today carries a high vibration — your intentions manifest with ease",
    "Stars radiate strength for you — embrace the confidence flowing through you",
    "A powerful cosmic current carries you forward — ride it with faith",
    "Your inner light blazes bright — the world responds to your radiance",
  ],
  moderate: [
    "Balance guides your day — steady energy supports meaningful progress",
    "The cosmos offers gentle support — consistent effort brings results",
    "Today's energy flows at an even pace — perfect for steady advancement",
    "Harmonious vibrations surround you — build on the stability you feel",
    "Moderate skies hold steady — keep moving with calm determination",
    "The rhythm of today favors patience over urgency — trust the timing",
  ],
  low: [
    "Today is a gentle tide — rest, reflect, and honor your rhythms",
    "Low energy days are sacred — the cosmos asks you to slow down",
    "Soft energies invite inward focus — nurture yourself without guilt",
    "The stars suggest stillness today — restoration powers tomorrow's rise",
    "A quiet day carries hidden gifts — listen closely to your inner voice",
    "The universe pauses with you — there is wisdom in the waiting",
  ],
};

const THEMES_BY_SCORE: Record<string, string[]> = {
  high: ["Ignition", "Ascension", "Radiance", "Breakthrough", "Alignment", "Amplification"],
  moderate: ["Harmony", "Growth", "Foundation", "Flow", "Balance", "Cultivation"],
  low: ["Restoration", "Reflection", "Stillness", "Cocooning", "Surrender", "Integration"],
};

const FOCUS_AREAS: Record<string, string[]> = {
  high: [
    "Lead with courage and take inspired action on what matters most",
    "Share your light — your presence elevates everyone around you",
    "Now is the time to launch what you've been planning — the energy supports it",
    "Trust your instincts — they are razor-sharp today",
    "Amplify your vision and speak it into existence with conviction",
    "Your boldness creates ripples — act decisively and watch transformation unfold",
  ],
  moderate: [
    "Consistency over intensity — small steps compound into remarkable results",
    "Strengthen your foundations with patient, deliberate effort",
    "Balance action with reflection for optimal flow and progress",
    "Build bridges — connections made today will serve you for years",
    "Tend to what's growing with steady, loving attention",
    "Progress happens in the quiet moments — honor your pace",
  ],
  low: [
    "Prioritize rest and deep nourishment of body, mind, and soul",
    "Release the need to produce — your being is enough",
    "Turn inward for the answers you seek — they are already within you",
    "Gentle movement and quiet contemplation restore your deepest reserves",
    "Forgive yourself for any perceived slowness — the universe moves in cycles",
    "Stillness is not stagnation — it is the soil where new growth takes root",
  ],
};

const MANTRA_BY_ENERGY: Record<string, string[]> = {
  high: [
    "I am a vessel of cosmic power and purpose",
    "Today I shine without apology or limitation",
    "The universe moves through me with unstoppable force",
    "I am aligned with the highest frequencies of creation",
    "My energy creates my reality — I choose abundance",
  ],
  moderate: [
    "I am exactly where I need to be on my journey",
    "Balance is my natural and most powerful state",
    "I trust the perfect pace of my soul's unfolding",
    "Each step forward, no matter how small, is a victory",
    "I flow with the rhythm of the cosmos in perfect harmony",
  ],
  low: [
    "Stillness is also sacred and profoundly productive",
    "I honor my deep need to restore and renew",
    "Rest is my divine right, not a reward to earn",
    "The quiet times teach me what the loud times cannot",
    "I surrender to the process and trust what is unfolding",
  ],
};

const GUIDANCE_BY_PERSONAL_YEAR: Record<string, string[]> = {
  "1": [
    "New beginnings charge your energy — plant seeds with intention and courage",
    "Your leadership energy is called upon — step forward with confidence",
    "A fresh cycle begins — what you initiate now shapes the next nine years",
  ],
  "2": [
    "Partnership energy softens the day — seek meaningful connection",
    "Collaboration brings unexpected peace and progress today",
    "Patience and cooperation are your superpowers in this cycle",
  ],
  "3": [
    "Creative expression fuels your spirit — share your unique voice",
    "Joy finds you when you embrace your playful, expressive side",
    "Communication and self-expression are your greatest tools now",
  ],
  "4": [
    "Discipline today builds tomorrow's freedom and security",
    "Structure supports you — lean into your routines with intention",
    "Hard work and practical efforts lay the groundwork for lasting success",
  ],
  "5": [
    "Adventure energy stirs — embrace healthy change and exploration",
    "Freedom calls — break one small pattern that no longer serves you",
    "Transformation is your theme — welcome the unexpected with open arms",
  ],
  "6": [
    "Love and service center your energy today — lead with your heart",
    "Nurturing others fills your own cup as well — give freely",
    "Family and home matters deserve your focused attention and care",
  ],
  "7": [
    "Wisdom seeks you in quiet moments — create space to receive it",
    "Trust your intuition — it speaks with unusual clarity and precision now",
    "Inner reflection yields outer breakthroughs — go within",
  ],
  "8": [
    "Power and abundance energy surrounds you — claim your rightful place",
    "You are building something significant — keep going with determination",
    "Financial and career opportunities accelerate under this influential energy",
  ],
  "9": [
    "Completion energy brings clarity, release, and profound wisdom",
    "Letting go creates sacred space for new blessings to enter",
    "A major cycle nears its end — honor what you've learned and release the rest",
  ],
};

// ============================================================
// MAIN GENERATORS
// ============================================================

export function generateForecast(
  birthDate: string,
  period: ForecastPeriod,
): Omit<Forecast, "period" | "date"> {
  const py = calculatePersonalYear(birthDate);
  const key = String(py);
  const now = new Date();
  const [, m, d] = birthDate.split('-').map(Number);
  const sunSign = calculateSunSign(m, d);

  const baseSeed = now.getFullYear() + now.getMonth() + now.getDate() + py + d;

  function pickFromPool(pool: string[], offset: number): string {
    return pick(pool, baseSeed + offset);
  }

  const lovePool = LOVE_FORECASTS[key] ?? LOVE_FORECASTS["1"];
  const careerPool = CAREER_FORECASTS[key] ?? CAREER_FORECASTS["1"];
  const healthPool = HEALTH_FORECASTS[key] ?? HEALTH_FORECASTS["1"];
  const financePool = FINANCE_FORECASTS[key] ?? FINANCE_FORECASTS["1"];
  const spiritualPool = SPIRITUAL_FORECASTS[sunSign];
  const travelPool = TRAVEL_FORECASTS[sunSign];
  const educationPool = EDUCATION_FORECASTS[sunSign];

  return {
    love: pickFromPool(lovePool, 0),
    career: pickFromPool(careerPool, 1),
    health: pickFromPool(healthPool, 2),
    finance: pickFromPool(financePool, 3),
    spiritual: pickFromPool(spiritualPool, 4),
    travel: pickFromPool(travelPool, 5),
    education: pickFromPool(educationPool, 6),
    energy: 0,
  };
}

export function getForecast(birthDate: string, period: ForecastPeriod): Forecast {
  const energy = calculateEnergyScore(birthDate);
  return {
    period,
    date: generateDateString(period),
    ...generateForecast(birthDate, period),
    energy: energy.overall,
  };
}

export function calculateEnergyScore(birthDate: string): EnergyScore {
  const py = calculatePersonalYear(birthDate);
  const pm = calculatePersonalMonth(birthDate);
  const pd = calculatePersonalDay(birthDate);
  const now = new Date();
  const [y, m, d] = birthDate.split('-').map(Number);
  const sunSign = calculateSunSign(m, d);
  const sunElement = getZodiacElement(sunSign);
  const moonPhase = getMoonPhase(now);
  const lunarMod = getLunarModifier(moonPhase);
  const planetaryDay = getPlanetaryDayRuler(now);
  const chineseAnimal = calculateChineseZodiac(y);
  const chineseInfluence = CHINESE_YEAR_INFLUENCE[chineseAnimal];
  const signFortune = SIGN_FORTUNE[sunSign] ?? 4;

  // Element harmony bonus: fire/air signs during day, earth/water at night
  const hour = now.getHours();
  const isDaytime = hour >= 6 && hour < 18;
  const elementTimeBonus =
    (isDaytime && (sunElement === 'fire' || sunElement === 'air')) ? 4 :
    (!isDaytime && (sunElement === 'earth' || sunElement === 'water')) ? 4 : 0;

  // Personal cycle modifier
  const personalCycleMod = ((pm + pd) % 3) * 3 - 3; // -3, 0, or +3

  // Base calculation with multiple factors
  const base = (
    py * 5 +
    pm * 2 +
    pd * 1 +
    lunarMod.energyMod +
    planetaryDay.modifier +
    chineseInfluence.modifier +
    signFortune +
    elementTimeBonus +
    personalCycleMod +
    now.getDate() * 2 +
    now.getMonth() * 3
  );

  const overall = Math.max(0, Math.min(100, Math.round(base % 101)));

  function level(v: number): "high" | "moderate" | "low" {
    if (v >= 66) return "high";
    if (v >= 33) return "moderate";
    return "low";
  }

  // Domain-specific modifiers using personal month and day for variation
  const careerBase = base + pm * 3 + 7;
  const loveBase = base + pd * 4 + 13;
  const financeBase = base + pm * 2 + pd * 2 + 23;
  const healthBase = base + py * 3 + 31;
  const spiritualBase = base + lunarMod.energyMod * 2 + 41;

  return {
    overall,
    career: level(Math.abs(careerBase) % 101),
    love: level(Math.abs(loveBase) % 101),
    finance: level(Math.abs(financeBase) % 101),
    health: level(Math.abs(healthBase) % 101),
    spiritual: level(Math.abs(spiritualBase) % 101),
    lunarInfluence: lunarMod.description,
    planetaryRuler: `${planetaryDay.planet} rules today — ${planetaryDay.theme}`,
  };
}

export function getDailyMessage(
  birthDate: string,
  name: string,
): DailyMessage {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const energy = calculateEnergyScore(birthDate);
  const py = calculatePersonalYear(birthDate);
  const [y, m, d] = birthDate.split("-").map(Number);
  const sunSign = calculateSunSign(m, d);
  const chineseAnimal = calculateChineseZodiac(y);
  const moonPhase = getMoonPhase(now);
  const lunarMod = getLunarModifier(moonPhase);
  const planetaryDay = getPlanetaryDayRuler(now);
  const sunElement = getZodiacElement(sunSign);

  const baseSeed = now.getFullYear() + now.getMonth() + now.getDate() + py + d;

  function pick(arr: string[], offset = 0): string {
    return pickFn(arr, baseSeed + offset);
  }

  function pickFn(arr: string[], seed: number): string {
    return arr[((seed % arr.length) + arr.length) % arr.length];
  }

  const band: "high" | "moderate" | "low" =
    energy.overall >= 66 ? "high"
    : energy.overall >= 33 ? "moderate"
    : "low";

  const affirmation = pick(AFFIRMATIONS_BY_SCORE[band]);
  const theme = pick(THEMES_BY_SCORE[band]);
  const focus = pick(FOCUS_AREAS[band], 1);
  const mantra = pick(MANTRA_BY_ENERGY[band], 2);

  const guidanceKey = String(py);
  const guidancePool = GUIDANCE_BY_PERSONAL_YEAR[guidanceKey] ?? GUIDANCE_BY_PERSONAL_YEAR["1"];
  const personalGuidance = guidancePool[(baseSeed + 3) % guidancePool.length];

  const guidance = `${personalGuidance}. As a ${capitalize(sunSign)} (${sunElement} sign) born in the ${capitalize(chineseAnimal)} year, today's energy (${energy.overall}/100) is shaped by the ${moonPhase.replace(/-/g, ' ')} (${lunarMod.theme}) and ruled by ${planetaryDay.planet} (${planetaryDay.theme}). Career feels ${energy.career}, love is ${energy.love}, finances are ${energy.finance}, and spiritual awareness is ${energy.spiritual}.`;

  return {
    date: dateStr,
    energyScore: energy.overall,
    affirmation,
    guidance,
    theme,
    focus,
    mantra,
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
