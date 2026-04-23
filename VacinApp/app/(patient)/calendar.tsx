// ============================================================
// TELA: Calendário Vacinal do Paciente
// DESCRIÇÃO: Exibe um calendário interativo com as datas das vacinas.
//            O usuário pode clicar em uma data para ver as vacinas
//            registradas naquele dia. Também possui filtros por status
//            e lista de todas as vacinas abaixo do calendário.
// ACESSO: Paciente
// ROTA: /app/(patient)/calendar.tsx
// ============================================================

// --- Bibliotecas principais do React ---
import React, { useState } from 'react';

// --- Componentes de layout e interação do React Native ---
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// --- Animações com Reanimated ---
import Animated, { FadeIn, FadeInDown, SlideInUp } from 'react-native-reanimated';

// --- Área segura (evita sobreposição com status bar e notch) ---
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Componente de calendário da biblioteca react-native-calendars ---
import { Calendar, DateData } from 'react-native-calendars';

// --- Controle da barra de status do sistema operacional ---
import { StatusBar } from 'expo-status-bar';

// --- Ícones vetoriais da biblioteca Ionicons ---
import { Ionicons } from '@expo/vector-icons';

// --- Paleta de cores oficial do VacinApp ---
import { Colors } from '../../constants/Colors';

// --- Componente interno: Badge de status da vacina ---
import { StatusBadge } from '../../components/StatusBadge';

// --- Dados mockados e tipos ---
import { mockCalendarMarks, mockVaccines, VaccineStatus } from '../../constants/MockData';

// -------------------------------------------------------
// Tipo para o filtro de status das vacinas
// 'all' inclui todas; os demais filtram por status específico
// -------------------------------------------------------
type Filter = 'all' | VaccineStatus;

// -------------------------------------------------------
// DADOS: Configuração dos botões de filtro
// Cada item tem uma chave de filtro e um rótulo para exibição
// -------------------------------------------------------
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',      label: 'Todas' },
  { key: 'pending',  label: 'Pendentes' },
  { key: 'overdue',  label: 'Atrasadas' },
  { key: 'complete', label: 'Concluídas' },
];

// Data de hoje no formato ISO (YYYY-MM-DD) para centralizar o calendário
const TODAY = new Date().toISOString().split('T')[0];

