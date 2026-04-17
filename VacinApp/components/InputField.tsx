import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  icon?: IoniconsName;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words';
}

export function InputField({
  label, value, onChangeText, icon, placeholder,
  secureTextEntry = false, keyboardType = 'default', autoCapitalize = 'sentences',
}: InputFieldProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secureTextEntry);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.container, focused && styles.containerFocused]}>
        {icon && <Ionicons name={icon} size={20} color={focused ? Colors.PRIMARY : Colors.NEUTRAL.MUTED} style={styles.icon} />}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder ?? label}
          placeholderTextColor={Colors.NEUTRAL.MUTED}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setHidden(h => !h)} hitSlop={8}>
            <Ionicons name={hidden ? 'eye-off' : 'eye'} size={20} color={Colors.NEUTRAL.MUTED} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper:          { marginBottom: 14 },
  label:            { fontSize: 13, fontWeight: '600', color: Colors.NEUTRAL.DARK_TEXT, marginBottom: 6 },
  container:        { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.CARD_BG, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.BORDER, paddingHorizontal: 14, height: 52 },
  containerFocused: { borderColor: Colors.PRIMARY },
  icon:             { marginRight: 10 },
  input:            { flex: 1, fontSize: 15, color: Colors.NEUTRAL.DARK_TEXT },
});
