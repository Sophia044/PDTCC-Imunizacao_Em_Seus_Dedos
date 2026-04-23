// ============================================================
// TELA: Mapa de Postos de Vacinação
// DESCRIÇÃO: Exibe um mapa interativo com os postos de vacinação
//            próximos ao usuário, uma barra de busca e uma lista
//            de cards com detalhes de cada unidade de saúde.
// ACESSO: Paciente
// ROTA: /app/(patient)/map.tsx
// ============================================================

// --- Bibliotecas principais do React ---
import React, { useState, useEffect } from 'react';

// --- Componentes de layout e interação do React Native ---
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking,
  Alert,
  Platform,
} from 'react-native';

// --- Animações com Reanimated ---
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

// --- Área segura (evita sobreposição com status bar e notch) ---
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Controle da barra de status do sistema operacional ---
import { StatusBar } from 'expo-status-bar';

// --- Ícones vetoriais da biblioteca Ionicons ---
import { Ionicons } from '@expo/vector-icons';

// --- Acesso à localização GPS do dispositivo ---
import * as Location from 'expo-location';

// --- Paleta de cores oficial do VacinApp ---
import { Colors } from '../../constants/Colors';

// -------------------------------------------------------
// DADOS DE EXEMPLO (mock)
// Esses dados simulam o retorno de uma API real com os
// postos de saúde próximos ao usuário.
// Em produção, serão substituídos por chamadas ao back-end Python.
// -------------------------------------------------------
const healthUnits = [
  {
    id: 1,
    name: 'UBS Central',
    type: 'SUS',
    address: 'Rua das Flores, 123 - Centro',
    lat: -23.5489,
    lng: -46.6388,
    distance: '0,8 km',
    hours: 'Seg-Sex: 7h-17h',
    phone: '(11) 3333-1111',
  },
  {
    id: 2,
    name: 'UBS Vila Nova',
    type: 'SUS',
    address: 'Av. Paulista, 456 - Vila Nova',
    lat: -23.5550,
    lng: -46.6420,
    distance: '1,2 km',
    hours: 'Seg-Sex: 7h-19h | Sáb: 8h-12h',
    phone: '(11) 3333-2222',
  },
  {
    id: 3,
    name: 'Clínica Vida Saúde',
    type: 'Particular',
    address: 'R. das Acácias, 789 - Vila Nova',
    lat: -23.5460,
    lng: -46.6310,
    distance: '2,1 km',
    hours: 'Seg-Sáb: 08h-20h',
    phone: '(11) 3333-3333',
  },
  {
    id: 4,
    name: 'UBS Jardim América',
    type: 'SUS',
    address: 'Av. Brasil, 456 - Jd. América',
    lat: -23.5530,
    lng: -46.6290,
    distance: '2,8 km',
    hours: 'Seg-Sex: 07h-19h',
    phone: '(11) 3333-4444',
  },
  {
    id: 5,
    name: 'UBS Vila Esperança',
    type: 'SUS',
    address: 'R. da Paz, 321 - Vila Esperança',
    lat: -23.5570,
    lng: -46.6350,
    distance: '3,0 km',
    hours: 'Seg-Sex: 07h-17h',
    phone: '(11) 3333-5555',
  },
];

// -------------------------------------------------------
// Define a interface de um posto de saúde
// -------------------------------------------------------
interface HealthUnit {
  id: number;
  name: string;          // Nome do estabelecimento
  type: string;          // 'SUS' ou 'Particular'
  address: string;       // Endereço completo
  lat: number;           // Latitude para o mapa
  lng: number;           // Longitude para o mapa
  distance: string;      // Distância aproximada do usuário
  hours: string;         // Horário de funcionamento
  phone: string;         // Telefone de contato
}

