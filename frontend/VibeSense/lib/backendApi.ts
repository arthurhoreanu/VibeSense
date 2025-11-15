import { BACKEND_URL } from "../constants/env";

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
  noiseLevel: "quiet" | "noisy";
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
