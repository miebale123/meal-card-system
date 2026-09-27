import { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { checkStaffKey } from './api';
import Button from './Button';
import { colors, fontSize } from './theme';

export default function SignInScreen({ onSignIn }) {
  const [staffKey, setStaffKey] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);
  const key = staffKey.trim();

  async function handleSignIn() {
    if (!key || checking) return;
    setChecking(true);
    setError(null);
    try {
      await checkStaffKey(key);
      await onSignIn(key);
    } catch (e) {
      setError(e.message);
      setChecking(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <Text style={styles.title}>Meal card scanner</Text>
      <Text style={styles.body}>
        Enter the staff key from the cafeteria office. You only need to do this once on this phone.
      </Text>
      <TextInput
        style={styles.input}
        value={staffKey}
        onChangeText={setStaffKey}
        placeholder="Staff key"
        placeholderTextColor={colors.muted}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        editable={!checking}
        returnKeyType="go"
        onSubmitEditing={handleSignIn}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button label={checking ? 'Checking…' : 'Sign in'} onPress={handleSignIn} disabled={checking || !key} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 24,
    gap: 16,
    backgroundColor: colors.card,
  },
  title: {
    fontSize: fontSize.display,
    fontWeight: '700',
    color: colors.ink,
  },
  body: {
    fontSize: fontSize.body,
    color: colors.muted,
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
  error: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.refuse,
  },
});
