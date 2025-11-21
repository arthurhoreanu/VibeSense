import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, AppState } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useRouter, Stack } from 'expo-router';
import { auth } from '@/config/firebaseConfig';

const NGROK_URL = 'https://lavera-uncountermandable-orbiculately.ngrok-free.dev';

export default function ConnectScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Check if already connected when returning from browser
    useEffect(() => {
        const subscription = AppState.addEventListener('change', async (nextAppState) => {
            if (nextAppState === 'active') {
                await checkConnectionStatus();
            }
        });
        
        // Initial check
        checkConnectionStatus();

        return () => {
            subscription.remove();
        };
    }, []);

    useEffect(() => {
        const handleDeepLink = (event: { url: string }) => {
            const { url } = event;
            if (url && url.startsWith('vibesense://spotify-connected')) {
                WebBrowser.dismissBrowser();

                const { queryParams } = Linking.parse(url);
                if (queryParams?.status === 'success') {
                    router.replace('/(tabs)/home');
                } else if (queryParams?.status === 'error') {
                    Alert.alert(
                        'Connection Failed',
                        `Something went wrong: ${queryParams.message || 'Please try again.'}`
                    );
                }
            }
        };

        const subscription = Linking.addEventListener('url', handleDeepLink);
        Linking.getInitialURL().then(url => url && handleDeepLink({ url }));

        return () => {
            subscription.remove();
        };
    }, []);

    const checkConnectionStatus = async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const response = await fetch(`${NGROK_URL}/spotify/status?uid=${user.uid}`);
            if (response.ok) {
                const data = await response.json();
                if (data.isConnected) {
                    router.replace('/(tabs)/home');
                }
            }
        } catch (error) {
            console.error("Failed to check Spotify status:", error);
        }
    };

    const handleConnect = async () => {
        const user = auth.currentUser;
        if (!user) {
            Alert.alert("Error", "You must be logged in to connect to Spotify.");
            return;
        }

        setLoading(true);
        const uid = user.uid;
        const backendUrl = `${NGROK_URL}/spotify/login?uid=${uid}`;

        try {
            await WebBrowser.openBrowserAsync(backendUrl);
        } catch (error) {
            Alert.alert(
                "Error",
                `Could not open browser. Make sure your ngrok tunnel is active.`
            );
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={['#0f172a', '#3b0764', '#020617']}
            style={styles.container}
        >
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.content}>
                <LinearGradient
                    colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']}
                    style={styles.iconContainer}
                >
                    <Image 
                        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2111/2111624.png' }} 
                        style={styles.spotifyLogo}
                        resizeMode="contain"
                    />
                </LinearGradient>
                
                <Text style={styles.title}>Unlock Your Vibe</Text>
                <Text style={styles.subtitle}>
                    VibeSense detects your vibe based on weather, time, and movement.
                    {'\n\n'}
                    Connect Spotify to let our smart engine automatically queue the perfect tracks for your current reality.
                </Text>

                <TouchableOpacity 
                    onPress={handleConnect} 
                    style={styles.button}
                    disabled={loading}
                >
                    <LinearGradient
                        colors={['#1DB954', '#1ED760']}
                        style={styles.buttonGradient}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Connecting...' : 'Connect Spotify'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    content: {
        alignItems: 'center',
        gap: 24,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        padding: 12, // Reduced from 20 to make logo bigger and halo gap smaller
        // Futuristic Glow Styles
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)', // Thin subtle border
        shadowColor: '#1DB954', // Spotify Green Glow
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 15,
    },
    spotifyLogo: {
        width: '100%',
        height: '100%',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#94a3b8',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
        paddingHorizontal: 10,
    },
    button: {
        width: '100%',
        borderRadius: 16,
        shadowColor: '#1DB954',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    buttonGradient: {
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
