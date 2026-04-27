import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { t } from '@/src/localization/i18n';
import { WorkoutRecord } from '@/src/models/types';
import { useApp } from '@/src/viewmodels/AppContext';

const categories: WorkoutRecord['category'][] = ['cardio', 'strength', 'stretch'];

export default function HomeScreen() {
  const { prefs, workouts } = useApp();
  const { language } = prefs;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<WorkoutRecord['category']>('cardio');
  const [editingId, setEditingId] = useState<string | null>(null);

  const date = useMemo(() => new Date().toISOString(), []);

  const submit = async () => {
    if (!title.trim()) return;
    await workouts.save({
      id: editingId ?? Date.now().toString(),
      title,
      description,
      date,
      category,
    });

    setTitle('');
    setDescription('');
    setEditingId(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ThemedText type="title">{t(language, 'home')}</ThemedText>

      <TextInput placeholder={t(language, 'title')} style={styles.input} value={title} onChangeText={setTitle} />
      <TextInput
        placeholder={t(language, 'description')}
        style={[styles.input, styles.area]}
        multiline
        value={description}
        onChangeText={setDescription}
      />

      <View style={styles.row}>
        {categories.map((x) => (
          <Pressable key={x} onPress={() => setCategory(x)} style={[styles.chip, category === x && styles.chipActive]}>
            <ThemedText>{x}</ThemedText>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.button} onPress={submit}>
        <ThemedText>{editingId ? t(language, 'edit') : t(language, 'add')}</ThemedText>
      </Pressable>

      <TextInput placeholder={t(language, 'search')} style={styles.input} value={workouts.search} onChangeText={workouts.setSearch} />

      <View style={styles.row}>
        <Pressable style={styles.chip} onPress={() => workouts.setSortDesc(!workouts.sortDesc)}>
          <ThemedText>{t(language, 'sortByDate')}</ThemedText>
        </Pressable>
        <Pressable style={styles.chip} onPress={() => workouts.setCategory(workouts.category === 'all' ? 'cardio' : 'all')}>
          <ThemedText>{`${t(language, 'filterCategory')}: ${workouts.category}`}</ThemedText>
        </Pressable>
      </View>

      {workouts.filtered.length === 0 && <ThemedText>{t(language, 'noData')}</ThemedText>}

      {workouts.filtered.map((item) => (
        <ThemedView key={item.id} style={styles.card}>
          <Link href={{ pathname: '/details/[id]', params: { id: item.id } }} asChild>
            <Pressable>
              <ThemedText type="subtitle">{item.title}</ThemedText>
              <ThemedText>{item.description}</ThemedText>
              <ThemedText>{new Date(item.date).toLocaleString()}</ThemedText>
            </Pressable>
          </Link>

          <View style={styles.row}>
            <Pressable
              style={styles.smallBtn}
              onPress={() => {
                setEditingId(item.id);
                setTitle(item.title);
                setDescription(item.description);
                setCategory(item.category);
              }}>
              <ThemedText>{t(language, 'edit')}</ThemedText>
            </Pressable>
            <Pressable style={styles.smallBtn} onPress={() => workouts.remove(item.id)}>
              <ThemedText>{t(language, 'delete')}</ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 10 },
  input: { borderWidth: 1, borderColor: '#999', borderRadius: 10, padding: 10, backgroundColor: 'white' },
  area: { minHeight: 70, textAlignVertical: 'top' },
  button: { padding: 10, borderWidth: 1, borderRadius: 10, alignItems: 'center' },
  card: { padding: 12, borderRadius: 10, borderWidth: 1, gap: 6 },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { borderWidth: 1, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 6 },
  chipActive: { backgroundColor: '#dadada' },
  smallBtn: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
});
