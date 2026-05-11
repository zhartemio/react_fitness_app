import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

async function initDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  const database = await SQLite.openDatabaseAsync("workouts.db");

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS preferences (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);

  db = database;
  return db;
}

async function getPreference(key: string): Promise<string | null> {
  const database = await initDb();
  const result = await database.getFirstAsync<{ value: string }>(
    "SELECT value FROM preferences WHERE key = ?;",
    key,
  );
  return result ? result.value : null;
}

async function setPreference(key: string, value: string): Promise<void> {
  const database = await initDb();
  await database.runAsync(
    "INSERT OR REPLACE INTO preferences (key, value) VALUES (?, ?);",
    key,
    value,
  );
}

// Специализированные функции для темы
export async function saveTheme(theme: "light" | "dark"): Promise<void> {
  await setPreference("theme", theme);
}

export async function loadTheme(): Promise<"light" | "dark" | null> {
  const value = await getPreference("theme");
  if (value === "light" || value === "dark") return value;
  return null;
}

// Для языка
export async function saveLanguage(lang: "ru" | "en"): Promise<void> {
  await setPreference("language", lang);
}

export async function loadLanguage(): Promise<"ru" | "en" | null> {
  const value = await getPreference("language");
  if (value === "ru" || value === "en") return value;
  return null;
}
