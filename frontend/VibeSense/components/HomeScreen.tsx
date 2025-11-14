import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { auth } from '../config/firebaseConfig';
import * as Linking from 'expo-linking';
import { 
    Play,
    Activity,
    Volume2,
    Cloud,
    Zap,
    CheckCircle2,
    Award,
    TrendingUp,
    Sunrise,
    ChevronRight,
    History,
    Home,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

// TODO: Replace with the actual URL
const NGROK_URL = 'https://vibesense.ngrok-free.dev';

const currentMood = {
    type: 'Energetic Explorer',
    confidence: 87,
    factors: [
        { icon: Cloud, label: 'Weather', value: '24°C Clear' },
        { icon: Activity, label: 'Movement', value: 'Walking' },
        { icon: Volume2, label: 'Ambient', value: 'Moderate' },
        { icon: Sunrise, label: 'Time', value: 'Afternoon' },
    ],
};

const currentSong = {
    title: 'Apple',
    artist: 'Charli xcx',
    album: 'BRAT',
    duration: 154,
    current: 67,
};

const recentTracks = [
    { time: '2h ago', title: 'Espresso', artist: 'Sabrina Carpenter', colors: ['#3b82f6', '#06b6d4'] as const },
    { time: '5h ago', title: 'Good Luck, Babe!', artist: 'Chappell Roan', colors: ['#a855f7', '#ec4899'] as const },
    { time: 'Yesterday', title: 'Levitating', artist: 'Dua Lipa', colors: ['#4f46e5', '#7e22ce'] as const },
];

const Progress = ({ value }: { value: number }) => (
    <View style={styles.progressContainer}>
        <View style={[styles.progressFill, { width: `${value}%` }]} />
    </View>
);

export function HomeScreen() {
    const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);

    // Effect to handle Spotify connection status check, tied to Firebase auth state
    useEffect(() => {
        const unsubscribeFromAuth = auth.onAuthStateChanged(async (user) => {
            if (user) {
                // User is signed in, now we can safely check their Spotify status
                try {
                    const response = await fetch(`${NGROK_URL}/spotify/status?uid=${user.uid}`);
                    if (response.ok) {
                        const data = await response.json();
                        setIsSpotifyConnected(data.isConnected);
                    }
                } catch (error) {
                    console.error("Failed to check Spotify status:", error);
                    setIsSpotifyConnected(false); // Assume not connected on error
                }
            } else {
                // User is signed out, so they can't be connected to Spotify
                setIsSpotifyConnected(false);
            }
        });

        // Cleanup the auth listener on component unmount
        return unsubscribeFromAuth;
    }, []); // Empty dependency array ensures this runs only once to set up the listener

    // Effect to handle the deep link callback from Spotify
    useEffect(() => {
        const handleDeepLink = (event: { url: string; }) => {
            const { url } = event;
            if (url && url.startsWith('vibesense://spotify-connected')) {
                WebBrowser.dismissBrowser();

                const { queryParams } = Linking.parse(url);
                if (queryParams?.status === 'success') {
                    Alert.alert('Success!', 'Your Spotify account has been connected.');
                    setIsSpotifyConnected(true); // Update state for instant feedback
                } else if (queryParams?.status === 'error') {
                    Alert.alert('Connection Failed', `Something went wrong: ${queryParams.message || 'Please try again.'}`);
                }
            }
        };

        const subscription = Linking.addEventListener('url', handleDeepLink);
        Linking.getInitialURL().then(url => url && handleDeepLink({ url }));

        // Cleanup the linking listener on component unmount
        return () => {
            subscription.remove();
        };
    }, []); // Empty dependency array ensures this runs only once to set up the listener

    const handleSpotifyConnect = async () => {
        const user = auth.currentUser;
        if (!user) {
            Alert.alert("Error", "You must be logged in to connect to Spotify.");
            return;
        }

        const uid = user.uid;
        const backendUrl = `${NGROK_URL}/spotify/login?uid=${uid}`;

        try {
            await WebBrowser.openBrowserAsync(backendUrl);
        } catch (error) {
            Alert.alert("Error", `Could not open browser. Make sure your ngrok tunnel is active.`);
            console.error(error);
        }
    };

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
                </Animated.View>

                <View style={styles.cardMargin}>
                    <LinearGradient
                        colors={['#8b5cf6', '#d946ef']}
                        style={styles.moodCard}
                    >
                        <View style={styles.moodHeader}>
                            <View>
                                <Text style={styles.moodSubText}>Current Mood</Text>
                                <Text style={styles.moodTitle}>{currentMood.type}</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={styles.moodConfidence}>{currentMood.confidence}%</Text>
                                <Text style={styles.moodSubText}>Confidence</Text>
                            </View>
                        </View>

                        <View style={styles.factorsGrid}>
                            {currentMood.factors.map((factor, i) => (
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
                <View style={styles.sectionContainer}>
                    {isSpotifyConnected ? (
                        <View style={[styles.spotifyButtonGradient, styles.connectedButton]}>
                            <CheckCircle2 color="white" size={20} />
                            <Text style={styles.spotifyButtonText}>You are connected to Spotify</Text>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={handleSpotifyConnect} style={styles.spotifyButton}>
                            <LinearGradient
                                colors={['#1DB954', '#1ED760']}
                                style={styles.spotifyButtonGradient}
                            >
                                <Zap color="white" size={20} />
                                <Text style={styles.spotifyButtonText}>Connect to Spotify</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.sectionContainer}>
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
                            <LinearGradient colors={['#a855f7', '#ec4899']} style={styles.playIconContainer}>
                                <Play width={24} height={24} color="white" fill="white" />
                            </LinearGradient>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.songTitle}>{currentSong.title}</Text>
                                <Text style={styles.songArtist}>{currentSong.artist}</Text>
                                <Progress value={(currentSong.current / currentSong.duration) * 100} />
                            </View>
                        </View>
                    </LinearGradient>
                </View>
                 <View style={styles.sectionContainer}>
                     <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Tracks</Text>
                        <History width={20} height={20} color="#c084fc" />
                    </View>
                    <View style={{ gap: 8 }}>
                        {recentTracks.map((track, i) => (
                            <View key={i} style={styles.trackItem}>
                                <LinearGradient colors={track.colors} style={styles.trackArt}>
                                    <Play width={16} height={16} color="white" />
                                </LinearGradient>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.trackTitle}>{track.title}</Text>
                                    <Text style={styles.trackArtist}>{track.artist}</Text>
                                </View>
                                <Text style={styles.trackTime}>{track.time}</Text>
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity style={styles.historyButton}>
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
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    moodSubText: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
    moodTitle: { color: 'white', fontSize: 24, fontWeight: '600' },
    moodConfidence: { color: 'white', fontSize: 30, fontWeight: 'bold' },
    factorsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    factorItem: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 12,
        width: '48.5%',
        marginBottom: 10,
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
    spotifyButton: {
        borderRadius: 16,
        shadowColor: '#1DB954',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    spotifyButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 16,
        borderRadius: 16,
    },
    spotifyButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    connectedButton: {
        backgroundColor: '#1aa34a',
    },
});
