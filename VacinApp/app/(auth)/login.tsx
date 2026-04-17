import React, { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { InputField } from '../../components/InputField';
import { PrimaryButton } from '../../components/PrimaryButton';

export default function LoginScreen() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Arco decorativo no topo */}
        <View style={styles.arc}>
          <View style={styles.arcInner} />
        </View>

        {/* Logo */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.logoRow}>
          <View style={styles.logoCircle}>
            <Ionicons name="medical" size={28} color={Colors.NEUTRAL.WHITE} />
          </View>
          <Text style={styles.logoText}>VacinApp</Text>
        </Animated.View>

        {/* Título */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <Text style={styles.title}>Bem-vindo de volta</Text>
          <Text style={styles.subtitle}>Acesse seu histórico de imunização</Text>
        </Animated.View>

        {/* Campos */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.form}>
          <InputField label="E-mail" value={email} onChangeText={setEmail} icon="mail-outline" keyboardType="email-address" autoCapitalize="none" />
          <InputField label="Senha" value={password} onChangeText={setPassword} icon="lock-closed-outline" secureTextEntry />
          <TouchableOpacity style={styles.forgot}>
            <Text style={styles.forgotText}>Esqueceu a senha?</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Botão principal */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)}>
          <PrimaryButton label="Entrar" onPress={() => router.replace('/(patient)/home')} />
        </Animated.View>

        {/* Separador */}
        <Animated.View entering={FadeInDown.delay(500).duration(600)} style={styles.separatorRow}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>ou continue como</Text>
          <View style={styles.separatorLine} />
        </Animated.View>

        {/* Acesso rápido por perfil */}
        <Animated.View entering={FadeInDown.delay(600).duration(600)} style={styles.profileBtns}>
          <TouchableOpacity style={styles.patientBtn} onPress={() => router.replace('/(patient)/home')}>
            <Ionicons name="person" size={20} color={Colors.PRIMARY} />
            <Text style={styles.patientBtnText}>Entrar como Paciente</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.professionalBtn} onPress={() => router.replace('/(professional)/home')}>
            <Ionicons name="medkit" size={20} color={Colors.NEUTRAL.WHITE} />
            <Text style={styles.professionalBtnText}>Entrar como Profissional de Saúde</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Cadastro */}
        <Animated.View entering={FadeInDown.delay(700).duration(600)} style={styles.registerRow}>
          <Text style={styles.registerText}>Não tem conta? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register-patient')}>
            <Text style={styles.registerLink}>Cadastre-se</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll:            { flex: 1, backgroundColor: Colors.NEUTRAL.WHITE },
  content:           { paddingHorizontal: 24, paddingBottom: 40 },
  arc:               { height: 120, marginHorizontal: -24, overflow: 'hidden', marginBottom: 24 },
  arcInner:          { height: 200, marginTop: -80, backgroundColor: Colors.BACKGROUND, borderRadius: 9999 },
  logoRow:           { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 28 },
  logoCircle:        { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.PRIMARY, alignItems: 'center', justifyContent: 'center' },
  logoText:          { fontSize: 22, fontWeight: '800', color: Colors.PRIMARY },
  title:             { fontSize: 28, fontWeight: '800', color: Colors.PRIMARY, marginBottom: 6 },
  subtitle:          { fontSize: 15, color: Colors.NEUTRAL.MUTED, marginBottom: 28 },
  form:              { marginBottom: 18 },
  forgot:            { alignSelf: 'flex-end', marginTop: -6 },
  forgotText:        { fontSize: 13, color: Colors.SECONDARY, fontWeight: '600' },
  separatorRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 20 },
  separatorLine:     { flex: 1, height: 1, backgroundColor: Colors.BORDER },
  separatorText:     { fontSize: 13, color: Colors.NEUTRAL.MUTED },
  profileBtns:       { gap: 12, marginBottom: 28 },
  patientBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.PRIMARY },
  patientBtnText:    { fontSize: 15, fontWeight: '700', color: Colors.PRIMARY },
  professionalBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: 14, backgroundColor: Colors.PROFESSIONAL },
  professionalBtnText: { fontSize: 15, fontWeight: '700', color: Colors.NEUTRAL.WHITE },
  registerRow:       { flexDirection: 'row', justifyContent: 'center' },
  registerText:      { fontSize: 14, color: Colors.NEUTRAL.MUTED },
  registerLink:      { fontSize: 14, fontWeight: '700', color: Colors.PRIMARY },
});
