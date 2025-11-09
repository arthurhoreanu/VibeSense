import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Trophy, Zap, Music, Moon, Award, Star, Target, TrendingUp, Clock, Headphones } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInLeft } from 'react-native-reanimated';
import { Progress } from './ui/progress';

const userStats = {
  totalPoints: 1247,
  level: 8,
  nextLevelPoints: 1500,
};

const achievements = [
  { label: 'Total Minutes', value: '2,610', icon: Clock },
  { label: 'Songs Played', value: '432', icon: Music },
  { label: 'New Artists', value: '67', icon: Headphones },
  { label: 'Perfect Days', value: '8', icon: Trophy },
];

const badges = [
    { id: 1, name: 'Chill Master', description: 'Listen to 100 chill tracks', icon: Music, progress: 85, colors: ['#3B82F6', '#06B6D4'] as const, earned: false },
    { id: 2, name: 'Beat Runner', description: 'Run with music 50 times', icon: Zap, progress: 100, colors: ['#F59E0B', '#F97316'] as const, earned: true },
    { id: 3, name: 'Night Owl', description: 'Listen after midnight 30 times', icon: Moon, progress: 73, colors: ['#6366F1', '#8B5CF6'] as const, earned: false },
    { id: 4, name: 'Explorer', description: 'Discover 100 new artists', icon: Target, progress: 100, colors: ['#10B981', '#10B981'] as const, earned: true },
    { id: 5, name: 'Mood Master', description: 'Experience all mood types', icon: Star, progress: 60, colors: ['#EC4899', '#EF4444'] as const, earned: false },
    { id: 6, name: 'Week Warrior', description: '7 day listening streak', icon: TrendingUp, progress: 100, colors: ['#8B5CF6', '#EC4899'] as const, earned: true },
];

export function StatsPage() {
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

        {/* Level & Points */}
        <Animated.View entering={FadeIn.duration(500).delay(200)}>
          <LinearGradient colors={['#8B5CF6', '#EC4899']} style={styles.levelCard}>
            <View style={styles.levelRow}>
              <View>
                <Text style={styles.cardSubtleText}>Current Level</Text>
                <Text style={styles.levelText}>{userStats.level}</Text>
              </View>
              <View style={{alignItems: 'flex-end'}}>
                <Text style={styles.cardSubtleText}>Total Points</Text>
                <Text style={styles.pointsText}>{userStats.totalPoints}</Text>
              </View>
            </View>
            <Progress value={(userStats.totalPoints / userStats.nextLevelPoints) * 100} />
            <Text style={styles.levelProgressText}>
              {userStats.nextLevelPoints - userStats.totalPoints} points to Level {userStats.level + 1}
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Quick Stats */}
        <View style={styles.quickStatsGrid}>
          {achievements.map((stat, i) => (
            <Animated.View key={i} entering={FadeInDown.duration(500).delay(300 + i * 100)} style={styles.quickStatCard}>
              <stat.icon color="#A78BFA" size={22} style={{ marginBottom: 8 }} />
              <Text style={styles.quickStatValue}>{stat.value}</Text>
              <Text style={styles.quickStatLabel}>{stat.label}</Text>
            </Animated.View>
          ))}
        </View>

        {/* Badges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Badges & Achievements</Text>
          <View style={styles.badgesGrid}>
            {badges.map((badge, i) => (
              <Animated.View key={badge.id} entering={FadeIn.duration(500).delay(500 + i * 100)}>
                {badge.earned ? (
                  <LinearGradient colors={badge.colors} style={styles.badgeCard}>
                    <View style={[styles.badgeIconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                      <badge.icon color="white" size={28} />
                    </View>
                    <Text style={[styles.badgeName, { color: 'white' }]}>{badge.name}</Text>
                    <Text style={[styles.badgeDescription, { color: 'rgba(255,255,255,0.8)' }]}>{badge.description}</Text>
                    <View style={styles.earnedContainer}>
                        <Award color="white" size={14} />
                        <Text style={styles.earnedText}>Earned</Text>
                    </View>
                  </LinearGradient>
                ) : (
                  <View style={[styles.badgeCard, styles.badgeNotEarned]}>
                    <View style={[styles.badgeIconContainer, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                      <badge.icon color="rgba(255,255,255,0.4)" size={28} />
                    </View>
                    <Text style={[styles.badgeName, { color: 'rgba(255,255,255,0.6)' }]}>{badge.name}</Text>
                    <Text style={[styles.badgeDescription, { color: 'rgba(255,255,255,0.4)' }]}>{badge.description}</Text>
                    <Progress value={badge.progress} />
                    <Text style={styles.progressText}>{badge.progress}% complete</Text>
                  </View>
                )}
              </Animated.View>
            ))}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 60 },
  header: { marginBottom: 24 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  headerSubtitle: { color: '#FBBF24', fontSize: 16 },
  headerTitle: { color: 'white', fontSize: 34, fontWeight: 'bold' },
  levelCard: { borderRadius: 24, padding: 20, marginBottom: 24 },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cardSubtleText: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 4 },
  levelText: { color: 'white', fontSize: 52, fontWeight: 'bold' },
  pointsText: { color: 'white', fontSize: 28, fontWeight: 'bold' },
  levelProgressText: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 8 },
  quickStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  quickStatCard: {
    width: '48%',
    backgroundColor: 'rgba(30, 27, 75, 0.5)',
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  quickStatValue: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  quickStatLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  section: { marginBottom: 24 },
  sectionTitle: { color: 'white', fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  badgeCard: { width: '48%', borderRadius: 16, padding: 16, marginBottom: 16, minHeight: 180, justifyContent: 'space-between' },
  badgeNotEarned: { backgroundColor: 'rgba(30, 27, 75, 0.3)', borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.1)' },
  badgeIconContainer: { width: 52, height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  badgeName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  badgeDescription: { fontSize: 12, marginBottom: 12, flexShrink: 1 },
  earnedContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  earnedText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  progressText: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
});
