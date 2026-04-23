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
import React, { useState } from 'react';

// --- Componentes de layout e interação do React Native ---
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// --- Animações com Reanimated ---
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

// --- Área segura (evita sobreposição com status bar e notch) ---
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Controle da barra de status do sistema operacional ---
import { StatusBar } from 'expo-status-bar';

// --- Ícones vetoriais da biblioteca Ionicons ---
import { Ionicons } from '@expo/vector-icons';

// --- Paleta de cores oficial do VacinApp ---
import { Colors } from '../../constants/Colors';

// --- Dados mockados (simulam retorno de API) ---
import { mockPatients } from '../../constants/MockData';

// -------------------------------------------------------
// COMPONENTE PRINCIPAL: Tela de Lista de Pacientes
// -------------------------------------------------------
export default function PatientsScreen() {
  // Estado que armazena o texto digitado na barra de busca
  const [query, setQuery] = useState('');

  // Filtra os pacientes com base no texto digitado
  // Busca por nome (case insensitive) ou por CPF
  const filtered = mockPatients.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.cpf.includes(query)
  );

  return (
    // Container principal com área segura
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />

      {/* ---- CABEÇALHO: Título e contagem de pacientes ---- */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <Text style={styles.title}>Meus Pacientes</Text>
        <Text style={styles.subtitle}>{mockPatients.length} pacientes cadastrados</Text>
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
      </Animated.View>

      {/* ---- LISTA DE PACIENTES ---- */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
        {filtered.map((p, i) => (
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
              <TouchableOpacity style={styles.viewBtn}>
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
