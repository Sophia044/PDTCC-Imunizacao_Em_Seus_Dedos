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

const ESPECIALIDADES = [
  'Médico/a Clínico Geral', 'Enfermeiro/a', 'Pediatra',
  'Ginecologista/Obstetra', 'Geriatra', 'Médico/a de Família',
];

export default function RegisterProfessionalScreen() {
  const [name, setName]       = useState('');
  const [crm, setCrm]         = useState('');
  const [spec, setSpec]       = useState('');
  const [unit, setUnit]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showSpecs, setShowSpecs] = useState(false);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Back */}
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.PROFESSIONAL} />
        </TouchableOpacity>

        {/* Badge profissional */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.badge}>
          <Ionicons name="shield-checkmark" size={20} color={Colors.NEUTRAL.WHITE} />
          <Text style={styles.badgeText}>Conta Profissional</Text>
        </Animated.View>

        {/* Título */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <Text style={styles.title}>Criar conta{'\n'}Profissional</Text>
          <Text style={styles.subtitle}>Para profissionais de saúde habilitados</Text>
        </Animated.View>

        {/* Formulário — Dados Profissionais */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.card}>
          <Text style={styles.sectionTitle}>Dados Profissionais</Text>
          <InputField label="Nome completo" value={name} onChangeText={setName} icon="person-outline" />
          <InputField label="CRM / COREN / Nº de Registro" value={crm} onChangeText={setCrm} icon="id-card-outline" keyboardType="numeric" />

          {/* Dropdown de especialidade */}
          <Text style={styles.dropLabel}>Especialidade</Text>
          <TouchableOpacity style={styles.dropBtn} onPress={() => setShowSpecs(s => !s)}>
            <Ionicons name="medkit-outline" size={20} color={Colors.NEUTRAL.MUTED} />
            <Text style={[styles.dropText, !spec && { color: Colors.NEUTRAL.MUTED }]}>
              {spec || 'Selecione a especialidade'}
            </Text>
            <Ionicons name={showSpecs ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.NEUTRAL.MUTED} />
          </TouchableOpacity>
          {showSpecs && (
            <View style={styles.dropList}>
              {ESPECIALIDADES.map(e => (
                <TouchableOpacity key={e} style={styles.dropItem} onPress={() => { setSpec(e); setShowSpecs(false); }}>
                  <Text style={[styles.dropItemText, spec === e && { color: Colors.PROFESSIONAL, fontWeight: '700' }]}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <InputField label="Unidade de saúde vinculada" value={unit} onChangeText={setUnit} icon="business-outline" />
        </Animated.View>

        {/* Formulário — Acesso */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.card}>
          <Text style={styles.sectionTitle}>Acesso</Text>
          <InputField label="E-mail institucional" value={email} onChangeText={setEmail} icon="mail-outline" keyboardType="email-address" autoCapitalize="none" />
          <InputField label="Senha" value={password} onChangeText={setPassword} icon="lock-closed-outline" secureTextEntry />
        </Animated.View>

        {/* Aviso */}
        <Animated.View entering={FadeInDown.delay(500).duration(600)} style={styles.notice}>
          <Ionicons name="information-circle" size={18} color={Colors.PROFESSIONAL} />
          <Text style={styles.noticeText}>O cadastro profissional será verificado pela equipe VacinApp antes da liberação do acesso.</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600).duration(600)}>
          <PrimaryButton label="Criar conta Profissional" onPress={() => router.replace('/(professional)/home')} variant="professional" />
        </Animated.View>

        <TouchableOpacity style={styles.loginRow} onPress={() => router.back()}>
          <Text style={styles.loginText}>Já tem conta? <Text style={styles.loginLink}>Entrar</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll:        { flex: 1, backgroundColor: Colors.NEUTRAL.WHITE },
  content:       { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 40 },
  back:          { marginBottom: 20 },
  badge:         { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', backgroundColor: Colors.PROFESSIONAL, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginBottom: 16 },
  badgeText:     { color: Colors.NEUTRAL.WHITE, fontWeight: '700', fontSize: 13 },
  title:         { fontSize: 28, fontWeight: '800', color: Colors.PROFESSIONAL, lineHeight: 34, marginBottom: 6 },
  subtitle:      { fontSize: 14, color: Colors.NEUTRAL.MUTED, marginBottom: 20 },
  card:          { backgroundColor: Colors.PROFESSIONAL_LIGHT, borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionTitle:  { fontSize: 13, fontWeight: '700', color: Colors.NEUTRAL.MUTED, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 },
  dropLabel:     { fontSize: 13, fontWeight: '600', color: Colors.NEUTRAL.DARK_TEXT, marginBottom: 6 },
  dropBtn:       { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.NEUTRAL.WHITE, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.BORDER, paddingHorizontal: 14, height: 52, marginBottom: 14 },
  dropText:      { flex: 1, fontSize: 15, color: Colors.NEUTRAL.DARK_TEXT },
  dropList:      { backgroundColor: Colors.NEUTRAL.WHITE, borderRadius: 12, borderWidth: 1, borderColor: Colors.BORDER, marginBottom: 14, overflow: 'hidden' },
  dropItem:      { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.BORDER },
  dropItemText:  { fontSize: 14, color: Colors.NEUTRAL.DARK_TEXT },
  notice:        { flexDirection: 'row', gap: 8, alignItems: 'flex-start', backgroundColor: Colors.PROFESSIONAL_LIGHT, borderRadius: 12, padding: 12, marginBottom: 16 },
  noticeText:    { flex: 1, fontSize: 12, color: Colors.PROFESSIONAL, lineHeight: 18 },
  loginRow:      { alignItems: 'center', marginTop: 16 },
  loginText:     { fontSize: 14, color: Colors.NEUTRAL.MUTED },
  loginLink:     { color: Colors.PROFESSIONAL, fontWeight: '700' },
});
