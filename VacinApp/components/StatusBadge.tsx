// ============================================================
// COMPONENTE: StatusBadge (Indicador de Status da Vacina)
// DESCRIÇÃO: Badge colorido que exibe o status de uma vacina.
//            Três estados possíveis: Completa (verde), Pendente
//            (laranja) e Atrasada (vermelho). Suporta dois tamanhos.
// ACESSO: Ambos
// ============================================================

// --- Bibliotecas principais do React ---
import React from 'react';

// --- Componentes de layout do React Native ---
import { StyleSheet, Text, View } from 'react-native';

// --- Paleta de cores oficial do VacinApp ---
import { Colors } from '../constants/Colors';

// --- Tipo de status importado dos dados mockados ---
import { VaccineStatus } from '../constants/MockData';

// -------------------------------------------------------
// Interface: Propriedades do componente StatusBadge
// -------------------------------------------------------
interface StatusBadgeProps {
  status: VaccineStatus; // 'complete' | 'pending' | 'overdue'
  size?: 'sm' | 'md';   // Tamanho do badge: pequeno ou médio (padrão: médio)
}

// -------------------------------------------------------
// MAPA DE CONFIGURAÇÃO: Define cor e texto de cada status
// -------------------------------------------------------
const STATUS_CONFIG = {
  complete: { label: 'Completa', bg: Colors.STATUS.COMPLETE, color: Colors.NEUTRAL.WHITE }, // Verde
  pending:  { label: 'Pendente', bg: Colors.STATUS.PENDING,  color: Colors.NEUTRAL.WHITE }, // Laranja
  overdue:  { label: 'Atrasada', bg: Colors.STATUS.OVERDUE,  color: Colors.NEUTRAL.WHITE }, // Vermelho
};

// -------------------------------------------------------
// COMPONENTE: StatusBadge
// Exibe a pílula colorida com o rótulo do status
// -------------------------------------------------------
export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status]; // Configuração do status atual
  const isSmall = size === 'sm';     // Verifica se deve aplicar tamanho reduzido

  return (
    // Container da pílula colorida
    <View style={[styles.badge, { backgroundColor: cfg.bg }, isSmall && styles.badgeSm]}>
      {/* Texto do status (ex: "Completa", "Pendente") */}
      <Text style={[styles.label, { color: cfg.color }, isSmall && styles.labelSm]}>
        {cfg.label}
      </Text>
    </View>
  );
}

// -------------------------------------------------------
// ESTILOS DO COMPONENTE
// -------------------------------------------------------
const styles = StyleSheet.create({
  // === BADGE TAMANHO MÉDIO (padrão) ===
  badge:   { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },

  // === BADGE TAMANHO PEQUENO ===
  badgeSm: { paddingHorizontal: 8, paddingVertical: 2 },

  // === TEXTOS ===
  label:   { fontSize: 12, fontWeight: '600' },
  labelSm: { fontSize: 10 },  // Texto menor para o badge pequeno
});
