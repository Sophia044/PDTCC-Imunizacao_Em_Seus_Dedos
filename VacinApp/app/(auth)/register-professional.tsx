// ============================================================
// TELA: Cadastro de Profissional de Saúde
// DESCRIÇÃO: Formulário de criação de conta para profissionais
//            de saúde. Coleta dados profissionais (nome, CRM/COREN,
//            especialidade, unidade, rede de atuação) e
//            credenciais de acesso. O cadastro requer verificação
//            pela equipe VacinApp (verification_status = pending).
//
// CORREÇÃO: o botão "Criar conta Profissional" navegava direto
// para a home sem chamar a API — nenhuma conta era criada de
// fato. Agora chama registerProfessional() (AuthContext), que já
// existia e funcionava, só nunca tinha sido conectado aqui.
// Também foi adicionado o seletor de rede (public/private),
// exigido pelo endpoint POST /auth/professional/register.
// ACESSO: Profissional (novo usuário)
// ROTA: /app/(auth)/register-professional.tsx
// ============================================================

// --- Bibliotecas principais do React ---
import React, { useState } from 'react';

// --- Componentes de layout e interação do React Native ---
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';

// --- Animações com Reanimated ---
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

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

// --- Componentes reutilizáveis de autenticação (seletor de rede) ---
import { AuthSegmentSelector, AuthContextMessage } from '../../components/auth';
import type { SegmentOption } from '../../components/auth';

// --- Sessão de autenticação e tratamento de erros da API ---
import { useAuth } from '../../contexts/AuthContext';
import { ApiError } from '../../services/api/client';

// -------------------------------------------------------
// Tipos
// -------------------------------------------------------
type NetworkType = 'public' | 'private';

// -------------------------------------------------------
// DADOS: Lista de especialidades médicas disponíveis para seleção
// -------------------------------------------------------
const ESPECIALIDADES = [
  'Médico/a Clínico Geral', 'Enfermeiro/a', 'Pediatra',
  'Ginecologista/Obstetra', 'Geriatra', 'Médico/a de Família',
];

const NETWORK_OPTIONS: SegmentOption[] = [
  { value: 'public',  label: 'Rede Pública', icon: 'medkit' },
  { value: 'private', label: 'Rede Privada', icon: 'shield-checkmark' },
];

const NETWORK_MESSAGES: Record<NetworkType, string> = {
  public:  'Seu cadastro será vinculado a uma unidade da Rede Pública de Saúde.',
  private: 'Seu cadastro será vinculado a uma instituição da Rede Privada.',
};

