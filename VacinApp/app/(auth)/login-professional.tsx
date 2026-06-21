// ============================================================
// TELA: Login do Profissional de Saúde
// DESCRIÇÃO: Tela exclusiva de autenticação para profissionais
//            de saúde cadastrados no sistema. Suporta Médico
//            (CRM) e Enfermeiro (COREN). Profissionais não podem
//            criar conta — o acesso é pré-cadastrado pelo sistema.
// ACESSO: Profissional
// ROTA: /app/(auth)/login-professional.tsx
// ============================================================

// --- Bibliotecas principais do React ---
import React, { useState } from 'react';

// --- Componentes de layout e interação do React Native ---
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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
// COMPONENTE PRINCIPAL: Login do Profissional de Saúde
// -------------------------------------------------------
export default function LoginProfessionalScreen() {
  // Estado: tipo de profissional selecionado ('doctor' | 'nurse')
  const [selectedRole, setSelectedRole] = useState<'doctor' | 'nurse'>('doctor');
  // Estado: e-mail institucional do profissional
  const [email, setEmail] = useState('');
  // Estado: identificador profissional (CRM para médico, COREN para enfermeiro)
  const [professionalId, setProfessionalId] = useState('');
  // Estado: senha de acesso
  const [password, setPassword] = useState('');

  // -------------------------------------------------------
  // Labels dinâmicos com base no papel selecionado
  // -------------------------------------------------------
  const roleConfig = {
    doctor: {
      badgeIcon: 'medkit'  as const,
      badgeText: 'Médico',
      idLabel: 'CRM',
      idPlaceholder: 'Digite seu CRM',
    },
    nurse: {
      badgeIcon: 'medical' as const,
      badgeText: 'Enfermeiro',
      idLabel: 'COREN',
      idPlaceholder: 'Digite seu COREN',
    },
  };

  const config = roleConfig[selectedRole];

  // Mock de login — em produção chamar API com as credenciais
  const handleLogin = () => {
    // TODO: enviar credenciais para a API de autenticação do profissional
    console.log('Login Profissional', {
      role: selectedRole,
      email,
      professionalId,
      password,
    });
    router.replace('/(professional)/home');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Barra de status com ícones escuros (fundo claro) */}
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ---- ARCO DECORATIVO NO TOPO (cor verde do profissional) ---- */}
        <View style={styles.arc}>
          <View style={styles.arcInner} />
        </View>

        {/* ---- LOGO: ícone + nome do app ---- */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.logoRow}>
          <View style={styles.logoCircle}>
            <Ionicons name="medical" size={28} color={Colors.NEUTRAL.WHITE} />
          </View>
          <Text style={styles.logoText}>VacinApp</Text>
        </Animated.View>

        {/* ---- TÍTULO E SUBTÍTULO ---- */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <Text style={styles.title}>Área do Profissional</Text>
          <Text style={styles.subtitle}>Gerencie registros e acompanhe seus pacientes</Text>
        </Animated.View>

        {/* ════════════════════════════════════════════════ */}
        {/* ---- SELETOR DE PAPEL (Médico / Enfermeiro) ---- */}
        {/* ════════════════════════════════════════════════ */}
        <Animated.View entering={FadeInDown.delay(240).duration(600)} style={styles.roleSelector}>
          <TouchableOpacity
            style={[
              styles.roleBtn,
              selectedRole === 'doctor' && styles.roleBtnActive,
            ]}
            onPress={() => {
              setSelectedRole('doctor');
              setProfessionalId('');
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name="medkit"
              size={16}
              color={selectedRole === 'doctor' ? Colors.NEUTRAL.WHITE : Colors.PROFESSIONAL}
            />
            <Text
              style={[
                styles.roleBtnText,
                selectedRole === 'doctor' && styles.roleBtnTextActive,
              ]}
            >
              Médico
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleBtn,
              selectedRole === 'nurse' && styles.roleBtnActive,
            ]}
            onPress={() => {
              setSelectedRole('nurse');
              setProfessionalId('');
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name="medical"
              size={16}
              color={selectedRole === 'nurse' ? Colors.NEUTRAL.WHITE : Colors.PROFESSIONAL}
            />
            <Text
              style={[
                styles.roleBtnText,
                selectedRole === 'nurse' && styles.roleBtnTextActive,
              ]}
            >
              Enfermeiro
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ---- BADGE DE PERFIL DINÂMICO ---- */}
        <Animated.View entering={FadeInDown.delay(250).duration(600)}>
          <View style={styles.profileBadge}>
            <Ionicons name={config.badgeIcon} size={16} color={Colors.PROFESSIONAL} />
            <Text style={styles.profileBadgeText}>{config.badgeText}</Text>
          </View>
        </Animated.View>

        {/* ---- AVISO INSTITUCIONAL ---- */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)}>
          <View style={styles.infoBox}>
            <Ionicons name="shield-checkmark-outline" size={18} color={Colors.PROFESSIONAL} />
            <Text style={styles.infoText}>
              O acesso profissional é restrito a contas previamente cadastradas pelo sistema.
            </Text>
          </View>
        </Animated.View>

        {/* ════════════════════════════════════════════════ */}
        {/* ---- FORMULÁRIO DE LOGIN ----                   */}
        {/* ════════════════════════════════════════════════ */}
        <Animated.View entering={FadeInDown.delay(380).duration(600)} style={styles.form}>

          {/* E-mail institucional */}
          <InputField
            label="E-mail Institucional"
            value={email}
            onChangeText={setEmail}
            icon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="nome@hospital.com.br"
          />

          {/* CRM ou COREN — dinâmico conforme papel selecionado */}
          <InputField
            label={config.idLabel}
            value={professionalId}
            onChangeText={setProfessionalId}
            icon="card-outline"
            placeholder={config.idPlaceholder}
            autoCapitalize="characters"
          />

          {/* Senha */}
          <InputField
            label="Senha"
            value={password}
            onChangeText={setPassword}
            icon="lock-closed-outline"
            secureTextEntry
          />

          {/* Link de recuperação de senha */}
          <TouchableOpacity style={styles.forgot}>
            <Text style={styles.forgotText}>Esqueceu a senha?</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ---- BOTÃO ENTRAR ---- */}
        <Animated.View entering={FadeInDown.delay(460).duration(600)}>
          <PrimaryButton
            label="Entrar como Profissional"
            onPress={handleLogin}
            variant="professional"
          />
        </Animated.View>

        {/* ---- AVISO: SEM CADASTRO DISPONÍVEL ---- */}
        <Animated.View entering={FadeInDown.delay(540).duration(600)} style={styles.noRegisterRow}>
          <Ionicons name="information-circle-outline" size={15} color={Colors.NEUTRAL.MUTED} />
          <Text style={styles.noRegisterText}>
            O cadastro de profissionais é realizado exclusivamente pelo administrador do sistema.
          </Text>
        </Animated.View>

        {/* ---- VOLTAR PARA ESCOLHA DE PERFIL ---- */}
        <Animated.View entering={FadeInDown.delay(600).duration(600)} style={styles.backRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.replace('/(auth)/login')}
          >
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
  // === SCROLL E CONTEÚDO ===
  scroll:   { flex: 1, backgroundColor: Colors.NEUTRAL.WHITE },
  content:  { paddingHorizontal: 24, paddingBottom: 40 },

  // === ARCO DECORATIVO (verde do profissional) ===
  arc:      { height: 120, marginHorizontal: -24, overflow: 'hidden', marginBottom: 24 },
  arcInner: {
    height: 200,
    marginTop: -80,
    backgroundColor: Colors.PROFESSIONAL_LIGHT,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: Colors.LIGHT_GREEN,
  },

  // === LOGO ===
  logoRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.PROFESSIONAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText:  { fontSize: 22, fontWeight: '800', color: Colors.PROFESSIONAL },

  // === TÍTULO E SUBTÍTULO ===
  title:    { fontSize: 28, fontWeight: '800', color: Colors.PROFESSIONAL, marginBottom: 6 },
  subtitle: { fontSize: 15, color: Colors.NEUTRAL.MUTED, marginBottom: 16 },

  // === SELETOR DE PAPEL (Médico / Enfermeiro) ===
  roleSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.PROFESSIONAL,
    backgroundColor: Colors.PROFESSIONAL_LIGHT,
  },
  roleBtnActive: {
    backgroundColor: Colors.PROFESSIONAL,
    borderColor: Colors.PROFESSIONAL,
  },
  roleBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.PROFESSIONAL,
  },
  roleBtnTextActive: {
    color: Colors.NEUTRAL.WHITE,
  },

  // === BADGE DE PERFIL ===
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.PROFESSIONAL_LIGHT,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GREEN,
  },
  profileBadgeText: { fontSize: 13, fontWeight: '600', color: Colors.PROFESSIONAL },

  // === AVISO INSTITUCIONAL ===
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.PROFESSIONAL_LIGHT,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GREEN,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.PROFESSIONAL,
    lineHeight: 18,
    fontWeight: '500',
  },

  // === FORMULÁRIO ===
  form:       { marginBottom: 18 },
  forgot:     { alignSelf: 'flex-end', marginTop: -6 },
  forgotText: { fontSize: 13, color: Colors.PROFESSIONAL, fontWeight: '600' },

  // === AVISO: SEM CADASTRO ===
  noRegisterRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 20,
    paddingHorizontal: 4,
  },
  noRegisterText: {
    flex: 1,
    fontSize: 12,
    color: Colors.NEUTRAL.MUTED,
    lineHeight: 17,
    fontStyle: 'italic',
  },

  // === VOLTAR ===
  backRow: { alignItems: 'center', marginTop: 20 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { fontSize: 13, color: Colors.NEUTRAL.MUTED },
});
