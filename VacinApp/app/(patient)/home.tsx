import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { VaccineCard } from '../../components/VaccineCard';
import { mockVaccines } from '../../constants/MockData';

const USER_NAME = 'Ana Clara';
const pending  = mockVaccines.filter(v => v.status === 'pending').length;
const overdue  = mockVaccines.filter(v => v.status === 'overdue').length;
const complete = mockVaccines.filter(v => v.status === 'complete').length;
const upcoming = mockVaccines.filter(v => v.status !== 'complete');
const recent   = mockVaccines.filter(v => v.status === 'complete').slice(0, 3);

export default function PatientHome() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>

        {/* Header roxo */}
        <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {USER_NAME} 👋</Text>
            <Text style={styles.subgreeting}>Confira seu histórico vacinal</Text>
          </View>
          <TouchableOpacity style={styles.avatar}>
            <Ionicons name="person" size={24} color={Colors.PRIMARY} />
          </TouchableOpacity>
        </Animated.View>

        {/* Card de resumo */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNum, { color: Colors.STATUS.COMPLETE }]}>{complete}</Text>
            <Text style={styles.summaryLabel}>Em dia</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNum, { color: Colors.STATUS.PENDING }]}>{pending}</Text>
            <Text style={styles.summaryLabel}>Pendentes</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNum, { color: Colors.STATUS.OVERDUE }]}>{overdue}</Text>
            <Text style={styles.summaryLabel}>Atrasadas</Text>
          </View>
        </Animated.View>

        {/* Próximas vacinas — scroll horizontal */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Próximas Vacinas</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
            {upcoming.map((v, i) => (
              <Animated.View key={v.id} entering={FadeInDown.delay(250 + i * 60).duration(400)}>
                <VaccineCard vaccine={v} horizontal />
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Histórico recente */}
        <Animated.View entering={FadeInDown.delay(350).duration(500)} style={[styles.section, { paddingHorizontal: 20 }]}>
          <Text style={styles.sectionTitle}>Histórico Recente</Text>
          {recent.map((v, i) => (
            <Animated.View key={v.id} entering={FadeInDown.delay(400 + i * 70).duration(400)}>
              <VaccineCard vaccine={v} />
            </Animated.View>
          ))}
        </Animated.View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={28} color={Colors.NEUTRAL.WHITE} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.BACKGROUND },
  scroll:       { flex: 1 },
  header:       { backgroundColor: Colors.PRIMARY, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 28, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting:     { fontSize: 22, fontWeight: '800', color: Colors.NEUTRAL.WHITE },
  subgreeting:  { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  avatar:       { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.NEUTRAL.WHITE, alignItems: 'center', justifyContent: 'center' },
  summaryCard:  { marginHorizontal: 20, marginTop: -20, backgroundColor: Colors.NEUTRAL.WHITE, borderRadius: 18, flexDirection: 'row', padding: 18, shadowColor: Colors.PRIMARY, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  summaryItem:  { flex: 1, alignItems: 'center' },
  summaryNum:   { fontSize: 28, fontWeight: '800' },
  summaryLabel: { fontSize: 11, color: Colors.NEUTRAL.MUTED, marginTop: 2, fontWeight: '500' },
  divider:      { width: 1, backgroundColor: Colors.BORDER },
  section:      { marginTop: 24 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.NEUTRAL.DARK_TEXT, marginBottom: 14, paddingHorizontal: 20 },
  fab:          { position: 'absolute', bottom: 80, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.PRIMARY, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.PRIMARY, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 },
});
