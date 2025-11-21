import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { SkipBack, SkipForward, Play, Pause } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Slider } from './ui/slider';
import useNowPlaying from '../hooks/useNowPlaying';
import { useMood } from '../context/MoodContext';
import { play, pause, next, previous, seek } from '../lib/backendApi';

const { width } = Dimensions.get('window');

const VisualizerBar = ({ isPlaying }: { isPlaying: boolean }) => {
  const heightValue = useSharedValue(10);

  useEffect(() => {
    heightValue.value = withRepeat(
      withSequence(
        withTiming(Math.random() * 80 + 10, { duration: 300 }),
        withTiming(Math.random() * 80 + 10, { duration: 300 }),
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: isPlaying ? heightValue.value : withTiming(10, { duration: 200 }),
    };
  });

  return <Animated.View style={[styles.visualizerBar, animatedStyle]} />;
};

export function NowPlayingVariant() {
  const { nowPlaying, loading, error, refreshNowPlaying } = useNowPlaying();
  const { mood } = useMood();

  const isPlaying = nowPlaying?.isPlaying ?? false;
  const [optimisticIsPlaying, setOptimisticIsPlaying] = useState(isPlaying);
  const [optimisticProgress, setOptimisticProgress] = useState(nowPlaying?.progressMs ?? 0);

  const rotation = useSharedValue(0);

  useEffect(() => {
    setOptimisticIsPlaying(isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    if (nowPlaying?.progressMs) {
      setOptimisticProgress(nowPlaying.progressMs);
    }
  }, [nowPlaying?.progressMs]);

  useEffect(() => {
    if (optimisticIsPlaying) {
      rotation.value = withRepeat(withTiming(360, { duration: 20000, easing: Easing.linear }), -1);
    } else {
      rotation.value = withTiming(rotation.value, { duration: 500 });
    }
  }, [optimisticIsPlaying]);

  const animatedAlbumStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const handlePlayPause = async () => {
    setOptimisticIsPlaying(current => !current);
    if (isPlaying) {
      await pause();
    } else {
      await play();
    }
    setTimeout(refreshNowPlaying, 500);
  };

  const handleNext = async () => {
    await next();
    setTimeout(refreshNowPlaying, 1000); // Longer delay for track change
  };

  const handlePrevious = async () => {
    await previous();
    setTimeout(refreshNowPlaying, 1000); // Longer delay for track change
  };

  const handleSeek = async (value: number) => {
    setOptimisticProgress(value);
    await seek(value);
    setTimeout(refreshNowPlaying, 1000);
  };

  if (loading) {
      return (
          <LinearGradient colors={['#000', '#11052C', '#000']} style={styles.container}>
              <Text style={styles.trackTitle}>Loading...</Text>
          </LinearGradient>
      )
  }

  if (error || !nowPlaying || !nowPlaying.isPlaying) {
    return (
      <LinearGradient colors={['#000', '#11052C', '#000']} style={styles.container}>
          <View style={styles.centeredMessage}>
            <Text style={styles.trackTitle}>Nothing is playing</Text>
            <Text style={styles.trackArtist}>Connect to Spotify and play a song to get started.</Text>
          </View>
      </LinearGradient>
    )
  }

  const duration = nowPlaying.durationMs || 1;

  return (
    <LinearGradient colors={['#000', '#11052C', '#000']} style={styles.container}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topBarSubtitle}>CURRENT MOOD</Text>
          <Text style={styles.topBarTitle}>{mood.type}</Text>
        </View>
      </View>

      <View style={styles.albumArtContainer}>
        <Animated.View style={[styles.albumArt, animatedAlbumStyle]}>
             <Image source={{ uri: nowPlaying.albumImageUrl || undefined }} style={{ width: '100%', height: '100%', borderRadius: 24 }} />
        </Animated.View>
      </View>

      <View style={styles.trackInfoContainer}>
        <Text style={styles.trackTitle}>{nowPlaying.trackName}</Text>
        <Text style={styles.trackArtist}>{nowPlaying.artistName}</Text>
      </View>

      <View style={styles.progressContainer}>
        <Slider
          value={optimisticProgress}
          max={duration}
          onValueChange={(value) => setOptimisticProgress(value[0])}
          onSlidingComplete={(value) => handleSeek(value[0])}
        />
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{Math.floor(optimisticProgress / 1000 / 60)}:{(Math.floor(optimisticProgress / 1000) % 60).toString().padStart(2, '0')}</Text>
          <Text style={styles.timeText}>{Math.floor(duration / 1000 / 60)}:{(Math.floor(duration / 1000) % 60).toString().padStart(2, '0')}</Text>
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={handlePrevious}>
          <SkipBack color="white" size={32} fill="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
          {optimisticIsPlaying ? (
            <Pause color="white" size={32} fill="white" />
          ) : (
            <Play color="white" size={32} fill="white" style={{ marginLeft: 4 }}/>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNext}>
          <SkipForward color="white" size={32} fill="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.visualizerContainer} pointerEvents="none">
        {Array.from({ length: 40 }).map((_, i) => (
          <VisualizerBar key={i} isPlaying={optimisticIsPlaying} />
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  centeredMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  topBarSubtitle: {
    color: '#aaa',
    fontSize: 12,
    textAlign: 'center',
  },
  topBarTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  albumArtContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  albumArt: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 24,
    backgroundColor: 'rgba(100,100,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  trackInfoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  trackTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  trackArtist: {
    color: '#D8B4FE', // purple-300
    fontSize: 18,
    marginTop: 4,
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 20,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timeText: {
    color: '#aaa',
    fontSize: 12,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    gap: 35,
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#A78BFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  visualizerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-evenly',
    opacity: 0.2,
    paddingHorizontal: 10,
  },
  visualizerBar: {
    flex: 1,
    backgroundColor: '#67E8F9', // cyan-400
    borderRadius: 2,
    marginHorizontal: 1,
  },
});
