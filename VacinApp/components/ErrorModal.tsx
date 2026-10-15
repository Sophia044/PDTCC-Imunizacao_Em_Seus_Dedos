// ============================================================
// COMPONENTE: ErrorModal
// DESCRIÇÃO: Pop-up de erro exibido no centro da tela, com
//            título, mensagem e botão "Entendi". Usa o <Modal>
//            do React Native, então funciona igual no celular
//            e na web (onde Alert.alert não exibe nada).
// ACESSO: Ambos
// ============================================================

import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface ErrorModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export function ErrorModal({ visible, title, message, onClose }: ErrorModalProps) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* Card central (o Pressable interno impede fechar ao tocar no card) */}
        <Pressable onPress={() => {}} style={styles.card} accessibilityViewIsModal>
          <View style={styles.iconCircle}>
            <Ionicons name="alert-circle" size={56} color={Colors.STATUS.OVERDUE} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.divider} />

          <Pressable
            style={styles.closeBtn}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Fechar aviso de erro"
          >
            <Text style={styles.closeBtnText}>Entendi</Text>
          </Pressable>
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
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.STATUS.OVERDUE + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.STATUS.OVERDUE,
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: Colors.NEUTRAL.DARK_TEXT,
    textAlign: 'center',
    lineHeight: 22,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.BORDER,
    marginVertical: 20,
  },
  closeBtn: {
    backgroundColor: Colors.STATUS.OVERDUE,
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
