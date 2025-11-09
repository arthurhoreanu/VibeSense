import { Tabs } from 'expo-router';
import React from 'react';
import { Home, Music, BarChart3, Settings } from 'lucide-react-native';

export default function TabLayout() {
  const inactiveColor = 'rgba(255, 255, 255, 0.4)';
  const activeColor = '#c471ed';
  const iconSize = 30;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopWidth: 0,
          height: 80,
        },
        tabBarItemStyle: {
          paddingTop: 10, 
        }
      }}
    >
      <Tabs.Screen 
        name="home" 
        options={{
          tabBarIcon: ({ focused }) => (
            <Home color={focused ? activeColor : inactiveColor} size={iconSize} />
          ),
        }}
      />
      <Tabs.Screen 
        name="playing" 
        options={{
          tabBarIcon: ({ focused }) => (
            <Music color={focused ? activeColor : inactiveColor} size={iconSize} />
          ),
        }}
      />
      <Tabs.Screen 
        name="stats" 
        options={{
          tabBarIcon: ({ focused }) => (
            <BarChart3 color={focused ? activeColor : inactiveColor} size={iconSize} />
          ),
        }}
      />
      <Tabs.Screen 
        name="settings" 
        options={{
          tabBarIcon: ({ focused }) => (
            <Settings color={focused ? activeColor : inactiveColor} size={iconSize} />
          ),
        }}
      />
    </Tabs>
  );
}
