import { WorkoutRecord } from "@/src/models/types";
import { getItem, setItem } from "@/src/storage/localStore";
// Убедись, что путь правильный! Если firebase.js в корне, то:
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase";

const FALLBACK_KEY = "workouts_db";
const WORKOUTS_COLLECTION = "workouts";

let sqliteAvailable: boolean | null = null;
let db_local: any = null;

function isFirebaseReady() {
  if (!db) {
    console.error("🔥 Firebase db не инициализирован!");
    return false;
  }
  console.log("firebase готов");
  return true;
}

async function tryInitSQLite() {
  if (sqliteAvailable !== null) return sqliteAvailable;

  try {
    const sqlite = await import("expo-sqlite");
    db_local = sqlite.openDatabaseSync?.("workouts.db");

    if (!db_local) {
      sqliteAvailable = false;
      return false;
    }

    db_local.execAsync?.(`
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

async function saveToFirebase(record: WorkoutRecord): Promise<void> {
  console.log("🔥 saveToFirebase START для:", record.id);

  if (!isFirebaseReady()) {
    console.log("⚠️ Firebase не готов, пропускаем сохранение в облако");
    return;
  }

  try {
    const workoutRef = doc(db, WORKOUTS_COLLECTION, record.id);

    await setDoc(workoutRef, {
      id: record.id,
      title: record.title,
      description: record.description,
      date: record.date,
      category: record.category,
      imageUrl: record.imageUrl || null,
      updatedAt: Timestamp.now(),
    });

    console.log("✅ Сохранено в Firebase:", record.id);
  } catch (error) {
    console.error("❌ Ошибка сохранения в Firebase:", error);
    throw error;
  }
}

async function deleteFromFirebase(id: string): Promise<void> {
  if (!isFirebaseReady()) {
    console.log("⚠️ Firebase не готов, пропускаем удаление из облака");
    return;
  }

  try {
    const workoutRef = doc(db, WORKOUTS_COLLECTION, id);
    await deleteDoc(workoutRef);
    console.log("✅ Удалено из Firebase:", id);
  } catch (error) {
    console.error("❌ Ошибка удаления из Firebase:", error);
    throw error;
  }
}

export async function getWorkoutsFromFirebase(): Promise<WorkoutRecord[]> {
  if (!isFirebaseReady()) {
    console.warn("⚠️ Firebase не готов, возвращаем пустой массив");
    return [];
  }

  try {
    const q = query(
      collection(db, WORKOUTS_COLLECTION),
      orderBy("date", "desc"),
    );
    const querySnapshot = await getDocs(q);
    const firebaseRecords: WorkoutRecord[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      firebaseRecords.push({
        id: doc.id,
        title: data.title,
        description: data.description,
        date: data.date,
        category: data.category,
      } as WorkoutRecord);
    });

    console.log("📥 Загружено из Firebase:", firebaseRecords.length);
    return firebaseRecords;
  } catch (error) {
    console.error("❌ Ошибка загрузки из Firebase:", error);
    return [];
  }
}

// ... остальные функции (syncLocalToFirebase, syncFirebaseToLocal, fullSync) остаются такими же

export async function upsertWorkout(record: WorkoutRecord): Promise<void> {
  const hasSQLite = await tryInitSQLite();

  console.log("вызывается метод вставки.обновления");
  console.log("📝 record.id:", record.id);
  console.log("📝 record.title:", record.title);

  // 1. Сохраняем локально
  if (!hasSQLite) {
    console.log("📝 Сохраняем в fallback");
    const items = await fallbackGetAll();
    const next = items.some((item) => item.id === record.id)
      ? items.map((item) => (item.id === record.id ? record : item))
      : [record, ...items];
    await fallbackSaveAll(next);
  } else if (db_local) {
    console.log("📝 Сохраняем в SQLite");
    await db_local.runAsync?.(
      "INSERT OR REPLACE INTO workouts (id, title, description, date, category) VALUES (?, ?, ?, ?, ?);",
      [
        record.id,
        record.title,
        record.description,
        record.date,
        record.category,
      ],
    );
    console.log("📝 SQLite сохранение завершено");
  }

  console.log("📝 Готовимся к saveToFirebase...");

  // Добавь обработку Promise
  const result = await saveToFirebase(record).catch((error) => {
    console.log("⚠️ saveToFirebase упал с ошибкой:", error.message);
    console.log("⚠️ Полная ошибка:", error);
    return null;
  });

  console.log("📝 saveToFirebase результат:", result);
}

export async function removeWorkout(id: string): Promise<void> {
  const hasSQLite = await tryInitSQLite();
  console.log("вызывается метод удаления");
  if (!hasSQLite) {
    const items = await fallbackGetAll();
    await fallbackSaveAll(items.filter((item) => item.id !== id));
  } else if (db_local) {
    await db_local.runAsync?.("DELETE FROM workouts WHERE id = ?;", [id]);
  }

  deleteFromFirebase(id).catch((error) => {
    console.warn(
      "⚠️ Не удалось удалить из Firebase, но локально запись удалена:",
      error.message,
    );
  });
}

export async function getAllWorkouts(): Promise<WorkoutRecord[]> {
  const hasSQLite = await tryInitSQLite();

  let localRecords: WorkoutRecord[] = [];

  if (!hasSQLite) {
    localRecords = await fallbackGetAll();
  } else if (db_local) {
    localRecords =
      (await db_local.getAllAsync?.(
        "SELECT * FROM workouts ORDER BY date DESC;",
      )) ?? [];
  }

  if (localRecords.length > 0) {
    return localRecords;
  }

  const firebaseRecords = await getWorkoutsFromFirebase();

  if (firebaseRecords.length > 0) {
    if (!hasSQLite) {
      await fallbackSaveAll(firebaseRecords);
    } else if (db_local) {
      for (const record of firebaseRecords) {
        await db_local.runAsync?.(
          "INSERT OR REPLACE INTO workouts (id, title, description, date, category) VALUES (?, ?, ?, ?, ?);",
          [
            record.id,
            record.title,
            record.description,
            record.date,
            record.category,
          ],
        );
      }
    }
    return firebaseRecords;
  }

  return [];
}
