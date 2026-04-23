// ============================================================
// COMPONENTE: InputField (Campo de Entrada de Texto)
// DESCRIÇÃO: Campo de texto reutilizável com ícone, label,
//            borda de foco animada e suporte a senhas (toggle visibilidade).
//            Utilizado em todos os formulários do app.
// ACESSO: Ambos
// ============================================================

// --- Bibliotecas principais do React ---
import React, { useState } from 'react';

// --- Componentes de layout e interação do React Native ---
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// --- Ícones vetoriais da biblioteca Ionicons ---
import { Ionicons } from '@expo/vector-icons';

// --- Paleta de cores oficial do VacinApp ---
import { Colors } from '../constants/Colors';

// Tipo para garantir que apenas nomes válidos do Ionicons sejam usados
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// -------------------------------------------------------
// Interface: Propriedades do componente InputField
// -------------------------------------------------------
interface InputFieldProps {
  label: string;                                          // Texto do label acima do campo
  value: string;                                         // Valor atual do campo
  onChangeText: (t: string) => void;                    // Função chamada ao digitar
  icon?: IoniconsName;                                   // Ícone à esquerda (opcional)
  placeholder?: string;                                  // Texto de dica (placeholder)
  secureTextEntry?: boolean;                             // Oculta texto (senhas)
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad'; // Tipo de teclado
  autoCapitalize?: 'none' | 'sentences' | 'words';     // Capitalização automática
}

// -------------------------------------------------------
// COMPONENTE: InputField
// Campo de texto com label, ícone e bordas animadas ao focar
// -------------------------------------------------------
export function InputField({
  label, value, onChangeText, icon, placeholder,
  secureTextEntry = false, keyboardType = 'default', autoCapitalize = 'sentences',
}: InputFieldProps) {
  const [focused, setFocused] = useState(false); // Controla se o campo está com foco (borda colorida)
  const [hidden, setHidden]   = useState(secureTextEntry); // Controla visibilidade do texto (senha)

  return (
    <View style={styles.wrapper}>
      {/* Label acima do campo */}
      <Text style={styles.label}>{label}</Text>

      {/* Container do campo — borda muda de cor ao focar */}
      <View style={[styles.container, focused && styles.containerFocused]}>
        {/* Ícone à esquerda (exibido somente se fornecido) */}
        {icon && <Ionicons name={icon} size={20} color={focused ? Colors.PRIMARY : Colors.NEUTRAL.MUTED} style={styles.icon} />}

        {/* Campo de texto em si */}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder ?? label}      // Usa o label como placeholder se não fornecido
          placeholderTextColor={Colors.NEUTRAL.MUTED}
          secureTextEntry={hidden}               // Oculta texto quando 'hidden' é true
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocused(true)}       // Ativa o estado de foco
          onBlur={() => setFocused(false)}       // Desativa o estado de foco
        />

        {/* Botão de olho — exibido apenas em campos de senha (secureTextEntry=true) */}
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setHidden(h => !h)} hitSlop={8}>
            <Ionicons name={hidden ? 'eye-off' : 'eye'} size={20} color={Colors.NEUTRAL.MUTED} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// -------------------------------------------------------
// ESTILOS DO COMPONENTE
// -------------------------------------------------------
const styles = StyleSheet.create({
  // === WRAPPER: Espaço ao redor do campo ===
  wrapper:          { marginBottom: 14 },

  // === LABEL ACIMA DO CAMPO ===
  label:            { fontSize: 13, fontWeight: '600', color: Colors.NEUTRAL.DARK_TEXT, marginBottom: 6 },

  // === CONTAINER DO CAMPO ===
  container:        { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.CARD_BG, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.BORDER, paddingHorizontal: 14, height: 52 },
  containerFocused: { borderColor: Colors.PRIMARY }, // Borda roxa quando o campo está ativo

  // === ÍCONE E INPUT ===
  icon:             { marginRight: 10 },
  input:            { flex: 1, fontSize: 15, color: Colors.NEUTRAL.DARK_TEXT },
});
