// ============================================================
// TELA: Cadastro SUS (Rede Pública)
// DESCRIÇÃO: Formulário de criação de conta para pacientes
//            atendidos pela rede pública de saúde (SUS).
//            Campos: nome, CPF, nascimento, CNS, telefone,
//            e-mail, senha e confirmação de senha.
// ACESSO: Paciente (novo usuário — rede pública)
// ROTA: /app/(auth)/register-sus.tsx
// ============================================================

import React, { useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { InputField } from '../../components/InputField';
import { PrimaryButton } from '../../components/PrimaryButton';

// -------------------------------------------------------
// Componente interno: Indicador de etapas
// -------------------------------------------------------
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <View style={si.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[si.dot, i < current && si.dotActive, i === current - 1 && si.dotCurrent]} />
      ))}
    </View>
  );
}

const si = StyleSheet.create({
  row:        { flexDirection: 'row', gap: 8, flex: 1 },
  dot:        { height: 6, flex: 1, borderRadius: 4, backgroundColor: Colors.BORDER },
  dotActive:  { backgroundColor: Colors.SECONDARY },
  dotCurrent: { backgroundColor: Colors.PRIMARY },
});

// -------------------------------------------------------
// Utilitário: Validação de CPF
// -------------------------------------------------------
function isValidCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(digits[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  return rest === parseInt(digits[10]);
}

// -------------------------------------------------------
// COMPONENTE PRINCIPAL: Cadastro SUS
// -------------------------------------------------------
export default function RegisterSusScreen() {
  const [name, setName]           = useState('');
  const [cpf, setCpf]             = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [cns, setCns]             = useState('');
  const [phone, setPhone]         = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');

  // ---- Máscaras de formatação ----

  const handleCpf = (text: string) => {
    const d = text.replace(/\D/g, '').slice(0, 11);
    let m = d;
    if (d.length > 3) m = d.slice(0, 3) + '.' + d.slice(3);
    if (d.length > 6) m = m.slice(0, 7) + '.' + d.slice(6);
    if (d.length > 9) m = m.slice(0, 11) + '-' + d.slice(9);
    setCpf(m);
  };

  const handleDate = (text: string) => {
    const d = text.replace(/\D/g, '').slice(0, 8);
    let m = d;
    if (d.length > 2) m = d.slice(0, 2) + '/' + d.slice(2);
    if (d.length > 4) m = m.slice(0, 5) + '/' + d.slice(4);
    setBirthdate(m);
  };

  const handleCns = (text: string) => {
    // CNS: 15 dígitos, exibido em grupos: "000 0000 0000 0000"
    const d = text.replace(/\D/g, '').slice(0, 15);
    let m = d;
    if (d.length > 3)  m = d.slice(0, 3) + ' ' + d.slice(3);
    if (d.length > 7)  m = m.slice(0, 8) + ' ' + d.slice(7);
    if (d.length > 11) m = m.slice(0, 13) + ' ' + d.slice(11);
    setCns(m);
  };

  const handlePhone = (text: string) => {
    const d = text.replace(/\D/g, '').slice(0, 11);
    let m = d;
    if (d.length > 0)  m = '(' + d;
    if (d.length > 2)  m = '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length > 7)  m = '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
    setPhone(m);
  };

  // ---- Validação e envio ----
  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Campo obrigatório', 'Informe o nome completo.');
      return;
    }
    if (!isValidCpf(cpf)) {
      Alert.alert('CPF inválido', 'Verifique o CPF informado.');
      return;
    }
    if (cns.replace(/\D/g, '').length < 15) {
      Alert.alert('CNS obrigatório', 'Informe o número completo do Cartão Nacional de Saúde.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Senha fraca', 'A senha deve ter no mínimo 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Senhas diferentes', 'A confirmação não coincide com a senha digitada.');
      return;
    }

    // TODO: Integrar com API do SUS / banco de dados
    console.log('Cadastro SUS (mock):', { name, cpf, birthdate, cns, phone, email });
    router.replace('/(patient)/home');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ---- HEADER: Botão voltar + indicador de etapas ---- */}
        <Animated.View entering={FadeInDown.delay(50).duration(500)} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.PRIMARY} />
          </TouchableOpacity>
          <StepIndicator current={2} total={3} />
        </Animated.View>

        {/* ---- BADGE DE IDENTIFICAÇÃO ---- */}
        <Animated.View entering={FadeInDown.delay(80).duration(600)}>
          <View style={styles.badge}>
            <Ionicons name="medkit" size={14} color={Colors.NEUTRAL.WHITE} />
            <Text style={styles.badgeText}>Rede Pública · SUS</Text>
          </View>
        </Animated.View>

        {/* ---- TÍTULO ---- */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
          <Text style={styles.title}>Cadastro SUS</Text>
          <Text style={styles.subtitle}>Preencha seus dados para criar sua conta</Text>
        </Animated.View>

        {/* ---- SEÇÃO: DADOS PESSOAIS ---- */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={16} color={Colors.PRIMARY} />
            <Text style={styles.sectionTitle}>Dados Pessoais</Text>
          </View>

          <InputField
            label="Nome completo"
            value={name}
            onChangeText={setName}
            icon="person-outline"
          />
          <InputField
            label="CPF"
            value={cpf}
            onChangeText={handleCpf}
            icon="card-outline"
            keyboardType="numeric"
            placeholder="000.000.000-00"
          />
          <InputField
            label="Data de nascimento"
            value={birthdate}
            onChangeText={handleDate}
            icon="calendar-outline"
            keyboardType="numeric"
            placeholder="DD/MM/AAAA"
          />
        </Animated.View>

        {/* ---- SEÇÃO: DADOS DO SUS ---- */}
        <Animated.View entering={FadeInDown.delay(280).duration(600)} style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medical-outline" size={16} color={Colors.PRIMARY} />
            <Text style={styles.sectionTitle}>Cartão Nacional de Saúde</Text>
          </View>

          <InputField
            label="Número do CNS"
            value={cns}
            onChangeText={handleCns}
            icon="id-card-outline"
            keyboardType="numeric"
            placeholder="000 0000 0000 0000"
          />

          {/* Nota sobre o CNS */}
          <View style={styles.hint}>
            <Ionicons name="information-circle-outline" size={14} color={Colors.NEUTRAL.MUTED} />
            <Text style={styles.hintText}>
              O CNS está no verso do seu Cartão Nacional de Saúde ou pode ser obtido na UBS mais próxima.
            </Text>
          </View>
        </Animated.View>

        {/* ---- SEÇÃO: CONTATO ---- */}
        <Animated.View entering={FadeInDown.delay(340).duration(600)} style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="call-outline" size={16} color={Colors.PRIMARY} />
            <Text style={styles.sectionTitle}>Contato</Text>
          </View>

          <InputField
            label="Telefone"
            value={phone}
            onChangeText={handlePhone}
            icon="phone-portrait-outline"
            keyboardType="phone-pad"
            placeholder="(00) 00000-0000"
          />
          <InputField
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            icon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </Animated.View>

        {/* ---- SEÇÃO: SENHA ---- */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="lock-closed-outline" size={16} color={Colors.PRIMARY} />
            <Text style={styles.sectionTitle}>Acesso</Text>
          </View>

          <InputField
            label="Senha"
            value={password}
            onChangeText={setPassword}
            icon="lock-closed-outline"
            secureTextEntry
          />
          <InputField
            label="Confirmar senha"
            value={confirm}
            onChangeText={setConfirm}
            icon="shield-checkmark-outline"
            secureTextEntry
          />

          {/* Requisitos de senha */}
          <View style={styles.requirement}>
            <Ionicons
              name={password.length >= 8 ? 'checkmark-circle' : 'ellipse-outline'}
              size={14}
              color={password.length >= 8 ? Colors.PROFESSIONAL : Colors.NEUTRAL.MUTED}
            />
            <Text style={[styles.requirementText, password.length >= 8 && styles.requirementMet]}>
              Mínimo de 8 caracteres
            </Text>
          </View>
          <View style={styles.requirement}>
            <Ionicons
              name={confirm.length > 0 && confirm === password ? 'checkmark-circle' : 'ellipse-outline'}
              size={14}
              color={confirm.length > 0 && confirm === password ? Colors.PROFESSIONAL : Colors.NEUTRAL.MUTED}
            />
            <Text style={[styles.requirementText, confirm.length > 0 && confirm === password && styles.requirementMet]}>
              Senhas coincidem
            </Text>
          </View>
        </Animated.View>

        {/* ---- BOTÃO CRIAR CONTA ---- */}
        <Animated.View entering={FadeInDown.delay(460).duration(600)}>
          <PrimaryButton label="Criar Conta" onPress={handleSubmit} />
        </Animated.View>

        {/* ---- LINK: JÁ TENHO CONTA ---- */}
        <TouchableOpacity style={styles.loginRow} onPress={() => router.replace('/(auth)/login-user')}>
          <Text style={styles.loginText}>Já tem conta? <Text style={styles.loginLink}>Entrar</Text></Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// -------------------------------------------------------
// ESTILOS DA TELA
// -------------------------------------------------------
const styles = StyleSheet.create({
  scroll:            { flex: 1, backgroundColor: Colors.NEUTRAL.WHITE },
  content:           { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 40 },

  // Header
  header:            { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  backBtn:           { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.PRIMARY_LIGHT, alignItems: 'center', justifyContent: 'center' },

  // Badge
  badge:             { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.PRIMARY, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 16 },
  badgeText:         { fontSize: 12, fontWeight: '700', color: Colors.NEUTRAL.WHITE, letterSpacing: 0.5 },

  // Título
  title:             { fontSize: 26, fontWeight: '800', color: Colors.PRIMARY, marginBottom: 4 },
  subtitle:          { fontSize: 14, color: Colors.NEUTRAL.MUTED, marginBottom: 24 },

  // Cards de seção
  card:              { backgroundColor: Colors.CARD_BG, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: Colors.BORDER },
  sectionHeader:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionTitle:      { fontSize: 13, fontWeight: '700', color: Colors.NEUTRAL.MUTED, textTransform: 'uppercase', letterSpacing: 0.8 },

  // Hint / Nota
  hint:              { flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: Colors.PRIMARY_LIGHT, borderRadius: 10, padding: 10, marginTop: 4 },
  hintText:          { flex: 1, fontSize: 12, color: Colors.NEUTRAL.MUTED, lineHeight: 18 },

  // Requisitos de senha
  requirement:       { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  requirementText:   { fontSize: 12, color: Colors.NEUTRAL.MUTED },
  requirementMet:    { color: Colors.PROFESSIONAL, fontWeight: '600' },

  // Link de login
  loginRow:          { alignItems: 'center', marginTop: 20 },
  loginText:         { fontSize: 14, color: Colors.NEUTRAL.MUTED },
  loginLink:         { color: Colors.PRIMARY, fontWeight: '700' },
});
