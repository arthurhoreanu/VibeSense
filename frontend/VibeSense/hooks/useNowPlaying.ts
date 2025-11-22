import { useState, useEffect, useCallback } from 'react';
import { auth } from '@/config/firebaseConfig';
import { fetchNowPlaying, NowPlayingResponse } from '../lib/backendApi';

const useNowPlaying = () => {
    const [nowPlaying, setNowPlaying] = useState<NowPlayingResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
        } catch (e: any) {
            setError(e.message || 'Failed to fetch now playing data');
            console.error(e);
        }
    }, []);

    useEffect(() => {
        refreshNowPlaying().finally(() => setLoading(false));

        const intervalId = setInterval(refreshNowPlaying, 5000);

        return () => clearInterval(intervalId);
    }, [refreshNowPlaying]);

    return { nowPlaying, loading, error, refreshNowPlaying };
};

export default useNowPlaying;
