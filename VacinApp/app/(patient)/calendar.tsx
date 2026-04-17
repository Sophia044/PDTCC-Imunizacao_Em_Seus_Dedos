import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, SlideInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { StatusBadge } from '../../components/StatusBadge';
import { mockCalendarMarks, mockVaccines, VaccineStatus } from '../../constants/MockData';

type Filter = 'all' | VaccineStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',      label: 'Todas' },
  { key: 'pending',  label: 'Pendentes' },
  { key: 'overdue',  label: 'Atrasadas' },
  { key: 'complete', label: 'Concluídas' },
];

const TODAY = new Date().toISOString().split('T')[0];

export default function CalendarScreen() {
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter]     = useState<Filter>('all');

  const filtered = mockVaccines.filter(v => filter === 'all' || v.status === filter);

  const markedWithSelected = selected
    ? { ...mockCalendarMarks, [selected]: { ...(mockCalendarMarks[selected] ?? {}), selected: true, selectedColor: Colors.PRIMARY } }
    : mockCalendarMarks;

  const selectedVaccines = selected
    ? mockVaccines.filter(v => v.date.startsWith(selected))
    : [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <Text style={styles.title}>Calendário Vacinal</Text>
          <Text style={styles.subtitle}>Acompanhe suas imunizações</Text>
        </Animated.View>

        {/* Calendário */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.calendarWrap}>
          <Calendar
            markingType="multi-dot"
            markedDates={markedWithSelected}
            onDayPress={(day: DateData) => setSelected(s => s === day.dateString ? null : day.dateString)}
            current={TODAY}
            theme={{
              calendarBackground: Colors.NEUTRAL.WHITE,
              selectedDayBackgroundColor: Colors.PRIMARY,
              selectedDayTextColor: Colors.NEUTRAL.WHITE,
              todayTextColor: Colors.PRIMARY,
              todayBackgroundColor: Colors.PRIMARY_LIGHT,
              arrowColor: Colors.PRIMARY,
              monthTextColor: Colors.NEUTRAL.DARK_TEXT,
              textMonthFontWeight: '700',
              textDayFontSize: 14,
              textDayHeaderFontWeight: '600',
              dotSize: 6,
            }}
          />
        </Animated.View>

        {/* Painel do dia selecionado */}
        {selected && (
          <Animated.View entering={SlideInUp.duration(350)} style={styles.dayPanel}>
            <Text style={styles.dayTitle}>
              {new Date(selected + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </Text>
            {selectedVaccines.length === 0 ? (
              <Text style={styles.emptyDay}>Nenhuma vacina registrada neste dia</Text>
            ) : (
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

        {/* Legenda */}
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

        {/* Chips de filtro */}
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

        {/* Lista de vacinas */}
        <View style={styles.list}>
          {filtered.map((v, i) => (
            <Animated.View key={v.id} entering={FadeInDown.delay(300 + i * 60).duration(350)} style={styles.listItem}>
              <View style={styles.listItemLeft}>
                <Text style={styles.listItemName}>{v.name}</Text>
                <Text style={styles.listItemDose}>{v.dose} · {new Date(v.date + 'T12:00:00').toLocaleDateString('pt-BR')}</Text>
              </View>
              <StatusBadge status={v.status} size="sm" />
            </Animated.View>
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: Colors.BACKGROUND },
  header:         { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  title:          { fontSize: 24, fontWeight: '800', color: Colors.NEUTRAL.DARK_TEXT },
  subtitle:       { fontSize: 14, color: Colors.NEUTRAL.MUTED, marginTop: 2 },
  calendarWrap:   { marginHorizontal: 16, marginTop: 16, borderRadius: 18, overflow: 'hidden', backgroundColor: Colors.NEUTRAL.WHITE, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  dayPanel:       { marginHorizontal: 16, marginTop: 10, backgroundColor: Colors.NEUTRAL.WHITE, borderRadius: 16, padding: 16 },
  dayTitle:       { fontSize: 15, fontWeight: '700', color: Colors.PRIMARY, marginBottom: 12 },
  emptyDay:       { fontSize: 13, color: Colors.NEUTRAL.MUTED, textAlign: 'center', paddingVertical: 8 },
  dayItem:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.BORDER },
  dayItemLeft:    {},
  dayItemName:    { fontSize: 14, fontWeight: '700', color: Colors.NEUTRAL.DARK_TEXT },
  dayItemDose:    { fontSize: 12, color: Colors.NEUTRAL.MUTED },
  legend:         { flexDirection: 'row', justifyContent: 'center', gap: 20, paddingVertical: 12 },
  legendItem:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:      { width: 10, height: 10, borderRadius: 5 },
  legendText:     { fontSize: 12, color: Colors.NEUTRAL.MUTED },
  chips:          { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  chip:           { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.NEUTRAL.WHITE, borderWidth: 1, borderColor: Colors.BORDER },
  chipActive:     { backgroundColor: Colors.PRIMARY, borderColor: Colors.PRIMARY },
  chipText:       { fontSize: 13, color: Colors.NEUTRAL.MUTED, fontWeight: '500' },
  chipTextActive: { color: Colors.NEUTRAL.WHITE, fontWeight: '700' },
  list:           { paddingHorizontal: 16 },
  listItem:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.NEUTRAL.WHITE, borderRadius: 14, padding: 14, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  listItemLeft:   { flex: 1, marginRight: 10 },
  listItemName:   { fontSize: 14, fontWeight: '700', color: Colors.NEUTRAL.DARK_TEXT },
  listItemDose:   { fontSize: 12, color: Colors.NEUTRAL.MUTED, marginTop: 2 },
});
