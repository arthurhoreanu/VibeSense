import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Settings as SettingsIcon, Lock, User, ChevronRight, LogOut, Smartphone } from 'lucide-react-native';
import { auth } from '../config/firebaseConfig';

const otherSettings = [
    { label: "Privacy & Security", icon: Lock },
    { label: "About VibeSense", icon: Smartphone },
];

export function SettingsPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.replace('/login');
    } catch (error) {
      console.error('Failed to sign out: ', error);
    }
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E1B4B', '#0F172A']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <SettingsIcon size={20} color="#A78BFA" />
            <Text style={{ color: '#A78BFA', fontSize: 16 }}>VibeSense</Text>
          </View>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <TouchableOpacity style={styles.profileCard}>
            <LinearGradient colors={['#8B5CF6', '#EC4899']} style={StyleSheet.absoluteFill} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16}}>
                <View style={styles.profileAvatar}>
                    <User size={32} color="white" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>Alex Rivers</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Level 8 • 1,247 points</Text>
                </View>
                <ChevronRight size={24} color="rgba(255,255,255,0.7)" />
            </View>
        </TouchableOpacity>

        <Section title="Other">
            <View style={{gap: 12}}>
              {otherSettings.map((setting) => (
                  <TouchableOpacity key={setting.label} style={styles.listCard}>
                      <setting.icon size={22} color="#A78BFA" />
                      <Text style={[styles.settingLabel, {flex: 1, marginLeft: 16}]}>{setting.label}</Text>
                      <ChevronRight size={22} color="#A1A1AA" />
                  </TouchableOpacity>
              ))}
            </View>
        </Section>

        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <LogOut size={20} color="#F43F5E"/>
            <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </LinearGradient>
  );
}

const Section = ({ title, icon: Icon, children }: { title: string, icon?: React.ElementType, children: React.ReactNode }) => (
  <View style={styles.sectionContainer}>
    <View style={styles.sectionHeader}>
        {Icon && <Icon size={18} color="#A78BFA" />}
        <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingVertical: 60, paddingBottom: 30 },
  header: { paddingHorizontal: 20, marginBottom: 24 },
  headerTitle: { color: 'white', fontSize: 34, fontWeight: 'bold' },
  profileCard: { borderRadius: 24, padding: 20, marginBottom: 24, marginHorizontal: 20, overflow: 'hidden' },
  profileAvatar: { width: 64, height: 64, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  sectionContainer: { marginBottom: 24, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { color: 'white', fontSize: 20, fontWeight: '600' },
  listCard: {
    backgroundColor: 'rgba(49, 46, 129, 0.6)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  settingLabel: { color: 'white', fontSize: 16 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: 'rgba(239, 68, 68, 0.15)', marginHorizontal: 20, borderRadius: 16, paddingVertical: 16, marginTop: 24 },
  logoutButtonText: { color: '#F43F5E', fontSize: 16, fontWeight: 'bold' },
});
