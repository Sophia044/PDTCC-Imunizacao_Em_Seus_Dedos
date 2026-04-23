// ============================================================
// TELA: Cadastro de Paciente
// DESCRIÇÃO: Formulário de criação de conta para novos pacientes.
//            Coleta dados pessoais (nome, CPF, nascimento) e
//            credenciais de acesso (e-mail e senha).
//            Inclui máscaras automáticas para CPF e data.
// ACESSO: Paciente (novo usuário)
// ROTA: /app/(auth)/register-patient.tsx
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
// Componente interno: Indicador de etapas do formulário
// Exibe uma barra de progresso visual com os passos do cadastro
// -------------------------------------------------------
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <View style={si.row}>
      {Array.from({ length: total }).map((_, i) => (
        // Cada ponto representa uma etapa: roxo = ativa, cinza = futura
        <View key={i} style={[si.dot, i < current && si.dotActive, i === current - 1 && si.dotCurrent]} />
      ))}
    </View>
  );
}

// Estilos do indicador de etapas
const si = StyleSheet.create({
  row:         { flexDirection: 'row', gap: 8, marginBottom: 28 },
  dot:         { height: 6, flex: 1, borderRadius: 4, backgroundColor: Colors.BORDER },    // Etapa não alcançada
  dotActive:   { backgroundColor: Colors.SECONDARY },   // Etapa já concluída
  dotCurrent:  { backgroundColor: Colors.PRIMARY },     // Etapa atual (destaque)
});

// -------------------------------------------------------
// COMPONENTE PRINCIPAL: Tela de Cadastro do Paciente
// -------------------------------------------------------
export default function RegisterPatientScreen() {
  const [name, setName]           = useState(''); // Nome completo do paciente
  const [cpf, setCpf]             = useState(''); // CPF com máscara (000.000.000-00)
  const [birthdate, setBirthdate] = useState(''); // Data de nascimento com máscara (DD/MM/AAAA)
  const [email, setEmail]         = useState(''); // E-mail para login
  const [password, setPassword]   = useState(''); // Senha de acesso
  const [confirm, setConfirm]     = useState(''); // Confirmação da senha (para validação)

  // -------------------------------------------------------
  // Aplica máscara de formatação ao CPF conforme o usuário digita
  // Converte "12345678900" em "123.456.789-00"
  // -------------------------------------------------------
  const handleCpf = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 11); // Remove não-dígitos e limita a 11
    let masked = digits;
    if (digits.length > 3)  masked = digits.slice(0,3) + '.' + digits.slice(3);
    if (digits.length > 6)  masked = masked.slice(0,7) + '.' + digits.slice(6);
    if (digits.length > 9)  masked = masked.slice(0,11) + '-' + digits.slice(9);
    setCpf(masked);
  };

  // -------------------------------------------------------
  // Aplica máscara de formatação à data de nascimento
  // Converte "01011990" em "01/01/1990"
  // -------------------------------------------------------
  const handleDate = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 8); // Remove não-dígitos e limita a 8
    let masked = digits;
    if (digits.length > 2) masked = digits.slice(0,2) + '/' + digits.slice(2);
    if (digits.length > 4) masked = masked.slice(0,5) + '/' + digits.slice(4);
    setBirthdate(masked);
  };

  return (
    // KeyboardAvoidingView empurra o conteúdo para cima quando o teclado abre
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ---- HEADER: Botão voltar + indicador de etapas ---- */}
        <Animated.View entering={FadeInDown.delay(50).duration(500)} style={styles.header}>
          {/* Botão de voltar para a tela anterior (login) */}
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={Colors.PRIMARY} />
          </TouchableOpacity>
          {/* Barra de progresso: etapa 1 de 2 */}
          <StepIndicator current={1} total={2} />
        </Animated.View>

        {/* ---- TÍTULO DA TELA ---- */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
          <View style={styles.titleRow}>
            <Ionicons name="person-circle" size={32} color={Colors.PRIMARY} />
            <Text style={styles.title}>Criar conta de{'\n'}Paciente</Text>
          </View>
          <Text style={styles.subtitle}>Preencha seus dados para começar</Text>
        </Animated.View>

        {/* ---- FORMULÁRIO: Dados Pessoais ---- */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.card}>
          <Text style={styles.sectionTitle}>Dados Pessoais</Text>
          <InputField label="Nome completo" value={name} onChangeText={setName} icon="person-outline" />
          {/* Campo CPF com máscara automática */}
          <InputField label="CPF" value={cpf} onChangeText={handleCpf} icon="card-outline" keyboardType="numeric" placeholder="000.000.000-00" />
          {/* Campo de data com máscara automática */}
          <InputField label="Data de nascimento" value={birthdate} onChangeText={handleDate} icon="calendar-outline" keyboardType="numeric" placeholder="DD/MM/AAAA" />
        </Animated.View>

        {/* ---- FORMULÁRIO: Dados de Acesso ---- */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.card}>
          <Text style={styles.sectionTitle}>Acesso</Text>
          <InputField label="E-mail" value={email} onChangeText={setEmail} icon="mail-outline" keyboardType="email-address" autoCapitalize="none" />
          <InputField label="Senha" value={password} onChangeText={setPassword} icon="lock-closed-outline" secureTextEntry />
          <InputField label="Confirmar senha" value={confirm} onChangeText={setConfirm} icon="shield-checkmark-outline" secureTextEntry />
        </Animated.View>

        {/* ---- BOTÃO: Criar conta ---- */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)}>
          {/* Em produção, aqui será feita a chamada à API de cadastro */}
          <PrimaryButton label="Criar conta" onPress={() => router.replace('/(patient)/home')} />
        </Animated.View>

        {/* ---- LINK: Já tenho conta ---- */}
        <TouchableOpacity style={styles.loginRow} onPress={() => router.back()}>
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
  // === SCROLL VIEW PRINCIPAL ===
  scroll:        { flex: 1, backgroundColor: Colors.NEUTRAL.WHITE },
  content:       { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 40 },

  // === HEADER COM VOLTAR E INDICADOR ===
  header:        { flexDirection: 'column', gap: 16, marginBottom: 24 },

  // === TÍTULO ===
  titleRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
  title:         { fontSize: 26, fontWeight: '800', color: Colors.PRIMARY, lineHeight: 32 },
  subtitle:      { fontSize: 14, color: Colors.NEUTRAL.MUTED, marginBottom: 20 },

  // === CARDS DE FORMULÁRIO ===
  card:          { backgroundColor: Colors.CARD_BG, borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionTitle:  { fontSize: 13, fontWeight: '700', color: Colors.NEUTRAL.MUTED, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 },

  // === LINK DE LOGIN ===
  loginRow:      { alignItems: 'center', marginTop: 16 },
  loginText:     { fontSize: 14, color: Colors.NEUTRAL.MUTED },
  loginLink:     { color: Colors.PRIMARY, fontWeight: '700' },
});
