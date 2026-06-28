// ============================================================
// COMPONENTE: StatCard
// DESCRIÇÃO: Card de estatística do dashboard do profissional.
//            Exibe ícone colorido, valor numérico e rótulo.
//            Usado no dashboard da Rede Pública e Rede Privada.
// ACESSO: Profissional
// ============================================================

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface StatCardProps {
  icon: IoniconsName;
  value: string | number;
  label: string;
  color: string;
  alert?: boolean; // Destaca com borda vermelha quando true (ex: estoque baixo)
}

export function StatCard({ icon, value, label, color, alert = false }: StatCardProps) {
  return (
    <View style={[styles.card, alert && styles.cardAlert]}>
      <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={22} color={alert ? Colors.STATUS.OVERDUE : color} />
      </View>
      <Text style={[styles.value, { color: alert ? Colors.STATUS.OVERDUE : color }]}>
        {value}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.NEUTRAL.WHITE,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardAlert: {
    borderWidth: 1.5,
    borderColor: Colors.STATUS.OVERDUE + '50',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
  },
  label: {
    fontSize: 10,
    color: Colors.NEUTRAL.MUTED,
    textAlign: 'center',
    marginTop: 3,
    fontWeight: '500',
    lineHeight: 14,
  },
});
