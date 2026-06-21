// ============================================================
// TELA: Welcome Screen — Escolha de Perfil
// DESCRIÇÃO: Tela inicial pós-splash. Apresenta a proposta de valor
//            do VacinApp e direciona o usuário para o fluxo correto
//            (Paciente ou Profissional) sem realizar autenticação.
// ACESSO: Ambos (ponto de entrada após a splash)
// ROTA: /app/(auth)/login.tsx
// ============================================================

import React from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Reanimated — animações de entrada
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

const { width, height } = Dimensions.get('window');

// Componente de card animado com efeito de press
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// -------------------------------------------------------
// Sub-componente: ProfileCard
// Card de ação principal com ícone, título, descrição e botão
// -------------------------------------------------------
interface ProfileCardProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  accentColor: string;
  borderColor: string;
  shadowColor: string;
  onPress: () => void;
  accessibilityLabel: string;
  isPrimary?: boolean; // Card principal recebe destaque maior
}

function ProfileCard({
  icon, iconBg, iconColor, title, description,
  accentColor, borderColor, shadowColor,
  onPress, accessibilityLabel, isPrimary = false,
}: ProfileCardProps) {
  // Animação de escala ao pressionar
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      style={[animStyle]}
      onPressIn={() => { scale.value = withSpring(0.975, { damping: 15 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 12 }); }}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      <View style={[
        styles.card,
        isPrimary && styles.cardPrimary,
        { borderColor, shadowColor },
      ]}>

        {/* Faixa de destaque superior — somente no card principal */}
        {isPrimary && (
          <View style={[styles.cardAccentStrip, { backgroundColor: accentColor }]}>
            <Ionicons name="star" size={11} color="rgba(255,255,255,0.9)" />
            <Text style={styles.cardAccentText}>Acesso Principal</Text>
          </View>
        )}

        {/* Corpo do card */}
        <View style={styles.cardInner}>

          {/* Ícone grande com fundo colorido */}
          <View style={[styles.cardIconCircle, { backgroundColor: iconBg }]}>
            <Ionicons name={icon} size={isPrimary ? 36 : 30} color={iconColor} />
          </View>

          {/* Texto do card */}
          <View style={styles.cardTextWrap}>
            <Text style={[styles.cardTitle, { color: accentColor }]}>{title}</Text>
            <Text style={styles.cardDesc}>{description}</Text>
          </View>

          {/* Botão "Acessar" */}
          <View style={[styles.cardBtn, { backgroundColor: accentColor }]}>
            <Text style={styles.cardBtnLabel}>Acessar</Text>
            <Ionicons name="arrow-forward" size={14} color={Colors.NEUTRAL.WHITE} />
          </View>

        </View>
      </View>
    </AnimatedPressable>
  );
}

