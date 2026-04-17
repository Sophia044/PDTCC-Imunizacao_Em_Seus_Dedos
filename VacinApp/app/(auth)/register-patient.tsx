import React, { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { InputField } from '../../components/InputField';
import { PrimaryButton } from '../../components/PrimaryButton';

// Componente de step indicator
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
  row:         { flexDirection: 'row', gap: 8, marginBottom: 28 },
  dot:         { height: 6, flex: 1, borderRadius: 4, backgroundColor: Colors.BORDER },
  dotActive:   { backgroundColor: Colors.SECONDARY },
  dotCurrent:  { backgroundColor: Colors.PRIMARY },
});

// ── Tela principal ─────────────────────────────────────────────────────────────
export default function RegisterPatientScreen() {
  const [name, setName]         = useState('');
  const [cpf, setCpf]           = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');

  // Máscara simples de CPF
  const handleCpf = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 11);
    let masked = digits;
    if (digits.length > 3)  masked = digits.slice(0,3) + '.' + digits.slice(3);
    if (digits.length > 6)  masked = masked.slice(0,7) + '.' + digits.slice(6);
    if (digits.length > 9)  masked = masked.slice(0,11) + '-' + digits.slice(9);
    setCpf(masked);
  };

  // Máscara de data de nascimento
  const handleDate = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 8);
    let masked = digits;
    if (digits.length > 2) masked = digits.slice(0,2) + '/' + digits.slice(2);
    if (digits.length > 4) masked = masked.slice(0,5) + '/' + digits.slice(4);
    setBirthdate(masked);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Animated.View entering={FadeInDown.delay(50).duration(500)} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={Colors.PRIMARY} />
          </TouchableOpacity>
          <StepIndicator current={1} total={2} />
        </Animated.View>

        {/* Título */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
          <View style={styles.titleRow}>
            <Ionicons name="person-circle" size={32} color={Colors.PRIMARY} />
            <Text style={styles.title}>Criar conta de{'\n'}Paciente</Text>
          </View>
          <Text style={styles.subtitle}>Preencha seus dados para começar</Text>
        </Animated.View>

        {/* Formulário */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.card}>
          <Text style={styles.sectionTitle}>Dados Pessoais</Text>
          <InputField label="Nome completo" value={name} onChangeText={setName} icon="person-outline" />
          <InputField label="CPF" value={cpf} onChangeText={handleCpf} icon="card-outline" keyboardType="numeric" placeholder="000.000.000-00" />
          <InputField label="Data de nascimento" value={birthdate} onChangeText={handleDate} icon="calendar-outline" keyboardType="numeric" placeholder="DD/MM/AAAA" />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.card}>
          <Text style={styles.sectionTitle}>Acesso</Text>
          <InputField label="E-mail" value={email} onChangeText={setEmail} icon="mail-outline" keyboardType="email-address" autoCapitalize="none" />
          <InputField label="Senha" value={password} onChangeText={setPassword} icon="lock-closed-outline" secureTextEntry />
          <InputField label="Confirmar senha" value={confirm} onChangeText={setConfirm} icon="shield-checkmark-outline" secureTextEntry />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(600)}>
          <PrimaryButton label="Criar conta" onPress={() => router.replace('/(patient)/home')} />
        </Animated.View>

        <TouchableOpacity style={styles.loginRow} onPress={() => router.back()}>
          <Text style={styles.loginText}>Já tem conta? <Text style={styles.loginLink}>Entrar</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll:        { flex: 1, backgroundColor: Colors.NEUTRAL.WHITE },
  content:       { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 40 },
  header:        { flexDirection: 'column', gap: 16, marginBottom: 24 },
  titleRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
  title:         { fontSize: 26, fontWeight: '800', color: Colors.PRIMARY, lineHeight: 32 },
  subtitle:      { fontSize: 14, color: Colors.NEUTRAL.MUTED, marginBottom: 20 },
  card:          { backgroundColor: Colors.CARD_BG, borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionTitle:  { fontSize: 13, fontWeight: '700', color: Colors.NEUTRAL.MUTED, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 },
  loginRow:      { alignItems: 'center', marginTop: 16 },
  loginText:     { fontSize: 14, color: Colors.NEUTRAL.MUTED },
  loginLink:     { color: Colors.PRIMARY, fontWeight: '700' },
});
