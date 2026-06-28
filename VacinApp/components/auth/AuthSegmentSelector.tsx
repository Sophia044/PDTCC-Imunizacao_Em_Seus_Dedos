// ============================================================
// COMPONENTE: AuthSegmentSelector
// DESCRIÇÃO: Seletor de segmento reutilizável para telas de
//            autenticação. Utilizado para escolha de rede
//            (Pública/Privada) tanto no login do paciente
//            quanto no login do profissional.
//
//            Suporta variantes de cor:
//              - 'patient'      → roxo (paciente)
//              - 'professional' → verde (profissional)
//
// PREPARADO PARA: Integração futura com API.
//                 O valor selecionado (option.value) representa
//                 o `networkType` a ser enviado no payload.
// ACESSO: Ambos (autenticação)
// ============================================================

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

// Tipo de nome de ícone do Ionicons
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// -------------------------------------------------------
// Interface: Opção individual do seletor
// -------------------------------------------------------
export interface SegmentOption {
  value: string;      // Valor enviado ao backend (ex: 'public', 'private', 'sus', 'private')
  label: string;      // Texto exibido no botão
  icon: IoniconsName; // Ícone Ionicons exibido ao lado do texto
}

// -------------------------------------------------------
// Interface: Propriedades do componente
// -------------------------------------------------------
interface AuthSegmentSelectorProps {
  options: SegmentOption[];           // Lista de opções do seletor
  selected: string;                   // Valor da opção atualmente selecionada
  onChange: (value: string) => void;  // Callback chamado ao trocar de opção
  variant?: 'patient' | 'professional'; // Variante de cor (padrão: 'patient')
}

// -------------------------------------------------------
// COMPONENTE: AuthSegmentSelector
// Seletor de segmento de 2+ opções com animação de estado
// -------------------------------------------------------
export function AuthSegmentSelector({
  options,
  selected,
  onChange,
  variant = 'patient',
}: AuthSegmentSelectorProps) {

  // Define a cor ativa com base na variante
  const activeColor = variant === 'professional'
    ? Colors.PROFESSIONAL
    : Colors.PRIMARY;

  return (
    <View style={styles.container}>
      {options.map((option, index) => {
        const isActive = selected === option.value;
        const isLast   = index === options.length - 1;

        return (
          <React.Fragment key={option.value}>
            {/* Botão de opção */}
            <TouchableOpacity
              style={[
                styles.option,
                isActive && { backgroundColor: activeColor },
              ]}
              onPress={() => onChange(option.value)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={option.label}
            >
              <Ionicons
                name={option.icon}
                size={16}
                color={isActive ? Colors.NEUTRAL.WHITE : Colors.NEUTRAL.MUTED}
              />
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {option.label}
              </Text>
              {/* Indicador de seleção (ponto branco) */}
              {isActive && <View style={styles.dot} />}
            </TouchableOpacity>

            {/* Divisor vertical entre opções (não exibir após a última) */}
            {!isLast && <View style={styles.divider} />}
          </React.Fragment>
        );
      })}
    </View>
  );
}

// -------------------------------------------------------
// ESTILOS DO COMPONENTE
// -------------------------------------------------------
const styles = StyleSheet.create({
  // === CONTAINER ===
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.CARD_BG,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.BORDER,
    overflow: 'hidden',
    marginBottom: 14,
  },

  // === OPÇÃO (botão) ===
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
  },

  // === TEXTO DA OPÇÃO ===
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.NEUTRAL.MUTED,
  },
  labelActive: {
    color: Colors.NEUTRAL.WHITE,
  },

  // === DIVISOR ENTRE OPÇÕES ===
  divider: {
    width: 1,
    backgroundColor: Colors.BORDER,
  },

  // === INDICADOR DE SELEÇÃO (ponto) ===
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
});
