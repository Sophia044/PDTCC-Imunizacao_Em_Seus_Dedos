// ============================================================
// TELA: Login
// DESCRIÇÃO: Tela de autenticação do usuário. Permite login
//            com e-mail e senha, com acesso rápido por perfil
//            (Paciente ou Profissional) e link para cadastro.
// ACESSO: Ambos (ponto de entrada após a splash)
// ROTA: /app/(auth)/login.tsx
// ============================================================

// --- Bibliotecas principais do React ---
import React, { useState } from 'react';

// --- Componentes de layout e interação do React Native ---
import {
  KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';

// --- Animações com Reanimated ---
import Animated, { FadeInDown } from 'react-native-reanimated';

// --- Navegação com Expo Router ---
import { router } from 'expo-router';

// --- Controle da barra de status do sistema operacional ---
import { StatusBar } from 'expo-status-bar';

// --- Ícones vetoriais da biblioteca Ionicons ---
import { Ionicons } from '@expo/vector-icons';

// --- Paleta de cores oficial do VacinApp ---
import { Colors } from '../../constants/Colors';

// --- Componentes internos do projeto ---
import { InputField } from '../../components/InputField';
import { PrimaryButton } from '../../components/PrimaryButton';

// -------------------------------------------------------
// COMPONENTE PRINCIPAL: Tela de Login
// -------------------------------------------------------
export default function LoginScreen() {
  const [email, setEmail]       = useState(''); // Armazena o e-mail digitado pelo usuário
  const [password, setPassword] = useState(''); // Armazena a senha digitada

  return (
    // KeyboardAvoidingView empurra o conteúdo para cima quando o teclado abre
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Barra de status com ícones escuros (fundo claro) */}
      <StatusBar style="dark" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ---- ARCO DECORATIVO NO TOPO (elemento visual) ---- */}
        <View style={styles.arc}>
          <View style={styles.arcInner} />
        </View>

        {/* ---- LOGO: Ícone + Nome do App ---- */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.logoRow}>
          {/* Círculo roxo com ícone médico */}
          <View style={styles.logoCircle}>
            <Ionicons name="medical" size={28} color={Colors.NEUTRAL.WHITE} />
          </View>
          <Text style={styles.logoText}>VacinApp</Text>
        </Animated.View>

        {/* ---- TÍTULO E SUBTÍTULO DA TELA ---- */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <Text style={styles.title}>Bem-vindo de volta</Text>
          <Text style={styles.subtitle}>Acesse seu histórico de imunização</Text>
        </Animated.View>

        {/* ---- FORMULÁRIO: Campos de e-mail e senha ---- */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.form}>
          <InputField
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            icon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <InputField
            label="Senha"
            value={password}
            onChangeText={setPassword}
            icon="lock-closed-outline"
            secureTextEntry
          />
          {/* Link para recuperação de senha */}
          <TouchableOpacity style={styles.forgot}>
            <Text style={styles.forgotText}>Esqueceu a senha?</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ---- BOTÃO PRINCIPAL DE ENTRAR ---- */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)}>
          {/* Por ora navega direto para a home do paciente (sem validação real) */}
          <PrimaryButton label="Entrar" onPress={() => router.replace('/(patient)/home')} />
        </Animated.View>

        {/* ---- SEPARADOR "ou continue como" ---- */}
        <Animated.View entering={FadeInDown.delay(500).duration(600)} style={styles.separatorRow}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>ou continue como</Text>
          <View style={styles.separatorLine} />
        </Animated.View>

        {/* ---- BOTÕES DE ACESSO RÁPIDO POR PERFIL ---- */}
        <Animated.View entering={FadeInDown.delay(600).duration(600)} style={styles.profileBtns}>
          {/* Botão: Entrar como Paciente (borda roxa) */}
          <TouchableOpacity style={styles.patientBtn} onPress={() => router.replace('/(patient)/home')}>
            <Ionicons name="person" size={20} color={Colors.PRIMARY} />
            <Text style={styles.patientBtnText}>Entrar como Paciente</Text>
          </TouchableOpacity>

          {/* Botão: Entrar como Profissional de Saúde (fundo verde) */}
          <TouchableOpacity style={styles.professionalBtn} onPress={() => router.replace('/(professional)/home')}>
            <Ionicons name="medkit" size={20} color={Colors.NEUTRAL.WHITE} />
            <Text style={styles.professionalBtnText}>Entrar como Profissional de Saúde</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ---- LINK PARA CADASTRO ---- */}
        <Animated.View entering={FadeInDown.delay(700).duration(600)} style={styles.registerRow}>
          <Text style={styles.registerText}>Não tem conta? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register-patient')}>
            <Text style={styles.registerLink}>Cadastre-se</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// -------------------------------------------------------
// ESTILOS DA TELA
// -------------------------------------------------------
const styles = StyleSheet.create({
  // === SCROLL VIEW PRINCIPAL ===
  scroll:            { flex: 1, backgroundColor: Colors.NEUTRAL.WHITE },
  content:           { paddingHorizontal: 24, paddingBottom: 40 },

  // === ARCO DECORATIVO NO TOPO ===
  arc:               { height: 120, marginHorizontal: -24, overflow: 'hidden', marginBottom: 24 },
  arcInner:          { height: 200, marginTop: -80, backgroundColor: Colors.BACKGROUND, borderRadius: 9999 },

  // === LOGO ===
  logoRow:           { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 28 },
  logoCircle:        { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.PRIMARY, alignItems: 'center', justifyContent: 'center' },
  logoText:          { fontSize: 22, fontWeight: '800', color: Colors.PRIMARY },

  // === TÍTULO E SUBTÍTULO ===
  title:             { fontSize: 28, fontWeight: '800', color: Colors.PRIMARY, marginBottom: 6 },
  subtitle:          { fontSize: 15, color: Colors.NEUTRAL.MUTED, marginBottom: 28 },

  // === FORMULÁRIO ===
  form:              { marginBottom: 18 },
  forgot:            { alignSelf: 'flex-end', marginTop: -6 },
  forgotText:        { fontSize: 13, color: Colors.SECONDARY, fontWeight: '600' },

  // === SEPARADOR ===
  separatorRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 20 },
  separatorLine:     { flex: 1, height: 1, backgroundColor: Colors.BORDER },
  separatorText:     { fontSize: 13, color: Colors.NEUTRAL.MUTED },

  // === BOTÕES DE PERFIL ===
  profileBtns:       { gap: 12, marginBottom: 28 },
  patientBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.PRIMARY },
  patientBtnText:    { fontSize: 15, fontWeight: '700', color: Colors.PRIMARY },
  professionalBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: 14, backgroundColor: Colors.PROFESSIONAL },
  professionalBtnText: { fontSize: 15, fontWeight: '700', color: Colors.NEUTRAL.WHITE },

  // === LINK DE CADASTRO ===
  registerRow:       { flexDirection: 'row', justifyContent: 'center' },
  registerText:      { fontSize: 14, color: Colors.NEUTRAL.MUTED },
  registerLink:      { fontSize: 14, fontWeight: '700', color: Colors.PRIMARY },
});
