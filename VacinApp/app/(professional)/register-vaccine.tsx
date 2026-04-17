import React, { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TouchableOpacity, View, Alert,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { InputField } from '../../components/InputField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { availableVaccines, mockPatients } from '../../constants/MockData';

export default function RegisterVaccineScreen() {
  const [patient,  setPatient]  = useState('');
  const [vaccine,  setVaccine]  = useState('');
  const [dose,     setDose]     = useState('');
  const [date,     setDate]     = useState('');
  const [lot,      setLot]      = useState('');
  const [notes,    setNotes]    = useState('');
  const [showVac,  setShowVac]  = useState(false);
  const [showPat,  setShowPat]  = useState(false);
  const [success,  setSuccess]  = useState(false);

  const handleDate = (t: string) => {
    const d = t.replace(/\D/g, '').slice(0, 8);
    let m = d;
    if (d.length > 2) m = d.slice(0,2) + '/' + d.slice(2);
    if (d.length > 4) m = m.slice(0,5) + '/' + d.slice(4);
    setDate(m);
  };

  const handleSubmit = () => {
    if (!patient || !vaccine || !date) {
      Alert.alert('Campos obrigatórios', 'Preencha paciente, vacina e data.');
      return;
    }
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setPatient(''); setVaccine(''); setDose(''); setDate(''); setLot(''); setNotes('');
    }, 2500);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="medical" size={24} color={Colors.NEUTRAL.WHITE} />
          </View>
          <View>
            <Text style={styles.title}>Registrar Vacinação</Text>
            <Text style={styles.subtitle}>Preencha os dados do procedimento</Text>
          </View>
        </Animated.View>

        {/* Feedback de sucesso */}
        {success && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.NEUTRAL.WHITE} />
            <Text style={styles.successText}>Vacinação registrada com sucesso!</Text>
          </Animated.View>
        )}

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

          {/* Card — Paciente */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.card}>
            <Text style={styles.cardTitle}>Paciente *</Text>
            <TouchableOpacity style={styles.dropBtn} onPress={() => setShowPat(s => !s)}>
              <Ionicons name="person-outline" size={20} color={Colors.NEUTRAL.MUTED} />
              <Text style={[styles.dropText, !patient && { color: Colors.NEUTRAL.MUTED }]}>{patient || 'Selecionar paciente'}</Text>
              <Ionicons name={showPat ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.NEUTRAL.MUTED} />
            </TouchableOpacity>
            {showPat && (
              <View style={styles.dropList}>
                {mockPatients.map(p => (
                  <TouchableOpacity key={p.id} style={styles.dropItem} onPress={() => { setPatient(p.name); setShowPat(false); }}>
                    <Text style={[styles.dropItemText, patient === p.name && { color: Colors.PROFESSIONAL, fontWeight: '700' }]}>{p.name}</Text>
                    <Text style={styles.dropItemSub}>{p.cpf}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Animated.View>

          {/* Card — Vacina */}
          <Animated.View entering={FadeInDown.delay(180).duration(400)} style={styles.card}>
            <Text style={styles.cardTitle}>Vacina Administrada *</Text>
            <TouchableOpacity style={styles.dropBtn} onPress={() => setShowVac(s => !s)}>
              <Ionicons name="medical-outline" size={20} color={Colors.NEUTRAL.MUTED} />
              <Text style={[styles.dropText, !vaccine && { color: Colors.NEUTRAL.MUTED }]}>{vaccine || 'Selecionar vacina'}</Text>
              <Ionicons name={showVac ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.NEUTRAL.MUTED} />
            </TouchableOpacity>
            {showVac && (
              <View style={styles.dropList}>
                {availableVaccines.map(v => (
                  <TouchableOpacity key={v} style={styles.dropItem} onPress={() => { setVaccine(v); setShowVac(false); }}>
                    <Text style={[styles.dropItemText, vaccine === v && { color: Colors.PROFESSIONAL, fontWeight: '700' }]}>{v}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <InputField label="Dose" value={dose} onChangeText={setDose} icon="layers-outline" placeholder="Ex: 1ª Dose, Reforço..." />
          </Animated.View>

          {/* Card — Detalhes */}
          <Animated.View entering={FadeInDown.delay(260).duration(400)} style={styles.card}>
            <Text style={styles.cardTitle}>Detalhes do Registro *</Text>
            <InputField label="Data de aplicação" value={date} onChangeText={handleDate} icon="calendar-outline" keyboardType="numeric" placeholder="DD/MM/AAAA" />
            <InputField label="Nº de Lote" value={lot} onChangeText={setLot} icon="barcode-outline" autoCapitalize="none" />
            <InputField label="Observações" value={notes} onChangeText={setNotes} icon="document-text-outline" />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(340).duration(400)}>
            <PrimaryButton label="Registrar Vacinação" onPress={handleSubmit} variant="professional" />
          </Animated.View>

          <View style={{ height: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.BACKGROUND },
  header:       { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20, paddingTop: 20, backgroundColor: Colors.NEUTRAL.WHITE, borderBottomWidth: 1, borderBottomColor: Colors.BORDER },
  headerIcon:   { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.PROFESSIONAL, alignItems: 'center', justifyContent: 'center' },
  title:        { fontSize: 18, fontWeight: '800', color: Colors.NEUTRAL.DARK_TEXT },
  subtitle:     { fontSize: 13, color: Colors.NEUTRAL.MUTED, marginTop: 2 },
  successBanner:{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.PROFESSIONAL, padding: 14, paddingHorizontal: 20 },
  successText:  { fontSize: 14, fontWeight: '600', color: Colors.NEUTRAL.WHITE },
  content:      { padding: 16 },
  card:         { backgroundColor: Colors.NEUTRAL.WHITE, borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardTitle:    { fontSize: 13, fontWeight: '700', color: Colors.NEUTRAL.MUTED, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 },
  dropBtn:      { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.CARD_BG, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.BORDER, paddingHorizontal: 14, height: 52, marginBottom: 14 },
  dropText:     { flex: 1, fontSize: 15, color: Colors.NEUTRAL.DARK_TEXT },
  dropList:     { backgroundColor: Colors.NEUTRAL.WHITE, borderRadius: 12, borderWidth: 1, borderColor: Colors.BORDER, marginBottom: 14, maxHeight: 200, overflow: 'hidden' },
  dropItem:     { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.BORDER },
  dropItemText: { fontSize: 14, color: Colors.NEUTRAL.DARK_TEXT },
  dropItemSub:  { fontSize: 11, color: Colors.NEUTRAL.MUTED, marginTop: 1 },
});
