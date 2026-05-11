import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Text, TextInput } from "react-native";
import "react-native-reanimated";

import { Typography } from "@/constants/typography";
import { AppProvider, useApp } from "@/src/viewmodels/AppContext";

SplashScreen.preventAutoHideAsync();

function configureGlobalTextDefaults() {
  const textComponent = Text as typeof Text & { defaultProps?: Text["props"] };
  const textDefaults = textComponent.defaultProps ?? {};
  textComponent.defaultProps = {
    ...textDefaults,
    allowFontScaling: false,
    maxFontSizeMultiplier: Typography.maxFontSizeMultiplier,
  };

  const inputComponent = TextInput as typeof TextInput & { defaultProps?: TextInput["props"] };
  const inputDefaults = inputComponent.defaultProps ?? {};
  inputComponent.defaultProps = {
    ...inputDefaults,
    allowFontScaling: false,
    maxFontSizeMultiplier: Typography.maxFontSizeMultiplier,
  };
}

configureGlobalTextDefaults();

function RootNavigator() {
  const {
    prefs: { theme },
  } = useApp();

  return (
    <ThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerTitleStyle: {
            fontSize: Typography.headerTitleFontSize,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="details/[id]" options={{ title: "Details" }} />
      </Stack>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      setReady(true);
      await SplashScreen.hideAsync();
    }, 1200);

    return () => clearTimeout(t);
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <AppProvider>
      <RootNavigator />
    </AppProvider>
  );
}
