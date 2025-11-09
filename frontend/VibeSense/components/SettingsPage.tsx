import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Settings as SettingsIcon, Activity, Mic, Sun, Cloud, Sliders, Lock, User, ChevronRight, LogOut, Smartphone } from 'lucide-react-native';
import { Switch } from './ui/switch';

const sensorSettings = [
  { id: 'accelerometer', label: 'Movement Detection', description: 'Detect activity', icon: Activity, enabled: true, color: ['#06B6D4', '#3B82F6'] as const },
  { id: 'microphone', label: 'Ambient Noise', description: 'Analyze sound', icon: Mic, enabled: true, color: ['#EC4899', '#F43F5E'] as const },
  { id: 'brightness', label: 'Brightness Sensor', description: 'Detect light level', icon: Sun, enabled: true, color: ['#F59E0B', '#F97316'] as const },
  { id: 'weather', label: 'Weather Data', description: 'Get weather info', icon: Cloud, enabled: false, color: ['#6366F1', '#8B5CF6'] as const },
];

const otherSettings = [
    { label: "Privacy & Security", icon: Lock },
    { label: "About VibeSense", icon: Smartphone },
];

export function SettingsPage() {
  const router = useRouter();
  const [sensors, setSensors] = useState<Record<string, boolean>>(sensorSettings.reduce((acc, s) => ({ ...acc, [s.id]: s.enabled }), {}));

  const handleSignOut = () => {
    router.replace('/login');
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

        <Section title="Sensor Settings" icon={Sliders}>
          <View style={{gap: 12}}>
            {sensorSettings.map(sensor => (
              <View key={sensor.id} style={styles.listCard}>
                  <LinearGradient colors={sensor.color} style={styles.settingIconContainer}>
                      <sensor.icon size={22} color="white" />
                  </LinearGradient>
                  <View style={styles.settingTextContainer}>
                      <Text style={styles.settingLabel}>{sensor.label}</Text>
                      <Text style={styles.settingDescription}>{sensor.description}</Text>
                  </View>
                  <Switch value={sensors[sensor.id]} onValueChange={value => setSensors(s => ({ ...s, [sensor.id]: value }))} />
              </View>
            ))}
          </View>
        </Section>
                
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
    backgroundColor: 'rgba(30, 27, 75, 0.5)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  settingIconContainer: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  settingTextContainer: { flex: 1, marginLeft: 16 },
  settingLabel: { color: 'white', fontSize: 16 },
  settingDescription: { color: '#A1A1AA', fontSize: 12, marginTop: 4 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: 'rgba(239, 68, 68, 0.15)', marginHorizontal: 20, borderRadius: 16, paddingVertical: 16, marginTop: 24 },
  logoutButtonText: { color: '#F43F5E', fontSize: 16, fontWeight: 'bold' },
});
