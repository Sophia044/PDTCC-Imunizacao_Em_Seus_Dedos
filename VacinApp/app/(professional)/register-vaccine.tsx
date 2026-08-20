// ============================================================
// TELA: Registrar Vacinação
// DESCRIÇÃO: Formulário para registrar uma vacinação no
//            histórico de um paciente específico.
//
//            O paciente é sempre passado via parâmetros de rota
//            (patientId). Não existe seleção manual de paciente.
//
//            O profissional chega nesta tela:
//              - Pelo perfil do paciente → "Registrar Vacina"
//              - Pela agenda (Rede Privada) → perfil → registrar
//
//            Após salvar, exibe SuccessModal animado e volta
//            automaticamente para o perfil do paciente.
//
//            UNIDADE DE SAÚDE:
//            O campo vem travado, preenchido com a unidade de
//            saúde vinculada ao profissional autenticado (a mesma
//            usada no cadastro/login). Para trocar, o profissional
//            precisa reconfirmar o próprio CRM/COREN; só então o
//            campo vira uma seleção entre as unidades realmente
//            cadastradas (nunca texto livre). O envio só é
//            permitido com uma unidade válida selecionada.
//
// PREPARADO PARA BACKEND:
//   Em produção, o botão "Registrar Vacinação" chamará:
//   POST /vaccinations com o payload abaixo.
//
//   Payload:
//   {
//     patientId: string,
//     vaccine: string,
//     dose: string,
//     manufacturer: string,
//     lot: string,
//     date: string,        // DD/MM/YYYY
//     healthUnitId: string,
//     notes: string,
//     networkType: string,
//   }
//
// ACESSO: Profissional
// ROTA: /app/(professional)/register-vaccine.tsx
// ============================================================

import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { InputField } from '../../components/InputField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { availableManufacturers } from '../../constants/MockData';
import type { HealthUnit, PatientProfile } from '../../constants/MockData';
import { PatientContextCard, SuccessModal } from '../../components/professional';
import {
  getPublicVaccinationQueue,
  removePublicQueuePatient,
  findPatientBySus,
} from '../../services/PublicQueueStore';
import type { PublicQueuePatient } from '../../services/PublicQueueStore';
import { getPatientProfile } from '../../services/api/patients';
import { listVaccineNames } from '../../services/api/vaccines';
import { registerVaccination } from '../../services/api/vaccinations';
import { listHealthUnits } from '../../services/api/healthUnits';
import { verifyProfessionalRegistry } from '../../services/api/professionals';
import { ApiError } from '../../services/api/client';
import { useAuth } from '../../contexts/AuthContext';

