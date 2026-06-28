// ============================================================
// TELA: Perfil do Paciente (Visão do Profissional)
// DESCRIÇÃO: Tela completa de perfil do paciente vista pelo
//            profissional de saúde. Exibe todos os dados
//            clínicos, histórico vacinal, vacinas pendentes
//            e atrasadas, além de um painel de ações.
//
//            É a tela central do fluxo de atendimento:
//              → vinda da agenda, busca ou últimos atendimentos
//              → leva para register-vaccine com patientId
//
// PREPARADO PARA BACKEND:
//   Em produção receberá o patientId via params e chamará:
//   GET /patients/{patientId}/profile
//   que retornará um PatientProfile completo.
//
// ACESSO: Profissional
// ROTA: /app/(professional)/patient-profile.tsx
// ============================================================

import React from 'react';
import {
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { mockPatientProfiles } from '../../constants/MockData';
import type { Vaccine } from '../../constants/MockData';

// ── Configuração visual do status de vacina ───────────────
const STATUS_CONFIG = {
  complete: { label: 'Realizada',  color: Colors.STATUS.COMPLETE, icon: 'checkmark-circle'  as const },
  pending:  { label: 'Pendente',   color: Colors.STATUS.PENDING,  icon: 'time'               as const },
  overdue:  { label: 'Atrasada',   color: Colors.STATUS.OVERDUE,  icon: 'alert-circle'       as const },
};

// -------------------------------------------------------
// Sub-componente: Item do histórico vacinal
// -------------------------------------------------------
function VaccineHistoryItem({ vaccine }: { vaccine: Vaccine }) {
  const cfg = STATUS_CONFIG[vaccine.status];
  return (
    <View style={hist.row}>
      <View style={[hist.iconCircle, { backgroundColor: cfg.color + '15' }]}>
        <Ionicons name={cfg.icon} size={16} color={cfg.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={hist.name}>{vaccine.name}</Text>
        <Text style={hist.meta}>{vaccine.dose} · {vaccine.date}</Text>
        {vaccine.location && <Text style={hist.location}>{vaccine.location}</Text>}
      </View>
      <View style={[hist.badge, { backgroundColor: cfg.color + '15' }]}>
        <Text style={[hist.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
      </View>
    </View>
  );
}

const hist = StyleSheet.create({
  row:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  iconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  name:       { fontSize: 13, fontWeight: '700', color: Colors.NEUTRAL.DARK_TEXT },
  meta:       { fontSize: 11, color: Colors.NEUTRAL.MUTED, marginTop: 1 },
  location:   { fontSize: 11, color: Colors.NEUTRAL.MUTED },
  badge:      { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, flexShrink: 0 },
  badgeText:  { fontSize: 10, fontWeight: '700' },
});

// -------------------------------------------------------
// Sub-componente: Seção de vacinas com título
// -------------------------------------------------------
function VaccineSection({ title, vaccines, emptyText }: {
  title: string;
  vaccines: Vaccine[];
  emptyText: string;
}) {
  return (
    <View>
      <Text style={sec.title}>{title}</Text>
      {vaccines.length === 0 ? (
        <Text style={sec.empty}>{emptyText}</Text>
      ) : (
        vaccines.map(v => <VaccineHistoryItem key={v.id} vaccine={v} />)
      )}
    </View>
  );
}

const sec = StyleSheet.create({
  title: { fontSize: 13, fontWeight: '700', color: Colors.NEUTRAL.MUTED, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  empty: { fontSize: 13, color: Colors.NEUTRAL.MUTED, fontStyle: 'italic', paddingVertical: 8 },
});

// -------------------------------------------------------
// COMPONENTE PRINCIPAL
// -------------------------------------------------------
export default function PatientProfileScreen() {
  const params    = useLocalSearchParams<{ patientId?: string; network?: string }>();
  const patientId = params.patientId ?? '1';
  const network   = params.network ?? 'public';

  // Busca o perfil pelo ID (futuramente: GET /patients/{patientId}/profile)
  const patient = mockPatientProfiles.find(p => p.id === patientId)
    ?? mockPatientProfiles[0];

  // ── Handlers de ação ────────────────────────────────────

  const handleRegisterVaccine = () => {
    router.push({
      pathname: '/(professional)/register-vaccine',
      params: { patientId: patient.id, network },
    });
  };

  // ── Dados derivados ──────────────────────────────────────
  const doneVaccines    = patient.vaccines.filter(v => v.status === 'complete');
  const pendingVaccines = patient.vaccines.filter(v => v.status === 'pending');
  const overdueVaccines = patient.vaccines.filter(v => v.status === 'overdue');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── HEADER COM BOTÃO VOLTAR ──────────────────────── */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back" size={22} color={Colors.PROFESSIONAL} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Perfil do Paciente</Text>
          <View style={{ width: 40 }} />{/* Spacer para centralizar título */}
        </Animated.View>

        {/* ── CARD DE IDENTIDADE DO PACIENTE ───────────────── */}
        <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.identityCard}>

          {/* Avatar + dados principais */}
          <View style={styles.identityTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{patient.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.patientName}>{patient.name}</Text>
              <Text style={styles.patientAge}>{patient.age} anos</Text>
              <View style={styles.bloodRow}>
                <Ionicons name="water" size={13} color={Colors.STATUS.OVERDUE} />
                <Text style={styles.bloodType}>Tipo {patient.bloodType}</Text>
                <View style={styles.planBadge}>
                  <Text style={styles.planText}>{patient.plan}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Dados de identificação */}
          <View style={styles.idRow}>
            <View style={styles.idItem}>
              <Text style={styles.idLabel}>CPF</Text>
              <Text style={styles.idValue}>{patient.cpf}</Text>
            </View>
            <View style={styles.idDivider} />
            <View style={styles.idItem}>
              <Text style={styles.idLabel}>Nº SUS</Text>
              <Text style={styles.idValue}>{patient.sus}</Text>
            </View>
          </View>

          {/* Alergias */}
          {patient.allergies.length > 0 && (
            <View style={styles.allergiesRow}>
              <Ionicons name="warning-outline" size={14} color={Colors.STATUS.OVERDUE} />
              <Text style={styles.allergiesLabel}>Alergias:</Text>
              <Text style={styles.allergiesValue}>{patient.allergies.join(', ')}</Text>
            </View>
          )}
        </Animated.View>

        {/* ── RESUMO DE PENDÊNCIAS ──────────────────────────── */}
        {(pendingVaccines.length > 0 || overdueVaccines.length > 0) && (
          <Animated.View entering={FadeInDown.delay(160).duration(400)} style={styles.alertBox}>
            <Ionicons name="alert-circle" size={18} color={Colors.STATUS.OVERDUE} />
            <View style={{ flex: 1 }}>
              {overdueVaccines.length > 0 && (
                <Text style={styles.alertText}>
                  {overdueVaccines.length} vacina{overdueVaccines.length > 1 ? 's' : ''} atrasada{overdueVaccines.length > 1 ? 's' : ''}
                </Text>
              )}
              {pendingVaccines.length > 0 && (
                <Text style={styles.alertText}>
                  {pendingVaccines.length} vacina{pendingVaccines.length > 1 ? 's' : ''} pendente{pendingVaccines.length > 1 ? 's' : ''}
                </Text>
              )}
            </View>
          </Animated.View>
        )}

        {/* ── HISTÓRICO VACINAL ─────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(220).duration(400)} style={styles.card}>
          <VaccineSection
            title="Atrasadas"
            vaccines={overdueVaccines}
            emptyText="Nenhuma vacina atrasada."
          />
          {overdueVaccines.length > 0 && <View style={styles.divider} />}

          <VaccineSection
            title="Pendentes"
            vaccines={pendingVaccines}
            emptyText="Nenhuma vacina pendente."
          />
          {pendingVaccines.length > 0 && <View style={styles.divider} />}

          <VaccineSection
            title="Realizadas"
            vaccines={doneVaccines}
            emptyText="Nenhuma vacina registrada."
          />
        </Animated.View>

        {/* ── PAINEL DE AÇÕES ───────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>Ações</Text>

          {/* Registrar Vacina — ação primária */}
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={handleRegisterVaccine}
            activeOpacity={0.85}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="add-circle" size={22} color={Colors.NEUTRAL.WHITE} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.primaryActionLabel}>Registrar Vacina</Text>
              <Text style={styles.primaryActionSub}>Adicionar nova dose ao histórico</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.NEUTRAL.WHITE} />
          </TouchableOpacity>

          {/* Ações secundárias */}
          <View style={styles.secondaryActions}>
            <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.8}>
              <Ionicons name="create-outline" size={20} color={Colors.PROFESSIONAL} />
              <Text style={styles.secondaryBtnText}>Editar Dados</Text>
            </TouchableOpacity>
            <View style={styles.actionsDivider} />
            <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.8}>
              <Ionicons name="document-text-outline" size={20} color={Colors.PROFESSIONAL} />
              <Text style={styles.secondaryBtnText}>Emitir Comprovante</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// -------------------------------------------------------
// ESTILOS
// -------------------------------------------------------
const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: Colors.BACKGROUND },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 24 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.NEUTRAL.WHITE,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.NEUTRAL.DARK_TEXT },

  // Identity card
  identityCard: {
    backgroundColor: Colors.NEUTRAL.WHITE,
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  identityTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 14 },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.PROFESSIONAL,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText:  { fontSize: 26, fontWeight: '800', color: Colors.NEUTRAL.WHITE },
  patientName: { fontSize: 18, fontWeight: '800', color: Colors.NEUTRAL.DARK_TEXT },
  patientAge:  { fontSize: 13, color: Colors.NEUTRAL.MUTED, marginTop: 2 },
  bloodRow:    { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6, flexWrap: 'wrap' },
  bloodType:   { fontSize: 12, fontWeight: '600', color: Colors.STATUS.OVERDUE },
  planBadge: {
    backgroundColor: Colors.PROFESSIONAL_LIGHT,
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1, borderColor: Colors.LIGHT_GREEN,
  },
  planText: { fontSize: 11, fontWeight: '600', color: Colors.PROFESSIONAL },

  // Dados ID
  idRow:     { flexDirection: 'row', backgroundColor: Colors.CARD_BG, borderRadius: 12, padding: 12, marginBottom: 10 },
  idItem:    { flex: 1 },
  idDivider: { width: 1, backgroundColor: Colors.BORDER, marginHorizontal: 12 },
  idLabel:   { fontSize: 10, fontWeight: '700', color: Colors.NEUTRAL.MUTED, textTransform: 'uppercase', marginBottom: 3 },
  idValue:   { fontSize: 13, fontWeight: '600', color: Colors.NEUTRAL.DARK_TEXT },

  // Alergias
  allergiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.STATUS.OVERDUE + '10',
    borderRadius: 10,
    padding: 10,
  },
  allergiesLabel: { fontSize: 12, fontWeight: '700', color: Colors.STATUS.OVERDUE },
  allergiesValue: { flex: 1, fontSize: 12, color: Colors.STATUS.OVERDUE, fontWeight: '500' },

  // Alert box
  alertBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.STATUS.OVERDUE + '10',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.STATUS.OVERDUE + '30',
  },
  alertText: { fontSize: 13, fontWeight: '600', color: Colors.STATUS.OVERDUE },

  // Card do histórico
  card: {
    backgroundColor: Colors.NEUTRAL.WHITE,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  divider: { height: 1, backgroundColor: Colors.BORDER, marginVertical: 10 },

  // Painel de ações
  actionsCard: {
    backgroundColor: Colors.NEUTRAL.WHITE,
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  actionsTitle: { fontSize: 13, fontWeight: '700', color: Colors.NEUTRAL.MUTED, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 },

  // Ação primária
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.PROFESSIONAL,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: Colors.PROFESSIONAL,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  primaryActionLabel: { fontSize: 15, fontWeight: '800', color: Colors.NEUTRAL.WHITE },
  primaryActionSub:   { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  // Ações secundárias
  secondaryActions: {
    flexDirection: 'row',
    backgroundColor: Colors.CARD_BG,
    borderRadius: 12,
    overflow: 'hidden',
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
  },
  secondaryBtnText: { fontSize: 13, fontWeight: '600', color: Colors.PROFESSIONAL },
  actionsDivider:   { width: 1, backgroundColor: Colors.BORDER },
});
