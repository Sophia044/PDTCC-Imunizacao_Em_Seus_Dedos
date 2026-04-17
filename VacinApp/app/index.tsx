import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle, useSharedValue, withSpring, withTiming,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Colors } from '../constants/Colors';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const scale   = useSharedValue(0.75);
  const opacity = useSharedValue(0);
  const logoY   = useSharedValue(20);

  useEffect(() => {
    // Animação de entrada do logo
    scale.value   = withSpring(1, { damping: 8, stiffness: 90 });
    opacity.value = withTiming(1, { duration: 700 });
    logoY.value   = withSpring(0, { damping: 12 });

    const timer = setTimeout(() => {
      router.replace('/(auth)/login');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity:   opacity.value,
    transform: [{ scale: scale.value }, { translateY: logoY.value }],
  }));

  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <LinearGradient colors={[Colors.PRIMARY, Colors.SECONDARY]} style={styles.container}>
      <StatusBar style="light" />

      {/* Círculos decorativos */}
      <View style={[styles.circle, styles.c1]} />
      <View style={[styles.circle, styles.c2]} />
      <View style={[styles.circle, styles.c3]} />

      {/* Logo animado */}
      <Animated.View style={[styles.logoWrap, logoStyle]}>
        <View style={styles.iconCircle}>
          <Ionicons name="medical" size={52} color={Colors.PRIMARY} />
        </View>
        <Text style={styles.appName}>VacinApp</Text>
        <Text style={styles.tagline}>Imunização em Seus Dedos</Text>
      </Animated.View>

      {/* Versão no rodapé */}
      <Text style={styles.version}>v{version}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoWrap:   { alignItems: 'center' },
  iconCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.NEUTRAL.WHITE,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  appName:    { fontSize: 38, fontWeight: '800', color: Colors.NEUTRAL.WHITE, letterSpacing: 1 },
  tagline:    { fontSize: 15, color: 'rgba(255,255,255,0.75)', marginTop: 6, letterSpacing: 0.5 },
  version:    { position: 'absolute', bottom: 36, fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  // Círculos decorativos de fundo
  circle:     { position: 'absolute', borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.07)' },
  c1:         { width: 280, height: 280, top: -60, right: -80 },
  c2:         { width: 200, height: 200, bottom: 80, left: -60 },
  c3:         { width: 140, height: 140, bottom: -30, right: 40 },
});
