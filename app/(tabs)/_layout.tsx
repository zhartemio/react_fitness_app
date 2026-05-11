import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { Typography } from "@/constants/typography";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { t } from "@/src/localization/i18n";
import { useApp } from "@/src/viewmodels/AppContext";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { prefs } = useApp();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: true,
        tabBarButton: HapticTab,
        tabBarLabelStyle: styles.tabBarLabel,
        headerTitleStyle: styles.headerTitle,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t(prefs.language, "home"),
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={24} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "API",
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={24} name="cloud" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t(prefs.language, "settings"),
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={24} name="settings" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t(prefs.language, "profile"),
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={24} name="person" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarLabel: {
    fontSize: Typography.tabLabelFontSize,
    lineHeight: Typography.tabLabelFontSize + 2,
  },
  headerTitle: {
    fontSize: Typography.headerTitleFontSize,
  },
});
