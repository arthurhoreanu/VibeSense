import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({ 
  variant = 'default', 
  children, 
  style,
  textStyle 
}) => {
  return (
    <View style={[styles.container, variantStyles[variant].container, style]}>
      <Text style={[styles.text, variantStyles[variant].text, textStyle]}>
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
});

const variantStyles = {
  default: StyleSheet.create({
    container: { backgroundColor: '#000', borderColor: 'transparent' },
    text: { color: '#fff' },
  }),
  secondary: StyleSheet.create({
    container: { backgroundColor: '#F1F5F9', borderColor: 'transparent' },
    text: { color: '#0f172a' },
  }),
  destructive: StyleSheet.create({
    container: { backgroundColor: '#ef4444', borderColor: 'transparent' },
    text: { color: '#fff' },
  }),
  outline: StyleSheet.create({
    container: { backgroundColor: 'transparent', borderColor: '#e2e8f0' },
    text: { color: '#0f172a' },
  }),
};
