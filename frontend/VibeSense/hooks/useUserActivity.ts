import { useEffect, useState } from "react";
import { Accelerometer } from "expo-sensors";

export type Activity = "still" | "walking" | "running";

export function useUserActivity(): Activity {
  const [activity, setActivity] = useState<Activity>("still");

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);

      if (magnitude < 0.3) {
        setActivity("still");
      } else if (magnitude < 1.5) {
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
