// ============================================================
// LAYOUT: Navegação da área do Profissional de Saúde
// DESCRIÇÃO: Define as abas inferiores (tab bar) exclusivas
//            do profissional e as rotas Stack ocultas (sem tab bar)
//            usadas para navegação interna: busca de paciente,
//            perfil do paciente e registro de vacina.
//
//            Rotas em Tabs (com tab bar):
//              home | patients | register-vaccine | settings
//
//            Rotas em Stack (sem tab bar, dentro do contexto):
//              search-patient | patient-profile
//
// ACESSO: Profissional
// ROTA: /app/(professional)/_layout.tsx
// ============================================================

import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../../constants/Colors';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// -------------------------------------------------------
// Componente interno: Ícone da tab bar
// -------------------------------------------------------
function TabIcon({ name, color, focused }: { name: IoniconsName; color: string; focused: boolean }) {
  return (
    <View style={[tabStyles.iconWrap, focused && tabStyles.iconWrapActive]}>
      <Ionicons name={name} size={22} color={color} />
    </View>
  );
}

const tabStyles = StyleSheet.create({
  iconWrap:       { width: 38, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  iconWrapActive: { backgroundColor: Colors.PROFESSIONAL_LIGHT },
});

// -------------------------------------------------------
// Layout principal da área do Profissional
// -------------------------------------------------------
export default function ProfessionalLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:   Colors.PROFESSIONAL,
        tabBarInactiveTintColor: Colors.NEUTRAL.MUTED,
        tabBarStyle: {
          backgroundColor: Colors.NEUTRAL.WHITE,
          borderTopWidth: 1,
          borderTopColor: Colors.BORDER,
          height: 72,
          paddingBottom: 14,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginBottom: 2,
        },
      }}
    >
      {/* ── ABAS PRINCIPAIS (com tab bar) ─────────────────── */}

      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => <TabIcon name="home" color={color} focused={focused} />,
        }}
      />

      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color, focused }) => <TabIcon name="calendar" color={color} focused={focused} />,
        }}
      />

      <Tabs.Screen
        name="patients"
        options={{
          title: 'Pacientes',
          tabBarIcon: ({ color, focused }) => <TabIcon name="people" color={color} focused={focused} />,
        }}
      />

      <Tabs.Screen
        name="register-vaccine"
        options={{
          title: 'Registrar',
          tabBarIcon: ({ color, focused }) => <TabIcon name="add-circle" color={color} focused={focused} />,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => <TabIcon name="person-circle" color={color} focused={focused} />,
        }}
      />

      {/* ── ROTAS OCULTAS (sem tab bar — fluxo interno) ────── */}

      {/*
       * Tela de busca de paciente.
       * Acessada a partir de:
       *   - Dashboard Rede Pública → "Buscar Paciente"
       *   - Dashboard Rede Privada → "Atender sem agendamento"
       * Parâmetros: ?network=public|private
       */}
      <Tabs.Screen
        name="search-patient"
        options={{
          href: null,  // Remove da tab bar — acessada apenas programaticamente
          title: 'Buscar Paciente',
        }}
      />

      {/*
       * Perfil completo do paciente visto pelo profissional.
       * Acessada a partir de: search-patient, home (últimos atendimentos),
       *   agenda (rede privada).
       * Parâmetros: ?patientId={id}&network=public|private
       */}
      <Tabs.Screen
        name="patient-profile"
        options={{
          href: null,  // Remove da tab bar — acessada apenas programaticamente
          title: 'Perfil do Paciente',
        }}
      />
    </Tabs>
  );
}
