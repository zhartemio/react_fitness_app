import { WorkoutRecord } from '@/src/models/types';
import { getItem, setItem } from '@/src/storage/localStore';

const WORKOUTS_KEY = 'workouts_db';

export class WorkoutRepository {
  async getAll(): Promise<WorkoutRecord[]> {
    const raw = await getItem(WORKOUTS_KEY);
    return raw ? (JSON.parse(raw) as WorkoutRecord[]) : [];
  }

  async saveAll(items: WorkoutRecord[]): Promise<void> {
    await setItem(WORKOUTS_KEY, JSON.stringify(items));
  }

  async upsert(record: WorkoutRecord): Promise<void> {
    const items = await this.getAll();
    const next = items.some((item) => item.id === record.id)
      ? items.map((item) => (item.id === record.id ? record : item))
      : [record, ...items];

    await this.saveAll(next);
  }

  async remove(id: string): Promise<void> {
    const items = await this.getAll();
    await this.saveAll(items.filter((item) => item.id !== id));
  }
}
