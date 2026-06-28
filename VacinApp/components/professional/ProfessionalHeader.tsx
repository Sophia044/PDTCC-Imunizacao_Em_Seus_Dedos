// ============================================================
// COMPONENTE: ProfessionalHeader
// DESCRIÇÃO: Cabeçalho verde reutilizável da área do profissional.
//            Exibe saudação, cargo, unidade/instituição e badge
//            de profissional verificado. Usado nos dois dashboards.
// ACESSO: Profissional
// ============================================================

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import type { ProfessionalNetworkType } from '../../constants/MockData';

// -------------------------------------------------------
// Interface: Propriedades do componente
// -------------------------------------------------------
interface ProfessionalHeaderProps {
  name: string;                           // Nome do profissional
  role: string;                           // Cargo (retornado pelo backend)
  unit: string;                           // Unidade (Rede Pública) ou instituição (Rede Privada)
  networkType: ProfessionalNetworkType;   // Define rede — usado para label secundário
  onAvatarPress?: () => void;             // Callback ao pressionar o avatar
}

// -------------------------------------------------------
// COMPONENTE: ProfessionalHeader
// -------------------------------------------------------
export function ProfessionalHeader({
  name,
  role,
  unit,
  networkType,
  onAvatarPress,
}: ProfessionalHeaderProps) {
  // Determina a saudação baseada no horário atual
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Bom dia' :
    hour < 18 ? 'Boa tarde' :
    'Boa noite';

  const networkLabel = networkType === 'public' ? 'Rede Pública · SUS' : 'Rede Privada';

  return (
    <View style={styles.container}>
      {/* Círculos decorativos de fundo */}
      <View style={[styles.deco, styles.deco1]} />
      <View style={[styles.deco, styles.deco2]} />

      {/* Lado esquerdo: textos */}
      <View style={styles.textBlock}>
        {/* Saudação + Nome */}
        <Text style={styles.greeting} numberOfLines={1}>
          {greeting}, {role === 'Médico' ? 'Dr.' : role === 'Médica' ? 'Dra.' : ''} {name}
        </Text>

        {/* Unidade ou Instituição */}
        {!!unit && (
          <Text style={styles.unit} numberOfLines={1}>
            <Ionicons name="business-outline" size={12} color="rgba(255,255,255,0.75)" />{' '}
            {unit}
          </Text>
        )}

        {/* Badge de rede + verificado */}
        <View style={styles.badgeRow}>
          <View style={styles.networkBadge}>
            <Ionicons name="shield-checkmark" size={11} color={Colors.LIGHT_GREEN} />
            <Text style={styles.networkBadgeText}>Profissional Verificado</Text>
          </View>
          <View style={styles.netTypeBadge}>
            <Text style={styles.netTypeText}>{networkLabel}</Text>
          </View>
        </View>
      </View>

      {/* Avatar clicável */}
      <TouchableOpacity
        style={styles.avatar}
        onPress={onAvatarPress}
        activeOpacity={0.8}
        accessibilityLabel="Abrir configurações"
        accessibilityRole="button"
      >
        <Ionicons name="person" size={26} color={Colors.PROFESSIONAL} />
      </TouchableOpacity>
    </View>
  );
}

// -------------------------------------------------------
// ESTILOS
// -------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.PROFESSIONAL,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    overflow: 'hidden',
  },

  // Círculos decorativos
  deco: { position: 'absolute', borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.07)' },
  deco1: { width: 140, height: 140, top: -50, right: -30 },
  deco2: { width: 80,  height: 80,  bottom: -20, left: 60 },

  // Textos
  textBlock: { flex: 1, paddingRight: 12 },
  greeting:  { fontSize: 20, fontWeight: '800', color: Colors.NEUTRAL.WHITE, lineHeight: 26 },
  unit:      { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 3, fontWeight: '500' },

  // Badges
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  networkBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
  },
  networkBadgeText: { fontSize: 11, color: Colors.LIGHT_GREEN, fontWeight: '700' },
  netTypeBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
  },
  netTypeText: { fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },

  // Avatar
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.NEUTRAL.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
});
