// ============================================================
// COMPONENTE: AppointmentCard
// DESCRIÇÃO: Card de item da agenda do dia, usado no dashboard
//            da Rede Privada. Exibe horário, nome do paciente,
//            vacina prevista, convênio e status colorido.
//
//            Preparado para IDs: onPress recebe patientId.
// ACESSO: Profissional (Rede Privada)
// ============================================================

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import type { AppointmentItem, AppointmentStatus } from '../../constants/MockData';

// ── Configuração visual por status ────────────────────────
const STATUS_CONFIG: Record<AppointmentStatus, { label: string; color: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = {
  scheduled: { label: 'Agendado',   color: Colors.STATUS.PENDING,   icon: 'time-outline'            },
  done:      { label: 'Realizado',  color: Colors.STATUS.COMPLETE,  icon: 'checkmark-circle-outline' },
  missed:    { label: 'Faltou',     color: Colors.STATUS.OVERDUE,   icon: 'close-circle-outline'    },
};

interface AppointmentCardProps {
  appointment: AppointmentItem;
  onPress: (patientId: string) => void; // Preparado para ID
}

export function AppointmentCard({ appointment, onPress }: AppointmentCardProps) {
  const cfg = STATUS_CONFIG[appointment.status];
  const isDone = appointment.status === 'done';

  return (
    <TouchableOpacity
      style={[styles.card, isDone && styles.cardDone]}
      onPress={() => onPress(appointment.patientId)}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Agendamento de ${appointment.patientName}`}
    >
      {/* Coluna de horário */}
      <View style={styles.timeCol}>
        <Text style={[styles.time, isDone && styles.textDone]}>{appointment.time}</Text>
        {/* Linha vertical decorativa */}
        <View style={[styles.timeLine, { backgroundColor: cfg.color }]} />
      </View>

      {/* Informações principais */}
      <View style={styles.body}>
        <Text style={[styles.patientName, isDone && styles.textDone]} numberOfLines={1}>
          {appointment.patientName}
        </Text>

        <Text style={styles.vaccineLabel} numberOfLines={1}>
          <Ionicons name="medical-outline" size={12} color={Colors.NEUTRAL.MUTED} />{' '}
          {appointment.vaccine}
        </Text>

        <Text style={styles.planLabel} numberOfLines={1}>
          <Ionicons name="shield-checkmark-outline" size={12} color={Colors.NEUTRAL.MUTED} />{' '}
          {appointment.plan}
        </Text>
      </View>

      {/* Status badge + seta */}
      <View style={styles.rightCol}>
        <View style={[styles.statusBadge, { backgroundColor: cfg.color + '18' }]}>
          <Ionicons name={cfg.icon} size={12} color={cfg.color} />
          <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={Colors.NEUTRAL.MUTED} />
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
    borderLeftWidth: 3,
    borderLeftColor: Colors.PROFESSIONAL,
  },
  cardDone: {
    opacity: 0.7,
    borderLeftColor: Colors.STATUS.COMPLETE,
  },

  // Coluna de horário
  timeCol: {
    alignItems: 'center',
    marginRight: 12,
    width: 46,
  },
  time: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.PROFESSIONAL,
  },
  timeLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
    minHeight: 20,
    borderRadius: 1,
    opacity: 0.4,
  },
  textDone: {
    color: Colors.NEUTRAL.MUTED,
  },

  // Corpo
  body: { flex: 1 },
  patientName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.NEUTRAL.DARK_TEXT,
    marginBottom: 3,
  },
  vaccineLabel: {
    fontSize: 12,
    color: Colors.NEUTRAL.MUTED,
    marginBottom: 2,
  },
  planLabel: {
    fontSize: 11,
    color: Colors.NEUTRAL.MUTED,
  },

  // Direita
  rightCol: {
    alignItems: 'flex-end',
    gap: 8,
    marginLeft: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
