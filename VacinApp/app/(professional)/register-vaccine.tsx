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
//     location: string,
//     notes: string,
//     networkType: string,
//   }
//
// ACESSO: Profissional
// ROTA: /app/(professional)/register-vaccine.tsx
// ============================================================

import React, { useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { InputField } from '../../components/InputField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { availableVaccines, availableManufacturers, mockPatientProfiles } from '../../constants/MockData';
import { PatientContextCard, SuccessModal } from '../../components/professional';

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
// COMPONENTE PRINCIPAL
// -------------------------------------------------------
export default function RegisterVaccineScreen() {
  const params    = useLocalSearchParams<{ patientId?: string; network?: string }>();
  const initialPatientId = params.patientId;
  const network   = params.network ?? 'public';
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>(initialPatientId);
  const [susSearch, setSusSearch] = useState('');
  const [susSearchError, setSusSearchError] = useState('');

  // Busca o perfil do paciente pelo ID
  // Futuramente: GET /patients/{patientId}/profile
  const patient = selectedPatientId
    ? mockPatientProfiles.find(p => p.id === selectedPatientId)
    : undefined;

  // ── Estados do formulário (nomes alinhados ao payload da API) ──
  const [vaccine,      setVaccine]      = useState('');
  const [dose,         setDose]         = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [lot,          setLot]          = useState('');
  const [date,         setDate]         = useState('');
  const [location,     setLocation]     = useState('');
  const [notes,        setNotes]        = useState('');

  // ── Estados de controle de UI ────────────────────────────
  const [showVaccine,      setShowVaccine]      = useState(false);
  const [showManufacturer, setShowManufacturer] = useState(false);
  const [showSuccess,      setShowSuccess]      = useState(false);

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

  const handleFindPatientBySus = () => {
    const query = susSearch.replace(/\D/g, '');

    if (query.length < 15) {
      setSusSearchError('Informe os 15 dígitos do Cartão Nacional de Saúde.');
      return;
    }

    const foundPatient = mockPatientProfiles.find(p => p.sus.replace(/\D/g, '') === query);

    if (!foundPatient) {
      setSusSearchError('Nenhum paciente encontrado com esse número do SUS.');
      return;
    }

    setSelectedPatientId(foundPatient.id);
    setSusSearchError('');
  };

  // ── Validação e envio ────────────────────────────────────
  const handleSubmit = () => {
    if (!patient) {
      Alert.alert('Paciente não identificado', 'Busque o paciente pelo número do SUS antes de registrar a vacinação.');
      return;
    }

    if (!vaccine || !date) {
      Alert.alert('Campos obrigatórios', 'Selecione a vacina e informe a data de aplicação.');
      return;
    }

    // Payload preparado para a API
    // TODO: await api.post('/vaccinations', payload);
    const payload = {
      patientId: patient.id,
      vaccine,
      dose,
      manufacturer,
      lot,
      date,
      location,
      notes,
      networkType: network,
    };
    console.log('Registrar Vacinação (payload pronto para API):', payload);

    // Exibe o modal de sucesso
    setShowSuccess(true);
  };

  // ── Ao fechar o modal, volta para o perfil do paciente ──
  const handleSuccessDismiss = () => {
    setShowSuccess(false);
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
          {!patient && (
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
                label="Buscar Paciente"
                onPress={handleFindPatientBySus}
                variant="professional"
              />
            </Animated.View>
          )}

          {patient && (
            <Animated.View entering={FadeInDown.delay(80).duration(400)}>
              <PatientContextCard patient={patient} />
              {!initialPatientId && (
                <TouchableOpacity style={styles.changePatientBtn} onPress={() => setSelectedPatientId(undefined)}>
                  <Ionicons name="swap-horizontal-outline" size={16} color={Colors.PROFESSIONAL} />
                  <Text style={styles.changePatientText}>Trocar paciente</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          )}

          {/* ── CARD: VACINA ─────────────────────────────── */}
          {patient && (
            <>
          <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.card}>
            <Text style={styles.cardTitle}>Vacina Administrada *</Text>

            <DropdownSelector
              label="Vacina"
              value={vaccine}
              options={availableVaccines}
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
              label="Local de aplicação"
              value={location}
              onChangeText={setLocation}
              icon="location-outline"
              placeholder="Ex: UBS Jardim América"
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
              label="Registrar Vacinação"
              onPress={handleSubmit}
              variant="professional"
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
