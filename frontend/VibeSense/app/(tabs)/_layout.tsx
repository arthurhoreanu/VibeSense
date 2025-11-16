import { Tabs } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Home, Music, BarChart3, Settings, Cloud, Activity, Sunrise } from 'lucide-react-native';
import { MoodContext, CurrentMoodState } from '../../context/MoodContext';
import { useUserActivity } from '../../hooks/useUserActivity';
import * as Location from 'expo-location';
import { fetchWeatherFromBackend, sendContextToBackend } from '../../lib/backendApi';

const mapMoodTagToLabel = (moodTag: string): string => {
    if (!moodTag) return 'Your Vibe';
    const parts = moodTag.split('_');
    if (parts.length < 3) return moodTag;

    const [partOfDay, condition, activity] = parts;
    const timeLabels: Record<string, string> = { morning: 'Morning', day: 'Daytime', evening: 'Evening', night: 'Late Night' };
    const conditionLabels: Record<string, string> = { 'Clear sky': 'Sunny', 'Mainly clear': 'Bright', 'Partly cloudy': 'Soft Clouds', 'Overcast': 'Moody Sky', 'Fog': 'Foggy', 'Drizzle': 'Drizzly', 'Freezing Drizzle': 'Icy Drizzle', Rain: 'Rainy', 'Freezing Rain': 'Icy Rain', 'Snow fall': 'Snowy', 'Snow grains': 'Snow Dust', 'Rain showers': 'Showers', 'Snow showers': 'Snow Showers', Thunderstorm: 'Stormy', 'Thunderstorm with hail': 'Hailstorm' };
    const activityLabels: Record<string, string> = { still: 'Chill', walking: 'Walker', running: 'Runner' };

    const time = timeLabels[partOfDay] ?? '';
    const cond = conditionLabels[condition] ?? condition;
    const act = activityLabels[activity] ?? '';

    return [time, cond, act].filter(Boolean).join(' ');
};

const MoodProvider = ({ children }: { children: React.ReactNode }) => {
    const [mood, setMood] = useState<CurrentMoodState>({
        type: 'Detecting...',
        factors: [
            { icon: Cloud, label: 'Weather', value: 'Loading...' },
            { icon: Activity, label: 'Movement', value: 'Loading...' },
            { icon: Sunrise, label: 'Time', value: 'Loading...' },
        ],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const activity = useUserActivity();

    useEffect(() => {
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') throw new Error('Location permission not granted');

                const loc = await Location.getCurrentPositionAsync({});
                const { latitude, longitude } = loc.coords;
                const now = new Date();
                const hour = now.getHours();

                const weather = await fetchWeatherFromBackend(latitude, longitude);
                const contextResp = await sendContextToBackend({ lat: latitude, lon: longitude, activity, hour });

                const timeLabel =
                    hour < 6 ? 'Late Night' :
                    hour < 12 ? 'Morning' :
                    hour < 18 ? 'Afternoon' :
                    'Evening';

                const movementLabel =
                    activity === 'still' ? 'Still' :
                    activity === 'walking' ? 'Walking' :
                    'Running';

                setMood({
                    type: mapMoodTagToLabel(contextResp.moodTag),
                    factors: [
                        {
                            icon: Cloud,
                            label: 'Weather',
                            value: `${weather.temperature.toFixed(1)}°C ${weather.condition}`,
                        },
                        {
                            icon: Activity,
                            label: 'Movement',
                            value: movementLabel,
                        },
                        {
                            icon: Sunrise,
                            label: 'Time',
                            value: timeLabel,
                        },
                    ],
                });
            } catch (e: any) { 
                setError(e.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [activity]);

    return (
        <MoodContext.Provider value={{ mood, loading, error }}>
            {children}
        </MoodContext.Provider>
    );
};

export default function TabLayout() {
  const inactiveColor = 'rgba(255, 255, 255, 0.4)';
  const activeColor = '#c471ed';
  const iconSize = 30;

  return (
    <MoodProvider>
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
    </MoodProvider>
  );
}
