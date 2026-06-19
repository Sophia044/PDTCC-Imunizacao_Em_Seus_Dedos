// ============================================================
// TELA: Escolha do Tipo de Cadastro
// DESCRIÇÃO: Permite ao paciente escolher entre cadastro
//            pela Rede Pública (SUS) ou Rede Privada (Convênio).
// ACESSO: Paciente (novo usuário)
// ROTA: /app/(auth)/choose-registration.tsx
// ============================================================

import React from 'react';
import {
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

// -------------------------------------------------------
// Interface do card de escolha
// -------------------------------------------------------
interface ChoiceCardProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconBg: string;
  title: string;
  description: string;
  tag: string;
  onPress: () => void;
  delay: number;
}

// -------------------------------------------------------
// Componente: Card de Escolha de Cadastro
// -------------------------------------------------------
function ChoiceCard({ icon, iconBg, title, description, tag, onPress, delay }: ChoiceCardProps) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(600)}>
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
        {/* Tag no topo do card */}
        <View style={[styles.tag, { backgroundColor: iconBg }]}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>

        {/* Ícone central */}
        <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={36} color={Colors.NEUTRAL.WHITE} />
        </View>

        {/* Textos */}
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDesc}>{description}</Text>

        {/* Seta de ação */}
        <View style={styles.cardArrow}>
          <Text style={styles.cardArrowText}>Selecionar</Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.PRIMARY} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// -------------------------------------------------------
// COMPONENTE PRINCIPAL: Escolha do Tipo de Cadastro
// -------------------------------------------------------
export default function ChooseRegistrationScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ---- HEADER COM BOTÃO VOLTAR ---- */}
        <Animated.View entering={FadeInDown.delay(50).duration(500)} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.PRIMARY} />
          </TouchableOpacity>
        </Animated.View>

        {/* ---- LOGO INLINE ---- */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.logoRow}>
          <View style={styles.logoCircle}>
            <Ionicons name="medical" size={22} color={Colors.NEUTRAL.WHITE} />
          </View>
          <Text style={styles.logoText}>VacinApp</Text>
        </Animated.View>

        {/* ---- TÍTULO E SUBTÍTULO ---- */}
        <Animated.View entering={FadeInDown.delay(150).duration(600)}>
          <Text style={styles.title}>Como você deseja{'\n'}se cadastrar?</Text>
          <Text style={styles.subtitle}>Selecione a forma de atendimento utilizada.</Text>
        </Animated.View>

        {/* ---- CARDS DE ESCOLHA ---- */}
        <View style={styles.cards}>

          {/* Card 1: Rede Pública (SUS) */}
          <ChoiceCard
            icon="medkit"
            iconBg={Colors.PRIMARY}
            title="Rede Pública (SUS)"
            description="Cadastre-se utilizando seu Cartão Nacional de Saúde (CNS) e tenha acesso à sua carteira de vacinação pelo SUS."
            tag="Gratuito"
            onPress={() => router.push('/(auth)/register-sus')}
            delay={250}
          />

          {/* Card 2: Rede Privada (Convênio) */}
          <ChoiceCard
            icon="shield-checkmark"
            iconBg={Colors.PROFESSIONAL}
            title="Rede Privada (Convênio)"
            description="Cadastre-se utilizando os dados do seu plano de saúde e gerencie suas vacinas da rede privada."
            tag="Convênio"
            onPress={() => router.push('/(auth)/register-private')}
            delay={350}
          />
        </View>

        {/* ---- NOTA INFORMATIVA ---- */}
        <Animated.View entering={FadeInDown.delay(450).duration(600)} style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.NEUTRAL.MUTED} />
          <Text style={styles.infoText}>
            Você poderá alterar estas informações posteriormente no seu perfil.
          </Text>
        </Animated.View>

        {/* ---- LINK: JÁ TEM CONTA ---- */}
        <Animated.View entering={FadeInDown.delay(500).duration(600)} style={styles.loginRow}>
          <Text style={styles.loginText}>Já tem conta? </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login-user')}>
            <Text style={styles.loginLink}>Entrar</Text>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>
    </View>
  );
}

// -------------------------------------------------------
// ESTILOS DA TELA
// -------------------------------------------------------
const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: Colors.BACKGROUND },
  content:         { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 40 },

  // Header
  header:          { marginBottom: 20 },
  backBtn:         { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.NEUTRAL.WHITE, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },

  // Logo
  logoRow:         { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 28 },
  logoCircle:      { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.PRIMARY, alignItems: 'center', justifyContent: 'center' },
  logoText:        { fontSize: 18, fontWeight: '800', color: Colors.PRIMARY },

  // Título
  title:           { fontSize: 28, fontWeight: '800', color: Colors.NEUTRAL.DARK_TEXT, lineHeight: 36, marginBottom: 8 },
  subtitle:        { fontSize: 15, color: Colors.NEUTRAL.MUTED, marginBottom: 32, lineHeight: 22 },

  // Cards
  cards:           { gap: 16, marginBottom: 24 },
  card:            {
    backgroundColor: Colors.NEUTRAL.WHITE,
    borderRadius: 20,
    padding: 24,
    shadowColor: Colors.PRIMARY,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  // Tag no topo do card
  tag:             { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 16, opacity: 0.85 },
  tagText:         { fontSize: 11, fontWeight: '700', color: Colors.NEUTRAL.WHITE, textTransform: 'uppercase', letterSpacing: 0.8 },

  // Ícone do card
  iconCircle:      { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },

  // Textos do card
  cardTitle:       { fontSize: 20, fontWeight: '800', color: Colors.NEUTRAL.DARK_TEXT, marginBottom: 8 },
  cardDesc:        { fontSize: 14, color: Colors.NEUTRAL.MUTED, lineHeight: 21, marginBottom: 20 },

  // Seta do card
  cardArrow:       { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardArrowText:   { fontSize: 14, fontWeight: '700', color: Colors.PRIMARY },

  // Nota informativa
  infoBox:         { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: Colors.NEUTRAL.WHITE, borderRadius: 12, padding: 14, marginBottom: 24, borderWidth: 1, borderColor: Colors.BORDER },
  infoText:        { flex: 1, fontSize: 13, color: Colors.NEUTRAL.MUTED, lineHeight: 19 },

  // Link de login
  loginRow:        { flexDirection: 'row', justifyContent: 'center' },
  loginText:       { fontSize: 14, color: Colors.NEUTRAL.MUTED },
  loginLink:       { fontSize: 14, fontWeight: '700', color: Colors.PRIMARY },
});
