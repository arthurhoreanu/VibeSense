import { useState, useEffect, useCallback, useRef } from 'react';
import { auth } from '@/config/firebaseConfig';
import { fetchNowPlaying, fetchQueue, generateMoodTrack, NowPlayingResponse } from '../lib/backendApi';
import { useUserActivity } from './useUserActivity';
import { fetchWeatherFromBackend } from '../lib/backendApi';
import * as Location from 'expo-location';

const useNowPlaying = () => {
    const [nowPlaying, setNowPlaying] = useState<NowPlayingResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const activity = useUserActivity();
    const activityRef = useRef(activity);
    const generatingRef = useRef(false);
    const checkingQueueRef = useRef(false);
    const lastGeneratedTrackIdRef = useRef<string | null>(null);

    useEffect(() => {
        activityRef.current = activity;
    }, [activity]);

    // Queue Check Logic - Stable identity
    const checkQueue = useCallback(async (uid: string, currentTrack: NowPlayingResponse | null) => {
        // Prevent overlapping checks or if already generating
        if (checkingQueueRef.current || generatingRef.current) {
            return;
        }

        // Must have a playing track to calculate remaining time
        if (!currentTrack || !currentTrack.durationMs || !currentTrack.progressMs || !currentTrack.trackName) {
            return;
        }

        checkingQueueRef.current = true;

        try {
            const remainingMs = currentTrack.durationMs - currentTrack.progressMs;
            const isEndingSoon = remainingMs < 30000;
            const currentTrackId = `${currentTrack.trackName}-${currentTrack.artistName}`;
            const isNewTrack = currentTrackId !== lastGeneratedTrackIdRef.current;

            console.log(`[Queue Check] Remaining: ${remainingMs}ms | EndingSoon: ${isEndingSoon} | New: ${isNewTrack}`);

            // TRIGGER: If track is ending soon AND we haven't generated a follow-up for THIS track yet
            if (isEndingSoon && isNewTrack) {
                console.log("[Queue Check] Track ending soon. Triggering generation...");
                generatingRef.current = true;
                
                // Mark this track as handled immediately so we don't trigger multiple times for the same song
                lastGeneratedTrackIdRef.current = currentTrackId;

                // --- 1. Gather Sensor Data ---
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                     console.warn("[Mood Generation] Location permission denied");
                     generatingRef.current = false;
                     return;
                }

                const location = await Location.getCurrentPositionAsync({});
                const weather = await fetchWeatherFromBackend(location.coords.latitude, location.coords.longitude);
                
                if (!auth.currentUser) return;

                // --- 2. Construct Context ---
                const hour = new Date().getHours();
                let timeOfDay = "day";
                if (hour >= 5 && hour < 12) timeOfDay = "morning";
                else if (hour >= 12 && hour < 17) timeOfDay = "day";
                else if (hour >= 17 && hour < 21) timeOfDay = "evening";
                else timeOfDay = "night";

                const context = {
                    timeOfDay: timeOfDay,
                    weatherCondition: weather.condition,
                    activityType: activityRef.current
                };

                console.log("[Mood Generation] Context ready:", context);

                // --- 3. Call Backend ---
                await generateMoodTrack(uid, context);
                
                console.log("[Mood Generation] SUCCESS: Track added to queue head.");
            }
        } catch (e) {
            console.error("[Queue Check] Error:", e);
        } finally {
            checkingQueueRef.current = false;
            generatingRef.current = false;
        }
    }, []);

    const refreshNowPlaying = useCallback(async () => {
        const user = auth.currentUser;
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const data = await fetchNowPlaying(user.uid);
            setNowPlaying(data);
            setError(null);
            checkQueue(user.uid, data);

        } catch (e: any) {
            setError(e.message || 'Failed to fetch now playing data');
            console.error("[NowPlaying] Error:", e);
        }
    }, [checkQueue]);

    useEffect(() => {
        refreshNowPlaying().finally(() => setLoading(false));

        const intervalId = setInterval(refreshNowPlaying, 5000);

        return () => clearInterval(intervalId);
    }, [refreshNowPlaying]);

    return { nowPlaying, loading, error, refreshNowPlaying };
};

export default useNowPlaying;
