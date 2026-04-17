import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../../constants/Colors';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, color, focused }: { name: IoniconsName; color: string; focused: boolean }) {
  return (
    <View style={[tabStyles.iconWrap, focused && tabStyles.iconWrapActive]}>
      <Ionicons name={name} size={22} color={color} />
    </View>
  );
}

const tabStyles = StyleSheet.create({
  iconWrap:       { width: 40, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  iconWrapActive: { backgroundColor: Colors.PROFESSIONAL_LIGHT },
});

export default function ProfessionalLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.PROFESSIONAL,
        tabBarInactiveTintColor: Colors.NEUTRAL.MUTED,
        tabBarStyle: {
          backgroundColor: Colors.NEUTRAL.WHITE,
          borderTopWidth: 1,
          borderTopColor: Colors.BORDER,
          height: 64,
          paddingBottom: 10,
          paddingTop: 4,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="home"             options={{ title: 'Início',    tabBarIcon: ({ color, focused }) => <TabIcon name="home"       color={color} focused={focused} /> }} />
      <Tabs.Screen name="patients"         options={{ title: 'Pacientes', tabBarIcon: ({ color, focused }) => <TabIcon name="people"     color={color} focused={focused} /> }} />
      <Tabs.Screen name="register-vaccine" options={{ title: 'Registrar', tabBarIcon: ({ color, focused }) => <TabIcon name="add-circle" color={color} focused={focused} /> }} />
    </Tabs>
  );
}
