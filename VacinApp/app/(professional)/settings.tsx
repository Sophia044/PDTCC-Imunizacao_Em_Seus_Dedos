// ============================================================
// TELA: Configurações do Profissional de Saúde
// DESCRIÇÃO: Permite ao profissional gerenciar dados da conta,
//            notificações, acessar suporte e realizar logout.
//            Identidade visual VERDE — exclusiva da área profissional.
// ACESSO: Profissional
// ROTA: /app/(professional)/settings.tsx
// ============================================================

// --- Bibliotecas principais do React ---
import React, { useState } from 'react';

// --- Componentes de layout e interação do React Native ---
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// --- Animações com Reanimated ---
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

// --- Área segura (evita sobreposição com status bar e notch) ---
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Controle da barra de status do sistema operacional ---
import { StatusBar } from 'expo-status-bar';

// --- Ícones vetoriais da biblioteca Ionicons ---
import { Ionicons } from '@expo/vector-icons';

// --- Navegação com Expo Router ---
import { router } from 'expo-router';

// --- Paleta de cores oficial do VacinApp ---
import { Colors } from '../../constants/Colors';

// -------------------------------------------------------
// Tipo para os ícones do Ionicons (garante tipagem correta)
// -------------------------------------------------------
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// -------------------------------------------------------
// Interface para os itens de menu da seção de configurações
// -------------------------------------------------------
interface SettingItemProps {
  icon: IoniconsName;   // Ícone à esquerda do item
  label: string;        // Texto principal do item
  onPress?: () => void; // Ação ao pressionar (opcional — ex: item informativo)
  showArrow?: boolean;  // Mostra ou oculta a seta "›" à direita
  rightText?: string;   // Texto opcional à direita (ex: versão do app)
}

// -------------------------------------------------------
// Componente interno: Item de configuração clicável
// Exibe um ícone, label e opcionalmente uma seta ou texto
// -------------------------------------------------------
function SettingItem({ icon, label, onPress, showArrow = true, rightText }: SettingItemProps) {
  return (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      {/* Círculo com o ícone à esquerda */}
      <View style={styles.settingIconCircle}>
        <Ionicons name={icon} size={18} color={Colors.PROFESSIONAL} />
      </View>

      {/* Texto do item */}
      <Text style={styles.settingLabel}>{label}</Text>

      {/* Lado direito: seta de navegação ou texto informativo */}
      {rightText ? (
        <Text style={styles.settingRightText}>{rightText}</Text>
      ) : showArrow ? (
        <Ionicons name="chevron-forward" size={18} color={Colors.NEUTRAL.MUTED} />
      ) : null}
    </TouchableOpacity>
  );
}

