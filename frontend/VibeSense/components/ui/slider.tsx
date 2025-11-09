import React from 'react';
import { View, StyleSheet } from 'react-native';
import RNSlider from '@react-native-community/slider';

const trackColor = '#4A5568'; // gray-600
const rangeColor = '#A78BFA'; // purple-400
const thumbColor = '#FFFFFF';

type SliderProps = {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  style?: object;
};

function Slider({
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  style,
}: SliderProps) {
  return (
    <View style={[styles.container, style]}>
      <RNSlider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value !== undefined ? value : defaultValue}
        onValueChange={onValueChange}
        minimumTrackTintColor={rangeColor}
        maximumTrackTintColor={trackColor}
        thumbTintColor={thumbColor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  slider: {
    width: '100%',
    height: 40,
  },
});

export { Slider };
