// ============================================================
// COMPONENTE: PrimaryButton (Botão Principal)
// DESCRIÇÃO: Botão animado reutilizável com 4 variantes de estilo:
//            primary (roxo), professional (verde) e versões outline.
//            Usa Reanimated para animação de pressão (scale spring).
// ACESSO: Ambos
// ============================================================

// --- Bibliotecas principais do React ---
import React from 'react';

// --- Componentes de interação do React Native ---
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

// --- Animações com Reanimated ---
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

// --- Paleta de cores oficial do VacinApp ---
import { Colors } from '../constants/Colors';

// -------------------------------------------------------
// Interface: Propriedades do componente PrimaryButton
// -------------------------------------------------------
interface PrimaryButtonProps {
  label: string;        // Texto exibido dentro do botão
  onPress: () => void;  // Função chamada ao pressionar o botão
  variant?: 'primary' | 'professional' | 'outline-primary' | 'outline-professional'; // Estilo visual
  style?: ViewStyle;    // Estilos adicionais (opcional)
  disabled?: boolean;   // Desativa o botão e aplica opacidade reduzida
}

// Cria a versão animada do Pressable do React Native
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// -------------------------------------------------------
// COMPONENTE: PrimaryButton
// Botão com animação de scale ao ser pressionado (efeito elástico)
// -------------------------------------------------------
export function PrimaryButton({ label, onPress, variant = 'primary', style, disabled }: PrimaryButtonProps) {
  // Valor compartilhado que controla a escala do botão (usado na animação)
  const scale = useSharedValue(1);

  // Estilo animado: transforma o valor de escala em propriedade CSS
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  // -------------------------------------------------------
  // Mapa de estilos para cada variante do botão
  // Cada variante define cor de fundo, borda e texto
  // -------------------------------------------------------
  const variantStyles: Record<string, { bg: string; border: string; text: string }> = {
    'primary':              { bg: Colors.PRIMARY,      border: Colors.PRIMARY,      text: Colors.NEUTRAL.WHITE }, // Roxo sólido
    'professional':         { bg: Colors.PROFESSIONAL, border: Colors.PROFESSIONAL, text: Colors.NEUTRAL.WHITE }, // Verde sólido
    'outline-primary':      { bg: 'transparent',       border: Colors.PRIMARY,      text: Colors.PRIMARY },       // Contorno roxo
    'outline-professional': { bg: 'transparent',       border: Colors.PROFESSIONAL, text: Colors.PROFESSIONAL }, // Contorno verde
  };

  const v = variantStyles[variant]; // Estilos da variante selecionada

  return (
    <AnimatedPressable
      style={[styles.btn, { backgroundColor: v.bg, borderColor: v.border }, animStyle, style, disabled && styles.disabled]}
      onPressIn={() => { scale.value = withSpring(0.96); }}  // Diminui ao pressionar (efeito de "afundar")
      onPressOut={() => { scale.value = withSpring(1); }}    // Volta ao tamanho normal ao soltar
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, { color: v.text }]}>{label}</Text>
    </AnimatedPressable>
  );
}

// -------------------------------------------------------
// ESTILOS DO COMPONENTE
// -------------------------------------------------------
const styles = StyleSheet.create({
  // === BOTÃO BASE ===
  btn:      { height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  text:     { fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },

  // === ESTADO DESABILITADO ===
  disabled: { opacity: 0.5 }, // Reduz opacidade para indicar indisponibilidade
});
