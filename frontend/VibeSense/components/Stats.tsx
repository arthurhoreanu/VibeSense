import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, AppState, AppStateStatus } from 'react-native';
import { Trophy, Zap, Music, Award, Star, Target, TrendingUp, Clock, Headphones } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { auth, db } from '../config/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import useNowPlaying from '../hooks/useNowPlaying';

const pointBadges = [
  { points: 1000, name: 'Legendary Vibesmith', icon: Trophy, colors: ['#FBBF24', '#F59E0B'] as const },
  { points: 500, name: 'Vibe Virtuoso', icon: Award, colors: ['#EC4899', '#EF4444'] as const },
  { points: 400, name: 'Harmony Master', icon: Music, colors: ['#8B5CF6', '#EC4899'] as const },
  { points: 300, name: 'Sound Specialist', icon: Headphones, colors: ['#6366F1', '#8B5CF6'] as const },
  { points: 200, name: 'Rhythm Rider', icon: Zap, colors: ['#F59E0B', '#F97316'] as const },
  { points: 100, name: 'Vibe Explorer', icon: Target, colors: ['#10B981', '#10B981'] as const },
  { points: 50, name: 'Groove Seeker', icon: Star, colors: ['#3B82F6', '#06B6D4'] as const },
  { points: 20, name: 'Beat Beginner', icon: TrendingUp, colors: ['#A78BFA', '#7C3AED'] as const },
  { points: 10, name: 'Fresh Viber', icon: Clock, colors: ['#2DD4BF', '#14B8A6'] as const },
];

