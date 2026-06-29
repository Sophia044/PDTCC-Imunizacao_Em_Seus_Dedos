// ============================================================
// TELA: Home do Profissional de Saúde (Dashboard Dual)
// DESCRIÇÃO: Dashboard principal do profissional. Renderiza
//            conteúdo diferente com base na rede de atuação:
//
//            Rede Pública (network=public):
//              - Sem agenda; pacientes chegam espontaneamente
//              - Stats cards: atendimentos, vacinas, campanhas, estoque
//              - Painel de ações rápidas sem listagem prévia de pacientes
//              - Lista de últimos atendimentos
//
//            Rede Privada (network=private):
//              - Com agenda do dia (AppointmentCard)
//              - Botão "Atender sem agendamento" → busca
//              - Ações rápidas simplificadas
//
// PREPARADO PARA BACKEND:
//   - networkType virá do contexto de sessão (pós-login)
//   - stats e appointments virão de endpoints REST
//   - Toda navegação usa IDs, nunca nomes diretos
//
// ACESSO: Profissional
// ROTA: /app/(professional)/home.tsx
// ============================================================

import React, { useCallback, useState } from 'react';
import {
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

// ── Dados mock ────────────────────────────────────────────
import {
  mockProfessionalPublic,
  mockProfessionalPrivate,
  mockAppointments,
  mockCampaigns,
  mockStock,
} from '../../constants/MockData';
import { getPublicVaccinationQueue } from '../../services/PublicQueueStore';
import type { PublicQueuePatient } from '../../services/PublicQueueStore';

// ── Componentes reutilizáveis ──────────────────────────────
import {
  ProfessionalHeader,
  StatCard,
  QuickActionButton,
  AppointmentCard,
} from '../../components/professional';

// -------------------------------------------------------
// HELPERS
// -------------------------------------------------------
/** Calcula o número de itens com estoque abaixo do mínimo */
const lowStockCount = mockStock.filter(s => s.quantity < s.minLevel).length;
/** Campanha ativa (primeiro mock) */
const activeCampaign = mockCampaigns[0];

// -------------------------------------------------------
// COMPONENTE PRINCIPAL
// -------------------------------------------------------
export default function ProfessionalHome() {
  // Lê o tipo de rede dos parâmetros de rota.
  // Em produção virá do contexto de autenticação (auth context/store).
  // Para testes: navigate para /(professional)/home?network=private
  const params = useLocalSearchParams<{ network?: string }>();
  const network = (params.network ?? 'public') as 'public' | 'private';
  const isPublic  = network === 'public';
  const isPrivate = network === 'private';

  // Profissional mockado conforme a rede
  const professional = isPublic ? mockProfessionalPublic : mockProfessionalPrivate;
  const [publicQueue, setPublicQueue] = useState<PublicQueuePatient[]>(getPublicVaccinationQueue());

  useFocusEffect(
    useCallback(() => {
      setPublicQueue(getPublicVaccinationQueue());
    }, [])
  );

  // ── Handlers de navegação (todos usam ID) ────────────────

  const goToSearch = () =>
    router.push({ pathname: '/(professional)/search-patient', params: { network } });

  const goToRegister = () =>
    router.push({ pathname: '/(professional)/register-vaccine', params: { network } });

  const goToPatientProfile = (patientId: string) =>
    router.push({ pathname: '/(professional)/patient-profile', params: { patientId, network } });

  const goToQueuedPatientRegister = (item: PublicQueuePatient) =>
    router.push({
      pathname: '/(professional)/register-vaccine',
      params: { patientId: item.patient.id, network, queueId: item.id },
    });

  // ── Dados calculados (virão da API futuramente) ──────────
  // Mock: pacientes atendidos hoje (rede pública — futuramente: GET /stats/today)
  const todayPatients = 7;
  // Mock: "atendimentos concluídos" = appointments com status 'done'
  const todayDone     = mockAppointments.filter(a => a.status === 'done').length;
  // Mock: vacinas registradas hoje = igual aos atendimentos realizados (simplificado)
  const todayVaccines = todayDone;

  // ============================================================
  // RENDER: Dashboard Rede Pública
  // ============================================================
  const PublicDashboard = () => (
    <>
      {/* ── STATS CARDS (flutuam sobre o header) ─────────── */}
      <View style={styles.statsRow}>
        {[
          { icon: 'people',        value: todayPatients,     label: 'Pacientes\nHoje',      color: Colors.PROFESSIONAL, alert: false },
          { icon: 'medical',       value: todayVaccines,     label: 'Vacinas\nRegistradas', color: Colors.PRIMARY,      alert: false },
          { icon: 'megaphone',     value: mockCampaigns.length, label: 'Campanhas\nAtivas', color: Colors.STATUS.PENDING, alert: false },
          { icon: 'warning',       value: lowStockCount,     label: 'Estoque\nBaixo',       color: Colors.STATUS.OVERDUE, alert: lowStockCount > 0 },
        ].map((s, i) => (
          <Animated.View key={s.label} entering={FadeInDown.delay(100 + i * 70).duration(400)} style={{ flex: 1 }}>
            <StatCard
              icon={s.icon as any}
              value={s.value}
              label={s.label}
              color={s.color}
              alert={s.alert}
            />
          </Animated.View>
        ))}
      </View>

      {/* ── CAMPANHA ATIVA ───────────────────────────────── */}
      {activeCampaign && (
        <Animated.View entering={FadeInDown.delay(320).duration(400)} style={styles.campaignBanner}>
          <View style={styles.campaignLeft}>
            <View style={styles.campaignIconCircle}>
              <Ionicons name="megaphone" size={20} color={Colors.STATUS.PENDING} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.campaignName} numberOfLines={1}>{activeCampaign.name}</Text>
              <Text style={styles.campaignMeta}>
                {activeCampaign.applied} / {activeCampaign.goal} doses · até {activeCampaign.deadline}
              </Text>
              {/* Barra de progresso */}
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(100, (activeCampaign.applied / activeCampaign.goal) * 100)}%` },
                  ]}
                />
              </View>
            </View>
          </View>
        </Animated.View>
      )}

      {/* ── AÇÕES RÁPIDAS ────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(380).duration(400)} style={styles.section}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <View style={styles.actionsGrid}>
          <QuickActionButton icon="add-circle" label="Registrar Vacina" onPress={goToRegister} highlight color={Colors.PROFESSIONAL} />
          <QuickActionButton icon="time"       label="Histórico"        onPress={() => {}} />
          <QuickActionButton icon="megaphone"  label="Campanhas"        onPress={() => {}} />
          <QuickActionButton icon="cube"       label="Estoque"          onPress={() => {}} />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(430).duration(400)} style={styles.queuePanel}>
        <View style={styles.queuePanelHeader}>
          <View>
            <Text style={styles.sectionTitle}>Fila de Vacinação</Text>
            <Text style={styles.queueSubtitle}>Pacientes triados pela recepção da unidade</Text>
          </View>
          <View style={styles.queueBadge}>
            <Text style={styles.queueBadgeText}>{publicQueue.length} na fila</Text>
          </View>
        </View>

        {publicQueue.length === 0 ? (
          <View style={styles.emptyQueue}>
            <Ionicons name="people-outline" size={24} color={Colors.NEUTRAL.MUTED} />
            <Text style={styles.emptyQueueText}>Nenhum paciente aguardando vacinação.</Text>
          </View>
        ) : (
          publicQueue.slice(0, 3).map((item, i) => (
            <Animated.View key={item.id} entering={FadeInDown.delay(480 + i * 60).duration(350)} style={styles.queueItem}>
              <View style={styles.queuePosition}>
                <Text style={styles.queuePositionText}>{item.position}</Text>
              </View>
              <View style={styles.queuePatientInfo}>
                <Text style={styles.queuePatientName} numberOfLines={1}>{item.patient.name}</Text>
                <Text style={styles.queuePatientMeta}>
                  {item.arrivalTime} · {item.reason} · {item.patient.age} anos
                </Text>
                {item.patient.pendingCount > 0 && (
                  <Text style={styles.queuePending}>{item.patient.pendingCount} pendência(s) no calendário</Text>
                )}
              </View>
              <TouchableOpacity style={styles.startCareBtn} onPress={() => goToQueuedPatientRegister(item)} activeOpacity={0.85}>
                <Ionicons name="play" size={14} color={Colors.NEUTRAL.WHITE} />
                <Text style={styles.startCareText}>Iniciar</Text>
              </TouchableOpacity>
            </Animated.View>
          ))
        )}
      </Animated.View>
    </>
  );

  // ============================================================
  // RENDER: Dashboard Rede Privada
  // ============================================================
  const PrivateDashboard = () => (
    <>
      {/* ── AGENDA DO DIA ────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Agenda de Hoje</Text>
          <View style={styles.agendaBadge}>
            <Text style={styles.agendaBadgeText}>{mockAppointments.length} consultas</Text>
          </View>
        </View>

        {mockAppointments.map((apt, i) => (
          <Animated.View key={apt.id} entering={FadeInDown.delay(200 + i * 60).duration(350)}>
            <AppointmentCard appointment={apt} onPress={goToPatientProfile} />
          </Animated.View>
        ))}
      </Animated.View>

      {/* ── BOTÃO: ATENDER SEM AGENDAMENTO ───────────────── */}
      <Animated.View entering={FadeInDown.delay(520).duration(400)} style={styles.walkInWrap}>
        <TouchableOpacity style={styles.walkInBtn} onPress={goToSearch} activeOpacity={0.85}>
          <View style={styles.walkInIcon}>
            <Ionicons name="person-add" size={22} color={Colors.PROFESSIONAL} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.walkInTitle}>Atender sem agendamento</Text>
            <Text style={styles.walkInSub}>Buscar paciente por CPF, nome ou Nº SUS</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.PROFESSIONAL} />
        </TouchableOpacity>
      </Animated.View>

      {/* ── AÇÕES RÁPIDAS (simplificadas para Rede Privada) ─ */}
      <Animated.View entering={FadeInDown.delay(580).duration(400)} style={styles.section}>
        <Text style={styles.sectionTitle}>Ações</Text>
        <View style={styles.actionsRow}>
          <QuickActionButton icon="add-circle" label="Registrar Vacina" onPress={goToRegister} highlight color={Colors.PROFESSIONAL} />
          <QuickActionButton icon="time"       label="Histórico"        onPress={() => {}} />
          <QuickActionButton icon="search"     label="Buscar Paciente"  onPress={goToSearch}  />
        </View>
      </Animated.View>
    </>
  );

  // todayPatients declarado acima, junto aos demais dados calculados

  // ============================================================
  // RENDER PRINCIPAL
  // ============================================================
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── HEADER ───────────────────────────────────────── */}
        <Animated.View entering={FadeIn.duration(500)}>
          <ProfessionalHeader
            name={professional.name}
            role={professional.role}
            unit={isPublic ? professional.unit : (professional.institution ?? '')}
            networkType={professional.networkType}
            onAvatarPress={() => router.push('/(professional)/settings')}
          />
        </Animated.View>

        {/* ── CONTEÚDO DO DASHBOARD ────────────────────────── */}
        <View style={styles.body}>
          {isPublic  && <PublicDashboard  />}
          {isPrivate && <PrivateDashboard />}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// -------------------------------------------------------
// ESTILOS
// -------------------------------------------------------
const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.BACKGROUND },
  scrollContent: { paddingBottom: 16 },
  body:         { paddingHorizontal: 16 },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 14,
    marginTop: -6,
  },

  // Campanha
  campaignBanner: {
    backgroundColor: Colors.NEUTRAL.WHITE,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: Colors.STATUS.PENDING,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  campaignLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  campaignIconCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.STATUS.PENDING + '20',
    alignItems: 'center', justifyContent: 'center',
  },
  campaignName: { fontSize: 13, fontWeight: '700', color: Colors.NEUTRAL.DARK_TEXT, marginBottom: 3 },
  campaignMeta: { fontSize: 11, color: Colors.NEUTRAL.MUTED, marginBottom: 6 },
  progressBar:  { height: 5, backgroundColor: Colors.BORDER, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.STATUS.PENDING, borderRadius: 3 },

  // Seções
  section:       { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle:  { fontSize: 17, fontWeight: '800', color: Colors.NEUTRAL.DARK_TEXT },
  sectionLink:   { fontSize: 13, fontWeight: '600', color: Colors.PROFESSIONAL },

  // Grid de ações (Rede Pública)
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  // Row de ações (Rede Privada)
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },

  // Fila pública
  queuePanel: {
    backgroundColor: Colors.NEUTRAL.WHITE,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  queuePanelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },
  queueSubtitle: {
    fontSize: 12,
    color: Colors.NEUTRAL.MUTED,
    marginTop: 2,
  },
  queueBadge: {
    backgroundColor: Colors.PROFESSIONAL_LIGHT,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GREEN,
  },
  queueBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.PROFESSIONAL,
  },
  emptyQueue: {
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.CARD_BG,
    borderRadius: 14,
    padding: 18,
  },
  emptyQueueText: {
    fontSize: 13,
    color: Colors.NEUTRAL.MUTED,
    textAlign: 'center',
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.CARD_BG,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  queuePosition: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.PROFESSIONAL,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  queuePositionText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.NEUTRAL.WHITE,
  },
  queuePatientInfo: {
    flex: 1,
    minWidth: 0,
  },
  queuePatientName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.NEUTRAL.DARK_TEXT,
  },
  queuePatientMeta: {
    fontSize: 11,
    color: Colors.NEUTRAL.MUTED,
    marginTop: 2,
  },
  queuePending: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.STATUS.PENDING,
    marginTop: 3,
  },
  startCareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.PROFESSIONAL,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexShrink: 0,
  },
  startCareText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.NEUTRAL.WHITE,
  },

  // Agenda badge
  agendaBadge: {
    backgroundColor: Colors.PROFESSIONAL_LIGHT,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GREEN,
  },
  agendaBadgeText: { fontSize: 12, fontWeight: '700', color: Colors.PROFESSIONAL },

  // Walk-in button (Atender sem agendamento)
  walkInWrap: { marginBottom: 20 },
  walkInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.NEUTRAL.WHITE,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.PROFESSIONAL,
    shadowColor: Colors.PROFESSIONAL,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  walkInIcon: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: Colors.PROFESSIONAL_LIGHT,
    alignItems: 'center', justifyContent: 'center',
  },
  walkInTitle: { fontSize: 15, fontWeight: '800', color: Colors.PROFESSIONAL },
  walkInSub:   { fontSize: 12, color: Colors.NEUTRAL.MUTED, marginTop: 2 },
});
