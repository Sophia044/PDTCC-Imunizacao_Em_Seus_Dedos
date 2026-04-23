// ============================================================
// TELA: Home do Profissional de Saúde (Dashboard)
// DESCRIÇÃO: Tela inicial do profissional após o login. Exibe
//            cartões de estatísticas do dia (pacientes, vacinas,
//            alertas), botão de acesso rápido para registrar
//            vacinação e a lista dos pacientes recentes.
// ACESSO: Profissional
// ROTA: /app/(professional)/home.tsx
// ============================================================

// --- Bibliotecas principais do React ---
import React from 'react';

// --- Componentes de layout e interação do React Native ---
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
import { mockPatients, mockVaccines } from '../../constants/MockData';

// -------------------------------------------------------
// DADOS CALCULADOS: Estatísticas do dia do profissional
// Em produção, virão da API com filtros por data e profissional
// -------------------------------------------------------
const todayVaccines   = mockVaccines.filter(v => v.status === 'complete').length; // Vacinas registradas
const todayPatients   = 4;                                                         // Pacientes atendidos hoje
const pendingAlerts   = mockVaccines.filter(v => v.status === 'overdue').length;  // Alertas de vacinas atrasadas

// -------------------------------------------------------
// DADOS: Configuração dos cards de estatísticas
// -------------------------------------------------------
const STAT_CARDS = [
  { label: 'Pacientes Hoje',      value: todayPatients, icon: 'people',       color: Colors.PROFESSIONAL },
  { label: 'Vacinas Registradas', value: todayVaccines, icon: 'medical',      color: Colors.PRIMARY },
  { label: 'Alertas Pendentes',   value: pendingAlerts, icon: 'alert-circle', color: Colors.STATUS.OVERDUE },
];

