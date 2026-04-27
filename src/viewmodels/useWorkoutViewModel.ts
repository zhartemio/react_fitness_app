import { useEffect, useMemo, useState } from 'react';

import { WorkoutRecord } from '@/src/models/types';
import { WorkoutRepository } from '@/src/repositories/workoutRepository';
import { fuzzyMatch } from '@/src/utils/fuzzy';

const repository = new WorkoutRepository();

export function useWorkoutViewModel() {
  const [items, setItems] = useState<WorkoutRecord[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | WorkoutRecord['category']>('all');
  const [sortDesc, setSortDesc] = useState(true);

  useEffect(() => {
    repository.getAll().then(setItems);
  }, []);

  const filtered = useMemo(() => {
    const base = items.filter((x) => (category === 'all' ? true : x.category === category));
    const searched = base.filter((x) => fuzzyMatch(`${x.title} ${x.description}`, search));

    return searched.sort((a, b) => {
      const diff = +new Date(a.date) - +new Date(b.date);
      return sortDesc ? -diff : diff;
    });
  }, [items, category, search, sortDesc]);

  const save = async (record: WorkoutRecord) => {
    await repository.upsert(record);
    setItems(await repository.getAll());
  };

  const remove = async (id: string) => {
    await repository.remove(id);
    setItems(await repository.getAll());
  };

  return {
    items,
    filtered,
    search,
    setSearch,
    category,
    setCategory,
    sortDesc,
    setSortDesc,
    save,
    remove,
  };
}
