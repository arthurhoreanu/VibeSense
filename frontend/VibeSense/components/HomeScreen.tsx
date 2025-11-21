import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, AppState } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from '@/config/firebaseConfig';
import { useRouter, useFocusEffect } from 'expo-router';
import { Play, ChevronRight, History, Home } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import useNowPlaying from '../hooks/useNowPlaying';
import { useMood } from '../context/MoodContext';
import { fetchHistory, HistoryTrack } from '@/lib/backendApi';
import { formatTimeAgo } from '@/lib/utils';

const Progress = ({ value }: { value: number }) => (
    <View style={styles.progressContainer}>
        <View style={[styles.progressFill, { width: `${value}%` }]} />
    </View>
);

export function HomeScreen() {
    const router = useRouter();
    const { mood, loading: moodLoading, error: moodError } = useMood();
    const { nowPlaying } = useNowPlaying();
    const [recentTracks, setRecentTracks] = useState<HistoryTrack[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [lastTrackName, setLastTrackName] = useState<string | null>(null);

    const loadHistory = async (uid: string) => {
        try {
            if (recentTracks.length === 0) {
                setHistoryLoading(true);
            }
            const tracks = await fetchHistory(uid, 3);
            setRecentTracks(tracks);
        } catch (e) {
            console.error("Failed to load history", e);
        } finally {
            setHistoryLoading(false);
        }
    };

    // Refresh history when the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            if (auth.currentUser) {
                loadHistory(auth.currentUser.uid);
            }
        }, [])
    );

    // Refresh when app comes to foreground
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active' && auth.currentUser) {
                loadHistory(auth.currentUser.uid);
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);

    // Refresh history when the track changes
    useEffect(() => {
        if (nowPlaying?.trackName !== lastTrackName) {
            if (auth.currentUser) {
                loadHistory(auth.currentUser.uid);
            }
            setLastTrackName(nowPlaying?.trackName ?? null);
        }
    }, [nowPlaying?.trackName, lastTrackName]);

    return (
        <LinearGradient
            colors={['#0f172a', '#3b0764', '#020617']}
            style={{ flex: 1 }}
        >
            <ScrollView contentContainerStyle={styles.svContainer}>
                {/* Header */}
                <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
                    <View style={styles.headerTitleRow}>
                        <Home color="#c084fc" size={20} />
                        <Text style={styles.headerSubtitle}>Home</Text>
                    </View>
                    <Text style={styles.headerTitle}>Your Vibe</Text>
                    {moodLoading && <Text style={{ color: '#94a3b8', marginTop: 4 }}>Updating mood...</Text>}
                    {moodError && <Text style={{ color: '#f87171', marginTop: 4 }}>{moodError}</Text>}
                </Animated.View>

                <View style={styles.cardMargin}>
                    <LinearGradient
                        colors={['#8b5cf6', '#d946ef']}
                        style={styles.moodCard}
                    >
                        <View style={styles.moodHeader}>
                            <View>
                                <Text style={styles.moodSubText}>Current Mood</Text>
                                <Text style={styles.moodTitle}>{mood.type}</Text>
                            </View>
                        </View>

                        <View>
                            {mood.factors.map((factor, i) => (
                                <View key={i} style={styles.factorItem}>
                                    <View style={styles.factorHeader}>
                                        <factor.icon width={16} height={16} color="white" />
                                        <Text style={styles.factorLabel}>{factor.label}</Text>
                                    </View>
                                    <Text style={styles.factorValue}>{factor.value}</Text>
                                </View>
                            ))}
                        </View>
                    </LinearGradient>
                </View>

                {/* Stats Summary (placeholder) */}
                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={[styles.statValue, { color: '#22d3ee' }]}>247</Text>
                        <Text style={styles.statLabel}>Points</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={[styles.statValue, { color: '#c084fc' }]}>18</Text>
                        <Text style={styles.statLabel}>New Tracks</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={[styles.statValue, { color: '#f472b6' }]}>5.2h</Text>
                        <Text style={styles.statLabel}>Today</Text>
                    </View>
                </View>

                {nowPlaying?.isPlaying && (
                <TouchableOpacity onPress={() => router.push('/playing')} style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Now Playing</Text>
                        <View style={styles.liveBadge}>
                            <Play width={12} height={12} color="#4ade80" fill="#4ade80" style={{ marginRight: 4 }}/>
                            <Text style={styles.liveBadgeText}>Live</Text>
                        </View>
                    </View>

                    <LinearGradient
                        colors={['#1e293b', '#0f172a']}
                        style={styles.playingCard}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                             <Image source={{ uri: nowPlaying.albumImageUrl || undefined }} style={styles.playIconContainer} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.songTitle}>{nowPlaying.trackName}</Text>
                                <Text style={styles.songArtist}>{nowPlaying.artistName}</Text>
                                <Progress value={(nowPlaying.progressMs && nowPlaying.durationMs) ? (nowPlaying.progressMs / nowPlaying.durationMs) * 100 : 0} />
                            </View>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
                )}

                {/* Recent Tracks */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Tracks</Text>
                        <TouchableOpacity onPress={() => router.push('/history')}>
                             <History width={20} height={20} color="#c084fc" />
                        </TouchableOpacity>
                    </View>
                    {historyLoading && recentTracks.length === 0 ? (
                        <Text style={{color: 'gray'}}>Loading history...</Text>
                    ) : (
                    <View style={{ gap: 8 }}>
                        {recentTracks.map((track, i) => (
                            <View key={i} style={styles.trackItem}>
                                <Image source={{ uri: track.albumImageUrl || undefined }} style={styles.trackArt} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.trackTitle}>{track.trackName}</Text>
                                    <Text style={styles.trackArtist}>{track.artistName}</Text>
                                </View>
                                <Text style={styles.trackTime}>{formatTimeAgo(track.playedAt)}</Text>
                            </View>
                        ))}
                    </View>
                    )}

                    <TouchableOpacity style={styles.historyButton} onPress={() => router.push('/history')}>
                        <Text style={styles.historyButtonText}>Show Entire History</Text>
                        <ChevronRight width={16} height={16} color="white" />
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    svContainer: {
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: { marginBottom: 24, paddingHorizontal: 20 },
    headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    headerSubtitle: { color: '#c084fc', fontSize: 16 },
    headerTitle: { color: 'white', fontSize: 34, fontWeight: 'bold' },
    cardMargin: { marginHorizontal: 20, marginBottom: 24 },
    moodCard: { borderRadius: 24, padding: 24, overflow: 'hidden' },
    moodHeader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    moodSubText: { color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'center' },
    moodTitle: { color: 'white', fontSize: 24, fontWeight: '600', textAlign: 'center' },
    factorItem: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        alignItems: 'center',
    },
    factorHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    factorLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
    factorValue: { color: 'white', fontSize: 14, fontWeight: '500' },
    statsContainer: {
        marginHorizontal: 20,
        marginBottom: 24,
        flexDirection: 'row',
        gap: 12
    },
    statBox: {
        flex: 1,
        backgroundColor: 'rgba(51, 65, 85, 0.5)',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(51, 65, 85, 0.5)',
        alignItems: 'center'
    },
    statValue: { fontSize: 24, fontWeight: 'bold' },
    statLabel: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
    sectionContainer: { marginHorizontal: 20, marginBottom: 24 },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: { color: 'white', fontSize: 18, fontWeight: '600' },
    liveBadge: {
        backgroundColor: 'rgba(74, 222, 128, 0.2)',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 6,
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    liveBadgeText: { color: '#4ade80', fontSize: 12, fontWeight: '500' },
    playingCard: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(168, 85, 247, 0.2)',
    },
    playIconContainer: {
        width: 64, height: 64, borderRadius: 12, justifyContent: 'center', alignItems: 'center'
    },
    songTitle: { color: 'white', fontSize: 16, fontWeight: '500' },
    songArtist: { color: '#d8b4fe', fontSize: 14 },
    progressContainer: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 2,
        marginTop: 8,
        overflow: 'hidden'
    },
    progressFill: { height: '100%', backgroundColor: 'white', borderRadius: 2 },
    trackItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: 'rgba(51, 65, 85, 0.5)',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(51, 65, 85, 0.5)',
    },
    trackArt: {
        width: 48, height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center'
    },
    trackTitle: { color: 'white', fontSize: 14 },
    trackArtist: { color: '#94a3b8', fontSize: 12 },
    trackTime: { color: '#64748b', fontSize: 12 },
    historyButton: {
        width: '100%',
        backgroundColor: 'rgba(51, 65, 85, 0.5)',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(51, 65, 85, 0.5)',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
    },
    historyButtonText: { color: 'white', fontSize: 14, fontWeight: '500' },
});