// -------------------------------------------------------
// COMPONENTE PRINCIPAL: Tela de Cadastro do Profissional
// -------------------------------------------------------
export default function RegisterProfessionalScreen() {
  const [name, setName]                 = useState(''); // Nome completo do profissional
  const [crm, setCrm]                   = useState(''); // Número do registro (CRM/COREN)
  const [spec, setSpec]                 = useState(''); // Especialidade selecionada
  const [unit, setUnit]                 = useState(''); // Unidade de saúde vinculada
  const [networkType, setNetworkType]   = useState<NetworkType>('public'); // Rede de atuação
  const [email, setEmail]               = useState(''); // E-mail institucional para login
  const [password, setPassword]         = useState(''); // Senha de acesso
  const [showSpecs, setShowSpecs]       = useState(false); // Controla visibilidade do dropdown
  const [loading, setLoading]           = useState(false); // Estado de carregamento da API

  const { registerProfessional } = useAuth();

  // -------------------------------------------------------
  // Validação e envio do cadastro à API
  // -------------------------------------------------------
  const handleSubmit = async () => {
    if (!name.trim() || !crm.trim() || !unit.trim()) {
      Alert.alert('Preencha os campos', 'Informe nome, registro profissional (CRM/COREN) e unidade de saúde.');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('E-mail inválido', 'Informe um e-mail válido.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Senha fraca', 'A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await registerProfessional({
        name,
        professionalRegistry: crm,
        specialty: spec || undefined,
        unitName: unit,
        networkType,
        email,
        password,
      });
      router.replace('/(professional)/home');
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Não foi possível criar sua conta. Tente novamente.';
      Alert.alert('Erro ao cadastrar', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // KeyboardAvoidingView empurra o conteúdo para cima quando o teclado abre
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ---- BOTÃO VOLTAR ---- */}
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.PROFESSIONAL} />
        </TouchableOpacity>

        {/* ---- BADGE: Identifica que é uma conta profissional ---- */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.badge}>
          <Ionicons name="shield-checkmark" size={20} color={Colors.NEUTRAL.WHITE} />
          <Text style={styles.badgeText}>Conta Profissional</Text>
        </Animated.View>

        {/* ---- TÍTULO DA TELA ---- */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <Text style={styles.title}>Criar conta{'\n'}Profissional</Text>
          <Text style={styles.subtitle}>Para profissionais de saúde habilitados</Text>
        </Animated.View>

        {/* ---- SELETOR DE REDE (Pública / Privada) ---- */}
        <Animated.View entering={FadeInDown.delay(260).duration(600)}>
          <Text style={styles.segmentLabel}>Em qual rede você atua?</Text>
          <AuthSegmentSelector
            options={NETWORK_OPTIONS}
            selected={networkType}
            onChange={(value) => setNetworkType(value as NetworkType)}
            variant="professional"
          />
          <Animated.View key={networkType} entering={FadeIn.duration(300)}>
            <AuthContextMessage
              message={NETWORK_MESSAGES[networkType]}
              icon="business-outline"
              variant="professional"
            />
          </Animated.View>
        </Animated.View>

        {/* ---- FORMULÁRIO: Dados Profissionais ---- */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.card}>
          <Text style={styles.sectionTitle}>Dados Profissionais</Text>
          <InputField label="Nome completo" value={name} onChangeText={setName} icon="person-outline" />
          <InputField label="CRM / COREN / Nº de Registro" value={crm} onChangeText={setCrm} icon="id-card-outline" keyboardType="numeric" />

          {/* ---- DROPDOWN: Seleção de Especialidade ---- */}
          <Text style={styles.dropLabel}>Especialidade</Text>
          {/* Botão que abre/fecha a lista de especialidades */}
          <TouchableOpacity style={styles.dropBtn} onPress={() => setShowSpecs(s => !s)}>
            <Ionicons name="medkit-outline" size={20} color={Colors.NEUTRAL.MUTED} />
            <Text style={[styles.dropText, !spec && { color: Colors.NEUTRAL.MUTED }]}>
              {spec || 'Selecione a especialidade'}
            </Text>
            {/* Ícone de seta que indica se o dropdown está aberto ou fechado */}
            <Ionicons name={showSpecs ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.NEUTRAL.MUTED} />
          </TouchableOpacity>
          {/* Lista de opções do dropdown — aparece apenas quando showSpecs é true */}
          {showSpecs && (
            <View style={styles.dropList}>
              {ESPECIALIDADES.map(e => (
                // Ao selecionar, fecha o dropdown e armazena a especialidade
                <TouchableOpacity key={e} style={styles.dropItem} onPress={() => { setSpec(e); setShowSpecs(false); }}>
                  <Text style={[styles.dropItemText, spec === e && { color: Colors.PROFESSIONAL, fontWeight: '700' }]}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <InputField label="Unidade de saúde vinculada" value={unit} onChangeText={setUnit} icon="business-outline" />
        </Animated.View>

        {/* ---- FORMULÁRIO: Dados de Acesso ---- */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.card}>
          <Text style={styles.sectionTitle}>Acesso</Text>
          <InputField label="E-mail institucional" value={email} onChangeText={setEmail} icon="mail-outline" keyboardType="email-address" autoCapitalize="none" />
          <InputField label="Senha" value={password} onChangeText={setPassword} icon="lock-closed-outline" secureTextEntry />
        </Animated.View>

        {/* ---- AVISO: O cadastro requer verificação ---- */}
        <Animated.View entering={FadeInDown.delay(500).duration(600)} style={styles.notice}>
          <Ionicons name="information-circle" size={18} color={Colors.PROFESSIONAL} />
          <Text style={styles.noticeText}>O cadastro profissional será verificado pela equipe VacinApp antes da liberação do acesso.</Text>
        </Animated.View>

        {/* ---- BOTÃO: Criar conta Profissional ---- */}
        <Animated.View entering={FadeInDown.delay(600).duration(600)}>
          <PrimaryButton
            label={loading ? 'Criando conta...' : 'Criar conta Profissional'}
            onPress={handleSubmit}
            variant="professional"
            disabled={loading}
          />
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
// Identidade visual VERDE — área do profissional de saúde
// -------------------------------------------------------
const styles = StyleSheet.create({
  // === SCROLL VIEW PRINCIPAL ===
  scroll:        { flex: 1, backgroundColor: Colors.NEUTRAL.WHITE },
  content:       { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 40 },

  // === BOTÃO VOLTAR ===
  back:          { marginBottom: 20 },

  // === BADGE DE CONTA PROFISSIONAL ===
  badge:         { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', backgroundColor: Colors.PROFESSIONAL, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginBottom: 16 },
  badgeText:     { color: Colors.NEUTRAL.WHITE, fontWeight: '700', fontSize: 13 },

  // === TÍTULO E SUBTÍTULO ===
  title:         { fontSize: 28, fontWeight: '800', color: Colors.PROFESSIONAL, lineHeight: 34, marginBottom: 6 },
  subtitle:      { fontSize: 14, color: Colors.NEUTRAL.MUTED, marginBottom: 20 },

  // === SELETOR DE REDE ===
  segmentLabel:  { fontSize: 13, fontWeight: '700', color: Colors.NEUTRAL.DARK_TEXT, marginBottom: 10 },

  // === CARDS DE FORMULÁRIO ===
  card:          { backgroundColor: Colors.PROFESSIONAL_LIGHT, borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionTitle:  { fontSize: 13, fontWeight: '700', color: Colors.NEUTRAL.MUTED, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 },

  // === DROPDOWN DE ESPECIALIDADE ===
  dropLabel:     { fontSize: 13, fontWeight: '600', color: Colors.NEUTRAL.DARK_TEXT, marginBottom: 6 },
  dropBtn:       { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.NEUTRAL.WHITE, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.BORDER, paddingHorizontal: 14, height: 52, marginBottom: 14 },
  dropText:      { flex: 1, fontSize: 15, color: Colors.NEUTRAL.DARK_TEXT },
  dropList:      { backgroundColor: Colors.NEUTRAL.WHITE, borderRadius: 12, borderWidth: 1, borderColor: Colors.BORDER, marginBottom: 14, overflow: 'hidden' },
  dropItem:      { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.BORDER },
  dropItemText:  { fontSize: 14, color: Colors.NEUTRAL.DARK_TEXT },

  // === AVISO DE VERIFICAÇÃO ===
  notice:        { flexDirection: 'row', gap: 8, alignItems: 'flex-start', backgroundColor: Colors.PROFESSIONAL_LIGHT, borderRadius: 12, padding: 12, marginBottom: 16 },
  noticeText:    { flex: 1, fontSize: 12, color: Colors.PROFESSIONAL, lineHeight: 18 },

  // === LINK DE LOGIN ===
  loginRow:      { alignItems: 'center', marginTop: 16 },
  loginText:     { fontSize: 14, color: Colors.NEUTRAL.MUTED },
  loginLink:     { color: Colors.PROFESSIONAL, fontWeight: '700' },
});
