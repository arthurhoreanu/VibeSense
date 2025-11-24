import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

import { useColorScheme } from '@/components/useColorScheme';
import { BACKEND_URL } from '../constants/env';

const BACKGROUND_FETCH_TASK = 'background-context-update';

// 1. Define the background task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    const uid = await AsyncStorage.getItem('user_uid');
    if (!uid) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const contextUrl = `${BACKEND_URL}/context`;
    await fetch(contextUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: uid,
        lat: 44.4268, // Placeholder
        lon: 26.1025, // Placeholder
        hour: new Date().getHours(),
        activity: "still" // Placeholder
      }),
    });
    
    console.log('[BackgroundFetch] Task completed successfully');
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('[BackgroundFetch] Task failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// 2. Helper function to register the task (now more robust)
async function registerBackgroundFetchAsync() {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
  if (isRegistered) {
    console.log('Background task is already registered.');
    return;
  }

  console.log('Registering background task for the first time...');
  const status = await BackgroundFetch.getStatusAsync();
  if (status === BackgroundFetch.BackgroundFetchStatus.Denied) {
      console.error('Background fetch permission denied. Please enable it in device settings.');
      alert('To receive notifications when the app is closed, please enable Background App Refresh in your device settings.');
      return;
  }
  if (status === BackgroundFetch.BackgroundFetchStatus.Restricted) {
      console.error('Background fetch is restricted on this device.');
      return;
  }

  await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 15 * 60, // ~15 minutes
    stopOnTerminate: false,
    startOnBoot: true,
  });
  console.log('Background task registered successfully.');
}

// 3. Helper function to unregister the task
async function unregisterBackgroundFetchAsync() {
  console.log('Unregistering background task...');
  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
  if (isRegistered) {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    console.log('Background task unregistered successfully.');
  }
}

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

SplashScreen.preventAutoHideAsync();

async function registerForPushNotificationsAsync() {
  let token;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    alert('Failed to get push token! Please enable notifications.');
    return;
  }
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    token = tokenData.data;
  } catch (e) {
    console.error("Failed to get push token", e);
  }
  return token;
}

async function sendTokenToBackend(uid: string, token: string) {
  const backendUrl = `${BACKEND_URL}/users/token`;
  try {
    await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, token }),
    });
  } catch (error) {
    console.error("Error sending token to backend:", error);
  }
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => { if (error) throw error; }, [error]);
  useEffect(() => { if (loaded) SplashScreen.hideAsync(); }, [loaded]);

  if (!loaded) return null;

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const authLogicHasRun = useRef(false); // Guard to prevent double execution

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (authLogicHasRun.current) {
        return;
      }

      if (user) {
        authLogicHasRun.current = true;
        await AsyncStorage.setItem('user_uid', user.uid);
        await registerBackgroundFetchAsync();
        
        const token = await registerForPushNotificationsAsync();
        if (token) {
          await sendTokenToBackend(user.uid, token);
        }

        router.replace('/(tabs)/home');
      } else {
        authLogicHasRun.current = true;
        await AsyncStorage.removeItem('user_uid');
        await unregisterBackgroundFetchAsync();
        router.replace('/login');
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="privacy-security" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
