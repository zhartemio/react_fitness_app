import { WorkoutRecord } from "@/src/models/types";
import * as SQLite from "expo-sqlite";

const CLOUD_KEY = "cloud_records";
type Listener = (items: WorkoutRecord[]) => void;
const listeners = new Set<Listener>();

const db = SQLite.openDatabaseSync("workouts.db");

let isInitialized = false;
async function ensureTable() {
  if (isInitialized) return;
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS key_value (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
  isInitialized = true;
}

async function getItem(key: string): Promise<string | null> {
  await ensureTable();
  const result = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM key_value WHERE key = ?",
    [key],
  );
  return result?.value ?? null;
}

async function setItem(key: string, value: string): Promise<void> {
  await ensureTable();
  await db.runAsync(
    "INSERT OR REPLACE INTO key_value (key, value) VALUES (?, ?)",
    [key, value],
  );
}

export async function saveToCloud(items: WorkoutRecord[]) {
  await setItem(CLOUD_KEY, JSON.stringify(items));
  listeners.forEach((fn) => fn(items));
}

export async function subscribeToCloud(fn: Listener): Promise<() => void> {
  listeners.add(fn);
  const raw = await getItem(CLOUD_KEY);
  fn(raw ? (JSON.parse(raw) as WorkoutRecord[]) : []);
  return () => listeners.delete(fn);
}
