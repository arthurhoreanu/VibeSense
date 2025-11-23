import { useEffect, useState } from "react";
import { Accelerometer } from "expo-sensors";

export type Activity = "still" | "walking" | "running";

export function useUserActivity(): Activity {
  const [activity, setActivity] = useState<Activity>("still");

  useEffect(() => {
    Accelerometer.setUpdateInterval(500);

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      // Calculate magnitude of acceleration vector
      // 1.0 represents 1G (gravity), which means the device is stationary relative to Earth
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const deviation = Math.abs(magnitude - 1.0);

      // Thresholds for activity detection based on deviation from 1G
      if (deviation < 0.15) {
        setActivity("still");
      } else if (deviation < 0.8) {
        setActivity("walking");
      } else {
        setActivity("running");
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return activity;
}
