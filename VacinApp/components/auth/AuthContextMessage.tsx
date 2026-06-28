// ============================================================
// COMPONENTE: AuthContextMessage
// DESCRIÇÃO: Caixa de mensagem contextual exibida abaixo do
//            seletor de rede nas telas de autenticação.
//            Informa ao usuário qual rede está selecionada.
//
//            Suporta variantes de cor:
//              - 'patient'      → roxo (paciente)
//              - 'professional' → verde (profissional)
//
// EXEMPLOS DE USO:
//   Paciente público:     "Você está acessando sua conta da Rede Pública de Saúde."
//   Paciente privado:     "Você está acessando sua conta da Rede Privada (Convênio)."
//   Profissional público: "Você está acessando sua conta da Rede Pública de Saúde."
//   Profissional privado: "Você está acessando sua conta da Rede Privada."
//
// ACESSO: Ambos (autenticação)
// ============================================================

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

// Tipo de nome de ícone do Ionicons
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// -------------------------------------------------------
// Interface: Propriedades do componente
// -------------------------------------------------------
interface AuthContextMessageProps {
  message: string;                        // Texto informativo exibido na caixa
  icon: IoniconsName;                     // Ícone Ionicons exibido à esquerda
  variant?: 'patient' | 'professional';  // Variante de cor (padrão: 'patient')
}

// -------------------------------------------------------
// COMPONENTE: AuthContextMessage
// Caixa informativa com ícone e texto sobre a rede selecionada
// -------------------------------------------------------
export function AuthContextMessage({
  message,
  icon,
  variant = 'patient',
}: AuthContextMessageProps) {

  // Define cores com base na variante
  const color  = variant === 'professional' ? Colors.PROFESSIONAL : Colors.PRIMARY;
  const bgColor = variant === 'professional'
    ? Colors.PROFESSIONAL_LIGHT
    : Colors.PRIMARY_LIGHT;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Ionicons name={icon} size={15} color={color} />
      <Text style={[styles.text, { color }]}>{message}</Text>
    </View>
  );
}

// -------------------------------------------------------
// ESTILOS DO COMPONENTE
// -------------------------------------------------------
const styles = StyleSheet.create({
  // === CONTAINER DA CAIXA ===
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
  },

  // === TEXTO INFORMATIVO ===
  text: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
});
