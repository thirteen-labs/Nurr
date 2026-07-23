import * as SQLite from 'expo-sqlite';
import type { Profile, JournalEntry, AppSettings, CosmicTheme } from '@/types/cosmic';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<void> {
  db = await SQLite.openDatabaseAsync('cosmic-oracle.db');
  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      birthDate TEXT NOT NULL,
      birthTime TEXT,
      birthLocation TEXT,
      notes TEXT,
      avatar TEXT,
      type TEXT NOT NULL DEFAULT 'self',
      createdAt TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY,
      profileId TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      tags TEXT NOT NULL DEFAULT '[]',
      date TEXT NOT NULL,
      mood TEXT,
      FOREIGN KEY (profileId) REFERENCES profiles(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS tarot_readings (
      id TEXT PRIMARY KEY,
      profileId TEXT NOT NULL,
      spread TEXT NOT NULL,
      cards TEXT NOT NULL,
      positions TEXT NOT NULL,
      date TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY (profileId) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS numerology_results (
      id TEXT PRIMARY KEY,
      profileId TEXT NOT NULL,
      lifePath INTEGER NOT NULL,
      destiny INTEGER NOT NULL,
      soulUrge INTEGER NOT NULL,
      personality INTEGER NOT NULL,
      birthday INTEGER NOT NULL,
      maturity INTEGER NOT NULL,
      challengeNumbers TEXT NOT NULL DEFAULT '[]',
      karmicDebt INTEGER,
      pinnacleCycles TEXT NOT NULL DEFAULT '[]',
      personalYear INTEGER NOT NULL,
      personalMonth INTEGER NOT NULL,
      personalDay INTEGER NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (profileId) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS zodiac_profiles (
      id TEXT PRIMARY KEY,
      profileId TEXT NOT NULL,
      sunSign TEXT NOT NULL,
      moonSign TEXT NOT NULL,
      risingSign TEXT NOT NULL,
      element TEXT NOT NULL,
      quality TEXT NOT NULL,
      rulingPlanet TEXT NOT NULL,
      birthChart TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (profileId) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS moon_signs (
      id TEXT PRIMARY KEY,
      profileId TEXT NOT NULL,
      sign TEXT NOT NULL,
      emotionalNature TEXT,
      hiddenFears TEXT,
      relationshipPatterns TEXT,
      emotionalStrengths TEXT NOT NULL DEFAULT '[]',
      intuition TEXT,
      subconscious TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (profileId) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sun_signs (
      id TEXT PRIMARY KEY,
      profileId TEXT NOT NULL,
      sign TEXT NOT NULL,
      purpose TEXT,
      ego TEXT,
      personality TEXT NOT NULL DEFAULT '[]',
      strengths TEXT NOT NULL DEFAULT '[]',
      challenges TEXT NOT NULL DEFAULT '[]',
      createdAt TEXT NOT NULL,
      FOREIGN KEY (profileId) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS rising_signs (
      id TEXT PRIMARY KEY,
      profileId TEXT NOT NULL,
      sign TEXT NOT NULL,
      firstImpressions TEXT,
      socialBehavior TEXT,
      appearanceTraits TEXT NOT NULL DEFAULT '[]',
      publicPersona TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (profileId) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS chinese_zodiac (
      id TEXT PRIMARY KEY,
      profileId TEXT NOT NULL,
      animal TEXT NOT NULL,
      element TEXT NOT NULL,
      personality TEXT NOT NULL DEFAULT '[]',
      compatibility TEXT NOT NULL DEFAULT '[]',
      enemy TEXT NOT NULL DEFAULT '[]',
      friends TEXT NOT NULL DEFAULT '[]',
      luckyNumbers TEXT NOT NULL DEFAULT '[]',
      luckyColors TEXT NOT NULL DEFAULT '[]',
      luckyDirections TEXT NOT NULL DEFAULT '[]',
      careerPaths TEXT NOT NULL DEFAULT '[]',
      traits TEXT,
      bestYears TEXT NOT NULL DEFAULT '[]',
      challengingYears TEXT NOT NULL DEFAULT '[]',
      createdAt TEXT NOT NULL,
      FOREIGN KEY (profileId) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS compatibility_reports (
      id TEXT PRIMARY KEY,
      profileAId TEXT NOT NULL,
      profileBId TEXT NOT NULL,
      love INTEGER NOT NULL,
      marriage INTEGER NOT NULL,
      friendship INTEGER NOT NULL,
      business INTEGER NOT NULL,
      communication INTEGER NOT NULL,
      spiritual INTEGER NOT NULL,
      family INTEGER NOT NULL,
      strengths TEXT NOT NULL DEFAULT '[]',
      weaknesses TEXT NOT NULL DEFAULT '[]',
      advice TEXT NOT NULL DEFAULT '[]',
      growthAreas TEXT NOT NULL DEFAULT '[]',
      createdAt TEXT NOT NULL,
      FOREIGN KEY (profileAId) REFERENCES profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (profileBId) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS angel_numbers (
      id TEXT PRIMARY KEY,
      profileId TEXT NOT NULL,
      number TEXT NOT NULL,
      meaning TEXT,
      message TEXT,
      affirmation TEXT,
      manifestationAdvice TEXT,
      warnings TEXT NOT NULL DEFAULT '[]',
      createdAt TEXT NOT NULL,
      FOREIGN KEY (profileId) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS dream_symbols (
      id TEXT PRIMARY KEY,
      symbol TEXT NOT NULL,
      category TEXT NOT NULL,
      traditionalMeaning TEXT,
      spiritualMeaning TEXT,
      psychologicalMeaning TEXT,
      advice TEXT
    );

    CREATE TABLE IF NOT EXISTS spirit_animals (
      id TEXT PRIMARY KEY,
      profileId TEXT NOT NULL,
      animal TEXT NOT NULL,
      traits TEXT NOT NULL DEFAULT '[]',
      lifeGuidance TEXT,
      strengths TEXT NOT NULL DEFAULT '[]',
      spiritualMessage TEXT,
      element TEXT,
      direction TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (profileId) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS chakra_data (
      id TEXT PRIMARY KEY,
      profileId TEXT NOT NULL,
      chakra TEXT NOT NULL,
      strength REAL NOT NULL DEFAULT 0.5,
      weaknesses TEXT NOT NULL DEFAULT '[]',
      balanceSuggestions TEXT NOT NULL DEFAULT '[]',
      meditationAdvice TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (profileId) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS forecasts (
      id TEXT PRIMARY KEY,
      profileId TEXT NOT NULL,
      period TEXT NOT NULL,
      date TEXT NOT NULL,
      love TEXT,
      career TEXT,
      health TEXT,
      finance TEXT,
      energy INTEGER,
      spiritual TEXT,
      travel TEXT,
      education TEXT,
      FOREIGN KEY (profileId) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      profileId TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      format TEXT NOT NULL DEFAULT 'json',
      createdAt TEXT NOT NULL,
      FOREIGN KEY (profileId) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS themes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      isActive INTEGER NOT NULL DEFAULT 0,
      colors TEXT NOT NULL DEFAULT '{}',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      profileId TEXT NOT NULL,
      itemType TEXT NOT NULL,
      itemId TEXT NOT NULL,
      label TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (profileId) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notification_preferences (
      id TEXT PRIMARY KEY,
      profileId TEXT NOT NULL,
      type TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      time TEXT NOT NULL DEFAULT '08:00',
      days TEXT NOT NULL DEFAULT '[0,1,2,3,4,5,6]',
      FOREIGN KEY (profileId) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notification_history (
      id TEXT PRIMARY KEY,
      profileId TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      data TEXT NOT NULL DEFAULT '{}',
      scheduledDate TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (profileId) REFERENCES profiles(id) ON DELETE CASCADE
    );
  `);
}

// --- Profiles ---

export async function getAllProfiles(): Promise<Profile[]> {
  if (!db) await initDatabase();
  const rows = await db!.getAllAsync<Profile>('SELECT * FROM profiles ORDER BY createdAt DESC');
  return rows;
}

export async function getProfileById(id: string): Promise<Profile | null> {
  if (!db) await initDatabase();
  const row = await db!.getFirstAsync<Profile>('SELECT * FROM profiles WHERE id = ?', id);
  return row ?? null;
}

export async function addProfile(profile: Profile): Promise<void> {
  if (!db) await initDatabase();
  await db!.runAsync(
    'INSERT INTO profiles (id, name, birthDate, birthTime, birthLocation, notes, avatar, type, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    profile.id,
    profile.name,
    profile.birthDate,
    profile.birthTime ?? null,
    profile.birthLocation ?? null,
    profile.notes ?? null,
    profile.avatar ?? null,
    profile.type,
    profile.createdAt
  );
}

export async function updateProfile(id: string, data: Partial<Profile>): Promise<void> {
  if (!db) await initDatabase();
  const fields: string[] = [];
  const values: any[] = [];
  
  if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
  if (data.birthDate !== undefined) { fields.push('birthDate = ?'); values.push(data.birthDate); }
  if (data.birthTime !== undefined) { fields.push('birthTime = ?'); values.push(data.birthTime); }
  if (data.birthLocation !== undefined) { fields.push('birthLocation = ?'); values.push(data.birthLocation); }
  if (data.notes !== undefined) { fields.push('notes = ?'); values.push(data.notes); }
  if (data.avatar !== undefined) { fields.push('avatar = ?'); values.push(data.avatar); }
  if (data.type !== undefined) { fields.push('type = ?'); values.push(data.type); }
  
  if (fields.length === 0) return;
  
  values.push(id);
  await db!.runAsync(
    `UPDATE profiles SET ${fields.join(', ')} WHERE id = ?`,
    ...values
  );
}

export async function deleteProfile(id: string): Promise<void> {
  if (!db) await initDatabase();
  await db!.runAsync('DELETE FROM journal_entries WHERE profileId = ?', id);
  await db!.runAsync('DELETE FROM tarot_readings WHERE profileId = ?', id);
  await db!.runAsync('DELETE FROM profiles WHERE id = ?', id);
}

// --- Journal Entries ---

export async function getAllJournalEntries(profileId?: string): Promise<JournalEntry[]> {
  if (!db) await initDatabase();
  if (profileId) {
    const rows = await db!.getAllAsync<any>(
      'SELECT * FROM journal_entries WHERE profileId = ? ORDER BY date DESC', 
      profileId
    );
    return rows.map(parseJournalRow);
  }
  const rows = await db!.getAllAsync<any>('SELECT * FROM journal_entries ORDER BY date DESC');
  return rows.map(parseJournalRow);
}

export async function getJournalEntryById(id: string): Promise<JournalEntry | null> {
  if (!db) await initDatabase();
  const row = await db!.getFirstAsync<any>('SELECT * FROM journal_entries WHERE id = ?', id);
  return row ? parseJournalRow(row) : null;
}

export async function addJournalEntry(entry: JournalEntry): Promise<void> {
  if (!db) await initDatabase();
  await db!.runAsync(
    'INSERT INTO journal_entries (id, profileId, title, content, category, tags, date, mood) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    entry.id,
    entry.profileId,
    entry.title,
    entry.content,
    entry.category,
    JSON.stringify(entry.tags),
    entry.date,
    entry.mood ?? null
  );
}

export async function updateJournalEntry(id: string, data: Partial<JournalEntry>): Promise<void> {
  if (!db) await initDatabase();
  const fields: string[] = [];
  const values: any[] = [];
  
  if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title); }
  if (data.content !== undefined) { fields.push('content = ?'); values.push(data.content); }
  if (data.category !== undefined) { fields.push('category = ?'); values.push(data.category); }
  if (data.tags !== undefined) { fields.push('tags = ?'); values.push(JSON.stringify(data.tags)); }
  if (data.mood !== undefined) { fields.push('mood = ?'); values.push(data.mood); }
  
  if (fields.length === 0) return;
  values.push(id);
  await db!.runAsync(
    `UPDATE journal_entries SET ${fields.join(', ')} WHERE id = ?`,
    ...values
  );
}

export async function deleteJournalEntry(id: string): Promise<void> {
  if (!db) await initDatabase();
  await db!.runAsync('DELETE FROM journal_entries WHERE id = ?', id);
}

export async function searchJournalEntries(query: string, profileId?: string): Promise<JournalEntry[]> {
  if (!db) await initDatabase();
  const searchPattern = `%${query}%`;
  let sql = 'SELECT * FROM journal_entries WHERE (title LIKE ? OR content LIKE ?)';
  const params: any[] = [searchPattern, searchPattern];
  
  if (profileId) {
    sql += ' AND profileId = ?';
    params.push(profileId);
  }
  sql += ' ORDER BY date DESC';
  
  const rows = await db!.getAllAsync<any>(sql, ...params);
  return rows.map(parseJournalRow);
}

function parseJournalRow(row: any): JournalEntry {
  return {
    ...row,
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags ?? []),
  };
}

// --- Settings ---

export async function getSetting(key: string): Promise<string | null> {
  if (!db) await initDatabase();
  const row = await db!.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', key);
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  if (!db) await initDatabase();
  await db!.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    key, value
  );
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await setSetting('theme', settings.theme);
  await setSetting('defaultProfileId', settings.defaultProfileId ?? '');
  await setSetting('notifications', String(settings.notifications));
  await setSetting('haptics', String(settings.haptics));
  await setSetting('soundEffects', String(settings.soundEffects));
  await setSetting('onboardingComplete', String(settings.onboardingComplete));
}

export async function loadSettings(): Promise<AppSettings | null> {
  const theme = await getSetting('theme');
  const defaultProfileId = await getSetting('defaultProfileId');
  const notifications = await getSetting('notifications');
  const haptics = await getSetting('haptics');
  const soundEffects = await getSetting('soundEffects');
  const onboardingComplete = await getSetting('onboardingComplete');
  
  if (!theme) return null;
  
  return {
    theme: (theme as CosmicTheme) ?? 'midnight',
    defaultProfileId: defaultProfileId || null,
    notifications: notifications === 'true',
    haptics: haptics === 'true',
    soundEffects: soundEffects === 'true',
    onboardingComplete: onboardingComplete !== 'false',
  };
}

// --- Favorites ---

export interface FavoriteRow {
  id: string;
  profileId: string;
  itemType: string;
  itemId: string;
  label: string | null;
  createdAt: string;
}

export async function getFavorites(profileId: string): Promise<FavoriteRow[]> {
  if (!db) await initDatabase();
  return await db!.getAllAsync<FavoriteRow>(
    'SELECT * FROM favorites WHERE profileId = ? ORDER BY createdAt DESC', profileId
  );
}

export async function addFavorite(fav: FavoriteRow): Promise<void> {
  if (!db) await initDatabase();
  await db!.runAsync(
    'INSERT OR IGNORE INTO favorites (id, profileId, itemType, itemId, label, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
    fav.id, fav.profileId, fav.itemType, fav.itemId, fav.label, fav.createdAt
  );
}

export async function removeFavorite(profileId: string, itemType: string, itemId: string): Promise<void> {
  if (!db) await initDatabase();
  await db!.runAsync('DELETE FROM favorites WHERE profileId = ? AND itemType = ? AND itemId = ?', profileId, itemType, itemId);
}

export async function isFavorite(profileId: string, itemType: string, itemId: string): Promise<boolean> {
  if (!db) await initDatabase();
  const row = await db!.getFirstAsync<{ id: string }>(
    'SELECT id FROM favorites WHERE profileId = ? AND itemType = ? AND itemId = ?', profileId, itemType, itemId
  );
  return !!row;
}

// --- Notification Preferences ---

export async function getNotificationPreferences(profileId: string): Promise<any[]> {
  if (!db) await initDatabase();
  return await db!.getAllAsync(
    'SELECT * FROM notification_preferences WHERE profileId = ?', profileId
  );
}

export async function upsertNotificationPreference(pref: { id: string; profileId: string; type: string; enabled: number; time: string; days: string }): Promise<void> {
  if (!db) await initDatabase();
  await db!.runAsync(
    'INSERT OR REPLACE INTO notification_preferences (id, profileId, type, enabled, time, days) VALUES (?, ?, ?, ?, ?, ?)',
    pref.id, pref.profileId, pref.type, pref.enabled, pref.time, pref.days
  );
}

export async function addNotificationHistory(entry: { id: string; profileId: string; type: string; title: string; body: string; data: string; scheduledDate: string; read: number; createdAt: string }): Promise<void> {
  if (!db) await initDatabase();
  await db!.runAsync(
    'INSERT INTO notification_history (id, profileId, type, title, body, data, scheduledDate, read, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    entry.id, entry.profileId, entry.type, entry.title, entry.body, entry.data, entry.scheduledDate, entry.read, entry.createdAt
  );
}

export async function getNotificationHistory(profileId: string): Promise<any[]> {
  if (!db) await initDatabase();
  return await db!.getAllAsync(
    'SELECT * FROM notification_history WHERE profileId = ? ORDER BY scheduledDate DESC', profileId
  );
}

// --- Backup / Restore ---

export async function exportDatabase(): Promise<string> {
  if (!db) await initDatabase();
  const tables = ['profiles', 'journal_entries', 'settings', 'tarot_readings', 'favorites', 'notification_preferences', 'notification_history'];
  const backup: Record<string, any[]> = {};
  for (const table of tables) {
    backup[table] = await db!.getAllAsync(`SELECT * FROM ${table}`);
  }
  return JSON.stringify(backup);
}

export async function importDatabase(json: string): Promise<void> {
  if (!db) await initDatabase();
  const backup = JSON.parse(json);
  await db!.execAsync('BEGIN TRANSACTION');
  try {
    for (const [table, rows] of Object.entries(backup)) {
      if (!Array.isArray(rows) || rows.length === 0) continue;
      const first = rows[0] as Record<string, any>;
      const keys = Object.keys(first);
      const placeholders = keys.map(() => '?').join(', ');
      const quotedKeys = keys.map((k) => `"${k}"`).join(', ');
      for (const row of rows) {
        const values = keys.map((k) => (row as Record<string, any>)[k] ?? null);
        await db!.runAsync(`INSERT OR REPLACE INTO ${table} (${quotedKeys}) VALUES (${placeholders})`, ...values);
      }
    }
    await db!.execAsync('COMMIT');
  } catch {
    await db!.execAsync('ROLLBACK');
    throw new Error('Import failed');
  }
}

// --- Search ---

export interface SearchResult {
  type: 'profile' | 'journal' | 'tarot';
  id: string;
  title: string;
  subtitle: string;
  date: string;
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!db) await initDatabase();
  const pattern = `%${query}%`;
  const results: SearchResult[] = [];
  
  const profiles = await db!.getAllAsync<any>(
    'SELECT id, name, birthDate FROM profiles WHERE name LIKE ?', pattern
  );
  for (const p of profiles) {
    results.push({ type: 'profile', id: p.id, title: p.name, subtitle: `Born: ${p.birthDate}`, date: '' });
  }
  
  const journals = await db!.getAllAsync<any>(
    'SELECT id, title, content, date FROM journal_entries WHERE title LIKE ? OR content LIKE ?', pattern, pattern
  );
  for (const j of journals) {
    results.push({ type: 'journal', id: j.id, title: j.title, subtitle: j.content.slice(0, 80), date: j.date });
  }
  
  results.sort((a, b) => a.title.localeCompare(b.title));
  return results;
}

// --- Tarot Readings ---

export interface TarotReadingRow {
  id: string;
  profileId: string;
  spread: string;
  cards: string;
  positions: string;
  date: string;
  notes: string | null;
}

export async function addTarotReading(reading: TarotReadingRow): Promise<void> {
  if (!db) await initDatabase();
  await db!.runAsync(
    'INSERT INTO tarot_readings (id, profileId, spread, cards, positions, date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    reading.id, reading.profileId, reading.spread, reading.cards, reading.positions, reading.date, reading.notes
  );
}

export async function getTarotReadings(profileId: string): Promise<TarotReadingRow[]> {
  if (!db) await initDatabase();
  return await db!.getAllAsync<TarotReadingRow>(
    'SELECT * FROM tarot_readings WHERE profileId = ? ORDER BY date DESC', profileId
  );
}

export async function deleteTarotReading(id: string): Promise<void> {
  if (!db) await initDatabase();
  await db!.runAsync('DELETE FROM tarot_readings WHERE id = ?', id);
}

export async function clearDatabase(): Promise<void> {
  if (!db) await initDatabase();
  await db!.execAsync(`
    DELETE FROM journal_entries;
    DELETE FROM tarot_readings;
    DELETE FROM profiles;
    DELETE FROM settings;
  `);
}
