import { WorkoutRecord } from '@/src/models/types';
import { getItem, setItem } from '@/src/storage/localStore';

const CLOUD_KEY = 'cloud_records';

type Listener = (items: WorkoutRecord[]) => void;
const listeners = new Set<Listener>();

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