export function StatsPage() {
  const [totalPoints, setTotalPoints] = useState(0);
  const [sessionPoints, setSessionPoints] = useState(0);
  const [earnedBadgesList, setEarnedBadgesList] = useState<string[]>([]);
  const appState = useRef(AppState.currentState);

  const { nowPlaying } = useNowPlaying();
  const [pointAwardedForCurrentTrack, setPointAwardedForCurrentTrack] = useState<string | null>(null);

  const syncToFirestore = async (newTotalPoints: number) => {
    const user = auth.currentUser;
    if (!user) return;

    const badges = pointBadges
        .filter(badge => newTotalPoints >= badge.points)
        .map(badge => badge.name);

    setEarnedBadgesList(badges);

    try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { 
            points: newTotalPoints,
            badges: badges 
        }, { merge: true });
        
        console.log("Synced to Firestore:", newTotalPoints);
        setSessionPoints(0);
    } catch (error) {
        console.error("Error syncing to Firestore:", error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const userRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                const points = data.points || 0;
                setTotalPoints(points);
                setEarnedBadgesList(data.badges || []);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    // If no song is playing, or song has no name, reset everything.
    if (!nowPlaying?.trackName || !nowPlaying.artistName) {
      setPointAwardedForCurrentTrack(null);
      return;
    }

    const currentTrackId = `${nowPlaying.trackName}-${nowPlaying.artistName}`;

    // If the song has changed, reset the flag.
    // This allows a new point to be awarded for the new song.
    if (pointAwardedForCurrentTrack !== currentTrackId) {
       setPointAwardedForCurrentTrack(null);
    }
    
    const hasBeenAwarded = pointAwardedForCurrentTrack === currentTrackId;
    const isPlayingFor30s = nowPlaying.progressMs && nowPlaying.progressMs >= 30000;

    if (isPlayingFor30s && !hasBeenAwarded) {
      console.log(`Awarding point for ${currentTrackId}`);
      
      setPointAwardedForCurrentTrack(currentTrackId);

      setTotalPoints(prev => {
          const newPoints = prev + 1;
          setSessionPoints(session => session + 1);
          return newPoints;
      });
    }
  }, [nowPlaying]);

  useEffect(() => {
      if (sessionPoints > 0 && sessionPoints % 5 === 0) {
          syncToFirestore(totalPoints);
      }
  }, [sessionPoints, totalPoints]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        if (sessionPoints > 0) {
            syncToFirestore(totalPoints);
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [sessionPoints, totalPoints]);

  const getCurrentBadge = (points: number) => {
    return pointBadges.find(badge => points >= badge.points);
  };

  const badgesObjects = pointBadges.filter(badge => totalPoints >= badge.points);
  const currentBadge = getCurrentBadge(totalPoints);
  const nextBadge = [...pointBadges].reverse().find(badge => totalPoints < badge.points);

  const getProgress = () => {
    if (!nextBadge) {
      return { percentage: 100, text: "You've unlocked all badges!" };
    }
    const previousPoints = currentBadge?.points || 0;
    const requiredPoints = nextBadge.points - previousPoints;
    const currentProgress = totalPoints - previousPoints;
    const percentage = (currentProgress / requiredPoints) * 100;
    return {
      percentage,
      text: `${totalPoints} / ${nextBadge.points} PTS`,
    };
  };

  const progress = getProgress();

  return (
    <LinearGradient colors={['#0F172A', '#1E1B4B', '#0F172A']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Trophy color="#FBBF24" size={20} />
            <Text style={styles.headerSubtitle}>VibeSense Stats</Text>
          </View>
          <Text style={styles.headerTitle}>Your Journey</Text>
        </Animated.View>

        {/* Points & Progress Card */}
        <Animated.View entering={FadeIn.duration(500).delay(200)}>
          <LinearGradient
            colors={currentBadge ? currentBadge.colors : ['#374151', '#111827']}
            style={styles.statsCard}
          >
            {currentBadge ? (
              <View style={styles.badgeInfo}>
                <View style={styles.badgeIconCircle}>
                  <currentBadge.icon color="white" size={32} />
                </View>
                <View>
                  <Text style={styles.badgeTitle}>Current Badge</Text>
                  <Text style={styles.badgeNameText}>{currentBadge.name}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.badgeInfo}>
                <View style={styles.badgeIconCircle}>
                  <Clock color="white" size={32} />
                </View>
                <View>
                  <Text style={styles.badgeTitle}>No badge yet</Text>
                  <Text style={styles.badgeNameText}>Start listening to earn points!</Text>
                </View>
              </View>
            )}

            <View style={styles.pointsSection}>
              <Text style={styles.pointsValue}>{totalPoints}</Text>
              <Text style={styles.pointsLabel}>Vibe Points</Text>
            </View>

            <View>
              <View style={styles.progressBar}>
                <Animated.View style={[styles.progressBarFill, { width: `${progress.percentage}%` }]} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.progressText}>Progress</Text>
                <Text style={styles.progressText}>{progress.text}</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Badges Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Badges</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesGrid}>
            {badgesObjects.map((badge, i) => (
              <Animated.View key={badge.points} entering={FadeIn.duration(500).delay(500 + i * 100)}>
                <LinearGradient colors={badge.colors} style={styles.badgeCard}>
                  <View style={[styles.badgeIconContainer]}>
                    <badge.icon color="white" size={28} />
                  </View>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                  <Text style={styles.badgeDescription}>
                    Earned at {badge.points} points
                  </Text>
                </LinearGradient>
              </Animated.View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingVertical: 60, paddingBottom: 100 },
  header: { marginBottom: 24, paddingHorizontal: 20 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  headerSubtitle: { color: '#FBBF24', fontSize: 16 },
  headerTitle: { color: 'white', fontSize: 34, fontWeight: 'bold' },
  
  // New Stats Card
  statsCard: {
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 32,
    gap: 24,
  },
  badgeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  badgeIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeTitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  badgeNameText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  pointsSection: {
    alignItems: 'center',
  },
  pointsValue: {
    color: 'white',
    fontSize: 52,
    fontWeight: 'bold',
  },
  pointsLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginTop: -4,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'white',
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '500',
  },

  // Badges Section
  section: { marginBottom: 24 },
  sectionTitle: { color: 'white', fontSize: 22, fontWeight: 'bold', marginBottom: 16, paddingHorizontal: 20 },
  badgesGrid: { gap: 16, paddingHorizontal: 20 },
  badgeCard: { 
    width: 150, 
    height: 180, 
    borderRadius: 20, 
    padding: 16, 
    justifyContent: 'space-between',
  },
  badgeIconContainer: { 
    width: 48, 
    height: 48, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  badgeName: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: 'white',
  },
  badgeDescription: { 
    fontSize: 12, 
    color: 'rgba(255,255,255,0.8)'
  },
});
