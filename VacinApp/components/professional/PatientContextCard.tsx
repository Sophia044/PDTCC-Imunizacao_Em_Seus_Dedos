// ============================================================
// COMPONENTE: PatientContextCard
// DESCRIÇÃO: Cartão fixo exibido no topo da tela de registrar
//            vacina. Mostra os dados do paciente ativo, garantindo
//            que o profissional nunca perca o contexto de para
//            quem está registrando a vacinação.
//
//            O profissional SEMPRE chega a esta tela vindo do
//            perfil do paciente — portanto este card é imutável.
//
//            Futuramente receberá uma URL de foto do paciente.
// ACESSO: Profissional
// ============================================================

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import type { PatientProfile } from '../../constants/MockData';

interface PatientContextCardProps {
  patient: PatientProfile;
}

export function PatientContextCard({ patient }: PatientContextCardProps) {
  return (
    <View style={styles.card}>
      {/* Linha superior: avatar + dados principais */}
      <View style={styles.topRow}>
        {/* Avatar com inicial */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{patient.name.charAt(0)}</Text>
        </View>

        {/* Dados textuais */}
        <View style={styles.textBlock}>
          <Text style={styles.name} numberOfLines={1}>{patient.name}</Text>
          <Text style={styles.age}>{patient.age} anos · {patient.bloodType}</Text>
          <View style={styles.planRow}>
            <Ionicons name="shield-checkmark-outline" size={12} color={Colors.PROFESSIONAL} />
            <Text style={styles.planText}>{patient.plan}</Text>
          </View>
        </View>
      </View>

      {/* Linha inferior: CPF · SUS */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="card-outline" size={13} color={Colors.NEUTRAL.MUTED} />
          <Text style={styles.infoLabel}>CPF</Text>
          <Text style={styles.infoValue}>{patient.cpf}</Text>
        </View>

        <View style={styles.infoDivider} />

        <View style={styles.infoItem}>
          <Ionicons name="id-card-outline" size={13} color={Colors.NEUTRAL.MUTED} />
          <Text style={styles.infoLabel}>Nº SUS</Text>
          <Text style={styles.infoValue}>{patient.sus}</Text>
        </View>
      </View>

      {/* Label "Paciente em atendimento" */}
      <View style={styles.badge}>
        <Ionicons name="person-circle-outline" size={12} color={Colors.PROFESSIONAL} />
        <Text style={styles.badgeText}>Paciente em atendimento</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.PROFESSIONAL_LIGHT,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: Colors.LIGHT_GREEN,
  },

  // Linha superior
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.PROFESSIONAL,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.NEUTRAL.WHITE,
  },
  textBlock: { flex: 1 },
  name: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.PROFESSIONAL,
    marginBottom: 2,
  },
  age: {
    fontSize: 13,
    color: Colors.NEUTRAL.MUTED,
    marginBottom: 4,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  planText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.PROFESSIONAL,
  },

  // Linha de info (CPF + SUS)
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.NEUTRAL.WHITE,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexWrap: 'wrap',
  },
  infoDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.BORDER,
    marginHorizontal: 8,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.NEUTRAL.MUTED,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.NEUTRAL.DARK_TEXT,
  },

  // Badge inferior
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.PROFESSIONAL,
  },
});
