// ============================================================
// COMPONENTE: QuickActionButton
// DESCRIÇÃO: Botão grande de ação rápida do painel do dashboard.
//            Exibe ícone no topo e label abaixo. Usado no grid
//            de ações rápidas dos dois dashboards.
// ACESSO: Profissional
// ============================================================

import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface QuickActionButtonProps {
  icon: IoniconsName;
  label: string;
  onPress: () => void;
  color?: string;        // Cor do ícone e fundo suave (padrão: verde profissional)
  highlight?: boolean;   // Destaque com fundo sólido (ex: ação principal)
}

export function QuickActionButton({
  icon,
  label,
  onPress,
  color = Colors.PROFESSIONAL,
  highlight = false,
}: QuickActionButtonProps) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      style={[
        styles.btn,
        highlight && { backgroundColor: color, shadowColor: color, shadowOpacity: 0.35 },
        animStyle,
      ]}
      onPressIn={() => { scale.value = withSpring(0.94, { damping: 15 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 12 }); }}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons
        name={icon}
        size={26}
        color={highlight ? Colors.NEUTRAL.WHITE : color}
      />
      <Text style={[styles.label, highlight && { color: Colors.NEUTRAL.WHITE }]}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flex: 1,
    minWidth: '28%',
    backgroundColor: Colors.NEUTRAL.WHITE,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.NEUTRAL.DARK_TEXT,
    textAlign: 'center',
  },
});
