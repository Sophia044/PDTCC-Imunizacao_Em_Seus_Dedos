import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { InputField } from '../../components/InputField';
import { PrimaryButton } from '../../components/PrimaryButton';

export default function LoginUnitScreen() {
  const [cnes, setCnes] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleCnes = (text: string) => {
    setCnes(text.replace(/\D/g, '').slice(0, 7));
  };

  const handleLogin = () => {
    const payload = {
      cnes,
      identifier,
      password,
      accessProfile: 'public_unit_triage',
    };

    console.log('Login Unidade de Saúde (payload pronto para API):', payload);
    router.replace('/(unit)/triage');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/(auth)/login')} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={Colors.PROFESSIONAL} />
        </TouchableOpacity>

        <Animated.View entering={FadeInDown.delay(80).duration(500)} style={styles.logoRow}>
          <View style={styles.logoCircle}>
            <Ionicons name="business" size={26} color={Colors.NEUTRAL.WHITE} />
          </View>
          <Text style={styles.logoText}>VacinApp</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(160).duration(550)}>
          <Text style={styles.title}>Unidade de Saúde</Text>
          <Text style={styles.subtitle}>Acesso institucional para triagem da rede pública.</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).duration(550)} style={styles.infoBox}>
          <Ionicons name="shield-checkmark-outline" size={18} color={Colors.PROFESSIONAL} />
          <Text style={styles.infoText}>
            Use credenciais vinculadas à UBS ou posto de saúde. No backend, o CNES identifica a unidade.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(320).duration(550)} style={styles.card}>
          <Text style={styles.sectionTitle}>Dados institucionais</Text>
          <InputField
            label="CNES da unidade"
            value={cnes}
            onChangeText={handleCnes}
            icon="business-outline"
            keyboardType="numeric"
            placeholder="0000000"
          />
          <InputField
            label="Matrícula ou e-mail"
            value={identifier}
            onChangeText={setIdentifier}
            icon="person-outline"
            autoCapitalize="none"
            placeholder="recepcao@ubs.gov.br"
          />
          <InputField
            label="Senha"
            value={password}
            onChangeText={setPassword}
            icon="lock-closed-outline"
            secureTextEntry
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(550)}>
          <PrimaryButton label="Entrar na triagem" onPress={handleLogin} variant="professional" />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.NEUTRAL.WHITE },
  content: { paddingHorizontal: 24, paddingTop: 54, paddingBottom: 40 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.PROFESSIONAL_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.PROFESSIONAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { fontSize: 22, fontWeight: '800', color: Colors.PROFESSIONAL },
  title: { fontSize: 28, fontWeight: '800', color: Colors.PROFESSIONAL, marginBottom: 6 },
  subtitle: { fontSize: 15, color: Colors.NEUTRAL.MUTED, lineHeight: 22, marginBottom: 18 },
  infoBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Colors.PROFESSIONAL_LIGHT,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GREEN,
    padding: 14,
    marginBottom: 16,
  },
  infoText: { flex: 1, fontSize: 13, color: Colors.PROFESSIONAL, lineHeight: 19, fontWeight: '600' },
  card: {
    backgroundColor: Colors.NEUTRAL.WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.NEUTRAL.MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
});
