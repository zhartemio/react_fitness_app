import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { t } from '@/src/localization/i18n';
import { useApp } from '@/src/viewmodels/AppContext';

export default function SettingsScreen() {
  const { prefs } = useApp();
  const { language, theme, updateLanguage, updateTheme } = prefs;

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">{t(language, 'settings')}</ThemedText>

      <ThemedText>{t(language, 'language')}</ThemedText>
      <View style={styles.row}>
        <Pressable style={styles.btn} onPress={() => updateLanguage('ru')}>
          <ThemedText>RU</ThemedText>
        </Pressable>
        <Pressable style={styles.btn} onPress={() => updateLanguage('en')}>
          <ThemedText>EN</ThemedText>
        </Pressable>
      </View>

      <ThemedText>
        {t(language, 'theme')}: {theme}
      </ThemedText>
      <View style={styles.row}>
        <Pressable style={styles.btn} onPress={() => updateTheme('light')}>
          <ThemedText>{t(language, 'light')}</ThemedText>
        </Pressable>
        <Pressable style={styles.btn} onPress={() => updateTheme('dark')}>
          <ThemedText>{t(language, 'dark')}</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10 },
  row: { flexDirection: 'row', gap: 10 },
  btn: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
});
