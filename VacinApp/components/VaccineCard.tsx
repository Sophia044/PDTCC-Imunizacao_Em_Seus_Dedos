import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Vaccine } from '../constants/MockData';
import { StatusBadge } from './StatusBadge';

const STATUS_ICON: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  complete: 'checkmark-circle',
  pending:  'time',
  overdue:  'alert-circle',
};

interface VaccineCardProps {
  vaccine: Vaccine;
  horizontal?: boolean;
}

export function VaccineCard({ vaccine, horizontal = false }: VaccineCardProps) {
  const date = new Date(vaccine.date).toLocaleDateString('pt-BR');

  if (horizontal) {
    return (
      <View style={styles.horizontal}>
        <Ionicons name={STATUS_ICON[vaccine.status]} size={28} color={Colors.STATUS[vaccine.status.toUpperCase() as 'COMPLETE' | 'PENDING' | 'OVERDUE']} />
        <View style={styles.hBody}>
          <Text style={styles.name} numberOfLines={1}>{vaccine.name}</Text>
          <Text style={styles.dose}>{vaccine.dose}</Text>
          <Text style={styles.date}>{date}</Text>
        </View>
        <StatusBadge status={vaccine.status} size="sm" />
      </View>
    );
  }

  return (
    <View style={styles.vertical}>
      <View style={styles.vLeft}>
        <Ionicons name={STATUS_ICON[vaccine.status]} size={22} color={Colors.STATUS[vaccine.status.toUpperCase() as 'COMPLETE' | 'PENDING' | 'OVERDUE']} />
        <View style={styles.vBody}>
          <Text style={styles.name}>{vaccine.name}</Text>
          <Text style={styles.dose}>{vaccine.dose}{vaccine.location ? ` · ${vaccine.location}` : ''}</Text>
        </View>
      </View>
      <View style={styles.vRight}>
        <StatusBadge status={vaccine.status} size="sm" />
        <Text style={styles.date}>{date}</Text>
      </View>
    </View>
  );
}

const shadow = { shadowColor: Colors.PRIMARY, shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4 };

const styles = StyleSheet.create({
  horizontal: { width: 190, backgroundColor: Colors.NEUTRAL.WHITE, borderRadius: 16, padding: 16, marginRight: 12, ...shadow },
  hBody:      { flex: 1, marginVertical: 8 },
  vertical:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.NEUTRAL.WHITE, borderRadius: 14, padding: 14, marginBottom: 10, ...shadow },
  vLeft:      { flexDirection: 'row', alignItems: 'center', flex: 1 },
  vBody:      { marginLeft: 10, flex: 1 },
  vRight:     { alignItems: 'flex-end', gap: 4 },
  name:       { fontSize: 14, fontWeight: '700', color: Colors.NEUTRAL.DARK_TEXT },
  dose:       { fontSize: 12, color: Colors.NEUTRAL.MUTED, marginTop: 2 },
  date:       { fontSize: 11, color: Colors.NEUTRAL.MUTED, marginTop: 4 },
});
