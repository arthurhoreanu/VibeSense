import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface ProgressProps {
  value?: number | null;
  style?: ViewStyle;
  indicatorStyle?: ViewStyle;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  style,
  indicatorStyle
}) => {
  const progress = value ?? 0;

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.indicator,
          { width: `${progress}%` },
          indicatorStyle
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 8,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  indicator: {
    height: '100%',
    backgroundColor: '#fff',
  },
});
