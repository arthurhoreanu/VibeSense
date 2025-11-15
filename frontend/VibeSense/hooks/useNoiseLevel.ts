import { useEffect, useState } from "react";
import { Audio } from "expo-av";

export type NoiseLevel = "quiet" | "noisy";

export function useNoiseLevel(): NoiseLevel | null {
  const [level, setLevel] = useState<NoiseLevel | null>(null);

  useEffect(() => {
    let recording: Audio.Recording | null = null;
    let intervalId: NodeJS.Timeout;

    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: rec } = await Audio.Recording.createAsync({
        android: {
          extension: ".m4a",
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: ".m4a",
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.High,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        isMeteringEnabled: true,
      });

      recording = rec;

      intervalId = setInterval(async () => {
        if (!recording) return;
        const status = await recording.getStatusAsync();
        const db = (status as any).metering ?? -160;

        if (db < -40) setLevel("quiet");
        else setLevel("noisy");
      }, 500);
    })();

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  return level;
}
