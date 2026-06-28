// ============================================================
// TELA: Login do Profissional de Saúde
// DESCRIÇÃO: Tela exclusiva de autenticação para profissionais
//            de saúde. O profissional seleciona a rede em que
//            está atuando (Pública ou Privada) e insere suas
//            credenciais institucionais.
//
//            Rede Pública:
//              - Email institucional
//              - Registro Profissional (CRM ou COREN)
//              - Senha
//
//            Rede Privada:
//              - Instituição (hospital/clínica)
//              - Email profissional
//              - Registro Profissional (CRM ou COREN)
//              - Senha
//
// PREPARADO PARA BACKEND:
//   O papel do profissional (médico/enfermeiro) NÃO é solicitado
//   manualmente. Será retornado automaticamente pelo backend
//   com base no Registro Profissional (CRM ou COREN).
//
//   Payload enviado à API:
//   {
//     email: string,
//     password: string,
//     professionalRegistry: string,  // CRM ou COREN
//     networkType: 'public' | 'private',
//     institution?: string,          // Apenas se networkType === 'private'
//   }
//
//   Resposta esperada do backend:
//   {
//     id, nome, role, networkType, institution, permissions
//   }
//
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
import Animated, { FadeIn, FadeInDown, FadeOutDown, Layout } from 'react-native-reanimated';

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

// --- Componentes reutilizáveis de autenticação ---
import { AuthSegmentSelector, AuthContextMessage } from '../../components/auth';
import type { SegmentOption } from '../../components/auth';

// -------------------------------------------------------
// Tipos — alinhados ao payload da API futura
// -------------------------------------------------------

/** Tipo da rede de atuação do profissional */
type NetworkType = 'public' | 'private';

/** Payload que será enviado ao endpoint de autenticação do profissional */
interface ProfessionalLoginPayload {
  email: string;
  password: string;
  professionalRegistry: string;  // CRM ou COREN — o backend determina o papel
  networkType: NetworkType;
  institution?: string;          // Obrigatório apenas na Rede Privada
}

// -------------------------------------------------------
// Opções do seletor de rede — configuráveis para fácil manutenção
// -------------------------------------------------------
const NETWORK_OPTIONS: SegmentOption[] = [
  { value: 'public',  label: 'Rede Pública', icon: 'medkit'          },
  { value: 'private', label: 'Rede Privada',  icon: 'shield-checkmark' },
];

// -------------------------------------------------------
// Mensagens contextuais por rede
// -------------------------------------------------------
const NETWORK_MESSAGES: Record<NetworkType, string> = {
  public:  'Você está acessando sua conta da Rede Pública de Saúde.',
  private: 'Você está acessando sua conta da Rede Privada.',
};

// -------------------------------------------------------
// Ícones contextuais por rede
// -------------------------------------------------------
const NETWORK_ICONS: Record<NetworkType, React.ComponentProps<typeof Ionicons>['name']> = {
  public:  'medkit-outline',
  private: 'shield-checkmark-outline',
};

