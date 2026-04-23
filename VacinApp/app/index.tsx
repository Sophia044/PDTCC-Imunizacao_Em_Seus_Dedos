// ============================================================
// TELA: Splash Screen (Tela de Abertura)
// DESCRIÇÃO: Primeira tela exibida ao abrir o app. Mostra o logo
//            animado do VacinApp por 2,5 segundos e redireciona
//            automaticamente para a tela de Login.
// ACESSO: Ambos (ponto de entrada do app)
// ROTA: /app/index.tsx
// ============================================================

// --- Bibliotecas principais do React ---
import React, { useEffect } from 'react';

// --- Componentes de layout do React Native ---
import { Dimensions, StyleSheet, Text, View } from 'react-native';

// --- Gradiente linear para o fundo da splash ---
import { LinearGradient } from 'expo-linear-gradient';

// --- Animações com Reanimated ---
import Animated, {
  useAnimatedStyle, useSharedValue, withSpring, withTiming,
} from 'react-native-reanimated';

// --- Navegação com Expo Router ---
import { router } from 'expo-router';

// --- Controle da barra de status do sistema operacional ---
import { StatusBar } from 'expo-status-bar';

// --- Ícones vetoriais da biblioteca Ionicons ---
import { Ionicons } from '@expo/vector-icons';

// --- Informações do app (versão, nome, etc.) ---
import Constants from 'expo-constants';

// --- Paleta de cores oficial do VacinApp ---
import { Colors } from '../constants/Colors';

// Obtém a largura da tela para uso em estilos responsivos
const { width } = Dimensions.get('window');

// -------------------------------------------------------
// COMPONENTE PRINCIPAL: Splash Screen
// Exibe o logo animado e redireciona após 2,5 segundos
// -------------------------------------------------------
export default function SplashScreen() {
  // Estado compartilhado para controlar a escala do logo (efeito de zoom)
  const scale   = useSharedValue(0.75);
  // Estado compartilhado para controlar a opacidade (efeito de fade in)
  const opacity = useSharedValue(0);
  // Estado compartilhado para controlar a posição vertical do logo
  const logoY   = useSharedValue(20);

  // Executado uma única vez ao montar o componente ([])
  // Dispara as animações de entrada e agenda o redirecionamento
  useEffect(() => {
    // Animação de entrada: zoom suave no logo
    scale.value   = withSpring(1, { damping: 8, stiffness: 90 });
    // Animação de entrada: fade in da tela completa
    opacity.value = withTiming(1, { duration: 700 });
    // Animação de entrada: logo sobe levemente ao aparecer
    logoY.value   = withSpring(0, { damping: 12 });

    // Redireciona para a tela de login após 2,5 segundos
    const timer = setTimeout(() => {
      router.replace('/(auth)/login');
    }, 2500);

    // Limpa o timer se o componente for desmontado antes do tempo
    return () => clearTimeout(timer);
  }, []);

  // Estilo animado aplicado ao logo (combina opacidade, escala e posição)
  const logoStyle = useAnimatedStyle(() => ({
    opacity:   opacity.value,
    transform: [{ scale: scale.value }, { translateY: logoY.value }],
  }));

  // Obtém a versão do app do arquivo app.json (ex: "1.0.0")
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    // Fundo com gradiente linear do roxo principal ao roxo secundário
    <LinearGradient colors={[Colors.PRIMARY, Colors.SECONDARY]} style={styles.container}>
      {/* Barra de status com ícones claros (fundo escuro) */}
      <StatusBar style="light" />

      {/* ---- CÍRCULOS DECORATIVOS DE FUNDO (elementos visuais) ---- */}
      <View style={[styles.circle, styles.c1]} />
      <View style={[styles.circle, styles.c2]} />
      <View style={[styles.circle, styles.c3]} />

      {/* ---- LOGO ANIMADO: Ícone + Nome + Tagline ---- */}
      <Animated.View style={[styles.logoWrap, logoStyle]}>
        {/* Círculo branco com ícone de cruz médica */}
        <View style={styles.iconCircle}>
          <Ionicons name="medical" size={52} color={Colors.PRIMARY} />
        </View>
        {/* Nome do aplicativo */}
        <Text style={styles.appName}>VacinApp</Text>
        {/* Slogan do aplicativo */}
        <Text style={styles.tagline}>Imunização em Seus Dedos</Text>
      </Animated.View>

      {/* ---- VERSÃO DO APP NO RODAPÉ ---- */}
      <Text style={styles.version}>v{version}</Text>
    </LinearGradient>
  );
}

// -------------------------------------------------------
// ESTILOS DA TELA
// -------------------------------------------------------
const styles = StyleSheet.create({
  // === CONTAINER PRINCIPAL ===
  container:  { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // === WRAPPER DO LOGO ===
  logoWrap:   { alignItems: 'center' },

  // === CÍRCULO COM ÍCONE MÉDICO ===
  iconCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.NEUTRAL.WHITE,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
    // Sombra para profundidade
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },

  // === TEXTOS DO LOGO ===
  appName:    { fontSize: 38, fontWeight: '800', color: Colors.NEUTRAL.WHITE, letterSpacing: 1 },
  tagline:    { fontSize: 15, color: 'rgba(255,255,255,0.75)', marginTop: 6, letterSpacing: 0.5 },

  // === VERSÃO NO RODAPÉ ===
  version:    { position: 'absolute', bottom: 36, fontSize: 13, color: 'rgba(255,255,255,0.5)' },

  // === CÍRCULOS DECORATIVOS DE FUNDO (efeito visual) ===
  circle:     { position: 'absolute', borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.07)' },
  c1:         { width: 280, height: 280, top: -60, right: -80 },   // Canto superior direito
  c2:         { width: 200, height: 200, bottom: 80, left: -60 },  // Canto inferior esquerdo
  c3:         { width: 140, height: 140, bottom: -30, right: 40 }, // Canto inferior direito
});
