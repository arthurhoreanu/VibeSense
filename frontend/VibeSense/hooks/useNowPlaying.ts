import { useState, useEffect } from 'react';
import { auth } from '@/config/firebaseConfig';
import { fetchNowPlaying, NowPlayingResponse } from '../lib/backendApi';

const useNowPlaying = () => {
    const [nowPlaying, setNowPlaying] = useState<NowPlayingResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchAndSetNowPlaying = async () => {
            try {
                const data = await fetchNowPlaying(user.uid);
                setNowPlaying(data);
                if (error) setError(null); 
            } catch (e: any) {
                setError(e.message || 'Failed to fetch now playing data');
                console.error(e);
            }
        };

        // Fetch immediately on mount
        fetchAndSetNowPlaying().finally(() => setLoading(false));

        // Then, fetch every 5 seconds
        const intervalId = setInterval(fetchAndSetNowPlaying, 5000);

        // Cleanup on unmount
        return () => clearInterval(intervalId);
    }, [error]);

    return { nowPlaying, loading, error };
};

export default useNowPlaying;
