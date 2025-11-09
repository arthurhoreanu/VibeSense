import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="playing" />
      <Tabs.Screen name="stats" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
