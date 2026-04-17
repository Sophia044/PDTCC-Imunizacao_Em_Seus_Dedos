import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { HealthUnit } from '../constants/MockData';

interface HealthUnitCardProps {
  unit: HealthUnit;
}

export function HealthUnitCard({ unit }: HealthUnitCardProps) {
  const isSUS = unit.type === 'SUS';
  const badgeColor = isSUS ? Colors.PRIMARY : Colors.PROFESSIONAL;

  const openMaps = () => {
    const encoded = encodeURIComponent(unit.address);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encoded}`);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>{unit.type}</Text>
        </View>
        <Text style={styles.distance}>
          <Ionicons name="location" size={12} color={Colors.NEUTRAL.MUTED} /> {unit.distance}
        </Text>
      </View>
      <Text style={styles.name}>{unit.name}</Text>
      <Text style={styles.address}>{unit.address}</Text>
      <View style={styles.footer}>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={14} color={Colors.NEUTRAL.MUTED} />
          <Text style={styles.infoText}>{unit.hours}</Text>
        </View>
        <TouchableOpacity style={styles.mapBtn} onPress={openMaps}>
          <Ionicons name="navigate" size={14} color={Colors.NEUTRAL.WHITE} />
          <Text style={styles.mapText}>Rota</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const shadow = { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 };

const styles = StyleSheet.create({
  card:      { backgroundColor: Colors.NEUTRAL.WHITE, borderRadius: 16, padding: 16, marginBottom: 12, ...shadow },
  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badge:     { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { color: Colors.NEUTRAL.WHITE, fontSize: 11, fontWeight: '700' },
  distance:  { fontSize: 12, color: Colors.NEUTRAL.MUTED },
  name:      { fontSize: 15, fontWeight: '700', color: Colors.NEUTRAL.DARK_TEXT, marginBottom: 4 },
  address:   { fontSize: 13, color: Colors.NEUTRAL.MUTED, marginBottom: 10 },
  footer:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoRow:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText:  { fontSize: 12, color: Colors.NEUTRAL.MUTED },
  mapBtn:    { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.PRIMARY, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  mapText:   { color: Colors.NEUTRAL.WHITE, fontSize: 12, fontWeight: '600' },
});
