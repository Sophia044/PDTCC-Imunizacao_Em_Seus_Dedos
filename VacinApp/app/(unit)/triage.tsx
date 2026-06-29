import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { InputField } from '../../components/InputField';
import { PrimaryButton } from '../../components/PrimaryButton';
import type { PatientProfile } from '../../constants/MockData';
import {
  addPatientToPublicQueue,
  findPatientBySus,
  getPublicVaccinationQueue,
} from '../../services/PublicQueueStore';

const formatSusNumber = (text: string) => {
  const digits = text.replace(/\D/g, '').slice(0, 15);
  return digits
    .replace(/^(\d{3})(\d)/, '$1 $2')
    .replace(/^(\d{3}) (\d{4})(\d)/, '$1 $2 $3')
    .replace(/^(\d{3}) (\d{4}) (\d{4})(\d)/, '$1 $2 $3 $4');
};

export default function UnitTriageScreen() {
  const [sus, setSus] = useState('');
  const [error, setError] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | undefined>();
  const [queue, setQueue] = useState(getPublicVaccinationQueue());
  const [successMessage, setSuccessMessage] = useState('');

  const handleSusChange = (text: string) => {
    setSus(formatSusNumber(text));
    setError('');
    setSuccessMessage('');
  };

  const handleSearch = () => {
    const query = sus.replace(/\D/g, '');

    if (query.length < 15) {
      setError('Informe os 15 dígitos do Cartão Nacional de Saúde.');
      setSelectedPatient(undefined);
      return;
    }

    const patient = findPatientBySus(query);

    if (!patient) {
      setError('Nenhum paciente encontrado com esse número do SUS.');
      setSelectedPatient(undefined);
      return;
    }

    setSelectedPatient(patient);
    setError('');
  };

  const handleAddToQueue = () => {
    if (!selectedPatient) return;

    addPatientToPublicQueue(selectedPatient.id, 'Vacinação');
    setQueue(getPublicVaccinationQueue());
    setSuccessMessage(`${selectedPatient.name} foi adicionado à fila de vacinação.`);
    setSelectedPatient(undefined);
    setSus('');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Animated.View entering={FadeIn.duration(450)} style={styles.header}>
          <View>
            <Text style={styles.headerKicker}>UBS Jardim América</Text>
            <Text style={styles.headerTitle}>Triagem de Vacinação</Text>
            <Text style={styles.headerSubtitle}>Identifique o paciente e organize a fila da sala de vacina.</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={() => router.replace('/(auth)/login')} hitSlop={12}>
            <Ionicons name="log-out-outline" size={20} color={Colors.PROFESSIONAL} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(90).duration(450)} style={styles.searchCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Ionicons name="id-card-outline" size={20} color={Colors.PROFESSIONAL} />
            </View>
            <View>
              <Text style={styles.cardTitle}>Identificar paciente</Text>
              <Text style={styles.cardSubtitle}>Busca pelo Cartão Nacional de Saúde</Text>
            </View>
          </View>

          <InputField
            label="Número do SUS"
            value={sus}
            onChangeText={handleSusChange}
            icon="card-outline"
            keyboardType="numeric"
            placeholder="000 0000 0000 0000"
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <PrimaryButton label="Buscar paciente" onPress={handleSearch} variant="professional" />
        </Animated.View>

        {selectedPatient && (
          <Animated.View entering={FadeInDown.duration(350)} style={styles.patientCard}>
            <View style={styles.patientTop}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{selectedPatient.name.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.patientName}>{selectedPatient.name}</Text>
                <Text style={styles.patientMeta}>{selectedPatient.age} anos · CPF: {selectedPatient.cpf}</Text>
                <Text style={styles.patientMeta}>SUS: {selectedPatient.sus}</Text>
              </View>
            </View>

            {(selectedPatient.pendingCount > 0 || selectedPatient.overdueVaccines.length > 0) && (
              <View style={styles.alertRow}>
                <Ionicons name="alert-circle-outline" size={16} color={Colors.STATUS.OVERDUE} />
                <Text style={styles.alertText}>
                  {selectedPatient.pendingCount} pendência(s) vacinal(is) no histórico
                </Text>
              </View>
            )}

            <PrimaryButton label="Adicionar à fila de vacinação" onPress={handleAddToQueue} variant="professional" />
          </Animated.View>
        )}

        {successMessage ? (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.STATUS.COMPLETE} />
            <Text style={styles.successText}>{successMessage}</Text>
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInDown.delay(160).duration(450)} style={styles.queueSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Fila atual</Text>
            <View style={styles.queueBadge}>
              <Text style={styles.queueBadgeText}>{queue.length} aguardando</Text>
            </View>
          </View>

          {queue.length === 0 ? (
            <View style={styles.emptyQueue}>
              <Ionicons name="people-outline" size={24} color={Colors.NEUTRAL.MUTED} />
              <Text style={styles.emptyText}>Nenhum paciente na fila.</Text>
            </View>
          ) : (
            queue.map(item => (
              <View key={item.id} style={styles.queueItem}>
                <View style={styles.position}>
                  <Text style={styles.positionText}>{item.position}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.queueName}>{item.patient.name}</Text>
                  <Text style={styles.queueMeta}>{item.arrivalTime} · {item.reason}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.NEUTRAL.MUTED} />
              </View>
            ))
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.BACKGROUND },
  content: { paddingBottom: 32 },
  header: {
    backgroundColor: Colors.PROFESSIONAL,
    paddingHorizontal: 20,
    paddingRight: 28,
    paddingTop: 20,
    paddingBottom: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
  },
  headerKicker: { fontSize: 12, fontWeight: '700', color: Colors.LIGHT_GREEN, marginBottom: 4 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.NEUTRAL.WHITE },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.78)', lineHeight: 19, marginTop: 4 },
  logoutBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.NEUTRAL.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 4,
    marginRight: 22,
  },
  searchCard: {
    backgroundColor: Colors.NEUTRAL.WHITE,
    marginHorizontal: 16,
    marginTop: -16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.PROFESSIONAL_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: Colors.NEUTRAL.DARK_TEXT },
  cardSubtitle: { fontSize: 12, color: Colors.NEUTRAL.MUTED, marginTop: 2 },
  errorText: { fontSize: 12, fontWeight: '600', color: Colors.STATUS.OVERDUE, marginTop: -6, marginBottom: 12 },
  patientCard: {
    backgroundColor: Colors.NEUTRAL.WHITE,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  patientTop: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.PROFESSIONAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: '800', color: Colors.NEUTRAL.WHITE },
  patientName: { fontSize: 16, fontWeight: '800', color: Colors.NEUTRAL.DARK_TEXT },
  patientMeta: { fontSize: 12, color: Colors.NEUTRAL.MUTED, marginTop: 2 },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.STATUS.OVERDUE + '10',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  alertText: { flex: 1, fontSize: 12, fontWeight: '600', color: Colors.STATUS.OVERDUE },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.STATUS.COMPLETE + '12',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 12,
    padding: 12,
  },
  successText: { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.STATUS.COMPLETE },
  queueSection: { marginHorizontal: 16, marginTop: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.NEUTRAL.DARK_TEXT },
  queueBadge: {
    backgroundColor: Colors.PROFESSIONAL_LIGHT,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  queueBadgeText: { fontSize: 12, fontWeight: '700', color: Colors.PROFESSIONAL },
  emptyQueue: {
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.NEUTRAL.WHITE,
    borderRadius: 14,
    padding: 22,
  },
  emptyText: { fontSize: 13, color: Colors.NEUTRAL.MUTED },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.NEUTRAL.WHITE,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  position: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.PROFESSIONAL_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionText: { fontSize: 14, fontWeight: '800', color: Colors.PROFESSIONAL },
  queueName: { fontSize: 14, fontWeight: '800', color: Colors.NEUTRAL.DARK_TEXT },
  queueMeta: { fontSize: 12, color: Colors.NEUTRAL.MUTED, marginTop: 2 },
});
