// ============================================================
// COMPONENTE: PatientCard
// DESCRIÇÃO: Card de paciente reutilizável. Usado na lista de
//            busca (search-patient), últimos atendimentos (home
//            Rede Pública) e qualquer listagem de pacientes.
//
//            Preparado para IDs: onPress recebe patientId.
//            Futuramente a foto virá de uma URL de avatar.
// ACESSO: Profissional
// ============================================================

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import type { PatientProfile } from '../../constants/MockData';

interface PatientCardProps {
  patient: PatientProfile;
  onPress: (patientId: string) => void;  // Preparado para receber ID
  showPlan?: boolean;   // Mostra convênio (útil na Rede Privada)
  compact?: boolean;    // Layout compacto para listas densas
}

export function PatientCard({
  patient,
  onPress,
  showPlan = false,
  compact = false,
}: PatientCardProps) {
  // Cor do badge de pendências
  const hasPending = patient.pendingCount > 0;
  const hasOverdue = patient.overdueVaccines.length > 0;

  const badgeColor = hasOverdue
    ? Colors.STATUS.OVERDUE
    : Colors.STATUS.PENDING;

  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.cardCompact]}
      onPress={() => onPress(patient.id)}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Abrir perfil de ${patient.name}`}
    >
      {/* Avatar com inicial */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{patient.name.charAt(0)}</Text>
      </View>

      {/* Informações do paciente */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{patient.name}</Text>

        <Text style={styles.meta}>
          {patient.age} anos · CPF: {patient.cpf}
        </Text>

        {showPlan && (
          <Text style={styles.plan}>
            <Ionicons name="shield-checkmark-outline" size={11} color={Colors.NEUTRAL.MUTED} />{' '}
            {patient.plan}
          </Text>
        )}

        <Text style={styles.lastVaccine} numberOfLines={1}>
          <Ionicons name="medical" size={11} color={Colors.NEUTRAL.MUTED} />{' '}
          Última: {patient.lastVaccine} · {patient.lastVaccineDate}
        </Text>
      </View>

      {/* Lado direito: badge + botão */}
      <View style={styles.right}>
        {hasPending && (
          <View style={[styles.badge, { backgroundColor: badgeColor + '15' }]}>
            <Text style={[styles.badgeText, { color: badgeColor }]}>
              {patient.pendingCount} {patient.pendingCount > 1 ? 'pendências' : 'pendência'}
            </Text>
          </View>
        )}

        <View style={styles.profileBtn}>
          <Text style={styles.profileBtnText}>Ver perfil</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.PROFESSIONAL} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.NEUTRAL.WHITE,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardCompact: {
    padding: 12,
    marginBottom: 8,
  },

  // Avatar
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.PROFESSIONAL,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.NEUTRAL.WHITE,
  },

  // Textos
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: Colors.NEUTRAL.DARK_TEXT },
  meta: { fontSize: 12, color: Colors.NEUTRAL.MUTED, marginTop: 2 },
  plan: { fontSize: 11, color: Colors.NEUTRAL.MUTED, marginTop: 2 },
  lastVaccine: { fontSize: 11, color: Colors.NEUTRAL.MUTED, marginTop: 3 },

  // Direita
  right: { alignItems: 'flex-end', gap: 6, marginLeft: 8 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  profileBtnText: {
    fontSize: 13,
    color: Colors.PROFESSIONAL,
    fontWeight: '600',
  },
});
