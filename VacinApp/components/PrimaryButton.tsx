import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Colors } from '../constants/Colors';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'professional' | 'outline-primary' | 'outline-professional';
  style?: ViewStyle;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PrimaryButton({ label, onPress, variant = 'primary', style, disabled }: PrimaryButtonProps) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const variantStyles: Record<string, { bg: string; border: string; text: string }> = {
    'primary':               { bg: Colors.PRIMARY,       border: Colors.PRIMARY,       text: Colors.NEUTRAL.WHITE },
    'professional':          { bg: Colors.PROFESSIONAL,  border: Colors.PROFESSIONAL,  text: Colors.NEUTRAL.WHITE },
    'outline-primary':       { bg: 'transparent',        border: Colors.PRIMARY,       text: Colors.PRIMARY },
    'outline-professional':  { bg: 'transparent',        border: Colors.PROFESSIONAL,  text: Colors.PROFESSIONAL },
  };

  const v = variantStyles[variant];

  return (
    <AnimatedPressable
      style={[styles.btn, { backgroundColor: v.bg, borderColor: v.border }, animStyle, style, disabled && styles.disabled]}
      onPressIn={() => { scale.value = withSpring(0.96); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, { color: v.text }]}>{label}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  btn:      { height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  text:     { fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  disabled: { opacity: 0.5 },
});
