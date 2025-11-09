import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Heart, Share2, MoreVertical, SkipBack, SkipForward, Play, Pause, Repeat, Shuffle } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Slider } from './ui/slider';

const { width, height } = Dimensions.get('window');

const track = {
  title: 'Neon Nights',
  artist: 'Cyber Dreams',
  album: 'Electric Future',
  duration: 234,
};

const VisualizerBar = ({ isPlaying, index }: { isPlaying: boolean, index: number }) => {
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
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [progress, setProgress] = useState(127);

  const rotation = useSharedValue(0);

  useEffect(() => {
    if (isPlaying) {
      rotation.value = withRepeat(withTiming(360, { duration: 20000, easing: Easing.linear }), -1);
    } else {
      rotation.value = withTiming(rotation.value, { duration: 500 });
    }
  }, [isPlaying]);

  const animatedAlbumStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <LinearGradient colors={['#000', '#11052C', '#000']} style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconButton}>
          <MoreVertical color="white" size={22} />
        </TouchableOpacity>
        <View>
          <Text style={styles.topBarSubtitle}>PLAYING FROM</Text>
          <Text style={styles.topBarTitle}>Energetic Mix</Text>
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <Share2 color="white" size={22} />
        </TouchableOpacity>
      </View>

      {/* Album Art */}
      <View style={styles.albumArtContainer}>
        <Animated.View style={[styles.albumArt, animatedAlbumStyle]}>
            <Text style={{ fontSize: 80 }}>🎵</Text>
        </Animated.View>
      </View>

      {/* Track Info */}
      <View style={styles.trackInfoContainer}>
        <Text style={styles.trackTitle}>{track.title}</Text>
        <Text style={styles.trackArtist}>{track.artist}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Slider
          value={progress}
          max={track.duration}
          onValueChange={setProgress}
        />
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{Math.floor(progress / 60)}:{(progress % 60).toString().padStart(2, '0')}</Text>
          <Text style={styles.timeText}>{Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity>
          <Shuffle color="#aaa" size={24} />
        </TouchableOpacity>
        <TouchableOpacity>
          <SkipBack color="white" size={32} fill="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.playButton} onPress={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? (
            <Pause color="white" size={32} fill="white" />
          ) : (
            <Play color="white" size={32} fill="white" style={{ marginLeft: 4 }}/>
          )}
        </TouchableOpacity>
        <TouchableOpacity>
          <SkipForward color="white" size={32} fill="white" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Repeat color="#aaa" size={24} />
        </TouchableOpacity>
      </View>
      
      {/* Visualizer */}
      <View style={styles.visualizerContainer}>
        {Array.from({ length: 40 }).map((_, i) => (
          <VisualizerBar key={i} isPlaying={isPlaying} index={i} />
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  trackArtist: {
    color: '#D8B4FE', // purple-300
    fontSize: 18,
    marginTop: 4,
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
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 40,
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
