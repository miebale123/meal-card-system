import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fontSize } from './theme';

export default function Button({ label, onPress, disabled = false, color = colors.ink, labelColor = colors.card }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: color, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
      ]}
    >
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
    </Pressable>
  );
}

export function TextButton({ label, onPress }) {
  return (
    <Pressable accessibilityRole="button" hitSlop={12} onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
      <Text style={[styles.label, styles.textLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: fontSize.body,
    fontWeight: '600',
  },
  textLabel: {
    color: colors.ink,
    textAlign: 'center',
  },
});