// -------------------------------------------------------
// COMPONENTE PRINCIPAL: Welcome Screen
// -------------------------------------------------------
export default function WelcomeScreen() {
  return (
    // ─── raiz: apenas cor de fundo e ocupação total de tela ───
    <View style={styles.root}>
      <StatusBar style="light" />

      {/*
       * ════════════════════════════════════════════════════════
       * ÚNICO SCROLL DA TELA
       * O cabeçalho roxo é o PRIMEIRO filho do ScrollView,
       * de forma que toda a tela — cabeçalho + conteúdo —
       * role como uma única unidade contínua.
       * ════════════════════════════════════════════════════════
       */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >

        {/* ══════════════════════════════════════════════════ */}
        {/* CABEÇALHO — DENTRO do ScrollView (rola junto)    */}
        {/* ══════════════════════════════════════════════════ */}
        <View style={styles.header}>

          {/* Círculos decorativos de fundo (profundidade visual) */}
          <View style={[styles.deco, styles.deco1]} />
          <View style={[styles.deco, styles.deco2]} />
          <View style={[styles.deco, styles.deco3]} />

          {/* Logo — ícone branco + nome do app */}
          <Animated.View entering={FadeInDown.delay(80).duration(500)} style={styles.logoRow}>
            <View style={styles.logoCircle}>
              <Ionicons name="medical" size={22} color={Colors.PRIMARY} />
            </View>
            <Text style={styles.logoName}>VacinApp</Text>
          </Animated.View>

          {/* Curva inferior que conecta cabeçalho ao conteúdo */}
          <View style={styles.headerCurve} />
        </View>

        {/* ══════════════════════════════════════════════════ */}
        {/* CONTEÚDO PRINCIPAL — com padding horizontal       */}
        {/* ══════════════════════════════════════════════════ */}
        <View style={styles.body}>

          {/* ---- BLOCO DE COPY: título + subtítulo ---- */}
          <Animated.View entering={FadeInDown.delay(180).duration(550)} style={styles.copyBlock}>
            <Text style={styles.headline}>Sua vacinação na{'\n'}palma da mão.</Text>
            <Text style={styles.subline}>
              Acesse sua carteira digital ou gerencie pacientes de forma simples e segura.
            </Text>
          </Animated.View>

          {/* ---- ILUSTRAÇÃO CENTRAL ---- */}
          <Animated.View entering={FadeIn.delay(300).duration(600)} style={styles.illustrationRow}>
            {/* Bolha decorativa principal com ícones compostos */}
            <View style={styles.illustrationBubble}>
              <View style={styles.illustrationInner}>
                <Ionicons name="shield-checkmark" size={44} color={Colors.PRIMARY} />
              </View>
              {/* Chips flutuantes ao redor da bolha central */}
              <View style={[styles.chip, styles.chipTopLeft]}>
                <Ionicons name="document-text-outline" size={14} color={Colors.PRIMARY} />
                <Text style={styles.chipText}>Carteira Digital</Text>
              </View>
              <View style={[styles.chip, styles.chipBottomRight]}>
                <Ionicons name="notifications-outline" size={14} color={Colors.PROFESSIONAL} />
                <Text style={[styles.chipText, { color: Colors.PROFESSIONAL }]}>Lembretes</Text>
              </View>
            </View>
          </Animated.View>

          {/* ══════════════════════════════════════════════ */}
          {/* CARDS DE AÇÃO                                 */}
          {/* ══════════════════════════════════════════════ */}

          {/* Card Paciente — destaque principal */}
          <Animated.View entering={FadeInDown.delay(420).duration(600)}>
            <ProfileCard
              icon="person-circle"
              iconBg={Colors.PRIMARY_LIGHT}
              iconColor={Colors.PRIMARY}
              title="Entrar como Paciente"
              description="Acesse sua carteira digital de vacinação, acompanhe doses e receba lembretes."
              accentColor={Colors.PRIMARY}
              borderColor={Colors.PRIMARY}
              shadowColor={Colors.PRIMARY}
              onPress={() => router.push('/(auth)/login-user')}
              accessibilityLabel="Entrar como Paciente"
              isPrimary
            />
          </Animated.View>

          {/* Espaçamento entre cards */}
          <View style={{ height: 14 }} />

          {/* Card Profissional — destaque secundário */}
          <Animated.View entering={FadeInDown.delay(540).duration(600)}>
            <ProfileCard
              icon="medkit"
              iconBg={Colors.PROFESSIONAL_LIGHT}
              iconColor={Colors.PROFESSIONAL}
              title="Entrar como Profissional de Saúde"
              description="Gerencie registros vacinais e acompanhe pacientes cadastrados."
              accentColor={Colors.PROFESSIONAL}
              borderColor={Colors.BORDER}
              shadowColor={Colors.PROFESSIONAL}
              onPress={() => router.push('/(auth)/login-professional')}
              accessibilityLabel="Entrar como Profissional de Saúde"
            />
          </Animated.View>

          {/* ---- LINK DE CADASTRO ---- */}
          <Animated.View entering={FadeInUp.delay(660).duration(500)} style={styles.registerRow}>
            <Text style={styles.registerText}>Não possui conta?</Text>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/choose-registration')}
              accessibilityLabel="Cadastre-se"
              accessibilityRole="link"
              hitSlop={12}
            >
              <Text style={styles.registerLink}> Cadastre-se</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* ---- RODAPÉ INSTITUCIONAL ---- */}
          <Animated.View entering={FadeIn.delay(750).duration(500)} style={styles.footer}>
            <Ionicons name="lock-closed-outline" size={12} color={Colors.NEUTRAL.MUTED} />
            <Text style={styles.footerText}>Dados protegidos pela LGPD</Text>
          </Animated.View>

        </View>
        {/* fim: body */}

      </ScrollView>
      {/* fim: ScrollView único */}

    </View>
  );
}

