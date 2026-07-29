// ============================================================
// TELA: Lista de Pacientes do Profissional
// DESCRIÇÃO: Exibe todos os pacientes cadastrados com busca por
//            nome ou CPF. Mostra avatar, dados básicos, última
//            vacina e badge de pendências. Permite navegar para
//            o detalhamento de cada paciente.
// ACESSO: Profissional
// ROTA: /app/(professional)/patients.tsx
// ============================================================

// --- Bibliotecas principais do React ---
import React, { useCallback, useEffect, useState } from 'react';

// --- Componentes de layout e interação do React Native ---
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// --- Animações com Reanimated ---
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

// --- Área segura (evita sobreposição com status bar e notch) ---
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Navegação ---
import { router, useFocusEffect } from 'expo-router';

// --- Controle da barra de status do sistema operacional ---
import { StatusBar } from 'expo-status-bar';

// --- Ícones vetoriais da biblioteca Ionicons ---
import { Ionicons } from '@expo/vector-icons';

// --- Paleta de cores oficial do VacinApp ---
import { Colors } from '../../constants/Colors';

// --- Tipos ---
import type { Patient } from '../../constants/MockData';

// --- Sessão do profissional autenticado ---
import { useAuth } from '../../contexts/AuthContext';

// --- API real ---
import { listPatients } from '../../services/api/patients';

// -------------------------------------------------------
// COMPONENTE PRINCIPAL: Tela de Lista de Pacientes
// -------------------------------------------------------
export default function PatientsScreen() {
  const { professional } = useAuth();
  const network = professional?.networkType ?? 'public';

  // Estado que armazena o texto digitado na barra de busca
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPatients = useCallback((search?: string) => {
    setLoading(true);
    listPatients(search)
      .then(setPatients)
      .catch(() => setPatients([]))
      .finally(() => setLoading(false));
  }, []);

  // Recarrega a lista sempre que a tela ganha foco (ex.: após registrar uma vacina)
  useFocusEffect(useCallback(() => { loadPatients(query); }, [loadPatients]));

  // Busca com pequeno atraso (debounce) para não disparar uma requisição a cada tecla
  useEffect(() => {
    const timer = setTimeout(() => loadPatients(query), 350);
    return () => clearTimeout(timer);
  }, [query, loadPatients]);

  const goToPatientProfile = (patientId: string) =>
    router.push({ pathname: '/(professional)/patient-profile', params: { patientId, network } });

  return (
    // Container principal com área segura
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />

      {/* ---- CABEÇALHO: Título e contagem de pacientes ---- */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <Text style={styles.title}>Meus Pacientes</Text>
        <Text style={styles.subtitle}>{patients.length} pacientes cadastrados</Text>
      </Animated.View>

      {/* ---- BARRA DE BUSCA ---- */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={Colors.NEUTRAL.MUTED} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nome ou CPF..."
          placeholderTextColor={Colors.NEUTRAL.MUTED}
          value={query}
          onChangeText={setQuery}
        />
        {loading && <ActivityIndicator size="small" color={Colors.PROFESSIONAL} />}
      </Animated.View>

      {/* ---- LISTA DE PACIENTES ---- */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
        {!loading && patients.length === 0 && (
          <Text style={styles.emptyText}>Nenhum paciente encontrado.</Text>
        )}
        {patients.map((p, i) => (
          <Animated.View key={p.id} entering={FadeInDown.delay(150 + i * 70).duration(350)} style={styles.card}>
            {/* Lado esquerdo: avatar + dados do paciente */}
            <View style={styles.cardLeft}>
              {/* Avatar circular com a inicial do nome */}
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{p.name.charAt(0)}</Text>
              </View>
              {/* Informações textuais do paciente */}
              <View style={styles.info}>
                <Text style={styles.name}>{p.name}</Text>
                <Text style={styles.meta}>{p.age} anos · CPF: {p.cpf}</Text>
                {/* Última vacina aplicada com ícone */}
                <Text style={styles.lastVaccine}>
                  <Ionicons name="medical" size={11} color={Colors.NEUTRAL.MUTED} /> Última: {p.lastVaccine} ({p.lastVaccineDate})
                </Text>
              </View>
            </View>

            {/* Lado direito: badge de pendências + botão de detalhe */}
            <View style={styles.cardRight}>
              {/* Badge vermelho com a contagem de vacinas pendentes */}
              {p.pendingCount > 0 && (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingText}>{p.pendingCount}✕</Text>
                </View>
              )}
              {/* Botão para ver detalhes do paciente */}
              <TouchableOpacity style={styles.viewBtn} onPress={() => goToPatientProfile(p.id)}>
                <Text style={styles.viewBtnText}>Ver</Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.PROFESSIONAL} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        ))}
        {/* Espaço extra no final da lista */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// -------------------------------------------------------
// ESTILOS DA TELA
// -------------------------------------------------------
const styles = StyleSheet.create({
  // === CONTAINER PRINCIPAL ===
  safe:         { flex: 1, backgroundColor: Colors.BACKGROUND },

  // === CABEÇALHO ===
  header:       { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  title:        { fontSize: 24, fontWeight: '800', color: Colors.NEUTRAL.DARK_TEXT },
  subtitle:     { fontSize: 14, color: Colors.NEUTRAL.MUTED, marginTop: 2 },

  // === BARRA DE BUSCA ===
  searchWrap:   { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.NEUTRAL.WHITE, marginHorizontal: 16, marginBottom: 8, borderRadius: 14, paddingHorizontal: 14, height: 48, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  searchInput:  { flex: 1, fontSize: 14, color: Colors.NEUTRAL.DARK_TEXT },

  // === LISTA ===
  list:         { flex: 1 },
  emptyText:    { fontSize: 13, color: Colors.NEUTRAL.MUTED, textAlign: 'center', marginTop: 30 },

  // === CARD DO PACIENTE ===
  card:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.NEUTRAL.WHITE, borderRadius: 16, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardLeft:     { flexDirection: 'row', alignItems: 'center', flex: 1 },

  // === AVATAR COM INICIAL DO NOME ===
  avatar:       { width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.PROFESSIONAL, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText:   { fontSize: 20, fontWeight: '800', color: Colors.NEUTRAL.WHITE },

  // === TEXTOS DE INFORMAÇÃO ===
  info:         { flex: 1 },
  name:         { fontSize: 15, fontWeight: '700', color: Colors.NEUTRAL.DARK_TEXT },
  meta:         { fontSize: 12, color: Colors.NEUTRAL.MUTED, marginTop: 2 },
  lastVaccine:  { fontSize: 11, color: Colors.NEUTRAL.MUTED, marginTop: 3 },

  // === LADO DIREITO DO CARD ===
  cardRight:    { alignItems: 'flex-end', gap: 6 },
  pendingBadge: { backgroundColor: Colors.STATUS.OVERDUE + '15', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  pendingText:  { fontSize: 11, color: Colors.STATUS.OVERDUE, fontWeight: '700' },
  viewBtn:      { flexDirection: 'row', alignItems: 'center', gap: 2 },
  viewBtnText:  { fontSize: 13, color: Colors.PROFESSIONAL, fontWeight: '600' },
});
