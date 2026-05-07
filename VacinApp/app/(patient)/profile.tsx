// ============================================================
// TELA: Perfil do Paciente
// DESCRIÇÃO: Exibe as informações pessoais do paciente, estatísticas
//            do histórico vacinal, dados cadastrais, configurações
//            de conta e botão de logout.
// ACESSO: Paciente
// ROTA: /app/(patient)/profile.tsx
// ============================================================

// --- Bibliotecas principais do React ---
import React from 'react';

// --- Componentes de layout e interação do React Native ---
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// --- Animações com Reanimated ---
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

// --- Área segura (evita sobreposição com status bar e notch) ---
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Navegação com Expo Router ---
import { router } from 'expo-router';

// --- Controle da barra de status do sistema operacional ---
import { StatusBar } from 'expo-status-bar';

// --- Ícones vetoriais da biblioteca Ionicons ---
import { Ionicons } from '@expo/vector-icons';

// --- Paleta de cores oficial do VacinApp ---
import { Colors } from '../../constants/Colors';

// --- Dados mockados (simulam retorno de API) ---
import { mockVaccines } from '../../constants/MockData';

// -------------------------------------------------------
// DADOS CALCULADOS: Estatísticas do histórico vacinal
// Em produção, virão do back-end Python
// -------------------------------------------------------
const complete = mockVaccines.filter(v => v.status === 'complete').length; // Total tomadas
const pending  = mockVaccines.filter(v => v.status === 'pending').length;  // Total pendentes
const overdue  = mockVaccines.filter(v => v.status === 'overdue').length;  // Total atrasadas

// -------------------------------------------------------
// DADOS DE INFORMAÇÕES PESSOAIS DO USUÁRIO
// Em produção, virão do perfil autenticado
// -------------------------------------------------------
const INFO_ITEMS = [
  { icon: 'person-outline',   label: 'Nome',       value: 'Ana Clara Souza' },
  { icon: 'calendar-outline', label: 'Nascimento',  value: '12/03/1996' },
  { icon: 'card-outline',     label: 'CPF',         value: '123.456.789-00' },
  { icon: 'mail-outline',     label: 'E-mail',      value: 'ana.clara@email.com' },
];

