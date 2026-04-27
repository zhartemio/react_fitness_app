import { WorkoutRecord } from '@/src/models/types';
import { getItem, setItem } from '@/src/storage/localStore';

const FALLBACK_KEY = 'workouts_db';

let sqliteAvailable: boolean | null = null;
let db: any = null;

async function tryInitSQLite() {
  if (sqliteAvailable !== null) return sqliteAvailable;

  try {
    // eslint-disable-next-line import/no-unresolved
    const sqlite = await import('expo-sqlite');
    db = sqlite.openDatabaseSync?.('workouts.db');

    if (!db) {
      sqliteAvailable = false;
      return false;
    }

    db.execAsync?.(`
      CREATE TABLE IF NOT EXISTS workouts (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        date TEXT NOT NULL,
        category TEXT NOT NULL
      );
    `);

    sqliteAvailable = true;
    return true;
  } catch {
    sqliteAvailable = false;
    return false;
  }
}

async function fallbackGetAll(): Promise<WorkoutRecord[]> {
  const raw = await getItem(FALLBACK_KEY);
  return raw ? (JSON.parse(raw) as WorkoutRecord[]) : [];
}

async function fallbackSaveAll(items: WorkoutRecord[]) {
  await setItem(FALLBACK_KEY, JSON.stringify(items));
}

export async function getAllWorkouts(): Promise<WorkoutRecord[]> {
  const hasSQLite = await tryInitSQLite();

  if (!hasSQLite) {
    return fallbackGetAll();
  }

  const rows = (await db.getAllAsync?.('SELECT * FROM workouts ORDER BY date DESC;')) ?? [];
  return rows as WorkoutRecord[];
}

export async function upsertWorkout(record: WorkoutRecord): Promise<void> {
  const hasSQLite = await tryInitSQLite();

  if (!hasSQLite) {
    const items = await fallbackGetAll();
    const next = items.some((item) => item.id === record.id)
      ? items.map((item) => (item.id === record.id ? record : item))
      : [record, ...items];
    await fallbackSaveAll(next);
    return;
  }

  await db.runAsync?.(
    'INSERT OR REPLACE INTO workouts (id, title, description, date, category) VALUES (?, ?, ?, ?, ?);',
    [record.id, record.title, record.description, record.date, record.category]
  );
}

export async function removeWorkout(id: string): Promise<void> {
  const hasSQLite = await tryInitSQLite();

  if (!hasSQLite) {
    const items = await fallbackGetAll();
    await fallbackSaveAll(items.filter((item) => item.id !== id));
    return;
  }

  await db.runAsync?.('DELETE FROM workouts WHERE id = ?;', [id]);
}
