// ============================================================
// TELA: Login do Paciente
// DESCRIÇÃO: Tela exclusiva de autenticação para pacientes.
//            Permite escolher entre Rede Pública (SUS) e
//            Rede Privada (Convênio) antes de fazer login.
//            Modo SUS: CPF + Senha
//            Modo Convênio: Convênio (picker) + CPF + Senha
// ACESSO: Paciente
// ROTA: /app/(auth)/login-user.tsx
// ============================================================

import React, { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOutDown, Layout } from 'react-native-reanimated';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { InputField } from '../../components/InputField';
import { PrimaryButton } from '../../components/PrimaryButton';

// -------------------------------------------------------
// Tipo do estado de login — preparado para integração futura
// -------------------------------------------------------
type LoginType = 'sus' | 'private';

interface LoginState {
  loginType: LoginType;
  cpf: string;
  password: string;
}

// -------------------------------------------------------
// Componente interno: Segmented Control SUS / Convênio
// -------------------------------------------------------
interface SegmentedControlProps {
  selected: LoginType;
  onChange: (value: LoginType) => void;
}

function SegmentedControl({ selected, onChange }: SegmentedControlProps) {
  return (
    <View style={sc.container}>
      {/* Opção SUS */}
      <TouchableOpacity
        style={[sc.option, selected === 'sus' && sc.optionActive]}
        onPress={() => onChange('sus')}
        activeOpacity={0.8}
      >
        <Ionicons
          name="medkit"
          size={16}
          color={selected === 'sus' ? Colors.NEUTRAL.WHITE : Colors.NEUTRAL.MUTED}
        />
        <Text style={[sc.label, selected === 'sus' && sc.labelActive]}>
          Rede Pública
        </Text>
        {selected === 'sus' && (
          <View style={sc.dot} />
        )}
      </TouchableOpacity>

      {/* Divisor */}
      <View style={sc.divider} />

      {/* Opção Convênio */}
      <TouchableOpacity
        style={[sc.option, selected === 'private' && sc.optionActiveGreen]}
        onPress={() => onChange('private')}
        activeOpacity={0.8}
      >
        <Ionicons
          name="shield-checkmark"
          size={16}
          color={selected === 'private' ? Colors.NEUTRAL.WHITE : Colors.NEUTRAL.MUTED}
        />
        <Text style={[sc.label, selected === 'private' && sc.labelActive]}>
          Convênio
        </Text>
        {selected === 'private' && (
          <View style={sc.dot} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const sc = StyleSheet.create({
  container:       {
    flexDirection: 'row',
    backgroundColor: Colors.CARD_BG,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.BORDER,
    overflow: 'hidden',
    marginBottom: 14,
  },
  option:          { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 13 },
  optionActive:    { backgroundColor: Colors.PRIMARY },
  optionActiveGreen: { backgroundColor: Colors.PROFESSIONAL },
  label:           { fontSize: 14, fontWeight: '700', color: Colors.NEUTRAL.MUTED },
  labelActive:     { color: Colors.NEUTRAL.WHITE },
  divider:         { width: 1, backgroundColor: Colors.BORDER },
  dot:             { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.7)' },
});

// -------------------------------------------------------
// COMPONENTE PRINCIPAL: Login do Paciente
// -------------------------------------------------------
export default function LoginUserScreen() {
  // Estado completo de login (preparado para integração futura)
  const [form, setForm] = useState<LoginState>({
    loginType: 'sus',
    cpf: '',
    password: '',
  });

  // Helpers para atualizar o estado
  const setLoginType = (v: LoginType) => setForm(f => ({ ...f, loginType: v }));
  const setCpf       = (v: string)    => setForm(f => ({ ...f, cpf: v }));
  const setPassword  = (v: string)    => setForm(f => ({ ...f, password: v }));

  // Máscara de CPF: 000.000.000-00
  const handleCpf = (text: string) => {
    const d = text.replace(/\D/g, '').slice(0, 11);
    let m = d;
    if (d.length > 3)  m = d.slice(0, 3) + '.' + d.slice(3);
    if (d.length > 6)  m = m.slice(0, 7) + '.' + d.slice(6);
    if (d.length > 9)  m = m.slice(0, 11) + '-' + d.slice(9);
    setCpf(m);
  };

  // Mock de login — em produção chamar API passando `form`
  const handleLogin = () => {
    // TODO: enviar `form` para a API de autenticação
    console.log('Login (mock):', form);
    router.replace('/(patient)/home');
  };

  const isSus     = form.loginType === 'sus';
  const isPrivate = form.loginType === 'private';

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
        {/* ---- SEGMENTED CONTROL: SUS / CONVÊNIO ----    */}
        {/* ════════════════════════════════════════════════ */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)}>

          <Text style={styles.segmentLabel}>Como deseja acessar?</Text>
          <SegmentedControl selected={form.loginType} onChange={setLoginType} />

          {/* Texto contextual abaixo do seletor */}
          <Animated.View
            key={form.loginType}   // força re-animação ao trocar
            entering={FadeIn.duration(350)}
            style={[styles.contextBox, isPrivate && styles.contextBoxGreen]}
          >
            <Ionicons
              name={isSus ? 'medkit-outline' : 'shield-checkmark-outline'}
              size={15}
              color={isSus ? Colors.PRIMARY : Colors.PROFESSIONAL}
            />
            <Text style={[styles.contextText, isPrivate && styles.contextTextGreen]}>
              {isSus
                ? 'Você está acessando sua conta da Rede Pública de Saúde.'
                : 'Você está acessando sua conta da Rede Privada (Convênio).'}
            </Text>
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
            value={form.cpf}
            onChangeText={handleCpf}
            icon="card-outline"
            keyboardType="numeric"
            placeholder="000.000.000-00"
          />

          {/* Senha — presente em ambos os modos */}
          <InputField
            label="Senha"
            value={form.password}
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
  scroll:            { flex: 1, backgroundColor: Colors.NEUTRAL.WHITE },
  content:           { paddingHorizontal: 24, paddingBottom: 40 },

  // Arco decorativo no topo
  arc:               { height: 120, marginHorizontal: -24, overflow: 'hidden', marginBottom: 24 },
  arcInner:          { height: 200, marginTop: -80, backgroundColor: Colors.BACKGROUND, borderRadius: 9999 },

  // Logo
  logoRow:           { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 },
  logoCircle:        { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.PRIMARY, alignItems: 'center', justifyContent: 'center' },
  logoText:          { fontSize: 22, fontWeight: '800', color: Colors.PRIMARY },

  // Título
  title:             { fontSize: 28, fontWeight: '800', color: Colors.PRIMARY, marginBottom: 6 },
  subtitle:          { fontSize: 15, color: Colors.NEUTRAL.MUTED, marginBottom: 16 },

  // Badge de perfil
  profileBadge:      { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.PRIMARY_LIGHT, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 24 },
  profileBadgeText:  { fontSize: 13, fontWeight: '600', color: Colors.PRIMARY },

  // Segmented control
  segmentLabel:      { fontSize: 13, fontWeight: '700', color: Colors.NEUTRAL.DARK_TEXT, marginBottom: 10 },

  // Caixa de contexto (abaixo do seletor)
  contextBox:        { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: Colors.PRIMARY_LIGHT, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 20 },
  contextBoxGreen:   { backgroundColor: Colors.PROFESSIONAL_LIGHT },
  contextText:       { flex: 1, fontSize: 13, color: Colors.PRIMARY, lineHeight: 18, fontWeight: '500' },
  contextTextGreen:  { color: Colors.PROFESSIONAL },

  // Formulário
  form:              { marginBottom: 18 },
  forgot:            { alignSelf: 'flex-end', marginTop: -6 },
  forgotText:        { fontSize: 13, color: Colors.SECONDARY, fontWeight: '600' },

  // Criar conta
  registerRow:       { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  registerText:      { fontSize: 14, color: Colors.NEUTRAL.MUTED },
  registerLink:      { fontSize: 14, fontWeight: '700', color: Colors.PRIMARY },

  // Voltar
  backRow:           { alignItems: 'center', marginTop: 16 },
  backBtn:           { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText:          { fontSize: 13, color: Colors.NEUTRAL.MUTED },
});
