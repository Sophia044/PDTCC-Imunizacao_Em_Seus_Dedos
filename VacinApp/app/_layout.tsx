// ============================================================
// LAYOUT: Layout Raiz do Aplicativo
// DESCRIÇÃO: Define a estrutura de navegação principal do app.
//            Configura o Stack Navigator com as rotas de nível raiz:
//            splash (index), autenticação (auth) e áreas do paciente
//            e do profissional.
// ACESSO: Ambos (ponto de entrada da navegação)
// ROTA: /app/_layout.tsx
// ============================================================

// --- Navegação em pilha do Expo Router ---
import { Stack } from 'expo-router';

// --- Necessário para o funcionamento de gestos (drag, swipe, etc.) ---
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// -------------------------------------------------------
// COMPONENTE PRINCIPAL: Layout Raiz
// Envolve toda a aplicação no GestureHandlerRootView,
// necessário para bibliotecas como Reanimated e gestos nativos.
// -------------------------------------------------------
export default function RootLayout() {
  return (
    // GestureHandlerRootView deve envolver TODA a aplicação
    // para que os gestos (deslizar, arrastar) funcionem corretamente
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Stack Navigator: gerencia a pilha de telas e navegação entre elas */}
      <Stack screenOptions={{
        headerShown: false, // Remove o cabeçalho padrão em todas as telas (cada tela tem o seu)
        animation: 'fade',  // Transição suave com fade entre as telas
      }}>
        {/* Tela inicial (Splash Screen) */}
        <Stack.Screen name="index" />
        {/* Grupo de telas de autenticação: login e cadastros */}
        <Stack.Screen name="(auth)" />
        {/* Grupo de telas do paciente: home, calendário, mapa, perfil */}
        <Stack.Screen name="(patient)" />
        {/* Grupo de telas do profissional: home, pacientes, registrar, configurações */}
        <Stack.Screen name="(professional)" />
      </Stack>
    </GestureHandlerRootView>
  );
}