// -------------------------------------------------------
// Sub-componente: Seletor tipo dropdown
// -------------------------------------------------------
interface DropdownSelectorProps {
  label: string;
  value: string;
  options: string[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (v: string) => void;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  placeholder: string;
}

function DropdownSelector({ label, value, options, isOpen, onToggle, onSelect, icon, placeholder }: DropdownSelectorProps) {
  return (
    <View style={dd.wrapper}>
      <Text style={dd.label}>{label}</Text>
      <TouchableOpacity style={dd.btn} onPress={onToggle} activeOpacity={0.8}>
        <Ionicons name={icon} size={20} color={Colors.NEUTRAL.MUTED} />
        <Text style={[dd.btnText, !value && dd.btnPlaceholder]}>
          {value || placeholder}
        </Text>
        <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.NEUTRAL.MUTED} />
      </TouchableOpacity>
      {isOpen && (
        <View style={dd.list}>
          <ScrollView nestedScrollEnabled style={{ maxHeight: 180 }}>
            {options.map(opt => (
              <TouchableOpacity
                key={opt}
                style={dd.item}
                onPress={() => { onSelect(opt); }}
              >
                <Text style={[dd.itemText, value === opt && dd.itemTextActive]}>{opt}</Text>
                {value === opt && <Ionicons name="checkmark" size={16} color={Colors.PROFESSIONAL} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const dd = StyleSheet.create({
  wrapper:         { marginBottom: 14 },
  label:           { fontSize: 13, fontWeight: '600', color: Colors.NEUTRAL.DARK_TEXT, marginBottom: 6 },
  btn:             { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.CARD_BG, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.BORDER, paddingHorizontal: 14, height: 52 },
  btnText:         { flex: 1, fontSize: 15, color: Colors.NEUTRAL.DARK_TEXT },
  btnPlaceholder:  { color: Colors.NEUTRAL.MUTED },
  list:            { backgroundColor: Colors.NEUTRAL.WHITE, borderRadius: 12, borderWidth: 1, borderColor: Colors.BORDER, marginTop: 4, overflow: 'hidden' },
  item:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.BORDER },
  itemText:        { fontSize: 14, color: Colors.NEUTRAL.DARK_TEXT },
  itemTextActive:  { color: Colors.PROFESSIONAL, fontWeight: '700' },
});

// -------------------------------------------------------
// Sub-componente: Card "Unidade de Saúde" (travado por padrão)
// -------------------------------------------------------
type UnitEditMode = 'locked' | 'verifying' | 'unlocked';

const unitStyles = StyleSheet.create({
  lockedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.CARD_BG,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.BORDER,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  lockedIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.PROFESSIONAL_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  lockedName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.NEUTRAL.DARK_TEXT,
  },
  lockedAddress: {
    fontSize: 11,
    color: Colors.NEUTRAL.MUTED,
    marginTop: 2,
  },
  changeLink: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.PROFESSIONAL,
  },
  verifyHint: {
    fontSize: 12,
    color: Colors.NEUTRAL.MUTED,
    marginBottom: 10,
    lineHeight: 17,
  },
  verifyError: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.STATUS.OVERDUE,
    marginTop: -6,
    marginBottom: 10,
  },
  verifyActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.BORDER,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.NEUTRAL.MUTED,
  },
  confirmBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.PROFESSIONAL,
  },
  confirmBtnDisabled: {
    opacity: 0.6,
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.NEUTRAL.WHITE,
  },
  useOwnUnitLink: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
});

// -------------------------------------------------------
// COMPONENTE PRINCIPAL
// -------------------------------------------------------
export default function RegisterVaccineScreen() {
  const params    = useLocalSearchParams<{ patientId?: string; network?: string; queueId?: string }>();
  const initialPatientId = params.patientId;
  const network   = params.network ?? 'public';
  const initialQueueId = params.queueId;

  // Sessão do profissional autenticado — fornece a unidade de saúde
  // padrão (healthUnitId) usada para travar o campo de unidade.
  const { professional } = useAuth();

  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>(initialPatientId);
  const [activeQueueId, setActiveQueueId] = useState<string | undefined>(
    initialQueueId ? String(initialQueueId) : undefined
  );
  const [publicQueue, setPublicQueue] = useState<PublicQueuePatient[]>([]);
  const [susSearch, setSusSearch] = useState('');
  const [susSearchError, setSusSearchError] = useState('');
  const [susSearchLoading, setSusSearchLoading] = useState(false);

  // Catálogo de vacinas — carregado uma vez do backend
  const [vaccineOptions, setVaccineOptions] = useState<string[]>([]);
  useEffect(() => {
    listVaccineNames().then(setVaccineOptions).catch(() => {});
  }, []);

  // Unidades de saúde cadastradas — carregadas uma vez do backend.
  // São a única fonte possível de opções ao trocar de unidade: o
  // profissional nunca digita um nome livre, só seleciona uma
  // unidade real desta lista.
  const [healthUnits, setHealthUnits] = useState<HealthUnit[]>([]);
  useEffect(() => {
    listHealthUnits().then(setHealthUnits).catch(() => {});
  }, []);

  // Unidade de saúde selecionada para o registro. Começa travada na
  // unidade vinculada ao profissional (professional.healthUnitId).
  const [selectedUnit, setSelectedUnit] = useState<HealthUnit | undefined>(undefined);
  const [unitEditMode, setUnitEditMode] = useState<UnitEditMode>('locked');
  const [unitVerifyRegistry, setUnitVerifyRegistry] = useState('');
  const [unitVerifyError, setUnitVerifyError] = useState('');
  const [unitVerifying, setUnitVerifying] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);

  // Assim que a lista de unidades e o profissional estiverem
  // disponíveis, pré-seleciona a unidade vinculada a ele.
  useEffect(() => {
    if (selectedUnit || healthUnits.length === 0) return;
    const ownUnit = professional?.healthUnitId
      ? healthUnits.find(u => u.id === professional.healthUnitId)
      : undefined;
    if (ownUnit) setSelectedUnit(ownUnit);
  }, [healthUnits, professional, selectedUnit]);

  const resetUnitToOwn = useCallback(() => {
    setUnitEditMode('locked');
    setUnitVerifyRegistry('');
    setUnitVerifyError('');
    setShowUnitDropdown(false);
    const ownUnit = professional?.healthUnitId
      ? healthUnits.find(u => u.id === professional.healthUnitId)
      : undefined;
    setSelectedUnit(ownUnit);
  }, [professional, healthUnits]);

  const startUnitChange = () => {
    setUnitEditMode('verifying');
    setUnitVerifyRegistry('');
    setUnitVerifyError('');
  };

  const cancelUnitChange = () => {
    resetUnitToOwn();
  };

  const confirmUnitChange = async () => {
    if (!unitVerifyRegistry.trim()) {
      setUnitVerifyError('Informe seu CRM ou COREN para liberar a troca.');
      return;
    }
    setUnitVerifying(true);
    try {
      await verifyProfessionalRegistry(unitVerifyRegistry.trim());
      setUnitEditMode('unlocked');
      setUnitVerifyError('');
    } catch (err) {
      setUnitVerifyError(
        err instanceof ApiError ? err.message : 'Não foi possível confirmar o registro. Tente novamente.'
      );
    } finally {
      setUnitVerifying(false);
    }
  };

  const reloadQueue = useCallback(() => {
    getPublicVaccinationQueue().then(setPublicQueue).catch(() => {});
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (network === 'public') reloadQueue();
    }, [network, reloadQueue])
  );

