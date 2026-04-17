import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { mockPatients } from '../../constants/MockData';

export default function PatientsScreen() {
  const [query, setQuery] = useState('');

  const filtered = mockPatients.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.cpf.includes(query)
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <Text style={styles.title}>Meus Pacientes</Text>
        <Text style={styles.subtitle}>{mockPatients.length} pacientes cadastrados</Text>
      </Animated.View>

      {/* Busca */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={Colors.NEUTRAL.MUTED} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nome ou CPF..."
          placeholderTextColor={Colors.NEUTRAL.MUTED}
          value={query}
          onChangeText={setQuery}
        />
      </Animated.View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
        {filtered.map((p, i) => (
          <Animated.View key={p.id} entering={FadeInDown.delay(150 + i * 70).duration(350)} style={styles.card}>
            <View style={styles.cardLeft}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{p.name.charAt(0)}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{p.name}</Text>
                <Text style={styles.meta}>{p.age} anos · CPF: {p.cpf}</Text>
                <Text style={styles.lastVaccine}>
                  <Ionicons name="medical" size={11} color={Colors.NEUTRAL.MUTED} /> Última: {p.lastVaccine} ({p.lastVaccineDate})
                </Text>
              </View>
            </View>
            <View style={styles.cardRight}>
              {p.pendingCount > 0 && (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingText}>{p.pendingCount}✕</Text>
                </View>
              )}
              <TouchableOpacity style={styles.viewBtn}>
                <Text style={styles.viewBtnText}>Ver</Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.PROFESSIONAL} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.BACKGROUND },
  header:       { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  title:        { fontSize: 24, fontWeight: '800', color: Colors.NEUTRAL.DARK_TEXT },
  subtitle:     { fontSize: 14, color: Colors.NEUTRAL.MUTED, marginTop: 2 },
  searchWrap:   { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.NEUTRAL.WHITE, marginHorizontal: 16, marginBottom: 8, borderRadius: 14, paddingHorizontal: 14, height: 48, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  searchInput:  { flex: 1, fontSize: 14, color: Colors.NEUTRAL.DARK_TEXT },
  list:         { flex: 1 },
  card:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.NEUTRAL.WHITE, borderRadius: 16, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardLeft:     { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar:       { width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.PROFESSIONAL, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText:   { fontSize: 20, fontWeight: '800', color: Colors.NEUTRAL.WHITE },
  info:         { flex: 1 },
  name:         { fontSize: 15, fontWeight: '700', color: Colors.NEUTRAL.DARK_TEXT },
  meta:         { fontSize: 12, color: Colors.NEUTRAL.MUTED, marginTop: 2 },
  lastVaccine:  { fontSize: 11, color: Colors.NEUTRAL.MUTED, marginTop: 3 },
  cardRight:    { alignItems: 'flex-end', gap: 6 },
  pendingBadge: { backgroundColor: Colors.STATUS.OVERDUE + '15', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  pendingText:  { fontSize: 11, color: Colors.STATUS.OVERDUE, fontWeight: '700' },
  viewBtn:      { flexDirection: 'row', alignItems: 'center', gap: 2 },
  viewBtnText:  { fontSize: 13, color: Colors.PROFESSIONAL, fontWeight: '600' },
});
