import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getImageKitImageUrl } from '@/src/services/imageService';
import { useApp } from '@/src/viewmodels/AppContext';

export default function DetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { workouts } = useApp();

  const item = workouts.items.find((x) => x.id === id);

  if (!item) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Запись не найдена</ThemedText>
      </ThemedView>
    );
  }

  const imageUrl = getImageKitImageUrl(item.imageUrl || item.imageFilePath);

  return (
    <ThemedView style={styles.container}>
      {!!imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" />}
      <ThemedText type="title">{item.title}</ThemedText>
      <ThemedText>{item.description}</ThemedText>
      <ThemedText>{item.category}</ThemedText>
      <ThemedText>{new Date(item.date).toLocaleString()}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8 },
  image: { width: '100%', height: 220, borderRadius: 12 },
});
