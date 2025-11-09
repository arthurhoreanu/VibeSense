import React, {JSX} from 'react';
import { Switch as RNSwitch, Platform } from 'react-native';

type SwitchProps = React.ComponentProps<typeof RNSwitch>;

const Switch = ({ ...props }: SwitchProps): JSX.Element => {
  return (
    <RNSwitch
      trackColor={{ false: "#2a2a3e", true: "#8a2be2" }}
      thumbColor={Platform.OS === 'android' ? "#f4f3f4" : undefined}
      ios_backgroundColor="#2a2a3e"
      {...props}
    />
  );
};

export { Switch };