// -------------------------------------------------------
// COMPONENTE PRINCIPAL: Calendário Vacinal
// -------------------------------------------------------
export default function CalendarScreen() {
  // Data selecionada pelo usuário no calendário (null = nenhuma data selecionada)
  const [selected, setSelected] = useState<string | null>(null);
  // Filtro de status ativo nos chips abaixo do calendário
  const [filter, setFilter]     = useState<Filter>('all');

  // Filtra as vacinas de acordo com o chip de status ativo
  const filtered = mockVaccines.filter(v => filter === 'all' || v.status === filter);

  // Mescla as marcações do calendário com a data selecionada (destaque em roxo)
  const markedWithSelected = selected
    ? { ...mockCalendarMarks, [selected]: { ...(mockCalendarMarks[selected] ?? {}), selected: true, selectedColor: Colors.PRIMARY } }
    : mockCalendarMarks;

  // Vacinas que ocorreram na data selecionada (para exibir no painel do dia)
  const selectedVaccines = selected
    ? mockVaccines.filter(v => v.date.startsWith(selected))
    : [];

  return (
    // Container principal com área segura
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ---- CABEÇALHO DA TELA ---- */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <Text style={styles.title}>Calendário Vacinal</Text>
          <Text style={styles.subtitle}>Acompanhe suas imunizações</Text>
        </Animated.View>

        {/* ---- COMPONENTE DE CALENDÁRIO ---- */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.calendarWrap}>
          <Calendar
            markingType="multi-dot"             // Permite múltiplos pontos coloridos por dia
            markedDates={markedWithSelected}    // Datas marcadas (com pontos e seleção)
            onDayPress={(day: DateData) =>
              // Clique na mesma data deseleciona; clique em outra seleciona
              setSelected(s => s === day.dateString ? null : day.dateString)
            }
            current={TODAY}                     // Centra o calendário na data de hoje
            theme={{
              calendarBackground: Colors.NEUTRAL.WHITE,
              selectedDayBackgroundColor: Colors.PRIMARY,   // Dia selecionado: roxo
              selectedDayTextColor: Colors.NEUTRAL.WHITE,
              todayTextColor: Colors.PRIMARY,               // Hoje: texto roxo
              todayBackgroundColor: Colors.PRIMARY_LIGHT,   // Hoje: fundo lilás suave
              arrowColor: Colors.PRIMARY,                   // Setas de navegação: roxas
              monthTextColor: Colors.NEUTRAL.DARK_TEXT,
              textMonthFontWeight: '700',
              textDayFontSize: 14,
              textDayHeaderFontWeight: '600',
              dotSize: 6,
            }}
          />
        </Animated.View>

        {/* ---- PAINEL DO DIA SELECIONADO ---- */}
        {/* Aparece apenas quando uma data está selecionada */}
        {selected && (
          <Animated.View entering={SlideInUp.duration(350)} style={styles.dayPanel}>
            {/* Data selecionada formatada em português */}
            <Text style={styles.dayTitle}>
              {new Date(selected + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </Text>
            {/* Sem vacinas nessa data */}
            {selectedVaccines.length === 0 ? (
              <Text style={styles.emptyDay}>Nenhuma vacina registrada neste dia</Text>
            ) : (
              // Lista as vacinas da data selecionada
              selectedVaccines.map(v => (
                <View key={v.id} style={styles.dayItem}>
                  <View style={styles.dayItemLeft}>
                    <Text style={styles.dayItemName}>{v.name}</Text>
                    <Text style={styles.dayItemDose}>{v.dose}</Text>
                  </View>
                  <StatusBadge status={v.status} size="sm" />
                </View>
              ))
            )}
          </Animated.View>
        )}

        {/* ---- LEGENDA DE CORES DO CALENDÁRIO ---- */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.legend}>
          {[
            { color: Colors.STATUS.COMPLETE, label: 'Tomada' },
            { color: Colors.STATUS.PENDING,  label: 'Agendada' },
            { color: Colors.STATUS.OVERDUE,  label: 'Atrasada' },
          ].map(l => (
            <View key={l.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: l.color }]} />
              <Text style={styles.legendText}>{l.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* ---- CHIPS DE FILTRO POR STATUS ---- */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.chips}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.chip, filter === f.key && styles.chipActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.chipText, filter === f.key && styles.chipTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* ---- LISTA DE VACINAS FILTRADAS ---- */}
        <View style={styles.list}>
          {filtered.map((v, i) => (
            <Animated.View key={v.id} entering={FadeInDown.delay(300 + i * 60).duration(350)} style={styles.listItem}>
              <View style={styles.listItemLeft}>
                <Text style={styles.listItemName}>{v.name}</Text>
                {/* Dose e data formatada em português */}
                <Text style={styles.listItemDose}>{v.dose} · {new Date(v.date + 'T12:00:00').toLocaleDateString('pt-BR')}</Text>
              </View>
              <StatusBadge status={v.status} size="sm" />
            </Animated.View>
          ))}
        </View>

        {/* Espaço extra no final da lista */}
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

  // === CABEÇALHO ===
  header:         { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  title:          { fontSize: 24, fontWeight: '800', color: Colors.NEUTRAL.DARK_TEXT },
  subtitle:       { fontSize: 14, color: Colors.NEUTRAL.MUTED, marginTop: 2 },

  // === CONTAINER DO CALENDÁRIO ===
  calendarWrap:   { marginHorizontal: 16, marginTop: 16, borderRadius: 18, overflow: 'hidden', backgroundColor: Colors.NEUTRAL.WHITE, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },

  // === PAINEL DO DIA SELECIONADO ===
  dayPanel:       { marginHorizontal: 16, marginTop: 10, backgroundColor: Colors.NEUTRAL.WHITE, borderRadius: 16, padding: 16 },
  dayTitle:       { fontSize: 15, fontWeight: '700', color: Colors.PRIMARY, marginBottom: 12 },
  emptyDay:       { fontSize: 13, color: Colors.NEUTRAL.MUTED, textAlign: 'center', paddingVertical: 8 },
  dayItem:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.BORDER },
  dayItemLeft:    {},
  dayItemName:    { fontSize: 14, fontWeight: '700', color: Colors.NEUTRAL.DARK_TEXT },
  dayItemDose:    { fontSize: 12, color: Colors.NEUTRAL.MUTED },

  // === LEGENDA DE CORES ===
  legend:         { flexDirection: 'row', justifyContent: 'center', gap: 20, paddingVertical: 12 },
  legendItem:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:      { width: 10, height: 10, borderRadius: 5 },
  legendText:     { fontSize: 12, color: Colors.NEUTRAL.MUTED },

  // === CHIPS DE FILTRO ===
  chips:          { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  chip:           { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.NEUTRAL.WHITE, borderWidth: 1, borderColor: Colors.BORDER },
  chipActive:     { backgroundColor: Colors.PRIMARY, borderColor: Colors.PRIMARY },   // Chip ativo: roxo
  chipText:       { fontSize: 13, color: Colors.NEUTRAL.MUTED, fontWeight: '500' },
  chipTextActive: { color: Colors.NEUTRAL.WHITE, fontWeight: '700' },

  // === LISTA DE VACINAS ===
  list:           { paddingHorizontal: 16 },
  listItem:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.NEUTRAL.WHITE, borderRadius: 14, padding: 14, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  listItemLeft:   { flex: 1, marginRight: 10 },
  listItemName:   { fontSize: 14, fontWeight: '700', color: Colors.NEUTRAL.DARK_TEXT },
  listItemDose:   { fontSize: 12, color: Colors.NEUTRAL.MUTED, marginTop: 2 },
});