  useEffect(() => {
    if (initialPatientId) {
      setSelectedPatientId(String(initialPatientId));
      setActiveQueueId(initialQueueId ? String(initialQueueId) : undefined);
      setSusSearch('');
      setSusSearchError('');
    }
  }, [initialPatientId, initialQueueId]);

  // Busca o perfil completo do paciente selecionado (sempre atualizado)
  const [patient, setPatient] = useState<PatientProfile | undefined>(undefined);
  useEffect(() => {
    if (!selectedPatientId) {
      setPatient(undefined);
      return;
    }
    let active = true;
    getPatientProfile(selectedPatientId).then(p => { if (active) setPatient(p); }).catch(() => { if (active) setPatient(undefined); });
    return () => { active = false; };
  }, [selectedPatientId]);

  // ── Estados do formulário (nomes alinhados ao payload da API) ──
  const [vaccine,      setVaccine]      = useState('');
  const [dose,         setDose]         = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [lot,          setLot]          = useState('');
  const [date,         setDate]         = useState('');
  const [notes,        setNotes]        = useState('');

  // ── Estados de controle de UI ────────────────────────────
  const [showVaccine,      setShowVaccine]      = useState(false);
  const [showManufacturer, setShowManufacturer] = useState(false);
  const [showSuccess,      setShowSuccess]      = useState(false);
  const [submitting,       setSubmitting]       = useState(false);

  // ── Máscara de data ──────────────────────────────────────
  const handleDate = (t: string) => {
    const d = t.replace(/\D/g, '').slice(0, 8);
    let m = d;
    if (d.length > 2) m = d.slice(0, 2) + '/' + d.slice(2);
    if (d.length > 4) m = m.slice(0, 5) + '/' + d.slice(4);
    setDate(m);
  };

