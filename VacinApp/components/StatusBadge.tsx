import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { VaccineStatus } from '../constants/MockData';

interface StatusBadgeProps {
  status: VaccineStatus;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG = {
  complete: { label: 'Completa', bg: Colors.STATUS.COMPLETE, color: Colors.NEUTRAL.WHITE },
  pending:  { label: 'Pendente', bg: Colors.STATUS.PENDING,  color: Colors.NEUTRAL.WHITE },
  overdue:  { label: 'Atrasada', bg: Colors.STATUS.OVERDUE,  color: Colors.NEUTRAL.WHITE },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  const isSmall = size === 'sm';
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }, isSmall && styles.badgeSm]}>
      <Text style={[styles.label, { color: cfg.color }, isSmall && styles.labelSm]}>
        {cfg.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge:   { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeSm: { paddingHorizontal: 8, paddingVertical: 2 },
  label:   { fontSize: 12, fontWeight: '600' },
  labelSm: { fontSize: 10 },
});
