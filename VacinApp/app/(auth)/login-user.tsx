// ============================================================
// TELA: Login do Paciente
// DESCRIÇÃO: Tela exclusiva de autenticação para pacientes.
//            Permite escolher entre Rede Pública (SUS) e
//            Rede Privada (Convênio) antes de fazer login.
//
//            Modo SUS (public):     CPF + Senha
//            Modo Convênio (private): CPF + Senha
//            (campo networkType diferencia o destino no backend)
//
// PREPARADO PARA BACKEND:
//   Payload enviado à API:
//   {
//     cpf: string,
//     password: string,
//     networkType: 'sus' | 'private',
//   }
//
// ACESSO: Paciente
// ROTA: /app/(auth)/login-user.tsx
// ============================================================

import React, { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { InputField } from '../../components/InputField';
import { PrimaryButton } from '../../components/PrimaryButton';

// --- Componentes reutilizáveis de autenticação ---
import { AuthSegmentSelector, AuthContextMessage } from '../../components/auth';
import type { SegmentOption } from '../../components/auth';

// -------------------------------------------------------
// Tipo do estado de login — preparado para integração futura
// -------------------------------------------------------

/** Tipo da rede selecionada pelo paciente */
type NetworkType = 'sus' | 'private';

/** Payload que será enviado ao endpoint de autenticação do paciente */
interface PatientLoginPayload {
  cpf: string;
  password: string;
  networkType: NetworkType;
}

// -------------------------------------------------------
// Opções do seletor de rede — configuráveis para fácil manutenção
// -------------------------------------------------------
const NETWORK_OPTIONS: SegmentOption[] = [
  { value: 'sus',     label: 'Rede Pública', icon: 'medkit'          },
  { value: 'private', label: 'Convênio',      icon: 'shield-checkmark' },
];

// -------------------------------------------------------
// Mensagens e ícones contextuais por rede
// -------------------------------------------------------
const NETWORK_MESSAGES: Record<NetworkType, string> = {
  sus:     'Você está acessando sua conta da Rede Pública de Saúde.',
  private: 'Você está acessando sua conta da Rede Privada (Convênio).',
};

const NETWORK_ICONS: Record<NetworkType, React.ComponentProps<typeof Ionicons>['name']> = {
  sus:     'medkit-outline',
  private: 'shield-checkmark-outline',
};

// -------------------------------------------------------
// COMPONENTE PRINCIPAL: Login do Paciente
// -------------------------------------------------------
export default function LoginUserScreen() {

  // ── Estado completo de login — preparado para integração futura ──
  // Os nomes dos campos correspondem diretamente ao payload da API.
  const [networkType, setNetworkType] = useState<NetworkType>('sus');
  const [cpf,         setCpf]         = useState('');
  const [password,    setPassword]    = useState('');

  // ── Flags derivadas do estado ──
  const isPrivate = networkType === 'private';

  // ── Máscara de CPF: 000.000.000-00 ──
  const handleCpf = (text: string) => {
    const d = text.replace(/\D/g, '').slice(0, 11);
    let m = d;
    if (d.length > 3)  m = d.slice(0, 3) + '.' + d.slice(3);
    if (d.length > 6)  m = m.slice(0, 7) + '.' + d.slice(6);
    if (d.length > 9)  m = m.slice(0, 11) + '-' + d.slice(9);
    setCpf(m);
  };

  // ── Handler: login ──
  const handleLogin = () => {
    // Monta o payload exatamente como será enviado à API
    const payload: PatientLoginPayload = {
      cpf,
      password,
      networkType,
    };

    // TODO: Integrar com endpoint de autenticação do paciente
    // Exemplo: await api.post('/auth/patient/login', payload);
    console.log('Login Paciente (payload pronto para API):', payload);

    router.replace('/(patient)/home');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ---- ARCO DECORATIVO NO TOPO ---- */}
        <View style={styles.arc}>
          <View style={styles.arcInner} />
        </View>

        {/* ---- LOGO ---- */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.logoRow}>
          <View style={styles.logoCircle}>
            <Ionicons name="medical" size={28} color={Colors.NEUTRAL.WHITE} />
          </View>
          <Text style={styles.logoText}>VacinApp</Text>
        </Animated.View>

        {/* ---- TÍTULO E SUBTÍTULO ---- */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <Text style={styles.title}>Bem-vindo ao VacinApp</Text>
          <Text style={styles.subtitle}>Acesse sua carteira digital de vacinação</Text>
        </Animated.View>

        {/* ---- BADGE DE PERFIL ---- */}
        <Animated.View entering={FadeInDown.delay(250).duration(600)}>
          <View style={styles.profileBadge}>
            <Ionicons name="person-circle" size={18} color={Colors.PRIMARY} />
            <Text style={styles.profileBadgeText}>Área do Paciente</Text>
          </View>
        </Animated.View>

        {/* ════════════════════════════════════════════════ */}
        {/* ---- SELETOR DE REDE: Pública / Convênio ----   */}
        {/* ════════════════════════════════════════════════ */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)}>

          <Text style={styles.segmentLabel}>Como deseja acessar?</Text>

          {/* Seletor reutilizável — variante roxa do paciente */}
          <AuthSegmentSelector
            options={NETWORK_OPTIONS}
            selected={networkType}
            onChange={(value) => setNetworkType(value as NetworkType)}
            variant="patient"
          />

          {/* Mensagem contextual — re-anima ao trocar de rede */}
          <Animated.View
            key={networkType}
            entering={FadeIn.duration(350)}
          >
            <AuthContextMessage
              message={NETWORK_MESSAGES[networkType]}
              icon={NETWORK_ICONS[networkType]}
              variant={isPrivate ? 'professional' : 'patient'}
            />
          </Animated.View>

        </Animated.View>

        {/* ════════════════════════════════════════════════ */}
        {/* ---- FORMULÁRIO DE LOGIN ----                   */}
        {/* ════════════════════════════════════════════════ */}
        <Animated.View
          entering={FadeInDown.delay(380).duration(600)}
          layout={Layout.springify()}
          style={styles.form}
        >
          {/* CPF — presente em ambos os modos */}
          <InputField
            label="CPF"
            value={cpf}
            onChangeText={handleCpf}
            icon="card-outline"
            keyboardType="numeric"
            placeholder="000.000.000-00"
          />

          {/* Senha — presente em ambos os modos */}
          <InputField
            label="Senha"
            value={password}
            onChangeText={setPassword}
            icon="lock-closed-outline"
            secureTextEntry
          />

          <TouchableOpacity style={styles.forgot}>
            <Text style={styles.forgotText}>Esqueceu a senha?</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ---- BOTÃO ENTRAR ---- */}
        <Animated.View entering={FadeInDown.delay(460).duration(600)}>
          <PrimaryButton
            label="Entrar"
            onPress={handleLogin}
            variant={isPrivate ? 'professional' : 'primary'}
          />
        </Animated.View>

        {/* ---- LINK CRIAR CONTA ---- */}
        <Animated.View entering={FadeInDown.delay(540).duration(600)} style={styles.registerRow}>
          <Text style={styles.registerText}>Não tem conta? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/choose-registration')}>
            <Text style={styles.registerLink}>Criar Conta</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ---- VOLTAR PARA LOGIN GERAL ---- */}
        <Animated.View entering={FadeInDown.delay(600).duration(600)} style={styles.backRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/(auth)/login')}>
            <Ionicons name="arrow-back" size={16} color={Colors.NEUTRAL.MUTED} />
            <Text style={styles.backText}>Voltar ao início</Text>
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
  scroll:   { flex: 1, backgroundColor: Colors.NEUTRAL.WHITE },
  content:  { paddingHorizontal: 24, paddingBottom: 40 },

  // Arco decorativo no topo
  arc:      { height: 120, marginHorizontal: -24, overflow: 'hidden', marginBottom: 24 },
  arcInner: { height: 200, marginTop: -80, backgroundColor: Colors.BACKGROUND, borderRadius: 9999 },

  // Logo
  logoRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 },
  logoCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.PRIMARY, alignItems: 'center', justifyContent: 'center' },
  logoText:   { fontSize: 22, fontWeight: '800', color: Colors.PRIMARY },

  // Título
  title:    { fontSize: 28, fontWeight: '800', color: Colors.PRIMARY, marginBottom: 6 },
  subtitle: { fontSize: 15, color: Colors.NEUTRAL.MUTED, marginBottom: 16 },

  // Badge de perfil
  profileBadge:     { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.PRIMARY_LIGHT, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 24 },
  profileBadgeText: { fontSize: 13, fontWeight: '600', color: Colors.PRIMARY },

  // Seletor de rede
  segmentLabel: { fontSize: 13, fontWeight: '700', color: Colors.NEUTRAL.DARK_TEXT, marginBottom: 10 },

  // Formulário
  form:       { marginBottom: 18 },
  forgot:     { alignSelf: 'flex-end', marginTop: -6 },
  forgotText: { fontSize: 13, color: Colors.SECONDARY, fontWeight: '600' },

  // Criar conta
  registerRow:  { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  registerText: { fontSize: 14, color: Colors.NEUTRAL.MUTED },
  registerLink: { fontSize: 14, fontWeight: '700', color: Colors.PRIMARY },

  // Voltar
  backRow:  { alignItems: 'center', marginTop: 16 },
  backBtn:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { fontSize: 13, color: Colors.NEUTRAL.MUTED },
});