  const formatSusNumber = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 15);
    return digits
      .replace(/^(\d{3})(\d)/, '$1 $2')
      .replace(/^(\d{3}) (\d{4})(\d)/, '$1 $2 $3')
      .replace(/^(\d{3}) (\d{4}) (\d{4})(\d)/, '$1 $2 $3 $4');
  };

  const handleSusSearchChange = (text: string) => {
    setSusSearch(formatSusNumber(text));
    if (susSearchError) setSusSearchError('');
  };

  const handleFindPatientBySus = async () => {
    const query = susSearch.replace(/\D/g, '');

    if (query.length < 15) {
      setSusSearchError('Informe os 15 dígitos do Cartão Nacional de Saúde.');
      return;
    }

    setSusSearchLoading(true);
    try {
      const foundPatient = await findPatientBySus(query);
      if (!foundPatient) {
        setSusSearchError('Nenhum paciente encontrado com esse número do SUS.');
        return;
      }
      setSelectedPatientId(foundPatient.id);
      setSusSearchError('');
    } catch (error) {
      setSusSearchError(error instanceof ApiError ? error.message : 'Não foi possível buscar o paciente.');
    } finally {
      setSusSearchLoading(false);
    }
  };

  const handleStartQueuedPatient = (item: PublicQueuePatient) => {
    setSelectedPatientId(item.patient.id);
    setActiveQueueId(item.id);
    setSusSearch('');
    setSusSearchError('');
  };

  const handleBackToQueue = () => {
    setSelectedPatientId(undefined);
    setActiveQueueId(undefined);
    reloadQueue();
  };

  const resetForm = () => {
    setVaccine('');
    setDose('');
    setManufacturer('');
    setLot('');
    setDate('');
    setNotes('');
    setShowVaccine(false);
    setShowManufacturer(false);
    // A unidade de saúde volta a ser a vinculada ao profissional,
    // travada novamente para o próximo registro.
    resetUnitToOwn();
  };

  // ── Validação e envio ────────────────────────────────────
  const handleSubmit = async () => {
    if (!patient) {
      Alert.alert('Paciente não identificado', 'Busque o paciente pelo número do SUS antes de registrar a vacinação.');
      return;
    }

    if (!vaccine || !date) {
      Alert.alert('Campos obrigatórios', 'Selecione a vacina e informe a data de aplicação.');
      return;
    }

    if (!selectedUnit) {
      Alert.alert(
        'Unidade de saúde obrigatória',
        'Selecione uma unidade de saúde válida. Se necessário, confirme seu CRM/COREN para trocar de unidade.'
      );
      return;
    }

    setSubmitting(true);
    try {
      await registerVaccination({
        patientId: patient.id,
        vaccine,
        dose,
        manufacturer,
        lot,
        date,
        healthUnitId: selectedUnit.id,
        notes,
        networkType: network,
      });
      setShowSuccess(true);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Não foi possível registrar a vacinação. Tente novamente.';
      Alert.alert('Erro ao registrar', message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Ao fechar o modal, volta para o perfil do paciente ──
  const handleSuccessDismiss = async () => {
    setShowSuccess(false);
    if (activeQueueId) {
      try {
        await removePublicQueuePatient(activeQueueId);
      } catch {
        // Se a remoção falhar, a recepção ainda pode removê-lo manualmente depois.
      }
      reloadQueue();
    }

    if (!initialPatientId && network === 'public') {
      resetForm();
      setSelectedPatientId(undefined);
      setActiveQueueId(undefined);
      return;
    }

    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* ── HEADER ──────────────────────────────────────── */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back" size={22} color={Colors.PROFESSIONAL} />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Registrar Vacinação</Text>
            <Text style={styles.subtitle}>Preencha os dados do procedimento</Text>
          </View>
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── CARTÃO FIXO DO PACIENTE ──────────────────── */}
          {!patient && network === 'public' && (
            <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.queuePanel}>
              <View style={styles.queuePanelHeader}>
                <View>
                  <Text style={styles.queueTitle}>Fila de Vacinação</Text>
                  <Text style={styles.queueSubtitle}>Selecione um paciente triado para registrar a vacina.</Text>
                </View>
                <View style={styles.queueBadge}>
                  <Text style={styles.queueBadgeText}>{publicQueue.length} na fila</Text>
                </View>
              </View>

              {publicQueue.length === 0 ? (
                <View style={styles.emptyQueue}>
                  <Ionicons name="people-outline" size={26} color={Colors.NEUTRAL.MUTED} />
                  <Text style={styles.emptyQueueTitle}>Fila vazia</Text>
                  <Text style={styles.emptyQueueText}>A recepção ainda não encaminhou pacientes para vacinação.</Text>
                </View>
              ) : (
                publicQueue.map((item, i) => (
                  <Animated.View key={item.id} entering={FadeInDown.delay(120 + i * 55).duration(350)} style={styles.queueItem}>
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
                    <TouchableOpacity
                      style={styles.startCareBtn}
                      onPress={() => handleStartQueuedPatient(item)}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="play" size={14} color={Colors.NEUTRAL.WHITE} />
                      <Text style={styles.startCareText}>Iniciar</Text>
                    </TouchableOpacity>
                  </Animated.View>
                ))
              )}
            </Animated.View>
          )}

          {!patient && network !== 'public' && (
            <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.identificationCard}>
              <View style={styles.identificationIcon}>
                <Ionicons name="card-outline" size={24} color={Colors.PROFESSIONAL} />
              </View>
              <Text style={styles.identificationTitle}>Identificar paciente</Text>
              <Text style={styles.identificationText}>
                Na rede pública, registre a vacinação após localizar o paciente pelo Cartão Nacional de Saúde.
              </Text>
              <InputField
                label="Número do SUS"
                value={susSearch}
                onChangeText={handleSusSearchChange}
                icon="id-card-outline"
                keyboardType="numeric"
                placeholder="000 0000 0000 0000"
              />
              {susSearchError ? <Text style={styles.searchError}>{susSearchError}</Text> : null}
              <PrimaryButton
                label={susSearchLoading ? 'Buscando...' : 'Buscar Paciente'}
                onPress={handleFindPatientBySus}
                variant="professional"
                disabled={susSearchLoading}
              />
            </Animated.View>
          )}

          {patient && (
            <Animated.View entering={FadeInDown.delay(80).duration(400)}>
              <PatientContextCard patient={patient} />
              {network === 'public' && (
                <TouchableOpacity style={styles.changePatientBtn} onPress={handleBackToQueue}>
                  <Ionicons name="swap-horizontal-outline" size={16} color={Colors.PROFESSIONAL} />
                  <Text style={styles.changePatientText}>Voltar para fila</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          )}

          {/* ── CARD: UNIDADE DE SAÚDE ───────────────────── */}
          {patient && (
            <>
          <Animated.View entering={FadeInDown.delay(120).duration(400)} style={styles.card}>
            <Text style={styles.cardTitle}>Unidade de Saúde *</Text>

            {unitEditMode === 'locked' && (
              <View style={unitStyles.lockedBox}>
                <View style={unitStyles.lockedIcon}>
                  <Ionicons name="lock-closed" size={16} color={Colors.PROFESSIONAL} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={unitStyles.lockedName} numberOfLines={1}>
                    {selectedUnit?.name ?? 'Nenhuma unidade vinculada ao seu cadastro'}
                  </Text>
                  {selectedUnit?.address && (
                    <Text style={unitStyles.lockedAddress} numberOfLines={1}>{selectedUnit.address}</Text>
                  )}
                </View>
                <TouchableOpacity onPress={startUnitChange} hitSlop={8}>
                  <Text style={unitStyles.changeLink}>Trocar</Text>
                </TouchableOpacity>
              </View>
            )}

            {unitEditMode === 'verifying' && (
              <View>
                <Text style={unitStyles.verifyHint}>
                  Para registrar em outra unidade, confirme seu CRM ou COREN cadastrado.
                </Text>
                <InputField
                  label="CRM ou COREN"
                  value={unitVerifyRegistry}
                  onChangeText={setUnitVerifyRegistry}
                  icon="card-outline"
                  placeholder="Digite seu registro profissional"
                  autoCapitalize="none"
                />
                {unitVerifyError ? <Text style={unitStyles.verifyError}>{unitVerifyError}</Text> : null}
                <View style={unitStyles.verifyActions}>
                  <TouchableOpacity style={unitStyles.cancelBtn} onPress={cancelUnitChange}>
                    <Text style={unitStyles.cancelBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[unitStyles.confirmBtn, unitVerifying && unitStyles.confirmBtnDisabled]}
                    onPress={confirmUnitChange}
                    disabled={unitVerifying}
                  >
                    <Text style={unitStyles.confirmBtnText}>{unitVerifying ? 'Verificando...' : 'Confirmar'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {unitEditMode === 'unlocked' && (
              <View>
                <DropdownSelector
                  label="Unidade de saúde"
                  value={selectedUnit?.name ?? ''}
                  options={healthUnits.map(u => u.name)}
                  isOpen={showUnitDropdown}
                  onToggle={() => setShowUnitDropdown(v => !v)}
                  onSelect={(name) => {
                    const unit = healthUnits.find(u => u.name === name);
                    if (unit) setSelectedUnit(unit);
                    setShowUnitDropdown(false);
                  }}
                  icon="business-outline"
                  placeholder="Selecionar unidade de saúde"
                />
                <TouchableOpacity style={unitStyles.useOwnUnitLink} onPress={cancelUnitChange} hitSlop={8}>
                  <Text style={unitStyles.changeLink}>Usar minha unidade novamente</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>

          {/* ── CARD: VACINA ─────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.card}>
            <Text style={styles.cardTitle}>Vacina Administrada *</Text>

            <DropdownSelector
              label="Vacina"
              value={vaccine}
              options={vaccineOptions}
              isOpen={showVaccine}
              onToggle={() => { setShowVaccine(v => !v); setShowManufacturer(false); }}
              onSelect={v => { setVaccine(v); setShowVaccine(false); }}
              icon="medical-outline"
              placeholder="Selecionar vacina"
            />

            <InputField
              label="Dose"
              value={dose}
              onChangeText={setDose}
              icon="layers-outline"
              placeholder="Ex: 1ª Dose, 2ª Dose, Reforço..."
            />
          </Animated.View>

          {/* ── CARD: FABRICANTE ─────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(210).duration(400)} style={styles.card}>
            <Text style={styles.cardTitle}>Fabricante</Text>

            <DropdownSelector
              label="Fabricante"
              value={manufacturer}
              options={availableManufacturers}
              isOpen={showManufacturer}
              onToggle={() => { setShowManufacturer(v => !v); setShowVaccine(false); }}
              onSelect={v => { setManufacturer(v); setShowManufacturer(false); }}
              icon="business-outline"
              placeholder="Selecionar fabricante"
            />
          </Animated.View>

          {/* ── CARD: DETALHES DO REGISTRO ───────────────── */}
          <Animated.View entering={FadeInDown.delay(270).duration(400)} style={styles.card}>
            <Text style={styles.cardTitle}>Detalhes do Registro *</Text>

            <InputField
              label="Data de aplicação"
              value={date}
              onChangeText={handleDate}
              icon="calendar-outline"
              keyboardType="numeric"
              placeholder="DD/MM/AAAA"
            />
            <InputField
              label="Nº de Lote"
              value={lot}
              onChangeText={setLot}
              icon="barcode-outline"
              placeholder="Ex: ABC123456"
              autoCapitalize="none"
            />
            <InputField
              label="Observações"
              value={notes}
              onChangeText={setNotes}
              icon="document-text-outline"
              placeholder="Reações, anotações..."
            />
          </Animated.View>

          {/* ── BOTÃO PRINCIPAL ──────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(330).duration(400)}>
            <PrimaryButton
              label={submitting ? 'Registrando...' : 'Registrar Vacinação'}
              onPress={handleSubmit}
              variant="professional"
              disabled={submitting}
            />
          </Animated.View>
            </>
          )}

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── MODAL DE SUCESSO ──────────────────────────────── */}
      <SuccessModal
        visible={showSuccess}
        onDismiss={handleSuccessDismiss}
        patientName={patient?.name ?? ''}
      />
    </SafeAreaView>
  );
}

// -------------------------------------------------------
// ESTILOS
// -------------------------------------------------------
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.BACKGROUND },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    backgroundColor: Colors.NEUTRAL.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.PROFESSIONAL_LIGHT,
    alignItems: 'center', justifyContent: 'center',
  },
  title:    { fontSize: 18, fontWeight: '800', color: Colors.NEUTRAL.DARK_TEXT },
  subtitle: { fontSize: 13, color: Colors.NEUTRAL.MUTED, marginTop: 2 },

  // Conteúdo
  content: { padding: 16 },

  queuePanel: {
    backgroundColor: Colors.NEUTRAL.WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
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
    marginBottom: 14,
  },
  queueTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.NEUTRAL.DARK_TEXT,
  },
  queueSubtitle: {
    fontSize: 13,
    color: Colors.NEUTRAL.MUTED,
    lineHeight: 19,
    marginTop: 3,
  },
  queueBadge: {
    backgroundColor: Colors.PROFESSIONAL_LIGHT,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GREEN,
    flexShrink: 0,
  },
  queueBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.PROFESSIONAL,
  },
  emptyQueue: {
    alignItems: 'center',
    backgroundColor: Colors.CARD_BG,
    borderRadius: 14,
    padding: 22,
  },
  emptyQueueTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.NEUTRAL.DARK_TEXT,
    marginTop: 8,
  },
  emptyQueueText: {
    fontSize: 13,
    color: Colors.NEUTRAL.MUTED,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 3,
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
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.PROFESSIONAL,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  queuePositionText: {
    fontSize: 15,
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

  identificationCard: {
    backgroundColor: Colors.NEUTRAL.WHITE,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  identificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.PROFESSIONAL_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  identificationTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.NEUTRAL.DARK_TEXT,
    marginBottom: 6,
  },
  identificationText: {
    fontSize: 13,
    color: Colors.NEUTRAL.MUTED,
    lineHeight: 19,
    marginBottom: 16,
  },
  searchError: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.STATUS.OVERDUE,
    marginTop: -6,
    marginBottom: 12,
  },
  changePatientBtn: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginTop: -4,
    marginBottom: 6,
  },
  changePatientText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.PROFESSIONAL,
  },

  // Cards de seção
  card: {
    backgroundColor: Colors.NEUTRAL.WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.NEUTRAL.MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
});
