import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from '@/config/firebaseConfig';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, History } from 'lucide-react-native';
import { fetchHistory, HistoryTrack } from '@/lib/backendApi';
import { formatTimeAgo } from '@/lib/utils';

export default function HistoryScreen() {
    const router = useRouter();
    const [history, setHistory] = useState<HistoryTrack[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadHistory = async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    // Fetch more items for the full history page
                    const tracks = await fetchHistory(user.uid, 50);
                    setHistory(tracks);
                } catch (error) {
                    console.error("Failed to load history:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        loadHistory();
    }, []);

    return (
        <LinearGradient
            colors={['#0f172a', '#3b0764', '#020617']}
            style={{ flex: 1 }}
        >
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft color="white" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Listening History</Text>
            </View>

            <ScrollView contentContainerStyle={styles.svContainer}>
                {loading ? (
                    <Text style={styles.loadingText}>Loading history...</Text>
                ) : (
                    <View style={{ gap: 12 }}>
                        {history.map((track, i) => (
                            <View key={i} style={styles.trackItem}>
                                <Image source={{ uri: track.albumImageUrl || undefined }} style={styles.trackArt} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.trackTitle}>{track.trackName}</Text>
                                    <Text style={styles.trackArtist}>{track.artistName}</Text>
                                </View>
                                <Text style={styles.trackTime}>{formatTimeAgo(track.playedAt)}</Text>
                            </View>
                        ))}
                        {history.length === 0 && (
                            <View style={styles.emptyState}>
                                <History color="#64748b" size={48} />
                                <Text style={styles.emptyStateText}>No listening history found yet.</Text>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
    },
    backButton: {
        padding: 8,
        marginRight: 16,
    },
    headerTitle: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    svContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    loadingText: {
        color: '#94a3b8',
        textAlign: 'center',
        marginTop: 40,
    },
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
        width: 56, 
        height: 56, 
        borderRadius: 8, 
        backgroundColor: '#334155' 
    },
    trackTitle: { 
        color: 'white', 
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    trackArtist: { 
        color: '#94a3b8', 
        fontSize: 14 
    },
    trackTime: { 
        color: '#64748b', 
        fontSize: 12,
        marginLeft: 8,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        gap: 16,
    },
    emptyStateText: {
        color: '#64748b',
        fontSize: 16,
    }
});