// -------------------------------------------------------
// COMPONENTE PRINCIPAL da tela de Configurações
// -------------------------------------------------------
export default function ProfessionalSettingsScreen() {
  // -------------------------------------------------------
  // ESTADOS DOS TOGGLES DE NOTIFICAÇÃO
  // -------------------------------------------------------
  const [alertPatients, setAlertPatients] = useState(true);   // Alertas de pacientes pendentes
  const [calendarReminders, setCalendarReminders] = useState(true); // Lembretes de calendário
  const [newsUpdates, setNewsUpdates] = useState(false);      // Notícias e atualizações

  // Exibe confirmação antes de deslogar e redireciona para o login
  const handleLogout = () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => router.replace('/(auth)/login'),
        },
      ]
    );
  };

  return (
    // Container principal com área segura
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Barra de status com ícones claros (fundo verde escuro) */}
      <StatusBar style="light" />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ---- HEADER VERDE COM GRADIENTE ---- */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <Text style={styles.headerTitle}>Configurações</Text>
          <Text style={styles.headerSubtitle}>Gerencie sua conta profissional</Text>
        </Animated.View>

        {/* ---- CARD DE PERFIL DO PROFISSIONAL ---- */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.profileCard}>
          {/* Avatar circular com inicial do nome */}
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={36} color={Colors.PROFESSIONAL} />
          </View>

          {/* Dados do profissional */}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Dr(a). Marcos Silva</Text>
            <Text style={styles.profileSpec}>Médico/a Clínico Geral</Text>
            {/* Badge de verificação */}
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#fff" />
              <Text style={styles.verifiedText}>Profissional Verificado</Text>
            </View>
          </View>
        </Animated.View>

        {/* ---- SEÇÃO: CONTA ---- */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>CONTA</Text>
          <View style={styles.sectionCard}>
            <SettingItem
              icon="person-outline"
              label="Meus Dados"
              onPress={() => {}}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="lock-closed-outline"
              label="Alterar Senha"
              onPress={() => {}}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="business-outline"
              label="Unidade de Saúde"
              onPress={() => {}}
            />
          </View>
        </Animated.View>

        {/* ---- SEÇÃO: NOTIFICAÇÕES ---- */}
        <Animated.View entering={FadeInDown.delay(220).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>NOTIFICAÇÕES</Text>
          <View style={styles.sectionCard}>

            {/* Toggle: Alertas de pacientes pendentes */}
            <View style={styles.toggleItem}>
              <View style={styles.toggleIconCircle}>
                <Ionicons name="people-outline" size={18} color={Colors.PROFESSIONAL} />
              </View>
              <Text style={styles.toggleLabel}>Alertas de pacientes pendentes</Text>
              <Switch
                value={alertPatients}
                onValueChange={setAlertPatients}
                trackColor={{ false: Colors.BORDER, true: Colors.PROFESSIONAL }}
                thumbColor="#fff"
              />
            </View>
            <View style={styles.divider} />

            {/* Toggle: Lembretes de calendário */}
            <View style={styles.toggleItem}>
              <View style={styles.toggleIconCircle}>
                <Ionicons name="calendar-outline" size={18} color={Colors.PROFESSIONAL} />
              </View>
              <Text style={styles.toggleLabel}>Lembretes de calendário</Text>
              <Switch
                value={calendarReminders}
                onValueChange={setCalendarReminders}
                trackColor={{ false: Colors.BORDER, true: Colors.PROFESSIONAL }}
                thumbColor="#fff"
              />
            </View>
            <View style={styles.divider} />

            {/* Toggle: Notícias e atualizações */}
            <View style={styles.toggleItem}>
              <View style={styles.toggleIconCircle}>
                <Ionicons name="newspaper-outline" size={18} color={Colors.PROFESSIONAL} />
              </View>
              <Text style={styles.toggleLabel}>Notícias e atualizações</Text>
              <Switch
                value={newsUpdates}
                onValueChange={setNewsUpdates}
                trackColor={{ false: Colors.BORDER, true: Colors.PROFESSIONAL }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </Animated.View>

        {/* ---- SEÇÃO: SUPORTE ---- */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>SUPORTE</Text>
          <View style={styles.sectionCard}>
            <SettingItem
              icon="help-circle-outline"
              label="Ajuda e Suporte"
              onPress={() => {}}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="bug-outline"
              label="Reportar Problema"
              onPress={() => {}}
            />
            <View style={styles.divider} />
            {/* Item informativo — sem seta, exibe a versão do app */}
            <SettingItem
              icon="information-circle-outline"
              label="Versão do App"
              showArrow={false}
              rightText="1.0.0"
            />
          </View>
        </Animated.View>

        {/* ---- BOTÃO DE LOGOUT ---- */}
        {/* Vermelho com borda — ação destrutiva que exige confirmação */}
        <Animated.View entering={FadeInDown.delay(380).duration(400)}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#D9534F" />
            <Text style={styles.logoutText}>Sair da Conta</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Espaço extra no final para não ficar colado na tab bar */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// -------------------------------------------------------
// ESTILOS DA TELA
// Identidade visual VERDE — cor do profissional de saúde
// -------------------------------------------------------
const styles = StyleSheet.create({
  // === CONTAINER PRINCIPAL ===
  safe: {
    flex: 1,
    backgroundColor: '#F0F7F0', // Fundo verde muito suave
  },

  // === CABEÇALHO VERDE ===
  header: {
    backgroundColor: Colors.PROFESSIONAL,  // Verde principal #588C5A
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },

  // === CARD DE PERFIL DO PROFISSIONAL ===
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -20,       // Sobrepõe levemente o header para efeito flutuante
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  profileAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.PROFESSIONAL_LIGHT, // Fundo verde claro
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.NEUTRAL.DARK_TEXT,
  },
  profileSpec: {
    fontSize: 13,
    color: Colors.NEUTRAL.MUTED,
    marginTop: 3,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: Colors.PROFESSIONAL,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 8,
  },
  verifiedText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
  },

  // === SEÇÃO DE CONFIGURAÇÕES ===
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.NEUTRAL.MUTED,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
    paddingLeft: 4,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  // === ITEM DE CONFIGURAÇÃO ===
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  settingIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.PROFESSIONAL_LIGHT, // Verde suave
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    flex: 1,
    fontSize: 15,
    color: Colors.NEUTRAL.DARK_TEXT,
  },
  settingRightText: {
    fontSize: 14,
    color: Colors.NEUTRAL.MUTED,
  },

  // === ITEM COM TOGGLE (Switch) ===
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  toggleIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.PROFESSIONAL_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleLabel: {
    flex: 1,
    fontSize: 15,
    color: Colors.NEUTRAL.DARK_TEXT,
  },

  // === DIVISÓRIA ENTRE ITENS ===
  divider: {
    height: 1,
    backgroundColor: Colors.BORDER,
    marginLeft: 64, // Alinha após o ícone
  },

  // === BOTÃO DE LOGOUT ===
  // Vermelho — ação destrutiva que exige confirmação
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 32,
    marginBottom: 40,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#D9534F',      // Vermelho — cor de ação destrutiva
    backgroundColor: '#FFF5F5',  // Fundo vermelho muito suave
    gap: 8,
  },
  logoutText: {
    color: '#D9534F',
    fontSize: 16,
    fontWeight: '600',
  },
});
