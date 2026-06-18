// ============================================================
// LAYOUT: Navegação da área do Profissional de Saúde
// DESCRIÇÃO: Define as abas inferiores (tab bar) exclusivas
//            do profissional. Identidade visual VERDE.
// ACESSO: Profissional
// ROTA: /app/(professional)/_layout.tsx
// ============================================================

// --- Navegação por abas do Expo Router ---
import { Tabs } from 'expo-router';

// --- Ícones vetoriais da biblioteca Ionicons ---
import { Ionicons } from '@expo/vector-icons';

// --- Componentes de layout do React Native ---
import { StyleSheet, View } from 'react-native';

// --- Paleta de cores oficial do VacinApp ---
import { Colors } from '../../constants/Colors';

// Tipo auxiliar para garantir tipagem correta dos nomes de ícones
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// -------------------------------------------------------
// Componente interno: Ícone da tab bar
// Exibe o ícone com fundo verde quando a aba está ativa
// -------------------------------------------------------
function TabIcon({ name, color, focused }: { name: IoniconsName; color: string; focused: boolean }) {
  return (
    // Fundo verde claro quando a aba está selecionada (focused)
    <View style={[tabStyles.iconWrap, focused && tabStyles.iconWrapActive]}>
      <Ionicons name={name} size={22} color={color} />
    </View>
  );
}

// Estilos do ícone da tab bar
const tabStyles = StyleSheet.create({
  iconWrap:       { width: 38, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  iconWrapActive: { backgroundColor: Colors.PROFESSIONAL_LIGHT }, // Verde suave quando ativo
});

// -------------------------------------------------------
// Layout principal da área do Profissional
// Define as 4 abas: Home | Pacientes | Registrar | Perfil
// A cor ativa da tab bar é VERDE (#588C5A) — identidade do profissional
// -------------------------------------------------------
export default function ProfessionalLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,                         // Remove o header padrão (cada tela tem o seu)
        tabBarActiveTintColor: Colors.PROFESSIONAL, // Verde quando ativo
        tabBarInactiveTintColor: Colors.NEUTRAL.MUTED, // Cinza quando inativo
        tabBarStyle: {
          backgroundColor: Colors.NEUTRAL.WHITE,
          borderTopWidth: 1,
          borderTopColor: Colors.BORDER,
          height: 72,          // Altura maior para acomodar ícone + rótulo sem cortes
          paddingBottom: 14,   // Espaço inferior generoso
          paddingTop: 6,       // Espaço superior equilibrado
        },
        tabBarLabelStyle: {
          fontSize: 10,        // Fonte menor para caber sem corte em telas pequenas
          fontWeight: '600',
          marginBottom: 2,     // Afasta o texto da borda inferior da tab bar
        },
      }}
    >
      {/* Aba: Home do profissional */}
      <Tabs.Screen name="home"             options={{ title: 'Home',      tabBarIcon: ({ color, focused }) => <TabIcon name="home"          color={color} focused={focused} /> }} />

      {/* Aba: Lista de pacientes */}
      <Tabs.Screen name="patients"         options={{ title: 'Pacientes', tabBarIcon: ({ color, focused }) => <TabIcon name="people"        color={color} focused={focused} /> }} />

      {/* Aba: Registrar nova vacinação */}
      <Tabs.Screen name="register-vaccine" options={{ title: 'Registrar', tabBarIcon: ({ color, focused }) => <TabIcon name="add-circle"    color={color} focused={focused} /> }} />

      {/* Aba: Perfil do profissional (identidade verde) */}
      <Tabs.Screen name="settings"         options={{ title: 'Perfil',    tabBarIcon: ({ color, focused }) => <TabIcon name="person-circle" color={color} focused={focused} /> }} />
    </Tabs>
  );
}
