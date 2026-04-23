// ============================================================
// COMPONENTE: HealthUnitCard (Card de Posto de Saúde)
// DESCRIÇÃO: Exibe as informações de uma unidade de saúde:
//            tipo (SUS ou Particular), nome, endereço, horário,
//            distância e botão para abrir a rota no Google Maps.
// ACESSO: Paciente
// ============================================================

// --- Bibliotecas principais do React ---
import React from 'react';

// --- Componentes de layout, links e interação do React Native ---
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// --- Ícones vetoriais da biblioteca Ionicons ---
import { Ionicons } from '@expo/vector-icons';

// --- Paleta de cores oficial do VacinApp ---
import { Colors } from '../constants/Colors';

// --- Tipo de dados do posto de saúde ---
import { HealthUnit } from '../constants/MockData';

// -------------------------------------------------------
// Interface: Propriedades do componente HealthUnitCard
// -------------------------------------------------------
interface HealthUnitCardProps {
  unit: HealthUnit; // Dados completos do posto de saúde
}

// -------------------------------------------------------
// COMPONENTE: HealthUnitCard
// -------------------------------------------------------
export function HealthUnitCard({ unit }: HealthUnitCardProps) {
  // Verifica se é um posto do SUS para escolher a cor do badge
  const isSUS = unit.type === 'SUS';
  const badgeColor = isSUS ? Colors.PRIMARY : Colors.PROFESSIONAL; // Roxo = SUS | Verde = Particular

  // -------------------------------------------------------
  // Abre o Google Maps com a busca pelo endereço do posto
  // Usa a codificação URI para tratar caracteres especiais no endereço
  // -------------------------------------------------------
  const openMaps = () => {
    const encoded = encodeURIComponent(unit.address);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encoded}`);
  };

  return (
    <View style={styles.card}>
      {/* ---- LINHA DO TOPO: Badge de tipo + Distância ---- */}
      <View style={styles.header}>
        {/* Badge colorido: roxo para SUS, verde para Particular */}
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>{unit.type}</Text>
        </View>
        {/* Distância aproximada do usuário */}
        <Text style={styles.distance}>
          <Ionicons name="location" size={12} color={Colors.NEUTRAL.MUTED} /> {unit.distance}
        </Text>
      </View>

      {/* ---- NOME DO POSTO ---- */}
      <Text style={styles.name}>{unit.name}</Text>

      {/* ---- ENDEREÇO ---- */}
      <Text style={styles.address}>{unit.address}</Text>

      {/* ---- RODAPÉ: Horário + Botão de rota ---- */}
      <View style={styles.footer}>
        {/* Horário de funcionamento com ícone de relógio */}
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={14} color={Colors.NEUTRAL.MUTED} />
          <Text style={styles.infoText}>{unit.hours}</Text>
        </View>
        {/* Botão que abre o Google Maps com a rota até o posto */}
        <TouchableOpacity style={styles.mapBtn} onPress={openMaps}>
          <Ionicons name="navigate" size={14} color={Colors.NEUTRAL.WHITE} />
          <Text style={styles.mapText}>Rota</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Sombra reutilizável para o card
const shadow = { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 };

// -------------------------------------------------------
// ESTILOS DO COMPONENTE
// -------------------------------------------------------
const styles = StyleSheet.create({
  // === CARD PRINCIPAL ===
  card:      { backgroundColor: Colors.NEUTRAL.WHITE, borderRadius: 16, padding: 16, marginBottom: 12, ...shadow },

  // === LINHA DO TOPO ===
  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },

  // === BADGE DE TIPO (SUS/Particular) ===
  badge:     { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { color: Colors.NEUTRAL.WHITE, fontSize: 11, fontWeight: '700' },

  // === DISTÂNCIA ===
  distance:  { fontSize: 12, color: Colors.NEUTRAL.MUTED },

  // === NOME E ENDEREÇO ===
  name:      { fontSize: 15, fontWeight: '700', color: Colors.NEUTRAL.DARK_TEXT, marginBottom: 4 },
  address:   { fontSize: 13, color: Colors.NEUTRAL.MUTED, marginBottom: 10 },

  // === RODAPÉ ===
  footer:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoRow:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText:  { fontSize: 12, color: Colors.NEUTRAL.MUTED },

  // === BOTÃO DE ROTA (Google Maps) ===
  mapBtn:    { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.PRIMARY, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  mapText:   { color: Colors.NEUTRAL.WHITE, fontSize: 12, fontWeight: '600' },
});
