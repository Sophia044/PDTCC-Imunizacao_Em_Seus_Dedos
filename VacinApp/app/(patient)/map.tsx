import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { HealthUnitCard } from '../../components/HealthUnitCard';
import { mockHealthUnits } from '../../constants/MockData';

export default function MapScreen() {
  const [query, setQuery] = useState('');

  const filtered = mockHealthUnits.filter(u =>
    u.name.toLowerCase().includes(query.toLowerCase()) ||
    u.address.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="light" />

      {/* Hero map decorativo */}
      <Animated.View entering={FadeIn.duration(500)} style={styles.mapHero}>
        {/* Grid visual de mapa */}
        <View style={styles.gridOverlay}>
          {[0,1,2,3].map(r => (
            <View key={r} style={styles.gridRow}>
              {[0,1,2,3,4].map(c => <View key={c} style={styles.gridCell} />)}
            </View>
          ))}
        </View>
        {/* Pins decorativos */}
        {[
          { top: 40, left: 60,  color: Colors.PRIMARY },
          { top: 70, left: 200, color: Colors.PROFESSIONAL },
          { top: 100, left: 120, color: Colors.PRIMARY },
          { top: 30, left: 290, color: Colors.PROFESSIONAL },
        ].map((pin, i) => (
          <View key={i} style={[styles.pin, { top: pin.top, left: pin.left, backgroundColor: pin.color }]}>
            <Ionicons name="medkit" size={12} color="#fff" />
          </View>
        ))}
        <View style={styles.heroOverlay}>
          <Ionicons name="map" size={32} color="rgba(255,255,255,0.8)" />
          <Text style={styles.heroTitle}>Onde se Vacinar</Text>
          <Text style={styles.heroSub}>{mockHealthUnits.length} postos encontrados</Text>
        </View>
        <TouchableOpacity style={styles.gpsBtn}>
          <Ionicons name="navigate" size={16} color={Colors.PRIMARY} />
          <Text style={styles.gpsBtnText}>Usar minha localização</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Busca */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={Colors.NEUTRAL.MUTED} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por bairro ou cidade..."
          placeholderTextColor={Colors.NEUTRAL.MUTED}
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color={Colors.NEUTRAL.MUTED} />
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Legenda */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: Colors.PRIMARY }]} /><Text style={styles.legendText}>SUS / UBS</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: Colors.PROFESSIONAL }]} /><Text style={styles.legendText}>Particular</Text></View>
      </View>

      {/* Lista de postos */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={40} color={Colors.NEUTRAL.MUTED} />
            <Text style={styles.emptyText}>Nenhum posto encontrado</Text>
          </View>
        ) : (
          filtered.map((unit, i) => (
            <Animated.View key={unit.id} entering={FadeInDown.delay(100 + i * 70).duration(350)}>
              <HealthUnitCard unit={unit} />
            </Animated.View>
          ))
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: Colors.BACKGROUND },
  mapHero:     { height: 180, backgroundColor: Colors.PRIMARY, position: 'relative', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  gridOverlay: { position: 'absolute', inset: 0, opacity: 0.15 },
  gridRow:     { flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  gridCell:    { flex: 1, borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  pin:         { position: 'absolute', width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  heroOverlay: { alignItems: 'center', zIndex: 1 },
  heroTitle:   { fontSize: 20, fontWeight: '800', color: Colors.NEUTRAL.WHITE, marginTop: 8 },
  heroSub:     { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  gpsBtn:      { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.NEUTRAL.WHITE, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 12 },
  gpsBtnText:  { fontSize: 13, fontWeight: '600', color: Colors.PRIMARY },
  searchWrap:  { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.NEUTRAL.WHITE, marginHorizontal: 16, marginTop: -20, borderRadius: 14, paddingHorizontal: 14, height: 48, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4, zIndex: 10 },
  searchInput: { flex: 1, fontSize: 14, color: Colors.NEUTRAL.DARK_TEXT },
  legendRow:   { flexDirection: 'row', gap: 20, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  legendItem:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:   { width: 10, height: 10, borderRadius: 5 },
  legendText:  { fontSize: 12, color: Colors.NEUTRAL.MUTED },
  list:        { flex: 1 },
  empty:       { alignItems: 'center', paddingTop: 40, gap: 10 },
  emptyText:   { fontSize: 15, color: Colors.NEUTRAL.MUTED },
});
