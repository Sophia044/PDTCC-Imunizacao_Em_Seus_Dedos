// ============================================================
// TELA: Home do Paciente (Dashboard Principal)
// DESCRIÇÃO: Tela inicial do paciente após o login. Exibe um
//            resumo do status vacinal (em dia, pendentes, atrasadas),
//            as próximas vacinas em um scroll horizontal e o histórico
//            recente das vacinas já tomadas.
// ACESSO: Paciente
// ROTA: /app/(patient)/home.tsx
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

// --- Componentes internos do projeto ---
import { VaccineCard } from '../../components/VaccineCard';

// --- Sessão do paciente autenticado (perfil já carregado no login) ---
import { useAuth } from '../../contexts/AuthContext';

// -------------------------------------------------------
// COMPONENTE PRINCIPAL: Home do Paciente
// -------------------------------------------------------
export default function PatientHome() {
  const { patient } = useAuth();

  // Primeiro nome, para a saudação (ex.: "Ana Clara Souza" -> "Ana Clara")
  const firstName = (patient?.name ?? '').split(' ').slice(0, 2).join(' ') || 'Paciente';

  const vaccines = patient?.vaccines ?? [];

  // Contadores de status das vacinas
  const pending  = vaccines.filter(v => v.status === 'pending').length;  // Quantidade pendente
  const overdue  = vaccines.filter(v => v.status === 'overdue').length;  // Quantidade atrasada
  const complete = vaccines.filter(v => v.status === 'complete').length; // Quantidade em dia

  // Listas filtradas para exibição na tela
  const upcoming = vaccines.filter(v => v.status !== 'complete'); // Próximas a tomar
  const recent   = vaccines.filter(v => v.status === 'complete').slice(0, 3); // 3 últimas tomadas

  return (
    // Container principal com área segura
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Barra de status com ícones claros (fundo roxo) */}
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>

        {/* ---- HEADER ROXO: Saudação + Avatar ---- */}
        <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {firstName} 👋</Text>
            <Text style={styles.subgreeting}>Confira seu histórico vacinal</Text>
          </View>
          {/* Avatar clicável — vai para o perfil */}
          <TouchableOpacity style={styles.avatar} onPress={() => router.push('/(patient)/profile')}>
            <Ionicons name="person" size={24} color={Colors.PRIMARY} />
          </TouchableOpacity>
        </Animated.View>

        {/* ---- CARD DE RESUMO: Em dia | Pendentes | Atrasadas ---- */}
        {/* Card flutua sobre o header com margem negativa */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.summaryCard}>
          {/* Número de vacinas em dia */}
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNum, { color: Colors.STATUS.COMPLETE }]}>{complete}</Text>
            <Text style={styles.summaryLabel}>Em dia</Text>
          </View>
          <View style={styles.divider} />
          {/* Número de vacinas pendentes */}
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNum, { color: Colors.STATUS.PENDING }]}>{pending}</Text>
            <Text style={styles.summaryLabel}>Pendentes</Text>
          </View>
          <View style={styles.divider} />
          {/* Número de vacinas atrasadas */}
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNum, { color: Colors.STATUS.OVERDUE }]}>{overdue}</Text>
            <Text style={styles.summaryLabel}>Atrasadas</Text>
          </View>
        </Animated.View>

        {/* ---- SEÇÃO: Próximas Vacinas (scroll horizontal) ---- */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Próximas Vacinas</Text>
          {upcoming.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma vacina pendente ou atrasada. 🎉</Text>
          ) : (
            /* Scroll horizontal para exibir múltiplos cards de vacinas pendentes */
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20, paddingRight: 20 }}>
              {upcoming.map((v, i) => (
                <Animated.View key={v.id} entering={FadeInDown.delay(250 + i * 60).duration(400)}>
                  {/* Card no modo horizontal (exibição compacta) */}
                  <VaccineCard vaccine={v} horizontal />
                </Animated.View>
              ))}
            </ScrollView>
          )}
        </Animated.View>

        {/* ---- SEÇÃO: Histórico Recente (últimas 3 vacinas tomadas) ---- */}
        <Animated.View entering={FadeInDown.delay(350).duration(500)} style={[styles.section, { paddingHorizontal: 20 }]}>
          <Text style={styles.sectionTitle}>Histórico Recente</Text>
          {recent.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma vacina registrada ainda.</Text>
          ) : (
            recent.map((v, i) => (
              <Animated.View key={v.id} entering={FadeInDown.delay(400 + i * 70).duration(400)}>
                {/* Card no modo vertical (exibição completa) */}
                <VaccineCard vaccine={v} />
              </Animated.View>
            ))
          )}
        </Animated.View>

        {/* Espaço extra para não ficar colado na tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ---- FAB (Botão Flutuante): Localizar posto para se vacinar ---- */}
      {/* Botão circular fixo no canto inferior direito */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/(patient)/map')}>
        <Ionicons name="add" size={28} color={Colors.NEUTRAL.WHITE} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// -------------------------------------------------------
// ESTILOS DA TELA
// -------------------------------------------------------
const styles = StyleSheet.create({
  // === CONTAINER PRINCIPAL ===
  safe:         { flex: 1, backgroundColor: Colors.BACKGROUND },   // Fundo lilás suave
  scroll:       { flex: 1 },

  // === CABEÇALHO ROXO ===
  header:       { backgroundColor: Colors.PRIMARY, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 28, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting:     { fontSize: 22, fontWeight: '800', color: Colors.NEUTRAL.WHITE },
  subgreeting:  { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  avatar:       { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.NEUTRAL.WHITE, alignItems: 'center', justifyContent: 'center' },

  // === CARD DE RESUMO (flutua sobre o header) ===
  summaryCard:  { marginHorizontal: 20, marginTop: -20, backgroundColor: Colors.NEUTRAL.WHITE, borderRadius: 18, flexDirection: 'row', padding: 18, shadowColor: Colors.PRIMARY, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  summaryItem:  { flex: 1, alignItems: 'center' },
  summaryNum:   { fontSize: 28, fontWeight: '800' },
  summaryLabel: { fontSize: 11, color: Colors.NEUTRAL.MUTED, marginTop: 2, fontWeight: '500' },
  divider:      { width: 1, backgroundColor: Colors.BORDER },

  // === SEÇÕES DE CONTEÚDO ===
  section:      { marginTop: 24 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.NEUTRAL.DARK_TEXT, marginBottom: 14, paddingHorizontal: 20 },
  emptyText:    { fontSize: 13, color: Colors.NEUTRAL.MUTED, paddingHorizontal: 20 },

  // === BOTÃO FLUTUANTE (FAB) ===
  fab:          { position: 'absolute', bottom: 30, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.PRIMARY, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.PRIMARY, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 },
});
