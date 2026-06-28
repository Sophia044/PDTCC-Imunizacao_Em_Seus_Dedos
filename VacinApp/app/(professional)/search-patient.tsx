// ============================================================
// TELA: Buscar Paciente
// DESCRIÇÃO: Tela de busca de pacientes unificada, usada tanto
//            pela Rede Pública quanto pela Rede Privada.
//
//            Rede Pública: acessada via botão "Buscar Paciente"
//            Rede Privada: acessada via "Atender sem agendamento"
//
//            Filtros disponíveis:
//              - Nome
//              - CPF
//              - Nº SUS
//              - Convênio
//
//            Toda navegação usa IDs para preparar integração futura.
//
// PREPARADO PARA BACKEND:
//   Em produção, a busca chamará GET /patients/search?q={query}&filter={filter}
//   e retornará uma lista paginada de PatientProfile.
//
// ACESSO: Profissional
// ROTA: /app/(professional)/search-patient.tsx
// ============================================================

import React, { useState } from 'react';
import {
  ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { mockPatientProfiles } from '../../constants/MockData';
import type { PatientSearchFilter } from '../../constants/MockData';
import { PatientCard } from '../../components/professional';

// -------------------------------------------------------
// Configuração dos filtros de busca
// -------------------------------------------------------
const FILTERS: { key: PatientSearchFilter; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { key: 'name', label: 'Nome',      icon: 'person-outline'            },
  { key: 'cpf',  label: 'CPF',       icon: 'card-outline'              },
  { key: 'sus',  label: 'Nº SUS',    icon: 'id-card-outline'           },
  { key: 'plan', label: 'Convênio',  icon: 'shield-checkmark-outline'  },
];

// -------------------------------------------------------
// COMPONENTE PRINCIPAL
// -------------------------------------------------------
export default function SearchPatientScreen() {
  const params  = useLocalSearchParams<{ network?: string }>();
  const network = params.network ?? 'public';

  const [query,  setQuery]  = useState('');
  const [filter, setFilter] = useState<PatientSearchFilter>('name');

  // ── Filtragem local (substituir por chamada de API futuramente) ──
  const results = query.trim().length === 0
    ? mockPatientProfiles
    : mockPatientProfiles.filter(p => {
        const q = query.toLowerCase();
        switch (filter) {
          case 'name': return p.name.toLowerCase().includes(q);
          case 'cpf':  return p.cpf.replace(/\D/g, '').includes(q.replace(/\D/g, ''));
          case 'sus':  return p.sus.replace(/\D/g, '').includes(q.replace(/\D/g, ''));
          case 'plan': return p.plan.toLowerCase().includes(q);
          default:     return false;
        }
      });

  // ── Navegar para perfil do paciente com ID ───────────────
  const goToProfile = (patientId: string) => {
    router.push({
      pathname: '/(professional)/patient-profile',
      params: { patientId, network },
    });
  };

  // ── Placeholder dinâmico por filtro ─────────────────────
  const placeholders: Record<PatientSearchFilter, string> = {
    name: 'Digite o nome do paciente...',
    cpf:  'Digite o CPF (ex: 123.456.789-00)',
    sus:  'Digite o número do Cartão SUS',
    plan: 'Digite o nome do convênio',
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />

      {/* ── HEADER ────────────────────────────────────────── */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={Colors.PROFESSIONAL} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Buscar Paciente</Text>
          <Text style={styles.subtitle}>
            {network === 'private' ? 'Rede Privada' : 'Rede Pública'}
          </Text>
        </View>
      </Animated.View>

      {/* ── CAMPO DE BUSCA ───────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={Colors.NEUTRAL.MUTED} />
        <TextInput
          style={styles.searchInput}
          placeholder={placeholders[filter]}
          placeholderTextColor={Colors.NEUTRAL.MUTED}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={Colors.NEUTRAL.MUTED} />
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* ── FILTROS ──────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(140).duration(400)} style={styles.filtersRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => { setFilter(f.key); setQuery(''); }}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === f.key }}
          >
            <Ionicons
              name={f.icon}
              size={13}
              color={filter === f.key ? Colors.NEUTRAL.WHITE : Colors.NEUTRAL.MUTED}
            />
            <Text style={[styles.filterLabel, filter === f.key && styles.filterLabelActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* ── CONTADOR DE RESULTADOS ───────────────────────── */}
      <Animated.View entering={FadeInDown.delay(180).duration(400)} style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {results.length} paciente{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
        </Text>
      </Animated.View>

      {/* ── LISTA DE RESULTADOS ───────────────────────────── */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {results.length === 0 ? (
          /* Estado vazio */
          <Animated.View entering={FadeIn.duration(350)} style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={Colors.BORDER} />
            <Text style={styles.emptyTitle}>Nenhum paciente encontrado</Text>
            <Text style={styles.emptySubtitle}>
              Tente outro termo ou mude o filtro de busca.
            </Text>
          </Animated.View>
        ) : (
          results.map((p, i) => (
            <Animated.View key={p.id} entering={FadeInDown.delay(200 + i * 60).duration(350)}>
              <PatientCard
                patient={p}
                onPress={goToProfile}
                showPlan={network === 'private'}
              />
            </Animated.View>
          ))
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: Colors.NEUTRAL.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.PROFESSIONAL_LIGHT,
    alignItems: 'center', justifyContent: 'center',
  },
  title:    { fontSize: 20, fontWeight: '800', color: Colors.NEUTRAL.DARK_TEXT },
  subtitle: { fontSize: 12, color: Colors.NEUTRAL.MUTED, marginTop: 1 },

  // Busca
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.NEUTRAL.WHITE,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.NEUTRAL.DARK_TEXT,
  },

  // Filtros
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.NEUTRAL.WHITE,
    borderWidth: 1.5,
    borderColor: Colors.BORDER,
  },
  filterChipActive: {
    backgroundColor: Colors.PROFESSIONAL,
    borderColor: Colors.PROFESSIONAL,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.NEUTRAL.MUTED,
  },
  filterLabelActive: {
    color: Colors.NEUTRAL.WHITE,
  },

  // Contador
  resultsHeader: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  resultsCount: {
    fontSize: 13,
    color: Colors.NEUTRAL.MUTED,
    fontWeight: '500',
  },

  // Lista
  list:        { flex: 1 },
  listContent: { paddingHorizontal: 16 },

  // Estado vazio
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 10,
  },
  emptyTitle:    { fontSize: 16, fontWeight: '700', color: Colors.NEUTRAL.MUTED },
  emptySubtitle: { fontSize: 13, color: Colors.NEUTRAL.MUTED, textAlign: 'center', lineHeight: 19 },
});