// -------------------------------------------------------
// COMPONENTE PRINCIPAL: Perfil do Paciente
// -------------------------------------------------------
export default function ProfileScreen() {
  // Exibe confirmação antes de deslogar e redireciona para o login
  const handleLogout = () => {
    if (Platform.OS === 'web') {
      // Alert.alert não funciona corretamente na web — usa confirm nativo do browser
      if (window.confirm('Tem certeza que deseja sair da conta?')) {
        router.replace('/(auth)/login');
      }
    } else {
      Alert.alert(
        'Sair da Conta',
        'Tem certeza que deseja sair?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sair',
            style: 'destructive',
            onPress: () => router.replace('/(auth)/login'),
          },
        ]
      );
    }
  };

  return (
    // Container principal com área segura
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Barra de status com ícones claros (fundo roxo) */}
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ---- HEADER ROXO: Avatar + Nome + Badge de verificação ---- */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          {/* Círculo com ícone de pessoa (futuramente será foto de perfil) */}
          <View style={styles.avatar}>
            <Ionicons name="person" size={44} color={Colors.PRIMARY} />
          </View>
          <Text style={styles.name}>Ana Clara Souza</Text>
          <Text style={styles.email}>ana.clara@email.com</Text>
          {/* Badge de conta verificada */}
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.NEUTRAL.WHITE} />
            <Text style={styles.verifiedText}>Conta Verificada</Text>
          </View>
        </Animated.View>

        {/* ---- CARD DE ESTATÍSTICAS VACINAIS ---- */}
        {/* Card flutua sobre o header com margem negativa */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.statsRow}>
          {[
            { num: complete, label: 'Tomadas',   color: Colors.STATUS.COMPLETE },
            { num: pending,  label: 'Pendentes', color: Colors.STATUS.PENDING },
            { num: overdue,  label: 'Atrasadas', color: Colors.STATUS.OVERDUE },
          ].map(s => (
            <View key={s.label} style={styles.statItem}>
              <Text style={[styles.statNum, { color: s.color }]}>{s.num}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* ---- SEÇÃO: Dados Pessoais ---- */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Dados Pessoais</Text>
          <View style={styles.card}>
            {INFO_ITEMS.map((item, i) => (
              <View key={item.label} style={[styles.infoRow, i < INFO_ITEMS.length - 1 && styles.infoRowBorder]}>
                <Ionicons name={item.icon as any} size={18} color={Colors.SECONDARY} />
                <View style={styles.infoTexts}>
                  <Text style={styles.infoLabel}>{item.label}</Text>
                  <Text style={styles.infoValue}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ---- SEÇÃO: Configurações de Conta ---- */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Configurações</Text>
          <View style={styles.card}>
            {[
              { icon: 'notifications-outline', label: 'Notificações' },
              { icon: 'shield-outline',         label: 'Privacidade' },
              { icon: 'help-circle-outline',    label: 'Ajuda e Suporte' },
            ].map((item, i) => (
              <TouchableOpacity key={item.label} style={[styles.actionRow, i < 2 && styles.actionBorder]}>
                <Ionicons name={item.icon as any} size={20} color={Colors.NEUTRAL.MUTED} />
                <Text style={styles.actionText}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.NEUTRAL.MUTED} />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* ---- BOTÃO DE LOGOUT ---- */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.section}>
          {/* Redireciona para a tela de login ao sair */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={Colors.STATUS.OVERDUE} />
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Espaço extra no final */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// -------------------------------------------------------
// ESTILOS DA TELA
// -------------------------------------------------------
const styles = StyleSheet.create({
  // === CONTAINER PRINCIPAL ===
  safe:           { flex: 1, backgroundColor: Colors.BACKGROUND },

  // === CABEÇALHO ROXO COM AVATAR ===
  header:         { backgroundColor: Colors.PRIMARY, alignItems: 'center', paddingVertical: 32, paddingHorizontal: 20 },
  avatar:         { width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.NEUTRAL.WHITE, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  name:           { fontSize: 22, fontWeight: '800', color: Colors.NEUTRAL.WHITE },
  email:          { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  verifiedBadge:  { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 10 },
  verifiedText:   { fontSize: 12, color: Colors.NEUTRAL.WHITE, fontWeight: '600' },

  // === CARD DE ESTATÍSTICAS (flutua sobre o header) ===
  statsRow:       { flexDirection: 'row', backgroundColor: Colors.NEUTRAL.WHITE, marginHorizontal: 16, marginTop: -20, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  statItem:       { flex: 1, alignItems: 'center' },
  statNum:        { fontSize: 26, fontWeight: '800' },
  statLabel:      { fontSize: 11, color: Colors.NEUTRAL.MUTED, marginTop: 2 },

  // === SEÇÕES ===
  section:        { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle:   { fontSize: 13, fontWeight: '700', color: Colors.NEUTRAL.MUTED, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  card:           { backgroundColor: Colors.NEUTRAL.WHITE, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },

  // === LINHAS DE DADOS PESSOAIS ===
  infoRow:        { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  infoRowBorder:  { borderBottomWidth: 1, borderBottomColor: Colors.BORDER },
  infoTexts:      {},
  infoLabel:      { fontSize: 11, color: Colors.NEUTRAL.MUTED, fontWeight: '500' },
  infoValue:      { fontSize: 14, color: Colors.NEUTRAL.DARK_TEXT, fontWeight: '600', marginTop: 1 },

  // === LINHAS DE CONFIGURAÇÕES ===
  actionRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  actionBorder:   { borderBottomWidth: 1, borderBottomColor: Colors.BORDER },
  actionText:     { flex: 1, fontSize: 15, color: Colors.NEUTRAL.DARK_TEXT },

  // === BOTÃO DE LOGOUT ===
  logoutBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.NEUTRAL.WHITE, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.STATUS.OVERDUE },
  logoutText:     { fontSize: 15, fontWeight: '700', color: Colors.STATUS.OVERDUE },
});
