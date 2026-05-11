import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { t } from '@/src/localization/i18n';
import { WorkoutRecord } from '@/src/models/types';
import { getImageKitImageUrl } from '@/src/services/imageService';
import { useApp } from '@/src/viewmodels/AppContext';
import { useWorkoutImageUpload } from '@/src/viewmodels/useWorkoutImageUpload';

const categories: WorkoutRecord['category'][] = ['cardio', 'strength', 'stretch'];

export default function HomeScreen() {
  const { prefs, workouts } = useApp();
  const { language, theme } = prefs;
  const isDark = theme === 'dark';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<WorkoutRecord['category']>('cardio');
  const [editingId, setEditingId] = useState<string | null>(null);
  const workoutImage = useWorkoutImageUpload();

  const date = useMemo(() => new Date().toISOString(), []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setEditingId(null);
    workoutImage.reset();
  };

  const uploadImage = async () => {
    if (!workoutImage.imageUri.trim()) {
      Alert.alert('ImageKit', t(language, 'imageUriRequired'));
      return null;
    }

    try {
      return await workoutImage.uploadPendingImage({ category });
    } catch (error) {
      Alert.alert('ImageKit', error instanceof Error ? error.message : t(language, 'imageUploadError'));
      return null;
    }
  };

  const submit = async () => {
    if (!title.trim()) return;

    let nextImage = workoutImage.metadata;

    if (workoutImage.imageUri.trim()) {
      const uploaded = await uploadImage();
      if (!uploaded) return;

      nextImage = uploaded;
    }

    await workouts.save({
      id: editingId ?? Date.now().toString(),
      title,
      description,
      date,
      category,
      imageUrl: nextImage.imageUrl,
      imageFileId: nextImage.imageFileId,
      imageFilePath: nextImage.imageFilePath,
    });

    resetForm();
  };

  const inputColors = {
    backgroundColor: isDark ? '#1A1F2B' : '#FFFFFF',
    borderColor: isDark ? '#2C3446' : '#999999',
    color: isDark ? '#EAF0FF' : '#111111',
  };

  const buttonStyle = {
    borderColor: isDark ? '#3C4962' : '#999999',
    backgroundColor: isDark ? '#202A3C' : '#FFFFFF',
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ThemedText type="title">{t(language, 'home')}</ThemedText>

      <TextInput
        placeholder={t(language, 'title')}
        placeholderTextColor={isDark ? '#93A0B8' : '#6B7280'}
        style={[styles.input, inputColors]}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        placeholder={t(language, 'description')}
        placeholderTextColor={isDark ? '#93A0B8' : '#6B7280'}
        style={[styles.input, styles.area, inputColors]}
        multiline
        value={description}
        onChangeText={setDescription}
      />

      <TextInput
        placeholder={t(language, 'imageUri')}
        placeholderTextColor={isDark ? '#93A0B8' : '#6B7280'}
        style={[styles.input, inputColors]}
        value={workoutImage.imageUri}
        onChangeText={workoutImage.setImageSource}
        autoCapitalize="none"
      />

      {!!workoutImage.previewUrl && <Image source={{ uri: workoutImage.previewUrl }} style={styles.preview} contentFit="cover" />}

      <View style={styles.row}>
        <Pressable style={[styles.smallBtn, buttonStyle]} onPress={uploadImage} disabled={workoutImage.isUploading}>
          <ThemedText>{workoutImage.isUploading ? t(language, 'imageUploading') : t(language, 'uploadImage')}</ThemedText>
        </Pressable>
        {workoutImage.hasImage && (
          <Pressable
            style={[styles.smallBtn, { borderColor: isDark ? '#754A4A' : '#999999', backgroundColor: isDark ? '#2A1E1E' : '#FFFFFF' }]}
            onPress={workoutImage.clearImage}>
            <ThemedText>{t(language, 'removeImage')}</ThemedText>
          </Pressable>
        )}
      </View>

      <View style={styles.row}>
        {categories.map((x) => (
          <Pressable
            key={x}
            onPress={() => setCategory(x)}
            style={[
              styles.chip,
              { borderColor: isDark ? '#3C4962' : '#999999', backgroundColor: isDark ? '#1B2536' : '#FFFFFF' },
              category === x && { backgroundColor: isDark ? '#2B3952' : '#DADADA' },
            ]}>
            <ThemedText>{x}</ThemedText>
          </Pressable>
        ))}
      </View>

      <Pressable style={[styles.button, buttonStyle]} onPress={submit} disabled={workoutImage.isUploading}>
        <ThemedText>{editingId ? t(language, 'edit') : t(language, 'add')}</ThemedText>
      </Pressable>

      <TextInput
        placeholder={t(language, 'search')}
        placeholderTextColor={isDark ? '#93A0B8' : '#6B7280'}
        style={[styles.input, inputColors]}
        value={workouts.search}
        onChangeText={workouts.setSearch}
      />

      <View style={styles.row}>
        <Pressable style={[styles.chip, { borderColor: isDark ? '#3C4962' : '#999999', backgroundColor: isDark ? '#1B2536' : '#FFFFFF' }]} onPress={() => workouts.setSortDesc(!workouts.sortDesc)}>
          <ThemedText>{t(language, 'sortByDate')}</ThemedText>
        </Pressable>
        <Pressable style={[styles.chip, { borderColor: isDark ? '#3C4962' : '#999999', backgroundColor: isDark ? '#1B2536' : '#FFFFFF' }]} onPress={() => workouts.setCategory(workouts.category === 'all' ? 'cardio' : 'all')}>
          <ThemedText>{`${t(language, 'filterCategory')}: ${workouts.category}`}</ThemedText>
        </Pressable>
      </View>

      {workouts.filtered.length === 0 && <ThemedText>{t(language, 'noData')}</ThemedText>}

      {workouts.filtered.map((item) => {
        const itemImageUrl = getImageKitImageUrl(item.imageUrl || item.imageFilePath);

        return (
          <ThemedView
            key={item.id}
            style={[
              styles.card,
              {
                borderColor: isDark ? '#37445D' : '#999999',
                backgroundColor: isDark ? '#151C2A' : '#FFFFFF',
              },
            ]}>
            <Link href={{ pathname: '/details/[id]', params: { id: item.id } }} asChild>
              <Pressable style={styles.cardLink}>
                {!!itemImageUrl && <Image source={{ uri: itemImageUrl }} style={styles.cardImage} contentFit="cover" />}
                <ThemedText type="subtitle">{item.title}</ThemedText>
                <ThemedText>{item.description}</ThemedText>
                <ThemedText>{new Date(item.date).toLocaleString()}</ThemedText>
              </Pressable>
            </Link>

            <View style={styles.row}>
              <Pressable
                style={[styles.smallBtn, { borderColor: isDark ? '#3C4962' : '#999999', backgroundColor: isDark ? '#1D283D' : '#FFFFFF' }]}
                onPress={() => {
                  setEditingId(item.id);
                  setTitle(item.title);
                  setDescription(item.description);
                  setCategory(item.category);
                  workoutImage.loadFromRecord(item);
                }}>
                <ThemedText>{t(language, 'edit')}</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.smallBtn, { borderColor: isDark ? '#754A4A' : '#999999', backgroundColor: isDark ? '#2A1E1E' : '#FFFFFF' }]}
                onPress={() => workouts.remove(item.id)}>
                <ThemedText>{t(language, 'delete')}</ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 10 },
  input: { borderWidth: 1, borderRadius: 10, padding: 10 },
  area: { minHeight: 70, textAlignVertical: 'top' },
  button: { padding: 10, borderWidth: 1, borderRadius: 10, alignItems: 'center' },
  card: { padding: 12, borderRadius: 10, borderWidth: 1, gap: 6 },
  cardImage: { width: '100%', height: 160, borderRadius: 10 },
  cardLink: { gap: 6 },
  preview: { width: '100%', height: 180, borderRadius: 10 },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { borderWidth: 1, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 6 },
  smallBtn: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
});
