// ============================================================
// COMPONENTE: SuccessModal
// DESCRIÇÃO: Modal de confirmação animado exibido após o
//            registro bem-sucedido de uma vacinação.
//            Usa Reanimated para animação de entrada com
//            escala + fade. Dispensado automaticamente após
//            3 segundos ou ao pressionar "Fechar".
// ACESSO: Profissional
// ============================================================

import React, { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface SuccessModalProps {
  visible: boolean;
  onDismiss: () => void;
  patientName?: string; // Nome do paciente para personalizar a mensagem
}

export function SuccessModal({ visible, onDismiss, patientName }: SuccessModalProps) {
  // Animações
  const scale   = useSharedValue(0.5);
  const opacity = useSharedValue(0);
  const iconScale = useSharedValue(0);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  // Dispara as animações ao abrir o modal
  useEffect(() => {
    if (visible) {
      // Container: fade + escala
      opacity.value  = withTiming(1, { duration: 280 });
      scale.value    = withSpring(1, { damping: 14, stiffness: 120 });
      // Ícone: animação de "pop" após o container aparecer
      iconScale.value = withDelay(150, withSequence(
        withSpring(1.2, { damping: 8, stiffness: 200 }),
        withSpring(1.0, { damping: 10 }),
      ));
    } else {
      // Reset para a próxima exibição
      scale.value    = 0.5;
      opacity.value  = 0;
      iconScale.value = 0;
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      {/* Overlay escurecido */}
      <Pressable style={styles.overlay} onPress={onDismiss}>
        {/* Card central animado (bloqueia o press do overlay) */}
        <Pressable onPress={() => {}} accessibilityViewIsModal>
          <Animated.View style={[styles.card, containerStyle]}>

            {/* Círculo do ícone animado */}
            <Animated.View style={[styles.iconCircle, iconStyle]}>
              <Ionicons
                name="checkmark-circle"
                size={64}
                color={Colors.PROFESSIONAL}
              />
            </Animated.View>

            {/* Título */}
            <Text style={styles.title}>Vacinação Registrada!</Text>

            {/* Mensagem */}
            <Text style={styles.message}>
              {patientName
                ? `A vacinação de ${patientName} foi registrada com sucesso.`
                : 'Vacinação registrada com sucesso.'}
            </Text>

            <Text style={styles.subMessage}>
              O histórico do paciente será atualizado automaticamente.
            </Text>

            {/* Linha decorativa */}
            <View style={styles.divider} />

            {/* Botão fechar */}
            <Pressable
              style={styles.closeBtn}
              onPress={onDismiss}
              accessibilityRole="button"
              accessibilityLabel="Fechar"
            >
              <Text style={styles.closeBtnText}>Fechar</Text>
            </Pressable>

          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: Colors.NEUTRAL.WHITE,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.PROFESSIONAL_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.LIGHT_GREEN,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.PROFESSIONAL,
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: Colors.NEUTRAL.DARK_TEXT,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  subMessage: {
    fontSize: 13,
    color: Colors.NEUTRAL.MUTED,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 8,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.BORDER,
    marginVertical: 20,
  },
  closeBtn: {
    backgroundColor: Colors.PROFESSIONAL,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.NEUTRAL.WHITE,
    letterSpacing: 0.3,
  },
});
