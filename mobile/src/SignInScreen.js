import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { checkStaffKey } from './api';
import Button from './Button';
import Field from './Field';
import FormScreen, { FormError } from './FormScreen';
import { colors, fontSize } from './theme';

export default function SignInScreen({ service, label, onSignIn }) {
  const [pin, setPin] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);
  const ready = /^\d{4}$/.test(pin);

  async function handleSignIn() {
    if (!ready || checking) return;
    setChecking(true);
    setError(null);
    try {
      await checkStaffKey(service, pin);
      await onSignIn(pin);
    } catch (e) {
      setError(e.message);
      setChecking(false);
    }
  }

  return (
    <FormScreen>
      <Text style={styles.body}>
        Enter the {label} PIN. You only need to do this once on this phone.
      </Text>
      <Field
        label="4-digit PIN"
        value={pin}
        onChangeText={setPin}
        keyboardType="number-pad"
        maxLength={4}
        secureTextEntry
        editable={!checking}
        onSubmitEditing={handleSignIn}
      />
      <FormError message={error} />
      <Button label={checking ? 'Checking…' : 'Sign in'} onPress={handleSignIn} disabled={checking || !ready} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  body: {
    fontSize: fontSize.body,
    color: colors.muted,
  },
});