// -------------------------------------------------------
// ESTILOS
// -------------------------------------------------------
const styles = StyleSheet.create({

  // ── CONTAINER RAIZ ──────────────────────────────────
  // Apenas define fundo e ocupa toda a tela.
  // NÃO é rolável — a rolagem é responsabilidade do ScrollView.
  root: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },

  // ── SCROLL ÚNICO ────────────────────────────────────
  // Único componente de rolagem da tela.
  // O header roxo vive dentro dele, portanto rola junto.
  scroll: {
    flex: 1,
  },
  // contentContainerStyle: sem paddingHorizontal aqui,
  // pois o header precisa ser full-width.
  // O padding horizontal é aplicado no <View body> abaixo.
  scrollContent: {
    paddingBottom: 40,
  },

  // ── CABEÇALHO ───────────────────────────────────────
  // Primeiro filho do ScrollView: rola junto com o resto.
  header: {
    backgroundColor: Colors.PRIMARY,
    paddingTop: 52,
    paddingHorizontal: 22,
    paddingBottom: 0,
    overflow: 'visible',
  },

  // Curva que faz a transição do roxo para o fundo lilás
  headerCurve: {
    height: 32,
    backgroundColor: Colors.BACKGROUND,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: 18,
  },

  // Círculos decorativos (camadas de profundidade)
  deco: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  deco1: { width: 160, height: 160, top: -50, right: -40 },
  deco2: { width: 90,  height: 90,  top:   8, left: -25 },
  deco3: { width: 60,  height: 60,  bottom: 30, right: 30, backgroundColor: 'rgba(255,255,255,0.05)' },

  // ── LOGO ────────────────────────────────────────────
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.NEUTRAL.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  logoName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.NEUTRAL.WHITE,
    letterSpacing: 0.4,
  },

  // ── ÁREA DE CONTEÚDO (após o header) ────────────────
  // Aplica o paddingHorizontal apenas aqui, mantendo o
  // header com largura total (full-width).
  body: {
    paddingHorizontal: 20,
    paddingTop: 6,
  },

  // ── COPY: TÍTULO E SUBTÍTULO ────────────────────────
  copyBlock: {
    marginBottom: 20,
    marginTop: 4,
  },
  headline: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.NEUTRAL.DARK_TEXT,
    lineHeight: 36,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  subline: {
    fontSize: 14,
    color: Colors.NEUTRAL.MUTED,
    lineHeight: 21,
  },

  // ── ILUSTRAÇÃO CENTRAL ──────────────────────────────
  illustrationRow: {
    alignItems: 'center',
    marginBottom: 24,
  },
  illustrationBubble: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.PRIMARY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.BORDER,
    shadowColor: Colors.PRIMARY,
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 7,
  },
  illustrationInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.NEUTRAL.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.PRIMARY,
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  // Chips flutuantes (info visual extra)
  chip: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.NEUTRAL.WHITE,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  chipTopLeft:     { top: -6, left: -60 },
  chipBottomRight: { bottom: -6, right: -56 },
  chipText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.PRIMARY,
  },

  // ── CARD DE PERFIL ──────────────────────────────────
  card: {
    backgroundColor: Colors.NEUTRAL.WHITE,
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardPrimary: {
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 9,
  },

  // Faixa de topo (somente no card principal)
  cardAccentStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  cardAccentText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.NEUTRAL.WHITE,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  // Área interna do card (ícone + texto + botão)
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
  },

  // Círculo do ícone
  cardIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  // Bloco de texto
  cardTextWrap: {
    flex: 1,
    gap: 5,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  cardDesc: {
    fontSize: 12,
    color: Colors.NEUTRAL.MUTED,
    lineHeight: 17,
  },

  // Botão "Acessar"
  cardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    flexShrink: 0,
  },
  cardBtnLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.NEUTRAL.WHITE,
  },

  // ── CADASTRO ────────────────────────────────────────
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  registerText: {
    fontSize: 14,
    color: Colors.NEUTRAL.MUTED,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.PRIMARY,
  },

  // ── RODAPÉ ──────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  footerText: {
    fontSize: 11,
    color: Colors.NEUTRAL.MUTED,
  },
});
