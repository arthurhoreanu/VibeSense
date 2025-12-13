import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDoc, doc } from 'firebase/firestore';
import { db, auth } from '../config/firebaseConfig';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const MORNING_MESSAGES = [
  "Hey, {Username}! Ready to start the day? Let's set the vibe right.",
  "Morning, {Username}! Today’s soundtrack is waiting for you 🎧",
  "Rise and shine! Your vibe is calling 🌞",
  "New day, new mood. Want some fresh tunes?",
  "Hey, {Username}! Let's kickstart the day with good energy.",
];

const NOON_MESSAGES = [
  "Hey, {Username}! Mid-day vibes check — need a mood boost?",
  "Quick break? I’ve got the perfect soundtrack 🍔🎶",
  "Feeling the midday slump? Music can help 👀",
  "Hey! Wanna switch up the vibe for the afternoon?",
  "Your day’s not over — let's keep the energy going!",
];

const EVENING_MESSAGES = [
  "Hey, {Username}! Time to unwind!",
  "Evening mode activated 🌙 Ready for some tunes?",
  "Long day? Let’s slow it down together.",
  "How are you feeling tonight? I’ve got music for that.",
  "Ready to switch to evening vibes?",
];

async function getUsername() {
  try {
    const user = auth.currentUser;
    if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
             const data = userDoc.data();
             if (data && data.username) {
                 return data.username;
             }
        }
        return user.displayName || "Friend";
    }
    return "Friend";
  } catch (error) {
    console.log("Error fetching username:", error);
    return "Friend";
  }
}

function getRandomMessage(messages: string[], username: string) {
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex].replace('{Username}', username);
}

export async function scheduleDailyNotifications() {
  const username = await getUsername();

  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Good Morning!",
      body: getRandomMessage(MORNING_MESSAGES, username),
    },
    trigger: {
      hour: 9,
      minute: 0,
      repeats: true,
    } as any,
  });

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Vibe Check",
      body: getRandomMessage(NOON_MESSAGES, username),
    },
    trigger: {
      hour: 13,
      minute: 0,
      repeats: true,
    } as any,
  });

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Good Evening",
      body: getRandomMessage(EVENING_MESSAGES, username),
    },
    trigger: {
      hour: 20,
      minute: 0,
      repeats: true,
    } as any,
  });

  console.log("Daily notifications scheduled.");
}

export async function registerForPushNotificationsAsync() {
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
    console.log('Failed to get permissions for notifications');
    return;
  }

  await scheduleDailyNotifications();
}