// -------------------------------------------------------
// Componente interno: Card de um posto de saúde na lista
// Exibe nome, endereço, horário, telefone, distância e botão de rota
// -------------------------------------------------------
function UnitCard({ unit, index }: { unit: HealthUnit; index: number }) {
  // Verifica se é posto do SUS para definir a cor do badge
  const isSUS = unit.type === 'SUS';
  const badgeColor = isSUS ? Colors.PRIMARY : Colors.PROFESSIONAL;

  // Abre o Google Maps com a rota até o posto selecionado
  const openMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${unit.lat},${unit.lng}`;
    Linking.openURL(url).catch(() =>
      Alert.alert('Erro', 'Não foi possível abrir o Google Maps.')
    );
  };

  return (
    // Card animado com entrada em cascata baseada no índice
    <Animated.View entering={FadeInDown.delay(100 + index * 70).duration(350)} style={styles.card}>

      {/* ---- LINHA DO TOPO: Badge de tipo + Distância ---- */}
      <View style={styles.cardHeader}>
        {/* Badge colorido indicando SUS (roxo) ou Particular (verde) */}
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>{unit.type}</Text>
        </View>
        {/* Distância exibida no canto superior direito */}
        <Text style={styles.distanceText}>{unit.distance}</Text>
      </View>

      {/* ---- NOME DO POSTO ---- */}
      <Text style={styles.unitName}>{unit.name}</Text>

      {/* ---- INFORMAÇÕES: Endereço, Horário e Telefone ---- */}
      <View style={styles.infoRow}>
        <Ionicons name="location-outline" size={13} color={Colors.NEUTRAL.MUTED} />
        <Text style={styles.infoText}>{unit.address}</Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="time-outline" size={13} color={Colors.NEUTRAL.MUTED} />
        <Text style={styles.infoText}>{unit.hours}</Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="call-outline" size={13} color={Colors.NEUTRAL.MUTED} />
        <Text style={styles.infoText}>{unit.phone}</Text>
      </View>

      {/* ---- BOTÃO: Abrir rota no Google Maps ---- */}
      <TouchableOpacity style={styles.routeBtn} onPress={openMaps}>
        <Text style={styles.routeBtnText}>Rota →</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// -------------------------------------------------------
// COMPONENTE PRINCIPAL da tela de mapa
// -------------------------------------------------------
export default function MapScreen() {
  // Estado que armazena o texto digitado na barra de busca
  const [query, setQuery] = useState('');

  // Estado para coordenadas da localização do usuário (inicia no centro de SP)
  const [region] = useState({
    latitude: -23.5489,
    longitude: -46.6388,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  // Filtra os postos com base no texto digitado pelo usuário
  const filtered = healthUnits.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.address.toLowerCase().includes(query.toLowerCase())
  );

  // Solicita permissão de localização ao montar o componente
  useEffect(() => {
    (async () => {
      await Location.requestForegroundPermissionsAsync();
    })();
  }, []);

  // Função chamada ao pressionar o botão de GPS
  // Em web, a API de location não está disponível, portanto exibe alerta
  const handleGPS = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Autorize o acesso à localização nas configurações.');
      }
    } catch {
      Alert.alert('GPS', 'Localização não disponível nesta plataforma.');
    }
  };

  return (
    // Container principal com área segura (evita sobreposição com a barra de status)
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Barra de status com ícones claros (fundo escuro) */}
      <StatusBar style="light" />

      {/* ---- HEADER: Gradiente roxo com título ---- */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <Ionicons name="map" size={24} color="rgba(255,255,255,0.85)" />
        <View style={styles.headerTextBlock}>
          <Text style={styles.headerTitle}>Onde se Vacinar</Text>
          <Text style={styles.headerSub}>{healthUnits.length} postos encontrados</Text>
        </View>
      </Animated.View>

      {/* ---- BARRA DE BUSCA + BOTÃO GPS ---- */}
      <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.searchRow}>
        {/* Campo de texto para buscar postos */}
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={17} color={Colors.NEUTRAL.MUTED} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome ou bairro..."
            placeholderTextColor={Colors.NEUTRAL.MUTED}
            value={query}
            onChangeText={setQuery}
          />
          {/* Botão de limpar busca — aparece quando há texto digitado */}
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={17} color={Colors.NEUTRAL.MUTED} />
            </TouchableOpacity>
          )}
        </View>

        {/* Botão circular de GPS */}
        <TouchableOpacity style={styles.gpsBtn} onPress={handleGPS}>
          <Ionicons name="navigate" size={20} color={Colors.PRIMARY} />
        </TouchableOpacity>
      </Animated.View>

      {/* ---- MAPA VISUAL DECORATIVO (substitui MapView nativo que não funciona na web) ---- */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        {/* Container com bordas arredondadas e overflow hidden — OBRIGATÓRIO para o MapView */}
        <View style={styles.mapContainer}>
          {/* Fundo que simula o mapa (azul-esverdeado, como tiles de mapa real) */}
          <View style={styles.mapBackground}>
            {/* Grade decorativa que imita as ruas do mapa */}
            {[0, 1, 2, 3].map((r) => (
              <View key={r} style={styles.mapGridRow}>
                {[0, 1, 2, 3, 4].map((c) => (
                  <View key={c} style={styles.mapGridCell} />
                ))}
              </View>
            ))}
            {/* Pinos decorativos representando os postos no mapa */}
            {healthUnits.map((unit, i) => {
              // Distribui os pinos visualmente de forma pseudo-aleatória
              const positions = [
                { top: 30, left: 50 },
                { top: 60, left: 180 },
                { top: 100, left: 110 },
                { top: 40, left: 270 },
                { top: 80, left: 320 },
              ];
              const pos = positions[i] || { top: 50, left: 100 };
              const pinColor = unit.type === 'SUS' ? Colors.PRIMARY : Colors.PROFESSIONAL;
              return (
                <View
                  key={unit.id}
                  style={[styles.mapPin, { top: pos.top, left: pos.left, backgroundColor: pinColor }]}
                >
                  <Ionicons name="medkit" size={10} color="#fff" />
                </View>
              );
            })}
            {/* Indicador central de posição do usuário */}
            <View style={styles.userPin}>
              <View style={styles.userPinInner} />
            </View>
          </View>
        </View>
      </Animated.View>

      {/* ---- LEGENDA DO MAPA ---- */}
      <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.legendRow}>
        {/* Legenda: ponto roxo = SUS */}
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.PRIMARY }]} />
          <Text style={styles.legendText}>SUS / UBS</Text>
        </View>
        {/* Legenda: ponto verde = Particular */}
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.PROFESSIONAL }]} />
          <Text style={styles.legendText}>Particular</Text>
        </View>
      </Animated.View>

      {/* ---- TÍTULO DA LISTA DE POSTOS ---- */}
      <Animated.View entering={FadeInDown.delay(280).duration(400)} style={styles.listHeader}>
        <Text style={styles.listHeaderText}>
          {filtered.length} posto{filtered.length !== 1 ? 's' : ''} próximo{filtered.length !== 1 ? 's' : ''} ↓
        </Text>
      </Animated.View>

      {/* ---- LISTA DE CARDS DOS POSTOS ---- */}
      <ScrollView
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {/* Caso nenhum posto seja encontrado na busca */}
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={40} color={Colors.NEUTRAL.MUTED} />
            <Text style={styles.emptyText}>Nenhum posto encontrado</Text>
          </View>
        ) : (
          // Renderiza cada card de posto com animação escalonada
          filtered.map((unit, i) => (
            <UnitCard key={unit.id} unit={unit} index={i} />
          ))
        )}
        {/* Espaço extra no rodapé para não ficar colado na tab bar */}
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
  safe: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND, // Fundo lilás suave
  },

  // === CABEÇALHO ROXO COM GRADIENTE ===
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.PRIMARY,   // Fundo roxo principal
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTextBlock: {},
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },

  // === BARRA DE BUSCA + BOTÃO GPS ===
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: -14,         // Sobrepõe levemente o header para efeito flutuante
    marginBottom: 12,
    zIndex: 10,             // Garante que fique sobre o header
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.NEUTRAL.DARK_TEXT,
  },
  gpsBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },

  // === CONTAINER DO MAPA ===
  // IMPORTANTE: overflow: 'hidden' e borderRadius são obrigatórios.
  // NUNCA usar flex: 1 no mapa — causa problema de renderização.
  mapContainer: {
    marginHorizontal: 16,
    height: 160,              // Altura fixa — evita o bug de renderização em branco
    borderRadius: 16,
    overflow: 'hidden',       // Recorta os cantos do mapa
    marginBottom: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mapBackground: {
    flex: 1,
    backgroundColor: '#b8d4e8',  // Cor de fundo similar a tiles de mapa (azul-claro)
    position: 'relative',
  },
  mapGridRow: {
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  mapGridCell: {
    flex: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  mapPin: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userPin: {
    position: 'absolute',
    top: 65,
    left: 165,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#2979ff',
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2979ff',
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
  },
  userPinInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },

  // === LEGENDA DO MAPA ===
  legendRow: {
    flexDirection: 'row',
    gap: 20,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: Colors.NEUTRAL.MUTED,
  },

  // === TÍTULO DA LISTA ===
  listHeader: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  listHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.NEUTRAL.DARK_TEXT,
  },

  // === LISTA ROLÁVEL DE CARDS ===
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },

  // === CARD DE POSTO DE SAÚDE ===
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  // Badge colorido (SUS = roxo | Particular = verde)
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },

  // Distância no canto superior direito
  distanceText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.PRIMARY,
  },

  // Nome do posto em negrito
  unitName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.NEUTRAL.DARK_TEXT,
    marginBottom: 8,
  },

  // Linhas de informações (endereço, horário, telefone)
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 4,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: Colors.NEUTRAL.MUTED,
    lineHeight: 17,
  },

  // Botão "Rota →" que abre o Google Maps
  routeBtn: {
    alignSelf: 'flex-end',
    marginTop: 8,
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  routeBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  // === ESTADO VAZIO (nenhum resultado na busca) ===
  empty: {
    alignItems: 'center',
    paddingTop: 40,
    gap: 10,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.NEUTRAL.MUTED,
  },
});
