import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { mockVaccines } from '../../constants/MockData';

const complete = mockVaccines.filter(v => v.status === 'complete').length;
const pending  = mockVaccines.filter(v => v.status === 'pending').length;
const overdue  = mockVaccines.filter(v => v.status === 'overdue').length;

const INFO_ITEMS = [
  { icon: 'person-outline',   label: 'Nome',       value: 'Ana Clara Souza' },
  { icon: 'calendar-outline', label: 'Nascimento',  value: '12/03/1996' },
  { icon: 'card-outline',     label: 'CPF',         value: '123.456.789-00' },
  { icon: 'mail-outline',     label: 'E-mail',      value: 'ana.clara@email.com' },
];

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header roxo com avatar */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={44} color={Colors.PRIMARY} />
          </View>
          <Text style={styles.name}>Ana Clara Souza</Text>
          <Text style={styles.email}>ana.clara@email.com</Text>
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.NEUTRAL.WHITE} />
            <Text style={styles.verifiedText}>Conta Verificada</Text>
          </View>
        </Animated.View>

        {/* Estatísticas */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.statsRow}>
          {[
            { num: complete, label: 'Tomadas',  color: Colors.STATUS.COMPLETE },
            { num: pending,  label: 'Pendentes', color: Colors.STATUS.PENDING },
            { num: overdue,  label: 'Atrasadas', color: Colors.STATUS.OVERDUE },
          ].map(s => (
            <View key={s.label} style={styles.statItem}>
              <Text style={[styles.statNum, { color: s.color }]}>{s.num}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Dados pessoais */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Dados Pessoais</Text>
          <View style={styles.card}>
            {INFO_ITEMS.map((item, i) => (
              <View key={item.label} style={[styles.infoRow, i < INFO_ITEMS.length - 1 && styles.infoRowBorder]}>
                <Ionicons name={item.icon as any} size={18} color={Colors.SECONDARY} />
                <View style={styles.infoTexts}>
                  <Text style={styles.infoLabel}>{item.label}</Text>
                  <Text style={styles.infoValue}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Ações */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Configurações</Text>
          <View style={styles.card}>
            {[
              { icon: 'notifications-outline', label: 'Notificações' },
              { icon: 'shield-outline',         label: 'Privacidade' },
              { icon: 'help-circle-outline',    label: 'Ajuda e Suporte' },
            ].map((item, i) => (
              <TouchableOpacity key={item.label} style={[styles.actionRow, i < 2 && styles.actionBorder]}>
                <Ionicons name={item.icon as any} size={20} color={Colors.NEUTRAL.MUTED} />
                <Text style={styles.actionText}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.NEUTRAL.MUTED} />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Sair */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.section}>
          <TouchableOpacity style={styles.logoutBtn} onPress={() => router.replace('/(auth)/login')}>
            <Ionicons name="log-out-outline" size={20} color={Colors.STATUS.OVERDUE} />
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: Colors.BACKGROUND },
  header:         { backgroundColor: Colors.PRIMARY, alignItems: 'center', paddingVertical: 32, paddingHorizontal: 20 },
  avatar:         { width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.NEUTRAL.WHITE, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  name:           { fontSize: 22, fontWeight: '800', color: Colors.NEUTRAL.WHITE },
  email:          { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  verifiedBadge:  { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 10 },
  verifiedText:   { fontSize: 12, color: Colors.NEUTRAL.WHITE, fontWeight: '600' },
  statsRow:       { flexDirection: 'row', backgroundColor: Colors.NEUTRAL.WHITE, marginHorizontal: 16, marginTop: -20, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  statItem:       { flex: 1, alignItems: 'center' },
  statNum:        { fontSize: 26, fontWeight: '800' },
  statLabel:      { fontSize: 11, color: Colors.NEUTRAL.MUTED, marginTop: 2 },
  section:        { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle:   { fontSize: 13, fontWeight: '700', color: Colors.NEUTRAL.MUTED, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  card:           { backgroundColor: Colors.NEUTRAL.WHITE, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  infoRow:        { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  infoRowBorder:  { borderBottomWidth: 1, borderBottomColor: Colors.BORDER },
  infoTexts:      {},
  infoLabel:      { fontSize: 11, color: Colors.NEUTRAL.MUTED, fontWeight: '500' },
  infoValue:      { fontSize: 14, color: Colors.NEUTRAL.DARK_TEXT, fontWeight: '600', marginTop: 1 },
  actionRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  actionBorder:   { borderBottomWidth: 1, borderBottomColor: Colors.BORDER },
  actionText:     { flex: 1, fontSize: 15, color: Colors.NEUTRAL.DARK_TEXT },
  logoutBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.NEUTRAL.WHITE, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.STATUS.OVERDUE },
  logoutText:     { fontSize: 15, fontWeight: '700', color: Colors.STATUS.OVERDUE },
});
