// ============================================================
// TELA: Agenda / Calendário de Agendamentos do Profissional
// DESCRIÇÃO: Exibe um calendário interativo com os pacientes agendados
//            na Rede Privada. Permite navegar pelas datas, filtrar
//            por status (agendado, realizado, faltou) e acessar o
//            perfil do paciente.
// ACESSO: Profissional (Rede Privada)
// ROTA: /app/(professional)/agenda.tsx
// ============================================================

import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, SlideInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/Colors';
import { AppointmentStatus, mockAppointments, TODAY_ISO } from '../../constants/MockData';
import { AppointmentCard } from '../../components/professional';

type FilterType = 'all' | AppointmentStatus;

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all',       label: 'Todos' },
  { key: 'scheduled', label: 'Agendados' },
  { key: 'done',      label: 'Realizados' },
  { key: 'missed',    label: 'Faltaram' },
];

export default function ProfessionalAgendaScreen() {
  const [selectedDate, setSelectedDate] = useState<string>(TODAY_ISO);
  const [filter, setFilter]             = useState<FilterType>('all');

  // Navega para o perfil do paciente
  const goToPatientProfile = (patientId: string) => {
    router.push({
      pathname: '/(professional)/patient-profile',
      params: { patientId, network: 'private' },
    });
  };

  // Monta dinamicamente as marcações de pontos (dots) para o calendário
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    mockAppointments.forEach(apt => {
      if (!apt.date) return;
      if (!marks[apt.date]) {
        marks[apt.date] = { dots: [] };
      }
      let color = Colors.STATUS.PENDING;
      if (apt.status === 'done') color = Colors.STATUS.COMPLETE;
      if (apt.status === 'missed') color = Colors.STATUS.OVERDUE;

      if (marks[apt.date].dots.length < 3) {
        marks[apt.date].dots.push({ key: apt.id, color });
      }
    });

    // Destaca a data selecionada
    marks[selectedDate] = {
      ...(marks[selectedDate] ?? {}),
      selected: true,
      selectedColor: Colors.PROFESSIONAL,
      selectedTextColor: Colors.NEUTRAL.WHITE,
    };

    return marks;
  }, [selectedDate]);

  // Agendamentos filtrados para a data selecionada
  const dateAppointments = useMemo(() => {
    return mockAppointments.filter(apt => apt.date === selectedDate);
  }, [selectedDate]);

  // Aplica o filtro de status sobre os agendamentos da data
  const filteredAppointments = useMemo(() => {
    return dateAppointments.filter(apt => filter === 'all' || apt.status === filter);
  }, [dateAppointments, filter]);

  // Formatação amigável da data selecionada
  const formattedSelectedDate = useMemo(() => {
    try {
      const [year, month, day] = selectedDate.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      return dateObj.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── CABEÇALHO ───────────────────────────────────────── */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Ionicons name="calendar-outline" size={26} color={Colors.PROFESSIONAL} style={{ marginRight: 8 }} />
            <View>
              <Text style={styles.title}>Agenda de Agendamentos</Text>
              <Text style={styles.subtitle}>Consultas e vacinações da Rede Privada</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── CALENDÁRIO ──────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.calendarWrap}>
          <Calendar
            markingType="multi-dot"
            markedDates={markedDates}
            onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
            current={selectedDate}
            theme={{
              calendarBackground: Colors.NEUTRAL.WHITE,
              selectedDayBackgroundColor: Colors.PROFESSIONAL,
              selectedDayTextColor: Colors.NEUTRAL.WHITE,
              todayTextColor: Colors.PROFESSIONAL,
              todayBackgroundColor: Colors.PROFESSIONAL_LIGHT,
              arrowColor: Colors.PROFESSIONAL,
              monthTextColor: Colors.NEUTRAL.DARK_TEXT,
              textMonthFontWeight: '700',
              textDayFontSize: 14,
              textDayHeaderFontWeight: '600',
            }}
          />
        </Animated.View>

        {/* ── LEGENDA DE CORES ───────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(180).duration(400)} style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.STATUS.PENDING }]} />
            <Text style={styles.legendText}>Agendado</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.STATUS.COMPLETE }]} />
            <Text style={styles.legendText}>Realizado</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.STATUS.OVERDUE }]} />
            <Text style={styles.legendText}>Faltou</Text>
          </View>
        </Animated.View>

        {/* ── PAINEL DA DATA SELECIONADA ───────────────────────── */}
        <Animated.View entering={SlideInUp.duration(350)} style={styles.dayPanel}>
          <View style={styles.dayHeader}>
            <Text style={styles.dayTitle}>{formattedSelectedDate}</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{filteredAppointments.length} paciente(s)</Text>
            </View>
          </View>

          {/* ── CHIPS DE FILTRO DE STATUS ─────────────────────── */}
          <View style={styles.filterRow}>
            {FILTERS.map(f => {
              const active = filter === f.key;
              return (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setFilter(f.key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── LISTA DE PACIENTES DA DATA ─────────────────────── */}
          {filteredAppointments.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="calendar-outline" size={32} color={Colors.NEUTRAL.MUTED} />
              <Text style={styles.emptyText}>
                Nenhum agendamento encontrado para esta data ou filtro.
              </Text>
            </View>
          ) : (
            filteredAppointments.map((apt, index) => (
              <Animated.View key={apt.id} entering={FadeInDown.delay(100 + index * 50).duration(300)}>
                <AppointmentCard appointment={apt} onPress={goToPatientProfile} />
              </Animated.View>
            ))
          )}
        </Animated.View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  header: {
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.NEUTRAL.DARK_TEXT,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.NEUTRAL.MUTED,
    marginTop: 2,
  },
  calendarWrap: {
    backgroundColor: Colors.NEUTRAL.WHITE,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginBottom: 12,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 16,
    backgroundColor: Colors.NEUTRAL.WHITE,
    paddingVertical: 10,
    borderRadius: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.NEUTRAL.MUTED,
  },
  dayPanel: {
    marginTop: 4,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dayTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.NEUTRAL.DARK_TEXT,
    textTransform: 'capitalize',
    flex: 1,
  },
  countBadge: {
    backgroundColor: Colors.PROFESSIONAL_LIGHT,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.PROFESSIONAL,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.NEUTRAL.WHITE,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  filterChipActive: {
    backgroundColor: Colors.PROFESSIONAL,
    borderColor: Colors.PROFESSIONAL,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.NEUTRAL.MUTED,
  },
  filterChipTextActive: {
    color: Colors.NEUTRAL.WHITE,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: Colors.NEUTRAL.WHITE,
    borderRadius: 16,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.NEUTRAL.MUTED,
    textAlign: 'center',
  },
});