// -------------------------------------------------------
// COMPONENTE PRINCIPAL: Login do Profissional de Saúde
// -------------------------------------------------------
export default function LoginProfessionalScreen() {

  // ── Estados do formulário ──────────────────────────────────
  // Nomes alinhados ao payload da API para facilitar integração futura.

  /** Rede de atuação do profissional — enviado como `networkType` */
  const [networkType, setNetworkType] = useState<NetworkType>('public');

  /** E-mail institucional do profissional — enviado como `email` */
  const [email, setEmail] = useState('');

  /** Senha de acesso — enviada como `password` */
  const [password, setPassword] = useState('');

  /**
   * Registro profissional — enviado como `professionalRegistry`.
   * Pode ser CRM (médicos) ou COREN (enfermeiros).
   * O backend determina o papel com base neste registro.
   */
  const [professionalRegistry, setProfessionalRegistry] = useState('');

  /**
   * Instituição de atuação — enviada como `institution`.
   * Visível e obrigatória somente na Rede Privada.
   *
   * TODO: No futuro, substituir este TextInput por um componente
   *       de busca de hospitais/clínicas (ex: SearchInput com
   *       autocomplete via API de estabelecimentos de saúde).
   */
  const [institution, setInstitution] = useState('');

  // ── Flags derivadas do estado ──────────────────────────────
  const isPublic  = networkType === 'public';
  const isPrivate = networkType === 'private';

  // ── Handler: troca de rede ─────────────────────────────────
  const handleNetworkChange = (value: string) => {
    setNetworkType(value as NetworkType);
    // Limpa o campo de instituição ao trocar de rede
    setInstitution('');
  };

  // ── Handler: login ─────────────────────────────────────────
  const handleLogin = () => {
    // Monta o payload exatamente como será enviado à API
    const payload: ProfessionalLoginPayload = {
      email,
      password,
      professionalRegistry,
      networkType,
      ...(isPrivate && institution ? { institution } : {}),
    };

    // TODO: Integrar com endpoint de autenticação do profissional
    // Exemplo: await api.post('/auth/professional/login', payload);
    console.log('Login Profissional (payload pronto para API):', payload);

    router.replace({
      pathname: '/(professional)/home',
      params: { network: networkType },
    });
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

        {/* ---- BADGE DE PERFIL ---- */}
        <Animated.View entering={FadeInDown.delay(250).duration(600)}>
          <View style={styles.profileBadge}>
            <Ionicons name="briefcase-outline" size={16} color={Colors.PROFESSIONAL} />
            <Text style={styles.profileBadgeText}>Profissional de Saúde</Text>
          </View>
        </Animated.View>

        {/* ════════════════════════════════════════════════════ */}
        {/* ---- SELETOR DE REDE (Pública / Privada) ----       */}
        {/* ════════════════════════════════════════════════════ */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)}>

          <Text style={styles.segmentLabel}>Em qual rede está atuando?</Text>

          {/* Seletor reutilizável — variante verde do profissional */}
          <AuthSegmentSelector
            options={NETWORK_OPTIONS}
            selected={networkType}
            onChange={handleNetworkChange}
            variant="professional"
          />

          {/* Mensagem contextual — re-anima ao trocar de rede */}
          <Animated.View
            key={networkType}
            entering={FadeIn.duration(350)}
          >
            <AuthContextMessage
              message={NETWORK_MESSAGES[networkType]}
              icon={NETWORK_ICONS[networkType]}
              variant="professional"
            />
          </Animated.View>

        </Animated.View>

        {/* ════════════════════════════════════════════════════ */}
        {/* ---- FORMULÁRIO DE LOGIN ----                       */}
        {/* ════════════════════════════════════════════════════ */}
        <Animated.View
          entering={FadeInDown.delay(380).duration(600)}
          layout={Layout.springify()}
          style={styles.form}
        >

          {/*
           * Campo Instituição — exibido SOMENTE na Rede Privada.
           *
           * TODO: No futuro, substituir por um componente de busca
           *       de estabelecimentos de saúde (SearchInput com
           *       autocomplete via API de hospitais/clínicas privadas).
           *       O estado `institution` (string) permanece o mesmo.
           */}
          {isPrivate && (
            <Animated.View
              entering={FadeInDown.duration(350)}
              exiting={FadeOutDown.duration(250)}
            >
              <InputField
                label="Instituição"
                value={institution}
                onChangeText={setInstitution}
                icon="business-outline"
                placeholder="Hospital ou clínica"
                autoCapitalize="words"
              />
            </Animated.View>
          )}

          {/* E-mail institucional */}
          <InputField
            label="E-mail Profissional"
            value={email}
            onChangeText={setEmail}
            icon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder={isPublic ? 'nome@hospital.gov.br' : 'nome@clinica.com.br'}
          />

          {/*
           * Registro Profissional (CRM ou COREN).
           * Não distingue médico de enfermeiro na tela — o backend
           * identifica o papel com base no número informado.
           */}
          <InputField
            label="Registro Profissional"
            value={professionalRegistry}
            onChangeText={setProfessionalRegistry}
            icon="card-outline"
            placeholder="Digite seu CRM ou COREN"
            autoCapitalize="none"
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

        {/* ---- AVISO INSTITUCIONAL ---- */}
        <Animated.View entering={FadeInDown.delay(540).duration(600)} style={styles.infoRow}>
          <Ionicons name="information-circle-outline" size={15} color={Colors.NEUTRAL.MUTED} />
          <Text style={styles.infoText}>
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
  logoRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.PROFESSIONAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText:   { fontSize: 22, fontWeight: '800', color: Colors.PROFESSIONAL },

  // === TÍTULO E SUBTÍTULO ===
  title:    { fontSize: 28, fontWeight: '800', color: Colors.PROFESSIONAL, marginBottom: 6 },
  subtitle: { fontSize: 15, color: Colors.NEUTRAL.MUTED, marginBottom: 16 },

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
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GREEN,
  },
  profileBadgeText: { fontSize: 13, fontWeight: '600', color: Colors.PROFESSIONAL },

  // === LABEL DO SELETOR ===
  segmentLabel: { fontSize: 13, fontWeight: '700', color: Colors.NEUTRAL.DARK_TEXT, marginBottom: 10 },

  // === FORMULÁRIO ===
  form:       { marginBottom: 18 },
  forgot:     { alignSelf: 'flex-end', marginTop: -6 },
  forgotText: { fontSize: 13, color: Colors.PROFESSIONAL, fontWeight: '600' },

  // === AVISO INSTITUCIONAL ===
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 20,
    paddingHorizontal: 4,
  },
  infoText: {
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
