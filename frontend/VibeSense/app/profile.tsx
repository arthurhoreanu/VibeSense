import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, db, storage } from '../config/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ChevronLeft, User, Camera } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      getDoc(userRef).then(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUsername(data.username || '');
          setPhotoURL(data.photoURL || '');
        }
      });
    }
  }, [user]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setPhotoURL(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    setIsUploading(true);
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `profile-pictures/${user!.uid}`);
    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise<string>((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => { /* Progress updates can be handled here */ },
        (error) => {
          setIsUploading(false);
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setIsUploading(false);
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to save your profile.');
      return;
    }
    setLoading(true);

    try {
      let finalPhotoURL = photoURL;

      if (photoURL && photoURL.startsWith('file://')) {
        finalPhotoURL = await uploadImage(photoURL);
      }

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { username, photoURL: finalPhotoURL }, { merge: true });
      
      Alert.alert('Success', 'Your profile has been updated.');
      router.back();
    } catch (error: any) {
      Alert.alert('Save Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E1B4B', '#0F172A']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
          {photoURL ? (
            <Image source={{ uri: photoURL }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
                <User size={60} color="#A78BFA" />
            </View>
          )}
           <View style={styles.cameraIcon}>
            {isUploading ? <ActivityIndicator size="small" color="#fff" /> : <Camera size={20} color="white" />}
          </View>
        </TouchableOpacity>

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your username"
          placeholderTextColor="#A1A1AA"
          value={username}
          onChangeText={setUsername}
        />

        <Text style={styles.label}>Photo URL</Text>
        <TextInput
          style={styles.input}
          placeholder="https://example.com/image.png"
          placeholderTextColor="#A1A1AA"
          value={photoURL}
          onChangeText={setPhotoURL}
        />
        
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading || isUploading}>
          <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
    backButton: { marginRight: 16 },
    headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
    content: { alignItems: 'center' },
    avatarContainer: { marginBottom: 32, position: 'relative' },
    avatar: { width: 120, height: 120, borderRadius: 60 },
    avatarPlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(49, 46, 129, 0.6)', justifyContent: 'center', alignItems: 'center' },
    cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#8B5CF6', padding: 8, borderRadius: 16, justifyContent: 'center', alignItems: 'center', width: 36, height: 36 },
    label: { color: '#A1A1AA', fontSize: 14, alignSelf: 'flex-start', marginBottom: 8 },
    input: { backgroundColor: 'rgba(49, 46, 129, 0.6)', width: '100%', borderRadius: 12, padding: 16, color: 'white', fontSize: 16, marginBottom: 16 },
    saveButton: { backgroundColor: '#8B5CF6', width: '100%', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 16 },
    saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
