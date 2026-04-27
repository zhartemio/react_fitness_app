import { WorkoutRecord } from '@/src/models/types';
import { getAllWorkouts, removeWorkout, upsertWorkout } from '@/src/storage/workoutDb';

export class WorkoutRepository {
  async getAll(): Promise<WorkoutRecord[]> {
    return getAllWorkouts();
  }

  async upsert(record: WorkoutRecord): Promise<void> {
    await upsertWorkout(record);
  }

  async remove(id: string): Promise<void> {
    await removeWorkout(id);
  }
}
