import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Typography } from '@/constants/typography';
import { t } from '@/src/localization/i18n';
import { subscribeToCloud, saveToCloud } from '@/src/services/cloudService';
import { hasInternetConnection } from '@/src/services/connectivityService';
import { restoreScheduledReminders, scheduleReminderAt } from '@/src/services/notificationService';
import { getWeather } from '@/src/services/weatherService';
import { useApp } from '@/src/viewmodels/AppContext';

function formatReminderInput(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function parseReminderInput(value: string) {
  const normalizedValue = value.trim().replace(/\s+/, 'T');
  const date = new Date(normalizedValue);

  return Number.isNaN(date.getTime()) ? null : date;
}

export default function ApiScreen() {
  const { prefs, workouts } = useApp();
  const { language, theme } = prefs;
  const isDark = theme === 'dark';
  const [online, setOnline] = useState<boolean>(true);
  const [weatherText, setWeatherText] = useState('-');
  const [cloudCount, setCloudCount] = useState(0);
  const [reminderText, setReminderText] = useState('Пора на тренировку!');
  const [reminderTime, setReminderTime] = useState(() => formatReminderInput(new Date(Date.now() + 10 * 60 * 1000)));
  const [reminderStatus, setReminderStatus] = useState('');

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

    restoreScheduledReminders((reminder) => {
      Alert.alert('Reminder', reminder.text);
    });

    return () => off();
  }, []);

  const inputColors = {
    backgroundColor: isDark ? '#1A1F2B' : '#FFFFFF',
    borderColor: isDark ? '#2C3446' : '#999999',
    color: isDark ? '#EAF0FF' : '#111111',
  };

  const submitReminder = async () => {
    const scheduledDate = parseReminderInput(reminderTime);

    if (!reminderText.trim()) {
      Alert.alert('Reminder', t(language, 'reminderTextRequired'));
      return;
    }

    if (!scheduledDate) {
      Alert.alert('Reminder', t(language, 'reminderTimeInvalid'));
      return;
    }

    if (scheduledDate.getTime() <= Date.now()) {
      Alert.alert('Reminder', t(language, 'reminderTimePast'));
      return;
    }

    const scheduled = await scheduleReminderAt(
      {
        id: Date.now().toString(),
        text: reminderText.trim(),
        scheduledAt: scheduledDate.toISOString(),
      },
      (reminder) => {
        Alert.alert('Reminder', reminder.text);
      }
    );

    if (scheduled) {
      setReminderStatus(`${t(language, 'reminderScheduled')}: ${formatReminderInput(scheduledDate)}`);
    }
  };

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

      <TextInput
        allowFontScaling={false}
        maxFontSizeMultiplier={Typography.maxFontSizeMultiplier}
        placeholder={t(language, 'reminderText')}
        placeholderTextColor={isDark ? '#93A0B8' : '#6B7280'}
        style={[styles.input, inputColors]}
        value={reminderText}
        onChangeText={setReminderText}
      />
      <TextInput
        allowFontScaling={false}
        maxFontSizeMultiplier={Typography.maxFontSizeMultiplier}
        placeholder={t(language, 'reminderTime')}
        placeholderTextColor={isDark ? '#93A0B8' : '#6B7280'}
        style={[styles.input, inputColors]}
        value={reminderTime}
        onChangeText={setReminderTime}
        autoCapitalize="none"
      />
      <ThemedText>{t(language, 'reminderTimeHint')}</ThemedText>
      {!!reminderStatus && <ThemedText>{reminderStatus}</ThemedText>}

      <Pressable
        style={[
          styles.button,
          { borderColor: isDark ? '#3C4962' : '#999999', backgroundColor: isDark ? '#24344D' : '#FFFFFF' },
        ]}
        onPress={submitReminder}>
        <ThemedText>{t(language, 'scheduleReminder')}</ThemedText>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12 },
  input: { borderWidth: 1, borderRadius: 10, padding: 8, fontSize: Typography.inputFontSize, lineHeight: Typography.inputLineHeight },
  button: { borderWidth: 1, borderRadius: 10, padding: 10, alignItems: 'center' },
});
