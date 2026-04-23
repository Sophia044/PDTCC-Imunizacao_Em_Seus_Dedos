// ============================================================
// COMPONENTE: VaccineCard (Card de Vacina)
// DESCRIÇÃO: Exibe as informações de uma vacina em dois modos:
//            - Horizontal: card compacto para scroll lateral (próximas vacinas)
//            - Vertical: card completo para listas verticais (histórico)
//            Inclui ícone de status, nome, dose, local e data.
// ACESSO: Paciente
// ============================================================

// --- Bibliotecas principais do React ---
import React from 'react';

// --- Componentes de layout do React Native ---
import { StyleSheet, Text, View } from 'react-native';

// --- Ícones vetoriais da biblioteca Ionicons ---
import { Ionicons } from '@expo/vector-icons';

// --- Paleta de cores oficial do VacinApp ---
import { Colors } from '../constants/Colors';

// --- Tipo de dados da vacina ---
import { Vaccine } from '../constants/MockData';

// --- Componente interno: badge de status ---
import { StatusBadge } from './StatusBadge';

// -------------------------------------------------------
// MAPA DE ÍCONES: Associa cada status ao ícone correspondente
// -------------------------------------------------------
const STATUS_ICON: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  complete: 'checkmark-circle', // Ícone de check (verde)
  pending:  'time',             // Ícone de relógio (laranja)
  overdue:  'alert-circle',     // Ícone de alerta (vermelho)
};

// -------------------------------------------------------
// Interface: Propriedades do componente VaccineCard
// -------------------------------------------------------
interface VaccineCardProps {
  vaccine: Vaccine;       // Dados completos da vacina
  horizontal?: boolean;   // Se true, exibe no modo compacto horizontal
}

// -------------------------------------------------------
// COMPONENTE: VaccineCard
// Renderiza o card no modo horizontal ou vertical conforme a prop
// -------------------------------------------------------
export function VaccineCard({ vaccine, horizontal = false }: VaccineCardProps) {
  // Formata a data da vacina no padrão brasileiro (ex: "15/01/2024")
  const date = new Date(vaccine.date).toLocaleDateString('pt-BR');

  // -------------------------------------------------------
  // MODO HORIZONTAL: Card compacto (largura fixa, usado no scroll lateral)
  // -------------------------------------------------------
  if (horizontal) {
    return (
      <View style={styles.horizontal}>
        {/* Ícone do status com cor correspondente */}
        <Ionicons
          name={STATUS_ICON[vaccine.status]}
          size={28}
          color={Colors.STATUS[vaccine.status.toUpperCase() as 'COMPLETE' | 'PENDING' | 'OVERDUE']}
        />
        {/* Conteúdo central: nome, dose e data */}
        <View style={styles.hBody}>
          <Text style={styles.name} numberOfLines={1}>{vaccine.name}</Text>
          <Text style={styles.dose}>{vaccine.dose}</Text>
          <Text style={styles.date}>{date}</Text>
        </View>
        {/* Badge de status no canto inferior */}
        <StatusBadge status={vaccine.status} size="sm" />
      </View>
    );
  }

  // -------------------------------------------------------
  // MODO VERTICAL: Card completo (usado na lista de histórico)
  // -------------------------------------------------------
  return (
    <View style={styles.vertical}>
      {/* Lado esquerdo: ícone + informações da vacina */}
      <View style={styles.vLeft}>
        <Ionicons
          name={STATUS_ICON[vaccine.status]}
          size={22}
          color={Colors.STATUS[vaccine.status.toUpperCase() as 'COMPLETE' | 'PENDING' | 'OVERDUE']}
        />
        <View style={styles.vBody}>
          {/* Nome da vacina */}
          <Text style={styles.name}>{vaccine.name}</Text>
          {/* Dose e local (se disponível) separados por "·" */}
          <Text style={styles.dose}>{vaccine.dose}{vaccine.location ? ` · ${vaccine.location}` : ''}</Text>
        </View>
      </View>
      {/* Lado direito: badge de status + data */}
      <View style={styles.vRight}>
        <StatusBadge status={vaccine.status} size="sm" />
        <Text style={styles.date}>{date}</Text>
      </View>
    </View>
  );
}

// Sombra reutilizável para os cards
const shadow = { shadowColor: Colors.PRIMARY, shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4 };

// -------------------------------------------------------
// ESTILOS DO COMPONENTE
// -------------------------------------------------------
const styles = StyleSheet.create({
  // === MODO HORIZONTAL ===
  horizontal: { width: 190, backgroundColor: Colors.NEUTRAL.WHITE, borderRadius: 16, padding: 16, marginRight: 12, ...shadow },
  hBody:      { flex: 1, marginVertical: 8 },

  // === MODO VERTICAL ===
  vertical:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.NEUTRAL.WHITE, borderRadius: 14, padding: 14, marginBottom: 10, ...shadow },
  vLeft:      { flexDirection: 'row', alignItems: 'center', flex: 1 },
  vBody:      { marginLeft: 10, flex: 1 },
  vRight:     { alignItems: 'flex-end', gap: 4 },

  // === TEXTOS COMUNS ===
  name:       { fontSize: 14, fontWeight: '700', color: Colors.NEUTRAL.DARK_TEXT },
  dose:       { fontSize: 12, color: Colors.NEUTRAL.MUTED, marginTop: 2 },
  date:       { fontSize: 11, color: Colors.NEUTRAL.MUTED, marginTop: 4 },
});
