import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors, fontSize } from './theme';

export default function Field({ label, multiline = false, ...inputProps }: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        multiline={multiline}
        style={[styles.input, multiline ? styles.multiline : null]}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  label: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.ink,
  },
  input: {
    minHeight: 52,
    paddingHorizontal: 16,
    fontSize: fontSize.body,
    color: colors.ink,
    borderWidth: 1.5,
    borderColor: colors.muted,
    borderRadius: 14,
    borderCurve: 'continuous',
  },
  multiline: {
    minHeight: 112,
    paddingVertical: 14,
    textAlignVertical: 'top',
  },
});