// -------------------------------------------------------
// COMPONENTE PRINCIPAL: Home do Profissional
// -------------------------------------------------------
export default function ProfessionalHome() {
  return (
    // Container principal com área segura
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Barra de status com ícones claros (fundo verde) */}
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ---- HEADER VERDE: Saudação + Badge de verificado + Avatar ---- */}
        <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, Dr(a). Marcos 👨‍⚕️</Text>
            {/* Badge que indica que o profissional está verificado */}
            <View style={styles.verifiedRow}>
              <Ionicons name="shield-checkmark" size={14} color={Colors.LIGHT_GREEN} />
              <Text style={styles.verifiedText}>Profissional Verificado</Text>
            </View>
          </View>
          {/* Avatar clicável (futuramente abre as configurações) */}
          <TouchableOpacity style={styles.avatar}>
            <Ionicons name="person" size={24} color={Colors.PROFESSIONAL} />
          </TouchableOpacity>
        </Animated.View>

        {/* ---- CARDS DE ESTATÍSTICAS DO DIA ---- */}
        {/* Dispostos horizontalmente com fundo branco flutuando sobre o header */}
        <View style={styles.statsRow}>
          {STAT_CARDS.map((s, i) => (
            <Animated.View key={s.label} entering={FadeInDown.delay(100 + i * 80).duration(400)} style={styles.statCard}>
              {/* Círculo colorido com o ícone da estatística */}
              <View style={[styles.statIconCircle, { backgroundColor: s.color + '20' }]}>
                <Ionicons name={s.icon as any} size={22} color={s.color} />
              </View>
              {/* Valor numérico em destaque */}
              <Text style={[styles.statNum, { color: s.color }]}>{s.value}</Text>
              {/* Rótulo da estatística */}
              <Text style={styles.statLabel}>{s.label}</Text>
            </Animated.View>
          ))}
        </View>

        {/* ---- BOTÃO DE ACESSO RÁPIDO: Registrar nova vacinação ---- */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.registerBtnWrap}>
          <TouchableOpacity style={styles.registerBtn} onPress={() => router.push('/(professional)/register-vaccine')}>
            <Ionicons name="add-circle" size={22} color={Colors.NEUTRAL.WHITE} />
            <Text style={styles.registerBtnText}>Registrar nova vacinação</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ---- SEÇÃO: Lista de Pacientes Recentes ---- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pacientes Recentes</Text>
          {/* Exibe os primeiros 4 pacientes da lista */}
          {mockPatients.slice(0, 4).map((p, i) => (
            <Animated.View key={p.id} entering={FadeInDown.delay(350 + i * 60).duration(350)} style={styles.patientRow}>
              {/* Avatar circular com ícone de pessoa */}
              <View style={styles.patientAvatar}>
                <Ionicons name="person" size={22} color={Colors.NEUTRAL.WHITE} />
              </View>
              {/* Informações do paciente */}
              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>{p.name}</Text>
                <Text style={styles.patientMeta}>{p.lastVaccine} · {p.lastVaccineDate}</Text>
              </View>
              {/* Lado direito: badge de pendentes + botão de detalhe */}
              <View style={styles.patientRight}>
                {/* Badge vermelho de vacinas pendentes (aparece apenas se houver) */}
                {p.pendingCount > 0 && (
                  <View style={styles.alertBadge}>
                    <Text style={styles.alertBadgeText}>{p.pendingCount} pendente{p.pendingCount > 1 ? 's' : ''}</Text>
                  </View>
                )}
                {/* Botão de ver detalhes do paciente */}
                <TouchableOpacity style={styles.actionBtn}>
                  <Ionicons name="chevron-forward" size={18} color={Colors.PROFESSIONAL} />
                </TouchableOpacity>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Espaço extra no final */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// -------------------------------------------------------
// ESTILOS DA TELA
// Identidade visual VERDE — área do profissional de saúde
// -------------------------------------------------------
const styles = StyleSheet.create({
  // === CONTAINER PRINCIPAL ===
  safe:           { flex: 1, backgroundColor: Colors.BACKGROUND },

  // === CABEÇALHO VERDE ===
  header:         { backgroundColor: Colors.PROFESSIONAL, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 28, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting:       { fontSize: 22, fontWeight: '800', color: Colors.NEUTRAL.WHITE },
  verifiedRow:    { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  verifiedText:   { fontSize: 12, color: Colors.LIGHT_GREEN, fontWeight: '600' },
  avatar:         { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.NEUTRAL.WHITE, alignItems: 'center', justifyContent: 'center' },

  // === CARDS DE ESTATÍSTICAS (flutuam sobre o header) ===
  statsRow:       { flexDirection: 'row', gap: 10, padding: 16, marginTop: -16 },
  statCard:       { flex: 1, backgroundColor: Colors.NEUTRAL.WHITE, borderRadius: 16, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  statIconCircle: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statNum:        { fontSize: 22, fontWeight: '800' },
  statLabel:      { fontSize: 10, color: Colors.NEUTRAL.MUTED, textAlign: 'center', marginTop: 2, fontWeight: '500' },

  // === BOTÃO DE REGISTRAR VACINAÇÃO ===
  registerBtnWrap:{ paddingHorizontal: 16, marginBottom: 20 },
  registerBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: Colors.PROFESSIONAL, height: 54, borderRadius: 14, shadowColor: Colors.PROFESSIONAL, shadowOpacity: 0.35, shadowRadius: 8, elevation: 5 },
  registerBtnText:{ fontSize: 16, fontWeight: '700', color: Colors.NEUTRAL.WHITE },

  // === SEÇÃO DE PACIENTES ===
  section:        { paddingHorizontal: 16 },
  sectionTitle:   { fontSize: 17, fontWeight: '800', color: Colors.NEUTRAL.DARK_TEXT, marginBottom: 14 },

  // === LINHA DE PACIENTE ===
  patientRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.NEUTRAL.WHITE, borderRadius: 14, padding: 14, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  patientAvatar:  { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.PROFESSIONAL, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  patientInfo:    { flex: 1 },
  patientName:    { fontSize: 14, fontWeight: '700', color: Colors.NEUTRAL.DARK_TEXT },
  patientMeta:    { fontSize: 12, color: Colors.NEUTRAL.MUTED, marginTop: 2 },
  patientRight:   { alignItems: 'flex-end', gap: 4 },
  alertBadge:     { backgroundColor: Colors.STATUS.OVERDUE + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  alertBadgeText: { fontSize: 10, color: Colors.STATUS.OVERDUE, fontWeight: '700' },
  actionBtn:      {},
});
