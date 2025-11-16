import { BACKEND_URL } from "../constants/env";
import { auth } from "@/config/firebaseConfig";

export type WeatherResponse = {
  temperature: number;
  condition: string;
  isDay: boolean;
  precipitation: {
    hasRain: boolean;
    hasShowers: boolean;
    hasSnowfall: boolean;
  };
  sunInfo: {
    sunrise: string;
    sunset: string;
  };
};

export type ContextResponse = {
  moodTag: string;
  message: string;
};

export type NowPlayingResponse = {
    isPlaying: boolean;
    trackName: string | null;
    artistName: string | null;
    albumName: string | null;
    durationMs: number | null;
    progressMs: number | null;
    albumImageUrl: string | null;
};

export async function fetchWeatherFromBackend(
  lat: number,
  lon: number
): Promise<WeatherResponse> {
  const res = await fetch(
    `${BACKEND_URL}/weather?lat=${lat}&lon=${lon}`
  );
  if (!res.ok) {
    throw new Error("Weather API error");
  }

  return (await res.json()) as WeatherResponse;
}

export async function sendContextToBackend(params: {
  lat: number;
  lon: number;
  activity: "still" | "walking" | "running";
  hour: number;
}): Promise<ContextResponse> {
  const res = await fetch(`${BACKEND_URL}/context`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error("Context API error");
  }

  return (await res.json()) as ContextResponse;
}

export async function fetchNowPlaying(uid: string): Promise<NowPlayingResponse> {
    const res = await fetch(`${BACKEND_URL}/spotify/now-playing?uid=${uid}`);
    if (!res.ok) {
        throw new Error(`Now Playing API error: ${res.statusText}`);
    }
    return (await res.json()) as NowPlayingResponse;
}

const playerAction = async (action: 'play' | 'pause' | 'next' | 'previous', method: string, body?: any) => {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const res = await fetch(`${BACKEND_URL}/spotify/${action}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid, ...body })
    });

    if (!res.ok) {
        throw new Error(`Spotify player action failed: ${res.statusText}`);
    }
};

export const play = () => playerAction('play', 'PUT');
export const pause = () => playerAction('pause', 'PUT');
export const next = () => playerAction('next', 'POST');
export const previous = () => playerAction('previous', 'POST');

export const addToQueue = async (trackUri: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const res = await fetch(`${BACKEND_URL}/spotify/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid, track_uri: trackUri })
    });

    if (!res.ok) {
        throw new Error(`Spotify addToQueue failed: ${res.statusText}`);
    }
};