import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { t } from '@/src/localization/i18n';
import { subscribeToCloud, saveToCloud } from '@/src/services/cloudService';
import { hasInternetConnection } from '@/src/services/connectivityService';
import { scheduleInAppReminder } from '@/src/services/notificationService';
import { getWeather } from '@/src/services/weatherService';
import { useApp } from '@/src/viewmodels/AppContext';

export default function ApiScreen() {
  const { prefs, workouts } = useApp();
  const { language, theme } = prefs;
  const isDark = theme === 'dark';
  const [online, setOnline] = useState<boolean>(true);
  const [weatherText, setWeatherText] = useState('-');
  const [cloudCount, setCloudCount] = useState(0);

  useEffect(() => {
    hasInternetConnection().then(setOnline);
    getWeather().then((result) => {
      if (!result.data) {
        setWeatherText('Нет данных');
        return;
      }

      const prefix = result.cached ? '[cache]' : '[live]';
      setWeatherText(`${prefix} ${result.data.temperature}°C, wind ${result.data.windspeed}`);
    });

    let off = () => {};
    subscribeToCloud((items) => setCloudCount(items.length)).then((unsubscribe) => {
      off = unsubscribe;
    });

    return () => off();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ThemedText type="title">{t(language, 'api')}</ThemedText>
      <ThemedText>{online ? t(language, 'online') : t(language, 'offline')}</ThemedText>
      <ThemedText>{weatherText}</ThemedText>
      <ThemedText>Cloud items: {cloudCount}</ThemedText>

      <Pressable
        style={[
          styles.button,
          { borderColor: isDark ? '#3C4962' : '#999999', backgroundColor: isDark ? '#1D283A' : '#FFFFFF' },
        ]}
        onPress={() => saveToCloud(workouts.items)}>
        <ThemedText>{t(language, 'sync')}</ThemedText>
      </Pressable>

      <Pressable
        style={[
          styles.button,
          { borderColor: isDark ? '#3C4962' : '#999999', backgroundColor: isDark ? '#24344D' : '#FFFFFF' },
        ]}
        onPress={() =>
          scheduleInAppReminder(() => {
            Alert.alert('Reminder', 'Пора на тренировку!');
          })
        }>
        <ThemedText>{t(language, 'scheduleReminder')}</ThemedText>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12 },
  button: { borderWidth: 1, borderRadius: 10, padding: 10, alignItems: 'center' },
});
