import { useEffect, useState } from 'react';
import { Alert, Pressable, Share, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { t } from '@/src/localization/i18n';
import { User } from '@/src/models/types';
import { getCurrentUser, login, register } from '@/src/services/authService';
import { useApp } from '@/src/viewmodels/AppContext';

export default function ProfileScreen() {
  const { prefs } = useApp();
  const { language, theme } = prefs;
  const isDark = theme === 'dark';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [location, setLocation] = useState('');

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  const readLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      Alert.alert('Location', 'Geolocation is not available in this environment');
      return;
    }

    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
    });
  };

  const inputColors = {
    backgroundColor: isDark ? '#1A1F2B' : '#FFFFFF',
    borderColor: isDark ? '#2C3446' : '#999999',
    color: isDark ? '#EAF0FF' : '#111111',
  };

  const buttonStyle = {
    borderColor: isDark ? '#3C4962' : '#999999',
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">{t(language, 'profile')}</ThemedText>
      <ThemedText>{t(language, 'auth')}</ThemedText>
      {!!user && <ThemedText>Logged as: {user.email}</ThemedText>}

      <TextInput
        style={[styles.input, inputColors]}
        placeholderTextColor={isDark ? '#93A0B8' : '#6B7280'}
        placeholder={t(language, 'email')}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={[styles.input, inputColors]}
        placeholderTextColor={isDark ? '#93A0B8' : '#6B7280'}
        placeholder={t(language, 'password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable style={[styles.btn, buttonStyle]} onPress={() => register(email, password).then(setUser)}>
        <ThemedText>{t(language, 'register')}</ThemedText>
      </Pressable>
      <Pressable
        style={[styles.btn, buttonStyle]}
        onPress={() =>
          login(email, password).then((u) => {
            if (!u) Alert.alert('Auth', 'Invalid credentials');
            setUser(u);
          })
        }>
        <ThemedText>{t(language, 'login')}</ThemedText>
      </Pressable>

      <Pressable style={[styles.btn, buttonStyle]} onPress={readLocation}>
        <ThemedText>{t(language, 'location')}</ThemedText>
      </Pressable>
      {!!location && <ThemedText>{location}</ThemedText>}

      <Pressable
        style={[styles.btn, { ...buttonStyle, backgroundColor: isDark ? '#26334A' : '#FFFFFF' }]}
        onPress={() =>
          Share.share({
            message: 'I completed my workout today in Fit App 💪',
          })
        }>
        <ThemedText>{t(language, 'share')}</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10 },
  input: { borderWidth: 1, borderRadius: 10, padding: 10 },
  btn: { borderWidth: 1, borderRadius: 10, padding: 10, alignItems: 'center' },
});
